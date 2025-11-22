import { NextRequest, NextResponse } from 'next/server';
import { monitoredRAGQuery } from '@/lib/rag-monitoring';

// MCP Server endpoint for Digital Twin
// Now uses the enhanced RAG pipeline with monitoring and caching
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract question from either 'query' or 'question' field
    const question = body.query || body.question;
    
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('[MCP] Processing question:', question.substring(0, 50) + '...');
    
    // Use the monitored RAG query with full pipeline
    const result = await monitoredRAGQuery(question, undefined, {
      useCache: true,
      timeout: 15000,
      fallbackToBasic: true,
    });
    
    console.log('[MCP] Response generated:', {
      cached: result.cached,
      totalTime: result.metrics.totalTime,
      interviewType: result.metrics.interviewType,
    });
    
    // Return response in MCP format
    return NextResponse.json({
      response: result.response,
      answer: result.response, // Backwards compatibility
      cached: result.cached,
      metrics: {
        totalTime: result.metrics.totalTime,
        cached: result.cached,
        interviewType: result.metrics.interviewType,
      },
    });
  } catch (error) {
    console.error('[MCP] Endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process MCP request',
        details: error instanceof Error ? error.message : 'Unknown error',
        response: 'I apologize, but I encountered an error processing your question. Please try again.',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    service: 'Digital Twin MCP Server',
    timestamp: new Date().toISOString()
  });
}
