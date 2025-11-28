
'use client';

import { useEffect } from 'react';
import { useAuth, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { useDoc } from '../firestore/use-doc';
import type { UserProfile } from '@/lib/types';
import { setDocumentNonBlocking } from '../non-blocking-updates';

// Helper to generate a random referral code
const generateReferralCode = () => {
  return `CASC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

// Function to manage user creation/update in Firestore
const manageUserDocument = async (user: User, firestore: any) => {
  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // User is new, create the document
    const newUser: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || 'Anonymous',
      email: user.email || '',
      photoURL: user.photoURL || '',
      provider: user.providerData[0]?.providerId || 'custom',
      points: 0,
      level: 1,
      referralCode: generateReferralCode(),
      referredBy: null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      totalLogins: 1,
    };
    setDocumentNonBlocking(userRef, newUser, { merge: false });
  } else {
    // User exists, update last login and other details
    const updateData = {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp(),
      totalLogins: increment(1),
    };
    setDocumentNonBlocking(userRef, updateData, { merge: true });
  }
};

export const useUser = () => {
  const { user, isUserLoading, userError } = useAuth();
  const firestore = useFirestore();

  // Effect to handle user document creation/update on login
  useEffect(() => {
    if (user && firestore) {
      manageUserDocument(user, firestore);
    }
  }, [user, firestore]);

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
