# Test RAG Monitoring System
# Tests performance tracking, caching, and optimization features

Write-Host "`n=== RAG Monitoring System Tests ===" -ForegroundColor Cyan
Write-Host "Testing production monitoring features`n" -ForegroundColor Gray

$baseUrl = "http://localhost:3000"
$totalTests = 0
$passedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body,
        [scriptblock]$Validator
    )
    
    $script:totalTests++
    Write-Host "Test $totalTests : $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        
        if ($Validator) {
            $validationResult = & $Validator $response
            if ($validationResult) {
                Write-Host "  ✓ PASSED" -ForegroundColor Green
                $script:passedTests++
                return $response
            } else {
                Write-Host "  ✗ FAILED - Validation failed" -ForegroundColor Red
                return $null
            }
        } else {
            Write-Host "  ✓ PASSED" -ForegroundColor Green
            $script:passedTests++
            return $response
        }
    } catch {
        Write-Host "  ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test 1: Health Check
Write-Host "`n--- Health Check Tests ---" -ForegroundColor Cyan
Test-Endpoint `
    -Name "Health check endpoint" `
    -Method "GET" `
    -Url "$baseUrl/api/monitored-rag" `
    -Validator {
        param($r)
        $r.success -eq $true -and $r.status -and $r.features
    }

# Test 2: Initial Query (Cache Miss)
Write-Host "`n--- Cache Tests ---" -ForegroundColor Cyan
$query1 = Test-Endpoint `
    -Name "First query (cache miss)" `
    -Method "POST" `
    -Url "$baseUrl/api/monitored-rag" `
    -Body @{
        question = "Tell me about your React experience"
        useCache = $true
    } `
    -Validator {
        param($r)
        $r.success -eq $true -and $r.data.cached -eq $false
    }

if ($query1) {
    Write-Host "  Metrics:" -ForegroundColor Gray
    Write-Host "    Total Time: $($query1.data.metrics.totalTime)ms" -ForegroundColor Gray
    Write-Host "    Cached: $($query1.data.cached)" -ForegroundColor Gray
    Write-Host "    Interview Type: $($query1.data.interviewType)" -ForegroundColor Gray
}

# Test 3: Repeat Query (Cache Hit)
Start-Sleep -Milliseconds 500
$query2 = Test-Endpoint `
    -Name "Repeat query (cache hit)" `
    -Method "POST" `
    -Url "$baseUrl/api/monitored-rag" `
    -Body @{
        question = "Tell me about your React experience"
        useCache = $true
    } `
    -Validator {
        param($r)
        $r.success -eq $true -and $r.data.cached -eq $true
    }

if ($query2) {
    Write-Host "  Metrics:" -ForegroundColor Gray
    Write-Host "    Total Time: $($query2.data.metrics.totalTime)ms" -ForegroundColor Gray
    Write-Host "    Cached: $($query2.data.cached)" -ForegroundColor Gray
    Write-Host "    Cache Hit Rate: $([math]::Round($query2.data.metrics.cacheHitRate * 100, 1))%" -ForegroundColor Gray
}

# Test 4: Performance Stats
Write-Host "`n--- Performance Monitoring Tests ---" -ForegroundColor Cyan
$stats = Test-Endpoint `
    -Name "Get performance statistics" `
    -Method "GET" `
    -Url "$baseUrl/api/monitored-rag?action=stats" `
    -Validator {
        param($r)
        $r.success -eq $true -and $r.data.cache -and $r.data.performance
    }

if ($stats) {
    Write-Host "`n  Performance Summary:" -ForegroundColor Gray
    Write-Host "    Total Queries: $($stats.data.performance.totalQueries)" -ForegroundColor Gray
    Write-Host "    Cache Hit Rate: $([math]::Round($stats.data.cache.hitRate * 100, 1))%" -ForegroundColor Gray
    Write-Host "    Cache Size: $($stats.data.cache.size) / $($stats.data.cache.maxSize)" -ForegroundColor Gray
    
    if ($stats.data.performance.averages) {
        Write-Host "`n  Average Timings:" -ForegroundColor Gray
        Write-Host "    Total: $($stats.data.performance.averages.totalTime)ms" -ForegroundColor Gray
        Write-Host "    Query Enhancement: $($stats.data.performance.averages.queryEnhancementTime)ms" -ForegroundColor Gray
        Write-Host "    Vector Search: $($stats.data.performance.averages.vectorSearchTime)ms" -ForegroundColor Gray
        Write-Host "    Response Formatting: $($stats.data.performance.averages.responseFormattingTime)ms" -ForegroundColor Gray
    }
    
    if ($stats.data.performance.percentiles) {
        Write-Host "`n  Percentiles:" -ForegroundColor Gray
        Write-Host "    P50: $($stats.data.performance.percentiles.p50)ms" -ForegroundColor Gray
        Write-Host "    P95: $($stats.data.performance.percentiles.p95)ms" -ForegroundColor Gray
        Write-Host "    P99: $($stats.data.performance.percentiles.p99)ms" -ForegroundColor Gray
    }
}

# Test 5: Health Metrics
$metrics = Test-Endpoint `
    -Name "Get health metrics" `
    -Method "GET" `
    -Url "$baseUrl/api/monitored-rag?action=metrics" `
    -Validator {
        param($r)
        $r.success -eq $true -and $r.data.health
    }

if ($metrics) {
    Write-Host "`n  Health Status:" -ForegroundColor Gray
    Write-Host "    Status: $($metrics.data.health.status)" -ForegroundColor $(if ($metrics.data.health.status -eq "healthy") { "Green" } else { "Yellow" })
    Write-Host "    Recommendations:" -ForegroundColor Gray
    foreach ($rec in $metrics.data.health.recommendations) {
        Write-Host "      • $rec" -ForegroundColor Gray
    }
}

# Test 6: Cache Statistics
$cacheStats = Test-Endpoint `
    -Name "Get cache statistics" `
    -Method "GET" `
    -Url "$baseUrl/api/monitored-rag?action=cache" `
    -Validator {
        param($r)
        $r.success -eq $true -and $r.data.size -ge 0
    }

if ($cacheStats) {
    Write-Host "`n  Cache Details:" -ForegroundColor Gray
    Write-Host "    Size: $($cacheStats.data.size)" -ForegroundColor Gray
    Write-Host "    Hits: $($cacheStats.data.hits)" -ForegroundColor Gray
    Write-Host "    Misses: $($cacheStats.data.misses)" -ForegroundColor Gray
    Write-Host "    Hit Rate: $([math]::Round($cacheStats.data.hitRate * 100, 1))%" -ForegroundColor Gray
    Write-Host "    TTL: $([math]::Round($cacheStats.data.ttl / 1000 / 60, 0)) minutes" -ForegroundColor Gray
}

# Test 7: Multiple Different Queries
Write-Host "`n--- Multi-Query Tests ---" -ForegroundColor Cyan
$testQueries = @(
    "Describe a challenging project you worked on",
    "What's your experience with TypeScript?",
    "Tell me about a time you showed leadership"
)

foreach ($query in $testQueries) {
    $result = Test-Endpoint `
        -Name "Query: '$query'" `
        -Method "POST" `
        -Url "$baseUrl/api/monitored-rag" `
        -Body @{ question = $query; useCache = $true } `
        -Validator {
            param($r)
            $r.success -eq $true
        }
    
    if ($result) {
        Write-Host "  Time: $($result.data.metrics.totalTime)ms | Type: $($result.data.interviewType)" -ForegroundColor Gray
    }
    Start-Sleep -Milliseconds 300
}

# Test 8: Query Without Cache
Write-Host "`n--- Cache Bypass Tests ---" -ForegroundColor Cyan
$noCache = Test-Endpoint `
    -Name "Query with cache disabled" `
    -Method "POST" `
    -Url "$baseUrl/api/monitored-rag" `
    -Body @{
        question = "Tell me about your React experience"
        useCache = $false
    } `
    -Validator {
        param($r)
        $r.success -eq $true -and $r.data.cached -eq $false
    }

if ($noCache) {
    Write-Host "  Cached: $($noCache.data.cached)" -ForegroundColor Gray
}

# Test 9: Timeout Configuration
Write-Host "`n--- Timeout Tests ---" -ForegroundColor Cyan
Test-Endpoint `
    -Name "Query with custom timeout" `
    -Method "POST" `
    -Url "$baseUrl/api/monitored-rag" `
    -Body @{
        question = "What are your key strengths?"
        timeout = 5000
        useCache = $true
    } `
    -Validator {
        param($r)
        $r.success -eq $true
    }

# Test 10: Invalid Requests
Write-Host "`n--- Error Handling Tests ---" -ForegroundColor Cyan
Test-Endpoint `
    -Name "Query with missing question" `
    -Method "POST" `
    -Url "$baseUrl/api/monitored-rag" `
    -Body @{ } `
    -Validator {
        param($r)
        $r.success -eq $false -and $r.error
    }

Test-Endpoint `
    -Name "Query with invalid question type" `
    -Method "POST" `
    -Url "$baseUrl/api/monitored-rag" `
    -Body @{ question = 123 } `
    -Validator {
        param($r)
        $r.success -eq $false
    }

# Final Stats Check
Write-Host "`n--- Final Performance Check ---" -ForegroundColor Cyan
$finalStats = Test-Endpoint `
    -Name "Final performance statistics" `
    -Method "GET" `
    -Url "$baseUrl/api/monitored-rag?action=stats" `
    -Validator {
        param($r)
        $r.success -eq $true
    }

if ($finalStats) {
    Write-Host "`n  📊 Final Performance Report:" -ForegroundColor Cyan
    Write-Host "    Total Queries Processed: $($finalStats.data.performance.totalQueries)" -ForegroundColor Green
    Write-Host "    Cache Hit Rate: $([math]::Round($finalStats.data.cache.hitRate * 100, 1))%" -ForegroundColor $(if ($finalStats.data.cache.hitRate -gt 0.3) { "Green" } else { "Yellow" })
    Write-Host "    Cache Entries: $($finalStats.data.cache.size)" -ForegroundColor Green
    
    if ($finalStats.data.performance.averages.totalTime -gt 0) {
        $avgTotal = $finalStats.data.performance.averages.totalTime
        $threshold = $finalStats.data.performance.thresholds.maxTotalTime
        Write-Host "    Avg Response Time: ${avgTotal}ms (Threshold: ${threshold}ms)" -ForegroundColor $(if ($avgTotal -lt $threshold) { "Green" } else { "Yellow" })
    }
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 1))%`n" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })

# Performance Tips
Write-Host "=== Performance Optimization Tips ===" -ForegroundColor Cyan
Write-Host "🎯 Caching:" -ForegroundColor Yellow
Write-Host "  • Target cache hit rate > 30%" -ForegroundColor Gray
Write-Host "  • Current cache TTL: 1 hour" -ForegroundColor Gray
Write-Host "  • Max cache size: 100 entries" -ForegroundColor Gray
Write-Host ""
Write-Host "⚡ Performance:" -ForegroundColor Yellow
Write-Host "  • Use llama-3.1-8b-instant for query enhancement" -ForegroundColor Gray
Write-Host "  • Use llama-3.1-70b-versatile for response formatting" -ForegroundColor Gray
Write-Host "  • Adjust temperature per interview type" -ForegroundColor Gray
Write-Host ""
Write-Host "🔒 Reliability:" -ForegroundColor Yellow
Write-Host "  • 15-second default timeout" -ForegroundColor Gray
Write-Host "  • Automatic fallback on errors" -ForegroundColor Gray
Write-Host "  • Performance threshold monitoring" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Monitoring:" -ForegroundColor Yellow
Write-Host "  • Visit http://localhost:3000/monitoring for dashboard" -ForegroundColor Gray
Write-Host "  • Check P95/P99 percentiles for outliers" -ForegroundColor Gray
Write-Host "  • Monitor token usage to control costs" -ForegroundColor Gray
Write-Host ""

# Next Steps
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Open monitoring dashboard: http://localhost:3000/monitoring" -ForegroundColor White
Write-Host "2. Run test queries to build cache" -ForegroundColor White
Write-Host "3. Monitor cache hit rate (target > 30%)" -ForegroundColor White
Write-Host "4. Check performance thresholds" -ForegroundColor White
Write-Host "5. Export metrics for external monitoring" -ForegroundColor White
Write-Host ""
