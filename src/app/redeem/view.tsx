
'use client';

import DashboardHeader from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/dashboard/bottom-nav";
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
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const isGuestMode = user?.email === GUEST_EMAIL;

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!userProfile) {
    return (
       <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Could not load user profile.</p>
      </div>
    )
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
    <div className="flex min-h-screen w-full flex-col bg-background">
      <DashboardHeader user={userProfile} isGuest={isGuestMode} />
      <motion.main 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-1 flex-col gap-4 p-4 pb-24"
      >
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
                  <Star className="h-8 w-8 text-amber-400" />
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
                          isGuest={isGuestMode}
                          index={i}
                      />
                  ))}
                  </div>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </motion.main>
      <BottomNav />
    </div>
  );
}
