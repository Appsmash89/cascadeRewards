
import type { User, Referral, Reward } from './types';

export const currentUser: User = {
  name: 'Alex Morgan',
  avatarUrl: 'https://picsum.photos/seed/alex/100/100',
  points: 1250,
  credits: 50,
  referralCode: 'CASC-A9B3X2',
  referralLevel: 2,
};

export const masterTasks = [
  { id: 'task-1', title: 'Watch Introductory Video', description: 'Learn about Cascade Rewards', points: 50, type: 'video', link: 'https://www.youtube.com' },
  { id: 'task-2', title: 'Read "How to Refer" Guide', description: 'Master the referral system', points: 25, type: 'read', link: 'https://www.google.com' },
  { id: 'task-3', title: 'Watch Advanced Tips Video', description: 'Maximize your earnings', points: 75, type: 'video', link: 'https://www.youtube.com' },
  { id: 'task-4', title: 'Read "User Success Stories"', description: 'Get inspired by top earners', points: 30, type: 'read', link: 'https://www.google.com' },
  { id: 'task-5', title: 'Complete Profile Setup', description: 'Add your payment details', points: 100, type: 'read', link: 'https://www.google.com' },
];


export const referrals: Referral[] = [
  { id: 'ref-1', name: 'Ben Carter', avatarUrl: 'https://picsum.photos/seed/1/40/40', joinDate: '2024-05-15' },
  { id: 'ref-2', name: 'Chloe Davis', avatarUrl: 'https://picsum.photos/seed/2/40/40', joinDate: '2024-05-12' },
  { id: 'ref-3', name: 'David Evans', avatarUrl: 'https://picsum.photos/seed/3/40/40', joinDate: '2024-05-10' },
  { id: 'ref-4', name: 'Fiona Green', avatarUrl: 'https://picsum.photos/seed/4/40/40', joinDate: '2024-05-08' },
];

export const rewards: Reward[] = [
  {
    id: 'reward-1',
    title: '$5 Amazon Gift Card',
    description: 'Redeem for a $5 gift card.',
    points: 500,
    imageUrl: 'https://picsum.photos/seed/amazon/300/200'
  },
  {
    id: 'reward-2',
    title: '$10 Starbucks Gift Card',
    description: 'Redeem for a $10 gift card.',
    points: 1000,
    imageUrl: 'https://picsum.photos/seed/starbucks/300/200'
  },
   {
    id: 'reward-3',
    title: '$20 Target Gift Card',
    description: 'Redeem for a $20 gift card.',
    points: 2000,
    imageUrl: 'https://picsum.photos/seed/target/300/200'
  },
  {
    id: 'reward-4',
    title: '$50 Best Buy Gift Card',
    description: 'Redeem for a $50 gift card.',
    points: 5000,
    imageUrl: 'https://picsum.photos/seed/bestbuy/300/200'
  },
]
