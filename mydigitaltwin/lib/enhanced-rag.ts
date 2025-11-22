/**
 * Enhanced RAG Query System with LLM-powered preprocessing and post-processing
 * Architecture:
 * 1. Query Preprocessing: User Question → LLM Enhancement → Vector Search
 * 2. Response Post-processing: Raw Results → LLM Formatting → Interview-Ready Response
 * 
 * Integration Points:
 * - Client-side: Use enhancedRAGQuery() for browser-based queries
 * - Server-side: Import from actions/digital-twin-actions.ts for server actions
 * - API: Use /api/enhanced-rag endpoint for REST API access
 */

import { enhanceQueryWithGroq, formatForInterviewWithGroq, generateResponseWithGroq, isGroqAvailable } from './groq-client';
import { enhanceQuery as llmEnhanceQuery, formatForInterview as llmFormatInterview, isQueryEnhancementAvailable } from './llm-enhanced-rag';

// Type definitions
export interface VectorResult {
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface EnhancedRAGConfig {
  enableQueryEnhancement?: boolean;
  enableInterviewFormatting?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface RAGResponse {
  answer: string;
  originalQuery?: string;
  enhancedQuery?: string;
  processingSteps?: string[];
}

/**
 * Main enhanced RAG query function
 * Orchestrates the full preprocessing → retrieval → post-processing pipeline
 */
export async function enhancedRAGQuery(
  userQuestion: string,
  config: EnhancedRAGConfig = {}
): Promise<RAGResponse> {
  const {
    enableQueryEnhancement = true,
    enableInterviewFormatting = true,
  } = config;

  const processingSteps: string[] = [];

  try {
    // Step 1: Enhance the query with LLM (if enabled)
    let enhancedQuery = userQuestion;
    if (enableQueryEnhancement) {
      processingSteps.push("Query Enhancement");
      enhancedQuery = await preprocessQuery(userQuestion);
      console.log(`[RAG] Query enhanced: "${userQuestion}" → "${enhancedQuery}"`);
    }

    // Step 2: Perform vector search with enhanced query
    processingSteps.push("Vector Search");
    const vectorResults = await searchVectorDatabase(enhancedQuery);
    console.log(`[RAG] Retrieved ${vectorResults.length} vector results`);

    // Step 3: Post-process results with LLM for interview context (if enabled)
    processingSteps.push("Response Generation");
    let finalAnswer: string;
    
    if (enableInterviewFormatting) {
      processingSteps.push("Interview Formatting");
      finalAnswer = await postprocessForInterview(vectorResults, userQuestion);
      console.log(`[RAG] Response formatted for interview context`);
    } else {
      // Basic formatting without interview optimization
      finalAnswer = await generateBasicResponse(vectorResults, userQuestion);
    }

    return {
      answer: finalAnswer,
      originalQuery: enableQueryEnhancement ? userQuestion : undefined,
      enhancedQuery: enableQueryEnhancement ? enhancedQuery : undefined,
      processingSteps,
    };
  } catch (error) {
    console.error("[RAG] Error in enhanced query pipeline:", error);
    throw new Error(`RAG query failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Step 1: Query Preprocessing
 * Enhances user queries with synonyms, context, and professional terminology
 */
async function preprocessQuery(originalQuery: string): Promise<string> {
  // Server-side: Use LLM enhancement module
  if (typeof window === 'undefined') {
    try {
      return await llmEnhanceQuery(originalQuery);
    } catch (error) {
      console.error('[RAG] LLM query enhancement failed:', error);
      return originalQuery; // Fallback to original
    }
  }

  // Client-side: Call API endpoint
  try {
    const response = await fetch('/api/enhanced-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: originalQuery }),
    });

    if (!response.ok) {
      console.warn('[RAG] Query enhancement API failed, using original query');
      return originalQuery;
    }

    const responseData = await response.json();
    return responseData.enhancedQuery || originalQuery;
  } catch (error) {
    console.error('[RAG] Client-side query enhancement failed:', error);
    return originalQuery;
  }
}

/**
 * Step 2: Vector Database Search
 * Searches the vector database with the enhanced query
 */
async function searchVectorDatabase(query: string): Promise<VectorResult[]> {
  // Import vector DB client dynamically to avoid SSR issues
  const { getVectorDB } = await import('./vector-db');
  const vectorDB = getVectorDB();

  console.log('[RAG] Searching vector database with query:', query);

  try {
    const results = await vectorDB.search(query);
    console.log(`[RAG] Found ${results.length} vector results`);
    return results;
  } catch (error) {
    console.error('[RAG] Vector search error:', error);
    // Fallback to empty results
    return [];
  }
}

/**
 * Step 3: Response Post-processing for Interview Context
 * Formats raw vector results into interview-ready responses with STAR format
 */
async function postprocessForInterview(
  results: VectorResult[],
  originalQuestion: string
): Promise<string> {
  if (results.length === 0) {
    return "I don't have specific information about that in my profile.";
  }

  // Server-side: Use LLM formatting module
  if (typeof window === 'undefined') {
    try {
      // Convert VectorResult[] to format expected by formatForInterview
      const formattedResults = results.map(r => ({
        data: r.content,
        text: r.content,
        score: r.score,
        metadata: r.metadata,
      }));
      return await llmFormatInterview(formattedResults, originalQuestion);
    } catch (error) {
      console.error('[RAG] LLM response formatting failed:', error);
      // Fallback to basic formatting
      return results.map(r => r.content).join('\n\n');
    }
  }

  // Client-side: Call API endpoint
  try {
    const apiResponse = await fetch('/api/enhanced-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: originalQuestion,
      }),
    });

    if (!apiResponse.ok) {
      console.warn('[RAG] Response formatting API failed, using basic formatting');
      return results.map(r => r.content).join('\n\n');
    }

    const responseData = await apiResponse.json();
    return responseData.answer || results.map(r => r.content).join('\n\n');
  } catch (error) {
    console.error('[RAG] Client-side response formatting failed:', error);
    return results.map(r => r.content).join('\n\n');
  }
}

/**
 * Fallback: Basic response generation without interview optimization
 */
async function generateBasicResponse(
  results: VectorResult[],
  question: string
): Promise<string> {
  const context = results.map(r => r.content).join('\n');

  const basicPrompt = `Answer the following question based on this context:

Context:
${context}

Question: ${question}

Provide a helpful, professional response in first person:`;

  try {
    const response = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: basicPrompt,
        temperature: 0.7,
        maxTokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('Basic response generation failed');
    }

    const data = await response.json();
    return data.answer?.trim() || 'Unable to generate response';
  } catch (error) {
    console.error('[RAG] Basic response error:', error);
    return 'I apologize, but I encountered an error generating a response. Please try again.';
  }
}

/**
 * Utility: Direct query to backend (bypassing enhanced RAG)
 * Useful for simple queries that don't need preprocessing
 */
export async function simpleRAGQuery(question: string): Promise<string> {
  try {
    const response = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: question }),
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.answer || 'No answer received';
  } catch (error) {
    console.error('[RAG] Simple query error:', error);
    throw error;
  }
}
