/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#1E3A8A',
          gold: '#D4AF37',
          lightBlue: '#3B82F6',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          neutral: '#6B7280',
        },
        background: {
          dark: '#0F172A',
          glass: 'rgba(255, 255, 255, 0.1)',
          overlay: 'rgba(0, 0, 0, 0.5)',
        }
      },
      backgroundColor: {
        'background-dark': '#0F172A',
      },
      textColor: {
        'primary-gold': '#D4AF37',
        'primary-blue': '#1E3A8A',
        'primary-lightBlue': '#3B82F6',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
