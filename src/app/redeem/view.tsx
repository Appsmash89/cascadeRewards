
'use client';

import DashboardHeader from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/hooks/use-user";
import { Loader2, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function RedeemView() {
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

  const points = isGuestMode ? 1250 : userProfile?.points ?? 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary dark:bg-neutral-950">
      <DashboardHeader user={userProfile} />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-24">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Redeem Points</CardTitle>
            <CardDescription>
              Use your well-earned points to claim exciting rewards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-background">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">More Rewards Coming Soon</p>
              <p className="text-sm text-muted-foreground/80">Keep earning points!</p>
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-4xl font-bold tracking-tighter">{points.toLocaleString()}</p>
                <p className="text-sm font-medium text-muted-foreground">Points</p>
              </div>
              <Button className="mt-6" disabled>Explore Rewards</Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
