
export type User = {
  name: string;
  avatarUrl: string;
  points: number;
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
