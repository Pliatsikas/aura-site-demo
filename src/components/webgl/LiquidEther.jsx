'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LiquidEther.css';

export default function LiquidEther({
  mouseForce = 20,
  cursorSize = 100,
  isViscous = false,
  viscous = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  dt = 0.014,
  BFECC = true,
  resolution = 0.5,
  isBounce = false,
  colors = ['#02020a', '#0e0520', '#c9a84c'], // Προεπιλογή Aura
  style = {},
  className = '',
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  takeoverDuration = 0.25,
  autoResumeDelay = 1000,
  autoRampDuration = 0.6
}) {
  const mountRef = useRef(null);
  const webglRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const rafRef = useRef(null);
  const intersectionObserverRef = useRef(null);
  const isVisibleRef = useRef(true);
  const resizeRafRef = useRef(null);

  // --- ΠΡΟΣΘΗΚΗ: Refs για ομαλό color LERPing ---
  const targetColorsRef = useRef(colors.map(c => new THREE.Color(c)));
  const currentColorsRef = useRef(colors.map(c => new THREE.Color(c)));

  useEffect(() => {
    targetColorsRef.current = colors.map(c => new THREE.Color(c));
  }, [colors]);
  // ----------------------------------------------

  useEffect(() => {
    if (!mountRef.current) return;

    function makePaletteTexture() {
      const w = currentColorsRef.current.length;
      const data = new Uint8Array(w * 4);
      currentColorsRef.current.forEach((c, i) => {
        data[i * 4 + 0] = Math.round(c.r * 255);
        data[i * 4 + 1] = Math.round(c.g * 255);
        data[i * 4 + 2] = Math.round(c.b * 255);
        data[i * 4 + 3] = 255;
      });
      const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      return tex;
    }

    const paletteTex = makePaletteTexture();
    const bgVec4 = new THREE.Vector4(0, 0, 0, 0);

    class CommonClass {
      constructor() {
        this.width = 0;
        this.height = 0;
        this.aspect = 1;
        this.pixelRatio = 1;
        this.container = null;
        this.renderer = null;
        this.clock = null;
        this.time = 0;
        this.delta = 0;
      }
      init(container) {
        this.container = container;
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.resize();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.autoClear = false;
        this.renderer.setClearColor(new THREE.Color(0x000000), 0);
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.display = 'block';
        this.clock = new THREE.Clock();
        this.clock.start();
      }
      resize() {
        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        this.width = Math.max(1, Math.floor(rect.width));
        this.height = Math.max(1, Math.floor(rect.height));
        this.aspect = this.width / this.height;
        if (this.renderer) this.renderer.setSize(this.width, this.height, false);
      }
      update() {
        this.delta = this.clock.getDelta();
        this.time += this.delta;
      }
    }
    const Common = new CommonClass();

    class MouseClass {
      constructor() {
        this.coords = new THREE.Vector2();
        this.coords_old = new THREE.Vector2();
        this.diff = new THREE.Vector2();
        this.timer = null;
        this.isHoverInside = false;
        this.hasUserControl = false;
        this.isAutoActive = false;
        this.takeoverActive = false;
        this.takeoverFrom = new THREE.Vector2();
        this.takeoverTo = new THREE.Vector2();
        this._onMouseMove = this.onDocumentMouseMove.bind(this);
      }
      init(container) {
        this.container = container;
        window.addEventListener('mousemove', this._onMouseMove);
      }
      dispose() {
        window.removeEventListener('mousemove', this._onMouseMove);
      }
      setCoords(x, y) {
        if (!this.container) return;
        if (this.timer) window.clearTimeout(this.timer);
        const rect = this.container.getBoundingClientRect();
        const nx = (x - rect.left) / rect.width;
        const ny = (y - rect.top) / rect.height;
        this.coords.set(nx * 2 - 1, -(ny * 2 - 1));
        this.timer = window.setTimeout(() => {}, 100);
      }
      onDocumentMouseMove(event) {
        this.isHoverInside = true;
        this.setCoords(event.clientX, event.clientY);
        this.hasUserControl = true;
      }
      update() {
        this.diff.subVectors(this.coords, this.coords_old);
        this.coords_old.copy(this.coords);
      }
    }
    const Mouse = new MouseClass();

    class AutoDriver {
      constructor(mouse, manager, opts) {
        this.enabled = opts.enabled;
        this.update = () => {}; // Απλοποιημένο για το δικό μας Hero
      }
    }

    // --- Shaders (ακριβώς όπως στο δικό σου) ---
    const face_vert = `attribute vec3 position; uniform vec2 boundarySpace; varying vec2 uv; void main(){ vec3 pos = position; vec2 scale = 1.0 - boundarySpace * 2.0; pos.xy = pos.xy * scale; uv = vec2(0.5)+(pos.xy)*0.5; gl_Position = vec4(pos, 1.0); }`;
    const mouse_vert = `attribute vec3 position; attribute vec2 uv; uniform vec2 center; uniform vec2 scale; uniform vec2 px; varying vec2 vUv; void main(){ vec2 pos = position.xy * scale * 2.0 * px + center; vUv = uv; gl_Position = vec4(pos, 0.0, 1.0); }`;
    const color_frag = `precision highp float; uniform sampler2D velocity; uniform sampler2D palette; uniform vec4 bgColor; varying vec2 uv; void main(){ vec2 vel = texture2D(velocity, uv).xy; float lenv = clamp(length(vel), 0.0, 1.0); vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb; vec3 outRGB = mix(bgColor.rgb, c, lenv); float outA = mix(bgColor.a, 1.0, lenv); gl_FragColor = vec4(outRGB, outA); }`;
    const externalForce_frag = `precision highp float; uniform vec2 force; varying vec2 vUv; void main(){ vec2 circle = (vUv - 0.5) * 2.0; float d = 1.0 - min(length(circle), 1.0); d *= d; gl_FragColor = vec4(force * d, 0.0, 1.0); }`;
    const advection_frag = `precision highp float; uniform sampler2D velocity; uniform float dt; uniform vec2 fboSize; varying vec2 uv; void main(){ vec2 ratio = max(fboSize.x, fboSize.y) / fboSize; vec2 vel = texture2D(velocity, uv).xy; vec2 uv2 = uv - vel * dt * ratio; vec2 newVel = texture2D(velocity, uv2).xy; gl_FragColor = vec4(newVel, 0.0, 0.0); }`;
    const divergence_frag = `precision highp float; uniform sampler2D velocity; uniform float dt; uniform vec2 px; varying vec2 uv; void main(){ float x0 = texture2D(velocity, uv-vec2(px.x, 0.0)).x; float x1 = texture2D(velocity, uv+vec2(px.x, 0.0)).x; float y0 = texture2D(velocity, uv-vec2(0.0, px.y)).y; float y1 = texture2D(velocity, uv+vec2(0.0, px.y)).y; float divergence = (x1 - x0 + y1 - y0) / 2.0; gl_FragColor = vec4(divergence / dt); }`;
    const poisson_frag = `precision highp float; uniform sampler2D pressure; uniform sampler2D divergence; uniform vec2 px; varying vec2 uv; void main(){ float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r; float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r; float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r; float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r; float div = texture2D(divergence, uv).r; float newP = (p0 + p1 + p2 + p3) / 4.0 - div; gl_FragColor = vec4(newP); }`;
    const pressure_frag = `precision highp float; uniform sampler2D pressure; uniform sampler2D velocity; uniform vec2 px; uniform float dt; varying vec2 uv; void main(){ float step = 1.0; float p0 = texture2D(pressure, uv + vec2(px.x * step, 0.0)).r; float p1 = texture2D(pressure, uv - vec2(px.x * step, 0.0)).r; float p2 = texture2D(pressure, uv + vec2(0.0, px.y * step)).r; float p3 = texture2D(pressure, uv - vec2(0.0, px.y * step)).r; vec2 v = texture2D(velocity, uv).xy; vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5; v = v - gradP * dt; gl_FragColor = vec4(v, 0.0, 1.0); }`;

    class ShaderPass {
      constructor(props) {
        this.props = props;
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        if (props.material) {
          this.material = new THREE.RawShaderMaterial(props.material);
          this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
          this.scene.add(this.mesh);
        }
      }
      update() {
        Common.renderer.setRenderTarget(this.props.output || null);
        Common.renderer.render(this.scene, this.camera);
        Common.renderer.setRenderTarget(null);
      }
    }

    class Simulation {
      constructor(opts) {
        this.options = opts;
        this.fbos = { vel_0: null, vel_1: null, div: null, pressure_0: null, pressure_1: null };
        this.fboSize = new THREE.Vector2();
        this.cellScale = new THREE.Vector2();
        this.calcSize();
        
        const optsRT = { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
        for (let key in this.fbos) this.fbos[key] = new THREE.WebGLRenderTarget(this.fboSize.x, this.fboSize.y, optsRT);
        
        this.advection = new ShaderPass({ material: { vertexShader: face_vert, fragmentShader: advection_frag, uniforms: { boundarySpace: { value: new THREE.Vector2() }, fboSize: { value: this.fboSize }, velocity: { value: this.fbos.vel_0.texture }, dt: { value: opts.dt } } }, output: this.fbos.vel_1 });
        this.externalForce = new ShaderPass({ material: { vertexShader: mouse_vert, fragmentShader: externalForce_frag, blending: THREE.AdditiveBlending, depthWrite: false, uniforms: { px: { value: this.cellScale }, force: { value: new THREE.Vector2() }, center: { value: new THREE.Vector2() }, scale: { value: new THREE.Vector2(opts.cursor_size, opts.cursor_size) } } }, output: this.fbos.vel_1 });
        this.divergence = new ShaderPass({ material: { vertexShader: face_vert, fragmentShader: divergence_frag, uniforms: { boundarySpace: { value: new THREE.Vector2() }, velocity: { value: this.fbos.vel_1.texture }, px: { value: this.cellScale }, dt: { value: opts.dt } } }, output: this.fbos.div });
        this.poisson = new ShaderPass({ material: { vertexShader: face_vert, fragmentShader: poisson_frag, uniforms: { boundarySpace: { value: new THREE.Vector2() }, pressure: { value: this.fbos.pressure_0.texture }, divergence: { value: this.fbos.div.texture }, px: { value: this.cellScale } } }, output: this.fbos.pressure_1, output0: this.fbos.pressure_0, output1: this.fbos.pressure_1 });
        this.pressure = new ShaderPass({ material: { vertexShader: face_vert, fragmentShader: pressure_frag, uniforms: { boundarySpace: { value: new THREE.Vector2() }, pressure: { value: this.fbos.pressure_0.texture }, velocity: { value: this.fbos.vel_1.texture }, px: { value: this.cellScale }, dt: { value: opts.dt } } }, output: this.fbos.vel_0 });
      }
      calcSize() {
        this.fboSize.set(Math.max(1, Math.round(resolution * Common.width)), Math.max(1, Math.round(resolution * Common.height)));
        this.cellScale.set(1.0 / this.fboSize.x, 1.0 / this.fboSize.y);
      }
      resize() {
        this.calcSize();
        for (let key in this.fbos) this.fbos[key].setSize(this.fboSize.x, this.fboSize.y);
      }
      update() {
        this.advection.material.uniforms.velocity.value = this.fbos.vel_0.texture;
        this.advection.update();

        const forceX = (Mouse.diff.x / 2) * this.options.mouse_force;
        const forceY = (Mouse.diff.y / 2) * this.options.mouse_force;
        this.externalForce.material.uniforms.force.value.set(forceX, forceY);
        this.externalForce.material.uniforms.center.value.set(Mouse.coords.x, Mouse.coords.y);
        this.externalForce.update();

        this.divergence.material.uniforms.velocity.value = this.fbos.vel_1.texture;
        this.divergence.update();

        let p_out;
        for (let i = 0; i < this.options.iterations_poisson; i++) {
          this.poisson.material.uniforms.pressure.value = (i % 2 === 0) ? this.poisson.props.output0.texture : this.poisson.props.output1.texture;
          this.poisson.props.output = (i % 2 === 0) ? this.poisson.props.output1 : this.poisson.props.output0;
          this.poisson.update();
          p_out = this.poisson.props.output;
        }

        this.pressure.material.uniforms.velocity.value = this.fbos.vel_1.texture;
        this.pressure.material.uniforms.pressure.value = p_out.texture;
        this.pressure.update();
      }
    }

    class Output {
      constructor(sim) {
        this.simulation = sim;
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.RawShaderMaterial({ vertexShader: face_vert, fragmentShader: color_frag, transparent: true, uniforms: { velocity: { value: this.simulation.fbos.vel_0.texture }, palette: { value: paletteTex }, bgColor: { value: bgVec4 }, boundarySpace: { value: new THREE.Vector2() } } }));
        this.scene.add(this.mesh);
      }
      update() {
        this.simulation.update();
        Common.renderer.setRenderTarget(null);
        Common.renderer.render(this.scene, this.camera);
      }
    }

    class WebGLManager {
      constructor(props) {
        Common.init(props.$wrapper);
        Mouse.init(props.$wrapper);
        this.sim = new Simulation({ mouse_force: mouseForce, cursor_size: cursorSize, dt, iterations_poisson: iterationsPoisson });
        this.output = new Output(this.sim);
        props.$wrapper.prepend(Common.renderer.domElement);
        this._loop = this.loop.bind(this);
      }
      resize() { Common.resize(); this.sim.resize(); }
      loop() {
        // --- ΠΡΟΣΘΗΚΗ: Το μαγικό color LERP ---
        let needsColorUpdate = false;
        currentColorsRef.current.forEach((color, i) => {
          const target = targetColorsRef.current[i];
          if (target) {
            color.lerp(target, 0.05); // Smooth transition speed
            if (Math.abs(color.r - target.r) > 0.005) needsColorUpdate = true;
          }
        });
        if (needsColorUpdate) {
          const data = paletteTex.image.data;
          currentColorsRef.current.forEach((c, i) => {
            data[i * 4 + 0] = Math.round(c.r * 255);
            data[i * 4 + 1] = Math.round(c.g * 255);
            data[i * 4 + 2] = Math.round(c.b * 255);
          });
          paletteTex.needsUpdate = true;
        }
        // ---------------------------------------

        Mouse.update();
        Common.update();
        this.output.update();
        rafRef.current = requestAnimationFrame(this._loop);
      }
      start() { this._loop(); }
      dispose() {
        Mouse.dispose();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (Common.renderer) Common.renderer.dispose();
      }
    }

    const container = mountRef.current;
    webglRef.current = new WebGLManager({ $wrapper: container });
    webglRef.current.start();

    const ro = new ResizeObserver(() => webglRef.current.resize());
    ro.observe(container);

    return () => {
      ro.disconnect();
      webglRef.current.dispose();
    };
  // ΠΡΟΣΟΧΗ: Το 'colors' έχει αφαιρεθεί από εδώ για να μην κάνει unmount!
  }, [cursorSize, dt, iterationsPoisson, mouseForce, resolution]); 

  return <div ref={mountRef} className={`liquid-ether-container ${className}`} style={style} />;
}