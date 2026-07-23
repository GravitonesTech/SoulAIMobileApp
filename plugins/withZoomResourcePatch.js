const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * Expo Config Plugin to patch Zoom SDK resources before they are merged.
 * This prevents AAPT2 compilation errors due to non-positional format string resources.
 */
module.exports = function withZoomResourcePatch(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents += `
afterEvaluate {
    tasks.matching { it.name.startsWith("merge") && it.name.endsWith("Resources") }.configureEach { task ->
        task.doFirst {
            try {
                def gradleUserHome = gradle.gradleUserHomeDir
                def cachesDir = new File(gradleUserHome, "caches")
                
                // Define the patch logic
                def patchDir
                patchDir = { File dir ->
                    if (!dir.exists()) return
                    dir.eachFile { file ->
                        if (file.isDirectory()) {
                            patchDir(file)
                        } else if (file.isFile() && file.name.endsWith(".xml") && file.path.contains("zoomsdk") && file.parentFile.name.startsWith("values")) {
                            def xml = file.text
                            def lines = xml.split("\\n")
                            def modified = false
                            for (int i = 0; i < lines.length; i++) {
                                def line = lines[i]
                                if (line.contains('<string name="zm_') && !line.contains('formatted=')) {
                                    def formatSpecifierRegex = ~/%(?:[1-9]\\d*\\$(?:[-#+ 0,\\(\\<]*)?(?:\\d+)?(?:\\.\\d+)?[a-zA-Z]|(?:[-#+0,\\(\\<]*)?(?:\\d+)?(?:\\.\\d+)?[a-zA-Z])/
                                    def hasFormatSpecifier = formatSpecifierRegex.matcher(line).find()
                                    if (hasFormatSpecifier) {
                                        def escapeRegex = ~/(%%)|(%[1-9]\\d*\\$(?:[-#+ 0,\\(\\<]*)?(?:\\d+)?(?:\\.\\d+)?[a-zA-Z]|%(?:[-#+0,\\(\\<]*)?(?:\\d+)?(?:\\.\\d+)?[a-zA-Z])|%/
                                        def matcher = escapeRegex.matcher(line)
                                        def sb = new StringBuffer()
                                        def modifiedLine = false
                                        while (matcher.find()) {
                                            if (matcher.group(1) != null) {
                                                matcher.appendReplacement(sb, java.util.regex.Matcher.quoteReplacement(matcher.group(0)))
                                            } else if (matcher.group(2) != null) {
                                                matcher.appendReplacement(sb, java.util.regex.Matcher.quoteReplacement(matcher.group(0)))
                                            } else {
                                                matcher.appendReplacement(sb, "%%")
                                                modifiedLine = true
                                            }
                                        }
                                        matcher.appendTail(sb)
                                        if (modifiedLine) {
                                            line = sb.toString()
                                            lines[i] = line
                                            modified = true
                                        }
                                    } else {
                                        def percentCount = line.count('%')
                                        if (percentCount > 1) {
                                            line = line.replace('<string name="', '<string formatted="false" name="')
                                            lines[i] = line
                                            modified = true
                                        }
                                    }
                                }
                            }
                            if (modified) {
                                file.write(lines.join("\\n"))
                                println "Successfully patched Zoom resource: \${file.absolutePath}"
                            }
                        }
                    }
                }

                // Patch gradle cache directories
                if (cachesDir.exists()) {
                    println "Scanning for Zoom SDK resources to patch in Gradle cache..."
                    def transformDirs = []
                    cachesDir.eachDir { dir ->
                        if (dir.name.startsWith("transforms")) {
                            transformDirs.add(dir)
                        } else if (dir.name.matches(/\\d+\\.\\d+(\\.\\d+)?/)) {
                            def transDir = new File(dir, "transforms")
                            if (transDir.exists() && transDir.isDirectory()) {
                                transformDirs.add(transDir)
                            }
                        }
                    }
                    transformDirs.each { dir ->
                        patchDir(dir)
                    }
                }

                // Also patch project build directories as a fallback
                def buildDir = rootProject.buildDir
                if (buildDir.exists()) {
                    println "Scanning for Zoom SDK resources to patch in project build directory..."
                    patchDir(buildDir)
                }
            } catch (Exception e) {
                println "Warning: Could not patch Zoom SDK resources: \${e.message}"
            }
        }
    }
}
`;
    }
    return config;
  });
};
