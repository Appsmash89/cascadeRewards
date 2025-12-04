
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { Star } from "lucide-react";
import { rewards as rewardsData } from "@/lib/data";
import RewardCard from "@/components/rewards/reward-card";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc, increment } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { motion } from 'framer-motion';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AnimatedCounter from "@/components/animated-counter";


const GUEST_EMAIL = 'guest.dev@cascade.app';
const CREATE_TASK_REWARD_ID = 'create-task-reward';

export default function RedeemView() {
  const { user, userProfile } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [showReferrerDialog, setShowReferrerDialog] = useState(false);
  const isGuestMode = user?.email === GUEST_EMAIL;

  const rewards = [
    ...rewardsData,
    {
      id: CREATE_TASK_REWARD_ID,
      title: 'Create a Custom Task',
      description: 'Spend 250 points to create a task for other users to complete.',
      points: 250,
      imageUrl: 'https://picsum.photos/seed/createtask/300/200'
    }
  ];

  if (!userProfile) {
    return null;
  }

  const currentPoints = userProfile?.points ?? 0;
  const currentLevel = userProfile?.level ?? 1;

  const handleRedeem = (pointsCost: number, title: string, id: string) => {
    if (isGuestMode) {
      toast({
        variant: "destructive",
        title: "Guest Mode",
        description: "Sign in to unlock this reward.",
      });
      return;
    }
      
    if (userProfile && firestore) {
       if (!userProfile.referredBy) {
        setShowReferrerDialog(true);
        return;
       }

       if (userProfile.points >= pointsCost) {
        const userDocRef = doc(firestore, 'users', userProfile.uid);
        updateDocumentNonBlocking(userDocRef, {
            points: increment(-pointsCost)
        });
        
        if (id === CREATE_TASK_REWARD_ID) {
           toast({
            title: "Task Credit Purchased!",
            description: "You can now create a new task.",
            action: (
              <Link href="/tasks/new">
                <Button variant="outline" size="sm">Create Task</Button>
              </Link>
            )
          });
        } else {
          toast({
            title: "Redemption Successful!",
            description: `You have redeemed the ${title}.`,
          });
        }
      } else {
         toast({
          variant: "destructive",
          title: "Insufficient Points",
          description: "You don't have enough points for this reward.",
        });
      }
    }
  };


  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle>Redeem Rewards</CardTitle>
            <CardDescription>
              Use your points to claim exciting rewards.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="p-6">
                <Card className="p-4 bg-gradient-to-tr from-primary/80 to-primary text-primary-foreground shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80">Your Balance</p>
                            <p className="text-3xl font-bold tracking-tight">
                                <AnimatedCounter to={currentPoints} />
                            </p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm opacity-80">Level</p>
                           <p className="text-3xl font-bold tracking-tight">{currentLevel}</p>
                        </div>
                    </div>
                    <Button asChild variant="secondary" size="sm" className="w-full mt-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
                        <Link href="/stats/points">
                            <Star className="h-4 w-4 mr-2" />
                            Earn More Points
                        </Link>
                    </Button>
                </Card>
            </div>

            <div className="p-6 pt-0">
                <h3 className="text-base font-semibold tracking-tight mb-4">Available Rewards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rewards.map((reward, i) => (
                    <RewardCard 
                        key={reward.id}
                        reward={reward}
                        userPoints={currentPoints}
                        onRedeem={() => handleRedeem(reward.points, reward.title, reward.id)}
                        isGuest={isGuestMode}
                        index={i}
                    />
                ))}
                </div>
            </div>

          </CardContent>
        </Card>
      </motion.div>
      <AlertDialog open={showReferrerDialog} onOpenChange={setShowReferrerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Referrer Required</AlertDialogTitle>
            <AlertDialogDescription>
              To redeem rewards, you must have a referrer. Please go to your settings to enter a valid referrer code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/settings')}>
              Go to Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
