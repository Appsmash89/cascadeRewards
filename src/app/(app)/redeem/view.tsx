'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { Loader2, Star, Edit } from "lucide-react";
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

  const handleRedeem = (pointsCost: number, title: string, id: string) => {
    if (isGuestMode) {
      toast({
        variant: "destructive",
        title: "Guest Mode",
        description: "Please sign in with Google to redeem rewards.",
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
          // Special handling for the create task reward
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
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Redeem Points</CardTitle>
            <CardDescription>
              Use your points to claim exciting rewards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.2 }}
              className="flex justify-between items-center bg-secondary p-4 rounded-lg border mb-6"
            >
                <div>
                    <p className="text-sm text-muted-foreground">Your Balance</p>
                    <p className="text-xl font-bold tracking-tight">{currentPoints.toLocaleString()} Points</p>
                </div>
                <Star className="h-8 w-8 text-amber-500" />
            </motion.div>

            <div className="space-y-4">
                <h3 className="text-base font-semibold tracking-tight">Available Rewards</h3>
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
