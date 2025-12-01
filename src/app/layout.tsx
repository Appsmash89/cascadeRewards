
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Suspense, useEffect } from 'react';
import { FirebaseClientProvider, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { AppProvider } from '@/context/app-context';
import { Loader2 } from 'lucide-react';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from 'framer-motion';
import { doc } from 'firebase/firestore';
import type { AppSettings } from '@/lib/types';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

// A new component to fetch and apply global settings
function GlobalSettingsManager({ children }: { children: React.ReactNode }) {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'app-settings', 'global') : null, 
    [firestore]
  );
  const { data: appSettings } = useDoc<AppSettings>(settingsRef);

  useEffect(() => {
    const multiplier = appSettings?.fontSizeMultiplier ?? 1;
    document.documentElement.style.setProperty('--font-size-multiplier', String(multiplier));
  }, [appSettings]);

  return <>{children}</>;
}


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
            <GlobalSettingsManager>
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
            </GlobalSettingsManager>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
