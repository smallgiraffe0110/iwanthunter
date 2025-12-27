import { AI_MODEL } from '@/lib/ai/model';
import { PROMPT } from '@/lib/ai/prompts';
import { getMostRecentUserMessage } from '@/lib/utils';
import { streamText, type LanguageModel } from 'ai';

export const maxDuration = 50;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', {
        status: 404,
      });
    }

    const result = streamText({
      model: AI_MODEL as unknown as LanguageModel,
      system: PROMPT,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}
