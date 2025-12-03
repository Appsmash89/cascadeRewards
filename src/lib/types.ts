
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
  interests: TaskCategory[];
};

export type AppSettings = {
  fontSizeMultiplier: number;
  taskCategories?: string[];
  pastelBackgroundEnabled?: boolean;
  pastelBackgroundColor?: string; // HSL value string e.g. "240 60% 95%"
  adminEmails?: string[];
  theme?: 'default' | 'reactbits';
}

export type User = {
  name: string;
  avatarUrl: string;
  points: number;
  credits: number;
  referralCode: string;
  referralLevel: number;
};

export type TaskCategory = string;

// Represents a master task from the global /tasks collection
export type Task = {
  title: string;
  description: string;
  points: number;
  type: 'video' | 'read';
  category: TaskCategory;
  link?: string;
  content: string;
  creatorUid?: string;
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

export type Feedback = {
  userId: string;
  userDisplayName: string;
  content: string;
  createdAt: any; // Firestore Timestamp
};
