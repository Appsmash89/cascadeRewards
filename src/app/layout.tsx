
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from 'react';
import { FirebaseClientProvider } from '@/firebase';
import { AppProvider } from '@/context/app-context';
import { Loader2 } from 'lucide-react';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from 'framer-motion';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={cn("h-full font-sans antialiased", inter.variable)} suppressHydrationWarning>
      <head>
        <title>Cascade Rewards</title>
        <meta name="description" content="Earn points for tasks and referrals." />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="flex justify-center bg-secondary">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AppProvider>
              <div className="relative w-full max-w-md bg-background min-h-[100svh] flex flex-col shadow-2xl shadow-black/10">
                <Suspense fallback={
                  <div className="flex min-h-screen w-full items-center justify-center bg-background">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }>
                  <AnimatePresence mode="wait">
                    {children}
                  </AnimatePresence>
                </Suspense>
                <Toaster />
              </div>
            </AppProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
