/**
 * RAG Comparison API Endpoint
 * Compare Basic RAG vs LLM-Enhanced RAG performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { compareRAGApproaches, batchCompareRAG } from '@/app/actions/digital-twin-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, questions } = body;

    // Batch comparison mode
    if (questions && Array.isArray(questions)) {
      const result = await batchCompareRAG(questions);
      return NextResponse.json(result);
    }

    // Single question comparison mode
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question or questions array is required' },
        { status: 400 }
      );
    }

    const result = await compareRAGApproaches(question);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Compare RAG API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to compare RAG approaches',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'RAG Comparison API',
    description: 'Compare Basic RAG vs LLM-Enhanced RAG',
    endpoints: {
      'POST /api/compare-rag': {
        description: 'Compare RAG approaches for a single question',
        body: { question: 'string' },
        returns: 'Comparison results with metrics',
      },
      'POST /api/compare-rag (batch)': {
        description: 'Compare RAG approaches for multiple questions',
        body: { questions: 'string[]' },
        returns: 'Batch comparison with aggregate metrics',
      },
    },
    evaluationCriteria: [
      'Response specificity and detail',
      'Interview relevance and presentation',
      'Use of concrete examples and metrics',
      'Natural flow and confidence building',
      'Processing time and reliability',
    ],
    testQuestions: [
      'What are my key strengths?',
      'Tell me about a challenging project',
      'Why should we hire you?',
      'Describe your leadership experience',
      'What is your Python experience?',
      'Tell me about your FastAPI projects',
    ],
  });
}
