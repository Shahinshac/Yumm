/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#d24200',
        'on-surface': '#281812',
        'on-surface-variant': '#5c4037',
        surface: '#fff8f6',
        'surface-container': '#ffe9e3',
        'outline-variant': '#e5beb2',
        charcoal: '#281812',
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
