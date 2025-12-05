
'use client';

import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader2, UserCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const ReferrerInfo = ({ referrerId }: { referrerId: string }) => {
  const firestore = useFirestore();
  const referrerRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', referrerId) : null),
    [firestore, referrerId]
  );
  const { data: referrerProfile, isLoading } = useDoc<UserProfile>(referrerRef);

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (!referrerProfile) {
    return <p className="text-sm text-muted-foreground">Referrer not found.</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-secondary rounded-full">
        <UserCheck className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Referred by</p>
        <p className="font-mono font-semibold tracking-wider">{referrerProfile.referralCode}</p>
      </div>
    </div>
  );
};

export default function ProfileView() {
  const { userProfile, isAdmin } = useUser();

  const getInitials = (name: string | null) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  if (!userProfile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (isAdmin) {
      return (
          <div className="flex flex-1 items-center justify-center">
            <p>Admin users do not have a profile page.</p>
        </div>
      )
  }

  return (
    <Card>
      <CardHeader>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage src={userProfile.photoURL ?? undefined} alt={userProfile.displayName ?? 'User'} />
            <AvatarFallback className="text-3xl">{getInitials(userProfile.displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{userProfile.displayName}</CardTitle>
            <CardDescription>{userProfile.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Separator />
        <div className="mt-6">
          {userProfile.referredBy ? (
            <ReferrerInfo referrerId={userProfile.referredBy} />
          ) : (
            <p className="text-sm text-center text-muted-foreground">
              You haven't been referred by anyone yet. Add a referrer code in{' '}
              <Link href="/settings" className="text-primary hover:underline">
                Settings
              </Link>.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
