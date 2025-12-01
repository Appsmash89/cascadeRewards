

// This represents the user document in Firestore
export type UserProfile = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  provider: string;
  points: number;
  credits: number;
  level: number;
  referralCode: string;
  referredBy: string | null;
  createdAt: any; // Firestore Timestamp
  lastLogin: any; // Firestore Timestamp
  totalLogins: number;
  totalEarned: number;
  settings: {
    notificationsEnabled: boolean;
    darkMode: boolean;
  };
};

export type AppSettings = {
  fontSizeMultiplier: number;
}

export type User = {
  name: string;
  avatarUrl: string;
  points: number;
  credits: number;
  referralCode: string;
  referralLevel: number;
};

// Represents a master task from the global /tasks collection
export type Task = {
  title: string;
  description: string;
  points: number;
  type: 'video' | 'read';
  link?: string;
  content: string;
};

// Represents a user's specific task state from /users/{uid}/tasks/{taskId}
export type UserTask = {
  status: 'available' | 'in-progress' | 'completed';
  completedAt: any; // Firestore Timestamp or null
}

// A combined type for easier handling in the UI
export type CombinedTask = Task & UserTask & { id: string };

export type WithId<T> = T & { id: string };

export type Referral = {
  id: string;
  name: string;
  avatarUrl: string;
  joinDate: string;
};

export type Reward = {
  id: string;
  title: string;
  description: string;
  points: number;
  imageUrl: string;
};
