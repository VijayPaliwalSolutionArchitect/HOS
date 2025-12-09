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
        // Light theme
        'light-bg': '#ffffff',
        'light-text': '#1a202c',
        'light-primary': '#3b82f6',
        'light-secondary': '#8b5cf6',
        'light-accent': '#06b6d4',
        
        // Dark theme
        'dark-bg': '#0f172a',
        'dark-text': '#f1f5f9',
        'dark-primary': '#60a5fa',
        'dark-secondary': '#a78bfa',
        'dark-accent': '#22d3ee',
        
        // Ocean theme
        'ocean-bg': '#e0f2fe',
        'ocean-text': '#0c4a6e',
        'ocean-primary': '#0284c7',
        'ocean-secondary': '#0ea5e9',
        'ocean-accent': '#06b6d4',
        
        // Sunset theme
        'sunset-bg': '#fef3c7',
        'sunset-text': '#78350f',
        'sunset-primary': '#f59e0b',
        'sunset-secondary': '#ef4444',
        'sunset-accent': '#ec4899',
        
        // Forest theme
        'forest-bg': '#f0fdf4',
        'forest-text': '#14532d',
        'forest-primary': '#16a34a',
        'forest-secondary': '#84cc16',
        'forest-accent': '#22c55e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
