
'use client';

import { PlayCircle, FileText, CheckCircle, Star, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CombinedTask } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent } from '../ui/card';

type TasksListProps = {
  tasks: CombinedTask[];
  isGuestMode: boolean;
  isCompletedView?: boolean;
};

const taskIcons: { [key: string]: React.ReactNode } = {
  video: <PlayCircle className="h-5 w-5 text-primary" />,
  read: <FileText className="h-5 w-5 text-indigo-500" />,
  default: <Star className="h-5 w-5 text-gray-500" />,
};

const TaskItem = ({ task, index }: { task: CombinedTask, index: number }) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const getIcon = () => {
    if (task.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return taskIcons[task.type] || taskIcons.default;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
      className="bg-secondary/50 rounded-lg"
    >
      <div 
        className="flex items-center gap-4 p-3 cursor-pointer"
        onClick={handleClick}
      >
        <motion.div 
          key={task.status}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0 bg-background p-2 rounded-full shadow-inner"
        >
          {getIcon()}
        </motion.div>
        <div className="flex-grow min-w-0">
          <p className="font-medium leading-tight break-words">{task.title}</p>
          <p className="text-sm text-muted-foreground break-words truncate">{task.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
            animate={task.status === 'completed' ? { scale: [1, 1.2, 1] } : {}}
            transition={task.status === 'completed' ? { duration: 0.3 } : {}}
          >
            <Badge className="flex items-center gap-1 font-bold text-base bg-amber-400/20 text-amber-600 border-amber-400/30 hover:bg-amber-400/30">
              <Star className="h-3 w-3" />
              <span>{task.points}</span>
            </Badge>
          </motion.div>
          
          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </div>
       <AnimatePresence>
        {isExpanded && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
            >
                <div className="px-4 pb-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-background/50 rounded-md border">
                        <h4 className="font-semibold">Instructions</h4>
                        <p>{task.content}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => router.push(`/tasks/${task.id}`)}
                                className="text-primary font-semibold text-sm"
                            >
                                Go to Task →
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
       </AnimatePresence>
    </motion.div>
  );
};


export default function TasksList({ tasks, isGuestMode, isCompletedView }: TasksListProps) {
  
  return (
    <div className="space-y-2">
      {tasks.length > 0 ? (
        <AnimatePresence>
          {tasks.map((task, i) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              index={i}
            />
          ))}
        </AnimatePresence>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 px-4 border-2 border-dashed rounded-lg"
        >
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="font-semibold">{isCompletedView ? "No tasks completed yet" : "All tasks completed!"}</p>
          <p className="text-sm text-muted-foreground">{isCompletedView ? "Get started on your first task." : "Check back tomorrow for more."}</p>
        </motion.div>
      )}
    </div>
  );
}
