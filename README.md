# Aura — Feel the Space Before It Exists.

> A next-generation architectural experience platform. WebGL fluid dynamics, GSAP horizontal scroll, magnetic buttons, and a mood-reactive background that shifts in real time as you explore projects.

![Aura Hero](./public/og.jpg)

---

## The Concept

Architecture firms have a problem: clients can't *feel* a space from a 2D render.

Aura solves that by making the website itself behave like the space — atmospheric, reactive, alive. Hovering over a warm timber cabin shifts the entire background into amber. A minimalist Tokyo loft pulls it into cool steel blue. The fluid WebGL background doesn't just sit there. It breathes.

---

## Features

**Immersive Hero**
- Full-screen GLSL fluid shader driven by simplex noise (3 layered octaves)
- Mouse cursor distorts the fluid field in real time via a Gaussian falloff
- Bold oversized headline with word-by-word mask reveal (Framer Motion)
- Scroll parallax: content lifts and fades as you leave the section

**Sensory Showcase**
- Horizontal scroll section pinned and scrubbed by GSAP ScrollTrigger
- 5 project cards rendered as floating 3D glassmorphism panels
- Hovering a card morphs the background shader colors to match that project's mood — zero React re-renders, all done inside `useFrame()`
- Framer Motion card lift + perspective tilt on hover

**Mood-Reactive Background**
- Each project has a defined 3-color palette (`colorA`, `colorB`, `colorAccent`)
- Zustand holds the active mood; the R3F canvas lerps shader uniforms toward it every frame
- ~1.5s transition with no animation libraries — pure `THREE.Color.lerp()`

**Custom Cursor**
- Dual-layer: snappy dot (spring stiffness 600) + trailing ring (spring stiffness 90)
- `mix-blend-mode: difference` — inverts everything underneath, always visible
- State-aware: expands on hover, label "View" appears on project cards, shrinks on drag

**Magnetic Buttons**
- CTAs physically attract toward the cursor on hover using spring physics
- Shimmer overlay sweeps across on hover (primary variant)
- Snaps back with over-shoot on mouse leave

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| 3D / WebGL | React Three Fiber + Drei |
| Shaders | Custom GLSL (simplex noise fluid) |
| UI Animation | Framer Motion |
| Scroll | GSAP + ScrollTrigger |
| State | Zustand (`subscribeWithSelector`) |
| Styling | Tailwind CSS v3 (custom design tokens) |

---

## Getting Started

```bash
git clone https://github.com/Pliatsikas/aura.git
cd aura
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── layout.jsx              # Root — fonts, cursor, providers
│   └── page.jsx                # Home page
│
├── components/
│   ├── sections/
│   │   ├── HeroSection.jsx     # Shader + headline reveal + parallax
│   │   └── SensoryShowcase.jsx # GSAP horizontal scroll + project cards
│   │
│   ├── webgl/
│   │   └── LiquidEtherBackground.jsx  # R3F canvas + fluid GLSL shader
│   │
│   └── ui/
│       ├── CustomCursor.jsx    # Dual-spring cursor, blend mode
│       └── MagneticButton.jsx  # Spring-physics magnetic CTA
│
└── store/
    └── useAuraStore.js         # Zustand — mood state + cursor variant
```

---

## How the Mood System Works

This is the core architectural decision of the project.

**The naive approach** — put colors in `useState`, pass as props to the canvas — causes React to re-render on every hover event. At 60fps that means reconciliation overhead on every frame. You feel it.

**The actual approach:**

```
Card hover  →  Zustand.setMood('cabin')  →  [no React renders]
                                                    ↓
                                        R3F useFrame() reads mood selector
                                                    ↓
                                 uniforms.uColorA.value.lerp(target, 0.018)
                                                    ↓
                                              GPU renders
```

The WebGL canvas is completely isolated from React's render tree. It communicates through Zustand selectors and lerps its own uniforms directly — no setState, no props, no diffing.

---

## Project Moods

Each project ships with three shader colors:

| Project | Mood | Palette |
|---|---|---|
| Solstice Cabin | Warm Amber | `#160800` · `#3d1800` · `#d4813a` |
| Obsidian Loft | Cool Steel | `#020d1a` · `#081f36` · `#4a93b8` |
| Cielo Villa | Sun Terracotta | `#140a00` · `#2a1000` · `#c76b3a` |
| Eclipse Penthouse | Obsidian Chrome | `#050008` · `#130020` · `#8b5cf6` |
| Tide House | Sea Glass | `#00101a` · `#002030` · `#38b2ac` |

---

## Performance Notes

- WebGL canvas capped at `dpr={[1, 1.5]}` — no overkill on large retina displays
- Single `planeGeometry(1,1)` quad — optimal for full-screen shaders, no subdivision overhead
- All Framer Motion animations operate on GPU-composited properties only (`transform`, `opacity`)
- GSAP `scrub: 1.2` smooths the horizontal scroll to remove jank on mid-range hardware
- Fonts are self-hosted with `display: swap` — no Google Fonts DNS lookup blocking paint

---

## Design Tokens

```js
// tailwind.config.js
colors: {
  void:  '#02020a',  // near-black with blue cast
  gold:  '#c9a84c',  // editorial gold accent
  ivory: '#f5f0e8',  // light text
  smoke: '#8a8a9a',  // secondary text
}

ease: {
  'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',  // the premium easing
}
```

---

## Built by

**Alex Pliatsikas** — Systems, Web, AI, Tooling  
[pliatsikas.github.io](https://pliatsikas.github.io) · [GitHub](https://github.com/Pliatsikas)

---

<sub>Thessaloniki · 2026</sub>