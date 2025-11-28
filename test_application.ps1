# PolyMathOS Application Test Script
# Tests all major flows and endpoints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PolyMathOS Application Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow -NoNewline
    Write-Host " ($Method $Url)" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 5
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "  ✓ PASSED" -ForegroundColor Green
        $script:passed++
        return $true
    } catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $script:errors += "$Name`: $($_.Exception.Message)"
        $script:failed++
        return $false
    }
}

Write-Host "=== Backend API Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test Backend Root
Test-Endpoint "Backend Root" "http://localhost:8000/"

# Test System Status
Test-Endpoint "System Status" "http://localhost:8000/system/status"

# Test Integration Status
Test-Endpoint "Integration Status" "http://localhost:8000/integrations/status"

# Test API Documentation
Test-Endpoint "API Docs" "http://localhost:8000/docs"

Write-Host ""
Write-Host "=== Frontend Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test Frontend
Test-Endpoint "Frontend Root" "http://localhost:3000"

Write-Host ""
Write-Host "=== Integration Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test Initialize Integrations
$initBody = @{}
Test-Endpoint "Initialize Integrations" "http://localhost:8000/integrations/initialize" "POST" $initBody

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "Errors:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Manual Testing Checklist ===" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000 in browser" -ForegroundColor White
Write-Host "2. Test Sign Up flow" -ForegroundColor White
Write-Host "3. Test Sign In flow" -ForegroundColor White
Write-Host "4. Test Dashboard navigation" -ForegroundColor White
Write-Host "5. Test Learning Session" -ForegroundColor White
Write-Host "6. Test Polymath Dashboard" -ForegroundColor White
Write-Host "7. Check PolyMathOS logo alignment in header" -ForegroundColor White
Write-Host ""

