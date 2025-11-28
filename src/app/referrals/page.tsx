'use client';

import DashboardHeader from "@/components/dashboard/header";
import { referrals } from "@/lib/data";
import ReferralSection from "@/components/dashboard/referral-section";
import BottomNav from "@/components/dashboard/bottom-nav";
import { useUser } from "@/firebase";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ReferralsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('mode') === 'guest';
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
    } else if (user) {
      const appUser: User = {
        name: user.displayName || 'User',
        avatarUrl: user.photoURL || `https://picsum.photos/seed/user/100/100`,
        points: 1250, // This would come from your database
        referralCode: 'CASC-A9B3X2', // This would come from your database
        referralLevel: 2, // This would come from your database
      };
      setDisplayUser(appUser);
    }
  }, [isGuestMode, user]);

  useEffect(() => {
    if (!isUserLoading && !user && !isGuestMode) {
      router.push('/');
    }
  }, [user, isUserLoading, isGuestMode, router]);

  if (isUserLoading || !displayUser) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader user={displayUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-20">
        <ReferralSection user={displayUser} referrals={referrals} />
      </main>
      <BottomNav />
    </div>
  );
}
