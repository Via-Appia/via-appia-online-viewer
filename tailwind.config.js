const DEFAULT_TEXT_COLOR = 'rgba(255,255,255,0.8)'

export default {
  mode: 'jit',
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography')
  ],
  theme: {
    extend: {
      // Tailwindcss Typography's plugin modify color
      typography: {
        DEFAULT: {
          css: {
            color: DEFAULT_TEXT_COLOR,
            h1: { color: DEFAULT_TEXT_COLOR },
            h2: { color: DEFAULT_TEXT_COLOR },
            h3: { color: DEFAULT_TEXT_COLOR },
            h4: { color: DEFAULT_TEXT_COLOR },
            h5: { color: DEFAULT_TEXT_COLOR },
            h6: { color: DEFAULT_TEXT_COLOR },
            strong: { color: DEFAULT_TEXT_COLOR },
            a: {
              color: '#FD0',
              '&:hover': {
                color: '#FFA700'
              }
            }
          }
        }
      }
    },
    container: {
      center: true,
      padding: '1.5rem'
    }
  }
}
