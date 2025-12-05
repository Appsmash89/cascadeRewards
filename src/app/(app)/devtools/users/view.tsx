'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Loader2, ArrowLeft, User as UserIcon, Beaker, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const SIMULATED_USERS_KEY = 'simulatedUsers';

export default function UserManagementView() {
  const firestore = useFirestore();
  const { isAdmin, isUserLoading } = useUser();
  const router = useRouter();

  const [simulatedUsers, setSimulatedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const storedSimulatedUsers = localStorage.getItem(SIMULATED_USERS_KEY);
      if (storedSimulatedUsers) {
        setSimulatedUsers(new Set(JSON.parse(storedSimulatedUsers)));
      }
    } catch (e) {
      console.error("Failed to load simulated users from storage", e);
    }
  }, []);

  const usersQuery = useMemoFirebase(() => 
    firestore && isAdmin ? collection(firestore, 'users') : null,
    [firestore, isAdmin]
  );
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isUserLoading, router]);

  const handleSimulationToggle = (userId: string, isChecked: boolean) => {
    const newSimulatedUsers = new Set(simulatedUsers);
    if (isChecked) {
      newSimulatedUsers.add(userId);
    } else {
      newSimulatedUsers.delete(userId);
    }
    setSimulatedUsers(newSimulatedUsers);
    localStorage.setItem(SIMULATED_USERS_KEY, JSON.stringify(Array.from(newSimulatedUsers)));
    
    window.location.reload(); 
  };

  const getInitials = (name: string | null) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  }

  const isLoading = isUserLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!isAdmin) {
     return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <p>Access denied. Redirecting...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
            <Link href="/devtools">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to DevTools
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/devtools/simulation">
              <Beaker className="mr-2 h-4 w-4" />
              Edit Simulation Template
            </Link>
          </Button>
        </div>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Select a user to manage their tasks or view their earnings breakdown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y rounded-lg border">
          {users && users.sort((a, b) => a.displayName!.localeCompare(b.displayName!)).map(user => (
            <div key={user.uid} className="flex items-center justify-between p-3 gap-2 hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3 flex-grow">
                 <Avatar>
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow min-w-0">
                  <p className="font-medium truncate">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/devtools/users/${user.uid}`}>
                        <UserIcon className="mr-2 h-4 w-4" /> Manage
                    </Link>
                </Button>
                 <Button variant="outline" size="sm" asChild>
                    <Link href={`/devtools/earnings/${user.uid}`}>
                        <TrendingUp className="mr-2 h-4 w-4" /> Earnings
                    </Link>
                </Button>
                <div className="flex items-center space-x-2 pl-2 border-l">
                  <Checkbox
                    id={`simulate-${user.uid}`}
                    checked={simulatedUsers.has(user.uid)}
                    onCheckedChange={(checked) => handleSimulationToggle(user.uid, !!checked)}
                  />
                  <Label htmlFor={`simulate-${user.uid}`} className="text-xs">Simulate</Label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
