
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Reward } from '@/lib/types';
import { Star, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type RewardCardProps = {
  reward: Reward & { popular?: boolean; lowStock?: boolean };
  userPoints: number;
  onRedeem: (points: number, title: string) => void;
  isGuest: boolean;
  index: number;
};

export default function RewardCard({ reward, userPoints, onRedeem, isGuest, index }: RewardCardProps) {
  const canAfford = userPoints >= reward.points;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: index * 0.05 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
      className="h-full"
    >
      <Card className={cn(
        "overflow-hidden transition-all flex flex-col h-full rounded-xl border-2 border-black/5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-900/80 shadow-md",
        (isGuest || !canAfford) && 'relative'
      )}>
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={reward.imageUrl}
            alt={reward.title}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
            data-ai-hint="gift card"
          />
          {reward.popular && (
             <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">Popular</Badge>
          )}
           {reward.lowStock && (
             <Badge variant="destructive" className="absolute top-2 left-2">Low Stock</Badge>
          )}
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <h4 className="text-base font-semibold tracking-tight truncate">{reward.title}</h4>
          <p className="text-sm text-muted-foreground mb-4 flex-grow">{reward.description}</p>
          
          <div className="flex flex-col items-center gap-3 mt-auto">
             <div className="py-1 px-4 rounded-full bg-amber-400/80 text-black font-bold flex items-center gap-2 shadow-inner">
                  <Star className="h-4 w-4" />
                  <span>{reward.points.toLocaleString()}</span>
              </div>

              <Button 
                  onClick={() => onRedeem(reward.points, reward.title)}
                  disabled={!canAfford || isGuest}
                  className={cn(
                      "w-full transition-all duration-300",
                      !canAfford && "bg-secondary hover:bg-secondary opacity-70"
                  )}
              >
                  {isGuest ? 'Admins cannot redeem' : canAfford ? 'Redeem Now' : 'Not Enough Points'}
              </Button>
          </div>
        </CardContent>
        
        {(isGuest || !canAfford) && (
            <div className={cn(
                "absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4",
                !isGuest && canAfford && 'hidden' // Hide if user can afford and is not a guest
            )}>
                <Lock className="h-8 w-8 text-foreground mb-2" />
                <p className="font-semibold">{isGuest ? 'Admin accounts cannot redeem rewards' : 'Earn more to unlock'}</p>
                {isGuest && <p className="text-xs text-muted-foreground">This is to prevent accidental point spending.</p>}
            </div>
        )}
      </Card>
    </motion.div>
  );
}
