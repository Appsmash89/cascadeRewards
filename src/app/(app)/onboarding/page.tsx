
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import OnboardingView from './view';

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <OnboardingView />
    </Suspense>
  );
}
