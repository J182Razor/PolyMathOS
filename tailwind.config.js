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
        // Primary Brand Colors
        'poly-primary': {
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
        // Secondary (Intelligence/Academic)
        'poly-secondary': {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Accent (Computational/Technical)
        'poly-accent': {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Neutrals
        'poly-neutral': {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Semantic Colors
        'poly-success': '#10b981',
        'poly-warning': '#f59e0b',
        'poly-error': '#ef4444',
        'poly-info': '#0ea5e9',

        // Semantic definitions mapping to CSS variables
        // These must match what is used in index.css @apply
        'poly-bg-primary': 'var(--poly-bg-primary)',
        'poly-bg-secondary': 'var(--poly-bg-secondary)',
        'poly-bg-tertiary': 'var(--poly-bg-tertiary)',
        
        'poly-text-primary': 'var(--poly-text-primary)',
        'poly-text-secondary': 'var(--poly-text-secondary)',
        'poly-text-tertiary': 'var(--poly-text-tertiary)',
        'poly-text-disabled': 'var(--poly-text-disabled)',
        
        'poly-border-primary': 'var(--poly-border-primary)',
        'poly-border-secondary': 'var(--poly-border-secondary)',
        
        'poly-ring-primary': 'rgba(14, 165, 233, 0.3)',

        // Legacy support mapping
        royal: {
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
          950: '#082f49',
        },
        silver: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Dark Theme (for dark mode)
        dark: {
          base: '#0a0a0a',
          surface: '#171717',
          elevated: '#262626',
          overlay: '#0a0a0a',
        },
        // Light Theme (for light mode)
        light: {
          base: '#ffffff',
          surface: '#fafafa',
          elevated: '#f5f5f5',
          overlay: '#e5e5e5',
        },
        // Text Hierarchy
        text: {
          primary: '#171717',
          secondary: '#404040',
          tertiary: '#737373',
          disabled: '#a3a3a3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Text', 'Helvetica Neue', 'sans-serif'],
        display: ['Inter', 'SF Pro Display', 'Helvetica Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'monospace'],
      },
      fontSize: {
        'display-1': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-2': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-3': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-1': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-2': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        'body-large': ['1.125rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-medium': ['1rem', { lineHeight: '1.55', fontWeight: '400' }],
        'body-small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
        'code': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
      },
      boxShadow: {
        'poly-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'poly-md': '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
        'poly-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'poly-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'poly-primary': '0 4px 12px rgba(14, 165, 233, 0.25)',
        'poly-glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'poly-gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        'poly-gradient-hover': 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      },
      animation: {
        'poly-fade-in': 'polyFadeIn 0.3s ease forwards',
      },
      keyframes: {
        polyFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}