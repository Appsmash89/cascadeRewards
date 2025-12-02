
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';

export default function StatsPointsView() {
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
            <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20">
                <Star className="h-8 w-8 text-amber-500" />
            </div>
            <div>
                <CardTitle>Understanding Your Points</CardTitle>
                <CardDescription>Points are the key to unlocking rewards in Cascade.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 prose prose-sm dark:prose-invert max-w-none">
        <p>
          Your total points balance is a reflection of your activity and engagement within the Cascade platform. The more you participate, the more you earn!
        </p>
        
        <h4>How to Earn Points</h4>
        <ul className="space-y-2">
            <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span><strong>Completing Tasks:</strong> The primary way to earn points is by completing tasks from your dashboard. Each task has a specific point value, which is added to your balance upon completion.</span>
            </li>
            <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span><strong>Referral Bonuses:</strong> When someone you refer completes a task, you earn a 10% bonus of the points they were awarded. It's our way of saying thanks for growing the community!</span>
            </li>
        </ul>

        <h4>What are Points Used For?</h4>
        <p>
          Points can be redeemed for a variety of rewards, such as gift cards, in the "Redeem" section of the app. Your points balance is your currency for awesome perks.
        </p>

        <h4>Points vs. Total Earned</h4>
        <p>
            You might notice a difference between your current points and your "Total Earned" points (used for leveling up). Your current points balance is what you have available to spend. Your "Total Earned" is a lifetime counter that never decreases and is used to calculate your level.
        </p>
      </CardContent>
    </Card>
  );
}

    