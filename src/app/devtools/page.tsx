
import { Suspense } from 'react';
import DevToolsView from './view';
import { Loader2 } from 'lucide-react';

export default function DevToolsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <DevToolsView />
    </Suspense>
  );
}
