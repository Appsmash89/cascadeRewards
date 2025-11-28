import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, Wallet, TrendingUp } from 'lucide-react'
import type { User, Referral } from '@/lib/types'
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

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
    <Carousel opts={{ loop: true, align: "start" }} className="w-full">
      <CarouselContent>
        {stats.map((stat, index) => (
          <CarouselItem key={index} className="basis-2/3">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
