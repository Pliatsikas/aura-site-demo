'use client';

/**
 * ArchitecturalViewer
 * ────────────────────
 * Full Three.js 3D viewer of a procedural modernist villa.
 * Rotate from any angle with OrbitControls. Auto-rotates when idle.
 *
 * Props:
 *   className      — extra CSS classes for the wrapper
 *   autoRotate     — initial auto-rotate state (default: true)
 *
 * Place at: src/components/webgl/ArchitecturalViewer.jsx
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ArchitecturalViewer({ className = '', autoRotate: initRotate = true }) {
  const mountRef    = useRef(null);
  const controlsRef = useRef(null);
  const matsRef     = useRef([]);

  const [wireframe,   setWireframe]   = useState(false);
  const [autoRotate,  setAutoRotate]  = useState(initRotate);
  const [hint,        setHint]        = useState(true); // "drag to rotate" hint

  // ── Scene setup (runs once) ────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth  || 900;
    const H = container.clientHeight || 600;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace  = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#02020a');
    scene.fog = new THREE.FogExp2('#02020a', 0.022);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 500);
    camera.position.set(18, 10, 18);

    // ── Controls ──
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.055;
    controls.autoRotate      = initRotate;
    controls.autoRotateSpeed = 0.4;
    controls.maxPolarAngle   = Math.PI / 2.08;
    controls.minDistance     = 10;
    controls.maxDistance     = 50;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // ── Materials ──
    const stucco    = new THREE.MeshStandardMaterial({ color: '#ede9e0', roughness: 0.92, metalness: 0.01 });
    const roofMat   = new THREE.MeshStandardMaterial({ color: '#181614', roughness: 0.88, metalness: 0.05 });
    const darkRoof  = new THREE.MeshStandardMaterial({ color: '#1c1a18', roughness: 0.88, metalness: 0.05 });
    const glass     = new THREE.MeshStandardMaterial({ color: '#90c0d8', roughness: 0.03, metalness: 0.25, transparent: true, opacity: 0.28, side: THREE.DoubleSide });
    const travert   = new THREE.MeshStandardMaterial({ color: '#ccc0a0', roughness: 0.88, metalness: 0.0 });
    const water     = new THREE.MeshStandardMaterial({ color: '#0c2e4a', roughness: 0.0,  metalness: 0.5, transparent: true, opacity: 0.9 });
    const steel     = new THREE.MeshStandardMaterial({ color: '#585858', roughness: 0.12, metalness: 0.96 });
    const foliage   = new THREE.MeshStandardMaterial({ color: '#182818', roughness: 0.97, metalness: 0.0 });
    const bark      = new THREE.MeshStandardMaterial({ color: '#291508', roughness: 0.98, metalness: 0.0 });
    const ground    = new THREE.MeshStandardMaterial({ color: '#9e9478', roughness: 0.97, metalness: 0.0 });
    const paving    = new THREE.MeshStandardMaterial({ color: '#d4cdb8', roughness: 0.82, metalness: 0.0 });

    matsRef.current = [stucco, darkRoof, glass, travert, water, steel, foliage, bark, ground, paving];

    // ── Geometry helpers ──
    const box = (w, h, d, mat, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      return m;
    };

    const cyl = (rt, rb, h, segs, mat, x, y, z) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      scene.add(m);
      return m;
    };

    // ── Ground & Terrace ──
    box(70, 0.1, 70, ground, 0, -0.05, 0);
    box(18, 0.14, 14, paving, 0.5, 0.07, 1);   // main terrace

    // ── Building — Main Volume (living / kitchen) ──
    box(12, 3.4, 7.5, stucco, 0, 1.7, 0);

    // ── Building — Left Wing (bedrooms, set back) ──
    box(6, 2.9, 6.5, stucco, -8.0, 1.45, -0.5);

    // ── Building — Rear Volume (utility / entry) ──
    box(7, 2.4, 4, stucco, 2.5, 1.2, -5.5);

    // ── Roof Slabs ──
    box(13.4, 0.22, 8.8, darkRoof, 0, 3.32, 0);          // main roof
    box(7.2,  0.22, 7.5, darkRoof, -8.0, 3.02, -0.5);    // wing roof
    box(8.4,  0.22, 4.8, darkRoof, 2.5, 2.52, -5.5);     // rear roof

    // Extended front overhang (canopy)
    box(13.4, 0.18, 2.2, darkRoof, 0, 3.32, 5.3);
    box(7.2,  0.18, 2.0, darkRoof, -8.0, 3.02, 3.8);

    // ── Glass Curtain Walls ──
    box(11.8, 3.3, 0.06, glass, 0, 1.7, 3.78);          // main front glass
    box(0.06, 3.3, 7.4, glass, -6.06, 1.7, 0);          // main side glass
    box(5.8,  2.8, 0.06, glass, -8.0, 1.5, 2.78);       // wing front glass
    box(0.06, 2.4, 3.9, glass, 6.06, 1.2, -5.5);        // rear side glass

    // ── Steel Mullions (vertical dividers on main glass) ──
    for (let xi = -5; xi <= 5; xi += 2.5) {
      cyl(0.025, 0.025, 3.3, 6, steel, xi, 1.7, 3.82);
    }
    // horizontal rails
    box(11.8, 0.05, 0.1, steel, 0, 0.1,  3.78);
    box(11.8, 0.05, 0.1, steel, 0, 3.2,  3.78);
    box(11.8, 0.05, 0.1, steel, 0, 1.65, 3.78);

    // ── Thin Steel Columns (canopy support) ──
    [[-4.5], [-1.5], [1.5], [4.5]].forEach(([xi]) => {
      cyl(0.04, 0.04, 3.4, 8, steel, xi, 1.7, 5.22);
    });

    // ── Steps ──
    box(4.5, 0.18, 1.0, paving, 1.5, 0.09, 4.75);
    box(4.0, 0.18, 1.0, paving, 1.5, 0.27, 3.82);
    box(3.5, 0.18, 1.0, paving, 1.5, 0.45, 2.89);

    // ── Swimming Pool ──
    box(9, 0.14, 5.5, water,   4.5, 0.07, -5.5);   // water surface
    box(9, 0.6,  0.2, paving,  4.5, 0.3,  -2.85);  // coping N
    box(9, 0.6,  0.2, paving,  4.5, 0.3,  -8.15);  // coping S
    box(0.2, 0.6, 6,  paving, -0.4, 0.3,  -5.5);   // coping W
    box(0.2, 0.6, 6,  paving,  9.4, 0.3,  -5.5);   // coping E (overflow edge)

    // Pool bottom/sides (dark shell)
    box(9, 1.2, 5.5, new THREE.MeshStandardMaterial({ color: '#0a2030', roughness: 0.6 }), 4.5, -0.55, -5.5);

    // ── Trees (olive-style layered canopy) ──
    const addTree = (x, z, s = 1.0) => {
      cyl(0.07 * s, 0.13 * s, 2.8 * s, 7, bark, x, 1.4 * s, z);
      // 3 offset sphere clusters
      [
        [0, 0.1, 0], [0.3, 0.55, 0.2], [-0.2, 0.4, -0.15],
      ].forEach(([ox, oy, oz]) => {
        const r = (0.75 + oy * 0.6) * s;
        const crown = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), foliage);
        crown.position.set(x + ox * s, (2.8 + oy * 1.2) * s, z + oz * s);
        crown.castShadow = true;
        scene.add(crown);
      });
    };

    addTree(-14,  4,  1.2);
    addTree(-15, -2,  1.0);
    addTree(-13, -5,  0.9);
    addTree( 11, -3,  1.1);
    addTree( 12, -7,  0.95);
    addTree( -5, -10, 1.0);
    addTree(  2, -10, 0.85);

    // ── Lighting ──

    // Ambient (deep night blue)
    scene.add(new THREE.AmbientLight('#1a2a50', 0.55));

    // Moon (blue-white, high left)
    const moon = new THREE.DirectionalLight('#c8d8ff', 1.6);
    moon.position.set(-25, 35, 8);
    moon.castShadow = true;
    moon.shadow.mapSize.set(2048, 2048);
    moon.shadow.camera.near   = 1;
    moon.shadow.camera.far    = 120;
    moon.shadow.camera.left   = -30;
    moon.shadow.camera.right  = 30;
    moon.shadow.camera.top    = 30;
    moon.shadow.camera.bottom = -30;
    moon.shadow.bias = -0.0008;
    scene.add(moon);

    // Interior warm glow (bleeds through glass)
    const int1 = new THREE.PointLight('#ffd07a', 5.0, 14, 2);
    int1.position.set(0, 2.5, 2);
    scene.add(int1);

    const int2 = new THREE.PointLight('#ffe090', 3.0, 10, 2);
    int2.position.set(-7.5, 2, 1.5);
    scene.add(int2);

    // Pool (teal uplighting from below)
    const poolLt = new THREE.PointLight('#18b8d8', 3.5, 14, 2);
    poolLt.position.set(4.5, 0.3, -5.5);
    scene.add(poolLt);

    // Facade uplights
    const up1 = new THREE.PointLight('#ffeab0', 2.0, 8, 2.5);
    up1.position.set(-7.5, 0.15, 3.2);
    scene.add(up1);

    const up2 = new THREE.PointLight('#ffeab0', 1.5, 6, 2.5);
    up2.position.set(5.5, 0.15, 4.0);
    scene.add(up2);

    // ── Animation Loop ──
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Subtle breathing on pool & interior lights
      int1.intensity  = 5.0  + Math.sin(t * 0.28) * 0.3;
      poolLt.intensity = 3.5 + Math.sin(t * 0.55 + 1.2) * 0.35;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──
    const ro = new ResizeObserver(() => {
      const nW = container.clientWidth;
      const nH = container.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    });
    ro.observe(container);

    // Hide hint after 4 s
    const hintTimer = setTimeout(() => setHint(false), 4000);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(hintTimer);
      ro.disconnect();
      controls.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reactive: wireframe ──
  useEffect(() => {
    matsRef.current.forEach((mat) => {
      if ('wireframe' in mat) mat.wireframe = wireframe;
    });
  }, [wireframe]);

  // ── Reactive: auto-rotate ──
  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  // ── Button style ──
  const btnBase =
    'flex items-center gap-2 px-5 py-2.5 font-mono text-[9px] tracking-[0.25em] uppercase border transition-all duration-300 cursor-none select-none';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Three.js canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Project label */}
      <div className="absolute top-6 left-8 z-10 pointer-events-none">
        <p className="font-mono text-[9px] tracking-[0.35em] text-white/30 uppercase mb-1">
          Interactive 3D Model
        </p>
        <h3 className="font-display text-xl font-black text-white">
          Cielo Villa <span className="text-white/30 font-light">· Positano, Italy</span>
        </h3>
      </div>

      {/* Drag hint */}
      {hint && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
          style={{ animation: 'fadeOut 4s forwards' }}
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase text-center">
            ↻ Drag to rotate · Scroll to zoom
          </p>
        </div>
      )}

      {/* Controls bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        <button
          onClick={() => setWireframe((w) => !w)}
          className={`${btnBase} ${
            wireframe
              ? 'border-gold/60 text-gold bg-gold/10'
              : 'border-white/15 text-white/45 hover:border-white/40 hover:text-white/80'
          }`}
        >
          <span
            className="inline-block w-3 h-3 border rounded-sm"
            style={{ borderColor: wireframe ? '#c9a84c' : 'rgba(255,255,255,0.3)' }}
          />
          {wireframe ? 'Solid' : 'Wireframe'}
        </button>

        <button
          onClick={() => setAutoRotate((a) => !a)}
          className={`${btnBase} ${
            autoRotate
              ? 'border-white/30 text-white/70 hover:border-white/50'
              : 'border-white/15 text-white/45 hover:border-white/40 hover:text-white/80'
          }`}
        >
          {autoRotate ? (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-white/60 animate-pulse" />
              Auto-Rotate
            </>
          ) : (
            <>↻ Resume</>
          )}
        </button>
      </div>

      {/* Compass */}
      <div className="absolute bottom-6 right-8 z-10 pointer-events-none">
        <p className="font-mono text-[8px] tracking-[0.25em] text-white/20 uppercase text-right">
          Three.js · WebGL
        </p>
      </div>

      {/* Fade-out keyframe (inline) */}
      <style>{`
        @keyframes fadeOut {
          0%   { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
