import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, Wallet, TrendingUp } from 'lucide-react'
import type { User, Referral } from '@/lib/types'

type StatsCardsProps = {
  user: User;
  referrals: Referral[];
}

export default function StatsCards({ user, referrals }: StatsCardsProps) {
  // Mock referral earnings
  const referralEarnings = referrals.length * 50;

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Points
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{user.points.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            +180.1 this month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Referrals
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{referrals.length}</div>
          <p className="text-xs text-muted-foreground">
            +2 this month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Referral Earnings</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{referralEarnings.toLocaleString()} pts</div>
          <p className="text-xs text-muted-foreground">
            From your network
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
