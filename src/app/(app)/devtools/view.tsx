
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2, Edit, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { collection, getDocs, writeBatch, doc, deleteDoc, setDoc } from "firebase/firestore";
import type { Task, WithId } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import TaskForm from "@/components/devtools/task-form";
import Link from 'next/link';
import { z } from "zod";

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function DevToolsView() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const isGuestMode = user?.email === GUEST_EMAIL;
  
  const [isResetting, setIsResetting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WithId<Task> | null>(null);

  const masterTasksQuery = useMemoFirebase(() =>
    userProfile ? collection(firestore, 'tasks') : null,
    [userProfile, firestore]
  );
  const { data: masterTasks, isLoading: isLoadingMasterTasks, error } = useCollection<Task>(masterTasksQuery);

  useEffect(() => {
    if (!isUserLoading && !isGuestMode) {
      router.push('/dashboard');
    }
  }, [isGuestMode, isUserLoading, router]);

  const handleResetTasks = async () => {
    if (!firestore || !userProfile) {
        toast({ variant: "destructive", title: "Error", description: "Firestore or user profile not available." });
        return;
    }

    setIsResetting(true);
    try {
        const userTasksRef = collection(firestore, 'users', userProfile.uid, 'tasks');
        const tasksSnapshot = await getDocs(userTasksRef);

        if (tasksSnapshot.empty) {
            toast({ title: "No tasks to reset." });
            setIsResetting(false);
            return;
        }

        const batch = writeBatch(firestore);
        tasksSnapshot.forEach((taskDoc) => {
            const taskRef = doc(firestore, 'users', userProfile.uid, 'tasks', taskDoc.id);
            batch.update(taskRef, {
                status: 'available',
                completedAt: null
            });
        });

        await batch.commit();

        toast({
            title: "Tasks Reset",
            description: "All user task progress has been reset.",
        });

    } catch (error) {
        console.error("Error resetting tasks: ", error);
        toast({
            variant: "destructive",
            title: "Reset Failed",
            description: "Could not reset tasks. Check console for details.",
        });
    } finally {
        setIsResetting(false);
    }
  };

  const handleTaskSubmit = async (data: Omit<Task, 'id'>) => {
    if (!firestore || !userProfile) return;
    try {
      if (editingTask) {
        // Update existing task
        const masterTaskRef = doc(firestore, 'tasks', editingTask.id);
        await setDoc(masterTaskRef, data, { merge: true });
        toast({ title: 'Task Updated', description: `"${data.title}" has been updated.` });
      } else {
        // Add new task
        const newId = `task-${Date.now()}`;
        const masterTaskRef = doc(firestore, 'tasks', newId);
        await setDoc(masterTaskRef, data);
        
        // Also add to the guest user's subcollection
        const userTaskRef = doc(firestore, 'users', userProfile.uid, 'tasks', newId);
        await setDoc(userTaskRef, { status: 'available', completedAt: null });
        toast({ title: 'Task Added', description: `"${data.title}" has been added globally.` });
      }
      setIsDialogOpen(false);
      setEditingTask(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: 'Error submitting task', description: e.message });
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
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Developer Tools</CardTitle>
                <CardDescription>Tools for easy prototyping and quick testing.</CardDescription>
            </div>
            <Button onClick={handleResetTasks} variant="outline" size="sm" disabled={isResetting}>
                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset User Progress
            </Button>
            </CardHeader>
        </Card>

        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>Add, edit, or delete global tasks.</CardDescription>
            </div>
            <DialogTrigger asChild>
                <Button size="sm" onClick={() => setEditingTask(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            </DialogTrigger>
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
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => setEditingTask(task)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
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
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            </DialogHeader>
            <TaskForm 
                task={editingTask} 
                onSubmit={handleTaskSubmit}
            />
        </DialogContent>
    </Dialog>
  );
}
