
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
import { useSearchParams } from 'next/navigation';

type ReferralSectionProps = {
  user: UserProfile | null;
  referrals: Referral[];
}

export default function ReferralSection({ user, referrals }: ReferralSectionProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [baseReward, setBaseReward] = useState(100);
  const [bonusResult, setBonusResult] = useState<{ multiplier: number, total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('mode') === 'guest';
  
  const referralCode = isGuestMode ? 'CASC-GUEST' : user?.referralCode ?? '...';
  const referralLevel = isGuestMode ? 0 : user?.level ?? 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setIsCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Your referral code is ready to be shared.",
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

  return (
    <Card className="flex flex-col shadow-sm">
      <CardHeader>
        <CardTitle>Referral Dashboard</CardTitle>
        <CardDescription>Manage your network and track earnings.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow gap-6">
        <div>
          <Label htmlFor="referral-code" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Unique Code</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="referral-code" value={referralCode} readOnly className="font-mono text-lg tracking-wider bg-secondary" />
            <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy referral code">
              {isCopied ? <ClipboardCheck className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <Users className="h-4 w-4" />
            Your Referrals ({referrals.length})
          </h4>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 -mr-2">
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center p-2 rounded-md hover:bg-secondary">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={referral.avatarUrl} alt={referral.name} data-ai-hint="person portrait" />
                  <AvatarFallback>{getInitials(referral.name)}</AvatarFallback>
                </Avatar>
                <div className="ml-3 space-y-1">
                  <p className="text-sm font-medium leading-none">{referral.name}</p>
                  <p className="text-xs text-muted-foreground">Joined: {referral.joinDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
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
          {bonusResult && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bonus Multiplier:</span>
                <span className="font-semibold">{bonusResult.multiplier}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Reward:</span>
                <Badge className="text-base" variant="secondary">{bonusResult.total.toLocaleString()} pts</Badge>
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
