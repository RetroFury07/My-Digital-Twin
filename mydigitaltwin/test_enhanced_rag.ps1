# Enhanced RAG Pipeline Test Script
# Tests query enhancement, vector search, and interview formatting

Write-Host "`n=== Enhanced RAG Pipeline Tests ===" -ForegroundColor Cyan
Write-Host "Testing localhost:3000/api/enhanced-rag`n" -ForegroundColor Yellow

# Test 1: Health Check
Write-Host "[Test 1] Health Check..." -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/enhanced-rag" -Method GET
    Write-Host "✓ Status: $($health.status)" -ForegroundColor Green
    Write-Host "  Service: $($health.service)" -ForegroundColor Gray
    Write-Host "  Query Model: $($health.models.queryEnhancement)" -ForegroundColor Gray
    Write-Host "  Response Model: $($health.models.responseFormatting)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Project Experience Question
Write-Host "`n[Test 2] Testing: 'Tell me about your FastAPI projects'..." -ForegroundColor Green
try {
    $body = @{
        question = "Tell me about your FastAPI projects"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/enhanced-rag" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "`n  Original Query:" -ForegroundColor Yellow
    Write-Host "  $($response.question)" -ForegroundColor Gray
    Write-Host "`n  Enhanced Query:" -ForegroundColor Yellow
    Write-Host "  $($response.enhancedQuery)" -ForegroundColor Gray
    Write-Host "`n  Interview Response:" -ForegroundColor Yellow
    Write-Host "  $($response.answer)" -ForegroundColor Gray
    Write-Host "`n  Metadata:" -ForegroundColor Yellow
    Write-Host "  - Query Enhanced: $($response.metadata.queryEnhanced)" -ForegroundColor Gray
    Write-Host "  - Response Formatted: $($response.metadata.responseFormatted)" -ForegroundColor Gray
    Write-Host "  - Results Found: $($response.metadata.resultCount)" -ForegroundColor Gray
    Write-Host "  - Processing Time: $($response.metadata.processingTime)ms" -ForegroundColor Gray
} catch {
    Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Technical Skills Question
Write-Host "`n[Test 3] Testing: 'What's your Python experience?'..." -ForegroundColor Green
try {
    $body = @{
        question = "What's your Python experience?"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/enhanced-rag" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "`n  Enhanced Query:" -ForegroundColor Yellow
    Write-Host "  $($response.enhancedQuery)" -ForegroundColor Gray
    Write-Host "`n  Interview Response (first 200 chars):" -ForegroundColor Yellow
    Write-Host "  $($response.answer.Substring(0, [Math]::Min(200, $response.answer.Length)))..." -ForegroundColor Gray
    Write-Host "`n  Processing Time: $($response.metadata.processingTime)ms" -ForegroundColor Gray
} catch {
    Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Database Skills Question
Write-Host "`n[Test 4] Testing: 'Tell me about your database experience'..." -ForegroundColor Green
try {
    $body = @{
        question = "Tell me about your database experience"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/enhanced-rag" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "`n  Enhanced Terms Added:" -ForegroundColor Yellow
    $original = $response.question.ToLower().Split()
    $enhanced = $response.enhancedQuery.ToLower().Split()
    $newTerms = $enhanced | Where-Object { $original -notcontains $_ } | Select-Object -First 10
    Write-Host "  $($newTerms -join ', ')" -ForegroundColor Gray
    Write-Host "`n  Results Found: $($response.metadata.resultCount)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Cyan
Write-Host "`nTo test interactively, visit: http://localhost:3000/enhanced-chat" -ForegroundColor Yellow
