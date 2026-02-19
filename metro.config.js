const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for @supabase/realtime-js "Unable to resolve module ./RealtimePresence"
// Metro picks up the ESM `module` field instead of the CJS `main` field.
// Disabling package exports forces Metro to use the `main` field (CJS).
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
