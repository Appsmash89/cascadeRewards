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

  const navGridCols = isGuestMode ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-lg border-t z-20 max-w-md mx-auto">
      <div className={cn("grid h-full", navGridCols)}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <div
                className={cn("p-3 rounded-full transition-colors", isActive && "bg-primary/10")}
              >
                <item.icon className={cn('h-6 w-6', isActive && 'text-primary')} />
              </div>
              <span className={cn('text-xs font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>
                {item.label}
              </span>
            </Link>
          );
        })}
        {isGuestMode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/devtools" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                  <div className={cn("p-3 rounded-full transition-colors", pathname === '/devtools' && "bg-primary/10")}>
                    <Bot className={cn('h-6 w-6', pathname === '/devtools' && 'text-primary')} />
                  </div>
                  <span className={cn('text-xs font-medium', pathname === '/devtools' ? 'text-primary' : 'text-muted-foreground')}>DevTools</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Developer Tools</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
