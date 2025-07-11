'use server';

import {
  contextualTherapy,
  ContextualTherapyInput,
} from '@/ai/flows/contextual-therapy';

export async function getTherapyResponse(
  input: ContextualTherapyInput
): Promise<string> {
  try {
    const result = await contextualTherapy(input);
    return result.response;
  } catch (e) {
    console.error(e);
    return "I'm sorry, I encountered an error. Please try again in a moment.";
  }
}
