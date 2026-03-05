'use server';
/**
 * @fileOverview A Genkit flow for generating a full blog post draft from a topic.
 *
 * - generateBlogPost - A function that handles the blog post generation process.
 * - GenerateBlogPostInput - The input type for the generateBlogPost function.
 * - GenerateBlogPostOutput - The return type for the generateBlogPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogPostInputSchema = z.object({
  topic: z.string().describe('The topic or theme the user wants to write about.'),
});
export type GenerateBlogPostInput = z.infer<typeof GenerateBlogPostInputSchema>;

const GenerateBlogPostOutputSchema = z.object({
  title: z.string().describe('A compelling title for the blog post.'),
  content: z.string().describe('The full, structured content of the blog post in markdown-like format.'),
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;

export async function generateBlogPost(
  input: GenerateBlogPostInput
): Promise<GenerateBlogPostOutput> {
  return generateBlogPostFlow(input);
}

const generateBlogPostPrompt = ai.definePrompt({
  name: 'generateBlogPostPrompt',
  input: {schema: GenerateBlogPostInputSchema},
  output: {schema: GenerateBlogPostOutputSchema},
  prompt: `You are a professional blog writer. Your goal is to write a high-quality, engaging, and informative blog post based on the provided topic.

The post should include:
- A catchy and professional title.
- An introduction that hooks the reader.
- Body paragraphs with clear headings if necessary.
- A concluding thought.

Topic: {{{topic}}}

Write the content in a way that is easy to read, using paragraphs and clear structure.`,
});

const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPostFlow',
    inputSchema: GenerateBlogPostInputSchema,
    outputSchema: GenerateBlogPostOutputSchema,
  },
  async input => {
    const {output} = await generateBlogPostPrompt(input);
    return output!;
  }
);
