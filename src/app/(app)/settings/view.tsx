'use client';

import { Suspense, useState } from "react";
import { useTheme } from "next-themes";
import { collection, doc, getDocs, query, where, writeBatch } from "firebase/firestore";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/hooks/use-user";
import { useFirestore } from "@/firebase";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Loader2, Bell, Moon, Sparkles, ArrowRight, Link as LinkIcon, UserPlus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const GUEST_EMAIL = 'guest.dev@cascade.app';

function SettingsView() {
  const { user, userProfile } = useUser();
  const firestore = useFirestore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [referrerCode, setReferrerCode] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  const isGuestMode = user?.email === GUEST_EMAIL;

  if (!userProfile) {
    return null;
  }

  const notificationsEnabled = userProfile?.settings.notificationsEnabled ?? true;
  const isDarkMode = theme === 'dark';

  const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);

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
  };

  const handleReferrerCodeSubmit = async () => {
    if (!firestore || !userProfile || !referrerCode.trim()) {
      toast({ variant: 'destructive', title: 'Invalid Code', description: 'Please enter a valid referral code.' });
      return;
    }
    
    setIsSubmittingCode(true);

    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('referralCode', '==', referrerCode.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Referrer Not Found', description: 'The referral code does not exist.' });
        setIsSubmittingCode(false);
        return;
      }
      
      const referrerDoc = querySnapshot.docs[0];
      if (referrerDoc.id === userProfile.uid) {
        toast({ variant: 'destructive', title: 'Invalid Action', description: 'You cannot refer yourself.' });
        setIsSubmittingCode(false);
        return;
      }

      const userDocRef = doc(firestore, 'users', userProfile.uid);
      await updateDocumentNonBlocking(userDocRef, { 'referredBy': referrerDoc.id });

      toast({ title: 'Success!', description: `You have been referred by ${referrerDoc.data().displayName}.` });
      setReferrerCode('');

    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsSubmittingCode(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your account and app preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border">
          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5 text-muted-foreground"/>
            <Label htmlFor="notifications" className="font-medium">Push Notifications</Label>
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
            <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
          </div>
          <Switch 
            id="dark-mode" 
            checked={isDarkMode} 
            onCheckedChange={handleThemeChange} 
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border">
          <div className="flex items-center gap-4">
            <Sparkles className="h-5 w-5 text-muted-foreground"/>
            <Label htmlFor="task-preferences" className="font-medium">Task Preferences</Label>
          </div>
          <Button asChild variant="ghost" size="icon" disabled={isGuestMode}>
            <Link href="/onboarding" id="task-preferences">
                <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {!userProfile.referredBy && !isGuestMode && (
          <div className="space-y-3 p-4 rounded-lg bg-secondary border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserPlus className="h-5 w-5 text-muted-foreground"/>
                <Label htmlFor="referrer-code" className="font-medium">Enter Referrer Code</Label>
              </div>
              <Button asChild variant="ghost" size="icon">
                <Link href="/stats/referrer-info">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                id="referrer-code" 
                placeholder="CASC-XXXXXX"
                value={referrerCode}
                onChange={e => setReferrerCode(e.target.value)}
                disabled={isSubmittingCode}
              />
              <Button onClick={handleReferrerCodeSubmit} disabled={isSubmittingCode || !referrerCode.trim()}>
                {isSubmittingCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}


export default SettingsView;
