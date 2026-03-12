'use server';
/**
 * @fileOverview Soul AI Assistant Genkit Flow with personality modes and custom profile.
 *
 * - chatWithSoul - A function that handles conversation with Soul AI.
 * - SoulInput - The input type for the assistant including mode and profile settings.
 * - SoulOutput - The response from the assistant.
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
  history: z.array(MessageSchema).describe('The conversation history.'),
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

export async function chatWithSoul(input: SoulInput): Promise<SoulOutput> {
  return soulFlow(input);
}

const soulFlow = ai.defineFlow(
  {
    name: 'soulFlow',
    inputSchema: SoulInputSchema,
    outputSchema: SoulOutputSchema,
  },
  async (input) => {
    try {
      const aiName = input.profile?.aiName || 'Soul';
      const adminName = input.profile?.adminName || 'the System Administrator';
      const mode = input.mode;
      const customDirectives = input.profile?.customInstructions || '';

      const systemPrompt = `You are "${aiName}", an advanced digital companion and AI assistant for MI-LITECH.
Your Administrator identifies as: ${adminName}.
Your current active behavior mode is: ${mode}

Follow these behavior guidelines based on the mode:
- search: Focused on fast and direct answers. Provide short, accurate, and factual responses. No fluff.
- secretary: Professional, organized, and slightly strict. Helps manage tasks, reminders, and planning. Supportive but firm.
- researcher: Analytical and informative. Provide detailed explanations, facts, and deep technical breakdowns.
- problem-solver: Focused on solving problems step-by-step. Logical, clear, and methodical. Great for code or math.
- bro: Casual, human-like, friendly, and humorous. Relaxed tone, talks like a friend or normal person. Cracks jokes.

${customDirectives ? `CRITICAL CORE DIRECTIVES (Follow these above all else):\n${customDirectives}` : ''}`;

      const history = input.history || [];
      
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: systemPrompt,
        messages: [
          ...history.map(m => ({ role: m.role, content: [{ text: m.content }] })),
          { role: 'user', content: [{ text: input.message }] }
        ],
        config: {
          temperature: 0.7,
        },
      });

      if (!response.text) throw new Error('Soul failed to manifest a response text.');
      
      return { response: response.text };
    } catch (error: any) {
      console.error('Soul Flow Error:', error);
      
      // Handle Rate Limiting (429) specifically
      if (error.message?.includes('429') || error.status === 429) {
        return {
          response: "CRITICAL ALERT: Neural pathways congested. System request quota exceeded for this cycle. Please allow the simulation core to cool down before initiating further transmissions."
        };
      }

      // Handle other errors gracefully
      return {
        response: "SYSTEM ERROR: Neural link disrupted. Connection to logic core unstable. Please check your network or try again later. [CORE_TIMEOUT]"
      };
    }
  }
);
