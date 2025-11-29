
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Reward } from '@/lib/types';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

type RewardCardProps = {
  reward: Reward;
  userPoints: number;
  onRedeem: (points: number, title: string) => void;
  isGuest: boolean;
};

export default function RewardCard({ reward, userPoints, onRedeem, isGuest }: RewardCardProps) {
  const canAfford = userPoints >= reward.points;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg flex flex-col">
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
        
        <div className="flex flex-col items-start gap-3">
            <Badge variant="secondary" className="text-base font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
                <Award className="h-4 w-4 mr-1.5" />
                {reward.points.toLocaleString()}
            </Badge>

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

      </CardContent>
    </Card>
  );
}
