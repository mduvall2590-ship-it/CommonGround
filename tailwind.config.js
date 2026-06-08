/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0D7C8C',
          'primary-hover': '#0A6A78',
          'primary-light': '#E6F4F6',
          secondary: '#2D6A4F',
          'secondary-light': '#E8F5EE',
          accent: '#E8A838',
          'accent-light': '#FEF3D6',
          energy: '#E86A5E',
          'energy-light': '#FDE8E5',
          surface: '#F5F0EB',
          'surface-card': '#FFFFFF',
          border: '#E2DCD3',
          'border-light': '#EDE8E2',
        },
        semantic: {
          success: '#38A169',
          warning: '#D69E2E',
          error: '#E53E3E',
        },
        text: {
          DEFAULT: '#4A5568',
          muted: '#8B959E',
          heading: '#1A202C',
          inverse: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['DM Serif Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.10)',
        elevated: '0 8px 24px rgba(0, 0, 0, 0.10)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { transform: 'scale(0.8)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
