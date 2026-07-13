const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * Expo Config Plugin to disable native Gradle Lint vital release analysis.
 * This prevents OutOfMemoryError (Java heap space) caused by lint analysis in some dependencies.
 */
module.exports = function withDisableLint(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents += `
android {
    lint {
        checkReleaseBuilds false
        abortOnError false
    }
}
`;
    }
    return config;
  });
};
