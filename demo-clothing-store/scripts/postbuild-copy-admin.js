const fs = require("fs")
const path = require("path")

async function injectBranding(htmlPath, scriptPath) {
  try {
    let html = await fs.promises.readFile(htmlPath, "utf-8")
    const brandScript = await fs.promises.readFile(scriptPath, "utf-8")

    // Inject the branding script before the closing </body> tag
    html = html.replace(
      "</body>",
      `<script>${brandScript}</script></body>`
    )

    await fs.promises.writeFile(htmlPath, html, "utf-8")
    console.log('[postbuild] ✅ Injected "Zahan" branding into admin HTML.')
    return true
  } catch (error) {
    console.warn("[postbuild] ⚠️ Failed to inject branding:", error.message)
    return false
  }
}

async function copyAdminBundle() {
  const rootDir = process.cwd()
  const source = path.join(rootDir, ".medusa", "server", "public", "admin")
  const destination = path.join(rootDir, "public", "admin")

  if (!fs.existsSync(source)) {
    console.warn(
      '[postbuild] Skipping admin copy because ".medusa/client" was not found.'
    )
    return
  }

  await fs.promises.rm(destination, { recursive: true, force: true })
  await fs.promises.mkdir(path.dirname(destination), { recursive: true })
  await fs.promises.cp(source, destination, { recursive: true })

  console.log('[postbuild] Copied admin bundle to "public/admin".')

  // Copy logo to admin assets folder (accessible from admin UI)
  const logoSource = path.join(rootDir, "static", "zahan-logo.png")
  const logoDestAdminAssets = path.join(destination, "assets", "zahan-logo.png")

  try {
    if (fs.existsSync(logoSource)) {
      // Create assets directory if it doesn't exist
      await fs.promises.mkdir(path.join(destination, "assets"), { recursive: true })

      // Copy to admin assets folder
      await fs.promises.copyFile(logoSource, logoDestAdminAssets)
      console.log('[postbuild] ✅ Copied logo to admin assets folder.')
    }
  } catch (error) {
    console.warn('[postbuild] ⚠️ Failed to copy logo:', error.message)
  }

  // Inject custom branding
  const adminHtmlPath = path.join(destination, "index.html")
  const brandScriptPath = path.join(rootDir, "src", "admin", "styles", "brand-override.js")

  if (fs.existsSync(adminHtmlPath) && fs.existsSync(brandScriptPath)) {
    await injectBranding(adminHtmlPath, brandScriptPath)
  } else {
    console.warn('[postbuild] ⚠️ Branding script or HTML not found, skipping injection.')
  }
}

copyAdminBundle().catch((err) => {
  console.error("[postbuild] Failed to copy admin bundle:", err)
  process.exit(1)
})
