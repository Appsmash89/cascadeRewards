
'use client';

import DashboardHeader from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/hooks/use-user";
import { Loader2, Bell, Moon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function SettingsView() {
  const { userProfile, isUserLoading } = useUser();
  const searchParams = useSearchParams();
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
  const darkMode = isGuestMode ? false : userProfile?.settings.darkMode ?? false;


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
                <Label htmlFor="notifications" className="text-base">Push Notifications</Label>
              </div>
              <Switch id="notifications" checked={notificationsEnabled} disabled={isGuestMode}/>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
              <div className="flex items-center gap-4">
                <Moon className="h-5 w-5 text-muted-foreground"/>
                <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
              </div>
              <Switch id="dark-mode" checked={darkMode} disabled={isGuestMode} />
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

