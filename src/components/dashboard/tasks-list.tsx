'use client';

import { PlayCircle, FileText, CheckCircle, Award, History, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CombinedTask } from '@/lib/types';
import { Separator } from '../ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type TasksListProps = {
  tasks: CombinedTask[];
  isGuestMode: boolean;
};

const taskIcons = {
  video: <PlayCircle className="h-5 w-5 text-primary" />,
  read: <FileText className="h-5 w-5 text-indigo-500" />,
};

const TaskItem = ({ task, disabled, index }: { task: CombinedTask, disabled: boolean, index: number }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
    exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
    className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-secondary"
  >
    <motion.div 
      key={task.status}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex-shrink-0 bg-primary/10 p-2 rounded-full"
    >
      {task.status === 'completed' ? <CheckCircle className="h-5 w-5 text-green-500" /> : taskIcons[task.type]}
    </motion.div>
    <div className="flex-grow">
      <p className="font-medium leading-tight">{task.title}</p>
      <p className="text-sm text-muted-foreground">{task.description}</p>
    </div>
    <div className="flex items-center gap-4">
      <Badge variant="secondary" className="flex items-center gap-1 font-bold text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
        <Award className="h-3 w-3" />
        <span>{task.points}</span>
      </Badge>
      
        {task.status === 'completed' ? (
        <div
          className={cn(
            "flex items-center justify-center w-28 h-9 rounded-md border text-sm",
            "border-green-500/30 bg-green-500/10 text-green-600 cursor-default"
          )}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Done
        </div>
      ) : (
        <Button asChild size="sm" variant="outline" className="w-28">
          <Link href={`/tasks/${task.id}`}>
            Open
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
      
    </div>
  </motion.div>
);

export default function TasksList({ tasks, isGuestMode }: TasksListProps) {
  const availableTasks = tasks.filter(task => task.status === 'available');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Available Tasks</h3>
        {availableTasks.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence>
              {availableTasks.map((task, i) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  disabled={isGuestMode || task.status === 'completed'}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 px-4 border-2 border-dashed rounded-lg"
          >
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="font-semibold">All tasks completed!</p>
            <p className="text-sm text-muted-foreground">Check back tomorrow for more.</p>
          </motion.div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div>
          <Separator className="my-6" />
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <History className="h-4 w-4" />
            Completed Tasks
          </h3>
          <div className="space-y-2">
            {completedTasks.map((task, i) => (
              <TaskItem 
                key={task.id} 
                task={task}
                disabled={true}
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
