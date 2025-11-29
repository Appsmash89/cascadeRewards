
'use client';

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { doc } from "firebase/firestore";

import DashboardHeader from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/dashboard/bottom-nav";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/hooks/use-user";
import { useFirestore } from "@/firebase";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Loader2, Bell, Moon } from "lucide-react";

function SettingsView() {
  const { userProfile, isUserLoading } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  const isGuestMode = searchParams.get('mode') === 'guest';
  
  if (isUserLoading && !isGuestMode) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!userProfile && !isGuestMode) {
    return (
       <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Could not load user profile.</p>
      </div>
    )
  }

  // Use guest defaults or real user settings
  const notificationsEnabled = isGuestMode ? true : userProfile?.settings.notificationsEnabled ?? true;
  // For theme, we check the current `next-themes` state first.
  const isDarkMode = theme === 'dark';

  const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);

    // If a user is logged in, update their preference in Firestore
    if (userProfile && firestore) {
      const userDocRef = doc(firestore, 'users', userProfile.uid);
      updateDocumentNonBlocking(userDocRef, { 'settings.darkMode': isDark });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary dark:bg-neutral-950">
      <DashboardHeader user={userProfile} />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-24">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Manage your account and app preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
              <div className="flex items-center gap-4">
                <Bell className="h-5 w-5 text-muted-foreground"/>
                <Label htmlFor="notifications" className="text-base font-normal">Push Notifications</Label>
              </div>
              <Switch id="notifications" checked={notificationsEnabled} disabled={isGuestMode}/>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
              <div className="flex items-center gap-4">
                <Moon className="h-5 w-5 text-muted-foreground"/>
                <Label htmlFor="dark-mode" className="text-base font-normal">Dark Mode</Label>
              </div>
              <Switch 
                id="dark-mode" 
                checked={isDarkMode} 
                onCheckedChange={handleThemeChange} 
              />
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}


export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SettingsView />
    </Suspense>
  )
}
