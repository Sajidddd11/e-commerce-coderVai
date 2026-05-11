const { defineConfig } = require("vite")

/**
 * Allow dev server traffic forwarded through Cloudflare → api.al-aria.com.
 * Without this, Vite blocks requests whose Host header is not localhost.
 */
module.exports = defineConfig({
  server: {
    allowedHosts: ["api.al-aria.com", "www.api.al-aria.com", "api.al-aria.com", "www.api.al-aria.com"],
  },
})

