
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
import type { CombinedTask, Task, UserTask, WithId } from "@/lib/types";
import { collection, doc, increment, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function DashboardView() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const isGuestMode = user?.isAnonymous ?? false;

  // 1. Fetch all master tasks
  const masterTasksQuery = useMemoFirebase(() => 
    collection(firestore, 'tasks'),
    [firestore]
  );
  const { data: masterTasks, isLoading: isLoadingMasterTasks } = useCollection<Task>(masterTasksQuery);

  // 2. Fetch user-specific task statuses
  const userTasksQuery = useMemoFirebase(() => 
    userProfile ? collection(firestore, 'users', userProfile.uid, 'tasks') : null,
    [firestore, userProfile]
  );
  const { data: userTasks, isLoading: isLoadingUserTasks } = useCollection<UserTask>(userTasksQuery);

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

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!userProfile) {
    // This state is hit if auth is done, user exists, but profile is missing.
    // This indicates a true data-loading issue.
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
