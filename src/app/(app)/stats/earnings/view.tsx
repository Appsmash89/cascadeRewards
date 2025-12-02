'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Gift } from 'lucide-react';
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
          Referral Earnings are bonus points you receive automatically when people in your referral network complete tasks. It's a powerful way to accelerate your progress towards rewards.
        </p>
        
        <h4 className="font-semibold">How Earnings are Calculated</h4>
        <div className="p-4 border rounded-lg bg-secondary">
          <p className="font-bold">
            <span className="text-primary">Your Bonus</span> = <span className="text-primary">10%</span> of the points your referral earns from a task.
          </p>
        </div>

        <p>
            <strong>Example:</strong>
        </p>
        <ul className="list-none p-0">
          <li>Your referral, Alex, completes a task worth <span className="font-semibold">100 points</span>.</li>
          <li>Alex is awarded the full 100 points.</li>
          <li>You automatically receive <span className="font-semibold text-primary">10 points</span> (10% of 100) as a referral bonus.</li>
        </ul>
        <p>
            This bonus is added directly to your point balance and also contributes to your "Total Earned" for leveling up. There is no limit to how many bonus points you can earn from your referrals. The larger your network, the greater your earning potential!
        </p>
      </CardContent>
    </Card>
  );
}
