'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
// ΕΔΩ ΕΙΝΑΙ Η ΑΛΛΑΓΗ: Πλέον κάνουμε import το νέο LiquidEther
import LiquidEther from '@/components/webgl/LiquidEther'; 
import MagneticButton from '@/components/ui/MagneticButton';
import { useAuraStore } from '@/store/useAuraStore';

const HEADLINE_WORDS = ['Feel', 'the', 'Space', 'Before', 'It', 'Exists.'];
const WORD_TRANSITION = (i) => ({
  duration: 1.1, delay: 0.6 + i * 0.085, ease: [0.16, 1, 0.3, 1],
});

export default function HeroSection() {
  const containerRef = useRef(null);
  
  const activeProjectMood = useAuraStore((s) => s.activeProjectMood);
  
  const etherColors = activeProjectMood 
    ? [activeProjectMood.colorA, activeProjectMood.colorB, activeProjectMood.colorAccent]
    : ['#02020a', '#0e0520', '#c9a84c'];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[100svh] w-full overflow-hidden bg-void">
      
      <div className="absolute inset-0 z-0 opacity-80" aria-hidden>
        <LiquidEther 
          colors={etherColors}
          mouseForce={20}
          cursorSize={100}
          resolution={0.35}
          iterationsPoisson={8}
          isViscous={false}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, #02020a 100%)' }} />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-48" style={{ background: 'linear-gradient(to bottom, transparent, #02020a)' }} />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-20 flex h-full flex-col justify-center px-6 md:px-16 lg:px-24 xl:px-32">
        <motion.p initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="mb-10 font-mono text-[10px] tracking-[0.35em] text-gold/60 uppercase select-none">
          Architecture · Experience Design · Aura Studio
        </motion.p>
        <h1 className="max-w-6xl font-display leading-[0.88] tracking-[-0.02em] text-white" style={{ fontSize: 'clamp(3.8rem, 10vw, 10.5rem)', fontWeight: 900 }}>
          {HEADLINE_WORDS.map((word, i) => (
            <span key={`word-${i}`} className="inline-block overflow-hidden" style={{ perspective: '800px' }}>
              <motion.span className="inline-block" initial={{ y: '110%', rotateX: -18, opacity: 0.4 }} animate={{ y: 0, rotateX: 0, opacity: 1 }} transition={WORD_TRANSITION(i)} style={{ transformOrigin: 'bottom center' }}>
                {word}{i < HEADLINE_WORDS.length - 1 && '\u00A0'}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.35, ease: [0.16, 1, 0.3, 1] }} className="mt-10 max-w-[38ch] font-body text-[1.05rem] leading-[1.7] text-white/45">
          We transform architectural blueprints into living, breathing emotional experiences — before a single stone is laid.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.65, ease: [0.16, 1, 0.3, 1] }} className="mt-14 flex flex-wrap items-center gap-5">
          <MagneticButton variant="primary" href="/projects">Explore Projects</MagneticButton>
          <MagneticButton variant="ghost" href="/process">Our Process ↗</MagneticButton>
        </motion.div>
      </motion.div>
    </section>
  );
}