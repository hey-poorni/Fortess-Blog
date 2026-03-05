'use server';
/**
 * @fileOverview A Genkit flow for automatically generating a concise summary for a blog post.
 *
 * - autoGenerateBlogSummary - A function that handles the blog summary generation process.
 * - AutoGenerateBlogSummaryInput - The input type for the autoGenerateBlogSummary function.
 * - AutoGenerateBlogSummaryOutput - The return type for the autoGenerateBlogSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoGenerateBlogSummaryInputSchema = z.object({
  title: z.string().describe('The title of the blog post.'),
  content: z.string().describe('The full content of the blog post.'),
});
export type AutoGenerateBlogSummaryInput = z.infer<typeof AutoGenerateBlogSummaryInputSchema>;

const AutoGenerateBlogSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise, engaging summary of the blog post, suitable for a short preview.'),
});
export type AutoGenerateBlogSummaryOutput = z.infer<typeof AutoGenerateBlogSummaryOutputSchema>;

export async function autoGenerateBlogSummary(
  input: AutoGenerateBlogSummaryInput
): Promise<AutoGenerateBlogSummaryOutput> {
  return autoGenerateBlogSummaryFlow(input);
}

const autoGenerateBlogSummaryPrompt = ai.definePrompt({
  name: 'autoGenerateBlogSummaryPrompt',
  input: {schema: AutoGenerateBlogSummaryInputSchema},
  output: {schema: AutoGenerateBlogSummaryOutputSchema},
  prompt: `You are an AI assistant tasked with generating a concise and engaging summary for a blog post.

Read the following blog post title and content, and then provide a summary that is:
- Concise (around 1-3 sentences)
- Captivating and encourages readers to read the full post
- Accurately reflects the main points of the blog post
- Does not repeat the title directly but incorporates its essence.

Blog Post Title: {{{title}}}

Blog Post Content:
{{{content}}}`,
});

const autoGenerateBlogSummaryFlow = ai.defineFlow(
  {
    name: 'autoGenerateBlogSummaryFlow',
    inputSchema: AutoGenerateBlogSummaryInputSchema,
    outputSchema: AutoGenerateBlogSummaryOutputSchema,
  },
  async input => {
    const {output} = await autoGenerateBlogSummaryPrompt(input);
    return output!;
  }
);
