# PolyMathOS Server Startup Script
# Starts both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PolyMathOS Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is already running
$backendRunning = $false
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/" -Method Get -TimeoutSec 2 -ErrorAction Stop
    $backendRunning = $true
    Write-Host "✓ Backend server is already running" -ForegroundColor Green
} catch {
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    Start-Process python -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000" -WorkingDirectory "backend" -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

# Start frontend server
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process npm -ArgumentList "run", "dev" -WorkingDirectory "." -WindowStyle Hidden

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servers Starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please wait 10-15 seconds for servers to fully start" -ForegroundColor Yellow
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  🌐 Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "  🔧 Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "  📚 API Docs:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "  🔌 Integrations: http://localhost:8000/integrations/status" -ForegroundColor White
Write-Host ""

