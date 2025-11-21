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
        // Royal Blue (Primary)
        royal: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Royal Blue Base
          600: '#2563eb', // Royal Blue Primary
          700: '#1d4ed8', // Royal Blue Dark
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Purple (Secondary)
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc', // Purple Base
          500: '#a855f7', // Purple Primary
          600: '#9333ea', // Purple Dark
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        // Silver (Accent)
        silver: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e8e8f0', // Silver Light
          300: '#c0c0d0', // Silver Base
          400: '#9090a0', // Silver Medium
          500: '#606070', // Silver Dark
          600: '#4a4a5a',
          700: '#3a3a4a',
          800: '#2a2a3a',
          900: '#1a1a2a',
        },
        // Dark Theme (for dark mode) - Enhanced for better contrast
        dark: {
          base: '#05050A', // Deeper black/navy for maximum contrast
          surface: '#0F111A', // Lighter for cards - critical for depth
          elevated: '#1A1D2D', // For hover states
          overlay: '#0F0F15',
        },
        // Light Theme (for light mode)
        light: {
          base: '#FFFFFF',
          surface: '#F8F9FA',
          elevated: '#F1F3F5',
          overlay: '#E8E8F0',
        },
        // Text Hierarchy - Theme-aware for light and dark modes
        text: {
          primary: '#1A1A2A', // Dark text for light mode, overridden in dark mode
          secondary: '#4A4A5A', // Medium dark for light mode
          tertiary: '#6B6B7F', // Muted for light mode
          disabled: '#9090A0', // Disabled state
        },
        // Legacy support
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Royal Blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Purple
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'shimmer': 'linear-gradient(135deg, rgba(232, 232, 240, 0.1) 0%, rgba(192, 192, 208, 0.2) 50%, rgba(144, 144, 160, 0.1) 100%)',
        'shimmer-strong': 'linear-gradient(135deg, rgba(232, 232, 240, 0.3) 0%, rgba(192, 192, 208, 0.5) 50%, rgba(144, 144, 160, 0.3) 100%)',
        'silver-gradient': 'linear-gradient(135deg, #E8E8F0 0%, #C0C0D0 50%, #9090A0 100%)',
        'royal-gradient': 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
        'purple-gradient': 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7e22ce 100%)',
        'brand-gradient': 'linear-gradient(135deg, #2563eb 0%, #a855f7 50%, #c0c0d0 100%)',
        'glass': 'linear-gradient(135deg, rgba(17, 17, 24, 0.8) 0%, rgba(26, 26, 36, 0.6) 100%)',
        'glass-light': 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.6) 100%)',
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
