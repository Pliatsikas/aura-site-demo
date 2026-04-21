/**
 * useAuraStore — Global State (Zustand)
 * ──────────────────────────────────────
 * The central nervous system of Aura's dynamic theming system.
 *
 * KEY PATTERN: "Mood-Driven Background"
 * ──────────────────────────────────────
 * When a project card is hovered, `setActiveProjectMood(projectId)` is called.
 * This updates `activeProjectMood` in the store. The `LiquidEtherBackground`
 * component is subscribed to this slice via a selector — on each animation
 * frame it LERPS its shader uniforms toward the new target colors:
 *
 *   uniforms.uColorA.value.lerp(targetColors.current.a, 0.018)
 *
 * This gives a buttery ~1.5s transition without any useState re-renders.
 * The WebGL canvas is the only component doing the expensive color math.
 *
 * STATE SLICES:
 *   activeProjectMood  — current project palette (null = default void palette)
 *   cursorVariant      — drives CustomCursor appearance
 *   isTransitioning    — page transition lock (prevents scroll during R3F load)
 *   audioEnabled       — ambient soundscape toggle
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

// ─── Project Mood Palettes ───────────────────────────────────────────────────
// Each project defines three color stops fed into the GLSL shader:
//   colorA      — deep background / shadow color
//   colorB      — mid fluid color
//   colorAccent — highlights / energy peaks

export const PROJECT_MOODS = {
  // Warm Scandinavian cabin — raw timber, amber candlelight
  cabin: {
    id: 'cabin',
    label: 'Warm Amber',
    colorA: '#160800',
    colorB: '#3d1800',
    colorAccent: '#d4813a',
  },

  // Tokyo minimalist loft — polished concrete, cool steel, neon traces
  loft: {
    id: 'loft',
    label: 'Cool Steel',
    colorA: '#020d1a',
    colorB: '#081f36',
    colorAccent: '#4a93b8',
  },

  // Mediterranean villa — white stucco, terracotta, azure sky
  villa: {
    id: 'villa',
    label: 'Sun Terracotta',
    colorA: '#140a00',
    colorB: '#2a1000',
    colorAccent: '#c76b3a',
  },

  // New York penthouse — obsidian, chrome, deep violet drama
  penthouse: {
    id: 'penthouse',
    label: 'Obsidian Chrome',
    colorA: '#050008',
    colorB: '#130020',
    colorAccent: '#8b5cf6',
  },

  // Coastal retreat — sea glass, bleached driftwood, horizon blue
  coastal: {
    id: 'coastal',
    label: 'Sea Glass',
    colorA: '#00101a',
    colorB: '#002030',
    colorAccent: '#38b2ac',
  },

  // Desert spa — sand, blush, the heat shimmer of dusk
  desert: {
    id: 'desert',
    label: 'Desert Dusk',
    colorA: '#1a0e00',
    colorB: '#2e1800',
    colorAccent: '#e8a87c',
  },
};

// ─── Store ───────────────────────────────────────────────────────────────────
export const useAuraStore = create(
  subscribeWithSelector((set, get) => ({
    // ── Mood ──────────────────────────────────────────────────────────────
    activeProjectMood: null,

    setActiveProjectMood: (moodId) => {
      const mood = PROJECT_MOODS[moodId] ?? null;
      set({ activeProjectMood: mood });
    },

    clearActiveProjectMood: () => {
      set({ activeProjectMood: null });
    },

    // ── Cursor ────────────────────────────────────────────────────────────
    // 'default' | 'hover' | 'link' | 'drag' | 'hidden'
    cursorVariant: 'default',

    setCursorVariant: (variant) => {
      // Guard: don't override drag state with hover
      if (get().cursorVariant === 'drag' && variant === 'hover') return;
      set({ cursorVariant: variant });
    },

    // ── Page transition ───────────────────────────────────────────────────
    isTransitioning: false,

    setTransitioning: (v) => set({ isTransitioning: v }),

    // ── Audio ─────────────────────────────────────────────────────────────
    audioEnabled: false,

    toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),

    // ── Loaded projects (for SensoryShowcase) ────────────────────────────
    //    Tracks which project the horizontal scroll is "snapped" to
    activeProjectIndex: 0,

    setActiveProjectIndex: (i) => set({ activeProjectIndex: i }),
  }))
);

// ─── Convenience selectors (use these to avoid over-subscribing) ─────────────
// Pattern: const mood = useMood();  — only re-renders when mood changes
export const useMood        = () => useAuraStore((s) => s.activeProjectMood);
export const useCursor      = () => useAuraStore((s) => s.cursorVariant);
export const useTransition  = () => useAuraStore((s) => s.isTransitioning);

// Multi-value selector — use shallow comparison to avoid spurious re-renders
export const useProjectNav  = () =>
  useAuraStore(
    (s) => ({
      activeIndex: s.activeProjectIndex,
      setIndex:    s.setActiveProjectIndex,
      setMood:     s.setActiveProjectMood,
      clearMood:   s.clearActiveProjectMood,
    }),
    shallow
  );
