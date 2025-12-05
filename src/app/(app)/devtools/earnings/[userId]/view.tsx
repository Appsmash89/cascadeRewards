'use client';

import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Loader2, ArrowLeft, Star, Users, UserCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Task, UserProfile, UserTask, WithId } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo, useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { useRouter, useParams } from 'next/navigation';
import { TIER_1_BONUS_RATE, TIER_2_BONUS_RATE } from '@/lib/types';
import AnimatedCounter from '@/components/animated-counter';


type Breakdown = {
  taskPoints: number;
  tier1Bonus: number;
  tier2Bonus: number;
  totalCalculated: number;
};

const StatCard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) => (
    <Card className="p-4">
        <div className="flex items-center gap-4">
            {icon}
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">
                    <AnimatedCounter to={value} />
                </p>
            </div>
        </div>
    </Card>
);

export default function EarningsBreakdownView() {
  const firestore = useFirestore();
  const { isAdmin, isUserLoading: isAdminLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userProfileRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'users', userId) : null,
    [firestore, userId]
  );
  const { data: userProfile, isLoading: isUserLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isAdminLoading, router]);

  useEffect(() => {
    if (!firestore || !userProfile) return;

    const calculateEarnings = async () => {
      setIsLoading(true);
      
      const allTasksSnap = await getDocs(collection(firestore, 'tasks'));
      const allTasks = new Map(allTasksSnap.docs.map(d => [d.id, d.data() as Task]));

      const userTasksSnap = await getDocs(collection(firestore, 'users', userProfile.uid, 'tasks'));
      const userCompletedTasks = userTasksSnap.docs
        .filter(d => (d.data() as UserTask).status === 'completed')
        .map(d => d.id);
      
      const taskPoints = userCompletedTasks.reduce((sum, taskId) => {
        return sum + (allTasks.get(taskId)?.points || 0);
      }, 0);

      let tier1Bonus = 0;
      let tier2Bonus = 0;
      
      const allUsersSnap = await getDocs(collection(firestore, 'users'));
      const allUsers = allUsersSnap.docs.map(d => d.data() as UserProfile);

      const tier1Referrals = allUsers.filter(u => u.referredBy === userProfile.uid);

      for (const t1 of tier1Referrals) {
        const t1TasksSnap = await getDocs(collection(firestore, 'users', t1.uid, 'tasks'));
        const t1CompletedTasks = t1TasksSnap.docs.filter(d => d.data().status === 'completed').map(d => d.id);
        const t1TaskPoints = t1CompletedTasks.reduce((sum, taskId) => sum + (allTasks.get(taskId)?.points || 0), 0);
        tier1Bonus += t1TaskPoints * TIER_1_BONUS_RATE;

        const tier2Referrals = allUsers.filter(u => u.referredBy === t1.uid);
        for (const t2 of tier2Referrals) {
          const t2TasksSnap = await getDocs(collection(firestore, 'users', t2.uid, 'tasks'));
          const t2CompletedTasks = t2TasksSnap.docs.filter(d => d.data().status === 'completed').map(d => d.id);
          const t2TaskPoints = t2CompletedTasks.reduce((sum, taskId) => sum + (allTasks.get(taskId)?.points || 0), 0);
          tier2Bonus += t2TaskPoints * TIER_2_BONUS_RATE;
        }
      }
      
      tier1Bonus = Math.floor(tier1Bonus);
      tier2Bonus = Math.floor(tier2Bonus);

      setBreakdown({
        taskPoints,
        tier1Bonus,
        tier2Bonus,
        totalCalculated: taskPoints + tier1Bonus + tier2Bonus,
      });

      setIsLoading(false);
    };

    calculateEarnings();
  }, [firestore, userProfile]);

  const getInitials = (name: string | null) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  }

  const isDataLoading = isUserLoading || isAdminLoading || isLoading;

  if (isDataLoading) {
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

  if (!userProfile) {
    return <p>User not found.</p>;
  }

  const discrepancy = breakdown ? Math.round(userProfile.totalEarned - breakdown.totalCalculated) : 0;

  return (
    <Card>
      <CardHeader>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
          <Link href="/devtools/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <div className="flex items-center gap-4 pt-4">
            <Avatar className="h-16 w-16 border">
                <AvatarImage src={userProfile.photoURL ?? undefined} />
                <AvatarFallback>{getInitials(userProfile.displayName)}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle>Earnings Breakdown</CardTitle>
                <CardDescription>
                    Analysis for {userProfile.displayName}
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard 
                title="Points from Tasks"
                value={breakdown?.taskPoints ?? 0}
                icon={<Star className="h-6 w-6 text-amber-500" />}
            />
            <StatCard 
                title="Tier 1 Bonus"
                value={breakdown?.tier1Bonus ?? 0}
                icon={<UserCheck className="h-6 w-6 text-green-500" />}
            />
            <StatCard 
                title="Tier 2 Bonus"
                value={breakdown?.tier2Bonus ?? 0}
                icon={<Users className="h-6 w-6 text-blue-500" />}
            />
             <Card className="p-4 bg-primary/10 border-primary/20">
                <div className="flex items-center gap-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <div>
                        <p className="text-sm text-primary/80">Total Calculated Earnings</p>
                        <p className="text-2xl font-bold text-primary">
                            <AnimatedCounter to={breakdown?.totalCalculated ?? 0} />
                        </p>
                    </div>
                </div>
            </Card>
        </div>

        <Separator />

        <div className="space-y-3 rounded-lg border p-4">
            <h4 className="font-semibold">Database Comparison</h4>
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Stored 'totalEarned' value:</span>
                <span className="font-mono font-medium">{userProfile.totalEarned}</span>
            </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Calculated total:</span>
                <span className="font-mono font-medium">{breakdown?.totalCalculated ?? 0}</span>
            </div>
             <div className="flex justify-between items-center font-bold text-base">
                <span className="text-muted-foreground">Discrepancy:</span>
                <span className={discrepancy !== 0 ? 'text-destructive' : 'text-green-500'}>
                    {discrepancy}
                </span>
            </div>
            {discrepancy !== 0 && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5"/>
                    <p>The stored value differs from the calculated total. This may indicate a past calculation error or manual data change.</p>
                </div>
            )}
        </div>

      </CardContent>
    </Card>
  );
}
