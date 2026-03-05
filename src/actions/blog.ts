'use server';

/**
 * @fileOverview Server actions for high-level blog operations.
 * Note: Most real-time operations (likes/comments) are handled directly via 
 * Firestore Client SDK for performance. These actions handle AI-heavy tasks.
 */

import { autoGenerateBlogSummary } from '@/ai/flows/auto-generate-blog-summary';

export async function generateSummary(title: string, content: string) {
  try {
    const { summary } = await autoGenerateBlogSummary({ title, content });
    return { summary };
  } catch (error) {
    console.error('Failed to generate summary:', error);
    return { summary: '' };
  }
}
