/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // ── Color palette ──────────────────────────────────────────────────
      colors: {
        void:  '#02020a',     // Deepest background — near black with blue cast
        gold:  '#c9a84c',     // Primary accent — warm, editorial gold
        ivory: '#f5f0e8',     // Light text / inverted sections
        smoke: '#8a8a9a',     // Secondary text
        ember: '#d4813a',     // Warm projects accent
        frost: '#4a93b8',     // Cool projects accent
      },

      // ── Typography ────────────────────────────────────────────────────
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)',    'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono',      'Menlo',     'monospace'],
      },

      // ── Font weights ──────────────────────────────────────────────────
      fontWeight: {
        900: '900',
      },

      // ── Spacing ───────────────────────────────────────────────────────
      spacing: {
        '18':  '4.5rem',
        '22':  '5.5rem',
        '88':  '22rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ── Animation ─────────────────────────────────────────────────────
      transitionTimingFunction: {
        'expo-out':   'cubic-bezier(0.16, 1, 0.3, 1)',
        'expo-in':    'cubic-bezier(0.7, 0, 0.84, 0)',
        'expo-inout': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },

      transitionDuration: {
        400:  '400ms',
        600:  '600ms',
        800:  '800ms',
        1200: '1200ms',
      },

      // ── Blur ──────────────────────────────────────────────────────────
      backdropBlur: {
        '2xs': '2px',
        xs:    '4px',
      },

      // ── Z-index ───────────────────────────────────────────────────────
      zIndex: {
        60:   60,
        70:   70,
        9998: 9998,
        9999: 9999,
      },
    },
  },
  plugins: [],
};
