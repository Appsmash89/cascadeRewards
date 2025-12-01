
'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import CategoriesView from './view';

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CategoriesView />
    </Suspense>
  );
}
