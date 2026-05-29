'use client';

/**
 * ProjectsPageClient
 * ───────────────────
 * Client shell for the /projects route.
 * Receives project data from the server loader so new files become live automatically.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuraStore } from '@/store/useAuraStore';

const ArchitecturalViewer = dynamic(
  () => import('@/components/webgl/ArchitecturalViewer'),
  { ssr: false, loading: () => <ViewerSkeleton /> }
);

function ViewerSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-void">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 border-t border-gold rounded-full"
          style={{ animation: 'spin 1s linear infinite' }}
        />
        <p className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase">
          Loading 3D Model…
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ProjectCard({ project, index }) {
  const setMood = useAuraStore((s) => s.setActiveProjectMood);
  const clearMood = useAuraStore((s) => s.clearActiveProjectMood);
  const setCursor = useAuraStore((s) => s.setCursorVariant);

  return (
    <motion.article
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, delay: (index % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => {
        setMood(project.id);
        setCursor('link');
      }}
      onMouseLeave={() => {
        clearMood();
        setCursor('default');
      }}
      className="group relative cursor-none"
    >
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
        }}
      >
        <div
          className="h-[280px] w-full relative overflow-hidden"
          style={{ background: `radial-gradient(ellipse at 40% 60%, ${project.accentColor}30, #02020a)` }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: `radial-gradient(ellipse at 50% 50%, ${project.accentColor}20, transparent 70%)` }}
          />
          {project.featured3D && (
            <div
              className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full font-mono text-[8px] tracking-[0.2em] uppercase"
              style={{
                background: 'rgba(201,168,76,0.15)',
                border: '1px solid rgba(201,168,76,0.4)',
                color: '#c9a84c',
              }}
            >
              ◈ 3D Model Available
            </div>
          )}
        </div>

        <div
          className="absolute left-0 right-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(to right, transparent, ${project.accentColor}, transparent)` }}
        />

        <div className="p-8">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase mb-2">
                {project.category} · {project.year}
              </p>
              <h3 className="font-display text-2xl font-black text-white leading-tight">
                {project.title}
              </h3>
              <p className="font-mono text-[9px] tracking-[0.2em] text-white/35 uppercase mt-1">
                {project.location}
              </p>
            </div>
            <span className="font-mono text-[10px] text-white/20 mt-1">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          <p className="font-body text-sm leading-relaxed text-white/45 mb-6">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full font-mono text-[8px] tracking-[0.18em] uppercase"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="h-px flex-1" style={{ background: project.accentColor, opacity: 0.5 }} />
            <span
              className="font-mono text-[9px] tracking-[0.22em] uppercase"
              style={{ color: project.accentColor }}
            >
              View Project →
            </span>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

export default function ProjectsPageClient({ projects }) {
  const [show3D, setShow3D] = useState(true);
  const featuredProject = projects.find((project) => project.featured3D) ?? projects[0] ?? null;

  return (
    <main className="min-h-screen bg-void text-white overflow-x-hidden">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-6"
        style={{ background: 'linear-gradient(to bottom, rgba(2,2,10,0.9), transparent)', backdropFilter: 'blur(12px)' }}
      >
        <Link
          href="/"
          className="font-mono text-[9px] tracking-[0.3em] text-white/45 uppercase hover:text-white/80 transition-colors duration-300 cursor-none"
        >
          ← Back to Aura
        </Link>
        <p className="font-mono text-[9px] tracking-[0.35em] text-white/25 uppercase">
          Projects
        </p>
      </motion.nav>

      <section className="pt-36 pb-16 px-8 md:px-16 lg:px-24">
        <motion.p
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="font-mono text-[9px] tracking-[0.38em] text-gold/55 uppercase mb-6"
        >
          01 / Project Portfolio
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-black text-white leading-[0.9] tracking-[-0.02em] mb-8"
          style={{ fontSize: 'clamp(3.2rem, 8vw, 8rem)' }}
        >
          Every Space<br />
          <span className="text-white/30">Has a Soul.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="font-body text-[1rem] leading-[1.75] text-white/40 max-w-[42ch]"
        >
          Five projects. Five different worlds. Each one a conversation between
          material, light, and the people who will inhabit it.
        </motion.p>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-4 md:mx-8 lg:mx-16 mb-6 overflow-hidden rounded-3xl"
        style={{
          height: '70vh',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div className="absolute top-5 right-5 z-20">
          <button
            onClick={() => setShow3D((v) => !v)}
            className="px-4 py-2 font-mono text-[8px] tracking-[0.22em] uppercase cursor-none transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.5)',
              borderRadius: '999px',
            }}
          >
            {show3D ? '◈ 3D ON' : '◈ 3D OFF'}
          </button>
        </div>

        {show3D ? (
          <ArchitecturalViewer className="w-full h-full" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'radial-gradient(ellipse at 40% 60%, #c76b3a15, #02020a)' }}
          >
            <p className="font-mono text-[10px] tracking-[0.3em] text-white/20 uppercase">
              3D Viewer Paused
            </p>
          </div>
        )}
      </motion.section>

      <div className="px-8 md:px-16 lg:px-24 mb-20">
        {featuredProject ? (
          <p className="font-mono text-[8px] tracking-[0.3em] text-white/20 uppercase">
            Interactive 3D Model — {featuredProject.title}, {featuredProject.location} · Drag to rotate, scroll to zoom
          </p>
        ) : null}
      </div>

      <div className="px-8 md:px-16 lg:px-24 mb-16">
        <div className="flex items-center gap-6">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1))' }} />
          <p className="font-mono text-[9px] tracking-[0.35em] text-white/20 uppercase whitespace-nowrap">
            All Projects
          </p>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.1))' }} />
        </div>
      </div>

      <section className="px-8 md:px-16 lg:px-24 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="px-8 md:px-16 lg:px-24 pb-32 flex flex-col md:flex-row items-start md:items-end justify-between gap-12"
      >
        <div>
          <p className="font-mono text-[9px] tracking-[0.35em] text-gold/55 uppercase mb-4">
            Ready to collaborate?
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white leading-[0.9]">
            Let's design<br />your next space.
          </h2>
        </div>
        <Link
          href="/process"
          className="px-8 py-4 font-mono text-[9px] tracking-[0.25em] uppercase text-white/60 border border-white/15 hover:border-white/40 hover:text-white/85 transition-all duration-300 cursor-none"
        >
          See our process →
        </Link>
      </motion.section>
    </main>
  );
}
