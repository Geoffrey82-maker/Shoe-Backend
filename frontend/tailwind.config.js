/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body:     ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#E8441A', dark: '#C9320F', light: '#FF6B45' },
      },
      transitionDuration: { 250: '250ms', 400: '400ms' },
    },
  },
  plugins: [],
};
