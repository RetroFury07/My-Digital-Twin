/**
 * LLM-Enhanced RAG with Query Preprocessing
 * Improves vector search accuracy through intelligent query enhancement
 */

import Groq from 'groq-sdk';
import { 
  getAutoConfig, 
  buildQueryEnhancementPrompt, 
  buildResponseFormattingPrompt,
  type RAGConfig 
} from './rag-config';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

/**
 * Enhance user queries with context-aware optimization
 * Auto-detects interview type and applies appropriate enhancement strategy
 * 
 * Example transformations:
 * Technical: "Tell me about my projects" → 
 *   "software development projects, technical achievements, code quality improvements,
 *    architecture decisions, performance optimization, debugging complex issues"
 * 
 * Behavioral: "Describe a challenge" →
 *   "challenging situations, conflict resolution, team dynamics, leadership decisions,
 *    adaptability, problem-solving approach, lessons learned, growth mindset"
 */
export async function enhanceQuery(
  originalQuery: string,
  config?: RAGConfig
): Promise<string> {
  // Auto-detect interview type if config not provided
  const { config: autoConfig, detectedType } = config 
    ? { config, detectedType: 'custom' as const }
    : getAutoConfig(originalQuery);

  const enhancementPrompt = buildQueryEnhancementPrompt(originalQuery, autoConfig);

  console.log(`[LLM Query Enhancement] Detected interview type: ${detectedType}`);

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: enhancementPrompt }],
      model: autoConfig.queryModel,
      temperature: autoConfig.queryTemperature,
      max_tokens: 150,
    });

    const enhanced = completion.choices[0]?.message?.content?.trim();
    
    if (!enhanced) {
      console.warn('[LLM Query Enhancement] Empty response, using original query');
      return originalQuery;
    }

    console.log(`[LLM Query Enhancement] "${originalQuery}" → "${enhanced}"`);
    return enhanced;
  } catch (error) {
    console.error('[LLM Query Enhancement] Failed:', error);
    return originalQuery; // Fallback to original query
  }
}

/**
 * Batch enhance multiple queries (useful for multi-turn conversations)
 */
export async function enhanceQueries(queries: string[]): Promise<string[]> {
  return Promise.all(queries.map(q => enhanceQuery(q)));
}

/**
 * Enhanced query with metadata about the enhancement
 */
export interface EnhancedQuery {
  original: string;
  enhanced: string;
  addedTerms: string[];
  timestamp: Date;
}

/**
 * Enhance query and return detailed metadata
 */
export async function enhanceQueryWithMetadata(originalQuery: string): Promise<EnhancedQuery> {
  const enhanced = await enhanceQuery(originalQuery);
  
  // Extract added terms (simple diff - terms in enhanced but not in original)
  const originalTerms = new Set(originalQuery.toLowerCase().split(/\s+/));
  const enhancedTerms = enhanced.toLowerCase().split(/\s+/);
  const addedTerms = enhancedTerms.filter(term => !originalTerms.has(term));

  return {
    original: originalQuery,
    enhanced,
    addedTerms,
    timestamp: new Date(),
  };
}

/**
 * Format RAG results into interview-ready responses with context-aware optimization
 * Tailors response style to interview type (technical, behavioral, executive, etc.)
 * 
 * Example transformations:
 * 
 * Technical Interview:
 *   Raw: "React experience: 2 years, e-commerce platform, performance optimization"
 *   Formatted: "I have 2 years of production React experience where I architected our
 *              e-commerce platform. I optimized component rendering which reduced page
 *              load times by 40% and improved conversion rate by 15%. The solution involved
 *              implementing memo hooks and lazy loading, handling 50K concurrent users."
 * 
 * Behavioral Interview:
 *   Raw: "Led migration project, faced resistance from team"
 *   Formatted: "I led a critical migration project where I initially faced resistance from
 *              the team. I organized one-on-one sessions to understand concerns, created a
 *              phased rollout plan, and celebrated early wins. This approach turned skeptics
 *              into advocates, and we completed the migration 2 weeks ahead of schedule."
 */
export async function formatForInterview(
  ragResults: any[],
  originalQuestion: string,
  config?: RAGConfig
): Promise<string> {
  const context = ragResults
    .map(result => result.data || result.text || result.content || JSON.stringify(result))
    .join('\n\n');

  if (!context.trim()) {
    return 'I don\'t have specific experience in that area to share.';
  }

  // Auto-detect interview type if config not provided
  const { config: autoConfig, detectedType } = config 
    ? { config, detectedType: 'custom' as const }
    : getAutoConfig(originalQuestion);

  const formattingPrompt = buildResponseFormattingPrompt(
    originalQuestion,
    context,
    autoConfig
  );

  console.log(`[LLM Response Formatting] Using ${detectedType} configuration`);

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: formattingPrompt }],
      model: autoConfig.responseModel,
      temperature: autoConfig.responseTemperature,
      max_tokens: autoConfig.maxTokens,
    });

    const formatted = completion.choices[0]?.message?.content?.trim();
    
    if (!formatted) {
      console.warn('[LLM Response Formatting] Empty response, using raw context');
      return context;
    }

    console.log(`[LLM Response Formatting] Generated ${formatted.length} character ${detectedType} response`);
    return formatted;
  } catch (error) {
    console.error('[LLM Response Formatting] Failed:', error);
    return context; // Fallback to raw RAG results
  }
}

/**
 * Complete RAG pipeline with query enhancement and response formatting
 */
export interface EnhancedRAGResult {
  originalQuery: string;
  enhancedQuery: string;
  rawResults: any[];
  formattedResponse: string;
  metadata: {
    queryEnhanced: boolean;
    responseFormatted: boolean;
    resultCount: number;
    processingTime: number;
  };
}

/**
 * Execute full enhanced RAG pipeline with context-aware optimization
 */
export async function executeEnhancedRAG(
  query: string,
  searchFunction: (enhancedQuery: string) => Promise<any[]>,
  interviewType?: keyof typeof import('./rag-config').RAG_CONFIGS
): Promise<EnhancedRAGResult & { interviewType: string }> {
  const startTime = Date.now();
  
  // Auto-detect interview type
  const { config, detectedType } = interviewType 
    ? { config: (await import('./rag-config')).getRAGConfig(interviewType), detectedType: interviewType }
    : getAutoConfig(query);
  
  // Step 1: Enhance query with context-aware configuration
  let enhancedQuery = query;
  let queryEnhanced = false;
  
  if (isQueryEnhancementAvailable()) {
    try {
      enhancedQuery = await enhanceQuery(query, config);
      queryEnhanced = true;
    } catch (error) {
      console.warn('[Enhanced RAG] Query enhancement failed:', error);
    }
  }

  // Step 2: Search with enhanced query
  const rawResults = await searchFunction(enhancedQuery);

  // Step 3: Format results with context-aware configuration
  let formattedResponse = '';
  let responseFormatted = false;

  if (rawResults.length > 0 && isQueryEnhancementAvailable()) {
    try {
      formattedResponse = await formatForInterview(rawResults, query, config);
      responseFormatted = true;
    } catch (error) {
      console.warn('[Enhanced RAG] Response formatting failed:', error);
      formattedResponse = rawResults.map(r => r.data || r.text || r.content || JSON.stringify(r)).join('\n\n');
    }
  } else {
    formattedResponse = rawResults.length > 0 
      ? rawResults.map(r => r.data || r.text || r.content || JSON.stringify(r)).join('\n\n')
      : 'No relevant information found.';
  }

  const processingTime = Date.now() - startTime;

  return {
    originalQuery: query,
    enhancedQuery,
    rawResults,
    formattedResponse,
    interviewType: detectedType,
    metadata: {
      queryEnhanced,
      responseFormatted,
      resultCount: rawResults.length,
      processingTime,
    },
  };
}

/**
 * Check if query enhancement is available
 */
export function isQueryEnhancementAvailable(): boolean {
  return !!process.env.GROQ_API_KEY;
}
