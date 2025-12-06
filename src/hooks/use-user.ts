
'use client';

import { useContext } from 'react';
import { AppContext } from '@/context/app-context';

/**
 * Provides access to the application's core context, including authentication state and user profile.
 * This hook is the single source of truth for user data across the entire app.
 *
 * It must be used within a component that is a child of the `AppProvider`.
 *
 * @returns The context value, which includes:
 *  - `user`: The Firebase Auth user object, or null if not logged in.
 *  - `userProfile`: The real-time Firestore document for the user, or null.
 *  - `isSimulated`: A boolean that is true if the current user is in simulation mode.
 *  - `isAdmin`: A boolean that is true if the current user has admin privileges.
 *  - `isUserLoading`: A boolean that is true during the initial auth check, profile fetch, and admin status check.
 *  - `error`: Any error that occurred during auth or Firestore subscription.
 */
export const useUser = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useUser must be used within an AppProvider');
  }

  return context;
};
