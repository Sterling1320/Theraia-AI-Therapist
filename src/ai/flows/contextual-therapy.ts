'use server';

/**
 * @fileOverview A therapy AI agent for a user's first session.
 *
 * - initialTherapy - A function that handles the initial therapy session.
 * - InitialTherapyInput - The input type for the initialTherapy function.
 * - InitialTherapyOutput - The return type for the initialTherapy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialTherapyInputSchema = z.object({
  message: z.string().describe('The current message from the user.'),
});
export type InitialTherapyInput = z.infer<typeof InitialTherapyInputSchema>;

const InitialTherapyOutputSchema = z.object({
  response: z.string().describe('The response from the therapy bot.'),
});
export type InitialTherapyOutput = z.infer<typeof InitialTherapyOutputSchema>;

export async function initialTherapy(input: InitialTherapyInput): Promise<InitialTherapyOutput> {
  return initialTherapyFlow(input);
}


const prompt = ai.definePrompt({
  name: 'initialTherapyPrompt',
  input: {schema: InitialTherapyInputSchema},
  output: {schema: InitialTherapyOutputSchema},
  prompt: `You are a therapy bot, designed to help users with their mental health. This is the user's first session. Be welcoming and start fresh.

  User Message: {{{message}}}

  Respond in a helpful and empathetic way. Your main goal is to listen and provide support based on the conversation.
  `,
});

const initialTherapyFlow = ai.defineFlow(
  {
    name: 'initialTherapyFlow',
    inputSchema: InitialTherapyInputSchema,
    outputSchema: InitialTherapyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('No output from prompt.');
    }
    return output;
  }
);
