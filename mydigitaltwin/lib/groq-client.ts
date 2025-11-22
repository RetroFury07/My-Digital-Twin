/**
 * Groq Client Integration for Enhanced RAG
 * High-performance LLM API for query preprocessing and response formatting
 */

import Groq from 'groq-sdk';

// Singleton Groq client instance
let groqClient: Groq | null = null;

/**
 * Get or create Groq client instance
 */
export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured in environment variables');
    }

    groqClient = new Groq({
      apiKey,
    });

    console.log('[Groq] Client initialized');
  }

  return groqClient;
}

/**
 * Groq Model Options
 * Choose based on your use case:
 * - llama-3.1-8b-instant: Fast, good for query enhancement (recommended for preprocessing)
 * - llama-3.1-70b-versatile: Powerful, good for response formatting (recommended for post-processing)
 * - mixtral-8x7b-32768: Balanced performance and large context window
 */
export const GroqModels = {
  FAST: 'llama-3.1-8b-instant',        // Best for query enhancement
  POWERFUL: 'llama-3.1-70b-versatile', // Best for interview formatting
  BALANCED: 'mixtral-8x7b-32768',      // Balanced option
} as const;

export type GroqModel = typeof GroqModels[keyof typeof GroqModels];

/**
 * Query Enhancement using Groq
 * Uses fast model for quick synonym expansion and context enhancement
 */
export async function enhanceQueryWithGroq(
  originalQuery: string,
  model: GroqModel = GroqModels.FAST
): Promise<string> {
  const client = getGroqClient();

  const enhancementPrompt = `You are a query optimization assistant for a professional profile system.

Improve this question to better search professional profile data:

Original Question: ${originalQuery}

Enhanced query should:
- Include relevant synonyms (e.g., "built" → "developed, created, implemented")
- Add professional context (e.g., "Python" → "Python development, Python frameworks")
- Focus on interview-relevant aspects
- Expand acronyms if present

Return ONLY the enhanced query, no explanations:`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: enhancementPrompt,
        },
      ],
      temperature: 0.3, // Low temperature for consistent enhancement
      max_tokens: 150,
    });

    const enhancedQuery = completion.choices[0]?.message?.content?.trim();

    if (!enhancedQuery) {
      console.warn('[Groq] Empty response, using original query');
      return originalQuery;
    }

    console.log(`[Groq] Query enhanced: "${originalQuery}" → "${enhancedQuery}"`);
    return enhancedQuery;
  } catch (error) {
    console.error('[Groq] Enhancement error:', error);
    return originalQuery; // Fallback to original on error
  }
}

/**
 * Interview Response Formatting using Groq
 * Uses powerful model for high-quality STAR format responses
 */
export async function formatForInterviewWithGroq(
  context: string,
  originalQuestion: string,
  model: GroqModel = GroqModels.POWERFUL
): Promise<string> {
  const client = getGroqClient();

  const interviewPrompt = `You are an expert interview coach helping format responses for technical interviews.

Retrieved Context:
${context}

Original Question: ${originalQuestion}

Using the context above, create an interview-ready response that:
- Uses STAR format (Situation, Task, Action, Result) if describing past work
- Includes specific metrics and achievements from the context
- Sounds confident, natural, and conversational
- Is concise but complete (2-4 sentences for simple questions, more for complex)
- Speaks in first person
- Directly addresses the question

Provide ONLY the formatted response:`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant helping format professional interview responses. Always speak in first person and include specific metrics when available.',
        },
        {
          role: 'user',
          content: interviewPrompt,
        },
      ],
      temperature: 0.7, // Balanced temperature for natural responses
      max_tokens: 600,
    });

    const formattedResponse = completion.choices[0]?.message?.content?.trim();

    if (!formattedResponse) {
      console.warn('[Groq] Empty formatting response');
      return 'Unable to format response';
    }

    console.log('[Groq] Response formatted for interview context');
    return formattedResponse;
  } catch (error) {
    console.error('[Groq] Formatting error:', error);
    throw error; // Propagate error for fallback handling
  }
}

/**
 * Generate basic response using Groq
 * Direct question answering without preprocessing/post-processing
 */
export async function generateResponseWithGroq(
  question: string,
  context: string,
  model: GroqModel = GroqModels.BALANCED
): Promise<string> {
  const client = getGroqClient();

  const prompt = `${context}

Question: ${question}

Provide a helpful, professional response in first person:`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an AI digital twin representing a professional software developer. Answer in first person with specific examples.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content?.trim();

    if (!response) {
      throw new Error('Empty response from Groq');
    }

    return response;
  } catch (error) {
    console.error('[Groq] Response generation error:', error);
    throw error;
  }
}

/**
 * Check if Groq is configured and available
 */
export function isGroqAvailable(): boolean {
  try {
    return !!process.env.GROQ_API_KEY;
  } catch {
    return false;
  }
}
