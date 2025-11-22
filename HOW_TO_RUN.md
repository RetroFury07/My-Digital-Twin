# 🚀 Quick Start Guide - RAG Monitoring System

## Prerequisites
✅ Next.js installed in `mydigitaltwin/`
✅ Groq API key in `.env.local`
✅ All dependencies installed

## Step 1: Start the Next.js Development Server

```powershell
# Navigate to the Next.js app
cd mydigitaltwin

# Start the development server
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 16.0.1
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.5s
```

## Step 2: Access the Monitoring Dashboard

Open your browser and visit:
```
http://localhost:3000/monitoring
```

You should see:
- Real-time metrics dashboard
- Cache performance tracking
- Test query interface
- Performance breakdown charts
- Health status and recommendations

## Step 3: Run the Test Suite

Open a **new terminal** (keep Next.js running) and run:

```powershell
# Navigate to project root
cd D:\WEEK-6\digital-twin-workshop

# Run the monitoring tests
.\test_monitoring.ps1
```

**Expected Output:**
```
=== RAG Monitoring System Tests ===
Testing production monitoring features

--- Health Check Tests ---
Test 1: Health check endpoint
  ✓ PASSED

--- Cache Tests ---
Test 2: First query (cache miss)
  ✓ PASSED
  Metrics:
    Total Time: 4150ms
    Cached: False
    Interview Type: technical

Test 3: Repeat query (cache hit)
  ✓ PASSED
  Metrics:
    Total Time: 5ms
    Cached: True
    Cache Hit Rate: 50.0%

... (13 tests total)

=== Test Summary ===
Total Tests: 13
Passed: 13
Failed: 0
Success Rate: 100%
```

## Step 4: Test Individual Queries

### Using PowerShell (Recommended)
```powershell
# Test a basic query
curl http://localhost:3000/api/monitored-rag -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"question":"Tell me about your React experience"}'

# Test with specific interview type
curl http://localhost:3000/api/monitored-rag -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"question":"Describe a challenging project", "interviewType":"behavioral"}'

# Get performance statistics
curl http://localhost:3000/api/monitored-rag?action=stats

# Get health metrics
curl http://localhost:3000/api/monitored-rag?action=metrics

# Get cache statistics
curl http://localhost:3000/api/monitored-rag?action=cache
```

### Using the Dashboard (Easier!)
1. Go to http://localhost:3000/monitoring
2. Scroll to "Test RAG Query" section
3. Enter a question like: "Tell me about your React experience"
4. Click "Run Test Query"
5. See the response and metrics instantly!

## Step 5: Monitor Performance

### View Real-time Metrics
The dashboard shows:
- **Cache Hit Rate** - Target: > 30%
- **Total Queries** - All queries processed
- **Avg Response Time** - Should be < 10 seconds
- **Performance Breakdown** - Time spent in each step
- **Health Status** - healthy/degraded with recommendations

### Auto-refresh
- Enable "Auto-refresh (5s)" checkbox for live updates
- Metrics update every 5 seconds automatically

## Step 6: Compare with Existing RAG

You can still use your existing RAG endpoints:
```powershell
# Enhanced RAG (no monitoring)
curl http://localhost:3000/api/enhanced-rag -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"question":"Tell me about your React experience"}'

# Monitored RAG (with metrics & caching)
curl http://localhost:3000/api/monitored-rag -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"question":"Tell me about your React experience"}'
```

## Common Commands

### Start Everything
```powershell
# Terminal 1: Start Next.js
cd D:\WEEK-6\digital-twin-workshop\mydigitaltwin
npm run dev

# Terminal 2: Run tests
cd D:\WEEK-6\digital-twin-workshop
.\test_monitoring.ps1
```

### Check if Next.js is Running
```powershell
Test-NetConnection -ComputerName localhost -Port 3000
```

### Clear Cache and Metrics
```powershell
curl http://localhost:3000/api/monitored-rag?confirm=true -Method DELETE
```

Or use the "Clear Cache" button on the dashboard!

## Troubleshooting

### Port 3000 Already in Use
```powershell
# Find and kill the process
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use a different port
cd mydigitaltwin
npm run dev -- -p 3001
```

### Missing Environment Variables
Check `mydigitaltwin/.env.local`:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### Module Not Found Errors
```powershell
cd mydigitaltwin
npm install
```

## What to Expect

### First Query (Cache Miss)
- Response time: ~3-5 seconds
- Metrics show breakdown of each step
- Response is cached for future use

### Repeated Query (Cache Hit)
- Response time: < 50ms (instant!)
- Cached: true
- No LLM calls = no cost

### After 10+ Queries
- Cache hit rate should increase
- Average response time decreases
- Health status should be "healthy"

## Next Steps

1. ✅ **Start Next.js** - `cd mydigitaltwin && npm run dev`
2. ✅ **Open Dashboard** - http://localhost:3000/monitoring
3. ✅ **Run Tests** - `.\test_monitoring.ps1`
4. ✅ **Test Queries** - Use dashboard or curl commands
5. ✅ **Monitor Metrics** - Watch cache hit rate and response times

## Quick Reference URLs

| Purpose | URL |
|---------|-----|
| Monitoring Dashboard | http://localhost:3000/monitoring |
| Enhanced RAG (original) | http://localhost:3000/enhanced-chat |
| Comparison UI | http://localhost:3000/compare |
| API Health Check | http://localhost:3000/api/monitored-rag |
| API Statistics | http://localhost:3000/api/monitored-rag?action=stats |

## Performance Tips

- **First run:** Expect slower times (cache empty)
- **Repeated queries:** Should be instant (cached)
- **Target cache hit rate:** > 30%
- **Target avg time:** < 10 seconds

Enjoy your production-ready RAG monitoring system! 🎉
