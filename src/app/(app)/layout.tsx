
'use client';

import { useUser } from "@/hooks/use-user";
import DashboardHeader from "@/components/dashboard/header";
import BottomNav from "@/components/dashboard/bottom-nav";
import { Loader2 } from "lucide-react";
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { AppSettings } from '@/lib/types';

const GUEST_EMAIL = 'guest.dev@cascade.app';

const topLevelNavItems = [
  '/dashboard',
  '/redeem',
  '/referrals',
  '/settings',
];

const guestTopLevelNavItems = [...topLevelNavItems, '/devtools'];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userProfile, isAdmin, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return; // Wait until everything is loaded

    if (!user) {
      router.push('/');
      return;
    }
    
    // Redirect to onboarding if user is new (has no interests set)
    if (userProfile && (!userProfile.interests || userProfile.interests.length === 0) && pathname !== '/onboarding' && !isAdmin) {
        router.push('/onboarding');
    }

  }, [user, userProfile, isUserLoading, router, pathname, isAdmin]);

  const currentNavs = useMemo(() => {
    const baseNavs = isAdmin ? guestTopLevelNavItems : topLevelNavItems;
    // Add /profile to the list of swipe-able pages if it's not already there for a clean swipe-back experience
    if (!baseNavs.includes('/profile')) {
        return [...baseNavs, '/profile'];
    }
    return baseNavs;
  }, [isAdmin]);
  
  const isSwipeEnabled = currentNavs.includes(pathname);
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isSwipeEnabled) return;

    const swipeThreshold = 50;
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    const currentIndex = currentNavs.findIndex(item => item === pathname);

    if (offset > swipeThreshold || velocity > 500) {
      if (currentIndex > 0) {
        router.push(currentNavs[currentIndex - 1]);
      }
    } else if (offset < -swipeThreshold || velocity < -500) {
      if (currentIndex < currentNavs.length - 1) {
        router.push(currentNavs[currentIndex + 1]);
      }
    }
  };

  if (isUserLoading || !user || !userProfile) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }
  
  // Don't render layout for onboarding page
  if (pathname === '/onboarding') {
    return <main className="flex flex-1 flex-col p-4">{children}</main>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background overflow-x-hidden">
      <DashboardHeader user={userProfile} isAdmin={isAdmin}/>
        <motion.main
            drag={isSwipeEnabled ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            key={pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex flex-1 flex-col gap-4 p-4 pt-20 pb-20"
        >
            {children}
        </motion.main>
      <BottomNav />
    </div>
  );
}
