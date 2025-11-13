module.exports = {
  important: true, // Makes all Tailwind utilities !important to override Ant Design
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f39851',
          50: '#fff6ed',
          100: '#feead6',
          200: '#fcd1ad',
          300: '#f9b381',
          400: '#f69a5e',
          500: '#f39851',
          600: '#d97635',
          700: '#b25a27',
          800: '#8a411c',
          900: '#693013',
        },
      },
      fontFamily: {
        cf: ['CF', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: ['CF', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true, // Keep Tailwind's base styles
  },
}
