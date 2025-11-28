
'use client'

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Users, Wallet, TrendingUp } from 'lucide-react'
import type { UserProfile, Referral } from '@/lib/types'
import { useSearchParams } from 'next/navigation'

type StatsCardsProps = {
  user: UserProfile | null;
  referrals: Referral[];
}

export default function StatsCards({ user, referrals }: StatsCardsProps) {
  const searchParams = useSearchParams()
  const isGuestMode = searchParams.get('mode') === 'guest';
  
  const referralEarnings = referrals.length * 50; // This can be made dynamic later

  // Determine values based on user profile or guest mode defaults
  const points = isGuestMode ? 1250 : user?.points ?? 0;
  const referralCount = isGuestMode ? referrals.length : 0; // Replace with actual user referral count later
  const earnings = isGuestMode ? referralEarnings : 0; // Replace with actual user earnings later

  const stats = [
    { title: "Total Points", value: points.toLocaleString(), icon: Wallet },
    { title: "Referrals", value: referralCount, icon: Users },
    { title: "Referral Earnings", value: `${earnings.toLocaleString()} pts`, icon: TrendingUp },
  ]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 divide-x divide-border">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center p-2 text-center">
              <stat.icon className="h-5 w-5 text-muted-foreground mb-1" />
              <div className="text-xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.title}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
