
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
import { Loader2, Bell, Moon, KeyRound } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const GUEST_EMAIL = 'guest.dev@cascade.app';
const PIN_STORAGE_KEY = 'cascade-admin-pin';


function PinSettings() {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    if (storedPin) {
      setCurrentPin(storedPin);
    } else {
      setCurrentPin('----'); // Default if no pin is set
    }
  }, []);

  const handleSetPin = () => {
    setError('');
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError('PIN must be 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    setCurrentPin(newPin);
    setNewPin('');
    setConfirmPin('');
    toast({
      title: "PIN Updated",
      description: "Your admin access PIN has been changed.",
    });
  };

  return (
    <>
      <Separator className="my-6" />
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <KeyRound className="h-5 w-5 text-muted-foreground"/>
          <h3 className="text-lg font-medium">Admin PIN</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Current PIN: <span className="font-mono tracking-widest">{currentPin}</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-pin">New 4-Digit PIN</Label>
            <Input 
              id="new-pin" 
              type="password" 
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="font-mono tracking-widest"
              placeholder="••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm PIN</Label>
            <Input 
              id="confirm-pin" 
              type="password" 
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="font-mono tracking-widest"
              placeholder="••••"
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end">
          <Button onClick={handleSetPin}>Set New PIN</Button>
        </div>
      </div>
    </>
  );
}


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

        {isGuestMode && <PinSettings />}

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
