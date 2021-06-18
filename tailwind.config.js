module.exports = {
  mode: 'jit',
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography')
  ],
  daisyui: {},
  theme: {
    container: {
      center: true,
      padding: '1.5rem'
    }
  }
}
