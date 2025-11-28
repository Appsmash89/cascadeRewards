
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Star, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/redeem', label: 'Redeem', icon: Star },
  { href: '/referrals', label: 'Referrals', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-20 max-w-md mx-auto">
      <div className="grid h-full grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const href = mode === 'guest' ? `${item.href}?mode=guest` : item.href;
          return (
            <Link key={item.href} href={href} className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
              <item.icon className={cn('h-6 w-6', isActive && 'text-primary')} />
              <span className={cn('text-xs', isActive && 'text-primary font-medium')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
