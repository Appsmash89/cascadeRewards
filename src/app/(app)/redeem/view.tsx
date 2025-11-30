
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { Loader2, Star } from "lucide-react";
import { rewards as rewardsData } from "@/lib/data";
import RewardCard from "@/components/rewards/reward-card";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc, increment } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { motion } from 'framer-motion';

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function RedeemView() {
  const { user, userProfile } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const isGuestMode = user?.email === GUEST_EMAIL;

  // The main loading state is handled by the new layout
  if (!userProfile) {
    return null;
  }

  const currentPoints = userProfile?.points ?? 0;

  const handleRedeem = (pointsCost: number, title: string) => {
    if (isGuestMode) {
        toast({
          variant: "destructive",
          title: "Guest Mode",
          description: "Please sign in with Google to redeem rewards.",
        });
        return;
    }
      
    if (userProfile && firestore) {
       if (userProfile.points >= pointsCost) {
        const userDocRef = doc(firestore, 'users', userProfile.uid);
        updateDocumentNonBlocking(userDocRef, {
            points: increment(-pointsCost)
        });
        toast({
          title: "Redemption Successful!",
          description: `You have redeemed the ${title}.`,
        });
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
                  <p className="text-2xl font-bold tracking-tight">{currentPoints.toLocaleString()} Points</p>
              </div>
              <Star className="h-8 w-8 text-amber-500" />
          </motion.div>

          <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">Available Gift Cards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewardsData.map((reward, i) => (
                  <RewardCard 
                      key={reward.id}
                      reward={reward}
                      userPoints={currentPoints}
                      onRedeem={handleRedeem}
                      isGuest={isGuest}
                      index={i}
                  />
              ))}
              </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}
