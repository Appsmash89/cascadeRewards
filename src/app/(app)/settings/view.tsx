
'use client';

import { Suspense, useState } from "react";
import { useTheme } from "next-themes";
import { collection, doc, getDocs, query, where, setDoc } from "firebase/firestore";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/hooks/use-user";
import { useFirestore } from "@/firebase";
import { Loader2, Bell, Sparkles, ChevronRight, HelpCircle, FileText, Shield, Info, Edit, User, Mail, LogOut, FileQuestion, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

    
