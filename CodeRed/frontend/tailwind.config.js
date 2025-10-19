/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-green': '#1a6734ff',
        'custom-dark': '#0F1913',
        // Add your custom colors here
      }
    },
  },
  plugins: [],
}
