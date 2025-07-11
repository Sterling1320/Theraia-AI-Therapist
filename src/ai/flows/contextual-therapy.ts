'use server';

/**
 * @fileOverview A contextual therapy AI agent that uses previous session summaries to maintain context.
 *
 * - contextualTherapy - A function that handles the therapy session with contextual awareness.
 * - ContextualTherapyInput - The input type for the contextualTherapy function.
 * - ContextualTherapyOutput - The return type for the contextualTherapy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualTherapyInputSchema = z.object({
  message: z.string().describe('The current message from the user.'),
  history: z.string().optional().describe('The previous chat history and notes, if available.'),
});
export type ContextualTherapyInput = z.infer<typeof ContextualTherapyInputSchema>;

const ContextualTherapyOutputSchema = z.object({
  response: z.string().describe('The response from the therapy bot.'),
});
export type ContextualTherapyOutput = z.infer<typeof ContextualTherapyOutputSchema>;

export async function contextualTherapy(input: ContextualTherapyInput): Promise<ContextualTherapyOutput> {
  return contextualTherapyFlow(input);
}


const prompt = ai.definePrompt({
  name: 'contextualTherapyPrompt',
  input: {schema: ContextualTherapyInputSchema},
  output: {schema: ContextualTherapyOutputSchema},
  prompt: `You are a therapy bot, designed to help users with their mental health.

  {{#if history}}
  Here are the notes from the previous session:
  ---
  {{{history}}}
  ---
  Use this information to inform your conversation.
  {{else}}
  This is the user's first session. Be welcoming and start fresh.
  {{/if}}

  User Message: {{{message}}}

  Respond in a helpful and empathetic way. Your main goal is to listen and provide support based on the conversation.
  `,
});

const contextualTherapyFlow = ai.defineFlow(
  {
    name: 'contextualTherapyFlow',
    inputSchema: ContextualTherapyInputSchema,
    outputSchema: ContextualTherapyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('No output from prompt.');
    }
    return output;
  }
);
