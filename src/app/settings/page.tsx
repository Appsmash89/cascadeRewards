
'use client';

import DashboardHeader from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/firebase";
import { useEffect, useState } from "react";
import type { User, UserProfile } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";


export default function SettingsPage() {
  const { user, userProfile, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('mode') === 'guest';
  const [displayUser, setDisplayUser] = useState<User | null>(null);

  useEffect(() => {
    if (isGuestMode) {
      const guestUser: User = {
        name: 'Guest User',
        avatarUrl: `https://picsum.photos/seed/guest/100/100`,
        points: 1250,
        referralCode: 'CASC-GUEST',
        referralLevel: 0,
      };
      setDisplayUser(guestUser);
    } else if (user && userProfile) {
      const appUser: User = {
        name: userProfile.displayName,
        avatarUrl: userProfile.photoURL,
        points: userProfile.points,
        referralCode: userProfile.referralCode,
        referralLevel: userProfile.level,
      };
      setDisplayUser(appUser);
    }
  }, [isGuestMode, user, userProfile]);

  useEffect(() => {
    if (!isUserLoading && !user && !isGuestMode) {
      router.push('/');
    }
  }, [user, isUserLoading, isGuestMode, router]);

  if (isUserLoading || (!displayUser && !isGuestMode)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!displayUser) {
    return (
       <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader user={displayUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Manage your account and app settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <p className="text-muted-foreground">App settings will be available here.</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
