'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes the Firebase application instance.
 * Hardened to prevent initialization errors when credentials are missing.
 */
export function initializeFirebase() {
  // 1. Return existing app if already initialized
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  let firebaseApp: FirebaseApp;

  // 2. Priority: Manual configuration from config.ts
  // We check for apiKey presence to avoid 'app/no-options' errors.
  if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined") {
    try {
      firebaseApp = initializeApp(firebaseConfig);
      console.log("[Firebase] Initialized via Neural Config Object.");
    } catch (e) {
      console.error("[Firebase] Initialization via config failed:", e);
      // Fallback to zero-arg
      firebaseApp = initializeApp();
    }
  } else {
    // 3. Fallback: App Hosting / Zero-arg initialization
    try {
      firebaseApp = initializeApp();
      console.log("[Firebase] Initialized via Zero-Arg Handshake.");
    } catch (e: any) {
      console.error("[Firebase] CRITICAL FAILURE: No API Key found. Handshake aborted.");
      // We initialize with the empty config to allow hooks to fail gracefully rather than crash the JS thread
      firebaseApp = initializeApp(firebaseConfig);
    }
  }

  return getSdks(firebaseApp);
}

/**
 * Retrieves the initialized SDK instances.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// Re-export hooks and utilities
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
