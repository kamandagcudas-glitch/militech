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
  console.log("[Soul] Neural link request received:", input.message);
  
  try {
    // Construct messages array explicitly for Genkit 1.x stability
    const messages: any[] = (input.history || []).map(m => ({
      role: m.role,
      content: [{ text: m.content }]
    }));

    // Append current message
    messages.push({
      role: 'user',
      content: [{ text: input.message }]
    });

    const response = await ai.generate({
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
- Tone: Professional but with a sharp, tactical edge.

CORE DIRECTIVE:
Help the administrator manage the simulation core, answer technical queries, and maintain a high-performance neural environment.`,
      messages: messages,
    });

    const text = response.text;

    if (!text) {
      console.error("[Soul] Empty neural signal received.");
      throw new Error('NEURAL_SIGNAL_EMPTY');
    }
    
    console.log("[Soul] Response manifested successfully.");
    return { response: text };
  } catch (error: any) {
    console.error(`[Soul] Core Link Interrupted:`, error.message);
    // Return a graceful error message instead of throwing to prevent UI crash
    return { 
      response: "Soul is currently synchronizing with the simulation core. Please re-transmit your message in a moment. [LINK_SYNC_PENDING]",
      error: true 
    };
  }
}
