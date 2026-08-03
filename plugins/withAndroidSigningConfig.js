const { withAppBuildGradle } = require("@expo/config-plugins");

const withAndroidSigningConfig = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = addSigningConfig(config.modResults.contents);
    }
    return config;
  });
};

function addSigningConfig(contents) {
  // 1. Add release config under signingConfigs if it doesn't exist
  const debugBlockRegex = /(signingConfigs\s*\{[\s\S]*?debug\s*\{[\s\S]*?\}\s*)/;
  const releaseConfigToAdd = `\n        release {
            if (project.hasProperty('SOULAI_RELEASE_STORE_FILE')) {
                storeFile file(SOULAI_RELEASE_STORE_FILE)
                storePassword SOULAI_RELEASE_STORE_PASSWORD
                keyAlias SOULAI_RELEASE_KEY_ALIAS
                keyPassword SOULAI_RELEASE_KEY_PASSWORD
            }
        }\n`;

  if (debugBlockRegex.test(contents) && !contents.includes("signingConfigs.release")) {
    contents = contents.replace(debugBlockRegex, (match) => {
      return match + releaseConfigToAdd;
    });
  } else if (
    contents.includes("signingConfigs {") &&
    !contents.includes("signingConfigs.release")
  ) {
    contents = contents.replace(/(signingConfigs\s*\{)/, `$1${releaseConfigToAdd}`);
  }

  // 2. Change release build type signingConfig inside buildTypes to signingConfigs.release
  const releaseBuildTypeRegex =
    /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?signingConfig\s*)signingConfigs\.debug/;
  if (releaseBuildTypeRegex.test(contents)) {
    contents = contents.replace(releaseBuildTypeRegex, "$1signingConfigs.release");
  }

  return contents;
}

module.exports = withAndroidSigningConfig;
