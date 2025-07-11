'use server';

/**
 * @fileOverview Summarize a therapy session, encrypt it, and return it.
 *
 * - summarizeAndEncryptSession - A function that summarizes a chat log and returns an encrypted string.
 * - SummarizeAndEncryptSessionInput - The input type for the function.
 * - SummarizeAndEncryptSessionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Key must be 32 bytes for aes-256-cbc. This is a default key.
// In a production environment, this should be set in environment variables.
const SECRET_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'utf-8'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

const SummarizeAndEncryptSessionInputSchema = z.object({
  chatLog: z
    .string()
    .describe('Complete chat log of the therapy session as a single string.'),
  previousSummary: z
    .string()
    .optional()
    .describe(
      'The summary and notes from previous sessions, if they exist.'
    ),
});

export type SummarizeAndEncryptSessionInput = z.infer<
  typeof SummarizeAndEncryptSessionInputSchema
>;

const SummarizeAndEncryptSessionOutputSchema = z.object({
  encryptedRecord: z.string().describe('The encrypted session record.'),
});

export type SummarizeAndEncryptSessionOutput = z.infer<
  typeof SummarizeAndEncryptSessionOutputSchema
>;

const SessionSummarySchema = z.object({
    summary: z.string().describe('A concise summary of the key topics discussed in the latest session.'),
    therapeuticNotes: z.string().describe('Professional therapeutic notes, including observations, potential progress, and areas to explore in future sessions.'),
});

export async function summarizeAndEncryptSession(
  input: SummarizeAndEncryptSessionInput
): Promise<SummarizeAndEncryptSessionOutput> {
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
    inputSchema: SummarizeAndEncryptSessionInputSchema,
    outputSchema: SummarizeAndEncryptSessionOutputSchema,
  },
  async ({ chatLog, previousSummary }) => {
    const { output: newSummary } = await summarizeSessionPrompt({ chatLog });
    if (!newSummary) {
        throw new Error('Failed to generate session summary.');
    }

    const today = new Date().toISOString().split('T')[0];
    const newRecordContent = `
## Session Date: ${today}

### Summary
${newSummary.summary}

### Therapeutic Notes
${newSummary.therapeuticNotes}
`;

    // Prepend the new record to the previous summary
    const fullRecord = `${newRecordContent.trim()}\n\n---\n\n${previousSummary || ''}`;
    
    const encryptedRecord = encrypt(fullRecord.trim());

    return { encryptedRecord };
  }
);
