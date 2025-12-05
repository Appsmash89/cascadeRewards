
'use client'

import { Card } from "@/components/ui/card"
import { Users, Wallet, TrendingUp } from 'lucide-react'
import type { UserProfile, Referral } from '@/lib/types'
import { motion } from 'framer-motion'
import AnimatedCounter from '../animated-counter'
import Link from "next/link"
import { cn } from "@/lib/utils"

type StatsCardsProps = {
  user: UserProfile | null;
  referrals: Referral[];
  isGuest: boolean;
}

export default function StatsCards({ user, referrals, isGuest }: StatsCardsProps) {
  const referralEarnings = referrals.length * 50; 

  const points = user?.points ?? 0;
  const referralCount = isGuest ? 0 : referrals.length; 
  const earnings = isGuest ? 0 : referralEarnings; 

  const stats = [
    { title: "Total Points", value: points, icon: Wallet, href: "/stats/points" },
    { title: "Referrals", value: referralCount, icon: Users, href: "/stats/referrals" },
    { title: "Earnings", value: earnings, icon: TrendingUp, href: "/stats/earnings" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div 
      className="grid grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div key={index} variants={itemVariants} className="h-full">
            <Link href={stat.href} className="h-full block">
                <Card className="p-4 flex flex-col items-center justify-center text-center shadow-sm h-full transition-all duration-300 hover:bg-card/80 hover:shadow-lg">
                    <stat.icon className="h-6 w-6 text-muted-foreground mb-2" />
                    <div className="text-lg font-bold tracking-tighter text-card-foreground">
                        <AnimatedCounter to={stat.value} />
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                </Card>
            </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
