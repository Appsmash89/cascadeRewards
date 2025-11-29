
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
  isAnonymous: boolean;
};

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
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'video' | 'read';
};

// Represents a user's specific task state from /users/{uid}/tasks/{taskId}
export type UserTask = {
  id: string; // This will be the same as the master task ID
  status: 'available' | 'completed';
  completedAt: any; // Firestore Timestamp or null
}

// A combined type for easier handling in the UI
export type CombinedTask = Task & UserTask;


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
