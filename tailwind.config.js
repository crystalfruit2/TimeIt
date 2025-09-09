/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        work: {
          500: '#ef4444',
          600: '#dc2626',
        },
        break: {
          500: '#10b981',
          600: '#059669',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'media',
}
