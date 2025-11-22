# Advanced RAG Testing Script
# Tests query enhancement and interview formatting features

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Advanced RAG Optimization Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$vercelUrl = "https://my-digital-twin-m79j.vercel.app"

# Test questions to validate advanced features
$testQuestions = @(
    @{
        question = "Tell me about Python"
        purpose = "Simple query - should be enhanced to 'Python development, Python frameworks'"
    },
    @{
        question = "What projects have you built?"
        purpose = "STAR format test - should structure response with Situation, Task, Action, Result"
    },
    @{
        question = "Describe your experience with FastAPI"
        purpose = "Technical skills - should include specific metrics (10+ APIs built)"
    },
    @{
        question = "How did you improve deployment times?"
        purpose = "Achievement-focused - should mention 60% reduction in deployment time"
    }
)

Write-Host "Testing Vercel Production Deployment..." -ForegroundColor Yellow
Write-Host "URL: $vercelUrl/api/rag" -ForegroundColor Gray
Write-Host ""

foreach ($test in $testQuestions) {
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    Write-Host "Question: $($test.question)" -ForegroundColor White
    Write-Host "Expected: $($test.purpose)" -ForegroundColor Gray
    Write-Host ""
    
    $body = @{
        question = $test.question
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$vercelUrl/api/rag" -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -TimeoutSec 30
        
        Write-Host "Response:" -ForegroundColor Green
        Write-Host $response.answer -ForegroundColor White
        Write-Host ""
        
        # Check for advanced features
        $answer = $response.answer
        $hasMetrics = $answer -match '\d+[\+%]'  # Look for numbers with + or %
        $hasFirstPerson = $answer -match '\b(I|my|we)\b'
        $isDetailed = $answer.Length -gt 200
        
        Write-Host "Quality Checks:" -ForegroundColor Yellow
        Write-Host "  ✓ Contains metrics: $hasMetrics" -ForegroundColor $(if($hasMetrics){"Green"}else{"Red"})
        Write-Host "  ✓ First person: $hasFirstPerson" -ForegroundColor $(if($hasFirstPerson){"Green"}else{"Red"})
        Write-Host "  ✓ Detailed response: $isDetailed" -ForegroundColor $(if($isDetailed){"Green"}else{"Red"})
        Write-Host "  ✓ Length: $($answer.Length) characters" -ForegroundColor Gray
        Write-Host ""
        
    } catch {
        Write-Host "Error:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
    }
    
    Start-Sleep -Seconds 2  # Rate limiting
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Health Endpoint..." -ForegroundColor Yellow
Write-Host ""

try {
    $health = Invoke-RestMethod -Uri "$vercelUrl/api/rag" -Method GET
    Write-Host "Status: $($health.status)" -ForegroundColor Green
    Write-Host "Service: $($health.service)" -ForegroundColor Green
    Write-Host "Features: $($health.features -join ', ')" -ForegroundColor Green
    Write-Host "Groq Configured: $($health.groq_configured)" -ForegroundColor Green
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Suite Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
