const { getDefaultConfig } = require("expo/metro-config")

const config = getDefaultConfig(__dirname)

// Add support for additional file extensions
config.resolver.assetExts.push("db", "mp3", "ttf", "obj", "png", "jpg")

// Enable hermes for better performance
config.transformer.hermesCommand = "hermes"

module.exports = config
