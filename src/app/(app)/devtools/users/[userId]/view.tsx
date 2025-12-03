'use client';

import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp, increment, getDoc } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Loader2, ArrowLeft, CheckCircle, Star, RotateCcw, Undo2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Task, UserProfile, UserTask, CombinedTask, WithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo, useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
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
import { useRouter } from 'next/navigation';

const POINTS_PER_LEVEL = 100;
const TIER_1_BONUS_RATE = 0.10; // 10%
const TIER_2_BONUS_RATE = 0.02; // 2%

const taskIcons = {
  video: <PlayCircle className="h-5 w-5 text-primary" />,
  read: <FileText className="h-5 w-5 text-indigo-500" />,
};

type PreviousState = {
  userTasks: WithId<UserTask>[];
  points: number;
  totalEarned: number;
  level: number;
} | null;

export default function ManageUserTasksView({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const { user: adminUser } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [previousState, setPreviousState] = useState<PreviousState | null>(null);

  const isGuestMode = adminUser?.email === 'guest.dev@cascade.app';
  
  useEffect(() => {
    return () => {
      setPreviousState(null);
    }
  }, [router]);

  const userProfileRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'users', userId) : null,
    [firestore, userId]
  );
  const { data: userProfile, isLoading: isUserLoading } = useDoc<UserProfile>(userProfileRef);

  const masterTasksQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'tasks') : null,
    [firestore]
  );
  const { data: masterTasks, isLoading: isLoadingMasterTasks } = useCollection<Task>(masterTasksQuery);

  const userTasksQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'users', userId, 'tasks') : null,
    [firestore, userId]
  );
  const { data: userTasks, isLoading: isLoadingUserTasks } = useCollection<UserTask>(userTasksQuery);

  const combinedTasks = useMemo((): CombinedTask[] => {
    if (!masterTasks || !userTasks) return [];
    const userTasksMap = new Map(userTasks.map(ut => [ut.id, ut]));
    return masterTasks.map((mt: WithId<Task>) => ({
      ...mt,
      status: userTasksMap.get(mt.id)?.status ?? 'available',
      completedAt: userTasksMap.get(mt.id)?.completedAt ?? null,
    }));
  }, [masterTasks, userTasks]);

  const handleAwardPoints = async (task: CombinedTask) => {
    if (!firestore || !userProfile) return;
    if (task.status !== 'in-progress') {
        toast({ variant: "destructive", title: 'Task not ready', description: "User must start the task first."});
        return;
    }

    const userTaskRef = doc(firestore, 'users', userProfile.uid, 'tasks', task.id);
    const userProfileDocRef = doc(firestore, 'users', userProfile.uid);
    let toasts = [];

    try {
        const batch = writeBatch(firestore);
        
        batch.set(userTaskRef, {
            status: 'completed',
            completedAt: serverTimestamp(),
        }, { merge: true });
        
        const newTotalEarned = userProfile.totalEarned + task.points;
        const newLevel = Math.floor(newTotalEarned / POINTS_PER_LEVEL) + 1;

        const profileUpdate: any = {
            points: increment(task.points),
            totalEarned: increment(task.points)
        };
        
        if (newLevel > userProfile.level) {
            profileUpdate.level = newLevel;
            toasts.push(`${userProfile.displayName} leveled up to Level ${newLevel}!`);
        }

        batch.update(userProfileDocRef, profileUpdate);
        toasts.push(`${task.points} points given to ${userProfile.displayName}.`);
        
        // Tier 1 Referral Bonus
        if (userProfile.referredBy) {
            const tier1Bonus = Math.floor(task.points * TIER_1_BONUS_RATE);
            if (tier1Bonus > 0) {
                const tier1ReferrerRef = doc(firestore, 'users', userProfile.referredBy);
                batch.update(tier1ReferrerRef, {
                    points: increment(tier1Bonus),
                    totalEarned: increment(tier1Bonus)
                });
                toasts.push(`Gave ${tier1Bonus} bonus points to Tier 1 referrer.`);

                // Tier 2 Referral Bonus
                const tier1ReferrerSnap = await getDoc(tier1ReferrerRef);
                const tier1ReferrerProfile = tier1ReferrerSnap.data() as UserProfile;
                if (tier1ReferrerProfile && tier1ReferrerProfile.referredBy) {
                    const tier2Bonus = Math.floor(task.points * TIER_2_BONUS_RATE);
                    if (tier2Bonus > 0) {
                        const tier2ReferrerRef = doc(firestore, 'users', tier1ReferrerProfile.referredBy);
                        batch.update(tier2ReferrerRef, {
                            points: increment(tier2Bonus),
                            totalEarned: increment(tier2Bonus)
                        });
                        toasts.push(`Gave ${tier2Bonus} bonus points to Tier 2 referrer.`);
                    }
                }
            }
        }

        await batch.commit();

        toast({
            title: 'Points & Bonuses Awarded!',
            description: toasts.join(' '),
        });
    } catch(e: any) {
        toast({ variant: "destructive", title: 'Error', description: e.message });
    }
  };

  const handleResetUserProgress = async () => {
    if (!firestore || !userProfile || !userTasks) return;

    setPreviousState({
      userTasks: [...userTasks],
      points: userProfile.points,
      totalEarned: userProfile.totalEarned,
      level: userProfile.level,
    });

    const batch = writeBatch(firestore);

    const userDocRef = doc(firestore, 'users', userProfile.uid);
    batch.update(userDocRef, {
      points: 0,
      totalEarned: 0,
      level: 1,
    });

    userTasks.forEach(task => {
      const taskRef = doc(firestore, 'users', userProfile.uid, 'tasks', task.id);
      batch.update(taskRef, { status: 'available', completedAt: null });
    });

    await batch.commit();
    toast({
      title: 'User Progress Reset',
      description: `${userProfile.displayName}'s tasks and points have been reset.`,
    });
  };

  const handleUndoReset = async () => {
    if (!firestore || !userProfile || !previousState) {
        toast({ variant: "destructive", title: 'Undo Failed', description: 'No previous state to restore.'});
        return;
    };

    const batch = writeBatch(firestore);

    const userDocRef = doc(firestore, 'users', userProfile.uid);
    batch.update(userDocRef, {
      points: previousState.points,
      totalEarned: previousState.totalEarned,
      level: previousState.level,
    });

    previousState.userTasks.forEach(taskState => {
      const taskRef = doc(firestore, 'users', userProfile.uid, 'tasks', taskState.id);
      batch.set(taskRef, taskState);
    });

    await batch.commit();
    setPreviousState(null);
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
          <div className="flex items-center gap-2">
            {previousState ? (
              <Button variant="outline" size="sm" onClick={handleUndoReset}>
                <Undo2 className="mr-2 h-4 w-4" />
                Undo Reset
              </Button>
            ) : (
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
                      <span className="font-bold">{userProfile.displayName}</span>. This can be undone until you navigate away.
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
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 pt-4">
            <Avatar className="h-16 w-16 border">
                <AvatarImage src={userProfile.photoURL ?? undefined} />
                <AvatarFallback>{getInitials(userProfile.displayName)}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle>Manage: {userProfile.displayName}</CardTitle>
                <CardDescription>
                    Manually award points for completed tasks. Current points: {userProfile.points}
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
                {task.status === 'completed' ? <CheckCircle className="h-5 w-5 text-green-500" /> : 
                 task.status === 'in-progress' ? <Loader2 className="h-5 w-5 animate-spin text-amber-500"/> :
                 taskIcons[task.type]}
            </div>
            <div className="flex-grow min-w-0">
              <p className="font-medium break-words">{task.title}</p>
               <p className="text-sm text-muted-foreground break-words">{task.description}</p>
            </div>
            <div className="flex items-center gap-4">
                <Badge variant="secondary" className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
                    <Star className="h-3 w-3 mr-1" />
                    {task.points}
                </Badge>
                <Button 
                    size="sm" 
                    variant={task.status === 'in-progress' ? 'default' : 'secondary'}
                    onClick={() => handleAwardPoints(task)}
                    disabled={task.status !== 'in-progress' || !isGuestMode}
                    className="w-40"
                >
                    {task.status === 'completed' 
                        ? <> <CheckCircle className="mr-2 h-4 w-4"/> Completed </>
                        : task.status === 'in-progress'
                        ? <> <Star className="mr-2 h-4 w-4"/> Award Points </>
                        : 'Pending'
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
