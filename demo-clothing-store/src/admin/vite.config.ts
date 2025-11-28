import { defineConfig } from "vite"

/**
 * Medusa Admin dev server runs through Vite. When traffic hits through
 * Cloudflare/NGINX (`api.zahan.net`), Vite rejects it unless the host
 * is whitelisted. Allow both base domain and the www subdomain.
 */
export default defineConfig({
  server: {
    allowedHosts: ["api.zahan.net", "www.api.zahan.net"],
  },
})

