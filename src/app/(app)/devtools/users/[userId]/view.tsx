
'use client';

import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Loader2, ArrowLeft, CheckCircle, Award, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Task, UserProfile, UserTask, CombinedTask, WithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, FileText } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const taskIcons = {
  video: <PlayCircle className="h-5 w-5 text-primary" />,
  read: <FileText className="h-5 w-5 text-indigo-500" />,
};

type PreviousState = {
  userTasks: WithId<UserTask>[];
  points: number;
  totalEarned: number;
} | null;

export default function ManageUserTasksView({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const { user: adminUser } = useUser();
  const { toast } = useToast();

  const [previousState, setPreviousState] = useState<PreviousState>(null);

  const isGuestMode = adminUser?.email === 'guest.dev@cascade.app';

  // Get targeted user's profile
  const userProfileRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'users', userId) : null,
    [firestore, userId]
  );
  const { data: userProfile, isLoading: isUserLoading } = useDoc<UserProfile>(userProfileRef);

  // Get all master tasks
  const masterTasksQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'tasks') : null,
    [firestore]
  );
  const { data: masterTasks, isLoading: isLoadingMasterTasks } = useCollection<Task>(masterTasksQuery);

  // Get targeted user's task progress
  const userTasksQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'users', userId, 'tasks') : null,
    [firestore, userId]
  );
  const { data: userTasks, isLoading: isLoadingUserTasks } = useCollection<UserTask>(userTasksQuery);

  // Combine master tasks with user's progress
  const combinedTasks = useMemo((): CombinedTask[] => {
    if (!masterTasks || !userTasks) return [];
    const userTasksMap = new Map(userTasks.map(ut => [ut.id, ut]));
    return masterTasks.map((mt: WithId<Task>) => ({
      ...mt,
      status: userTasksMap.get(mt.id)?.status ?? 'available',
      completedAt: userTasksMap.get(mt.id)?.completedAt ?? null,
    }));
  }, [masterTasks, userTasks]);

  const handleMarkAsComplete = async (task: CombinedTask) => {
    if (!firestore || !userProfile) return;
    if (task.status === 'completed') {
        toast({ variant: "destructive", title: 'Task already completed.'});
        return;
    }

    const userTaskRef = doc(firestore, 'users', userProfile.uid, 'tasks', task.id);
    const userProfileDocRef = doc(firestore, 'users', userProfile.uid);

    try {
        const batch = writeBatch(firestore);
        
        batch.set(userTaskRef, {
            status: 'completed',
            completedAt: serverTimestamp(),
        }, { merge: true });

        batch.update(userProfileDocRef, {
            points: increment(task.points),
            totalEarned: increment(task.points)
        });

        await batch.commit();

        toast({
            title: 'Task Completed!',
            description: `Awarded ${task.points} points to ${userProfile.displayName}.`,
        });
    } catch(e: any) {
        toast({ variant: "destructive", title: 'Error', description: e.message });
    }
  };

  const handleResetUserProgress = async () => {
    if (!firestore || !userProfile || !userTasks) return;

    // Save the current state for potential undo
    setPreviousState({
      userTasks: [...userTasks],
      points: userProfile.points,
      totalEarned: userProfile.totalEarned
    });

    const batch = writeBatch(firestore);

    // Reset points on user profile
    const userDocRef = doc(firestore, 'users', userProfile.uid);
    batch.update(userDocRef, {
      points: 0,
      totalEarned: 0,
    });

    // Reset all task statuses for the user
    userTasks.forEach(task => {
      const taskRef = doc(firestore, 'users', userProfile.uid, 'tasks', task.id);
      batch.update(taskRef, { status: 'available', completedAt: null });
    });

    await batch.commit();
    toast({
      title: 'User Progress Reset',
      description: `${userProfile.displayName}'s tasks and points have been reset.`,
      action: (
        <Button variant="secondary" size="sm" onClick={handleUndoReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Undo
        </Button>
      ),
    });
  };

  const handleUndoReset = async () => {
    if (!firestore || !userProfile || !previousState) {
        toast({ variant: "destructive", title: 'Undo Failed', description: 'No previous state to restore.'});
        return;
    };

    const batch = writeBatch(firestore);

    // Restore points on user profile
    const userDocRef = doc(firestore, 'users', userProfile.uid);
    batch.update(userDocRef, {
      points: previousState.points,
      totalEarned: previousState.totalEarned,
    });

    // Restore all task documents
    previousState.userTasks.forEach(taskState => {
      const taskRef = doc(firestore, 'users', userProfile.uid, 'tasks', taskState.id);
      batch.set(taskRef, taskState);
    });

    await batch.commit();
    setPreviousState(null); // Clear the undo state
    toast({ title: 'Undo Successful', description: `Restored progress for ${userProfile.displayName}.` });
  };
  
  const getInitials = (name: string | null) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  }

  const isLoading = isUserLoading || isLoadingMasterTasks || isLoadingUserTasks;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return <p>User not found.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
            <Link href="/devtools/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset User's Progress
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all task progress and points for{' '}
                    <span className="font-bold">{userProfile.displayName}</span>. This action can be undone
                    immediately after, but not after navigating away.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetUserProgress}>
                    Yes, Reset Progress
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
        <div className="flex items-center gap-4 pt-4">
            <Avatar className="h-16 w-16 border">
                <AvatarImage src={userProfile.photoURL ?? undefined} />
                <AvatarFallback>{getInitials(userProfile.displayName)}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle>Manage: {userProfile.displayName}</CardTitle>
                <CardDescription>
                    Mark tasks as complete to award points. Current points: {userProfile.points}
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="my-4" />
        <div className="space-y-2">
        {combinedTasks.sort((a,b) => a.title.localeCompare(b.title)).map(task => (
          <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-secondary">
             <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                {task.status === 'completed' ? <CheckCircle className="h-5 w-5 text-green-500" /> : taskIcons[task.type]}
            </div>
            <div className="flex-grow">
              <p className="font-medium">{task.title}</p>
               <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
            <div className="flex items-center gap-4">
                <Badge variant="secondary" className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
                    <Award className="h-3 w-3 mr-1" />
                    {task.points}
                </Badge>
                <Button 
                    size="sm" 
                    variant={task.status === 'completed' ? 'secondary' : 'default'}
                    onClick={() => handleMarkAsComplete(task)}
                    disabled={task.status === 'completed' || !isGuestMode}
                    className="w-40"
                >
                    {task.status === 'completed' 
                        ? <> <CheckCircle className="mr-2 h-4 w-4"/> Completed </>
                        : 'Mark as Complete'
                    }
                </Button>
            </div>
          </div>
        ))}
        </div>
      </CardContent>
    </Card>
  );
}

