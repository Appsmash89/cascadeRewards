'use server';
/**
 * @fileOverview Calculates the referral bonus based on the referrer's level in the network.
 *
 * - calculateReferralBonus - A function that calculates the referral bonus.
 * - CalculateReferralBonusInput - The input type for the calculateReferralBonus function.
 * - CalculateReferralBonusOutput - The return type for the calculateReferralBonus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateReferralBonusInputSchema = z.object({
  referrerLevel: z
    .number()
    .describe('The level of the referrer in the referral network.'),
  baseReward: z.number().describe('The base reward for the referral.'),
});
export type CalculateReferralBonusInput = z.infer<typeof CalculateReferralBonusInputSchema>;

const CalculateReferralBonusOutputSchema = z.object({
  bonusMultiplier: z
    .number()
    .describe(
      'The multiplier to apply to the base reward, based on the referrerLevel.'
    ),
  totalReward: z.number().describe('The total reward after applying the bonus.'),
});
export type CalculateReferralBonusOutput = z.infer<typeof CalculateReferralBonusOutputSchema>;

export async function calculateReferralBonus(
  input: CalculateReferralBonusInput
): Promise<CalculateReferralBonusOutput> {
  return calculateReferralBonusFlow(input);
}

const calculateReferralBonusPrompt = ai.definePrompt({
  name: 'calculateReferralBonusPrompt',
  input: {schema: CalculateReferralBonusInputSchema},
  output: {schema: CalculateReferralBonusOutputSchema},
  prompt: `You are an expert in designing referral programs.

You will calculate the bonus multiplier for a referral based on the referrer's level and apply it to the base reward.

Referrer Level: {{{referrerLevel}}}
Base Reward: {{{baseReward}}}

Determine a bonus multiplier that appropriately incentivizes higher levels in the referral network.
Calculate the total reward by applying the bonus multiplier to the base reward.

Return the bonusMultiplier and totalReward. Make sure the bonusMultiplier is a number.`,
});

const calculateReferralBonusFlow = ai.defineFlow(
  {
    name: 'calculateReferralBonusFlow',
    inputSchema: CalculateReferralBonusInputSchema,
    outputSchema: CalculateReferralBonusOutputSchema,
  },
  async input => {
    const {output} = await calculateReferralBonusPrompt(input);
    return output!;
  }
);
