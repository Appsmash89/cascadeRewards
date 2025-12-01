
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
import { collection } from "firebase/firestore";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const GUEST_EMAIL = 'guest.dev@cascade.app';
const POINTS_PER_LEVEL = 100;


export default function DashboardView() {
  const { user, userProfile } = useUser();
  const firestore = useFirestore();
  const isGuestMode = user?.email === GUEST_EMAIL;

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

  // 3. Combine master tasks with user statuses and personalize the order
  const combinedTasks = useMemo((): CombinedTask[] => {
    if (!masterTasks || !userTasks || !userProfile) return [];
    
    const userTasksMap = new Map(userTasks.map(ut => [ut.id, ut]));
    const userInterests = new Set(userProfile.interests || []);

    const tasks: CombinedTask[] = masterTasks.map((mt: WithId<Task>) => ({
      ...mt,
      status: userTasksMap.get(mt.id)?.status ?? 'available',
      completedAt: userTasksMap.get(mt.id)?.completedAt ?? null,
    }));
    
    // Sort tasks: preferred first (matches interests or is 'All'), then by title
    tasks.sort((a, b) => {
      const aIsPreferred = userInterests.has(a.category) || a.category === 'All';
      const bIsPreferred = userInterests.has(b.category) || b.category === 'All';

      if (aIsPreferred && !bIsPreferred) return -1;
      if (!aIsPreferred && bIsPreferred) return 1;
      return a.title.localeCompare(b.title);
    });

    return tasks;

  }, [masterTasks, userTasks, userProfile]);


  // The main loading state is handled by the new layout
  if (!userProfile) {
    return null; // or a minimal loader if preferred, but layout handles the main one
  }

  const level = userProfile?.level ?? 1;
  const totalEarned = userProfile?.totalEarned ?? 0;
  const pointsInCurrentLevel = totalEarned % POINTS_PER_LEVEL;
  const levelProgress = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;

  return (
    <>
      <Card className="shadow-sm p-4">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-full h-6 w-6 flex items-center justify-center">
                    {level}
                </span>
                <div className="flex-1">
                <Progress value={levelProgress} className="h-2" />
                </div>
                <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-full h-6 w-6 flex items-center justify-center">
                    {level+1}
                </span>
            </div>
            <p className="text-xs text-muted-foreground text-center font-medium">
                {pointsInCurrentLevel} / {POINTS_PER_LEVEL} points to Level {level + 1}
            </p>
        </div>
      </Card>

      <StatsCards user={userProfile} referrals={[]} isGuest={isGuestMode} />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Daily Tasks</CardTitle>
            <CardDescription>
              Complete tasks to earn points and climb the leaderboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TasksList 
              tasks={combinedTasks}
              isGuestMode={isGuestMode}
            />
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
