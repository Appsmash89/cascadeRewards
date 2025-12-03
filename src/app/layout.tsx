
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
import { useUser } from '@/hooks/use-user';

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
  const { userProfile } = useUser(); // Get userProfile from context

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Apply font size multiplier
    const multiplier = appSettings?.fontSizeMultiplier ?? 1;
    root.style.setProperty('--font-size-multiplier', String(multiplier));

    // Apply pastel background theme
    const pastelEnabled = appSettings?.pastelBackgroundEnabled ?? false;
    const pastelColor = appSettings?.pastelBackgroundColor ?? '240 60% 95%';

    if (pastelEnabled) {
      root.style.setProperty('--pastel-background-hsl', pastelColor);
      root.classList.add('pastel-theme-active');
    } else {
      root.classList.remove('pastel-theme-active');
    }
    
    // Apply global theme from user profile, not global settings
    const theme = userProfile?.settings.theme ?? 'default';
    body.classList.remove('theme-default', 'theme-reactbits', 'theme-midnight', 'theme-sunrise', 'theme-forest');
    body.classList.add(`theme-${theme}`);

  }, [appSettings, userProfile]);

  return (
    <div 
      className={cn(
        "relative w-full max-w-md bg-background min-h-[100svh] flex flex-col shadow-2xl shadow-black/10"
      )}
    >
      {children}
    </div>
  );
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
      <body className="flex justify-center bg-secondary theme-default">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AppProvider>
              <GlobalSettingsManager>
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
              </GlobalSettingsManager>
            </AppProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
