
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
import { Loader2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { CombinedTask, Task, UserTask, WithId } from "@/lib/types";
import { collection, doc, increment, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";
import { motion } from "framer-motion";

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function DashboardView() {
  const { user, userProfile } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
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

  // The main loading state is handled by the new layout
  if (!userProfile) {
    return null; // or a minimal loader if preferred, but layout handles the main one
  }

  return (
    <>
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
              onCompleteTask={handleCompleteTask} 
              isGuestMode={isGuestMode}
            />
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
