
'use client';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  increment,
  type Firestore,
  arrayUnion,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initializeUserTasks } from './tasks.service';

const generateReferralCode = (): string => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CASC-${code}`;
};

const seedInitialAppSettings = async (firestore: Firestore): Promise<void> => {
    const categoriesDocRef = doc(firestore, 'app-settings', 'taskCategories');
    const categoriesDoc = await getDoc(categoriesDocRef);

    if (!categoriesDoc.exists()) {
        console.log("Seeding initial 'All' task category...");
        try {
            await setDoc(categoriesDocRef, {
                taskCategories: ['All']
            });
            console.log("'All' category seeded successfully.");
        } catch (error) {
            console.error("Error seeding 'All' category:", error);
        }
    } else {
        const data = categoriesDoc.data();
        if (data && !data.taskCategories.includes('All')) {
            console.log("Adding missing 'All' category...");
            await setDoc(categoriesDocRef, { taskCategories: arrayUnion('All') }, { merge: true });
        }
    }

     const globalSettingsRef = doc(firestore, 'app-settings', 'global');
    const globalSettingsDoc = await getDoc(globalSettingsRef);

    if (!globalSettingsDoc.exists()) {
        console.log("Seeding initial global settings...");
        try {
            await setDoc(globalSettingsRef, {
                fontSizeMultiplier: 1.0,
                pastelBackgroundEnabled: false,
                pastelBackgroundColor: '220 60% 95%',
                adminEmails: [],
            });
            console.log("Global settings seeded successfully.");
        } catch (error) {
            console.error("Error seeding global settings:", error);
        }
    }
};

export const manageUserDocument = async (
  firestore: Firestore,
  user: User
): Promise<void> => {
  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await seedInitialAppSettings(firestore);

    const newUserProfile: UserProfile = {
      uid: user.uid,
      displayName: user.isAnonymous ? 'Admin' : user.displayName || 'New User',
      email: user.email || '',
      photoURL: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
      provider: user.providerData[0]?.providerId || 'anonymous',
      points: 0,
      credits: 0,
      level: 1,
      totalEarned: 0,
      referralCode: generateReferralCode(),
      referredBy: null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      totalLogins: 1,
      settings: {
        notificationsEnabled: true,
        darkMode: false,
        theme: 'default',
      },
      interests: [],
    };

    setDocumentNonBlocking(userRef, newUserProfile, { merge: false });
    await initializeUserTasks(firestore, user.uid);
  } else {
    const updateData: Partial<UserProfile> & { [key: string]: any } = {
      lastLogin: serverTimestamp(),
      totalLogins: increment(1),
    };
    
    if (!user.isAnonymous) {
        updateData.displayName = user.displayName;
        updateData.email = user.email;
        updateData.photoURL = user.photoURL;
    }

    setDocumentNonBlocking(userRef, updateData, { merge: true });
  }
};
