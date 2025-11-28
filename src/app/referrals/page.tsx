
import DashboardHeader from "@/components/dashboard/header";
import { currentUser, referrals } from "@/lib/data";
import ReferralSection from "@/components/dashboard/referral-section";
import BottomNav from "@/components/dashboard/bottom-nav";

export default function ReferralsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader user={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-20">
        <ReferralSection user={currentUser} referrals={referrals} />
      </main>
      <BottomNav />
    </div>
  );
}
