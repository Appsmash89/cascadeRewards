
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Loader2, ArrowLeft, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function UserManagementView() {
  const firestore = useFirestore();
  const { user: adminUser, isUserLoading } = useUser();
  const router = useRouter();

  const isGuestMode = adminUser?.email === GUEST_EMAIL;

  const usersQuery = useMemoFirebase(() => 
    firestore && isGuestMode ? collection(firestore, 'users') : null,
    [firestore, isGuestMode]
  );
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  useEffect(() => {
    if (!isUserLoading && !isGuestMode) {
      router.push('/dashboard');
    }
  }, [isGuestMode, isUserLoading, router]);

  const getInitials = (name: string | null) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  }

  if (isUserLoading || usersLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!isGuestMode) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Access denied.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
          <Link href="/devtools">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to DevTools
          </Link>
        </Button>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Select a user to view their progress and manage their tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y rounded-lg border">
          {users && users.map(user => (
            <Link key={user.uid} href={`/devtools/users/${user.uid}`} className="flex items-center justify-between p-3 gap-4 hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                 <Avatar>
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{user.points} pts</span>
                <UserIcon className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
