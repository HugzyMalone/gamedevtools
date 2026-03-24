/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: '#0F0F23',
        card: '#1E1C35',
        accent: '#7C3AED',
        secondary: '#F43F5E',
        tertiary: '#10B981',
        light: '#E2E8F0',
        muted: '#94A3B8',
        border: '#4C1D95',
        ring: '#7C3AED',
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['JetBrains Mono', 'monospace'],
        sans: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(124, 58, 237, 0.3)',
        'glow-lg': '0 0 30px rgba(124, 58, 237, 0.4)',
        'glow-secondary': '0 0 15px rgba(244, 63, 94, 0.3)',
        'glow-tertiary': '0 0 15px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(124, 58, 237, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(124, 58, 237, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
