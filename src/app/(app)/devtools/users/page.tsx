'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import UserManagementView from './view';

export default function UserManagementPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <UserManagementView />
    </Suspense>
  );
}
