
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
    // Although we don't block, we should still handle potential immediate errors
    // like network issues, or if the email is already in use.
    // For this app, we'll log it. A more robust app might show a toast.
    console.error("Sign-up initiation failed:", error);
  });
  // Code continues immediately.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password)
    .catch((error) => {
        // If the sign-in fails (e.g., wrong password), we might need to create the user.
        // This is specific to the guest user workflow.
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
             initiateEmailSignUp(authInstance, email, password);
        } else {
            console.error("Sign-in initiation failed:", error);
        }
    });
  // Code continues immediately.
}
