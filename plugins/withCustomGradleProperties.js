const { withGradleProperties } = require("@expo/config-plugins");

/**
 * Expo Config Plugin to increase the Gradle Java heap size (JVM args).
 * This prevents OutOfMemoryError (Java heap space) when compiling large dependencies like Zoom.
 */
module.exports = function withCustomGradleProperties(config) {
  return withGradleProperties(config, (config) => {
    const properties = config.modResults;

    const jvmArgs = "-Xmx8192m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError";
    const existing = properties.find((p) => p.key === "org.gradle.jvmargs");

    if (existing) {
      existing.value = jvmArgs;
    } else {
      properties.push({
        type: "property",
        key: "org.gradle.jvmargs",
        value: jvmArgs,
      });
    }

    return config;
  });
};
