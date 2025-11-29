
'use client';

import DashboardHeader from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/hooks/use-user";
import { useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function DevToolsView() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const isGuestMode = user?.email === GUEST_EMAIL;
  const [isResetting, setIsResetting] = useState(false);
  
  useEffect(() => {
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
  
  if (!isGuestMode) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleResetTasks = async () => {
    if (!firestore || !userProfile) {
        toast({ variant: "destructive", title: "Error", description: "Firestore or user profile not available." });
        return;
    }

    setIsResetting(true);
    try {
        const userTasksRef = collection(firestore, 'users', userProfile.uid, 'tasks');
        const tasksSnapshot = await getDocs(userTasksRef);

        if (tasksSnapshot.empty) {
            toast({ title: "No tasks to reset." });
            setIsResetting(false);
            return;
        }

        const batch = writeBatch(firestore);
        tasksSnapshot.forEach((taskDoc) => {
            const taskRef = doc(firestore, 'users', userProfile.uid, 'tasks', taskDoc.id);
            batch.update(taskRef, {
                status: 'available',
                completedAt: null
            });
        });

        await batch.commit();

        toast({
            title: "Tasks Reset",
            description: "All tasks have been set back to 'available'.",
        });

    } catch (error) {
        console.error("Error resetting tasks: ", error);
        toast({
            variant: "destructive",
            title: "Reset Failed",
            description: "Could not reset tasks. Check console for details.",
        });
    } finally {
        setIsResetting(false);
    }
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
                    <Button onClick={handleResetTasks} variant="outline" disabled={isResetting}>
                        {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reset Tasks
                    </Button>
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
