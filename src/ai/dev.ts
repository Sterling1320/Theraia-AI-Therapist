import { config } from 'dotenv';
config();

import '@/ai/flows/concluding-message.ts';
import '@/ai/flows/contextual-therapy.ts';
import '@/ai/flows/summarize-session.ts';
import '@/ai/flows/parse-introduction.ts';
import '@/ai/flows/generate-welcome-back-message.ts';
import '@/ai/flows/continued-conversation.ts';
