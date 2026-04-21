'use client';

/**
 * MagneticButton
 * ──────────────
 * A CTA button with a magnetic hover effect — the button physically
 * attracts toward the cursor when hovered, using spring physics.
 *
 * How it works:
 *   1. On mousemove, we calculate the cursor's offset from the button center
 *   2. We multiply by `magneticStrength` (0–1) to control pull intensity
 *   3. These values are fed into Framer Motion `useSpring` — giving the
 *      displacement a natural, over/under-shooting feel
 *   4. On mouseleave, x/y reset to 0, springs bounce back
 *
 * Variants:
 *   - "primary": Gold fill, void text, shimmer overlay on hover
 *   - "ghost":   Transparent, white border, glows on hover
 *   - "outline": Minimal, used for secondary actions
 */

import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';

// ─── Variant styles ──────────────────────────────────────────────────────────
const VARIANTS = {
  primary: {
    base: [
      'relative overflow-hidden',
      'bg-gold text-void',
      'px-8 py-[1.1rem]',
      'font-mono text-[10px] tracking-[0.25em] uppercase font-medium',
    ].join(' '),
    shimmer: true,
  },
  ghost: {
    base: [
      'relative',
      'border border-white/20 text-white/65',
      'px-8 py-[1.1rem]',
      'font-mono text-[10px] tracking-[0.25em] uppercase',
      'transition-colors duration-400 hover:border-white/50 hover:text-white/90',
    ].join(' '),
    shimmer: false,
  },
  outline: {
    base: [
      'relative',
      'border border-gold/40 text-gold/70',
      'px-6 py-3',
      'font-mono text-[10px] tracking-[0.25em] uppercase',
      'transition-colors duration-400 hover:border-gold hover:text-gold',
    ].join(' '),
    shimmer: false,
  },
};

// ─── Spring config ───────────────────────────────────────────────────────────
// Low stiffness + low damping = floaty, over-shoots slightly = premium feel
const SPRING_CONFIG = { stiffness: 140, damping: 12, mass: 0.08 };

// ─── Label inner animation ───────────────────────────────────────────────────
// Text microscopically lifts on hover for tactile feel
const labelVariants = {
  idle:  { y: 0 },
  hover: { y: -1.5 },
};

export default function MagneticButton({
  children,
  variant = 'primary',
  href,
  onClick,
  magneticStrength = 0.38,
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
}) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw motion values (no spring — set instantly on move)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Sprung motion values (animate smoothly from raw)
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  // ── Handlers ──
  const handleMouseMove = useCallback(
    (e) => {
      if (!ref.current || disabled) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      rawX.set((e.clientX - cx) * magneticStrength);
      rawY.set((e.clientY - cy) * magneticStrength);
    },
    [rawX, rawY, magneticStrength, disabled]
  );

  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  const { base, shimmer } = VARIANTS[variant] ?? VARIANTS.primary;

  // ── Shared motion props ──
  const motionProps = {
    ref,
    style: { x, y },
    onMouseMove:  handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    whileTap: { scale: 0.95 },
    className: [
      base,
      'cursor-none select-none',
      disabled && 'pointer-events-none opacity-40',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  };

  // ── Inner content (label + optional shimmer) ──
  const inner = (
    <>
      {/* Shimmer overlay (primary variant only) */}
      {shimmer && (
        <motion.span
          aria-hidden
          className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={isHovered ? { translateX: '100%' } : { translateX: '-100%' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      {/* Label */}
      <motion.span
        className="relative z-10 block"
        variants={labelVariants}
        animate={isHovered ? 'hover' : 'idle'}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.span>
    </>
  );

  // ── Render as <Link> or <button> ──
  if (href) {
    return (
      <motion.div {...motionProps} role="none">
        <Link
          href={href}
          aria-label={ariaLabel}
          className="block"
          tabIndex={disabled ? -1 : 0}
        >
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      type="button"
    >
      {inner}
    </motion.button>
  );
}
