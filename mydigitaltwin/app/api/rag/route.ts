/**
 * Server-side RAG API using Groq
 * This route handles enhanced RAG queries with direct Groq integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { enhanceQueryWithGroq, formatForInterviewWithGroq, generateResponseWithGroq, isGroqAvailable } from '@/lib/groq-client';
import { getVectorDB } from '@/lib/vector-db';

export async function POST(request: NextRequest) {
  try {
    const { query, mode } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Check if Groq is available
    if (!isGroqAvailable()) {
      return NextResponse.json(
        { error: 'Groq API not configured' },
        { status: 500 }
      );
    }

    // Handle different modes
    if (mode === 'enhancement') {
      // Query enhancement only
      const enhanced = await enhanceQueryWithGroq(query);
      return NextResponse.json({ answer: enhanced });
    }

    if (mode === 'formatting') {
      // Interview formatting only (assumes query contains context and question)
      const formatted = await formatForInterviewWithGroq(query, query);
      return NextResponse.json({ answer: formatted });
    }

    // Full enhanced RAG pipeline
    // 1. Enhance query
    const enhancedQuery = await enhanceQueryWithGroq(query);
    console.log(`[RAG API] Enhanced query: ${enhancedQuery}`);

    // 2. Search vector database
    const vectorDB = getVectorDB();
    const results = await vectorDB.search(enhancedQuery);
    console.log(`[RAG API] Found ${results.length} results`);

    // 3. Format for interview
    const context = results
      .map((r, idx) => `[${idx + 1}] ${r.content} (relevance: ${(r.score * 100).toFixed(0)}%)`)
      .join('\n');

    const formattedAnswer = await formatForInterviewWithGroq(context, query);

    return NextResponse.json({
      answer: formattedAnswer,
      originalQuery: query,
      enhancedQuery,
      resultsCount: results.length,
    });

  } catch (error) {
    console.error('[RAG API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Enhanced RAG API with Groq',
    groqAvailable: isGroqAvailable(),
  });
}
