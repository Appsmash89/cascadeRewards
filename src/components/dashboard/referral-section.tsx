
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getReferralBonus } from "@/app/actions";
import { Clipboard, ClipboardCheck, Calculator, Users, Loader2 } from 'lucide-react';
import type { UserProfile, Referral } from "@/lib/types";
import { motion, AnimatePresence } from 'framer-motion';

type ReferralSectionProps = {
  user: UserProfile | null;
  referrals: Referral[];
  isGuest: boolean;
}

export default function ReferralSection({ user, referrals, isGuest }: ReferralSectionProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [baseReward, setBaseReward] = useState(100);
  const [bonusResult, setBonusResult] = useState<{ multiplier: number, total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const referralCode = user?.referralCode ?? '...';
  const referralLevel = user?.level ?? 0;
  const referralCount = user?.referrals ?? referrals.length;

  const handleCopy = () => {
    if (referralCode.startsWith('CASC-')) {
        const uniquePart = referralCode.substring(5);
        navigator.clipboard.writeText(uniquePart);
    } else {
        navigator.clipboard.writeText(referralCode);
    }
    
    setIsCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Your unique referral code is ready to be shared.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCalculateBonus = async () => {
    setIsLoading(true);
    setError(null);
    setBonusResult(null);

    const result = await getReferralBonus({ referrerLevel: referralLevel, baseReward });

    if (result.success && result.data) {
      setBonusResult({ multiplier: result.data.bonusMultiplier, total: result.data.totalReward });
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };
  
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
    <Card className="flex flex-col shadow-sm">
      <CardHeader>
        <CardTitle>Referral Dashboard</CardTitle>
        <CardDescription>Manage your network and track earnings.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow gap-6">
        <motion.div variants={itemVariants}>
          <Label htmlFor="referral-code" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Unique Code</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="referral-code" value={referralCode} readOnly className="font-mono text-lg tracking-wider bg-secondary" />
            <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy referral code" disabled={isGuest}>
              <AnimatePresence mode="wait">
                {isCopied ? (
                  <motion.div key="copied" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Clipboard className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </motion.div>

        <Separator />

        <motion.div variants={itemVariants} className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <Users className="h-4 w-4" />
            Your Referrals ({referralCount})
          </h4>
          { isGuest ? (
            <p className="text-sm text-muted-foreground p-2 text-center">Admins do not have referrals.</p>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 -mr-2">
              <AnimatePresence>
                {referrals.map((referral, i) => (
                  <motion.div 
                    key={referral.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center p-2 rounded-md hover:bg-secondary"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={referral.avatarUrl} alt={referral.name} data-ai-hint="person portrait" />
                      <AvatarFallback>{getInitials(referral.name)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3 space-y-1">
                      <p className="text-sm font-medium leading-none">{referral.name}</p>
                      <p className="text-xs text-muted-foreground">Joined: {referral.joinDate}</p>
                    </div>
                  </motion.div>
                ))}
                 {referralCount > referrals.length && (
                  <div className="p-2 text-center text-muted-foreground text-sm">
                    ...and {referralCount - referrals.length} more.
                  </div>
                 )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        <Separator />

        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <Calculator className="h-4 w-4 text-primary" />
            Bonus Calculator
          </h4>
          <p className="text-sm text-muted-foreground">
            See potential earnings based on your referral level ({referralLevel}).
          </p>
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <Label htmlFor="base-reward">Base Reward (Points)</Label>
              <Input
                id="base-reward"
                type="number"
                value={baseReward}
                onChange={(e) => setBaseReward(Number(e.target.value))}
                className="bg-secondary"
              />
            </div>
            <Button onClick={handleCalculateBonus} disabled={isLoading} className="w-32 h-10">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calculate"}
            </Button>
          </div>
          <AnimatePresence>
          {bonusResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-primary/10 rounded-lg border border-primary/20 space-y-2 text-sm"
            >
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bonus Multiplier:</span>
                <span className="font-semibold">{bonusResult.multiplier}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Reward:</span>
                <Badge className="text-base" variant="secondary">{bonusResult.total.toLocaleString()} pts</Badge>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </motion.div>
      </CardContent>
    </Card>
    </motion.div>
  )
}
