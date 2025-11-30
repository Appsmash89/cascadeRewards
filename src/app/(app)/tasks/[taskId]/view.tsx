'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp, increment } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Loader2, Award, ArrowLeft, PlayCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Task, UserTask } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { motion } from 'framer-motion';

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

  const handleStartTask = () => {
    // This is where you would put logic to start the task,
    // e.g., navigate to a video, open a document, etc.
    // For now, we'll just complete it immediately for demonstration.
    if (!userProfile || !firestore || !task) return;

    const userTaskDocRef = doc(firestore, 'users', userProfile.uid, 'tasks', taskId);
    const userProfileRef = doc(firestore, 'users', userProfile.uid);

    // Update the task status to 'completed'
    updateDocumentNonBlocking(userTaskDocRef, {
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
    
    // Potentially navigate back to dashboard or show a completion message
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

  return (
    <div className="relative pb-4">
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
            <p>
              This is a placeholder for the detailed instructions for completing the task.
              You can add any content here, such as embedded videos, text, images, or links.
            </p>
            <p>
              For example, if this is a 'video' task, you could embed the video player here. If it's a 'read' task, you could display the article content directly.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Step 1: Do the first thing.</li>
              <li>Step 2: Do the second thing.</li>
              <li>Step 3: Profit! (and by profit, we mean points).</li>
            </ul>
          </motion.div>
          <motion.div 
            className="mt-8 flex justify-end"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
          >
            <Button 
              size="lg" 
              className="h-12 shadow-lg shadow-primary/30 rounded-lg text-lg"
              onClick={handleStartTask}
              disabled={isCompleted}
            >
              {isCompleted ? 'Completed' : 'Start Task'}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
