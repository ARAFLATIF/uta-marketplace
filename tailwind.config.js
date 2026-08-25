/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        mavs: {
          blue: '#0064B1',
          navy: '#003B6F',
          orange: '#F5811F',
          cream: '#FAF7F0',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
