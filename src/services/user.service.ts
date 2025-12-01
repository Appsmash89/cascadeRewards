
'use client';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  increment,
  type Firestore,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initializeUserTasks } from './tasks.service';

/**
 * Generates a unique referral code.
 * @returns A string like 'CASC-A1B2C3'.
 */
const generateReferralCode = (): string => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CASC-${code}`;
};

/**
 * Manages a user's document in Firestore.
 * On first login, it creates the document.
 * On subsequent logins, it updates the last login time and other syncable fields.
 *
 * This is designed to be called from the client-side, but after auth state is confirmed.
 * It uses non-blocking writes for a smoother UX.
 *
 * @param firestore - The Firestore database instance.
 * @param user - The authenticated user object from Firebase Auth.
 */
export const manageUserDocument = async (
  firestore: Firestore,
  user: User
): Promise<void> => {
  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // User is new, create the document with default values.
    const newUserProfile: UserProfile = {
      uid: user.uid,
      displayName: user.isAnonymous ? 'Guest User' : user.displayName || 'New User',
      email: user.email || '',
      photoURL: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
      provider: user.providerData[0]?.providerId || 'anonymous',
      points: 0,
      credits: 0,
      level: 1,
      referralCode: generateReferralCode(),
      referredBy: null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      totalLogins: 1,
      totalEarned: 0,
      settings: {
        notificationsEnabled: true,
        darkMode: false,
      },
    };
    // Use a non-blocking write.
    setDocumentNonBlocking(userRef, newUserProfile, { merge: false });
    // Also initialize their tasks, can be awaited as it's a setup step.
    await initializeUserTasks(firestore, user.uid);
  } else {
    // User exists, update syncable fields.
    const updateData: Partial<UserProfile> & { [key: string]: any } = {
      lastLogin: serverTimestamp(),
      totalLogins: increment(1),
    };
    
    // Only sync profile from provider if not an anonymous user
    if (!user.isAnonymous) {
        updateData.displayName = user.displayName;
        updateData.email = user.email;
        updateData.photoURL = user.photoURL;
    }

    // Use a non-blocking merge write.
    setDocumentNonBlocking(userRef, updateData, { merge: true });
  }
};
