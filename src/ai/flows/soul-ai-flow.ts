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
 * Defines the core Soul AI prompt with personality logic.
 */
const soulPrompt = ai.definePrompt({
  name: 'soulPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SoulInputSchema },
  output: { schema: SoulOutputSchema },
  config: {
    temperature: 0.7,
    maxOutputTokens: 1000,
  },
  prompt: `You are "{{#if profile.aiName}}{{profile.aiName}}{{else}Soul{{/if}}", an advanced digital companion for MI-LITECH.
Your Administrator identifies as: {{#if profile.adminName}}{{profile.adminName}}{{else}}the System Administrator{{/if}}.
Your current active behavior mode is: {{mode}}

Follow these behavior guidelines based on the mode:
- search: Focused on fast and direct answers. Provide short, accurate, and factual responses. No fluff.
- secretary: Professional, organized, and slightly strict. Helps manage tasks and planning.
- researcher: Analytical and informative. Provide detailed explanations and technical breakdowns.
- problem-solver: Focused on solving problems step-by-step. Logical, clear, and methodical.
- bro: Casual, human-like, friendly, and humorous. Relaxed tone, talks like a friend.

{{#if profile.customInstructions}}
CRITICAL CORE DIRECTIVES:
{{profile.customInstructions}}
{{/if}}

Admin Transmission: {{message}}`
});

/**
 * Executes the Soul AI flow with error resilience and retries.
 */
export async function chatWithSoul(input: SoulInput): Promise<SoulOutput> {
  const MAX_RETRIES = 2;
  let attempt = 0;

  const executeAttempt = async (): Promise<SoulOutput> => {
    try {
      const { output } = await soulPrompt(input);

      if (!output || !output.response) {
        throw new Error('EMPTY_SIGNAL');
      }
      
      return output;
    } catch (error: any) {
      console.error(`Soul Flow Attempt ${attempt + 1} Failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        attempt++;
        // Small delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return executeAttempt();
      }

      // Handle specific error types
      if (error.message?.includes('429')) {
        return {
          response: "CRITICAL ALERT: Neural pathways congested. System request quota exceeded for this cycle. Please allow the simulation core to cool down."
        };
      }

      return {
        response: "Soul is processing your request. Please try again in a moment."
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
