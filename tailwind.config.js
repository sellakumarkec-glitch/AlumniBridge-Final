/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef6ff', 100: '#d9ecff', 200: '#bcdeff', 300: '#8ec8ff',
          400: '#59a8ff', 500: '#3385ff', 600: '#1c66f5', 700: '#1551e1',
          800: '#1843b6', 900: '#1a3c8f', 950: '#152656',
        },
        ink: {
          50: '#f6f7f9', 100: '#eceef2', 200: '#d5dae2', 300: '#b0bac8',
          400: '#8595aa', 500: '#667891', 600: '#51607a', 700: '#434f63',
          800: '#3a4453', 900: '#333a47', 950: '#1f242e',
        },
        accent: { 400: '#f59e0b', 500: '#f59e0b', 600: '#d97706' },
        success: { 500: '#10b981', 600: '#059669' },
        warning: { 500: '#f59e0b', 600: '#d97706' },
        error: { 500: '#ef4444', 600: '#dc2626' },
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(15, 23, 42, 0.08), 0 4px 16px -4px rgba(15, 23, 42, 0.06)',
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px -8px rgba(15, 23, 42, 0.10)',
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem', '3xl': '1.75rem' },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
