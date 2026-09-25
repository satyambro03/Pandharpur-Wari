/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        heading: ['Poppins', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      colors: {
        wari: {
          saffron: '#FF7A00',
          maroon: '#7A1F1F',
          gold: '#FFC947',
          bg: '#FFF8F0',
          surface: '#FFFFFF',
          text: '#1F1B16',
          'text-secondary': '#6B615A',
          border: '#E7DFD6',
          sos: '#DC2626',
          success: '#16A34A',
        },
        zone: {
          green: '#22C55E',
          orange: '#F97316',
          red: '#EF4444',
        },
      },
      animation: {
        'sos-pulse': 'sosPulse 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out forwards',
        'bounce-in': 'bounceIn 0.4s ease-out forwards',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'marquee': 'marquee 20s linear infinite',
      },
      keyframes: {
        sosPulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.5)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 16px rgba(220, 38, 38, 0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '60%': { opacity: '1', transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      screens: {
        'xs': '420px',
      },
    },
  },
  plugins: [],
};
