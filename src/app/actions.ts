'use server';

export type CalculateReferralBonusInput = {
  referrerLevel: number;
  baseReward: number;
};

export async function getReferralBonus(input: CalculateReferralBonusInput) {
  try {
    // Manually coded logic for bonus calculation
    const bonusMultiplier = 1 + input.referrerLevel * 0.1;
    const totalReward = Math.round(input.baseReward * bonusMultiplier);

    const result = {
      bonusMultiplier: parseFloat(bonusMultiplier.toFixed(2)),
      totalReward,
    };

    return { success: true, data: result };
  } catch (error) {
    console.error('Error calculating referral bonus:', error);
    return { success: false, error: 'Failed to calculate bonus. Please try again.' };
  }
}
