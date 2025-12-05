
'use client';

import { referrals } from "@/lib/data";
import ReferralSection from "@/components/dashboard/referral-section";
import { useUser } from "@/hooks/use-user";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function ReferralsView() {
  const { userProfile, isAdmin } = useUser();
  
  if (!userProfile) {
    return null;
  }

  return (
    <ReferralSection user={userProfile} referrals={referrals} isGuest={isAdmin} />
  );
}


export default function ReferralsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ReferralsView />
    </Suspense>
  )
}
