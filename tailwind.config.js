/** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // This enables the class-based dark mode
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

// module.exports = {
//   content: [
//     // ... other entries
//     "./src//*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         'purple-900': '#4c1d95',
//       },
//     },
//   },
//   plugins: [
//     require('@tailwindcss/forms'),
//     require('tailwindcss-filters'),
//   ],
// };
