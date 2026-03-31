/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        heading: ['Montserrat', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      colors: {
        brand: {
          black: '#100f0f',
          dark: '#1a1917',
          charcoal: '#2a2826',
          bronze: '#9f8b6b',
          'bronze-light': '#c4aa85',
          'bronze-dark': '#7a6a50',
          warm: '#f7f8f7',
          offwhite: '#ede9e3',
          muted: '#9a9690',
        }
      },
      letterSpacing: {
        'display': '0.25em',
        'widest': '0.3em',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
