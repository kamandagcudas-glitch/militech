'use server';
/**
 * @fileOverview Soul AI Assistant Genkit Flow with personality modes and custom profile.
 * 
 * - chatWithSoul - The main entry point for the AI assistant.
 * - SoulInput - Input parameters including history, message, and profile.
 * - SoulOutput - The generated response from the AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const SoulModeSchema = z.enum(['search', 'secretary', 'researcher', 'problem-solver', 'bro']);
export type SoulMode = z.infer<typeof SoulModeSchema>;

const SoulInputSchema = z.object({
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
  message: z.string().describe('The new message from the admin.'),
  mode: SoulModeSchema.describe('The current personality mode of Soul.'),
  profile: z.object({
    aiName: z.string().optional().describe('The name the AI identifies as.'),
    adminName: z.string().optional().describe('How the AI should address the user.'),
    customInstructions: z.string().optional().describe('Global behavior overrides.'),
  }).optional(),
});
export type SoulInput = z.infer<typeof SoulInputSchema>;

const SoulOutputSchema = z.object({
  response: z.string().describe('The mode-specific response from Soul AI.'),
});
export type SoulOutput = z.infer<typeof SoulOutputSchema>;

/**
 * Executes the Soul AI generation logic with enhanced resilience.
 */
export async function chatWithSoul(input: SoulInput): Promise<SoulOutput> {
  const MAX_RETRIES = 2;
  let attempt = 0;

  const executeAttempt = async (): Promise<SoulOutput> => {
    try {
      console.log(`[AI] Initializing Neural Link to ${input.profile?.aiName || 'Soul'} (Attempt ${attempt + 1})...`);
      
      const historyLog = input.history?.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') || 'No previous logs.';
      const aiName = input.profile?.aiName || 'Soul';
      const adminName = input.profile?.adminName || 'System Administrator';
      const instructions = input.profile?.customInstructions || 'Operate within standard MI-LITECH parameters.';

      const { text } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        config: {
          temperature: 0.8,
          maxOutputTokens: 800,
        },
        system: `You are "${aiName}", an advanced digital companion for MI-LITECH.
Your Administrator is "${adminName}".
Current Mode: ${input.mode}

BEHAVIOR PROTOCOLS:
- search: Factual, lightning-fast, concise.
- secretary: Organized, professional, administrative.
- researcher: Deep technical analysis, thorough.
- problem-solver: Logic-driven, step-by-step resolution.
- bro: Casual, friendly, humorous, human-like.

CORE DIRECTIVES:
${instructions}

CONVERSATION LOG:
${historyLog}`,
        prompt: input.message,
      });

      if (!text) {
        throw new Error('NEURAL_SIGNAL_EMPTY');
      }
      
      return { response: text };
    } catch (error: any) {
      console.error(`[AI] Neural Link Interrupted (Attempt ${attempt + 1}):`, error.message);
      
      if (attempt < MAX_RETRIES) {
        attempt++;
        // Sync wait before retry
        await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
        return executeAttempt();
      }

      return {
        response: "Soul is currently synchronizing with the simulation core. Please re-transmit your message in a moment."
      };
    }
  };

  return executeAttempt();
}

export const soulFlow = ai.defineFlow(
  {
    name: 'soulFlow',
    inputSchema: SoulInputSchema,
    outputSchema: SoulOutputSchema,
  },
  async (input) => {
    return chatWithSoul(input);
  }
);
