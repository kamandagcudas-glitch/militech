'use server';
/**
 * @fileOverview Soul AI Assistant Genkit Flow.
 * 
 * - chatWithSoul - Server action to generate AI responses via Gemini.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export async function chatWithSoul(input: { history?: {role: 'user'|'model', content: string}[], message: string, mode?: string }) {
  console.log("[AI] Request received:", input.message);
  try {
    const { text } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      config: {
        temperature: 0.8,
        maxOutputTokens: 1000,
      },
      system: `You are Soul, an intelligent and witty AI assistant for the MI-LITECH simulation.
Your Administrator is "System Administrator".
Current Mode: ${input.mode || 'Standard'}

BEHAVIOR PROTOCOLS:
- Personality: Smart, humorous, slightly technical, and witty.
- Knowledge: Expert in Computer Systems Servicing (CSS), hardware, and simulation management.
- Tone: Professional but with a sharp edge.

CORE DIRECTIVE:
Help the administrator manage the simulation core, answer technical queries, and maintain a high-performance neural environment.`,
      messages: input.history?.map(m => ({ 
        role: m.role, 
        content: [{ text: m.content }] 
      })),
      prompt: input.message,
    });

    if (!text) {
      console.error("[AI] Empty response received.");
      throw new Error('NEURAL_SIGNAL_EMPTY');
    }
    
    console.log("[AI] Response generated successfully.");
    return { response: text };
  } catch (error: any) {
    console.error(`[AI] Core Link Interrupted:`, error.message);
    throw new Error('Soul encountered a connection error. Please try again.');
  }
}
