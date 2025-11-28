'use client';

import DashboardHeader from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function DevToolsView() {
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader user={userProfile} />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-20">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Developer Tools</CardTitle>
              <CardDescription>
                Tools for easy prototyping and quick testing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <p className="text-muted-foreground">Developer options will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
