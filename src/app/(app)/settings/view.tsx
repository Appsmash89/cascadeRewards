
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
import { Loader2, Bell, Moon, Sparkles, Plus, Link as LinkIcon, UserPlus, Info, MessageSquare, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  const currentTheme = userProfile?.settings.theme ?? 'default';

  const handleThemeChange = (selectedTheme: 'default' | 'reactbits' | 'midnight') => {
    setTheme(selectedTheme);
    if (userProfile && firestore) {
      const userDocRef = doc(firestore, 'users', userProfile.uid);
      updateDocumentNonBlocking(userDocRef, { 'settings.theme': selectedTheme });
    }
  };
  
  const handleNotificationsChange = (enabled: boolean) => {
     if (userProfile && !isGuestMode && firestore) {
      const userDocRef = doc(firestore, 'users', userProfile.uid);
      updateDocumentNonBlocking(userDocRef, { 'settings.notificationsEnabled': enabled });
    }
  };

  const handleReferrerCodeSubmit = async () => {
    // Construct the full code from the prefix and user input
    const fullCode = `CASC-${referrerCode.trim().toUpperCase()}`;
    if (!firestore || !userProfile || !referrerCode.trim()) {
      toast({ variant: 'destructive', title: 'Invalid Code', description: 'Please enter a valid referral code.' });
      return;
    }
    
    setIsSubmittingCode(true);

    try {
      const usersRef = collection(firestore, 'users');
      // Query using the full, constructed code
      const q = query(usersRef, where('referralCode', '==', fullCode));
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
        <div className="p-4 rounded-lg bg-secondary border space-y-4">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-muted-foreground"/>
              <Label htmlFor="theme-switcher" className="font-medium">App Theme</Label>
            </div>
            <Select value={currentTheme} onValueChange={handleThemeChange} disabled={isGuestMode}>
              <SelectTrigger id="theme-switcher" className={cn(isGuestMode && "cursor-not-allowed")}>
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="reactbits">ReactBits</SelectItem>
                <SelectItem value="midnight">Midnight</SelectItem>
              </SelectContent>
            </Select>
        </div>
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
        
        <Link href="/onboarding" id="task-preferences" className="flex items-center justify-between p-4 rounded-lg bg-secondary border hover:bg-accent/50 transition-colors cursor-pointer" aria-disabled={isGuestMode}>
            <div className="flex items-center gap-4">
                <Sparkles className="h-5 w-5 text-muted-foreground"/>
                <Label className="font-medium cursor-pointer">Task Preferences</Label>
            </div>
            <Plus className="h-5 w-5 text-muted-foreground" />
        </Link>

        <Link href="/feedback" id="feedback" className="flex items-center justify-between p-4 rounded-lg bg-secondary border hover:bg-accent/50 transition-colors cursor-pointer" aria-disabled={isGuestMode}>
            <div className="flex items-center gap-4">
                <MessageSquare className="h-5 w-5 text-muted-foreground"/>
                <Label className="font-medium cursor-pointer">Feedback & Suggestions</Label>
            </div>
            <Plus className="h-5 w-5 text-muted-foreground" />
        </Link>
      </CardContent>
    </Card>
  );
}


export default SettingsView;
