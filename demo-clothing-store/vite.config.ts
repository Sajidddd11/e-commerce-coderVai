import { defineConfig } from "vite"

/**
 * Allow dev server traffic forwarded through Cloudflare → api.zahan.net.
 * Without this, Vite blocks requests whose Host header is not localhost.
 */
export default defineConfig({
  server: {
    allowedHosts: ["api.zahan.net", "www.api.zahan.net"],
  },
})

