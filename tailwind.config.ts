import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        canvas: {
          DEFAULT: '#0a0a0f',
          lighter: '#111118',
          light: '#1a1a24',
        },
        panel: {
          DEFAULT: '#111118',
          border: '#2a2a35',
        },
        // Node state colors - Standard
        node: {
          susceptible: '#3b82f6',
          infected: '#ef4444',
          recovered: '#22c55e',
          deceased: '#6b7280',
          vaccinated: '#a855f7',
          healthy: '#3b82f6',
          stressed: '#f59e0b',
          distressed: '#ef4444',
          defaulted: '#6b7280',
          bailedOut: '#a855f7',
        },
        // Color blind safe palette (Paul Tol)
        'cb-safe': {
          susceptible: '#4477AA',
          infected: '#EE6677',
          recovered: '#228833',
          deceased: '#BBBBBB',
          vaccinated: '#AA3377',
          healthy: '#4477AA',
          stressed: '#CCBB44',
          distressed: '#EE6677',
          defaulted: '#BBBBBB',
          bailedOut: '#AA3377',
        },
        accent: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          glow: 'rgba(99, 102, 241, 0.4)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
        'cascade-ripple': 'cascade-ripple 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px var(--glow-color))' },
          '50%': { filter: 'drop-shadow(0 0 16px var(--glow-color))' },
        },
        'cascade-ripple': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-infected': '0 0 20px rgba(239, 68, 68, 0.6)',
        'glow-distressed': '0 0 20px rgba(239, 68, 68, 0.6)',
        'glow-stressed': '0 0 15px rgba(245, 158, 11, 0.5)',
        'panel': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
