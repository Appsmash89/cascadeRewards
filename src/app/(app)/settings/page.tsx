
'use client';

import { Suspense, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { doc } from "firebase/firestore";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/hooks/use-user";
import { useFirestore } from "@/firebase";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Loader2, Bell, Moon } from "lucide-react";

const GUEST_EMAIL = 'guest.dev@cascade.app';


function SettingsView() {
  const { user, userProfile } = useUser();
  const firestore = useFirestore();
  const { theme, setTheme } = useTheme();
  const isGuestMode = user?.email === GUEST_EMAIL;

  if (!userProfile) {
    return null;
  }

  // Use guest defaults or real user settings
  const notificationsEnabled = userProfile?.settings.notificationsEnabled ?? true;
  const isDarkMode = theme === 'dark';

  const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);

    // If a user is logged in (and not a guest), update their preference
    if (userProfile && !isGuestMode && firestore) {
      const userDocRef = doc(firestore, 'users', userProfile.uid);
      updateDocumentNonBlocking(userDocRef, { 'settings.darkMode': isDark });
    }
  };
  
  const handleNotificationsChange = (enabled: boolean) => {
     if (userProfile && !isGuestMode && firestore) {
      const userDocRef = doc(firestore, 'users', userProfile.uid);
      updateDocumentNonBlocking(userDocRef, { 'settings.notificationsEnabled': enabled });
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your account and app preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border">
          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5 text-muted-foreground"/>
            <Label htmlFor="notifications" className="text-base font-normal">Push Notifications</Label>
          </div>
          <Switch 
            id="notifications" 
            checked={notificationsEnabled} 
            onCheckedChange={handleNotificationsChange}
            disabled={isGuestMode}
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border">
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
  );
}


export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SettingsView />
    </Suspense>
  )
}
