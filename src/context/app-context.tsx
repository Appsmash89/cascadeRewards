
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

/**
 * Defines the shape of the application's global context.
 */
interface AppContextType {
  user: User | null;
  userProfile: UserProfile | null;
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

  // States for local profile override
  const [useLocalProfile, setUseLocalProfile] = useState(false);
  const [localDisplayName, setLocalDisplayName] = useState<string | null>(null);
  const [localPhotoURL, setLocalPhotoURL] = useState<string | null>(null);

  // States for simulation mode
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [simulatedProfile, setSimulatedProfile] = useState<Partial<UserProfile> | null>(null);


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
        const localUse = localStorage.getItem('useLocalProfile') === 'true';
        const localName = localStorage.getItem('localDisplayName');
        const localAvatar = localStorage.getItem('localPhotoURL');

        setUseLocalProfile(localUse);
        if (localName) setLocalDisplayName(localName);
        if (localAvatar) setLocalPhotoURL(localAvatar);

        const simMode = localStorage.getItem('simulationMode') === 'true';
        setIsSimulationMode(simMode);
        if (simMode) {
            const storedSimProfile = localStorage.getItem('simulationProfile');
            if (storedSimProfile) {
                setSimulatedProfile(JSON.parse(storedSimProfile));
            }
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

  // Create a memoized, potentially overridden user profile
  const userProfile = useMemo(() => {
    if (!originalUserProfile) return null;
    
    // Simulation mode takes highest priority for admins
    if (isAdmin && isSimulationMode && simulatedProfile) {
        return {
            ...originalUserProfile,
            ...simulatedProfile,
            // ensure numbers are parsed correctly from storage
            points: Number(simulatedProfile.points) || originalUserProfile.points,
            level: Number(simulatedProfile.level) || originalUserProfile.level,
            totalEarned: Number(simulatedProfile.totalEarned) || originalUserProfile.totalEarned,
        };
    }
    
    // Local profile override for regular users
    const shouldOverride = useLocalProfile && !isAdmin;

    return {
      ...originalUserProfile,
      displayName: shouldOverride && localDisplayName ? localDisplayName : originalUserProfile.displayName,
      photoURL: shouldOverride && localPhotoURL ? localPhotoURL : originalUserProfile.photoURL,
    };
  }, [originalUserProfile, useLocalProfile, localDisplayName, localPhotoURL, isAdmin, isSimulationMode, simulatedProfile]);


  // Memoize the context value to prevent unnecessary re-renders of consumers.
  const contextValue = useMemo<AppContextType>(
    () => ({
      user: authUser,
      userProfile,
      isAdmin,
      // The user is considered loading if auth state is pending, or profile is fetching, or settings are fetching.
      isUserLoading: isAuthLoading || (!!authUser && isProfileLoading) || (!!authUser && appSettingsLoading),
      error: authError || profileError,
    }),
    [authUser, userProfile, isAdmin, isAuthLoading, isProfileLoading, appSettingsLoading, authError, profileError]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
