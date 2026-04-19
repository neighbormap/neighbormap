import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // App design tokens (mirrored from Flutter AppColors in lib/config/theme.dart)
        verde: '#0EC48A',
        inchiostro: '#0F0E0C',
        pietra: '#9A938A',
        surface: '#F5F4F2',
        coral: '#E8360E',
        giallo: '#FFD23F',
        blu: '#101FFF',
        'score-high': '#0EC48A', // == verde
        'score-mid': '#E5A000',
        'score-low': '#E8360E',  // == coral
        'for-you': '#534AB7',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        pill: '8px',
        card: '14px',
        sheet: '20px',
      },
    },
  },
  plugins: [],
};

export default config;