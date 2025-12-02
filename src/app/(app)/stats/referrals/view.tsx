'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Users } from 'lucide-react';
import Link from 'next/link';

export default function StatsReferralsView() {
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
            <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20">
                <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div>
                <CardTitle>Building Your Network</CardTitle>
                <CardDescription>Referrals help you and the community grow.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 prose prose-sm dark:prose-invert max-w-none">
        <p>
            Your referral network is a count of how many new members have joined Cascade using your unique referral code. Each successful referral expands your network and increases your potential for earning bonuses.
        </p>
        
        <h4 className="font-semibold">How Referrals Work</h4>
        <ol className="space-y-2">
            <li className="flex items-start gap-3">
                <span className="font-bold text-primary">1.</span>
                <span><strong>Share Your Code:</strong> Find your unique referral code on the "Referrals" page. Share this code with friends, family, or colleagues.</span>
            </li>
            <li className="flex items-start gap-3">
                <span className="font-bold text-primary">2.</span>
                <span><strong>New User Signs Up:</strong> When a new user signs up, they'll have an opportunity to enter your referral code.</span>
            </li>
            <li className="flex items-start gap-3">
                <span className="font-bold text-primary">3.</span>
                <span><strong>Your Network Grows:</strong> Once they successfully join using your code, they are added to your referral network, and you'll see your referral count increase.</span>
            </li>
        </ol>

        <h4 className="font-semibold">Why Referrals Matter</h4>
        <p>
            Referring new users is the key to unlocking referral earnings. For every task your referred user completes, you get a 10% bonus. The more people you refer, the more passive points you can earn!
        </p>
      </CardContent>
    </Card>
  );
}
