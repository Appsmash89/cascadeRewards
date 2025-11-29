'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard/header";
import StatsCards from "@/components/dashboard/stats-cards";
import TasksList from "@/components/dashboard/tasks-list";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { CombinedTask, Task, UserTask } from "@/lib/types";
import { collection, doc, increment, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function DashboardView() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const isGuestMode = user?.email === GUEST_EMAIL;

  // 1. Fetch all master tasks only when a user is available
  const masterTasksQuery = useMemoFirebase(() => 
    userProfile ? collection(firestore, 'tasks') : null, 
    [userProfile, firestore]
  );
  const { data: masterTasks, isLoading: isLoadingMasterTasks } = useCollection<Task>(masterTasksQuery);

  // 2. Fetch user-specific task statuses
  const userTasksQuery = useMemoFirebase(() => 
    userProfile ? collection(firestore, 'users', userProfile.uid, 'tasks') : null, 
    [firestore, userProfile]
  );
  const { data: userTasks, isLoading: isLoadingUserTasks } = useCollection<UserTask>(userTasksQuery);

  // 3. Combine master tasks with user statuses
  const combinedTasks = useMemo(() => {
    if (!masterTasks || !userTasks) return [];
    
    const userTasksMap = new Map(userTasks.map(ut => [ut.id, ut]));
    
    return masterTasks.map(mt => ({
      ...mt,
      ...userTasksMap.get(mt.id), // This will add status, completedAt, etc.
    })).filter(ct => ct.status); // Filter out any tasks that might not have a user status yet

  }, [masterTasks, userTasks]);


  const handleCompleteTask = (task: CombinedTask) => {
    if (!userProfile || !firestore) return;

    const userTaskRef = doc(firestore, 'users', userProfile.uid, 'tasks', task.id);
    const userProfileRef = doc(firestore, 'users', userProfile.uid);

    // Update the task status to 'completed'
    updateDocumentNonBlocking(userTaskRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
    });

    // Award points to the user
    updateDocumentNonBlocking(userProfileRef, {
      points: increment(task.points),
    });

    toast({
      title: "Task Completed!",
      description: `You earned ${task.points} points.`,
    });
  };

  const isLoading = isUserLoading || (!!user && (!masterTasks || !userTasks));

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Could not load user profile.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary dark:bg-neutral-950">
      <DashboardHeader user={userProfile} isGuest={isGuestMode} />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-24">
        <StatsCards user={userProfile} referrals={[]} isGuest={isGuestMode} />
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
              onCompleteTask={handleCompleteTask} 
              isGuestMode={isGuestMode}
            />
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
