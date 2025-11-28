'use client'

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Users, Wallet, TrendingUp } from 'lucide-react'
import type { User, Referral } from '@/lib/types'

type StatsCardsProps = {
  user: User;
  referrals: Referral[];
}

export default function StatsCards({ user, referrals }: StatsCardsProps) {
  const referralEarnings = referrals.length * 50;

  const stats = [
    { title: "Total Points", value: user.points.toLocaleString(), icon: Wallet, subtitle: "+180.1 this month" },
    { title: "Referrals", value: referrals.length, icon: Users, subtitle: "+2 this month" },
    { title: "Referral Earnings", value: `${referralEarnings.toLocaleString()} pts`, icon: TrendingUp, subtitle: "From your network" },
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
