
'use client';

import DashboardHeader from "@/components/dashboard/header";
import { referrals } from "@/lib/data";
import ReferralSection from "@/components/dashboard/referral-section";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ReferralsView() {
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary dark:bg-neutral-950">
      <DashboardHeader user={userProfile} />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-24">
        <ReferralSection user={userProfile} referrals={referrals} />
      </main>
      <BottomNav />
    </div>
  );
}


export default function ReferralsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ReferralsView />
    </Suspense>
  )
}
