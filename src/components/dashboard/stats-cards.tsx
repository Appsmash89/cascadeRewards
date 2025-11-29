
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
  
  const referralEarnings = referrals.length * 50; 

  const points = isGuestMode ? 1250 : user?.points ?? 0;
  const referralCount = isGuestMode ? referrals.length : 0; 
  const earnings = isGuestMode ? referralEarnings : 0; 

  const stats = [
    { title: "Total Points", value: points.toLocaleString(), icon: Wallet },
    { title: "Referrals", value: referralCount, icon: Users },
    { title: "Earnings", value: `${earnings.toLocaleString()}`, icon: TrendingUp },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4 flex flex-col items-center justify-center text-center shadow-sm">
          <stat.icon className="h-6 w-6 text-muted-foreground mb-2" />
          <div className="text-2xl font-bold tracking-tighter">{stat.value}</div>
          <p className="text-xs text-muted-foreground">{stat.title}</p>
        </Card>
      ))}
    </div>
  )
}
