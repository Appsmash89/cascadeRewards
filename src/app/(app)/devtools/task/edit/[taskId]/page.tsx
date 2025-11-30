
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import EditTaskView from './view';

export default function EditTaskPage({ params }: { params: { taskId: string } }) {
  const isNew = params.taskId === 'new';
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <EditTaskView taskId={isNew ? null : params.taskId} />
    </Suspense>
  );
}
