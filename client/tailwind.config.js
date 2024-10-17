/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  content: [
    './index.html',
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      'shittake': '#71373B',
      'white': '#ffffff',
      'black': '#000000',
      'champagne': ' #F7E7CE',
      'gray': '#D3D3D3'
    },
    extend: {
      fontFamily:{
        cormorant : ["Cormorant Garamond", ...defaultTheme.fontFamily.serif]
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}

