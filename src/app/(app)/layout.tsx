
'use client';

import { useUser } from "@/hooks/use-user";
import DashboardHeader from "@/components/dashboard/header";
import BottomNav from "@/components/dashboard/bottom-nav";
import { Loader2 } from "lucide-react";
import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userProfile, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const isGuestMode = user?.email === GUEST_EMAIL;

  if (isUserLoading || !user || !userProfile) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <DashboardHeader user={userProfile} isGuest={isGuestMode}/>
      <motion.main
        key={router.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-1 flex-col gap-4 p-4 pb-24 overflow-y-auto"
      >
        {children}
      </motion.main>
      <BottomNav />
    </div>
  );
}
