module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    'no-console': 'off',
    'brace-style': ['warn', 'stroustrup']
  },
  globals: {
    $: true,
    window: true,
    THREE: true,
    Potree: true,
    TWEEN: true
  }
}
