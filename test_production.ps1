# Production Readiness Test Script for Digital Twin
# This script tests all critical components of your deployed application

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   DIGITAL TWIN PRODUCTION TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "https://my-digital-twin-iovy-git-main-xevi-olivas-projects.vercel.app"
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "  URL: $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ PASS - Status: $($response.StatusCode)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ❌ FAIL - Status: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ❌ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test 1: Main Application
Write-Host "`n--- Test 1: Main Application ---" -ForegroundColor Cyan
if (Test-Endpoint -Name "Homepage" -Url $baseUrl) {
    $testsPassed++
} else {
    $testsFailed++
}

# Test 2: MCP Endpoint (GET - Health Check)
Write-Host "`n--- Test 2: MCP Health Check ---" -ForegroundColor Cyan
if (Test-Endpoint -Name "MCP GET endpoint" -Url "$baseUrl/api/mcp") {
    $testsPassed++
} else {
    $testsFailed++
}

# Test 3: MCP Endpoint (POST - Query)
Write-Host "`n--- Test 3: MCP Query Test ---" -ForegroundColor Cyan
$headers = @{
    "Content-Type" = "application/json"
}
$body = '{"query":"What are your skills?"}'

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/mcp" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    
    if ($response.response -or $response.answer) {
        Write-Host "  ✅ PASS - Received response: $($response.response -or $response.answer)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ❌ FAIL - No response field in JSON" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ❌ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 4: Python RAG Endpoint (Health Check)
Write-Host "`n--- Test 4: Python RAG Health Check ---" -ForegroundColor Cyan
if (Test-Endpoint -Name "RAG GET endpoint" -Url "$baseUrl/api/rag") {
    $testsPassed++
} else {
    $testsFailed++
}

# Test 5: Python RAG Endpoint (POST - Direct Query)
Write-Host "`n--- Test 5: RAG Direct Query Test ---" -ForegroundColor Cyan
$ragBody = '{"question":"Tell me about your experience"}'

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/rag" -Method Post -Headers $headers -Body $ragBody -ErrorAction Stop
    
    if ($response.answer) {
        Write-Host "  ✅ PASS - Received answer: $($response.answer)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ❌ FAIL - No answer field in JSON" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ❌ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "           TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host "✅ Passed: $testsPassed" -ForegroundColor Green
Write-Host "❌ Failed: $testsFailed" -ForegroundColor Red

if ($testsFailed -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! Production ready!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Check the details above." -ForegroundColor Yellow
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

# Environment Variables Check
Write-Host "--- Environment Variables Status ---" -ForegroundColor Cyan
Write-Host "⚠️  You need to verify in Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  2. Select your project" -ForegroundColor White
Write-Host "  3. Settings > Environment Variables" -ForegroundColor White
Write-Host "  4. Ensure GROQ_API_KEY is set for Production" -ForegroundColor White
Write-Host "`nRequired: GROQ_API_KEY" -ForegroundColor Cyan
Write-Host "Optional: UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN (if using vector DB)`n" -ForegroundColor Gray
