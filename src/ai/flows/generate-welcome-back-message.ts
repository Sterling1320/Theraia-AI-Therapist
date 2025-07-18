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
import { googleAI } from '@genkit-ai/googleai';

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
2.  Generate a warm, welcoming, and personalized message for the user. Address them by their name.
3.  The message should show that you remember them without being too direct about their past vulnerabilities. Instead of mentioning a specific topic, use a softer approach. For example: "Welcome back, [Name]. It's good to see you again. How have you been feeling since our last discussion?"
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
    const llm = googleAI.model('gemini-1.5-pro-latest');
    const { output } = await welcomeBackPrompt(input, { llm });
    if (!output) {
      throw new Error('Failed to generate welcome back message.');
    }
    return output;
  }
);
