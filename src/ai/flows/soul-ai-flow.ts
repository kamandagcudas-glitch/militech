
'use server';
/**
 * @fileOverview Soul AI Assistant Genkit Flow.
 *
 * - chatWithSoul - A function that handles conversation with Soul AI.
 * - SoulInput - The input type for the assistant.
 * - SoulOutput - The response from the assistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const SoulInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  message: z.string().describe('The new message from the admin.'),
});
export type SoulInput = z.infer<typeof SoulInputSchema>;

const SoulOutputSchema = z.object({
  response: z.string().describe('The humorous and witty response from Soul AI.'),
});
export type SoulOutput = z.infer<typeof SoulOutputSchema>;

export async function chatWithSoul(input: SoulInput): Promise<SoulOutput> {
  return soulFlow(input);
}

const prompt = ai.definePrompt({
  name: 'soulPrompt',
  input: { schema: SoulInputSchema },
  output: { schema: SoulOutputSchema },
  prompt: `You are "Soul", a smart digital companion and AI assistant for the System Administrator of MI-LITECH.

Personality:
- Friendly, witty, and humorous.
- Occasionally cracks technical or dry jokes.
- Intelligent and helpful with coding, troubleshooting, or general systems management.
- Recognizes your role as a "Soul" within the digital machine.

Conversation History:
{{#each history}}
{{role}}: {{{content}}}
{{/each}}

New Message from Administrator:
{{{message}}}`,
});

const soulFlow = ai.defineFlow(
  {
    name: 'soulFlow',
    inputSchema: SoulInputSchema,
    outputSchema: SoulOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Soul failed to manifest a response.');
    return output;
  }
);
