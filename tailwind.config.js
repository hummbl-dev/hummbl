/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HUMMBL Brand Colors (Green Theme)
        primary: {
          50: '#E8FAF3',
          100: '#C7F3E0',
          200: '#95E7C8',
          300: '#5DD7AB',
          400: '#2EBD85',
          500: '#1E8B5F', // Main brand emerald
          600: '#0F5E3C', // rpbx deep green
          700: '#0D4A2F',
          800: '#0A3723',
          900: '#0A1410', // Darkest base
        },
        // Mental Model Transformation Colors
        transformation: {
          perspective: {
            light: '#5EEAD4',
            DEFAULT: '#14B8A6',
            dark: '#0F766E',
          },
          inversion: {
            light: '#C084FC',
            DEFAULT: '#9333EA',
            dark: '#6B21A8',
          },
          composition: {
            light: '#FB923C',
            DEFAULT: '#EA580C',
            dark: '#C2410C',
          },
          decomposition: {
            light: '#38BDF8',
            DEFAULT: '#0284C7',
            dark: '#075985',
          },
          recursion: {
            light: '#F9A8D4',
            DEFAULT: '#EC4899',
            dark: '#BE185D',
          },
          systems: {
            light: '#FCD34D',
            DEFAULT: '#F59E0B',
            dark: '#D97706',
          },
        },
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'transformation-perspective': '0 10px 15px -3px rgba(20, 184, 166, 0.2)',
        'transformation-inversion': '0 10px 15px -3px rgba(147, 51, 234, 0.2)',
        'transformation-composition': '0 10px 15px -3px rgba(234, 88, 12, 0.2)',
        'transformation-decomposition': '0 10px 15px -3px rgba(2, 132, 199, 0.2)',
        'transformation-recursion': '0 10px 15px -3px rgba(236, 72, 153, 0.2)',
        'transformation-systems': '0 10px 15px -3px rgba(245, 158, 11, 0.2)',
      },
    },
  },
  plugins: [],
}
