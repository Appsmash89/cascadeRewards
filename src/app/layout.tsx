import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import BottomNav from '@/components/dashboard/bottom-nav';

export const metadata: Metadata = {
  title: 'Cascade Rewards',
  description: 'Earn points for tasks and referrals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="font-body antialiased bg-stone-900 flex justify-center">
        <div className="relative w-full max-w-md bg-background min-h-screen flex flex-col">
          <div className="flex-1 pb-20">
            {children}
          </div>
          <BottomNav />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
