module.exports = {
  important: true, // Makes all Tailwind utilities !important to override Ant Design
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#AB0256',
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#AB0256',
          600: '#9B024D',
          700: '#8B0144',
          800: '#7B013B',
          900: '#6B0132',
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
