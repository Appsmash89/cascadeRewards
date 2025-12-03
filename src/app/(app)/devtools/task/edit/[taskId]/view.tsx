
'use client';

import { useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Task, AppSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import TaskForm from '@/components/devtools/task-form';
import { z } from 'zod';
import { useEffect, useMemo } from 'react';

const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  points: z.coerce.number().int().positive(),
  type: z.enum(['read', 'video']),
  category: z.string().min(1, "Please select a category."),
  link: z.string().url().optional().or(z.literal('')),
  content: z.string().min(10),
});

export default function EditTaskView({ taskId }: { taskId: string | null }) {
  const firestore = useFirestore();
  const { user, isAdmin, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const isNew = taskId === null;

  const taskRef = useMemoFirebase(() => 
    firestore && taskId ? doc(firestore, 'tasks', taskId) : null,
    [firestore, taskId]
  );
  const { data: task, isLoading: isTaskLoading } = useDoc<Task>(taskRef);

  const categoriesRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'app-settings', 'taskCategories') : null,
    [firestore]
  );
  const { data: categoriesData, isLoading: areCategoriesLoading } = useDoc<AppSettings>(categoriesRef);
  const categories = categoriesData?.taskCategories || [];

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isUserLoading, router]);

  const handleTaskSubmit = async (data: z.infer<typeof taskSchema>) => {
    if (!firestore || !user) return;
    try {
      const taskDataWithCreator = { ...data, creatorUid: user.uid };

      if (isNew) {
        // Add new task
        const collectionRef = collection(firestore, 'tasks');
        await addDoc(collectionRef, taskDataWithCreator);
        
        toast({ title: 'Task Added', description: `"${data.title}" has been added globally.` });
      } else {
        // Update existing task, preserving original creator
        const originalCreator = task?.creatorUid ?? user.uid;
        const taskDataForUpdate = { ...data, creatorUid: originalCreator };
        const masterTaskRef = doc(firestore, 'tasks', taskId!);
        await setDoc(masterTaskRef, taskDataForUpdate, { merge: true });
        toast({ title: 'Task Updated', description: `"${data.title}" has been updated.` });
      }
      router.push('/devtools');
      router.refresh(); 
    } catch (e: any) {
      toast({ variant: "destructive", title: 'Error submitting task', description: e.message });
    }
  };

  const isLoading = isTaskLoading || areCategoriesLoading || isUserLoading;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
     <div className="flex flex-1 items-center justify-center bg-background">
       <p>Access denied. Redirecting...</p>
     </div>
   );
 }

  if (!isNew && !task) {
    return <p>Task not found.</p>;
  }

  return (
    <Card>
        <CardHeader>
             <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
              <Link href="/devtools">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to DevTools
              </Link>
            </Button>
            <CardTitle>{isNew ? 'Create New Task' : 'Edit Task'}</CardTitle>
            <CardDescription>
                {isNew ? 'Fill out the details for the new global task.' : `Editing the task: "${task?.title}"`}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {(!isLoading && (task || isNew)) && (
                <TaskForm 
                    task={task} 
                    categories={categories}
                    onSubmit={handleTaskSubmit}
                />
            )}
        </CardContent>
    </Card>
  );
}
