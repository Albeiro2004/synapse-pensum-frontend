/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        slate: {
          950: '#0B0F19',
          900: '#0F1625',
          850: '#131B2E',
          800: '#1A2236',
          700: '#243047',
          600: '#3A4A6B',
          500: '#5B6E94',
          400: '#8496B8',
          300: '#B0BCCE',
          200: '#D4DAE8',
          100: '#EEF1F7',
        },
        aprobada: { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#064E3B' },
        disponible: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#78350F' },
        bloqueada: { DEFAULT: '#475569', light: '#E2E8F0', dark: '#1E293B' },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(16,185,129,0.25)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
