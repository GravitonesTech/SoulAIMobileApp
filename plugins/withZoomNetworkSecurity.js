const { withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withZoomNetworkSecurity = (config) => {
  return withAndroidManifest(config, async (modConfig) => {
    const androidManifest = modConfig.modResults;
    const mainApplication = androidManifest.manifest.application[0];
    
    // Add networkSecurityConfig attribute to the application tag
    mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';

    // Add tools:replace to avoid manifest merger conflicts with Zoom's configuration
    if (mainApplication.$['tools:replace']) {
      const existing = mainApplication.$['tools:replace'];
      if (!existing.split(',').map(s => s.trim()).includes('android:networkSecurityConfig')) {
        mainApplication.$['tools:replace'] = `${existing},android:networkSecurityConfig`;
      }
    } else {
      mainApplication.$['tools:replace'] = 'android:networkSecurityConfig';
    }

    // Resolve path to the Android res/xml directory
    const resDir = path.join(modConfig.modRequest.platformProjectRoot, 'app/src/main/res');
    const xmlDir = path.join(resDir, 'xml');
    
    // Ensure res/xml directory exists
    if (!fs.existsSync(xmlDir)) {
      fs.mkdirSync(xmlDir, { recursive: true });
    }
    
    // Network security configuration contents
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">ocsp.digicert.com</domain>
        <domain includeSubdomains="true">crl3.digicert.com</domain>
    </domain-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>`;

    // Write the network_security_config.xml file
    fs.writeFileSync(path.join(xmlDir, 'network_security_config.xml'), xmlContent, 'utf-8');

    return modConfig;
  });
};

module.exports = withZoomNetworkSecurity;
