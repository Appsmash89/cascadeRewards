
'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import EarningsBreakdownView from './view';

export default function EarningsBreakdownPage({ params }: { params: { userId: string } }) {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <EarningsBreakdownView userId={params.userId} />
    </Suspense>
  );
}
