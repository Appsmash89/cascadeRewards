
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2, Edit, Link2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { collection, getDocs, writeBatch, doc, deleteDoc } from "firebase/firestore";
import type { Task, UserProfile, WithId } from "@/lib/types";
import Link from 'next/link';

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function DevToolsView() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const isGuestMode = user?.email === GUEST_EMAIL;
  
  const [isResetting, setIsResetting] = useState(false);

  const masterTasksQuery = useMemoFirebase(() =>
    userProfile ? collection(firestore, 'tasks') : null,
    [userProfile, firestore]
  );
  const { data: masterTasks, isLoading: isLoadingMasterTasks } = useCollection<Task>(masterTasksQuery);

  useEffect(() => {
    if (!isUserLoading && !isGuestMode) {
      router.push('/dashboard');
    }
  }, [isGuestMode, isUserLoading, router]);

  const handleResetTasks = async () => {
    if (!firestore) {
        toast({ variant: "destructive", title: "Error", description: "Firestore not available." });
        return;
    }
    if (!confirm('Are you sure you want to reset task progress for ALL non-admin users? This cannot be undone.')) {
        return;
    }

    setIsResetting(true);
    try {
        const batch = writeBatch(firestore);
        const usersRef = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersRef);

        if (usersSnapshot.empty) {
            toast({ title: "No users found to reset." });
            setIsResetting(false);
            return;
        }

        let usersResetCount = 0;

        // For each user, get their tasks and add resets to the batch
        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data() as UserProfile;

            // Skip the admin user and non-Google users
            if (userData.email === GUEST_EMAIL || userData.provider !== 'google.com') {
                continue;
            }
            
            usersResetCount++;
            const userTasksRef = collection(firestore, 'users', userDoc.id, 'tasks');
            const tasksSnapshot = await getDocs(userTasksRef);
            
            if (!tasksSnapshot.empty) {
                tasksSnapshot.forEach((taskDoc) => {
                    batch.update(taskDoc.ref, {
                        status: 'available',
                        completedAt: null
                    });
                });
            }
        }
        
        if (usersResetCount === 0) {
            toast({ title: "No Users to Reset", description: "No Google-signed-in users found." });
            setIsResetting(false);
            return;
        }

        await batch.commit();

        toast({
            title: "Global Task Reset Successful",
            description: `Task progress for ${usersResetCount} user(s) has been reset.`,
        });

    } catch (error) {
        console.error("Error resetting all tasks: ", error);
        toast({
            variant: "destructive",
            title: "Reset Failed",
            description: "Could not reset all user tasks. Check console for details.",
        });
    } finally {
        setIsResetting(false);
    }
  };

  const handleDeleteTask = async (task: WithId<Task>) => {
    if (!firestore || !userProfile) return;
    if (!confirm(`Are you sure you want to delete "${task.title}"? This cannot be undone.`)) return;

    try {
        const masterTaskRef = doc(firestore, 'tasks', task.id);
        await deleteDoc(masterTaskRef);

        // Also delete from guest user's subcollection
        const userTaskRef = doc(firestore, 'users', userProfile.uid, 'tasks', task.id);
        await deleteDoc(userTaskRef).catch(e => console.warn("Could not delete user task, it might not exist", e));

        toast({ title: 'Task Deleted', description: `"${task.title}" has been removed.` });
    } catch (e: any) {
        toast({ variant: "destructive", title: 'Error deleting task', description: e.message });
    }
  };

  if (!isGuestMode) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Access denied.</p>
      </div>
    );
  }

  const sortedTasks = masterTasks?.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Developer Tools</CardTitle>
                <CardDescription>Tools for easy prototyping and quick testing.</CardDescription>
            </div>
            <Button onClick={handleResetTasks} variant="outline" size="sm" disabled={isResetting}>
                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset All User Progress
            </Button>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/devtools/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage User Tasks
                </Link>
              </Button>
            </CardContent>
        </Card>

        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>Add, edit, or delete global tasks.</CardDescription>
            </div>
            <Button size="sm" asChild>
                <Link href="/devtools/task/new">
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
