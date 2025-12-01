
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2, Edit, Link2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { collection, doc, deleteDoc } from "firebase/firestore";
import type { Task, WithId } from "@/lib/types";
import Link from 'next/link';
import PinLock from "@/components/auth/pin-lock";

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function DevToolsView() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const isGuestMode = user?.email === GUEST_EMAIL;
  
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

  if (!isUnlocked) {
    return <PinLock onUnlock={() => setIsUnlocked(true)} />
  }

  return (
    <>
        <Card className="shadow-sm">
            <CardHeader>
              <div>
                  <CardTitle>Developer Tools</CardTitle>
                  <CardDescription>Tools for easy prototyping and quick testing.</CardDescription>
              </div>
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
