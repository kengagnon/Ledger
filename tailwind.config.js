/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#006052',
          'teal-dark': '#004D42',
          green: '#00A57D',
          blue: '#009EDE',
          lime: '#97D162',
        },
        ink: '#0A2E27',
        paper: '#FCFCFA',
        hairline: '#E6E4DD',
        txt: {
          primary: '#1A1F1D',
          secondary: '#5C645F',
          tertiary: '#9AA29C',
        },
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Schibsted Grotesk', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['Spline Sans Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        sheet: '0 24px 80px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
}
