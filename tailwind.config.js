/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#a83300', // Haute Cuisine Primary
        'primary-container': '#d24200',
        'on-surface': '#281812',
        'on-surface-variant': '#5c4037',
        surface: '#fff8f6',
        'surface-container': '#ffe9e3',
        'surface-container-highest': '#fbdcd3',
        'outline-variant': '#e5beb2',
        charcoal: '#1A1A1B', // Premium Charcoal from Stitch
        emerald: {
          500: '#10b981',
          600: '#059669',
        }
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
