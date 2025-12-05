
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
import type { AppSettings, UserProfile } from '@/lib/types';
import { manageUserDocument } from '@/services/user.service';
import { useTheme } from 'next-themes';

const GUEST_EMAIL = 'guest.dev@cascade.app';
const SIMULATED_USERS_KEY = 'simulatedUsers';
const SIMULATION_PROFILE_KEY = 'simulationProfile';


/**
 * Defines the shape of the application's global context.
 */
interface AppContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isSimulated: boolean;
  isAdmin: boolean;
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
  const { setTheme } = useTheme();
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  // States for simulation mode
  const [simulatedUserIds, setSimulatedUserIds] = useState<Set<string>>(new Set());
  const [simulationTemplate, setSimulationTemplate] = useState<Partial<UserProfile> & { referrals?: number } | null>(null);


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
    data: originalUserProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useDoc<UserProfile>(userProfileRef);

  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'app-settings', 'global') : null, 
    [firestore]
  );
  const { data: appSettings, isLoading: appSettingsLoading } = useDoc<AppSettings>(settingsRef);
  
  // Effect to load local profile & simulation settings from localStorage on mount
  useEffect(() => {
    try {
        const storedSimulatedUsers = localStorage.getItem(SIMULATED_USERS_KEY);
        if (storedSimulatedUsers) {
          setSimulatedUserIds(new Set(JSON.parse(storedSimulatedUsers)));
        }

        const storedSimTemplate = localStorage.getItem(SIMULATION_PROFILE_KEY);
        if (storedSimTemplate) {
          setSimulationTemplate(JSON.parse(storedSimTemplate));
        }

    } catch (error) {
        console.error("Could not read from localStorage", error);
    }
  }, []);

  // Effect to sync user's chosen theme with the app's theme.
  useEffect(() => {
    if (originalUserProfile?.settings?.theme) {
      setTheme(originalUserProfile.settings.theme);
    } else {
      setTheme('default');
    }
  }, [originalUserProfile, setTheme]);

  const isAdmin = useMemo(() => {
    if (!authUser || !appSettings) return false;
    return authUser.email === GUEST_EMAIL || (appSettings.adminEmails || []).includes(authUser.email!);
  }, [authUser, appSettings]);

  const isSimulated = useMemo(() => {
    return authUser ? simulatedUserIds.has(authUser.uid) : false;
  }, [authUser, simulatedUserIds]);

  // Create a memoized, potentially overridden user profile
  const userProfile = useMemo(() => {
    if (!originalUserProfile) return null;
    
    // Per-user simulation mode
    if (isSimulated && simulationTemplate) {
        return {
            ...originalUserProfile,
            ...simulationTemplate,
            displayName: simulationTemplate.displayName ?? originalUserProfile.displayName,
            photoURL: simulationTemplate.photoURL ?? originalUserProfile.photoURL,
            points: Number(simulationTemplate.points) ?? originalUserProfile.points,
            level: Number(simulationTemplate.level) ?? originalUserProfile.level,
            totalEarned: Number(simulationTemplate.totalEarned) ?? originalUserProfile.totalEarned,
            referrals: Number(simulationTemplate.referrals) ?? 0,
        };
    }
    
    return originalUserProfile;
  }, [originalUserProfile, isSimulated, simulationTemplate]);


  // Memoize the context value to prevent unnecessary re-renders of consumers.
  const contextValue = useMemo<AppContextType>(
    () => ({
      user: authUser,
      userProfile,
      isSimulated,
      isAdmin,
      // The user is considered loading if auth state is pending, or profile is fetching, or settings are fetching.
      isUserLoading: isAuthLoading || (!!authUser && isProfileLoading) || (!!authUser && appSettingsLoading),
      error: authError || profileError,
    }),
    [authUser, userProfile, isSimulated, isAdmin, isAuthLoading, isProfileLoading, appSettingsLoading, authError, profileError]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
