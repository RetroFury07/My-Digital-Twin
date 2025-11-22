/**
 * Production Monitoring for Enhanced RAG System
 * Tracks performance metrics, implements caching, and optimizes for production use
 */

import { enhanceQuery, formatForInterview, isQueryEnhancementAvailable } from './llm-enhanced-rag';
import { VectorDBClient, type VectorDBConfig } from './vector-db';
import { type RAGConfig } from './rag-config';

// Initialize vector database client
const vectorDB = new VectorDBClient({
  provider: process.env.VECTOR_DB_PROVIDER as 'upstash' | 'pinecone' | 'mock' || 'mock',
  apiKey: process.env.UPSTASH_VECTOR_TOKEN,
  indexUrl: process.env.UPSTASH_VECTOR_URL,
  topK: 5,
});

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface RAGMetrics {
  queryEnhancementTime: number;
  vectorSearchTime: number;
  responseFormattingTime: number;
  totalTime: number;
  tokensUsed: number;
  cacheHitRate: number;
  interviewType?: string;
  modelUsed?: string;
  resultCount?: number;
}

export interface MonitoredRAGResult {
  response: string;
  metrics: RAGMetrics;
  cached: boolean;
  timestamp: Date;
}

export interface CacheEntry {
  response: string;
  metrics: RAGMetrics;
  timestamp: Date;
  hitCount: number;
}

export interface PerformanceThresholds {
  maxTotalTime: number; // milliseconds
  maxQueryEnhancementTime: number;
  maxVectorSearchTime: number;
  maxResponseFormattingTime: number;
  maxTokensPerQuery: number;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  maxTotalTime: 10000, // 10 seconds
  maxQueryEnhancementTime: 2000, // 2 seconds
  maxVectorSearchTime: 3000, // 3 seconds
  maxResponseFormattingTime: 5000, // 5 seconds
  maxTokensPerQuery: 2000,
};

const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const CACHE_MAX_SIZE = 100;

// ============================================================================
// In-Memory Cache (Simple LRU-like implementation)
// ============================================================================

class RAGCache {
  private cache: Map<string, CacheEntry> = new Map();
  private accessOrder: string[] = [];
  private hits = 0;
  private misses = 0;

  private generateKey(question: string, config?: RAGConfig): string {
    const configKey = config ? JSON.stringify(config) : 'default';
    return `${question.toLowerCase().trim()}:${configKey}`;
  }

  get(question: string, config?: RAGConfig): CacheEntry | null {
    const key = this.generateKey(question, config);
    const entry = this.cache.get(key);

    if (entry) {
      // Check if cache entry is still valid
      if (Date.now() - entry.timestamp.getTime() < CACHE_TTL) {
        this.hits++;
        entry.hitCount++;
        
        // Update access order (move to end)
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
          this.accessOrder.splice(index, 1);
        }
        this.accessOrder.push(key);
        
        console.log(`[Cache HIT] Question: "${question.substring(0, 50)}..." (Hit count: ${entry.hitCount})`);
        return entry;
      } else {
        // Expired entry
        this.cache.delete(key);
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
          this.accessOrder.splice(index, 1);
        }
      }
    }

    this.misses++;
    console.log(`[Cache MISS] Question: "${question.substring(0, 50)}..."`);
    return null;
  }

  set(question: string, response: string, metrics: RAGMetrics, config?: RAGConfig): void {
    const key = this.generateKey(question, config);

    // Evict oldest entry if cache is full
    if (this.cache.size >= CACHE_MAX_SIZE && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
        console.log(`[Cache EVICT] Removed oldest entry`);
      }
    }

    const entry: CacheEntry = {
      response,
      metrics,
      timestamp: new Date(),
      hitCount: 0,
    };

    this.cache.set(key, entry);
    
    // Update access order
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);

    console.log(`[Cache SET] Cached response for: "${question.substring(0, 50)}..."`);
  }

  getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.hits = 0;
    this.misses = 0;
    console.log('[Cache CLEAR] Cache cleared');
  }

  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
      maxSize: CACHE_MAX_SIZE,
      ttl: CACHE_TTL,
    };
  }
}

// Global cache instance
const ragCache = new RAGCache();

// ============================================================================
// Performance Monitoring
// ============================================================================

class PerformanceMonitor {
  private metrics: RAGMetrics[] = [];
  private maxMetricsHistory = 1000;

  recordMetrics(metrics: RAGMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // Check against thresholds
    this.checkThresholds(metrics);
  }

  private checkThresholds(metrics: RAGMetrics): void {
    const warnings: string[] = [];

    if (metrics.totalTime > DEFAULT_THRESHOLDS.maxTotalTime) {
      warnings.push(`Total time (${metrics.totalTime}ms) exceeded threshold (${DEFAULT_THRESHOLDS.maxTotalTime}ms)`);
    }

    if (metrics.queryEnhancementTime > DEFAULT_THRESHOLDS.maxQueryEnhancementTime) {
      warnings.push(`Query enhancement time (${metrics.queryEnhancementTime}ms) exceeded threshold`);
    }

    if (metrics.vectorSearchTime > DEFAULT_THRESHOLDS.maxVectorSearchTime) {
      warnings.push(`Vector search time (${metrics.vectorSearchTime}ms) exceeded threshold`);
    }

    if (metrics.responseFormattingTime > DEFAULT_THRESHOLDS.maxResponseFormattingTime) {
      warnings.push(`Response formatting time (${metrics.responseFormattingTime}ms) exceeded threshold`);
    }

    if (metrics.tokensUsed > DEFAULT_THRESHOLDS.maxTokensPerQuery) {
      warnings.push(`Token usage (${metrics.tokensUsed}) exceeded threshold`);
    }

    if (warnings.length > 0) {
      console.warn('[Performance Warning]', warnings.join('; '));
    }
  }

  getAverageMetrics(): Partial<RAGMetrics> {
    if (this.metrics.length === 0) return {};

    const sum = this.metrics.reduce(
      (acc, m) => ({
        totalTime: acc.totalTime + m.totalTime,
        queryEnhancementTime: acc.queryEnhancementTime + m.queryEnhancementTime,
        vectorSearchTime: acc.vectorSearchTime + m.vectorSearchTime,
        responseFormattingTime: acc.responseFormattingTime + m.responseFormattingTime,
        tokensUsed: acc.tokensUsed + m.tokensUsed,
        cacheHitRate: acc.cacheHitRate + m.cacheHitRate,
      }),
      {
        totalTime: 0,
        queryEnhancementTime: 0,
        vectorSearchTime: 0,
        responseFormattingTime: 0,
        tokensUsed: 0,
        cacheHitRate: 0,
      }
    );

    const count = this.metrics.length;
    return {
      totalTime: Math.round(sum.totalTime / count),
      queryEnhancementTime: Math.round(sum.queryEnhancementTime / count),
      vectorSearchTime: Math.round(sum.vectorSearchTime / count),
      responseFormattingTime: Math.round(sum.responseFormattingTime / count),
      tokensUsed: Math.round(sum.tokensUsed / count),
      cacheHitRate: sum.cacheHitRate / count,
    };
  }

  getPercentiles(): {
    p50: number;
    p95: number;
    p99: number;
  } {
    if (this.metrics.length === 0) {
      return { p50: 0, p95: 0, p99: 0 };
    }

    const sortedTimes = this.metrics.map(m => m.totalTime).sort((a, b) => a - b);
    
    const getPercentile = (p: number) => {
      const index = Math.ceil((p / 100) * sortedTimes.length) - 1;
      return sortedTimes[Math.max(0, index)];
    };

    return {
      p50: getPercentile(50),
      p95: getPercentile(95),
      p99: getPercentile(99),
    };
  }

  getStats() {
    return {
      totalQueries: this.metrics.length,
      averages: this.getAverageMetrics(),
      percentiles: this.getPercentiles(),
      thresholds: DEFAULT_THRESHOLDS,
    };
  }

  clearHistory(): void {
    this.metrics = [];
    console.log('[Performance Monitor] Metrics history cleared');
  }
}

// Global performance monitor
const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// Monitored RAG Query (Main Function)
// ============================================================================

export async function monitoredRAGQuery(
  question: string,
  config?: RAGConfig,
  options: {
    useCache?: boolean;
    timeout?: number;
    fallbackToBasic?: boolean;
  } = {}
): Promise<MonitoredRAGResult> {
  const {
    useCache = true,
    timeout = 15000,
    fallbackToBasic = true,
  } = options;

  // Check cache first
  if (useCache) {
    const cached = ragCache.get(question, config);
    if (cached) {
      return {
        response: cached.response,
        metrics: {
          ...cached.metrics,
          cacheHitRate: ragCache.getHitRate(),
        },
        cached: true,
        timestamp: cached.timestamp,
      };
    }
  }

  const startTime = Date.now();
  const metrics: Partial<RAGMetrics> = {
    cacheHitRate: ragCache.getHitRate(),
  };

  try {
    // Implement timeout wrapper
    const executeWithTimeout = async () => {
      // Step 1: Query Enhancement
      let enhancedQuery = question;
      let interviewType = 'unknown';
      
      if (isQueryEnhancementAvailable()) {
        const enhanceStart = Date.now();
        try {
          enhancedQuery = await enhanceQuery(question, config);
          metrics.queryEnhancementTime = Date.now() - enhanceStart;
        } catch (error) {
          console.warn('[Monitoring] Query enhancement failed:', error);
          metrics.queryEnhancementTime = Date.now() - enhanceStart;
          if (!fallbackToBasic) throw error;
        }
      } else {
        metrics.queryEnhancementTime = 0;
      }

      // Step 2: Vector Search
      const searchStart = Date.now();
      let vectorResults: any[] = [];
      try {
        vectorResults = await vectorDB.search(enhancedQuery, false); // Don't double-enhance
        metrics.vectorSearchTime = Date.now() - searchStart;
        metrics.resultCount = vectorResults.length;
      } catch (error) {
        console.error('[Monitoring] Vector search failed:', error);
        metrics.vectorSearchTime = Date.now() - searchStart;
        metrics.resultCount = 0;
        if (!fallbackToBasic) throw error;
      }

      // Step 3: Response Formatting
      let formattedResponse = '';
      const formatStart = Date.now();
      
      if (vectorResults.length > 0 && isQueryEnhancementAvailable()) {
        try {
          formattedResponse = await formatForInterview(vectorResults, question, config);
          metrics.responseFormattingTime = Date.now() - formatStart;
        } catch (error) {
          console.warn('[Monitoring] Response formatting failed:', error);
          metrics.responseFormattingTime = Date.now() - formatStart;
          
          if (fallbackToBasic) {
            formattedResponse = vectorResults
              .map(r => r.data || r.text || r.content || JSON.stringify(r))
              .join('\n\n');
          } else {
            throw error;
          }
        }
      } else {
        metrics.responseFormattingTime = 0;
        formattedResponse = vectorResults.length > 0
          ? vectorResults.map(r => r.data || r.text || r.content || JSON.stringify(r)).join('\n\n')
          : 'No relevant information found.';
      }

      return { formattedResponse, interviewType };
    };

    // Execute with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('RAG query timeout')), timeout);
    });

    const result = await Promise.race([
      executeWithTimeout(),
      timeoutPromise,
    ]);

    metrics.totalTime = Date.now() - startTime;
    
    // Estimate token usage (rough approximation: 1 token ≈ 4 characters)
    metrics.tokensUsed = Math.ceil(
      (question.length + result.formattedResponse.length) / 4
    );

    const finalMetrics = metrics as RAGMetrics;

    // Record metrics
    performanceMonitor.recordMetrics(finalMetrics);

    // Cache the result
    if (useCache) {
      ragCache.set(question, result.formattedResponse, finalMetrics, config);
    }

    // Log performance summary
    console.log('[RAG Performance]', {
      totalTime: `${finalMetrics.totalTime}ms`,
      breakdown: {
        enhancement: `${finalMetrics.queryEnhancementTime}ms`,
        search: `${finalMetrics.vectorSearchTime}ms`,
        formatting: `${finalMetrics.responseFormattingTime}ms`,
      },
      tokens: finalMetrics.tokensUsed,
      cached: false,
      results: metrics.resultCount,
    });

    return {
      response: result.formattedResponse,
      metrics: finalMetrics,
      cached: false,
      timestamp: new Date(),
    };

  } catch (error) {
    metrics.totalTime = Date.now() - startTime;
    console.error('[Monitoring] RAG query failed:', error);
    
    // Return error response with metrics
    const errorMetrics = metrics as RAGMetrics;
    performanceMonitor.recordMetrics(errorMetrics);

    return {
      response: 'I apologize, but I encountered an error processing your question. Please try again.',
      metrics: errorMetrics,
      cached: false,
      timestamp: new Date(),
    };
  }
}

// ============================================================================
// Batch Processing with Progress Tracking
// ============================================================================

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  estimatedTimeRemaining: number;
}

export async function monitoredBatchRAGQuery(
  questions: string[],
  config?: RAGConfig,
  onProgress?: (progress: BatchProgress) => void
): Promise<MonitoredRAGResult[]> {
  const results: MonitoredRAGResult[] = [];
  const startTime = Date.now();
  let completed = 0;
  let failed = 0;

  for (const question of questions) {
    try {
      const result = await monitoredRAGQuery(question, config);
      results.push(result);
      completed++;
    } catch (error) {
      console.error(`[Batch] Failed to process question: "${question}"`, error);
      failed++;
      results.push({
        response: 'Error processing question',
        metrics: {
          queryEnhancementTime: 0,
          vectorSearchTime: 0,
          responseFormattingTime: 0,
          totalTime: 0,
          tokensUsed: 0,
          cacheHitRate: 0,
        },
        cached: false,
        timestamp: new Date(),
      });
    }

    // Calculate progress
    const elapsed = Date.now() - startTime;
    const avgTimePerQuestion = elapsed / (completed + failed);
    const remaining = questions.length - completed - failed;
    const estimatedTimeRemaining = avgTimePerQuestion * remaining;

    if (onProgress) {
      onProgress({
        total: questions.length,
        completed,
        failed,
        estimatedTimeRemaining,
      });
    }
  }

  console.log(`[Batch Complete] Processed ${questions.length} questions in ${Date.now() - startTime}ms`);
  console.log(`Success: ${completed}, Failed: ${failed}`);

  return results;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get comprehensive performance statistics
 */
export function getPerformanceStats() {
  return {
    cache: ragCache.getStats(),
    performance: performanceMonitor.getStats(),
    timestamp: new Date(),
  };
}

/**
 * Clear all caches and metrics (useful for testing)
 */
export function clearMonitoring() {
  ragCache.clear();
  performanceMonitor.clearHistory();
  console.log('[Monitoring] All caches and metrics cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return ragCache.getStats();
}

/**
 * Export metrics for external monitoring systems
 */
export function exportMetrics() {
  const stats = getPerformanceStats();
  
  return {
    timestamp: new Date().toISOString(),
    cache: {
      hitRate: stats.cache.hitRate,
      size: stats.cache.size,
      hits: stats.cache.hits,
      misses: stats.cache.misses,
    },
    performance: {
      totalQueries: stats.performance.totalQueries,
      averages: stats.performance.averages,
      percentiles: stats.performance.percentiles,
    },
    health: {
      status: stats.cache.hitRate > 0.3 ? 'healthy' : 'degraded',
      recommendations: getHealthRecommendations(stats),
    },
  };
}

/**
 * Generate health recommendations based on metrics
 */
function getHealthRecommendations(stats: ReturnType<typeof getPerformanceStats>): string[] {
  const recommendations: string[] = [];

  if (stats.cache.hitRate < 0.3) {
    recommendations.push('Low cache hit rate. Consider increasing cache size or TTL.');
  }

  const avgTotal = stats.performance.averages.totalTime || 0;
  if (avgTotal > DEFAULT_THRESHOLDS.maxTotalTime) {
    recommendations.push('Average query time exceeds threshold. Consider optimizing query enhancement or using faster models.');
  }

  const p95 = stats.performance.percentiles.p95;
  if (p95 > DEFAULT_THRESHOLDS.maxTotalTime * 1.5) {
    recommendations.push('95th percentile response time is high. Investigate slow queries and add timeouts.');
  }

  if (recommendations.length === 0) {
    recommendations.push('System is performing optimally.');
  }

  return recommendations;
}

/**
 * Performance optimization tips (exported for documentation)
 */
export const OPTIMIZATION_TIPS = {
  caching: [
    'Cache enhanced queries for common interview questions',
    'Implement TTL-based cache invalidation',
    'Use LRU eviction for cache management',
    'Monitor cache hit rate (target >30%)',
  ],
  models: [
    'Use faster models (llama-3.1-8b-instant) for query enhancement',
    'Use powerful models (llama-3.1-70b-versatile) only for response formatting',
    'Adjust temperature settings per interview type',
  ],
  performance: [
    'Implement timeouts for all LLM calls (default 15s)',
    'Use fallback strategies for failed operations',
    'Monitor token usage to control costs',
    'Batch similar queries when possible',
  ],
  reliability: [
    'Set up health checks and monitoring',
    'Log performance metrics for analysis',
    'Implement circuit breakers for external services',
    'Use exponential backoff for retries',
  ],
  production: [
    'Enable response caching for repeated questions',
    'Monitor cache hit rates and adjust cache size',
    'Set performance thresholds and alerts',
    'Export metrics to external monitoring (DataDog, New Relic, etc.)',
  ],
};
