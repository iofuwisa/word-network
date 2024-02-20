// https://nuxt.com/docs/api/configuration/nuxt-config

import urlJoin from 'url-join';

const API_URL = process.env.API_URL || "http://localhost:8000"
const API_PROXY_TARGET_URL = urlJoin(process.env.API_URL || "http://localhost:8000", "**")

console.log("NODE_ENV", process.env.NODE_ENV)
console.log("API_URL", process.env.API_URL)

export default defineNuxtConfig({
  ssr: false,
  modules: ['nuxt-icons', '@nuxt/ui'],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      API_URL: API_URL
    }
  },
  nitro: {
    routeRules: {
      '/api/**': {
        proxy: API_PROXY_TARGET_URL,
      },
    },
  },
})