const { defineConfig } = require("vite")
const fs = require("fs")
const path = require("path")

/**
 * Medusa Admin dev server runs through Vite. When traffic hits through
 * Cloudflare/NGINX (`api.zahan.net`), Vite rejects it unless the host
 * is whitelisted. Allow both base domain and the www subdomain.
 * 
 * Also injects custom branding script to replace "Medusa" with "Zahan"
 */
module.exports = defineConfig({
  server: {
    allowedHosts: ["api.zahan.net", "www.api.zahan.net"],
  },
  plugins: [
    {
      name: "inject-branding",
      transformIndexHtml(html: string) {
        // Read the custom branding script
        const scriptPath = path.resolve(__dirname, "styles", "brand-override.js")
        let brandScript = ""

        try {
          brandScript = fs.readFileSync(scriptPath, "utf-8")
        } catch (error) {
          console.warn("Custom branding script not found, skipping injection")
          return html
        }

        // Inject the script at the end of the body
        return html.replace(
          "</body>",
          `<script>${brandScript}</script></body>`
        )
      },
    },
  ],
})

