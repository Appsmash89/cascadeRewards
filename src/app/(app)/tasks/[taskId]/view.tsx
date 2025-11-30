
'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp, increment, setDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Loader2, Award, ArrowLeft, PlayCircle, FileText, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Task, UserTask } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { motion } from 'framer-motion';
import React from 'react';

const taskIcons = {
  video: <PlayCircle className="h-6 w-6 text-primary" />,
  read: <FileText className="h-6 w-6 text-indigo-500" />,
};

export default function TaskDetailView({ taskId }: { taskId: string }) {
  const firestore = useFirestore();
  const { user, userProfile } = useUser();
  const { toast } = useToast();

  const taskRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'tasks', taskId) : null,
    [firestore, taskId]
  );
  const { data: task, isLoading: isTaskLoading } = useDoc<Task>(taskRef);

  const userTaskRef = useMemoFirebase(() =>
    firestore && user ? doc(firestore, 'users', user.uid, 'tasks', taskId) : null,
    [firestore, user, taskId]
  );
  const { data: userTask, isLoading: isUserTaskLoading } = useDoc<UserTask>(userTaskRef);

  const handleStartTask = (e: React.MouseEvent) => {
    if (!userProfile || !firestore || !task) return;

    // Prevent navigation if there's no link
    if (!task.link) {
      e.preventDefault();
    }
    
    // Only update status if it's currently 'available'
    if (userTask?.status === 'available' || !userTask) {
      const userTaskDocRef = doc(firestore, 'users', userProfile.uid, 'tasks', taskId);
      // Use setDoc with merge to create or update
      setDoc(userTaskDocRef, { status: 'in-progress' }, { merge: true })
        .catch(error => {
          console.error("Error starting task:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not start the task.",
          });
        });

      toast({
        title: "Task Started!",
        description: `The task "${task.title}" is now in progress.`,
      });
    }
  };
  
  const handleUpload = () => {
     if (!userProfile || !firestore || !task) return;
     // This is a placeholder for the actual upload logic
     // You would trigger a file input, upload to Firebase Storage,
     // then get the URL and update the userTask document.
     toast({
         title: "Upload not implemented",
         description: "This is where the screenshot upload would be triggered.",
     });
  };

  const isLoading = isTaskLoading || isUserTaskLoading;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!task) {
    return <p>Task not found.</p>;
  }

  const isCompleted = userTask?.status === 'completed';
  const isInProgress = userTask?.status === 'in-progress';
  const isAvailable = !userTask || userTask.status === 'available';

  return (
    <Card>
      <CardHeader>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to tasks
            </Link>
          </Button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-secondary p-3 rounded-full">
                {taskIcons[task.type]}
              </div>
              <div>
                <CardTitle className="text-2xl">{task.title}</CardTitle>
                <CardDescription>{task.description}</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1.5 text-lg font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
              <Award className="h-5 w-5" />
              <span>{task.points}</span>
            </Badge>
          </div>
        </motion.div>
      </CardHeader>
      <CardContent>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="prose dark:prose-invert max-w-none mt-4 border-t pt-6">
          <h3 className="text-lg font-semibold">How to Complete This Task</h3>
          <div className="whitespace-pre-wrap">{task.content}</div>
        </motion.div>
        <motion.div 
          className="mt-8 flex justify-end gap-2"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
        >
          {isInProgress && (
              <Button 
                  size="lg" 
                  variant="outline"
                  className="h-12 rounded-lg text-lg"
                  onClick={handleUpload}
              >
                  <Upload className="mr-2 h-5 w-5"/>
                  Upload
              </Button>
          )}
          <Button 
              asChild={!!task.link}
              size="lg" 
              className="h-12 shadow-lg shadow-primary/30 rounded-lg text-lg"
              disabled={isCompleted}
              onClick={handleStartTask}
          >
            {task.link ? (
              <Link href={task.link} target="_blank" rel="noopener noreferrer">
                {isCompleted ? 'Completed' : (isInProgress ? 'Continue' : 'Start')}
              </Link>
            ) : (
              <span>{isCompleted ? 'Completed' : (isInProgress ? 'Continue' : 'Start')}</span>
            )}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
