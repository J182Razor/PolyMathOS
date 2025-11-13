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
        // Dark Minimalist Theme
        dark: {
          base: '#0A0A0F',
          surface: '#111118',
          elevated: '#1A1A24',
          overlay: '#0F0F15',
        },
        // Silver Accent System
        silver: {
          light: '#E8E8F0',
          base: '#C0C0D0',
          medium: '#9090A0',
          dark: '#606070',
        },
        // Text Hierarchy
        text: {
          primary: '#FFFFFF',
          secondary: '#B8B8C8',
          tertiary: '#6B6B7F',
          disabled: '#3A3A4A',
        },
        // Legacy support (keeping for gradual migration)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'shimmer': 'linear-gradient(135deg, rgba(232, 232, 240, 0.1) 0%, rgba(192, 192, 208, 0.2) 50%, rgba(144, 144, 160, 0.1) 100%)',
        'shimmer-strong': 'linear-gradient(135deg, rgba(232, 232, 240, 0.3) 0%, rgba(192, 192, 208, 0.5) 50%, rgba(144, 144, 160, 0.3) 100%)',
        'silver-gradient': 'linear-gradient(135deg, #E8E8F0 0%, #C0C0D0 50%, #9090A0 100%)',
        'glass': 'linear-gradient(135deg, rgba(17, 17, 24, 0.8) 0%, rgba(26, 26, 36, 0.6) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'silver': '0 0 20px rgba(192, 192, 208, 0.2)',
        'silver-lg': '0 0 40px rgba(192, 192, 208, 0.3)',
        'silver-xl': '0 0 60px rgba(192, 192, 208, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer-fast': 'shimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-shimmer': 'borderShimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'text-shimmer': 'textShimmer 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        borderShimmer: {
          '0%, 100%': { borderColor: 'rgba(192, 192, 208, 0.3)' },
          '50%': { borderColor: 'rgba(232, 232, 240, 0.8)' },
        },
        textShimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(192, 192, 208, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(232, 232, 240, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
