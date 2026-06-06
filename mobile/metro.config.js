// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require("expo/metro-config")

const config = getDefaultConfig(__dirname)

// Allow importing .svg as components if needed later (placeholder for transformer)
module.exports = config
