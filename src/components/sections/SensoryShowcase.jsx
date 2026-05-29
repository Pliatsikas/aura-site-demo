'use client';

/**
 * SensoryShowcase — The Core Solution Section
 * ────────────────────────────────────────────
 * Horizontal scroll section driven by GSAP ScrollTrigger.
 * Project cards float as 3D glassmorphism panels.
 * Hovering a card triggers an ambient mood shift in the background shader.
 *
 * Architecture:
 *   - The outer <section> is tall (height: n × 100vh) to give GSAP scroll room
 *   - The inner track slides horizontally as scroll progresses (pin technique)
 *   - Each ProjectCard manages its own hover state and calls setActiveProjectMood
 *   - Framer Motion handles card entrance & hover lift animations
 *   - GSAP ScrollTrigger handles the horizontal progression
 *
 * GSAP ScrollTrigger pattern:
 *   gsap.to(trackRef, {
 *     x: -(totalWidth - viewportWidth),
 *     ease: 'none',
 *     scrollTrigger: { scrub: 1.2, pin: true, ... }
 *   })
 */

import { useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuraStore } from '@/store/useAuraStore';

gsap.registerPlugin(ScrollTrigger);

// ─── Individual Project Card ──────────────────────────────────────────────────
function ProjectCard({ project, index }) {
  const setMood  = useAuraStore((s) => s.setActiveProjectMood);
  const clearMood = useAuraStore((s) => s.clearActiveProjectMood);
  const setCursor = useAuraStore((s) => s.setCursorVariant);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => {
        setMood(project.id);
        setCursor('link');
      }}
      onMouseLeave={() => {
        clearMood();
        setCursor('default');
      }}
      data-cursor="link"
      className="group relative flex-shrink-0 cursor-none"
      style={{ width: '440px' }}
    >
      {/* ── Glassmorphism card shell ── */}
      <motion.div
        whileHover={{ y: -12, rotateX: 2, rotateY: -1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
        className="relative h-[580px] overflow-hidden rounded-2xl"
      >
        {/* Backdrop blur glass panel */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        />

        {/* Project image (placeholder — swap with next/image) */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <motion.div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${project.imageUrl})` }}
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(2,2,10,0.92) 0%, rgba(2,2,10,0.4) 50%, transparent 100%)',
            }}
          />
        </div>

        {/* Accent top border — color matches project mood */}
        <div
          className="absolute left-0 right-0 top-0 h-px transition-opacity duration-500 group-hover:opacity-100 opacity-0"
          style={{
            background: `linear-gradient(to right, transparent, ${project.accentColor}, transparent)`,
          }}
        />

        {/* Card content */}
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          {/* Tags */}
          <div className="mb-4 flex gap-2">
            {project.tags.map((tag, tagIndex) => (
              <span
                key={`tag-${project.id}-${tagIndex}`}
                className="rounded-full px-3 py-1 font-mono text-[9px] tracking-[0.2em] uppercase"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="font-display text-3xl font-black leading-tight text-white">
            {project.title}
          </h3>

          {/* Location + year */}
          <p className="mt-1 font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
            {project.location} · {project.year}
          </p>

          {/* Description — reveals on hover */}
          <motion.p
            className="mt-4 font-body text-sm leading-relaxed text-white/55"
            initial={{ opacity: 0, height: 0 }}
            whileHover={{ opacity: 1, height: 'auto' }}
          >
            {project.description}
          </motion.p>

          {/* CTA arrow */}
          <motion.div
            className="mt-6 flex items-center gap-3"
            initial={{ x: -8, opacity: 0 }}
            whileHover={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-px flex-1" style={{ background: project.accentColor, opacity: 0.6 }} />
            <span
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: project.accentColor }}
            >
              View Project
            </span>
          </motion.div>
        </div>

        {/* Hover spotlight (follows mouse eventually — simplified here) */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${project.accentColor}15, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Index number */}
      <span className="absolute -left-4 -top-4 font-mono text-[11px] text-white/15">
        {String(index + 1).padStart(2, '0')}
      </span>
    </motion.article>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function SensoryShowcase({ projects = [] }) {
  const sectionRef = useRef(null);
  const trackRef   = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const cards     = trackRef.current.querySelectorAll('article');
    const cardWidth = 440 + 40; // card width + gap
    const totalW    = cardWidth * cards.length;
    const scrollDist = totalW - window.innerWidth + 160; // +160 = right padding

    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        x: -scrollDist,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${scrollDist}`,
          scrub: 1.2,         // seconds lag = smooth scrub feel
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-void"
      aria-label="Sensory Showcase — Project Portfolio"
    >
      {/* Section header (stays pinned at top during scroll) */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-end justify-between px-16 pt-16 pb-12">
        <div>
          <p className="mb-3 font-mono text-[10px] tracking-[0.35em] text-gold/60 uppercase">
            02 / Sensory Showcase
          </p>
          <h2 className="font-display text-5xl font-black leading-none text-white">
            Projects
          </h2>
        </div>
        <p className="font-mono text-[10px] tracking-[0.2em] text-white/25 uppercase">
          Scroll to explore →
        </p>
      </div>

      {/* Horizontal track */}
      <div className="flex h-screen items-center">
        <div
          ref={trackRef}
          className="flex gap-10 will-change-transform"
          style={{ paddingLeft: '120px', paddingRight: '120px' }}
        >
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
