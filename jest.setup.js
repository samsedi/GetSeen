// Jest doesn't load .env the way Expo/Metro does, and api/client.ts intentionally throws
// if EXPO_PUBLIC_API_URL is unset (to catch misconfigured builds) — so tests need a stand-in.
// Not a real endpoint: tests should mock network calls rather than hit it.
process.env.EXPO_PUBLIC_API_URL = 'https://test.invalid/api/v1';
