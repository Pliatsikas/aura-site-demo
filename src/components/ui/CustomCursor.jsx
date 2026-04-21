'use client';

/**
 * CustomCursor
 * ────────────
 * A dual-layer custom cursor with WebGL-style `mix-blend-mode: difference`.
 * This inverts the colors underneath it, making it legible on any background —
 * dark sections show a white blob, light sections show a dark blob.
 *
 * Architecture:
 *   ┌─ Dot  (snappy)  ─────────────────────────────────────────────────────┐
 *   │  Tracks the mouse almost instantly (stiff spring).                    │
 *   │  Small (12px default), scales down on drag.                           │
 *   └──────────────────────────────────────────────────────────────────────┘
 *   ┌─ Ring (laggy)  ──────────────────────────────────────────────────────┐
 *   │  Follows with a soft lag (loose spring). Creates the trailing halo.   │
 *   │  Expands to 48px on hover, 72px over CTA buttons.                    │
 *   └──────────────────────────────────────────────────────────────────────┘
 *
 * Cursor states (driven by Zustand `cursorVariant`):
 *   'default' → standard small dot + ring
 *   'hover'   → ring expands, gold border accent
 *   'link'    → ring expands + label "View" appears
 *   'drag'    → dot shrinks, ring shrinks, reduced opacity
 *   'hidden'  → both invisible (e.g. over video, inputs)
 *
 * Usage:
 *   Mount once in the root layout:
 *   <CustomCursor />
 *
 *   To trigger a state, call from any child:
 *   const setCursorVariant = useAuraStore(s => s.setCursorVariant);
 *   <div onMouseEnter={() => setCursorVariant('hover')} ... />
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '@/store/useAuraStore';

// ─── Size & opacity by state ─────────────────────────────────────────────────
const CURSOR_CONFIG = {
  default: { dot: 12, ring: 40, ringOpacity: 0.12, dotOpacity: 1 },
  hover:   { dot: 8,  ring: 56, ringOpacity: 0.18, dotOpacity: 0.9 },
  link:    { dot: 6,  ring: 72, ringOpacity: 0.20, dotOpacity: 0.7 },
  drag:    { dot: 6,  ring: 28, ringOpacity: 0.08, dotOpacity: 0.5 },
  hidden:  { dot: 0,  ring: 0,  ringOpacity: 0,    dotOpacity: 0   },
};

// ─── Spring configs ───────────────────────────────────────────────────────────
const DOT_SPRING  = { stiffness: 600, damping: 30, mass: 0.05 }; // snappy
const RING_SPRING = { stiffness: 90,  damping: 18, mass: 0.2  }; // laggy trail

export default function CustomCursor() {
  const cursorVariant = useAuraStore((s) => s.cursorVariant);
  const setCursorVariant = useAuraStore((s) => s.setCursorVariant);

  // Raw mouse position
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // Sprung positions
  const dotX  = useSpring(mouseX, DOT_SPRING);
  const dotY  = useSpring(mouseY, DOT_SPRING);
  const ringX = useSpring(mouseX, RING_SPRING);
  const ringY = useSpring(mouseY, RING_SPRING);

  // Whether cursor is on-screen
  const [isVisible, setIsVisible] = useState(false);

  // ── Global mouse tracking ──
  useEffect(() => {
    const onMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const onLeave  = () => setIsVisible(false);
    const onEnter  = () => setIsVisible(true);
    const onDown   = () => setCursorVariant('drag');
    const onUp     = () => setCursorVariant('default');

    window.addEventListener('mousemove',    onMove,  { passive: true });
    window.addEventListener('mouseleave',   onLeave);
    window.addEventListener('mouseenter',   onEnter);
    window.addEventListener('mousedown',    onDown);
    window.addEventListener('mouseup',      onUp);

    return () => {
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mousedown',  onDown);
      window.removeEventListener('mouseup',    onUp);
    };
  }, [mouseX, mouseY, isVisible, setCursorVariant]);

  // ── Auto-detect hover targets via data attributes ──
  useEffect(() => {
    const enter = (e) => {
      const variant = e.currentTarget.dataset.cursor ?? 'hover';
      setCursorVariant(variant);
    };
    const leave = () => setCursorVariant('default');

    // Query standard interactive elements + anything with [data-cursor]
    const targets = document.querySelectorAll(
      'a, button, [data-cursor], [role="button"]'
    );
    targets.forEach((el) => {
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
    });

    return () => {
      targets.forEach((el) => {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
      });
    };
    // Re-run when DOM changes (e.g. after route change)
  }, [setCursorVariant]);

  const cfg = CURSOR_CONFIG[cursorVariant] ?? CURSOR_CONFIG.default;

  if (!isVisible) return null;

  return (
    <>
      {/* ── Dot (snappy) ─────────────────────────────────────────────────── */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-white mix-blend-difference"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width:   cfg.dot,
          height:  cfg.dot,
          opacity: cfg.dotOpacity,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />

      {/* ── Ring (trailing halo) ──────────────────────────────────────────── */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full mix-blend-difference"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          border: '1px solid rgba(255,255,255,0.7)',
        }}
        animate={{
          width:   cfg.ring,
          height:  cfg.ring,
          opacity: cfg.ringOpacity,
          // Gold accent on hover
          borderColor:
            cursorVariant === 'hover' || cursorVariant === 'link'
              ? 'rgba(201,168,76,0.8)'
              : 'rgba(255,255,255,0.7)',
        }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      />

      {/* ── "View" label (link state) ─────────────────────────────────────── */}
      <AnimatePresence>
        {cursorVariant === 'link' && (
          <motion.span
            key="cursor-label"
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[9997] font-mono text-[8px] tracking-[0.2em] text-white uppercase mix-blend-difference"
            style={{
              x: ringX,
              y: ringY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            View
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
}
