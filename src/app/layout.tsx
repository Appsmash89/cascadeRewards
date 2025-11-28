
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import FloatingDevTools from '@/components/floating-dev-tools';
import { useState } from 'react';
import { tasks as initialTasksData } from '@/lib/data';

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

  const handleResetTasks = () => {
    // This is a bit of a hack, but we'll use a custom event to communicate
    // between the layout and the dashboard page.
    window.dispatchEvent(new CustomEvent('reset-tasks'));
  };

  return (
    <html lang="en" className="h-full">
      <head>
        <title>Cascade Rewards</title>
        <meta name="description" content="Earn points for tasks and referrals." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="font-body antialiased bg-stone-900 flex justify-center">
        <div className="relative w-full max-w-md bg-background min-h-screen flex flex-col">
          {children}
          <FloatingDevTools onResetTasks={handleResetTasks} />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
