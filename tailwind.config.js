/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jade: '#0f7a65',
        teal: {
          light: '#3ec6a8',
          DEFAULT: '#3ec6a8',
        },
        mint: '#f4fffb',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 10px 25px -5px rgba(62, 198, 168, 0.4), 0 8px 10px -6px rgba(62, 198, 168, 0.1)',
      }
    },
  },
  plugins: [],
}
