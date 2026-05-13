/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wimbledon: {
          green: '#006633',
          purple: '#4B0082',
          gold: '#FFD700'
        }
      }
    },
  },
  plugins: [],
}