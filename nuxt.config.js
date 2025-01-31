import cp from 'child_process';

export default {
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  target: 'static',
  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    title: 'JusDeFi Staking Dashboard',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'JusDeFi Staking Dashboard' || '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/logox4.ico' },
    ],
    script: [
      { src: 'https://unpkg.com/@metamask/detect-provider/dist/detect-provider.min.js' },
    ],
  },
  /*
  ** Global CSS
  */
  css: [
    '~/assets/css/main.scss',
  ],
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [
  ],
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: false,
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    // '@nuxtjs/eslint-module'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/modules/tree/master/packages/bulma
    '@nuxtjs/bulma',
  ],
  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
    postcss: {
      preset: {
        features: {
          customProperties: false,
        },
      },
    },
  },

  hooks: {
    generate: {
      before: function () {
        cp.execSync('yarn licenses generate-disclaimer --silent > static/licenses.txt');
      },
    },
  },
};
