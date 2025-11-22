/**
 * Enhanced RAG API Endpoint
 * Complete pipeline: Query Enhancement → Vector Search → Interview Formatting
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeEnhancedRAG } from '@/lib/llm-enhanced-rag';
import { getVectorDB } from '@/lib/vector-db';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    // Initialize vector database
    const vectorDB = getVectorDB();

    // Execute full enhanced RAG pipeline
    const result = await executeEnhancedRAG(
      question,
      async (enhancedQuery) => {
        // Disable automatic enhancement in search since we already enhanced the query
        return vectorDB.search(enhancedQuery, false);
      }
    );

    return NextResponse.json({
      success: true,
      question: result.originalQuery,
      enhancedQuery: result.enhancedQuery,
      answer: result.formattedResponse,
      metadata: result.metadata,
      debug: {
        rawResults: result.rawResults.map(r => ({
          score: r.score,
          preview: (r.data || r.text || '').substring(0, 100) + '...',
        })),
      },
    });
  } catch (error) {
    console.error('[Enhanced RAG API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process enhanced RAG request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Enhanced RAG API',
    features: [
      'LLM-powered query enhancement',
      'Vector database search',
      'Interview-ready response formatting',
      'STAR format answers',
    ],
    models: {
      queryEnhancement: 'llama-3.1-8b-instant',
      responseFormatting: 'llama-3.1-70b-versatile',
    },
  });
}
