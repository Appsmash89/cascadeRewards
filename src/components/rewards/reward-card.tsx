
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Reward } from '@/lib/types';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type RewardCardProps = {
  reward: Reward;
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
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-lg flex flex-col h-full">
        <div className="relative h-32 w-full">
          <Image
            src={reward.imageUrl}
            alt={reward.title}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint="gift card"
          />
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <h4 className="text-base font-semibold tracking-tight truncate">{reward.title}</h4>
          <p className="text-sm text-muted-foreground mb-3 flex-grow">{reward.description}</p>
          
          <div className="flex flex-col items-start gap-3 mt-auto">
              <Badge variant="secondary" className="text-base font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20">
                  <Star className="h-4 w-4 mr-1.5" />
                  {reward.points.toLocaleString()}
              </Badge>

              <div className="w-full">
                <Button 
                    size="sm" 
                    onClick={() => onRedeem(reward.points, reward.title)}
                    disabled={!canAfford || isGuest}
                    className={cn(
                        "w-full transition-all duration-300",
                        !canAfford && "bg-secondary hover:bg-secondary"
                    )}
                >
                    {isGuest ? 'Sign in to Redeem' : (canAfford ? 'Redeem' : 'More Points')}
                </Button>
              </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}
