/**
 * @fileOverview Firebase Client Configuration
 * 
 * This file pulls credentials from environment variables.
 * Hardened to provide fallback warnings for the Neural SSO handshake.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "undefined",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "undefined",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "undefined",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "undefined",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "undefined",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "undefined",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Diagnostic check for keys in non-production environments
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
        console.warn("[Firebase] WARNING: API Key is missing from the environment. Neural SSO will fail.");
    }
}
