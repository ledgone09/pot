/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          500: '#0ea5e9',
          600: '#0284c7',
        },
        accent: {
          500: '#f59e0b',
          600: '#d97706',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          500: '#f97316',
          600: '#ea580c',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'countdown-pulse': 'countdown-pulse 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'confetti': 'confetti 3s ease-out forwards',
        'winner-glow': 'winner-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            transform: 'scale(1)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
          },
          '50%': { 
            transform: 'scale(1.05)',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)'
          },
        },
        'countdown-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100vh) rotate(360deg)', opacity: '0' },
        },
        'winner-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.6)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 60px rgba(245, 158, 11, 1)',
            transform: 'scale(1.02)'
          },
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