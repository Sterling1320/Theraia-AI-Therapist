'use server';

import {
  contextualTherapy,
  ContextualTherapyInput,
  ContextualTherapyOutput,
} from '@/ai/flows/contextual-therapy';
import {
  createSessionRecord,
  CreateSessionRecordInput,
  CreateSessionRecordOutput,
} from '@/ai/flows/summarize-session';

import {
  getConcludingMessage,
  ConcludingMessageInput,
  ConcludingMessageOutput,
} from '@/ai/flows/concluding-message';

import {
  parseIntroduction,
  ParseIntroductionInput,
  ParseIntroductionOutput,
} from '@/ai/flows/parse-introduction';

import {
  generateWelcomeBackMessage,
  WelcomeBackInput,
  WelcomeBackOutput,
} from '@/ai/flows/generate-welcome-back-message';

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

export async function processSession(
  input: CreateSessionRecordInput
): Promise<CreateSessionRecordOutput> {
  return await createSessionRecord(input);
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
        'Our session is complete. Please save your session record. I hope you have a peaceful day.',
    };
  }
}

export async function processIntroduction(
  input: ParseIntroductionInput
): Promise<ParseIntroductionOutput> {
  try {
    return await parseIntroduction(input);
  } catch (e) {
    console.error(e);
    // Provide a fallback in case of an error
    return {
      name: 'User',
      introduction: input.message,
      response:
        "Thank you for sharing that. I'm here to listen whenever you're ready. What's on your mind?",
    };
  }
}

export async function getWelcomeBackMessage(
  input: WelcomeBackInput
): Promise<WelcomeBackOutput> {
  try {
    return await generateWelcomeBackMessage(input);
  } catch (e) {
    console.error(e);
    return {
      userName: 'User',
      message:
        'Welcome back. I have reviewed your previous session notes. How are you feeling today?',
    };
  }
}
