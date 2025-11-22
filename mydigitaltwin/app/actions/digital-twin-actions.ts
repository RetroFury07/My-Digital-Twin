/**
 * Server Actions for Enhanced Digital Twin Query
 * Integrates LLM-powered query enhancement and interview formatting
 */

'use server';

import { enhanceQuery, executeEnhancedRAG, formatForInterview } from '@/lib/llm-enhanced-rag';
import { getVectorDB } from '@/lib/vector-db';

/**
 * Enhanced Digital Twin Query with full LLM pipeline
 * Uses: Query Enhancement → Vector Search → Interview Formatting
 */
export async function enhancedDigitalTwinQuery(question: string) {
  try {
    console.log('[Server Action] Original question:', question);
    
    // Initialize vector database
    const vectorDB = getVectorDB();
    
    // Execute full enhanced RAG pipeline
    const result = await executeEnhancedRAG(
      question,
      async (enhancedQuery: string) => {
        console.log('[Server Action] Enhanced query:', enhancedQuery);
        // Disable automatic enhancement since we already enhanced in executeEnhancedRAG
        return vectorDB.search(enhancedQuery, false);
      }
    );

    console.log('[Server Action] Results:', {
      queryEnhanced: result.metadata.queryEnhanced,
      responseFormatted: result.metadata.responseFormatted,
      resultCount: result.metadata.resultCount,
      processingTime: result.metadata.processingTime,
    });

    return {
      success: true,
      response: result.formattedResponse,
      metadata: {
        originalQuery: result.originalQuery,
        enhancedQuery: result.enhancedQuery,
        resultsFound: result.rawResults.length,
        queryEnhanced: result.metadata.queryEnhanced,
        responseFormatted: result.metadata.responseFormatted,
        processingTime: result.metadata.processingTime,
        interviewType: result.interviewType,
      },
    };
  } catch (error) {
    console.error('[Server Action] Enhanced RAG query failed:', error);
    
    // Fallback to basic RAG if LLM enhancement fails
    return await basicDigitalTwinQuery(question);
  }
}

/**
 * Basic Digital Twin Query (fallback without LLM enhancements)
 * Direct vector search with simple response formatting
 */
export async function basicDigitalTwinQuery(question: string) {
  try {
    console.log('[Server Action] Basic query (fallback):', question);
    
    const vectorDB = getVectorDB();
    
    // Direct search without enhancement
    const results = await vectorDB.search(question, false);
    
    // Simple concatenation of results
    const response = results.length > 0
      ? results.map(r => r.content || JSON.stringify(r)).join('\n\n')
      : 'No relevant information found in your profile.';

    return {
      success: true,
      response,
      metadata: {
        originalQuery: question,
        resultsFound: results.length,
        queryEnhanced: false,
        responseFormatted: false,
        processingTime: 0,
      },
    };
  } catch (error) {
    console.error('[Server Action] Basic query failed:', error);
    return {
      success: false,
      response: 'Sorry, I encountered an error processing your question.',
      metadata: {
        originalQuery: question,
        resultsFound: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Query Enhancement Only (for testing/debugging)
 * Returns enhanced query without performing search
 */
export async function enhanceQueryOnly(question: string) {
  try {
    const enhanced = await enhanceQuery(question);
    return {
      success: true,
      originalQuery: question,
      enhancedQuery: enhanced,
    };
  } catch (error) {
    console.error('[Server Action] Query enhancement failed:', error);
    return {
      success: false,
      originalQuery: question,
      enhancedQuery: question, // Fallback to original
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Interview Formatting Only (for testing/debugging)
 * Formats provided data without performing search
 */
export async function formatResponseOnly(data: any[], question: string) {
  try {
    const formatted = await formatForInterview(data, question);
    return {
      success: true,
      question,
      formattedResponse: formatted,
    };
  } catch (error) {
    console.error('[Server Action] Response formatting failed:', error);
    return {
      success: false,
      question,
      formattedResponse: data.map(d => JSON.stringify(d)).join('\n\n'),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch Query Enhancement
 * Enhance multiple questions at once (useful for preparation)
 */
export async function batchEnhanceQueries(questions: string[]) {
  try {
    const enhancements = await Promise.all(
      questions.map(async (q) => {
        try {
          const enhanced = await enhanceQuery(q);
          return { original: q, enhanced, success: true };
        } catch (error) {
          return { 
            original: q, 
            enhanced: q, 
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return {
      success: true,
      results: enhancements,
    };
  } catch (error) {
    console.error('[Server Action] Batch enhancement failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Compare Basic RAG vs LLM-Enhanced RAG
 * Measures improvements in response quality and processing time
 */
export async function compareRAGApproaches(question: string) {
  try {
    const startTime = Date.now();
    
    // Test both approaches in parallel
    const [basicResult, enhancedResult] = await Promise.all([
      basicDigitalTwinQuery(question),
      enhancedDigitalTwinQuery(question)
    ]);
    
    const endTime = Date.now();
    
    return {
      success: true,
      question,
      results: {
        basic: {
          response: basicResult.response,
          resultsFound: basicResult.metadata?.resultsFound || 0,
          processingTime: (basicResult.metadata as any)?.processingTime || 0,
          queryEnhanced: false,
          responseFormatted: false,
        },
        enhanced: {
          response: enhancedResult.response,
          resultsFound: enhancedResult.metadata?.resultsFound || 0,
          processingTime: (enhancedResult.metadata as any)?.processingTime || 0,
          enhancedQuery: (enhancedResult.metadata as any)?.enhancedQuery || question,
          queryEnhanced: enhancedResult.metadata?.queryEnhanced || false,
          responseFormatted: enhancedResult.metadata?.responseFormatted || false,
        }
      },
      metrics: {
        totalComparisonTime: endTime - startTime,
        basicLength: basicResult.response.length,
        enhancedLength: enhancedResult.response.length,
        improvementRatio: enhancedResult.response.length / Math.max(basicResult.response.length, 1),
      },
    };
  } catch (error) {
    console.error('[Server Action] RAG comparison failed:', error);
    return {
      success: false,
      question,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch Compare Multiple Questions
 * Useful for evaluating overall system improvements
 */
export async function batchCompareRAG(questions: string[]) {
  try {
    const comparisons = await Promise.all(
      questions.map(q => compareRAGApproaches(q))
    );

    // Calculate aggregate metrics
    const successfulComparisons = comparisons.filter(c => c.success);
    const totalBasicTime = successfulComparisons.reduce(
      (sum, c) => sum + (typeof c.results?.basic.processingTime === 'number' ? c.results.basic.processingTime : 0), 
      0
    );
    const totalEnhancedTime = successfulComparisons.reduce(
      (sum, c) => sum + (typeof c.results?.enhanced.processingTime === 'number' ? c.results.enhanced.processingTime : 0), 
      0
    );

    return {
      success: true,
      totalQuestions: questions.length,
      successfulComparisons: successfulComparisons.length,
      comparisons,
      aggregateMetrics: {
        averageBasicTime: totalBasicTime / successfulComparisons.length,
        averageEnhancedTime: totalEnhancedTime / successfulComparisons.length,
        averageImprovementRatio: successfulComparisons.reduce(
          (sum, c) => sum + (c.metrics?.improvementRatio || 0), 
          0
        ) / successfulComparisons.length,
      },
    };
  } catch (error) {
    console.error('[Server Action] Batch RAG comparison failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
