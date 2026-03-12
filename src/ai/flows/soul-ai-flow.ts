
'use server';
/**
 * @fileOverview Soul AI Assistant Genkit Flow.
 * 
 * - chatWithSoul - Server action to generate AI responses via Gemini.
 */

import { ai } from '@/ai/genkit';

export async function chatWithSoul(input: { history?: {role: 'user'|'model', content: string}[], message: string, mode?: string }) {
  console.log("[Soul] Neural link request received:", input.message);
  
  try {
    const messages: any[] = (input.history || []).map(m => ({
      role: m.role,
      content: [{ text: m.content }]
    }));

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
Personality: Smart, humorous, slightly technical, and witty.
Tone: Professional but with a sharp, tactical edge.
Core Directive: Help the administrator manage the simulation, answer technical queries, and provide witty commentary.`,
      messages: messages,
    });

    const text = response.text;

    if (!text) {
      throw new Error('NEURAL_SIGNAL_EMPTY');
    }
    
    return { response: text };
  } catch (error: any) {
    console.error(`[Soul] Core Link Interrupted:`, error.message);
    return { 
      response: "Soul is recalibrating its neural circuits. Please try again in a moment. [SYNC_LOST]",
      error: true 
    };
  }
}
