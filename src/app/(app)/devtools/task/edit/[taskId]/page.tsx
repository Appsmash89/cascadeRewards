'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import EditTaskView from './view';
import { useParams } from 'next/navigation';

export default function EditTaskPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const isNew = taskId === 'new';

  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <EditTaskView taskId={isNew ? null : taskId} />
    </Suspense>
  );
}
