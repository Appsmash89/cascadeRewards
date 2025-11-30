
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Star, Users, Settings, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUser } from '@/hooks/use-user';
import { motion, AnimatePresence } from 'framer-motion';

const GUEST_EMAIL = 'guest.dev@cascade.app';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/redeem', label: 'Redeem', icon: Star },
  { href: '/referrals', label: 'Referrals', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const isGuestMode = user?.email === GUEST_EMAIL;

  const allNavItems = isGuestMode ? [...navItems, { href: '/devtools', label: 'DevTools', icon: Bot }] : navItems;
  const navGridCols = isGuestMode ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t z-20 max-w-md mx-auto">
      <div className={cn("grid h-full", navGridCols)}>
        {allNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors relative">
                <item.icon className={cn('h-6 w-6', isActive && 'text-primary')} />
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
