'use server';

/**
 * @fileOverview A flow to parse a user's introduction, extracting key details and generating a welcoming response.
 *
 * - parseIntroduction - A function that takes the user's introductory message and extracts information.
 * - ParseIntroductionInput - The input type for the function.
 * - ParseIntroductionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ParseIntroductionInputSchema = z.object({
  message: z.string().describe("The user's introductory message."),
});
export type ParseIntroductionInput = z.infer<typeof ParseIntroductionInputSchema>;

const ParseIntroductionOutputSchema = z.object({
  name: z
    .string()
    .describe(
      "The user's name, extracted from the introduction. Default to 'User' if not found."
    ),
  introduction: z
    .string()
    .describe(
      'A one-sentence summary of the main topic or reason the user is here, extracted from their message.'
    ),
  response: z
    .string()
    .describe(
      'A warm, empathetic follow-up response that acknowledges their introduction and gently prompts them to start the session.'
    ),
});
export type ParseIntroductionOutput = z.infer<
  typeof ParseIntroductionOutputSchema
>;

export async function parseIntroduction(
  input: ParseIntroductionInput
): Promise<ParseIntroductionOutput> {
  return parseIntroductionFlow(input);
}

const introductionPrompt = ai.definePrompt({
  name: 'parseIntroductionPrompt',
  input: { schema: ParseIntroductionInputSchema },
  output: { schema: ParseIntroductionOutputSchema },
  prompt: `You are an AI therapist's assistant. A new user has just sent their first message. Your task is to analyze this introduction and extract key information.

User's Introduction:
---
{{{message}}}
---

Based on the message, please provide the following:
1.  **name**: Extract the user's name. If no name is explicitly mentioned, default to "User".
2.  **introduction**: Create a one-sentence summary of what the user wants to talk about.
3.  **response**: Write a brief, welcoming, and empathetic response. Acknowledge their introduction, and then smoothly transition to starting the session by asking something like "Where would you like to begin?" or "What's on your mind?".
`,
});

const parseIntroductionFlow = ai.defineFlow(
  {
    name: 'parseIntroductionFlow',
    inputSchema: ParseIntroductionInputSchema,
    outputSchema: ParseIntroductionOutputSchema,
  },
  async (input) => {
    const { output } = await introductionPrompt(input);
    if (!output) {
      throw new Error('Failed to parse introduction.');
    }
    return output;
  }
);
