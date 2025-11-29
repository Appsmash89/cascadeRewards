
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSearchParams } from 'next/navigation';
import { referrals, tasks as initialTasksData } from '@/lib/data';
import DashboardHeader from "@/components/dashboard/header";
import StatsCards from "@/components/dashboard/stats-cards";
import TasksList from "@/components/dashboard/tasks-list";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

export default function DashboardView() {
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('mode') === 'guest';
  const { userProfile, isUserLoading } = useUser();
  const [tasks, setTasks] = useState(initialTasksData);

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
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary dark:bg-neutral-950">
      <DashboardHeader user={userProfile} />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-24">
        <StatsCards user={userProfile} referrals={referrals} />
        <Card className="shadow-sm">
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
      </main>
      <BottomNav />
    </div>
  );
}
