# Test Groq Integration in Enhanced RAG
# This tests the Step 3 implementation with Groq SDK

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Groq Integration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$nextUrl = "http://localhost:3000"

Write-Host "1. Testing Groq API Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$nextUrl/api/rag" -Method GET -TimeoutSec 10
    Write-Host "  Status: $($health.status)" -ForegroundColor Green
    Write-Host "  Service: $($health.service)" -ForegroundColor Green
    Write-Host "  Groq Available: $($health.groqAvailable)" -ForegroundColor $(if($health.groqAvailable){"Green"}else{"Red"})
    Write-Host ""
} catch {
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Make sure Next.js dev server is running on port 3000" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "2. Testing Query Enhancement (Groq Fast Model)..." -ForegroundColor Yellow
$testQuery = @{
    query = "Python"
    mode = "enhancement"
} | ConvertTo-Json

try {
    $enhanced = Invoke-RestMethod -Uri "$nextUrl/api/rag" -Method POST `
        -ContentType "application/json" `
        -Body $testQuery `
        -TimeoutSec 15
    
    Write-Host "  Original: Python" -ForegroundColor White
    Write-Host "  Enhanced: $($enhanced.answer)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "3. Testing Full Enhanced RAG Pipeline..." -ForegroundColor Yellow
$fullQuery = @{
    query = "Tell me about your FastAPI experience"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$nextUrl/api/rag" -Method POST `
        -ContentType "application/json" `
        -Body $fullQuery `
        -TimeoutSec 20
    
    Write-Host "  Original Query: $($response.originalQuery)" -ForegroundColor Gray
    Write-Host "  Enhanced Query: $($response.enhancedQuery)" -ForegroundColor Cyan
    Write-Host "  Results Found: $($response.resultsCount)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Interview-Ready Answer:" -ForegroundColor Yellow
    Write-Host "  $($response.answer)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Groq Models Used:" -ForegroundColor Yellow
Write-Host "  - Query Enhancement: llama-3.1-8b-instant (fast)" -ForegroundColor Gray
Write-Host "  - Interview Formatting: llama-3.1-70b-versatile (powerful)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Visit: http://localhost:3000/enhanced-chat" -ForegroundColor White
Write-Host "  2. Try asking technical interview questions" -ForegroundColor White
Write-Host "  3. Toggle debug mode to see query enhancements" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
