
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
import type { User, UserProfile } from "@/lib/types";

export default function DashboardPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('mode') === 'guest';
  const { user, userProfile, isUserLoading } = useUser();
  const isDashboard = pathname === '/dashboard';
  const [tasks, setTasks] = useState(initialTasksData);

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


  const resetTasks = () => {
    setTasks(initialTasksData.map(t => ({...t, isCompleted: false})));
  }

  if (isUserLoading || (!displayUser && !isGuestMode)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!displayUser) {
    // This can happen briefly while the userProfile is loading for a logged-in user.
    // Or if a non-guest tries to access a page without being logged in.
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
      {isDashboard && <BottomNav />}
    </div>
  );
}
