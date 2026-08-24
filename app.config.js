// Dynamic config so development/preview/production builds can install side-by-side on
// the same device (distinct name + package id) while sharing one Expo config otherwise.
// APP_VARIANT is set per-profile in eas.json.
const fs = require('fs');
const path = require('path');

const VARIANT = process.env.APP_VARIANT || 'production';

// Firebase config files aren't checked in yet (see console.firebase.google.com setup).
// Only wire in the Firebase plugins once they exist, so the app still builds without them.
const GOOGLE_SERVICES_JSON = path.join(__dirname, 'google-services.json');
const GOOGLE_SERVICE_INFO_PLIST = path.join(__dirname, 'GoogleService-Info.plist');

const ANDROID_PACKAGE = `com.getseen.app${{ development: '.dev', preview: '.preview', production: '' }[VARIANT]}`;

// The Google Services Gradle plugin hard-fails the build if the app's package name isn't
// registered as a client in google-services.json. Only the production package is registered
// today, so only wire Firebase in for the variant(s) it actually knows about — add the
// dev/preview package names as additional Android apps in the Firebase console to extend this.
function androidPackageIsRegistered() {
  if (!fs.existsSync(GOOGLE_SERVICES_JSON)) return false;
  const config = JSON.parse(fs.readFileSync(GOOGLE_SERVICES_JSON, 'utf8'));
  return config.client.some((c) => c.client_info.android_client_info.package_name === ANDROID_PACKAGE);
}

const HAS_FIREBASE_ANDROID = androidPackageIsRegistered();
const HAS_FIREBASE_IOS = fs.existsSync(GOOGLE_SERVICE_INFO_PLIST);

const VARIANT_CONFIG = {
  development: {
    name: 'GetSeen Dev',
    packageSuffix: '.dev',
    scheme: 'getseen-dev',
  },
  preview: {
    name: 'GetSeen Preview',
    packageSuffix: '.preview',
    scheme: 'getseen-preview',
  },
  production: {
    name: 'Get_Seen',
    packageSuffix: '',
    scheme: 'getseen',
  },
}[VARIANT];

module.exports = {
  expo: {
    name: VARIANT_CONFIG.name,
    slug: 'Get_Seen',
    version: '1.0.0',
    orientation: 'default',
    icon: './assets/images/getseen-icon.png',
    scheme: VARIANT_CONFIG.scheme,
    userInterfaceStyle: 'automatic',
    newArchEnabled: false,
    // OTA updates: JS-only fixes ship to installed users in minutes via `eas update`,
    // without a Play Store review cycle. "fingerprint" policy ties an update's eligibility
    // to a hash of the native code, so it's automatically blocked from binaries it isn't
    // compatible with instead of relying on someone remembering to bump a version manually.
    runtimeVersion: {
      policy: 'fingerprint',
    },
    updates: {
      url: 'https://u.expo.dev/d72f6636-9a6f-47d5-b810-217d794268c2',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: `com.getseen.app${VARIANT_CONFIG.packageSuffix}`,
      ...(HAS_FIREBASE_IOS && { googleServicesFile: GOOGLE_SERVICE_INFO_PLIST }),
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#000000',
        foregroundImage: './assets/images/getseen-icon.png',
      },
      predictiveBackGestureEnabled: false,
      package: ANDROID_PACKAGE,
      ...(HAS_FIREBASE_ANDROID && { googleServicesFile: GOOGLE_SERVICES_JSON }),
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/getseen-light-removebg-preview.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#FFFFFF',
          dark: {
            image: './assets/images/getseen-dark-removebg-preview.png',
            backgroundColor: '#000000',
          },
        },
      ],
      'expo-font',
      'expo-image',
      'expo-web-browser',
      'expo-secure-store',
      '@react-native-community/datetimepicker',
      'expo-sharing',
      [
        'expo-media-library',
        {
          photosPermission: 'Allow Get_Seen to access your photos.',
          savePhotosPermission: 'Allow Get_Seen to save QR codes to your photos.',
          isAccessMediaLocationEnabled: false,
          granularPermissions: ['photo', 'video'],
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow Get_Seen to access your photo library to select campaign media.',
          cameraPermission: 'Allow Get_Seen to take photos for campaign media.',
          microphonePermission: false,
        },
      ],
      'expo-video',
      './plugins/withBlockedPermissions',
      ...(HAS_FIREBASE_ANDROID || HAS_FIREBASE_IOS
        ? ['@react-native-firebase/app', '@react-native-firebase/crashlytics']
        : []),
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'd72f6636-9a6f-47d5-b810-217d794268c2',
      },
    },
  },
};
