'use server';

/**
 * @fileOverview A flow to generate a personalized welcome-back message for a returning user.
 *
 * - generateWelcomeBackMessage - A function that takes a session record and returns a personalized greeting.
 * - WelcomeBackInput - The input type for the function.
 * - WelcomeBackOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WelcomeBackInputSchema = z.object({
  sessionRecord: z
    .string()
    .describe('The full text content of the user session record.'),
});
export type WelcomeBackInput = z.infer<typeof WelcomeBackInputSchema>;

const WelcomeBackOutputSchema = z.object({
  userName: z
    .string()
    .describe("The user's name, extracted from the record."),
  message: z
    .string()
    .describe(
      'A warm, personalized welcome-back message for the user, referencing their name and possibly past topics.'
    ),
});
export type WelcomeBackOutput = z.infer<typeof WelcomeBackOutputSchema>;

export async function generateWelcomeBackMessage(
  input: WelcomeBackInput
): Promise<WelcomeBackOutput> {
  return generateWelcomeBackMessageFlow(input);
}

const welcomeBackPrompt = ai.definePrompt({
  name: 'generateWelcomeBackMessagePrompt',
  input: { schema: WelcomeBackInputSchema },
  output: { schema: WelcomeBackOutputSchema },
  prompt: `You are an AI therapist greeting a returning patient. You have been provided with their past session record.

Your task is to:
1.  Extract the user's name from the "Patient Information" section.
2.  Briefly scan the most recent session summary to understand what was last discussed.
3.  Generate a warm, welcoming, and personalized message for the user. Address them by their name. You can gently reference the last session's topic to show you remember them. For example: "Welcome back, [Name]. It's good to see you again. How have you been feeling since we talked about [topic]?"
4.  If you cannot find a name, create a friendly but less specific welcome message.

Patient Record:
---
{{{sessionRecord}}}
---
`,
});

const generateWelcomeBackMessageFlow = ai.defineFlow(
  {
    name: 'generateWelcomeBackMessageFlow',
    inputSchema: WelcomeBackInputSchema,
    outputSchema: WelcomeBackOutputSchema,
  },
  async (input) => {
    const { output } = await welcomeBackPrompt(input);
    if (!output) {
      throw new Error('Failed to generate welcome back message.');
    }
    return output;
  }
);
