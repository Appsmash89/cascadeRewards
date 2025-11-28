
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { referrals, tasks as initialTasksData } from '@/lib/data';
import DashboardHeader from "@/components/dashboard/header";
import StatsCards from "@/components/dashboard/stats-cards";
import TasksList from "@/components/dashboard/tasks-list";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { Loader2 } from "lucide-react";
import type { User } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('mode') === 'guest';
  const { user, userProfile, isUserLoading } = useUser();
  const [tasks, setTasks] = useState(initialTasksData);

  useEffect(() => {
    // If not loading, not in guest mode, and no user, redirect to login.
    if (!isUserLoading && !isGuestMode && !user) {
      router.push('/');
    }
  }, [isUserLoading, isGuestMode, user, router]);

  const resetTasks = () => {
    setTasks(initialTasksData.map(t => ({...t, isCompleted: false})));
  }

  // Show loader while user state is being determined
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
  
  // If no user data is available (and not loading), something is wrong, or user should be redirected.
  // The useEffect above handles redirection, but this is a fallback.
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
        <StatsCards user={displayUser} referrals={referrals} />
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Tasks</CardTitle>
              <CardDescription>
                Complete tasks to earn points and climb the leaderboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TasksList initialTasks={tasks} />
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
