
'use client';

import { useAuth, useFirestore } from '@/firebase';
import { useDoc } from '../firestore/use-doc';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '../provider';

/**
 * DEPRECATED: This hook is deprecated in favor of the `useUser` hook from `@/hooks/use-user`.
 * The new hook provides a cleaner, context-based approach to managing user state.
 * This file will be removed in a future update.
 */
export const useUserOld = () => {
  const { user, isUserLoading, userError } = useAuth();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userProfileRef);

  return {
    user: user,
    userProfile,
    isUserLoading: isUserLoading || (user && isProfileLoading),
    error: userError || profileError,
  };
};
