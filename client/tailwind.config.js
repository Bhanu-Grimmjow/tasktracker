/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#b91c1c', dark: '#7f1d1d', light: '#fca5a5' },
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
