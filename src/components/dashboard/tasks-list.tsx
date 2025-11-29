
'use client';

import { PlayCircle, FileText, CheckCircle, Award, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CombinedTask } from '@/lib/types';
import { Separator } from '../ui/separator';

type TasksListProps = {
  tasks: CombinedTask[];
  onCompleteTask: (task: CombinedTask) => void;
  isGuestMode: boolean;
};

const taskIcons = {
  video: <PlayCircle className="h-5 w-5 text-primary" />,
  read: <FileText className="h-5 w-5 text-indigo-500" />,
};

const TaskItem = ({ task, onComplete, disabled }: { task: CombinedTask, onComplete: () => void, disabled: boolean }) => (
  <div className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-secondary">
    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
      {task.status === 'completed' ? <CheckCircle className="h-5 w-5 text-green-500" /> : taskIcons[task.type]}
    </div>
    <div className="flex-grow">
      <p className="font-medium leading-tight">{task.title}</p>
      <p className="text-sm text-muted-foreground">{task.description}</p>
    </div>
    <div className="flex items-center gap-4">
      <Badge variant="secondary" className="flex items-center gap-1 font-bold text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
        <Award className="h-3 w-3" />
        <span>{task.points}</span>
      </Badge>
      <Button 
        size="sm" 
        variant={task.status === 'completed' ? 'ghost' : 'outline'}
        onClick={onComplete}
        disabled={disabled}
        className={cn(
          "w-28 transition-all duration-300",
          task.status === 'completed' && "border-green-500/30 bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700 cursor-default"
        )}
      >
        {task.status === 'completed' ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Done
          </>
        ) : 'Complete'}
      </Button>
    </div>
  </div>
);

export default function TasksList({ tasks, onCompleteTask, isGuestMode }: TasksListProps) {
  const availableTasks = tasks.filter(task => task.status === 'available');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Available Tasks</h3>
        {availableTasks.length > 0 ? (
          <div className="space-y-2">
            {availableTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onComplete={() => onCompleteTask(task)}
                disabled={isGuestMode || task.status === 'completed'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="font-semibold">All tasks completed!</p>
            <p className="text-sm text-muted-foreground">Check back tomorrow for more.</p>
          </div>
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
            {completedTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onComplete={() => {}}
                disabled={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
