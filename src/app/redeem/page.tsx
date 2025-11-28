
'use client';

import DashboardHeader from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/firebase";
import { useEffect } from "react";
import type { User } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RedeemPage() {
  const { user, userProfile, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('mode') === 'guest';

  useEffect(() => {
    if (!isUserLoading && !user && !isGuestMode) {
      router.push('/');
    }
  }, [user, isUserLoading, isGuestMode, router]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  let displayUser: User | null = null;
  if (isGuestMode) {
    displayUser = {
      name: 'Guest User',
      avatarUrl: `https://picsum.photos/seed/guest/100/100`,
      points: 1250,
      referralCode: 'CASC-GUEST',
      referralLevel: 0,
    };
  } else if (user && userProfile) {
    displayUser = {
      name: userProfile.displayName,
      avatarUrl: userProfile.photoURL,
      points: userProfile.points,
      referralCode: userProfile.referralCode,
      referralLevel: userProfile.level,
    };
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
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Redeem Points</CardTitle>
              <CardDescription>
                Use your points to claim rewards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <p className="text-muted-foreground">Redemption options will be available here soon.</p>
                <p className="text-2xl font-bold mt-2">{displayUser.points.toLocaleString()} Points</p>
                <Button className="mt-4">Explore Rewards</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
