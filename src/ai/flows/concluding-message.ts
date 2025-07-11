'use server';

/**
 * @fileOverview A flow to generate a personalized concluding message for a therapy session.
 *
 * - getConcludingMessage - A function that takes the chat log and returns a warm, summary message.
 * - ConcludingMessageInput - The input type for the function.
 * - ConcludingMessageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConcludingMessageInputSchema = z.object({
  chatLog: z
    .string()
    .describe('Complete chat log of the therapy session as a single string.'),
});
export type ConcludingMessageInput = z.infer<
  typeof ConcludingMessageInputSchema
>;

const ConcludingMessageOutputSchema = z.object({
  message: z
    .string()
    .describe('A warm, personalized concluding message for the user.'),
});
export type ConcludingMessageOutput = z.infer<
  typeof ConcludingMessageOutputSchema
>;

export async function getConcludingMessage(
  input: ConcludingMessageInput
): Promise<ConcludingMessageOutput> {
  return concludingMessageFlow(input);
}

const concludingMessagePrompt = ai.definePrompt({
  name: 'concludingMessagePrompt',
  input: {schema: ConcludingMessageInputSchema},
  output: {schema: ConcludingMessageOutputSchema},
  prompt: `You are an AI therapist concluding a session with a patient. Based on the following chat log, please generate a warm, personalized, and encouraging concluding message. Briefly acknowledge the topics discussed, praise the user for their courage or insights, and offer a hopeful or supportive closing statement.

The message should be about 2-4 sentences long.

Chat Log:
---
{{{chatLog}}}
---
`,
});

const concludingMessageFlow = ai.defineFlow(
  {
    name: 'concludingMessageFlow',
    inputSchema: ConcludingMessageInputSchema,
    outputSchema: ConcludingMessageOutputSchema,
  },
  async input => {
    const {output} = await concludingMessagePrompt(input);
    if (!output) {
      throw new Error('Failed to generate concluding message.');
    }
    return output;
  }
);
