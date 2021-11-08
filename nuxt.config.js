export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',
  ssr: false,
  env: {
    isLocalPointClouds: process.env.LOCAL_POINTCLUDS || false,
    pointsBudget: process.env.POINTS_BUDGET || 3000000
  },
  // Netlify options
  generate: {
    fallback: true
  },
  // Debug local server from outside
  server: {
    host: 'localhost' // default: localhost // (host: '0' ...is not working for everyone)
  },
  watch: ['api'],
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'via-appia-viewer',
    htmlAttrs: {
      lang: 'en',
      'data-theme': 'dark' // https://daisyui.com/docs/default-themes
    },
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        hid: 'description',
        name: 'description',
        content: ''
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', type: 'text/css', href: '/Potree_1.8/build/potree/potree.css' },
      { rel: 'stylesheet', type: 'text/css', href: '/Potree_1.8/libs/jquery-ui/jquery-ui.min.css' },
      { rel: 'stylesheet', type: 'text/css', href: '/Potree_1.8/libs/openlayers3/ol.css' },
      { rel: 'stylesheet', type: 'text/css', href: '/Potree_1.8/libs/spectrum/spectrum.css' },
      { rel: 'stylesheet', type: 'text/css', href: '/Potree_1.8/libs/jstree/themes/mixed/style.css' }
    ],

    script: [
      { src: '/Potree_1.8/libs/jquery/jquery-3.1.1.min.js' },
      { src: '/Potree_1.8/libs/spectrum/spectrum.js' },
      { src: '/Potree_1.8/libs/jquery-ui/jquery-ui.min.js' },
      { src: '/Potree_1.8/libs/other/BinaryHeap.js' },
      { src: '/Potree_1.8/libs/tween/tween.min.js' },
      { src: '/Potree_1.8/libs/d3/d3.js' },
      { src: '/Potree_1.8/libs/proj4/proj4.js' },
      { src: '/Potree_1.8/libs/openlayers3/ol.js' },
      { src: '/Potree_1.8/libs/i18next/i18next.js' },
      { src: '/Potree_1.8/libs/jstree/jstree.js' },
      { src: '/Potree_1.8/libs/plasio/js/laslaz.js' },
      { src: '/Potree_1.8/build/potree/potree.js' },
      { src: '/Potree_1.8/libs/three.js/build/three.js' }

      // { src: '/Potree_1.8/libs/jquery/jquery-3.1.1.min.js' },
      // { src: '/Potree_1.8/libs/proj4/proj4.js' },
      // { src: '/Potree_1.8/libs/three.js/build/three.min.js' },
      // { src: '/Potree_1.8/build/potree/potree.js' }

      // { src: '/Potree_1.8/libs/spectrum/spectrum.js' },
      // { src: '/Potree_1.8/libs/jquery-ui/jquery-ui.min.js' },
      // { src: '/Potree_1.8/libs/three.interaction.0.2.3.js' },
      // { src: '/Potree_1.8/libs/other/BinaryHeap.js' },
      // { src: '/Potree_1.8/libs/tween/tween.min.js' },
      // { src: '/Potree_1.8/libs/d3/d3.js' },
      // { src: '/Potree_1.8/libs/openlayers3/ol.js' },
      // { src: '/Potree_1.8/libs/ci18next/i18next.js' },
      // { src: '/Potree_1.8/libs/jstree/jstree.js' },
      // { src: '/Potree_1.8/build/potree/potree.js' },
      // { src: '/Potree_1.8/libs/plasio/js/laslaz.js' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/css/styles.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxtjs/composition-api/module'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/content
    '@nuxt/content'
  ],

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // Listen to changes outside Nuxt default folders
    hotMiddleware: {
      client: {
        // overlay: false // Disable Nuxt Black Screen ESLint
      }
    }
  }
}
