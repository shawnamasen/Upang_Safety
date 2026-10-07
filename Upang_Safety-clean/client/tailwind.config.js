/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'upang-green': '#2DB558',
        'upang-dark-green': '#288148',
      },
    },
  },
  plugins: [],
}