import { NextRequest, NextResponse } from 'next/server';
import { monitoredRAGQuery } from '@/lib/rag-monitoring';

// MCP Server endpoint for Digital Twin
// Now uses the enhanced RAG pipeline with monitoring and caching
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[MCP] Received request body:', JSON.stringify(body));
    
    // Extract question from either 'query' or 'question' field
    const question = body.query || body.question;
    
    if (!question || typeof question !== 'string') {
      console.error('[MCP] Invalid question:', { question, body });
      return NextResponse.json(
        { error: 'Question is required and must be a string', received: body },
        { status: 400 }
      );
    }

    console.log('[MCP] Processing question:', question.substring(0, 50) + '...');
    
    // Use the monitored RAG query with full pipeline
    let result;
    try {
      result = await monitoredRAGQuery(question, undefined, {
        useCache: true,
        timeout: 15000,
        fallbackToBasic: true,
      });
    } catch (ragError) {
      console.error('[MCP] RAG query failed completely:', ragError);
      return NextResponse.json({
        response: 'I apologize, but I encountered an error processing your question. Please try again.',
        answer: 'I apologize, but I encountered an error processing your question. Please try again.',
        error: ragError instanceof Error ? ragError.message : 'Unknown error',
      }, { status: 200 }); // Return 200 with error message instead of 500
    }
    
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
