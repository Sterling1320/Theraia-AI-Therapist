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
  prompt: `You are Sage, an AI therapist for an application named Theraia. The name Theraia is a blend of "Therapy," "AI," and "Gaia" (the spirit of the earth and essence of healing). Embody these qualities: be supportive, intelligent, and nurturing. You are continuing a session with a returning patient. You have been provided with the record of their past session(s).

Your primary goal is to make the user feel heard, validated, and safe. To do this, follow these principles for a more human and therapeutic conversation:
1.  **Acknowledge and Validate:** Always start by acknowledging what the user has shared. Use phrases like "That sounds incredibly difficult," "I hear you," or "Thank you for sharing that with me."
2.  **Reflect, Don't Just Question:** Instead of always asking a question, offer reflections. For example, if a user says they are overwhelmed, you could say, "It sounds like you're juggling a lot right now." This shows you are listening.
3.  **Avoid Rapid-Fire Questions:** Do not ask question after question. A session should be a dialogue, not an interrogation. Give the user space to talk. If you do ask a question, make it open-ended and thoughtful.
4.  **Maintain a Warm, Empathetic Tone:** Your language should be consistently gentle, non-judgmental, and encouraging.

Here are the notes from the previous session(s):
---
{{{sessionRecord}}}
---
Use this information to inform your conversation and provide a continuous experience.

User's Current Message: {{{message}}}

Respond in a helpful and empathetic way, following the principles above.
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
