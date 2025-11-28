

// This represents the user document in Firestore
export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  provider: string;
  points: number;
  credits: number;
  level: number;
  referralCode: string;
  referredBy: string | null;
  createdAt: any; // Firestore Timestamp
  lastLogin: any; // Firestore Timestamp
  totalLogins: number;
  settings: {
    notificationsEnabled: boolean;
    darkMode: boolean;
  };
};

export type User = {
  name: string;
  avatarUrl: string;
  points: number;
  credits: number;
  referralCode: string;
  referralLevel: number;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'video' | 'read';
  isCompleted?: boolean;
};

export type Referral = {
  id: string;
  name: string;
  avatarUrl: string;
  joinDate: string;
};
