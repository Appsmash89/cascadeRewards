'use server';

import { calculateReferralBonus, CalculateReferralBonusInput } from '@/ai/flows/referral-bonus-calculation';

export async function getReferralBonus(input: CalculateReferralBonusInput) {
  try {
    const result = await calculateReferralBonus(input);
    if (!result || typeof result.bonusMultiplier !== 'number' || typeof result.totalReward !== 'number') {
      throw new Error('Invalid response from AI model.');
    }
    return { success: true, data: result };
  } catch (error) {
    console.error('Error calculating referral bonus:', error);
    return { success: false, error: 'Failed to calculate bonus. Please try again.' };
  }
}
