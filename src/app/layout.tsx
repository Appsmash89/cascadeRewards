
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import FloatingDevTools from '@/components/floating-dev-tools';
import { useState, Suspense } from 'react';
import { tasks as initialTasksData } from '@/lib/data';
import { FirebaseClientProvider } from '@/firebase';
import { AppProvider } from '@/context/app-context';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

// This is a workaround to make metadata work with client components
// export const metadata: Metadata = {
//   title: 'Cascade Rewards',
//   description: 'Earn points for tasks and referrals.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [tasks, setTasks] = useState(initialTasksData);
  const pathname = usePathname();

  const handleResetTasks = () => {
    // This is a bit of a hack, but we'll use a custom event to communicate
    // between the layout and the dashboard page.
    window.dispatchEvent(new CustomEvent('reset-tasks'));
  };

  const isLoginPage = pathname === '/';

  return (
    <html lang="en" className="h-full">
      <head>
        <title>Cascade Rewards</title>
        <meta name="description" content="Earn points for tasks and referrals." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="font-body antialiased bg-stone-900 flex justify-center">
        <FirebaseClientProvider>
          <AppProvider>
            <div className="relative w-full max-w-md bg-background min-h-screen flex flex-col">
              <Suspense fallback={
                <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }>
                {children}
              </Suspense>
              {!isLoginPage && (
                <Suspense>
                  <FloatingDevTools onResetTasks={handleResetTasks} />
                </Suspense>
              )}
              <Toaster />
            </div>
          </AppProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
