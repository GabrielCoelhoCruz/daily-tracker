const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// zustand v5 ships an ESM build using `import.meta`, which breaks the classic
// (non-module) web bundle. Prefer the CJS "require" export condition instead.
config.resolver.unstable_conditionNames = ["browser", "require", "react-native"];

module.exports = withNativeWind(config, { input: "./global.css" });
