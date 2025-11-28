'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { usePathname } from 'next/navigation';

import { currentUser, referrals, tasks } from '@/lib/data';
import DashboardHeader from "@/components/dashboard/header";
import StatsCards from "@/components/dashboard/stats-cards";
import TasksList from "@/components/dashboard/tasks-list";
import ReferralSection from "@/components/dashboard/referral-section";
import BottomNav from "@/components/dashboard/bottom-nav";


export default function DashboardPage() {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader user={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-20">
        <StatsCards user={currentUser} referrals={referrals} />
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
          <ReferralSection user={currentUser} referrals={referrals} />
        </div>
      </main>
      {isDashboard && <BottomNav />}
    </div>
  );
}
