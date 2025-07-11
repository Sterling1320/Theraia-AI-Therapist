'use server';

/**
 * @fileOverview A contextual therapy AI agent that uses previous session summaries to maintain context for returning users.
 *
 * - continuedConversation - A function that handles the therapy session with contextual awareness.
 * - ContinuedConversationInput - The input type for the function.
 * - ContinuedConversationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContinuedConversationInputSchema = z.object({
  message: z.string().describe('The current message from the user.'),
  sessionRecord: z.string().describe('The full text record of previous sessions.'),
});
export type ContinuedConversationInput = z.infer<typeof ContinuedConversationInputSchema>;

const ContinuedConversationOutputSchema = z.object({
  response: z.string().describe('The response from the therapy bot.'),
});
export type ContinuedConversationOutput = z.infer<typeof ContinuedConversationOutputSchema>;

export async function continuedConversation(input: ContinuedConversationInput): Promise<ContinuedConversationOutput> {
  return continuedConversationFlow(input);
}


const prompt = ai.definePrompt({
  name: 'continuedConversationPrompt',
  input: {schema: ContinuedConversationInputSchema},
  output: {schema: ContinuedConversationOutputSchema},
  prompt: `You are a therapy bot, continuing a session with a returning patient. You have been provided with the record of their past session(s). Your main goal is to listen and provide support based on the ongoing conversation and the context from the record.

  Here are the notes from the previous session(s):
  ---
  {{{sessionRecord}}}
  ---
  Use this information to inform your conversation and provide a continuous experience.

  User's Current Message: {{{message}}}

  Respond in a helpful and empathetic way.
  `,
});

const continuedConversationFlow = ai.defineFlow(
  {
    name: 'continuedConversationFlow',
    inputSchema: ContinuedConversationInputSchema,
    outputSchema: ContinuedConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('No output from prompt.');
    }
    return output;
  }
);
