'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gift, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function ReferrerInfoView() {
  return (
    <Card>
      <CardHeader>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
          <Link href="/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20">
                <UserPlus className="h-8 w-8 text-blue-500" />
            </div>
            <div>
                <CardTitle>Why a Referrer is Required</CardTitle>
                <CardDescription>To unlock rewards, you need a referrer.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 prose prose-sm dark:prose-invert max-w-none">
        <p>
          At Cascade, our community is built on a network of referrals. To ensure the integrity and continued growth of our platform, we require every user to have been referred by an existing member before they can redeem points for rewards.
        </p>
        
        <h4 className="font-semibold">How it Works</h4>
        <p>
            You can continue to complete tasks and earn points without a referrer. Your points are safe and will accumulate in your account.
        </p>

        <div className="p-4 border rounded-lg bg-secondary">
            <div className="flex items-center gap-3 mb-2">
                <Gift className="h-5 w-5 text-primary"/>
                <h5 className="font-bold m-0">Unlocking Redemptions</h5>
            </div>
            <p className="m-0">
               When you're ready to redeem your points, you must first enter the unique referral code of the person who introduced you to Cascade. You can do this at any time in your settings.
            </p>
        </div>

        <p>
            Once you've added a referrer, the ability to redeem points for gift cards and other rewards will be permanently unlocked for your account. This one-time step helps us thank the members who are actively growing our community.
        </p>
         <Button asChild>
            <Link href="/settings">
              Go to Settings to add a referrer
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
