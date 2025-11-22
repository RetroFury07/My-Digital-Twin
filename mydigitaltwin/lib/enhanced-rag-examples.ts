/**
 * Example Usage of Enhanced RAG System
 * Demonstrates how to integrate the enhanced RAG architecture in your Next.js app
 */

import { enhancedRAGQuery, simpleRAGQuery, RAGResponse } from './enhanced-rag';

/**
 * Example 1: Full Enhanced RAG Query with all features
 */
export async function exampleFullEnhancedQuery() {
  const userQuestion = "Tell me about your Python experience";

  const response: RAGResponse = await enhancedRAGQuery(userQuestion, {
    enableQueryEnhancement: true,
    enableInterviewFormatting: true,
    temperature: 0.7,
    maxTokens: 600,
  });

  console.log('Original Query:', response.originalQuery);
  console.log('Enhanced Query:', response.enhancedQuery);
  console.log('Processing Steps:', response.processingSteps);
  console.log('Final Answer:', response.answer);

  return response;
}

/**
 * Example 2: Query Enhancement Only (skip interview formatting)
 */
export async function exampleQueryEnhancementOnly() {
  const response = await enhancedRAGQuery("What frameworks do you know?", {
    enableQueryEnhancement: true,
    enableInterviewFormatting: false,
  });

  return response.answer;
}

/**
 * Example 3: Interview Formatting Only (skip query enhancement)
 */
export async function exampleInterviewFormattingOnly() {
  const response = await enhancedRAGQuery("Describe a challenging project", {
    enableQueryEnhancement: false,
    enableInterviewFormatting: true,
  });

  return response.answer;
}

/**
 * Example 4: Simple Query (bypass all enhancements)
 */
export async function exampleSimpleQuery() {
  const answer = await simpleRAGQuery("What is your name?");
  return answer;
}

/**
 * Example 5: Using in a React Component
 * NOTE: This is pseudo-code for demonstration.
 * For actual React component, create a .tsx file like:
 * app/chat/page.tsx or components/ChatComponent.tsx
 */
export function chatComponentExample() {
  return `
    'use client';
    import { useState } from 'react';
    import { enhancedRAGQuery, RAGResponse } from '@/lib/enhanced-rag';

    export default function ChatComponent() {
      const [message, setMessage] = useState('');
      const [response, setResponse] = useState<RAGResponse | null>(null);
      const [loading, setLoading] = useState(false);

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
          const result = await enhancedRAGQuery(message, {
            enableQueryEnhancement: true,
            enableInterviewFormatting: true,
          });
          setResponse(result);
        } catch (error) {
          console.error('Query failed:', error);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div>
          <form onSubmit={handleSubmit}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Send'}
            </button>
          </form>

          {response && (
            <div>
              <p><strong>Answer:</strong> {response.answer}</p>
              {response.enhancedQuery && (
                <details>
                  <summary>Query Enhancement</summary>
                  <p>Original: {response.originalQuery}</p>
                  <p>Enhanced: {response.enhancedQuery}</p>
                </details>
              )}
            </div>
          )}
        </div>
      );
    }
  `;
}

/**
 * Example 6: Batch Processing Multiple Questions
 */
export async function exampleBatchProcessing() {
  const questions = [
    "What programming languages do you know?",
    "Describe your FastAPI experience",
    "What's your biggest achievement?",
  ];

  const results = await Promise.all(
    questions.map(q => enhancedRAGQuery(q, {
      enableQueryEnhancement: true,
      enableInterviewFormatting: true,
    }))
  );

  return results;
}

/**
 * Example 7: Error Handling
 */
export async function exampleWithErrorHandling(userQuestion: string) {
  try {
    const response = await enhancedRAGQuery(userQuestion);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('RAG query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: 'I apologize, but I encountered an error. Please try rephrasing your question.',
    };
  }
}
