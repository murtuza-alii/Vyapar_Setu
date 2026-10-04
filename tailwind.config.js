/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wholesale: {
          dark: '#090D16',       // Deepest background
          card: '#0F172A',       // Elevated surface cards
          border: '#1E293B',     // Subtle partition borders
          hover: '#334155',      // Active row/card hover
          slate: {
            950: '#090D16',
            900: '#0F172A',
            800: '#1E293B',
            700: '#334155',
          },
          indigo: {
            DEFAULT: '#6366F1',
            deep: '#1E1B4B',
            glow: '#4338CA',
          },
          amber: {
            DEFAULT: '#F59E0B',  // Dalali Brass / Primary Accent
            brass: '#D97706',
            dark: '#78350F',
            light: '#FDE68A',
          },
          emerald: {
            DEFAULT: '#10B981',  // Surplus / Settled / Profit >= 5%
            dark: '#064E3B',
            light: '#A7F3D0',
          },
          ruby: {
            DEFAULT: '#EF4444',  // Dues 30+ days / Risk / Deficit
            dark: '#7F1D1D',
            light: '#FECACA',
          },
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Noto Sans Devanagari', '-apple-system', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'wholesale-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(30, 41, 59, 0.5)',
        'wholesale-glow': '0 0 15px -3px rgba(245, 158, 11, 0.25)',
      },
    },
  },
  plugins: [],
};
