# Interview Configuration Test Script
# Tests different interview types with optimized RAG configurations

Write-Host "`n=== Interview-Optimized RAG Test ===" -ForegroundColor Cyan
Write-Host "Testing context-aware configurations for different interview types`n" -ForegroundColor Yellow

# Test questions for each interview type
$testCases = @(
    @{
        Type = "Technical Interview"
        Question = "How did you optimize the performance of your FastAPI application?"
        ExpectedFocus = "metrics, architecture, technical details"
    },
    @{
        Type = "Behavioral Interview"
        Question = "Tell me about a time you faced a conflict with a team member"
        ExpectedFocus = "STAR format, emotional intelligence, resolution"
    },
    @{
        Type = "Executive Interview"
        Question = "How do you approach strategic technology decisions?"
        ExpectedFocus = "business impact, ROI, stakeholder management"
    },
    @{
        Type = "System Design Interview"
        Question = "How would you design a scalable microservices architecture?"
        ExpectedFocus = "scalability, trade-offs, distributed systems"
    },
    @{
        Type = "General Interview"
        Question = "Why are you interested in this position?"
        ExpectedFocus = "passion, culture fit, authentic personality"
    }
)

Write-Host "[Info] Testing Auto-Detection & Configuration..." -ForegroundColor Green
Write-Host "The system will automatically detect interview type and apply optimal settings`n" -ForegroundColor Gray

foreach ($testCase in $testCases) {
    Write-Host "=== $($testCase.Type) ===" -ForegroundColor Cyan
    Write-Host "Question: $($testCase.Question)" -ForegroundColor White
    Write-Host "Expected Focus: $($testCase.ExpectedFocus)" -ForegroundColor Gray
    
    try {
        $body = @{ question = $testCase.Question } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/enhanced-rag" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body -TimeoutSec 30

        Write-Host "`n✓ Response Generated" -ForegroundColor Green
        Write-Host "  Processing Time: $($response.metadata.processingTime)ms" -ForegroundColor Gray
        Write-Host "  Query Enhanced: $($response.metadata.queryEnhanced)" -ForegroundColor Gray
        Write-Host "  Response Formatted: $($response.metadata.responseFormatted)" -ForegroundColor Gray
        
        Write-Host "`n  Enhanced Query:" -ForegroundColor Yellow
        Write-Host "  $($response.enhancedQuery)`n" -ForegroundColor White
        
        Write-Host "  Response Preview (first 200 chars):" -ForegroundColor Yellow
        $preview = $response.answer.Substring(0, [Math]::Min(200, $response.answer.Length))
        Write-Host "  $preview...`n" -ForegroundColor White
        
    } catch {
        Write-Host "✗ Test failed: $($_.Exception.Message)`n" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 2
}

Write-Host "`n=== Configuration Details ===" -ForegroundColor Cyan
Write-Host @"

Interview Type Configurations:

1. Technical Interview
   - Query Model: llama-3.1-8b-instant (fast)
   - Response Model: llama-3.1-70b-versatile (detailed)
   - Temperature: 0.3 query, 0.4 response (precise)
   - Focus: Technical skills, metrics, code quality
   - Style: Detailed technical examples with numbers

2. Behavioral Interview
   - Query Model: llama-3.1-8b-instant
   - Response Model: llama-3.1-70b-versatile
   - Temperature: 0.3 query, 0.7 response (creative)
   - Focus: Leadership, teamwork, soft skills
   - Style: STAR format stories with emotional intelligence

3. Executive Interview
   - Query Model: llama-3.1-70b-versatile (powerful)
   - Response Model: llama-3.1-70b-versatile
   - Temperature: 0.4 query, 0.5 response (balanced)
   - Focus: Strategy, business impact, vision
   - Style: High-level strategic with business metrics

4. System Design Interview
   - Query Model: llama-3.1-8b-instant
   - Response Model: llama-3.1-70b-versatile
   - Temperature: 0.3 query, 0.4 response (precise)
   - Focus: Scalability, architecture, trade-offs
   - Style: Technical decisions with constraints

5. General Interview
   - Query Model: llama-3.1-8b-instant
   - Response Model: llama-3.1-70b-versatile
   - Temperature: 0.3 query, 0.6 response (balanced)
   - Focus: Experience, culture fit, authenticity
   - Style: Balanced professional with personality

"@ -ForegroundColor Gray

Write-Host "=== Auto-Detection Algorithm ===" -ForegroundColor Cyan
Write-Host @"

The system analyzes question keywords to detect interview type:

Technical → code, algorithm, debug, optimize, API, database
Behavioral → conflict, team, leader, communicate, challenge
Executive → strategy, business, ROI, stakeholder, vision
System Design → scale, architecture, distributed, microservice
General → fallback for all other questions

This ensures optimal configuration for each question automatically!

"@ -ForegroundColor Gray

Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host "Try the comparison tool: http://localhost:3000/compare" -ForegroundColor Yellow
Write-Host "Interactive chat: http://localhost:3000/enhanced-chat`n" -ForegroundColor Yellow
