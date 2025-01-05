/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        customBlack: '#24272E',
        darkGray: '#15181A',
        lightGray: '#1B1E22',
        upvoteGray: ''
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp')
  ],
}

