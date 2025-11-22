'use client';

/**
 * Enhanced Digital Twin Chat Interface
 * Integrates with Enhanced RAG System (query preprocessing + interview formatting)
 */

import { useState, useRef, useEffect } from 'react';
import { enhancedRAGQuery, simpleRAGQuery, RAGResponse } from '@/lib/enhanced-rag';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  enhancedQuery?: string;
  processingSteps?: string[];
}

export default function EnhancedChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useEnhancedRAG, setUseEnhancedRAG] = useState(true);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let assistantMessage: Message;

      if (useEnhancedRAG) {
        // Use enhanced RAG with preprocessing and post-processing
        const response: RAGResponse = await enhancedRAGQuery(userMessage.content, {
          enableQueryEnhancement: true,
          enableInterviewFormatting: true,
        });

        assistantMessage = {
          role: 'assistant',
          content: response.answer,
          timestamp: new Date(),
          enhancedQuery: response.enhancedQuery,
          processingSteps: response.processingSteps,
        };
      } else {
        // Use simple query (no enhancements)
        const answer = await simpleRAGQuery(userMessage.content);

        assistantMessage = {
          role: 'assistant',
          content: answer,
          timestamp: new Date(),
        };
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Query failed:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your question. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Digital Twin Assistant</h1>
            <p className="text-sm text-gray-500">
              {useEnhancedRAG ? '🚀 Enhanced RAG Mode' : '⚡ Simple Mode'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              {showDebugInfo ? '🔍 Hide Debug' : '🔍 Show Debug'}
            </button>
            
            <button
              onClick={() => setUseEnhancedRAG(!useEnhancedRAG)}
              className={`px-3 py-2 text-sm rounded-lg transition ${
                useEnhancedRAG
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {useEnhancedRAG ? 'Enhanced RAG' : 'Simple Mode'}
            </button>
            
            <button
              onClick={clearChat}
              className="px-3 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Welcome to Your Digital Twin! 👋
              </h2>
              <p className="text-gray-500 mb-4">
                Ask me anything about my professional experience, skills, or projects.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <button
                  onClick={() => setInput("Tell me about your Python experience")}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <span className="text-sm font-medium text-gray-700">
                    💻 Tell me about your Python experience
                  </span>
                </button>
                <button
                  onClick={() => setInput("What projects have you built?")}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <span className="text-sm font-medium text-gray-700">
                    🚀 What projects have you built?
                  </span>
                </button>
                <button
                  onClick={() => setInput("Describe your FastAPI expertise")}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <span className="text-sm font-medium text-gray-700">
                    ⚡ Describe your FastAPI expertise
                  </span>
                </button>
                <button
                  onClick={() => setInput("How did you improve deployment times?")}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <span className="text-sm font-medium text-gray-700">
                    📈 How did you improve deployment times?
                  </span>
                </button>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Debug Information */}
              {showDebugInfo && message.role === 'assistant' && (message.enhancedQuery || message.processingSteps) && (
                <div className="mt-2 ml-12 p-3 bg-gray-100 rounded-lg text-xs">
                  {message.enhancedQuery && (
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700">Enhanced Query:</span>
                      <p className="text-gray-600 mt-1">{message.enhancedQuery}</p>
                    </div>
                  )}
                  {message.processingSteps && (
                    <div>
                      <span className="font-semibold text-gray-700">Processing Steps:</span>
                      <ul className="list-disc list-inside text-gray-600 mt-1">
                        {message.processingSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">
                    {useEnhancedRAG ? 'Processing with enhanced RAG...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about my experience, skills, or projects..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? 'Processing...' : 'Send'}
            </button>
          </div>
          
          {useEnhancedRAG && (
            <p className="text-xs text-gray-500 mt-2">
              ✨ Enhanced RAG is active: Query preprocessing + Interview formatting enabled
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
