/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          dark: '#0c0e14',
          sidebar: '#121620',
          card: '#181d2a',
          border: '#23293b',
        }
      }
    },
  },
  plugins: [],
}
