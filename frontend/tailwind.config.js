/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F1B2D',
          DEFAULT: '#172B4D', // Deep Navy Brand Color
          800: '#1E3A66',
          700: '#264980',
          50: '#F0F4FA',
        },
        surface: {
          bg: '#F5F7FA', // Light Background
          white: '#FFFFFF',
          border: '#E2E8F0', // Border
          secondary: '#64748B', // Secondary Text
        },
        status: {
          success: '#16A34A', // Success Green
          danger: '#DC2626', // Danger Red
          amber: '#D97706', // Half Attendance Amber
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '1px',
        md: '2px',
        lg: '4px',
        none: '0px',
      }
    },
  },
  plugins: [],
}
