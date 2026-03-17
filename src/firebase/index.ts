
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes the Firebase application instance.
 * Prioritizes App Hosting zero-arg init, then falls back to manual config.
 */
export function initializeFirebase() {
  // 1. Return existing app if already initialized
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  let firebaseApp: FirebaseApp;

  // 2. Attempt App Hosting initialization (Zero-arg)
  try {
    firebaseApp = initializeApp();
    console.log("[Firebase] Initialized via App Hosting environment.");
  } catch (e: any) {
    // 3. Manual Fallback
    // Check if we have valid manual config options
    if (firebaseConfig && firebaseConfig.apiKey) {
      firebaseApp = initializeApp(firebaseConfig);
      console.log("[Firebase] Initialized via Neural Config Object.");
    } else {
      // Log critical failure instead of throwing immediately to allow UI to render basic shell
      console.error("[Firebase] CRITICAL FAILURE: API Key not found in environment. Neural Link offline.");
      
      // We still try to call it to let the SDK throw its own specific error if the above check is bypassed
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
