
'use client';

import DashboardHeader from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/hooks/use-user";
import { Loader2, Bot } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function DevToolsView() {
  const { userProfile, isUserLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isGuestMode = searchParams.get('mode') === 'guest';
  
  useEffect(() => {
    if (!isGuestMode && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [isGuestMode, isUserLoading, router]);

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

  if (!isGuestMode) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleResetTasks = () => {
    window.dispatchEvent(new CustomEvent('reset-tasks'));
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary dark:bg-neutral-950">
      <DashboardHeader user={userProfile} />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-24">
        <div className="grid gap-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Developer Tools</CardTitle>
              <CardDescription>
                Tools for easy prototyping and quick testing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-background">
                 <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Bot className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">Developer Sandbox</p>
                <p className="text-sm text-muted-foreground/80">Use these tools to test app states.</p>
                <div className="flex items-center gap-4 mt-6">
                    <Button onClick={handleResetTasks} variant="outline">Reset Tasks</Button>
                    <Button disabled>Simulate Points</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
