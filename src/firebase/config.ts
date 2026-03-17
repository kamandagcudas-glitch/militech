
/**
 * @fileOverview Firebase Client Configuration
 * 
 * This file pulls credentials from environment variables.
 * For production, ensure these are set in your hosting provider (e.g., Vercel).
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Diagnostic check for keys in non-production environments
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    if (!firebaseConfig.apiKey) {
        console.warn("[Firebase] WARNING: API Key is missing. Neural SSO will fail.");
    }
}
