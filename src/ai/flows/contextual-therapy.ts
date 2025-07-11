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
import * as fs from 'node:fs/promises';

const ContextualTherapyInputSchema = z.object({
  userId: z.string().describe('The unique identifier for the user.'),
  message: z.string().describe('The current message from the user.'),
});
export type ContextualTherapyInput = z.infer<typeof ContextualTherapyInputSchema>;

const ContextualTherapyOutputSchema = z.object({
  response: z.string().describe('The response from the therapy bot.'),
  summary: z.string().describe('Summary of the current session.'),
});
export type ContextualTherapyOutput = z.infer<typeof ContextualTherapyOutputSchema>;

export async function contextualTherapy(input: ContextualTherapyInput): Promise<ContextualTherapyOutput> {
  return contextualTherapyFlow(input);
}

const getPreviousSessionSummary = ai.defineTool({
  name: 'getPreviousSessionSummary',
  description: 'Retrieves the summary of the previous therapy session for a given user.',
  inputSchema: z.object({
    userId: z.string().describe('The unique identifier for the user.'),
  }),
  outputSchema: z.string().optional(),
},
async (input) => {
  const filePath = `therapy_sessions/${input.userId}_summary.txt`;
  try {
    const summary = await fs.readFile(filePath, 'utf-8');
    return summary;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return undefined;
    } else {
      throw error;
    }
  }
});

const saveSessionSummary = ai.defineTool({
    name: 'saveSessionSummary',
    description: 'Saves the summary of the current therapy session for a given user.',
    inputSchema: z.object({
      userId: z.string().describe('The unique identifier for the user.'),
      summary: z.string().describe('The summary of the current session.'),
    }),
    outputSchema: z.boolean(),
  },
  async (input) => {
    const filePath = `therapy_sessions/${input.userId}_summary.txt`;
    try {
      await fs.writeFile(filePath, input.summary, 'utf-8');
      return true;
    } catch (error) {
      console.error('Failed to save session summary:', error);
      return false;
    }
  }
);

const prompt = ai.definePrompt({
  name: 'contextualTherapyPrompt',
  input: {schema: ContextualTherapyInputSchema},
  output: {schema: ContextualTherapyOutputSchema},
  tools: [getPreviousSessionSummary, saveSessionSummary],
  prompt: `You are a therapy bot, designed to help users with their mental health.

  {% if tools.getPreviousSessionSummary.result %}
  Previous Session Summary:
  {{tools.getPreviousSessionSummary.result}}
  {% else %}
  This is the user\'s first session.  No previous session summary exists.
  {% endif %}

  User Message: {{{message}}}

  Respond in a helpful and empathetic way.
  After responding to the user, create a summary of the session and save it using the saveSessionSummary tool.
  `,
});

const contextualTherapyFlow = ai.defineFlow(
  {
    name: 'contextualTherapyFlow',
    inputSchema: ContextualTherapyInputSchema,
    outputSchema: ContextualTherapyOutputSchema,
  },
  async input => {
    // Ensure the directory exists
    const dir = 'therapy_sessions';
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory may already exist
      if ((error as any).code !== 'EEXIST') {
        console.error('Error creating directory:', error);
      }
    }

    const {output} = await prompt(input);

    if (!output) {
      throw new Error('No output from prompt.');
    }

    // Save the session summary after generating the response
    await saveSessionSummary({
      userId: input.userId,
      summary: output.summary,
    });

    return output!;
  }
);
