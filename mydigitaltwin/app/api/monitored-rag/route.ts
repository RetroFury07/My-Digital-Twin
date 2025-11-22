/**
 * Monitored RAG API Endpoint
 * Production-ready endpoint with performance tracking and caching
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  monitoredRAGQuery,
  getPerformanceStats,
  clearMonitoring,
  exportMetrics,
  getCacheStats,
  type RAGMetrics,
} from '@/lib/rag-monitoring';
import { getRAGConfig, type RAGConfig } from '@/lib/rag-config';

// ============================================================================
// POST /api/monitored-rag - Execute monitored RAG query
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question,
      interviewType,
      useCache = true,
      timeout = 15000,
      fallbackToBasic = true,
    } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    // Get configuration if interview type is specified
    let config: RAGConfig | undefined;
    if (interviewType) {
      try {
        config = getRAGConfig(interviewType);
      } catch (error) {
        console.warn(`Invalid interview type: ${interviewType}, using auto-detection`);
      }
    }

    // Execute monitored query
    const startTime = Date.now();
    const result = await monitoredRAGQuery(question, config, {
      useCache,
      timeout,
      fallbackToBasic,
    });

    return NextResponse.json({
      success: true,
      data: {
        question,
        response: result.response,
        cached: result.cached,
        timestamp: result.timestamp,
        metrics: result.metrics,
        interviewType: result.metrics.interviewType || 'auto-detected',
      },
      meta: {
        processingTime: Date.now() - startTime,
        apiVersion: '1.0',
      },
    });

  } catch (error) {
    console.error('[Monitored RAG API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process RAG query',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/monitored-rag - Health check and statistics
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'stats':
        // Get comprehensive performance statistics
        const stats = getPerformanceStats();
        return NextResponse.json({
          success: true,
          data: stats,
        });

      case 'metrics':
        // Export metrics for monitoring systems
        const metrics = exportMetrics();
        return NextResponse.json({
          success: true,
          data: metrics,
        });

      case 'cache':
        // Get cache statistics
        const cacheStats = getCacheStats();
        return NextResponse.json({
          success: true,
          data: cacheStats,
        });

      default:
        // Health check
        const healthStats = getPerformanceStats();
        const isHealthy = healthStats.cache.hitRate > 0.2 || healthStats.performance.totalQueries < 10;
        
        return NextResponse.json({
          success: true,
          status: isHealthy ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          version: '1.0',
          features: {
            caching: true,
            monitoring: true,
            queryEnhancement: true,
            responseFormatting: true,
          },
          stats: {
            totalQueries: healthStats.performance.totalQueries,
            cacheHitRate: healthStats.cache.hitRate,
            cacheSize: healthStats.cache.size,
          },
        });
    }
  } catch (error) {
    console.error('[Monitored RAG API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/monitored-rag - Clear caches and metrics
// ============================================================================

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const confirm = searchParams.get('confirm');

  if (confirm !== 'true') {
    return NextResponse.json(
      {
        success: false,
        error: 'Confirmation required',
        message: 'Add ?confirm=true to clear all caches and metrics',
      },
      { status: 400 }
    );
  }

  try {
    clearMonitoring();
    
    return NextResponse.json({
      success: true,
      message: 'All caches and metrics cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Monitored RAG API] DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear monitoring data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
