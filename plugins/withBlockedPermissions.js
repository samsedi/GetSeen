const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

// Expo's base Android template adds SYSTEM_ALERT_WINDOW ("draw over other apps") by
// default. Get_Seen doesn't use overlays, and Play Console flags this sensitive
// permission during review, so strip it on every prebuild.
const BLOCKED_PERMISSIONS = ['android.permission.SYSTEM_ALERT_WINDOW'];

module.exports = function withBlockedPermissions(config) {
  return withAndroidManifest(config, (config) => {
    AndroidConfig.Permissions.removePermissions(config.modResults, BLOCKED_PERMISSIONS);
    return config;
  });
};
