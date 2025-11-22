import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasGroqKey: !!process.env.GROQ_API_KEY,
      hasUpstashUrl: !!process.env.UPSTASH_VECTOR_REST_URL,
      hasUpstashToken: !!process.env.UPSTASH_VECTOR_REST_TOKEN,
    }
  });
}
