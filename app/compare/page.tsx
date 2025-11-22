'use client';

/**
 * RAG Comparison Interface
 * Side-by-side comparison of Basic RAG vs LLM-Enhanced RAG
 */

import { useState } from 'react';

interface ComparisonResult {
  question: string;
  results: {
    basic: {
      response: string;
      resultsFound: number;
      processingTime: number | string;
      queryEnhanced: boolean;
      responseFormatted: boolean;
    };
    enhanced: {
      response: string;
      resultsFound: number;
      processingTime: number | string;
      enhancedQuery: string;
      queryEnhanced: boolean;
      responseFormatted: boolean;
    };
  };
  metrics: {
    totalComparisonTime: number;
    basicLength: number;
    enhancedLength: number;
    improvementRatio: number;
  };
}

export default function ComparePage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  const suggestedQuestions = [
    'What are my key strengths?',
    'Tell me about a challenging project',
    'Why should we hire you?',
    'Describe your leadership experience',
    'What is your Python experience?',
    'Tell me about your FastAPI projects',
  ];

  const handleCompare = async () => {
    if (!question.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/compare-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      
      if (data.success) {
        setComparison(data);
      } else {
        console.error('Comparison failed:', data.error);
      }
    } catch (error) {
      console.error('Comparison error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            RAG Comparison Tool
          </h1>
          <p className="text-gray-600">
            Compare Basic RAG vs LLM-Enhanced RAG to measure improvements
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Question
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
              placeholder="Enter a question to compare..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleCompare}
              disabled={!question.trim() || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Comparing...' : 'Compare'}
            </button>
          </div>

          {/* Suggested Questions */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(q)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {comparison && (
          <div className="space-y-6">
            {/* Metrics Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Metrics</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Comparison Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {comparison.metrics.totalComparisonTime}ms
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Basic Length</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {comparison.metrics.basicLength}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Enhanced Length</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {comparison.metrics.enhancedLength}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Improvement</p>
                  <p className={`text-2xl font-bold ${
                    comparison.metrics.improvementRatio > 1 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {comparison.metrics.improvementRatio.toFixed(2)}x
                  </p>
                </div>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-2 gap-6">
              {/* Basic RAG */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Basic RAG</h2>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Results: {comparison.results.basic.resultsFound}</span>
                    <span>Time: {comparison.results.basic.processingTime}ms</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      comparison.results.basic.queryEnhanced 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {comparison.results.basic.queryEnhanced ? '✓' : '✗'} Query Enhanced
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      comparison.results.basic.responseFormatted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {comparison.results.basic.responseFormatted ? '✓' : '✗'} STAR Format
                    </span>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {comparison.results.basic.response}
                  </p>
                </div>
              </div>

              {/* Enhanced RAG */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-blue-200">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    LLM-Enhanced RAG
                  </h2>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Results: {comparison.results.enhanced.resultsFound}</span>
                    <span>Time: {comparison.results.enhanced.processingTime}ms</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      comparison.results.enhanced.queryEnhanced 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {comparison.results.enhanced.queryEnhanced ? '✓' : '✗'} Query Enhanced
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      comparison.results.enhanced.responseFormatted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {comparison.results.enhanced.responseFormatted ? '✓' : '✗'} STAR Format
                    </span>
                  </div>
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <p className="text-gray-600 font-medium">Enhanced Query:</p>
                    <p className="text-gray-700">{comparison.results.enhanced.enhancedQuery}</p>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {comparison.results.enhanced.response}
                  </p>
                </div>
              </div>
            </div>

            {/* Evaluation Criteria */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Evaluation Criteria
              </h2>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Response specificity and detail</li>
                <li>✓ Interview relevance and presentation</li>
                <li>✓ Use of concrete examples and metrics</li>
                <li>✓ Natural flow and confidence building</li>
                <li>✓ Processing time and reliability</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
