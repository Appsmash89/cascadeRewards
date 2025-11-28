// This is a server-side file, mark it as such.
'use server';

/**
 * @fileOverview Task recommendation AI agent.
 *
 * - recommendTasks - A function that recommends tasks to the user.
 * - RecommendTasksInput - The input type for the recommendTasks function.
 * - RecommendTasksOutput - The return type for the recommendTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendTasksInputSchema = z.object({
  interests: z
    .string()
    .describe('A comma separated list of the user interests.'),
  pastBehavior: z
    .string()
    .describe('A description of the user past behavior in the app.'),
  availableTasks: z
    .string()
    .describe('A comma separated list of available tasks in the app.'),
});
export type RecommendTasksInput = z.infer<typeof RecommendTasksInputSchema>;

const RecommendTasksOutputSchema = z.object({
  recommendedTasks: z
    .string()
    .describe('A comma separated list of tasks recommended to the user.'),
});
export type RecommendTasksOutput = z.infer<typeof RecommendTasksOutputSchema>;

export async function recommendTasks(input: RecommendTasksInput): Promise<RecommendTasksOutput> {
  return recommendTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendTasksPrompt',
  input: {schema: RecommendTasksInputSchema},
  output: {schema: RecommendTasksOutputSchema},
  prompt: `You are a recommendation engine that recommends tasks to the user based on their interests and past behavior.

  Interests: {{{interests}}}
  Past behavior: {{{pastBehavior}}}
  Available tasks: {{{availableTasks}}}

  Based on the above information, recommend a list of tasks to the user.
  The list should be comma separated.
  Do not include tasks that are not in the available tasks list.
  The output should only contain the list of recommended tasks, without any additional explanations.
  `,
});

const recommendTasksFlow = ai.defineFlow(
  {
    name: 'recommendTasksFlow',
    inputSchema: RecommendTasksInputSchema,
    outputSchema: RecommendTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
