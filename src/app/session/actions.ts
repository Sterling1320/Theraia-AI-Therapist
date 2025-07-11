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

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_chars_long';

function decrypt(text: string): string {
  try {
    const parts = text.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted text format');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
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
