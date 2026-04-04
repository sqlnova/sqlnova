/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08090d',
        bg2: '#0f1117',
        bg3: '#161820',
        card: '#12141c',
        nova: '#4da6ff',
        nova2: '#2d8fff',
        green: '#3ecf8e',
        red: '#e5534b',
        amber: '#e8a838',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
