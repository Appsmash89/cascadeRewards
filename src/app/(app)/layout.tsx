
'use client';

import { useUser } from "@/hooks/use-user";
import DashboardHeader from "@/components/dashboard/header";
import BottomNav from "@/components/dashboard/bottom-nav";
import { Loader2 } from "lucide-react";
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const GUEST_EMAIL = 'guest.dev@cascade.app';

const navItems = [
  { href: '/dashboard' },
  { href: '/redeem' },
  { href: '/referrals' },
  { href: '/settings' },
];

const guestNavItems = [...navItems, { href: '/devtools' }];


export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userProfile, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const isGuestMode = user?.email === GUEST_EMAIL;
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    const currentNavs = isGuestMode ? guestNavItems : navItems;
    const currentIndex = currentNavs.findIndex(item => item.href === pathname);

    if (offset > swipeThreshold || velocity > 500) {
      if (currentIndex > 0) {
        router.push(currentNavs[currentIndex - 1].href);
      }
    } else if (offset < -swipeThreshold || velocity < -500) {
      if (currentIndex < currentNavs.length - 1) {
        router.push(currentNavs[currentIndex + 1].href);
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-background overflow-x-hidden">
      <DashboardHeader user={userProfile} isGuest={isGuestMode}/>
        <motion.main
            key={pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-1 flex-col gap-4 p-4 pb-24"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
        >
            {children}
        </motion.main>
      <BottomNav />
    </div>
  );
}
