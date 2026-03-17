'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

export function initializeFirebase() {
  // 1. Check if already initialized to prevent "App already exists" errors
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  let firebaseApp: FirebaseApp;

  // 2. Attempt specialized "App Hosting" zero-arg initialization first
  try {
    firebaseApp = initializeApp();
    console.log("[Firebase] Initialized via App Hosting environment.");
  } catch (e: any) {
    // 3. Fallback to manual config if zero-arg fails
    // CRITICAL: Ensure we actually have an API key before calling initializeApp(config)
    if (firebaseConfig.apiKey) {
      firebaseApp = initializeApp(firebaseConfig);
      console.log("[Firebase] Initialized via manual config object.");
    } else {
      console.error("[Firebase] CRITICAL FAILURE: No API Key detected in environment variables. Simulation will fail.");
      // We still try to initialize to let Firebase throw its internal descriptive errors if needed
      firebaseApp = initializeApp(firebaseConfig);
    }
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
