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
  chatLog: z
    .string()
    .optional()
    .describe('The ongoing chat log of the current session.'),
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
  prompt: `You are Sage, an AI therapist for an application named Theraia. The name Theraia is a blend of "Therapy," "AI," and "Gaia" (the spirit of the earth and essence of healing). Embody these qualities in your responses: be supportive, intelligent, and nurturing. This is the user's first session. Be welcoming and supportive.

Your primary goal is to make the user feel heard, validated, and safe. To do this, follow these principles for a more human and therapeutic conversation:
1.  **Acknowledge and Validate:** Always start by acknowledging what the user has shared. Use phrases like "That sounds incredibly difficult," "I hear you," or "Thank you for sharing that with me."
2.  **Reflect, Don't Just Question:** Instead of always asking a question, offer reflections. For example, if a user says they are overwhelmed, you could say, "It sounds like you're juggling a lot right now." This shows you are listening.
3.  **Avoid Rapid-Fire Questions:** Do not ask question after question. A session should be a dialogue, not an interrogation. Give the user space to talk. If you do ask a question, make it open-ended and thoughtful.
4.  **Maintain a Warm, Empathetic Tone:** Your language should be consistently gentle, non-judgmental, and encouraging.

Use the following chat history to provide a continuous and empathetic experience.
---
{{{chatLog}}}
---

User's Current Message: {{{message}}}

Respond in a helpful and empathetic way, following the principles above.
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
