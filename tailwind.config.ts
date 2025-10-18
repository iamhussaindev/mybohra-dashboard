module.exports = {
  important: true, // Makes all Tailwind utilities !important to override Ant Design
  theme: {
    extend: {
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
