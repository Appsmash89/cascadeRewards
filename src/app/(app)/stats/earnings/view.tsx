'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, UserCheck, Users } from 'lucide-react';
import Link from 'next/link';

export default function StatsEarningsView() {
  return (
    <Card>
      <CardHeader>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-full border border-green-500/20">
                <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div>
                <CardTitle>Your Referral Earnings</CardTitle>
                <CardDescription>Earn rewards passively from your network.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 prose prose-sm dark:prose-invert max-w-none">
        <p>
          Referral Earnings are bonus points you receive automatically when people in your referral network complete tasks. Our multi-tier system rewards you for building a strong and active downline.
        </p>
        
        <h4 className="font-semibold">How Earnings are Calculated</h4>
        
        <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-secondary">
                <div className="flex items-center gap-3 mb-2">
                    <UserCheck className="h-5 w-5 text-primary"/>
                    <h5 className="font-bold m-0">Tier 1 Bonus (Direct Referrals)</h5>
                </div>
                <p className="m-0">
                    You earn a <span className="font-bold text-primary">10% bonus</span> on all points earned by users you directly refer.
                </p>
                 <p className="text-xs text-muted-foreground mt-2 m-0">
                    <strong>Example:</strong> Your referral Alex completes a 100-point task. Alex gets 100 points, and you get a 10-point bonus.
                </p>
            </div>

            <div className="p-4 border rounded-lg bg-secondary">
                <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-indigo-500"/>
                    <h5 className="font-bold m-0">Tier 2 Bonus (Indirect Referrals)</h5>
                </div>
                <p className="m-0">
                    You earn a <span className="font-bold text-indigo-500">2% bonus</span> on all points earned by users who were referred by your direct referrals.
                </p>
                 <p className="text-xs text-muted-foreground mt-2 m-0">
                    <strong>Example:</strong> Alex (your referral) refers Beth. When Beth completes a 100-point task, she gets 100 points, Alex gets a 10-point bonus (Tier 1), and you get a 2-point bonus (Tier 2).
                </p>
            </div>
        </div>

        <p>
            This bonus is added directly to your point balance and also contributes to your "Total Earned" for leveling up. There is no limit to how many bonus points you can earn from your referrals. The larger and more active your network, the greater your earning potential!
        </p>
      </CardContent>
    </Card>
  );
}
