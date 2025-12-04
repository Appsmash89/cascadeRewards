
'use client';

import { Suspense, useState } from "react";
import { useTheme } from "next-themes";
import { collection, doc, getDocs, query, where, setDoc } from "firebase/firestore";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/hooks/use-user";
import { useFirestore } from "@/firebase";
import { Loader2, Bell, Sparkles, ChevronRight, HelpCircle, FileText, Shield, Info, Edit, User, Mail, LogOut, FileQuestion, MessageCircle, Phone, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";

const SettingsSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground px-2">{title}</h3>
        <div className="bg-secondary/50 border rounded-lg divide-y">
            {children}
        </div>
    </div>
);

const SettingsRow = ({ icon, label, href, action }: { icon: React.ReactNode, label: string, href?: string, action?: React.ReactNode }) => {
    const content = (
        <div className="flex items-center justify-between p-3 gap-4">
            <div className="flex items-center gap-3">
                {icon}
                <span className="font-medium text-sm">{label}</span>
            </div>
            {action || (href && <ChevronRight className="h-5 w-5 text-muted-foreground" />)}
        </div>
    );
    
    if (href) {
        return (
            <Link href={href} className="block hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg">
                {content}
            </Link>
        )
    }
    return <div className="p-3 first:rounded-t-lg last:rounded-b-lg">{content}</div>
};

const ReferrerCard = () => {
    const { user, userProfile } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [referrerCode, setReferrerCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReferrerSubmit = async () => {
        if (!user || !firestore) return;
        if (referrerCode.trim() === '') {
            toast({ variant: 'destructive', title: 'Code is empty' });
            return;
        }

        setIsSubmitting(true);
        try {
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('referralCode', '==', `CASC-${referrerCode.toUpperCase()}`));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast({ variant: 'destructive', title: 'Invalid Code', description: 'No user found with that referral code.' });
                setIsSubmitting(false);
                return;
            }

            const referrerDoc = querySnapshot.docs[0];
            const referrerProfile = referrerDoc.data() as UserProfile;

            if (referrerProfile.uid === user.uid) {
                toast({ variant: 'destructive', title: 'Cannot Refer Yourself', description: 'You cannot use your own referral code.' });
                setIsSubmitting(false);
                return;
            }

            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, { referredBy: referrerProfile.uid }, { merge: true });

            toast({ title: 'Success!', description: `You have been referred by ${referrerProfile.displayName}.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (userProfile?.referredBy) {
        return null;
    }

    return (
        <SettingsSection title="Referral">
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-primary"/>
                    <div className="flex-1">
                        <h4 className="font-medium text-sm">Add a Referrer</h4>
                        <p className="text-xs text-muted-foreground">Enter the code of the person who referred you to unlock rewards.</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-sm">CASC-</span>
                    <Input 
                        value={referrerCode}
                        onChange={(e) => setReferrerCode(e.target.value.toUpperCase())}
                        placeholder="A9B3X2"
                        className="flex-1 font-mono tracking-wider"
                        disabled={isSubmitting}
                    />
                 </div>
                 <div className="flex justify-end">
                    <Button onClick={handleReferrerSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Code
                    </Button>
                 </div>
            </div>
        </SettingsSection>
    );
};


function SettingsView() {
  const { user, userProfile } = useUser();
  const firestore = useFirestore();
  const { setTheme, theme } = useTheme();

  if (!userProfile || !user) {
    return null;
  }
  
  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('') : '';

  const handleThemeChange = async (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
    if (firestore && user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, { settings: { theme: selectedTheme } }, { merge: true });
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
      <CardContent className="space-y-8">

        <SettingsSection title="Profile">
          <div className="flex items-center gap-4 p-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile.photoURL ?? undefined} alt={userProfile.displayName ?? ''}/>
              <AvatarFallback>{getInitials(userProfile.displayName ?? '')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{userProfile.displayName}</p>
              <p className="text-sm text-muted-foreground">{userProfile.email}</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
                <Link href="/profile">
                    <Edit className="h-4 w-4" />
                </Link>
            </Button>
          </div>
        </SettingsSection>
        
        <ReferrerCard />

        <SettingsSection title="Preferences">
             <div className="flex items-center justify-between p-3 gap-4">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">Theme</span>
                </div>
                <div className="flex items-center gap-1 bg-background p-1 rounded-lg border">
                    <Button size="sm" variant={theme === 'light' ? 'default' : 'ghost'} onClick={() => handleThemeChange('light')}>Light</Button>
                    <Button size="sm" variant={theme === 'dark' ? 'default' : 'ghost'} onClick={() => handleThemeChange('dark')}>Dark</Button>
                    <Button size="sm" variant={theme === 'system' ? 'default' : 'ghost'} onClick={() => handleThemeChange('system')}>System</Button>
                </div>
            </div>
            <SettingsRow 
                icon={<Bell className="h-5 w-5 text-primary" />} 
                label="Notifications" 
                action={<Switch defaultChecked={userProfile.settings.notificationsEnabled} />}
            />
        </SettingsSection>

        <SettingsSection title="Support">
            <SettingsRow 
                icon={<FileQuestion className="h-5 w-5 text-primary" />} 
                label="FAQ"
                href="#"
            />
            <SettingsRow 
                icon={<MessageCircle className="h-5 w-5 text-primary" />} 
                label="Report an Issue"
                href="/feedback"
            />
             <SettingsRow 
                icon={<Phone className="h-5 w-5 text-primary" />} 
                label="Contact Support"
                href="#"
            />
        </SettingsSection>

        <SettingsSection title="Legal">
            <SettingsRow 
                icon={<Shield className="h-5 w-5 text-primary" />} 
                label="Privacy Policy"
                href="#"
            />
             <SettingsRow 
                icon={<FileText className="h-5 w-5 text-primary" />} 
                label="Terms of Service"
                href="#"
            />
        </SettingsSection>

        <SettingsSection title="App Info">
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">Version</span>
                </div>
                <span className="text-sm text-muted-foreground">1.0.0</span>
            </div>
        </SettingsSection>
        
      </CardContent>
    </Card>
  );
}


export default SettingsView;

    
