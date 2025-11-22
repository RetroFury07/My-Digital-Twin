# RAG Comparison Test Script
# Compares Basic RAG vs LLM-Enhanced RAG to measure improvements

Write-Host "`n=== RAG Comparison Test ===" -ForegroundColor Cyan
Write-Host "Comparing Basic RAG vs LLM-Enhanced RAG`n" -ForegroundColor Yellow

# Test Questions for Evaluation
$testQuestions = @(
    "What are my key strengths?",
    "Tell me about a challenging project",
    "Why should we hire you?",
    "Describe your leadership experience"
)

# Test 1: API Health Check
Write-Host "[Test 1] Health Check..." -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/compare-rag" -Method GET
    Write-Host "✓ Status: $($health.status)" -ForegroundColor Green
    Write-Host "`n  Evaluation Criteria:" -ForegroundColor Yellow
    foreach ($criteria in $health.evaluationCriteria) {
        Write-Host "  - $criteria" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n  Make sure the Next.js server is running:" -ForegroundColor Yellow
    Write-Host "  cd mydigitaltwin && npm run dev" -ForegroundColor Gray
    exit 1
}

# Test 2: Single Question Comparison
Write-Host "`n[Test 2] Single Question Comparison..." -ForegroundColor Green
Write-Host "Question: '$($testQuestions[0])'`n" -ForegroundColor Cyan

try {
    $body = @{ question = $testQuestions[0] } | ConvertTo-Json
    $comparison = Invoke-RestMethod -Uri "http://localhost:3000/api/compare-rag" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "✓ Comparison Complete!" -ForegroundColor Green
    
    Write-Host "`n  === BASIC RAG ===" -ForegroundColor Yellow
    Write-Host "  Results Found: $($comparison.results.basic.resultsFound)" -ForegroundColor Gray
    Write-Host "  Processing Time: $($comparison.results.basic.processingTime)ms" -ForegroundColor Gray
    Write-Host "  Query Enhanced: $($comparison.results.basic.queryEnhanced)" -ForegroundColor Gray
    Write-Host "  Response Formatted: $($comparison.results.basic.responseFormatted)" -ForegroundColor Gray
    Write-Host "  Response Length: $($comparison.metrics.basicLength) chars" -ForegroundColor Gray
    Write-Host "`n  Response Preview:" -ForegroundColor Cyan
    $basicPreview = $comparison.results.basic.response.Substring(0, [Math]::Min(150, $comparison.results.basic.response.Length))
    Write-Host "  $basicPreview..." -ForegroundColor White
    
    Write-Host "`n  === LLM-ENHANCED RAG ===" -ForegroundColor Yellow
    Write-Host "  Results Found: $($comparison.results.enhanced.resultsFound)" -ForegroundColor Gray
    Write-Host "  Processing Time: $($comparison.results.enhanced.processingTime)ms" -ForegroundColor Gray
    Write-Host "  Query Enhanced: $($comparison.results.enhanced.queryEnhanced)" -ForegroundColor Gray
    Write-Host "  Response Formatted: $($comparison.results.enhanced.responseFormatted)" -ForegroundColor Gray
    Write-Host "  Response Length: $($comparison.metrics.enhancedLength) chars" -ForegroundColor Gray
    Write-Host "`n  Enhanced Query:" -ForegroundColor Cyan
    Write-Host "  $($comparison.results.enhanced.enhancedQuery)" -ForegroundColor White
    Write-Host "`n  Response Preview:" -ForegroundColor Cyan
    $enhancedPreview = $comparison.results.enhanced.response.Substring(0, [Math]::Min(150, $comparison.results.enhanced.response.Length))
    Write-Host "  $enhancedPreview..." -ForegroundColor White
    
    Write-Host "`n  === METRICS ===" -ForegroundColor Yellow
    Write-Host "  Total Comparison Time: $($comparison.metrics.totalComparisonTime)ms" -ForegroundColor Gray
    Write-Host "  Improvement Ratio: $($comparison.metrics.improvementRatio.ToString('F2'))x" -ForegroundColor $(if ($comparison.metrics.improvementRatio -gt 1) { 'Green' } else { 'Yellow' })
    
} catch {
    Write-Host "✗ Comparison failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Batch Comparison
Write-Host "`n[Test 3] Batch Comparison (4 questions)..." -ForegroundColor Green

try {
    $batchBody = @{ questions = $testQuestions } | ConvertTo-Json
    $batchResult = Invoke-RestMethod -Uri "http://localhost:3000/api/compare-rag" `
        -Method POST `
        -ContentType "application/json" `
        -Body $batchBody

    Write-Host "✓ Batch Comparison Complete!" -ForegroundColor Green
    Write-Host "`n  Total Questions: $($batchResult.totalQuestions)" -ForegroundColor Gray
    Write-Host "  Successful Comparisons: $($batchResult.successfulComparisons)" -ForegroundColor Gray
    
    Write-Host "`n  === AGGREGATE METRICS ===" -ForegroundColor Yellow
    Write-Host "  Average Basic Processing Time: $($batchResult.aggregateMetrics.averageBasicTime.ToString('F0'))ms" -ForegroundColor Gray
    Write-Host "  Average Enhanced Processing Time: $($batchResult.aggregateMetrics.averageEnhancedTime.ToString('F0'))ms" -ForegroundColor Gray
    Write-Host "  Average Improvement Ratio: $($batchResult.aggregateMetrics.averageImprovementRatio.ToString('F2'))x" -ForegroundColor $(if ($batchResult.aggregateMetrics.averageImprovementRatio -gt 1) { 'Green' } else { 'Yellow' })
    
    Write-Host "`n  Question-by-Question Results:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $batchResult.comparisons.Count; $i++) {
        $comp = $batchResult.comparisons[$i]
        Write-Host "`n  [$($i + 1)] $($comp.question)" -ForegroundColor White
        Write-Host "      Basic: $($comp.metrics.basicLength) chars | Enhanced: $($comp.metrics.enhancedLength) chars" -ForegroundColor Gray
        Write-Host "      Improvement: $($comp.metrics.improvementRatio.ToString('F2'))x" -ForegroundColor $(if ($comp.metrics.improvementRatio -gt 1) { 'Green' } else { 'Yellow' })
    }
    
} catch {
    Write-Host "✗ Batch comparison failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Evaluation Summary
Write-Host "`n=== Evaluation Summary ===" -ForegroundColor Cyan
Write-Host @"

Key Improvements to Evaluate:

1. Response Specificity and Detail
   - Does LLM-enhanced RAG provide more concrete examples?
   - Are metrics and quantifiable results included?

2. Interview Relevance and Presentation
   - Does the response use STAR format (Situation-Task-Action-Result)?
   - Is the tone confident and natural for an interview setting?

3. Use of Concrete Examples
   - Are specific projects, technologies, and achievements mentioned?
   - Do examples demonstrate unique value and differentiators?

4. Natural Flow and Confidence Building
   - Does the response sound like a confident professional speaking?
   - Is the phrasing natural and conversational?

5. Processing Time and Reliability
   - Is the LLM enhancement worth the additional processing time?
   - Are both approaches reliable and consistent?

"@ -ForegroundColor Gray

Write-Host "`nTo test interactively:" -ForegroundColor Yellow
Write-Host "1. Visit http://localhost:3000/enhanced-chat" -ForegroundColor Gray
Write-Host "2. Toggle between 'Enhanced RAG' and 'Simple' mode" -ForegroundColor Gray
Write-Host "3. Ask the same question in both modes and compare" -ForegroundColor Gray

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
