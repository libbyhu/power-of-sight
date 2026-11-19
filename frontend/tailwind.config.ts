import type { Config } from 'tailwindcss';

// Design tokens for Power of Sight (用眼睛發力).
// Refined toward "warm old bookshop / vintage printed book" — aged
// paper rather than clean white, ink that reads as brown-black rather
// than neutral gray, a muted botanical green for interactive accents
// (book-cloth green, not a SaaS teal), and a soft brick-red reserved
// for the heart rating. No bright colors, no gradients, no shadows —
// flatness and warm neutrals carry the "old book" feeling.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6EFDF',
        'paper-dim': '#EBE0C6',
        ink: '#2C2418',
        'ink-soft': '#6E624C',
        teal: {
          DEFAULT: '#3B5941',
          dark: '#2A4130',
        },
        heart: '#A34438',
        line: '#DED0AC',
      },
      fontFamily: {
        serif: ['"Noto Serif TC"', '"Source Serif 4"', 'serif'],
        sans: ['"Noto Sans TC"', '"Inter"', 'sans-serif'],
      },
      borderRadius: {
        card: '6px',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
