
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2, Edit, Link2, Users, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { collection, doc, deleteDoc, writeBatch, increment, setDoc, getDocs } from "firebase/firestore";
import type { Task, WithId, UserProfile, AppSettings } from "@/lib/types";
import Link from 'next/link';
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

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function DevToolsView() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const isGuestMode = user?.email === GUEST_EMAIL;

  const appSettingsRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'app-settings', 'global') : null, [firestore]
  );
  const { data: appSettings } = useDoc<AppSettings>(appSettingsRef);
  
  const masterTasksQuery = useMemoFirebase(() =>
    userProfile ? collection(firestore, 'tasks') : null,
    [userProfile, firestore]
  );
  const { data: masterTasks, isLoading: isLoadingMasterTasks } = useCollection<Task>(masterTasksQuery);

    const usersQuery = useMemoFirebase(() => 
    firestore && isGuestMode ? collection(firestore, 'users') : null,
    [firestore, isGuestMode]
  );
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  useEffect(() => {
    if (!isUserLoading && !isGuestMode) {
      router.push('/dashboard');
    }
  }, [isGuestMode, isUserLoading, router]);

  const handleDeleteTask = async (task: WithId<Task>) => {
    if (!firestore || !userProfile) return;
    
    // Directly use window.confirm
    const isConfirmed = window.confirm(`Are you sure you want to delete "${task.title}"? This cannot be undone.`);
    if (!isConfirmed) return;

    try {
        const masterTaskRef = doc(firestore, 'tasks', task.id);
        await deleteDoc(masterTaskRef);

        // Also delete from guest user's subcollection for consistency
        if(users) {
          const batch = writeBatch(firestore);
          users.forEach(u => {
            const userTaskRef = doc(firestore, 'users', u.uid, 'tasks', task.id);
            batch.delete(userTaskRef);
          });
          await batch.commit();
        }

        toast({ title: 'Task Deleted', description: `"${task.title}" has been removed for all users.` });
    } catch (e: any) {
        toast({ variant: "destructive", title: 'Error deleting task', description: e.message });
    }
  };

  const handleResetTasks = async () => {
    if (!firestore || !users) {
      toast({ variant: "destructive", title: "Error", description: "Could not reset tasks." });
      return;
    }

    try {
      const batch = writeBatch(firestore);
      
      for (const u of users) {
        // Reset points and totalEarned on the user profile
        const userDocRef = doc(firestore, 'users', u.uid);
        batch.update(userDocRef, {
          points: 0,
          totalEarned: 0
        });

        // Reset all tasks in the subcollection
        const userTasksCollectionRef = collection(firestore, 'users', u.uid, 'tasks');
        const userTasksSnapshot = await getDocs(userTasksCollectionRef);
        userTasksSnapshot.forEach(taskDoc => {
          batch.update(taskDoc.ref, { status: 'available', completedAt: null });
        });
      }

      await batch.commit();
      toast({ title: "Success", description: "All user progress has been reset." });

    } catch (e: any) {
      toast({ variant: "destructive", title: "Reset Failed", description: e.message });
    }
  };

  const handleFontSizeChange = async (step: number) => {
    if (!appSettingsRef) return;
    
    // The check for minimum size should happen on the UI side if needed, 
    // but the core logic can rely on Firestore's atomic increment.
    // This avoids using stale local state `appSettings`.
    await setDoc(appSettingsRef, { 
      fontSizeMultiplier: increment(step * 0.1) 
    }, { merge: true });
  }

  if (isUserLoading || usersLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isGuestMode) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Access denied.</p>
      </div>
    );
  }

  const sortedTasks = masterTasks?.sort((a, b) => a.title.localeCompare(b.title));
  
  // Handle potential floating point inaccuracies for display
  const displayMultiplier = appSettings?.fontSizeMultiplier ? (Math.round(appSettings.fontSizeMultiplier * 10) / 10).toFixed(1) : '1.0';

  return (
    <>
        <Card className="shadow-sm">
            <CardHeader>
              <div>
                  <CardTitle>Developer Tools</CardTitle>
                  <CardDescription>Tools for easy prototyping and quick testing.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button asChild className="w-full">
                  <Link href="/devtools/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
              </Button>
               <Button asChild className="w-full">
                  <Link href="/devtools/categories">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Manage Categories
                  </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset All User Progress
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset all task progress and points for EVERY user, including the admin. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetTasks}>
                      Yes, Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div className="p-2 border rounded-lg flex items-center justify-between md:col-span-2">
                <p className="font-medium text-sm pl-2">Global Font Size</p>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleFontSizeChange(-1)} disabled={(appSettings?.fontSizeMultiplier ?? 1) <= 0.5}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold w-10 text-center">{displayMultiplier}x</span>
                  <Button size="icon" variant="outline" onClick={() => handleFontSizeChange(1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
        </Card>

        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>Add, edit, or delete global tasks.</CardDescription>
            </div>
            <Button size="sm" asChild>
                <Link href="/devtools/task/edit/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Task
                </Link>
            </Button>
            </CardHeader>
            <CardContent>
            <div className="border rounded-lg">
                {isLoadingMasterTasks ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </div>
                ) : (
                    <div className="divide-y">
                        {sortedTasks && sortedTasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 gap-2">
                                <div className="flex-1">
                                    <p className="font-medium">{task.title}</p>
                                    <p className="text-sm text-muted-foreground">{task.points} points</p>
                                    {task.link && (
                                        <Link href={task.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                            <Link2 className="h-3 w-3" />
                                            {task.link}
                                        </Link>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/devtools/task/edit/${task.id}`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTask(task)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </CardContent>
        </Card>
    </>
  );
}
