
import { Suspense } from 'react';
import RedeemView from './view';
import { Loader2 } from 'lucide-react';

export default function RedeemPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <RedeemView />
    </Suspense>
  );
}
