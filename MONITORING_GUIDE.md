# RAG Monitoring System - Production Guide

## Overview

The RAG Monitoring System provides comprehensive performance tracking, caching, and optimization for your enhanced RAG pipeline. It enables production-ready monitoring with real-time metrics, automated caching, and health recommendations.

## Features

### 1. Performance Monitoring
- **Real-time metrics tracking** for all RAG operations
- **Breakdown timing** for query enhancement, vector search, and response formatting
- **Percentile analysis** (P50, P95, P99) for identifying outliers
- **Threshold monitoring** with automatic warnings
- **Token usage tracking** for cost control

### 2. Intelligent Caching
- **LRU cache implementation** with automatic eviction
- **1-hour TTL** for cache entries
- **100-entry maximum** cache size
- **Cache hit rate tracking** (target > 30%)
- **Automatic cache invalidation** for stale entries

### 3. Health Monitoring
- **System health status** (healthy/degraded)
- **Automated recommendations** based on metrics
- **Performance threshold alerts**
- **Cache efficiency analysis**

### 4. Production Optimizations
- **15-second timeout** protection
- **Fallback strategies** for failed operations
- **Batch processing** with progress tracking
- **Metrics export** for external monitoring systems

## Architecture

```
User Query
    ↓
┌─────────────────────────────────────┐
│  Monitored RAG Query                │
│  - Check cache first                │
│  - Execute with timeout protection  │
│  - Track all metrics                │
│  - Cache successful results         │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Step 1: Query Enhancement          │
│  - Time tracking                    │
│  - Auto-detect interview type       │
│  - Fallback on error                │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Step 2: Vector Search              │
│  - Time tracking                    │
│  - Result count tracking            │
│  - Error handling                   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Step 3: Response Formatting        │
│  - Time tracking                    │
│  - Interview-specific formatting    │
│  - Token usage estimation           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Performance Recording              │
│  - Record all metrics               │
│  - Check thresholds                 │
│  - Update cache statistics          │
└─────────────────────────────────────┘
    ↓
Response + Metrics
```

## API Endpoints

### POST /api/monitored-rag
Execute a monitored RAG query with full performance tracking.

**Request:**
```json
{
  "question": "Tell me about your React experience",
  "interviewType": "technical",  // Optional: technical, behavioral, executive, system_design, general
  "useCache": true,               // Optional: default true
  "timeout": 15000,               // Optional: default 15000ms
  "fallbackToBasic": true         // Optional: default true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "Tell me about your React experience",
    "response": "I have 2 years of production React experience...",
    "cached": false,
    "timestamp": "2025-11-23T10:30:00.000Z",
    "metrics": {
      "queryEnhancementTime": 850,
      "vectorSearchTime": 1200,
      "responseFormattingTime": 2100,
      "totalTime": 4150,
      "tokensUsed": 450,
      "cacheHitRate": 0.25,
      "interviewType": "technical",
      "resultCount": 5
    },
    "interviewType": "technical"
  },
  "meta": {
    "processingTime": 4152,
    "apiVersion": "1.0"
  }
}
```

### GET /api/monitored-rag
Health check and statistics retrieval.

**Actions:**
- `?action=stats` - Get comprehensive performance statistics
- `?action=metrics` - Get health metrics and recommendations
- `?action=cache` - Get cache statistics
- No action - Basic health check

**Health Check Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-23T10:30:00.000Z",
  "version": "1.0",
  "features": {
    "caching": true,
    "monitoring": true,
    "queryEnhancement": true,
    "responseFormatting": true
  },
  "stats": {
    "totalQueries": 150,
    "cacheHitRate": 0.35,
    "cacheSize": 45
  }
}
```

**Statistics Response:**
```json
{
  "success": true,
  "data": {
    "cache": {
      "size": 45,
      "hits": 52,
      "misses": 98,
      "hitRate": 0.35,
      "maxSize": 100,
      "ttl": 3600000
    },
    "performance": {
      "totalQueries": 150,
      "averages": {
        "totalTime": 3850,
        "queryEnhancementTime": 750,
        "vectorSearchTime": 1100,
        "responseFormattingTime": 2000,
        "tokensUsed": 425,
        "cacheHitRate": 0.35
      },
      "percentiles": {
        "p50": 3500,
        "p95": 6200,
        "p99": 8500
      },
      "thresholds": {
        "maxTotalTime": 10000,
        "maxQueryEnhancementTime": 2000,
        "maxVectorSearchTime": 3000,
        "maxResponseFormattingTime": 5000,
        "maxTokensPerQuery": 2000
      }
    }
  }
}
```

**Health Metrics Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-11-23T10:30:00.000Z",
    "cache": {
      "hitRate": 0.35,
      "size": 45,
      "hits": 52,
      "misses": 98
    },
    "performance": {
      "totalQueries": 150,
      "averages": { /* ... */ },
      "percentiles": { /* ... */ }
    },
    "health": {
      "status": "healthy",
      "recommendations": [
        "System is performing optimally."
      ]
    }
  }
}
```

### DELETE /api/monitored-rag?confirm=true
Clear all caches and metrics (requires confirmation).

**Response:**
```json
{
  "success": true,
  "message": "All caches and metrics cleared successfully",
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

## Monitoring Dashboard

Access the monitoring dashboard at: **http://localhost:3000/monitoring**

### Dashboard Features:
- **Real-time performance metrics** (auto-refresh every 5 seconds)
- **Cache performance tracking** (hit rate, size, hits/misses)
- **Query statistics** (total queries, avg response time)
- **Performance breakdown** (visual progress bars)
- **Test query interface** (run test queries and see metrics)
- **Health recommendations** (automated optimization tips)
- **Cache management** (clear cache button)

## Performance Thresholds

Default thresholds trigger warnings when exceeded:

| Metric | Threshold | Description |
|--------|-----------|-------------|
| Total Time | 10,000ms | Total RAG pipeline execution time |
| Query Enhancement | 2,000ms | LLM query enhancement time |
| Vector Search | 3,000ms | Vector database search time |
| Response Formatting | 5,000ms | LLM response formatting time |
| Tokens Per Query | 2,000 | Total tokens used per query |

## Optimization Tips

### 🎯 Caching Strategy
1. **Target cache hit rate > 30%** for production workloads
2. **Pre-warm cache** with common interview questions
3. **Monitor cache size** - increase if hit rate is low
4. **Adjust TTL** based on content freshness requirements

### ⚡ Performance Optimization
1. **Query Enhancement:**
   - Use `llama-3.1-8b-instant` (fast, cost-effective)
   - Temperature: 0.3 for consistency
   - Max tokens: 150

2. **Response Formatting:**
   - Use `llama-3.1-70b-versatile` (high quality)
   - Temperature: 0.7 for natural responses
   - Max tokens: 500-800 (interview type dependent)

3. **Vector Search:**
   - Use enhanced queries for better results
   - Monitor search time - optimize vector DB if slow
   - Consider result count limits

### 🔒 Reliability
1. **Timeout Protection:**
   - Default: 15 seconds
   - Adjust based on P95/P99 percentiles
   - Implement graceful degradation

2. **Fallback Strategies:**
   - Enable `fallbackToBasic` for production
   - Return raw results if formatting fails
   - Use original query if enhancement fails

3. **Error Handling:**
   - All errors logged with context
   - Graceful error responses to users
   - Metrics tracked even on failures

### 📊 Monitoring Best Practices
1. **Watch P95/P99 percentiles** - identify slow queries
2. **Monitor cache hit rate** - optimize cache strategy
3. **Track token usage** - control API costs
4. **Set up alerts** for threshold violations
5. **Export metrics** to external systems (DataDog, New Relic, etc.)

## Usage Examples

### TypeScript (Server-Side)
```typescript
import { monitoredRAGQuery } from '@/lib/rag-monitoring';

// Basic usage
const result = await monitoredRAGQuery(
  "Tell me about your React experience"
);

console.log('Response:', result.response);
console.log('Cached:', result.cached);
console.log('Total Time:', result.metrics.totalTime, 'ms');

// Advanced usage with configuration
const result = await monitoredRAGQuery(
  "Describe a challenging project",
  undefined, // Auto-detect interview type
  {
    useCache: true,
    timeout: 10000,
    fallbackToBasic: true,
  }
);
```

### Client-Side (API)
```typescript
const response = await fetch('/api/monitored-rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'Tell me about your React experience',
    useCache: true,
  }),
});

const data = await response.json();
console.log(data.data.response);
console.log(data.data.metrics);
```

### Batch Processing
```typescript
import { monitoredBatchRAGQuery } from '@/lib/rag-monitoring';

const questions = [
  "Tell me about your React experience",
  "Describe a challenging project",
  "What's your leadership style?",
];

const results = await monitoredBatchRAGQuery(
  questions,
  undefined,
  (progress) => {
    console.log(`Progress: ${progress.completed}/${progress.total}`);
    console.log(`ETA: ${progress.estimatedTimeRemaining}ms`);
  }
);

results.forEach((result, i) => {
  console.log(`Q${i+1}: ${result.response}`);
  console.log(`Metrics: ${result.metrics.totalTime}ms`);
});
```

## Testing

Run the comprehensive test suite:

```powershell
# Make sure Next.js is running on port 3000
cd mydigitaltwin
npm run dev

# In another terminal, run tests
cd ..
./test_monitoring.ps1
```

The test script validates:
- Health check endpoint
- Cache hit/miss behavior
- Performance statistics
- Health metrics and recommendations
- Cache statistics
- Multiple query types
- Cache bypass functionality
- Timeout configuration
- Error handling
- Final performance report

## Metrics Export

For external monitoring systems (DataDog, New Relic, CloudWatch):

```typescript
import { exportMetrics } from '@/lib/rag-monitoring';

// Export metrics in standard format
const metrics = exportMetrics();

// Send to monitoring system
await fetch('https://your-monitoring-system.com/metrics', {
  method: 'POST',
  body: JSON.stringify(metrics),
});
```

## Configuration

### Environment Variables
```env
GROQ_API_KEY=your_groq_api_key
```

### Cache Configuration
Edit `lib/rag-monitoring.ts`:
```typescript
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const CACHE_MAX_SIZE = 100; // entries
```

### Performance Thresholds
Edit `lib/rag-monitoring.ts`:
```typescript
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  maxTotalTime: 10000,
  maxQueryEnhancementTime: 2000,
  maxVectorSearchTime: 3000,
  maxResponseFormattingTime: 5000,
  maxTokensPerQuery: 2000,
};
```

## Production Deployment

### 1. Environment Setup
```bash
# Set environment variables in Vercel
GROQ_API_KEY=your_production_key
```

### 2. Enable Monitoring
The monitoring system is automatically enabled in production. No additional configuration required.

### 3. Access Dashboard
Visit: `https://your-domain.vercel.app/monitoring`

### 4. Set Up Alerts
Integrate with external monitoring:
```typescript
// In your monitoring cron job
const metrics = await fetch('https://your-domain.vercel.app/api/monitored-rag?action=metrics');
const data = await metrics.json();

if (data.data.health.status !== 'healthy') {
  // Send alert
  await sendAlert(data.data.health.recommendations);
}
```

## Troubleshooting

### Low Cache Hit Rate
- **Issue:** Cache hit rate < 20%
- **Solutions:**
  - Increase cache size (CACHE_MAX_SIZE)
  - Increase TTL if content doesn't change frequently
  - Pre-warm cache with common questions
  - Check if users are asking unique questions

### High Response Times
- **Issue:** P95 > 10 seconds
- **Solutions:**
  - Check vector database performance
  - Use faster models for query enhancement
  - Reduce max_tokens for formatting
  - Enable caching
  - Adjust timeout thresholds

### High Token Usage
- **Issue:** Token costs increasing
- **Solutions:**
  - Enable caching to reduce LLM calls
  - Use smaller models where appropriate
  - Reduce max_tokens settings
  - Monitor token usage per interview type

### Memory Issues
- **Issue:** High memory usage
- **Solutions:**
  - Reduce cache size
  - Clear metrics history more frequently
  - Implement cache size monitoring

## Next Steps

1. **Run Tests:** `./test_monitoring.ps1`
2. **Open Dashboard:** http://localhost:3000/monitoring
3. **Run Test Queries:** Build up cache and monitor metrics
4. **Optimize Configuration:** Adjust thresholds based on your needs
5. **Deploy to Production:** Enable monitoring in Vercel
6. **Set Up External Monitoring:** Export metrics to your monitoring system

## Support

For issues or questions:
1. Check the monitoring dashboard for health recommendations
2. Review performance metrics for bottlenecks
3. Check logs for error details
4. Refer to the optimization tips above
