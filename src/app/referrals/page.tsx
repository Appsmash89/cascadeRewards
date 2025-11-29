
'use client';

import DashboardHeader from "@/components/dashboard/header";
import { referrals } from "@/lib/data";
import ReferralSection from "@/components/dashboard/referral-section";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

const GUEST_EMAIL = 'guest.dev@cascade.app';

function ReferralsView() {
  const { user, userProfile, isUserLoading } = useUser();
  const isGuestMode = user?.email === GUEST_EMAIL;
  
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!userProfile) {
    return (
       <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Could not load user profile.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary dark:bg-neutral-950">
      <DashboardHeader user={userProfile} isGuest={isGuestMode}/>
      <main className="flex flex-1 flex-col gap-4 p-4 pb-24">
        <ReferralSection user={userProfile} referrals={referrals} isGuest={isGuestMode} />
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
