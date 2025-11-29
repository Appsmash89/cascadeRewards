
'use client';

import DashboardHeader from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/hooks/use-user";
import { Loader2, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function DevToolsView() {
  const { user, userProfile, isUserLoading } = useUser();
  const router = useRouter();
  const isGuestMode = user?.isAnonymous ?? false;
  
  useEffect(() => {
    // If auth is loaded and the user is NOT a guest, redirect them away.
    if (!isUserLoading && !isGuestMode) {
      router.push('/dashboard');
    }
  }, [isGuestMode, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // This check is for when loading is finished but the user is not a guest.
  // It prevents a flash of content before the useEffect redirect kicks in.
  if (!isGuestMode) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleResetTasks = () => {
    // This functionality would need to be implemented.
    // For now, it's just a placeholder.
    console.log("Resetting tasks...");
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary dark:bg-neutral-950">
      <DashboardHeader user={userProfile} isGuest={isGuestMode} />
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
