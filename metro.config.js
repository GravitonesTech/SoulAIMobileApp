const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const polyfillPath = path.resolve(__dirname, "utils/polyfills.ts");

const originalGetModulesRunBeforeMainModule = config.serializer?.getModulesRunBeforeMainModule;

config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: (entryFilePath) => [
    polyfillPath,
    ...(originalGetModulesRunBeforeMainModule
      ? originalGetModulesRunBeforeMainModule(entryFilePath)
      : []),
  ],
};

module.exports = config;
