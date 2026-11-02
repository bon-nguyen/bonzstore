import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/providers/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        main: ['var(--font-main)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        storybook: ['var(--nk-font-storybook)', 'serif'],
      },
      colors: {
        kw: {
          pink: 'var(--kw-pastel-pink)',
          'pink-dark': 'var(--kw-pastel-pink-dark)',
          blue: 'var(--kw-pastel-blue)',
          purple: 'var(--kw-pastel-purple)',
          yellow: 'var(--kw-pastel-yellow)',
          mint: 'var(--kw-pastel-mint)',
          cream: 'var(--kw-cream)',
          dark: 'var(--kw-text-dark)',
          muted: 'var(--kw-text-muted)',
          surface: 'var(--surface-base)',
          card: 'var(--surface-card)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          border: 'var(--kw-border-color)',
        },
      },
      boxShadow: {
        'kw-hard': '4px 4px 0px var(--kw-border-color)',
        'kw-hard-sm': '2px 2px 0px #4A3E3D',
        'kw-hard-md': '5px 5px 0px #4A3E3D',
        'kw-hard-lg': '8px 8px 0px #4A3E3D',
        'kw-pastel': '4px 4px 0px #FFB5C2',
        'kw-pop': '0 6px 0 #4A3E3D, 0 10px 20px rgba(74, 62, 61, 0.15)',
      },
      borderRadius: {
        'kw-sm': '12px',
        'kw-md': '20px',
        'kw-lg': '30px',
        'kw-pill': '9999px',
        'kw-hand': '28px 18px 26px 20px',
      },
      keyframes: {
        kwAtmDrift: {
          '0%, 100%': { transform: 'translate3d(-4%, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(4%, -8px, 0) scale(1.03)' },
        },
        kwAtmTwinkle: {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        dustFloat: {
          '0%, 100%': {
            transform: 'translateY(0) translateX(0) rotate(0deg)',
            opacity: '0.35',
          },
          '50%': {
            transform: 'translateY(-14px) translateX(8px) rotate(12deg)',
            opacity: '0.85',
          },
        },
        wheelSpin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        radarSweep: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        diaryWrite: {
          '0%': { strokeDashoffset: '320' },
          '100%': { strokeDashoffset: '0' },
        },
        diaryPen: {
          '0%': { transform: 'translate(-220px, 6px) rotate(-14deg)' },
          '50%': { transform: 'translate(-100px, -4px) rotate(-8deg)' },
          '100%': { transform: 'translate(0px, 0px) rotate(-12deg)' },
        },
        pilotWave: {
          '0%, 100%': { transform: 'rotate(-6deg)' },
          '50%': { transform: 'rotate(12deg)' },
        },
        islandBob: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        heartBurst: {
          '0%': { transform: 'scale(0.7)' },
          '45%': { transform: 'scale(1.28)' },
          '75%': { transform: 'scale(0.92)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'atm-drift': 'kwAtmDrift 18s ease-in-out infinite',
        'atm-drift-reverse': 'kwAtmDrift 24s ease-in-out 2s infinite reverse',
        'atm-twinkle': 'kwAtmTwinkle 3.4s ease-in-out infinite',
        'dust-float': 'dustFloat 5.5s ease-in-out infinite',
        'wheel-spin': 'wheelSpin 4.5s linear infinite',
        'radar-sweep': 'radarSweep 3.6s linear infinite',
        'diary-write': 'diaryWrite 2.4s ease-out forwards',
        'diary-pen': 'diaryPen 2.4s ease-out forwards',
        'pilot-wave': 'pilotWave 2.2s ease-in-out infinite',
        'island-bob': 'islandBob 4.5s ease-in-out infinite',
        'heart-burst': 'heartBurst 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
