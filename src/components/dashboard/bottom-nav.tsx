
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Star, Users, Settings, Bot, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUser } from '@/hooks/use-user';
import { motion, AnimatePresence } from 'framer-motion';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { AppSettings } from '@/lib/types';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/redeem', label: 'Redeem', icon: Star },
  { href: '/referrals', label: 'Referrals', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const guestNavItems = [
  ...navItems.slice(0, 4), 
  { href: '/chatbot', label: 'Chatbot', icon: MessageCircle },
  { href: '/devtools', label: 'DevTools', icon: Bot }
];


export default function BottomNav() {
  const pathname = usePathname();
  const { isAdmin, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'app-settings', 'global') : null, 
    [firestore]
  );
  const { data: appSettings } = useDoc<AppSettings>(settingsRef);

  const allNavItems = isAdmin ? guestNavItems : [...navItems, { href: '/chatbot', label: 'Chatbot', icon: MessageCircle }];
  const navGridCols = `grid-cols-${allNavItems.length}`;

  if (isUserLoading) {
    return null; // Don't render nav while we confirm admin status
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-lg border-t z-20 max-w-md mx-auto",
      appSettings?.pastelBackgroundEnabled && "bg-[hsl(var(--pastel-background),0.8)]"
    )}>
      <div className={cn("grid h-full", navGridCols)}>
        {allNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors relative">
                <motion.div whileTap={{ scale: 1.08 }}>
                    <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                </motion.div>
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute bottom-1 h-1 w-8 rounded-full bg-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
