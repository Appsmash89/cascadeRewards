
'use client';

import DashboardHeader from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function RedeemPage() {
  const { userProfile, isUserLoading } = useUser();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('mode') === 'guest';

  if (isUserLoading && !isGuestMode) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile && !isGuestMode) {
    return (
       <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <p>Could not load user profile.</p>
      </div>
    )
  }

  const points = isGuestMode ? 1250 : userProfile?.points ?? 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader user={userProfile} />
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
                <p className="text-2xl font-bold mt-2">{points.toLocaleString()} Points</p>
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
