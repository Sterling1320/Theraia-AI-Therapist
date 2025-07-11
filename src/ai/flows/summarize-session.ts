'use server';

/**
 * @fileOverview Summarize a therapy session and return it as a plain text record.
 *
 * - createSessionRecord - A function that summarizes a chat log and returns a plain text string.
 * - CreateSessionRecordInput - The input type for the function.
 * - CreateSessionRecordOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateSessionRecordInputSchema = z.object({
  chatLog: z
    .string()
    .describe('Complete chat log of the therapy session as a single string.'),
  previousSummary: z
    .string()
    .optional()
    .describe(
      'The summary and notes from previous sessions, if they exist.'
    ),
  userName: z.string().optional().describe("The user's name, if provided."),
  userIntro: z.string().optional().describe("The user's introduction, if provided."),
});

export type CreateSessionRecordInput = z.infer<
  typeof CreateSessionRecordInputSchema
>;

const CreateSessionRecordOutputSchema = z.object({
  sessionRecord: z.string().describe('The plain text session record.'),
});

export type CreateSessionRecordOutput = z.infer<
  typeof CreateSessionRecordOutputSchema
>;

const SessionSummarySchema = z.object({
    summary: z.string().describe('A concise summary of the key topics discussed in the latest session.'),
    therapeuticNotes: z.string().describe('Professional therapeutic notes, including observations, potential progress, and areas to explore in future sessions.'),
});

export async function createSessionRecord(
  input: CreateSessionRecordInput
): Promise<CreateSessionRecordOutput> {
  return summarizeSessionFlow(input);
}

const summarizeSessionPrompt = ai.definePrompt({
  name: 'summarizeSessionPrompt',
  input: {schema: z.object({ chatLog: z.string() })},
  output: {schema: SessionSummarySchema},
  prompt: `You are an AI therapist reviewing a therapy session. Based on the following chat log, please generate:
1. A concise summary of the session.
2. Detailed therapeutic notes, including observations, patient's mood, and potential topics for future sessions.

Chat Log:
---
{{{chatLog}}}
---
`,
});

const summarizeSessionFlow = ai.defineFlow(
  {
    name: 'summarizeSessionFlow',
    inputSchema: CreateSessionRecordInputSchema,
    outputSchema: CreateSessionRecordOutputSchema,
  },
  async ({ chatLog, previousSummary, userName, userIntro }) => {
    const { output: newSummary } = await summarizeSessionPrompt({ chatLog });
    if (!newSummary) {
        throw new Error('Failed to generate session summary.');
    }

    const today = new Date().toISOString().split('T')[0];
    const newSessionContent = `
## Session Date: ${today}

### Summary
${newSummary.summary}

### Therapeutic Notes
${newSummary.therapeuticNotes}
`;

    // Patient Information Block
    const patientInfo = `
# Theraia Patient Record

## Patient Information
**Name:** ${userName || 'Not provided.'}
**Initial Introduction:** ${userIntro || 'Not provided.'}
`.trim();

    let sessionEntries;
    if (previousSummary) {
      // For returning users, strip the old header to prevent duplicates.
      const oldEntries = previousSummary.split('# Theraia Patient Record')[1] || previousSummary;
      const cleanOldEntries = oldEntries.substring(oldEntries.indexOf('---') + 3).trim();
      sessionEntries = `${newSessionContent.trim()}\n\n---\n\n${cleanOldEntries}`;
    } else {
      // For new users, this is the first entry.
      sessionEntries = newSessionContent.trim();
    }
    
    // Always construct the final record with a single, clean header at the top.
    const fullRecord = `${patientInfo}\n\n---\n\n${sessionEntries}`;
    
    return { sessionRecord: fullRecord.trim() };
  }
);
