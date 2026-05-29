'use client';

/**
 * /app/process/page.jsx
 * ─────────────────────
 * "Our Process" page for Aura Studio.
 * Shows 5 design phases in a vertical editorial layout.
 * Animated number reveals, horizontal rule separators, gold accents.
 *
 * Route: /process
 */

import { motion } from 'framer-motion';
import Link from 'next/link';

// ── Process Phases ────────────────────────────────────────────────────────────
const PHASES = [
  {
    number: '01',
    title:   'Intuition',
    subtitle: 'Listening Before Drawing',
    duration: '1–2 weeks',
    color:    '#c9a84c',
    description:
      'Before any line is drawn, we sit with you. We ask about light, memory, and feeling — not square footage. What does "home" mean to you? When have you walked into a room and felt completely at ease? Our process begins not with blueprints but with deep listening. We study site conditions, surrounding landscape, the path of the sun, and the invisible emotional atmosphere you want to inhabit.',
    deliverables: ['Mood Board Collection', 'Sensory Brief', 'Site Analysis Report', 'First Concepts Sketchbook'],
  },
  {
    number: '02',
    title:   'Mapping',
    subtitle: 'Space as Choreography',
    duration: '2–3 weeks',
    color:    '#6080d0',
    description:
      'Space is choreography. We map how bodies move through it — morning routines, evening rituals, the path from door to kitchen to bed. Every threshold is intentional. Every sightline considered. At this phase we develop multiple spatial configurations, testing how the architecture frames the outside world and shelters the life within. Physical 1:50 models are made. Nothing is finalized until it feels right at human scale.',
    deliverables: ['3D Spatial Studies', 'Flow Diagrams', 'Scale Models (1:50)', 'Preliminary Floor Plans'],
  },
  {
    number: '03',
    title:   'Materializing',
    subtitle: 'The Language of Surfaces',
    duration: '3–4 weeks',
    color:    '#c76b3a',
    description:
      'Materials are not decorative — they are emotional. Raw concrete absorbs sound differently than limestone. Aged brass feels different than polished chrome. We source each material with intention: where it comes from, how it ages, what it says about permanence. We build physical material sample boards and test them in your actual light conditions, at different times of day. Our 3D visualization tools let you inhabit the space before a single wall is poured.',
    deliverables: ['Material Sample Boards', 'Light Simulation Studies', 'Photo-realistic 3D Renders', 'Interactive 3D Walkthroughs'],
  },
  {
    number: '04',
    title:   'Resonance',
    subtitle: 'Refining Until It Sings',
    duration: '4–6 weeks',
    color:    '#38b2ac',
    description:
      'This is where architecture becomes art. Every detail is refined until nothing is arbitrary — the reveal where wall meets floor, the depth of a window reveal, the profile of a handrail. We call this phase "Resonance" because the goal is for every element to vibrate at the same emotional frequency. Design Development drawings are completed, engineering consultants are engaged, and the technical documentation that will build your vision begins to take form.',
    deliverables: ['Design Development Package', 'Engineering Coordination', 'Detailed Drawings (1:20, 1:5)', 'Specification Documents'],
  },
  {
    number: '05',
    title:   'Delivery',
    subtitle: 'Stewardship Through Construction',
    duration: 'Project Duration',
    color:    '#8b5cf6',
    description:
      'Our involvement doesn\'t end at the drawing board. We act as stewards of the vision through construction — visiting the site regularly, working alongside builders to solve challenges as they emerge, and protecting the integrity of the design to the last detail. We do not disappear when shovels hit the ground. We believe great architecture is built through sustained attention and trust between architect, builder, and client.',
    deliverables: ['Contract Administration', 'Site Visits & Reports', 'Builder Coordination', 'Handover & Aftercare Guide'],
  },
];

// ── Phase Block ───────────────────────────────────────────────────────────────
function PhaseBlock({ phase, index }) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Horizontal rule */}
      <div
        className="h-px w-full mb-12"
        style={{ background: `linear-gradient(to right, ${phase.color}60, rgba(255,255,255,0.06), transparent)` }}
      />

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pb-20`}>
        {/* Phase number + meta (3 cols) */}
        <div className="lg:col-span-3">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.1 }}
            className="block font-display font-black leading-none mb-6"
            style={{
              fontSize: 'clamp(5rem, 10vw, 9rem)',
              color: 'transparent',
              WebkitTextStroke: `1px ${phase.color}40`,
            }}
          >
            {phase.number}
          </motion.span>

          <p className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase mb-3">
            Duration
          </p>
          <p className="font-mono text-[10px] tracking-[0.15em] text-white/55">
            {phase.duration}
          </p>
        </div>

        {/* Title + description (6 cols) */}
        <div className="lg:col-span-6">
          <p className="font-mono text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: `${phase.color}99` }}>
            Phase {phase.number}
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white leading-[0.9] tracking-[-0.02em] mb-3">
            {phase.title}
          </h2>
          <p className="font-body text-lg text-white/30 italic mb-8">
            {phase.subtitle}
          </p>
          <p className="font-body text-[0.95rem] leading-[1.85] text-white/50">
            {phase.description}
          </p>
        </div>

        {/* Deliverables (3 cols) */}
        <div className="lg:col-span-3">
          <p className="font-mono text-[8px] tracking-[0.3em] text-white/25 uppercase mb-5">
            Deliverables
          </p>
          <ul className="space-y-3">
            {phase.deliverables.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-[5px] w-1 h-1 rounded-full flex-shrink-0" style={{ background: phase.color, opacity: 0.7 }} />
                <span className="font-mono text-[9px] tracking-[0.1em] text-white/40 leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProcessPage() {
  return (
    <main className="min-h-screen bg-void text-white overflow-x-hidden">

      {/* ── Navigation ── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-6"
        style={{ background: 'linear-gradient(to bottom, rgba(2,2,10,0.9), transparent)', backdropFilter: 'blur(12px)' }}
      >
        <Link
          href="/"
          className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase hover:text-white/75 transition-colors duration-300 cursor-none"
        >
          ← Back to Aura
        </Link>
        <Link
          href="/projects"
          className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase hover:text-white/75 transition-colors duration-300 cursor-none"
        >
          Projects →
        </Link>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="pt-40 pb-24 px-8 md:px-16 lg:px-24">
        <motion.p
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="font-mono text-[9px] tracking-[0.38em] text-gold/55 uppercase mb-6"
        >
          02 / Our Process
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-black text-white leading-[0.88] tracking-[-0.02em] mb-10"
          style={{ fontSize: 'clamp(3rem, 8vw, 8rem)' }}
        >
          Architecture<br />
          <span className="text-white/28">is a conversation.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55 }}
          className="font-body text-[1rem] leading-[1.8] text-white/40 max-w-[48ch]"
        >
          We don't deliver buildings. We deliver experiences — spaces that hold the specific
          quality of life you're reaching for. This is how we get there together,
          across five deliberate phases.
        </motion.p>
      </section>

      {/* ── Process timeline ── */}
      <section className="px-8 md:px-16 lg:px-24 pb-32">
        {PHASES.map((phase, i) => (
          <PhaseBlock key={phase.number} phase={phase} index={i} />
        ))}

        {/* Final rule */}
        <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </section>

      {/* ── CTA ── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="px-8 md:px-16 lg:px-24 pb-40"
      >
        <div
          className="rounded-3xl p-12 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-10"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div>
            <p className="font-mono text-[9px] tracking-[0.35em] text-gold/55 uppercase mb-4">
              Ready to begin?
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white leading-[0.9]">
              Let's start with<br />
              a conversation.
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/projects"
              className="px-8 py-4 font-mono text-[9px] tracking-[0.25em] uppercase text-white/55 border border-white/15 hover:border-white/40 hover:text-white/80 transition-all duration-300 cursor-none"
            >
              View Projects
            </Link>
            <a
              href="mailto:studio@aura.com"
              className="px-8 py-4 font-mono text-[9px] tracking-[0.25em] uppercase cursor-none"
              style={{ background: '#c9a84c', color: '#02020a' }}
            >
              Get in Touch →
            </a>
          </div>
        </div>
      </motion.section>

    </main>
  );
}
