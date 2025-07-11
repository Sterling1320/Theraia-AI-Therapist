// Summarize the therapy session and generate therpaeutic notes for a session.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SessionSummaryInputSchema = z.object({
  sessionId: z.string().describe('Unique identifier for the session.'),
  chatLog: z.string().describe('Complete chat log of the therapy session.'),
  previousSummary: z
    .string()
    .optional()
    .describe('Summary of the previous session, if available.'),
});

export type SessionSummaryInput = z.infer<typeof SessionSummaryInputSchema>;

const SessionSummaryOutputSchema = z.object({
  summary: z.string().describe('Summary of the therapy session.'),
  therapeuticNotes: z.string().describe('Therapeutic notes from the session.'),
});

export type SessionSummaryOutput = z.infer<typeof SessionSummaryOutputSchema>;

export async function summarizeSession(
  input: SessionSummaryInput
): Promise<SessionSummaryOutput> {
  return summarizeSessionFlow(input);
}

const summarizeSessionPrompt = ai.definePrompt({
  name: 'summarizeSessionPrompt',
  input: {schema: SessionSummaryInputSchema},
  output: {schema: SessionSummaryOutputSchema},
  prompt: `You are an AI therapist reviewing a therapy session.

  Summarize the session, including key topics discussed and the overall sentiment of the patient. Also include therapeutic notes like possible diagnosis and treatment plans for the patient. Consider the previous session summary if available.

  Previous Session Summary: {{previousSummary}}

  Session Transcript: {{chatLog}}`,
});

const summarizeSessionFlow = ai.defineFlow(
  {
    name: 'summarizeSessionFlow',
    inputSchema: SessionSummaryInputSchema,
    outputSchema: SessionSummaryOutputSchema,
  },
  async input => {
    const {output} = await summarizeSessionPrompt(input);
    return output!;
  }
);
