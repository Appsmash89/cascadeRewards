'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import StatsCards from "@/components/dashboard/stats-cards";
import TasksList from "@/components/dashboard/tasks-list";
import { useUser } from "@/hooks/use-user";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { CombinedTask, Task, UserTask, WithId } from "@/lib/types";
import { collection, query, where } from "firebase/firestore";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import LiveInfoCard from "@/components/dashboard/live-info-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const GUEST_EMAIL = 'guest.dev@cascade.app';
const POINTS_PER_LEVEL = 100;

const filterCategories = ['All', 'High Reward', 'Easy', 'New'];

const XPProgressRing = ({ progress, size = 80 }: { progress: number, size?: number }) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-secondary"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-primary"
          fill="none"
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ strokeDasharray: circumference, strokeDashoffset }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
};


export default function DashboardView() {
  const { user, userProfile } = useUser();
  const firestore = useFirestore();
  const isGuestMode = user?.email === GUEST_EMAIL;
  const [activeFilter, setActiveFilter] = useState('All');

  // 1. Fetch all master tasks
  const masterTasksQuery = useMemoFirebase(() =>
    userProfile ? collection(firestore, 'tasks') : null,
    [firestore, userProfile]
  );
  const { data: masterTasks } = useCollection<Task>(masterTasksQuery);

  // 2. Fetch user-specific task statuses
  const userTasksQuery = useMemoFirebase(() =>
    userProfile ? collection(firestore, 'users', userProfile.uid, 'tasks') : null,
    [firestore, userProfile]
  );
  const { data: userTasks } = useCollection<UserTask>(userTasksQuery);

  // 3. Combine master tasks with user statuses
  const combinedTasks = useMemo((): CombinedTask[] => {
    if (!masterTasks || !userTasks) return [];
    
    const userTasksMap = new Map(userTasks.map(ut => [ut.id, ut]));

    return masterTasks.map((mt: WithId<Task>) => ({
      ...mt,
      status: userTasksMap.get(mt.id)?.status ?? 'available',
      completedAt: userTasksMap.get(mt.id)?.completedAt ?? null,
    }));
  }, [masterTasks, userTasks]);

  // 4. Apply filters
  const filteredTasks = useMemo(() => {
    let tasks = combinedTasks;
    switch(activeFilter) {
      case 'High Reward':
        tasks = tasks.filter(t => t.points >= 100);
        break;
      case 'Easy':
        tasks = tasks.filter(t => t.points < 50);
        break;
      case 'New':
        // Assuming 'New' means created in the last 7 days. This is a simulated property.
        // In a real app, you'd add a `createdAt` field to the Task schema.
        tasks = tasks.slice(0, 5); // Just show first 5 as "New" for demonstration
        break;
      default: // 'All'
        break;
    }
    
    // Sort tasks: preferred first (matches interests or is 'All'), then by title
    return tasks.sort((a, b) => {
      const userInterests = new Set(userProfile?.interests || []);
      const aIsPreferred = userInterests.has(a.category) || a.category === 'All';
      const bIsPreferred = userInterests.has(b.category) || b.category === 'All';

      if (aIsPreferred && !bIsPreferred) return -1;
      if (!aIsPreferred && bIsPreferred) return 1;
      return a.title.localeCompare(b.title);
    });

  }, [combinedTasks, activeFilter, userProfile]);


  // The main loading state is handled by the layout
  if (!userProfile) {
    return null;
  }

  const level = userProfile?.level ?? 1;
  const totalEarned = userProfile?.totalEarned ?? 0;
  const pointsInCurrentLevel = totalEarned % POINTS_PER_LEVEL;
  const levelProgress = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;
  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('') : '';

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative">
          <XPProgressRing progress={levelProgress} />
          <Avatar className="absolute inset-0 m-auto h-16 w-16 border-4 border-background">
            <AvatarImage src={userProfile.photoURL ?? undefined} alt={userProfile.displayName ?? ''} />
            <AvatarFallback>{getInitials(userProfile.displayName ?? '')}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <p className="text-muted-foreground text-sm">Good morning,</p>
          <h2 className="text-xl font-bold">{userProfile.displayName}</h2>
          <div className="mt-1 flex items-center gap-2 text-xs font-medium">
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">Level {level}</span>
            <span className="text-muted-foreground">{pointsInCurrentLevel} / {POINTS_PER_LEVEL} XP</span>
          </div>
        </div>
      </div>
      
      <StatsCards user={userProfile} referrals={[]} isGuest={isGuestMode} />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Daily Tasks</CardTitle>
            <CardDescription>
              Earn points instantly by completing simple tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2">
                {filterCategories.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                      activeFilter === filter
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <TasksList 
              tasks={filteredTasks}
              isGuestMode={isGuestMode}
            />
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
