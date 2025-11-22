import { NextRequest, NextResponse } from 'next/server';

// MCP Server endpoint for Digital Twin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In production (Vercel), use the Python serverless function
    // In development, use local backend
    const isProduction = process.env.VERCEL === '1';
    const apiUrl = isProduction 
      ? `${request.nextUrl.origin}/api/rag`  // Vercel serverless function (full URL)
      : `${process.env.DIGITAL_TWIN_BACKEND_URL || 'http://localhost:8000'}/rag`;
    
    console.log('Forwarding request to:', apiUrl);
    
    // Transform 'query' to 'question' for backend compatibility
    const backendPayload = {
      question: body.query || body.question
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      throw new Error(`Backend responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Transform backend 'answer' to frontend 'response'
    return NextResponse.json({
      response: data.answer || data.response,
      answer: data.answer
    });
  } catch (error) {
    console.error('MCP endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process MCP request',
        details: error instanceof Error ? error.message : 'Unknown error'
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
