
'use client';

import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { manageUserDocument } from '@/services/user.service';

/**
 * Defines the shape of the application's global context.
 */
interface AppContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isUserLoading: boolean; // True if either auth state or profile is loading.
  error: Error | null; // Combines auth and Firestore errors.
}

// Create the React Context with an undefined initial value.
export const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * The main provider component for the application.
 * It orchestrates authentication state, user profile fetching, and document management.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const {
    user: authUser,
    isUserLoading: isAuthLoading,
    userError: authError,
  } = useAuth();
  const firestore = useFirestore();
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  // Effect to manage the user document in Firestore whenever the auth state changes.
  useEffect(() => {
    if (authUser && firestore && !isInitialSyncDone) {
      manageUserDocument(firestore, authUser);
      setIsInitialSyncDone(true); // Ensure this runs only once per login session
    } else if (!authUser) {
      setIsInitialSyncDone(false); // Reset when user logs out
    }
  }, [authUser, firestore, isInitialSyncDone]);

  // Memoize the reference to the user's document to prevent re-renders.
  const userProfileRef = useMemoFirebase(
    () => (authUser ? doc(firestore, 'users', authUser.uid) : null),
    [authUser, firestore]
  );

  // Subscribe to the user's profile document in real-time.
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useDoc<UserProfile>(userProfileRef);

  // Memoize the context value to prevent unnecessary re-renders of consumers.
  const contextValue = useMemo<AppContextType>(
    () => ({
      user: authUser,
      userProfile,
      // The user is considered loading if auth state is pending OR (we have a user but their profile is still fetching).
      isUserLoading: isAuthLoading || (!!authUser && isProfileLoading),
      error: authError || profileError,
    }),
    [authUser, userProfile, isAuthLoading, isProfileLoading, authError, profileError]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
