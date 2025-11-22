/**
 * RAG Monitoring Dashboard
 * Real-time performance monitoring and optimization recommendations
 */

'use client';

import { useState, useEffect } from 'react';

interface PerformanceStats {
  cache: {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    maxSize: number;
    ttl: number;
  };
  performance: {
    totalQueries: number;
    averages: {
      totalTime: number;
      queryEnhancementTime: number;
      vectorSearchTime: number;
      responseFormattingTime: number;
      tokensUsed: number;
      cacheHitRate: number;
    };
    percentiles: {
      p50: number;
      p95: number;
      p99: number;
    };
    thresholds: {
      maxTotalTime: number;
      maxQueryEnhancementTime: number;
      maxVectorSearchTime: number;
      maxResponseFormattingTime: number;
      maxTokensPerQuery: number;
    };
  };
  timestamp: string;
}

interface HealthMetrics {
  timestamp: string;
  cache: {
    hitRate: number;
    size: number;
    hits: number;
    misses: number;
  };
  performance: {
    totalQueries: number;
    averages: any;
    percentiles: any;
  };
  health: {
    status: string;
    recommendations: string[];
  };
}

export default function MonitoringDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [health, setHealth] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [testQuery, setTestQuery] = useState('Tell me about your React experience');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const [statsRes, healthRes] = await Promise.all([
        fetch('/api/monitored-rag?action=stats'),
        fetch('/api/monitored-rag?action=metrics'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.data);
      }

      if (healthRes.ok) {
        const data = await healthRes.json();
        setHealth(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    fetchStats();
    
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Test query
  const runTestQuery = async () => {
    setTestLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/monitored-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: testQuery }),
      });

      const data = await response.json();
      setTestResult(data);
      
      // Refresh stats after test
      setTimeout(fetchStats, 500);
    } catch (error) {
      console.error('Test query failed:', error);
      setTestResult({ error: 'Failed to execute test query' });
    } finally {
      setTestLoading(false);
    }
  };

  // Clear cache
  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear all caches and metrics?')) {
      return;
    }

    try {
      const response = await fetch('/api/monitored-rag?confirm=true', {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Cache and metrics cleared successfully');
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-lg">Loading monitoring dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RAG Monitoring Dashboard</h1>
              <p className="text-gray-600 mt-2">Real-time performance tracking and optimization</p>
            </div>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Auto-refresh (5s)</span>
              </label>
              <button
                onClick={fetchStats}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Refresh Now
              </button>
              <button
                onClick={clearCache}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>

        {/* Health Status */}
        {health && (
          <div className={`rounded-lg shadow-md p-6 mb-6 ${
            health.health.status === 'healthy' ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${
                health.health.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <h2 className="text-xl font-bold">
                System Status: {health.health.status.toUpperCase()}
              </h2>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Recommendations:</h3>
              {health.health.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span className="text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cache Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Performance</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Hit Rate</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {(stats.cache.hitRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Hits: {stats.cache.hits}</div>
                  <div>Misses: {stats.cache.misses}</div>
                  <div>Size: {stats.cache.size} / {stats.cache.maxSize}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Queries</h3>
              <div className="text-3xl font-bold text-green-600">
                {stats.performance.totalQueries}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Requests processed
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg Response Time</h3>
              <div className="text-3xl font-bold text-purple-600">
                {stats.performance.averages.totalTime || 0}ms
              </div>
              <div className="text-sm text-gray-600 mt-2">
                P95: {stats.performance.percentiles.p95}ms
              </div>
            </div>
          </div>
        )}

        {/* Performance Breakdown */}
        {stats && stats.performance.averages && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'Query Enhancement', value: stats.performance.averages.queryEnhancementTime, max: stats.performance.thresholds.maxQueryEnhancementTime },
                { label: 'Vector Search', value: stats.performance.averages.vectorSearchTime, max: stats.performance.thresholds.maxVectorSearchTime },
                { label: 'Response Formatting', value: stats.performance.averages.responseFormattingTime, max: stats.performance.thresholds.maxResponseFormattingTime },
              ].map((metric, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{metric.label}</span>
                    <span className="font-semibold">{metric.value}ms / {metric.max}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.value > metric.max ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Query */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test RAG Query</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Question
              </label>
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a test question..."
              />
            </div>
            <button
              onClick={runTestQuery}
              disabled={testLoading || !testQuery.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {testLoading ? 'Running...' : 'Run Test Query'}
            </button>

            {testResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                {testResult.success ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Response:</div>
                      <div className="text-gray-900 mt-1">{testResult.data.response}</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Cached</div>
                        <div className="font-semibold">{testResult.data.cached ? 'Yes' : 'No'}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Total Time</div>
                        <div className="font-semibold">{testResult.data.metrics.totalTime}ms</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Tokens</div>
                        <div className="font-semibold">{testResult.data.metrics.tokensUsed}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Interview Type</div>
                        <div className="font-semibold">{testResult.data.interviewType}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600">
                    Error: {testResult.error || 'Unknown error'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Optimization Tips */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Optimization Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🎯 Caching</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Target cache hit rate {'>'} 30%</li>
                <li>• Cache TTL: 1 hour</li>
                <li>• Max cache size: 100 entries</li>
                <li>• LRU eviction policy active</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">⚡ Performance</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Use llama-3.1-8b-instant for queries</li>
                <li>• Use llama-3.1-70b-versatile for formatting</li>
                <li>• Adjust temperature per interview type</li>
                <li>• Enable fallback strategies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🔒 Reliability</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 15-second timeout default</li>
                <li>• Automatic fallback on errors</li>
                <li>• Health monitoring active</li>
                <li>• Performance thresholds enforced</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📊 Monitoring</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Real-time metrics tracking</li>
                <li>• P50/P95/P99 percentiles</li>
                <li>• Token usage monitoring</li>
                <li>• Automated recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
