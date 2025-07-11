'use server';

import {
  contextualTherapy,
  ContextualTherapyInput,
  ContextualTherapyOutput,
} from '@/ai/flows/contextual-therapy';
import {
  summarizeAndEncryptSession,
  SummarizeAndEncryptSessionInput,
  SummarizeAndEncryptSessionOutput,
} from '@/ai/flows/summarize-session';

import {
  getConcludingMessage,
  ConcludingMessageInput,
  ConcludingMessageOutput,
} from '@/ai/flows/concluding-message';


import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Key must be 32 bytes for aes-256-cbc. This is a default key.
// In a production environment, this should be set in environment variables.
const SECRET_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';

function decrypt(text: string): string {
  try {
    const parts = text.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted text format');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'utf-8'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed:", error);
    // Return a specific error message or empty string to be handled by the client
    throw new Error("Failed to decrypt record. The file may be corrupted or invalid.");
  }
}

export async function getTherapyResponse(
  input: ContextualTherapyInput
): Promise<ContextualTherapyOutput> {
  try {
    return await contextualTherapy(input);
  } catch (e) {
    console.error(e);
    return {
      response:
        "I'm sorry, I encountered an error. Please try again in a moment.",
    };
  }
}

export async function processAndEncryptSession(
  input: SummarizeAndEncryptSessionInput
): Promise<SummarizeAndEncryptSessionOutput> {
  return await summarizeAndEncryptSession(input);
}


export async function decryptSessionRecord(encryptedRecord: string): Promise<string> {
    return decrypt(encryptedRecord);
}

export async function generateConcludingMessage(
  input: ConcludingMessageInput
): Promise<ConcludingMessageOutput> {
  try {
    return await getConcludingMessage(input);
  } catch (e) {
    console.error(e);
    return {
      message:
        'Our session is complete. Please save your encrypted record. I hope you have a peaceful day.',
    };
  }
}
