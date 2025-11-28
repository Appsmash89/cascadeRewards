'use client'

import { useState } from 'react'
import { PlayCircle, FileText, CheckCircle, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/types'

type TasksListProps = {
  initialTasks: Task[];
}

const taskIcons = {
  video: <PlayCircle className="h-5 w-5 text-muted-foreground" />,
  read: <FileText className="h-5 w-5 text-muted-foreground" />,
}

export default function TasksList({ initialTasks }: TasksListProps) {
  const [tasks, setTasks] = useState(initialTasks.map(task => ({ ...task, isCompleted: false })))

  const handleComplete = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, isCompleted: true } : task
    ));
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-4 p-2 rounded-lg transition-colors hover:bg-muted/50">
          <div className="flex-shrink-0">
            {task.isCompleted ? <CheckCircle className="h-5 w-5 text-green-500" /> : taskIcons[task.type]}
          </div>
          <div className="flex-grow">
            <p className="font-medium">{task.title}</p>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span>{task.points}</span>
            </Badge>
            <Button 
              size="sm" 
              variant={task.isCompleted ? 'ghost' : 'outline'}
              onClick={() => handleComplete(task.id)}
              disabled={task.isCompleted}
              className={cn(
                "w-28 transition-all duration-300",
                task.isCompleted && "border-green-500 bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700"
              )}
            >
              {task.isCompleted ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Done
                </>
              ) : 'Complete'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
