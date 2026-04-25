/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0C10',
        surface: '#12151C',
        'surface-2': '#181B24',
        border: '#1E2330',
        gold: '#C9A84C',
        'gold-light': '#E8C97A',
        'gold-dark': '#A87C2E',
        'off-white': '#F5F5F0',
        muted: '#6B7280',
        success: '#2ECC71',
        danger: '#E74C3C',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        'gold-glow': '0 0 20px rgba(201, 168, 76, 0.15)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(201, 168, 76, 0.2)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #C9A84C 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #C9A84C 0%, #E8C97A 25%, #F5D98A 50%, #E8C97A 75%, #C9A84C 100%)',
        'surface-gradient': 'linear-gradient(180deg, #12151C 0%, #0A0C10 100%)',
        'mesh-bg': 'radial-gradient(at 20% 30%, rgba(201, 168, 76, 0.06) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(30, 35, 48, 0.8) 0px, transparent 50%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        shimmer: 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 168, 76, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(201, 168, 76, 0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
