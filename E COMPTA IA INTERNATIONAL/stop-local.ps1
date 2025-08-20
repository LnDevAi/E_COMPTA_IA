# Script d'arrêt des services locaux
Write-Host "=== ARRÊT DES SERVICES LOCAUX ===" -ForegroundColor Red

# Arrêter les processus Java (backend)
Write-Host "Arrêt des processus Java..." -ForegroundColor Yellow
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    $javaProcesses | Stop-Process -Force
    Write-Host "Processus Java arrêtés" -ForegroundColor Green
} else {
    Write-Host "Aucun processus Java trouvé" -ForegroundColor Yellow
}

# Arrêter les processus Node.js (frontend)
Write-Host "Arrêt des processus Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "Processus Node.js arrêtés" -ForegroundColor Green
} else {
    Write-Host "Aucun processus Node.js trouvé" -ForegroundColor Yellow
}

# Arrêter les processus npm
Write-Host "Arrêt des processus npm..." -ForegroundColor Yellow
$npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue
if ($npmProcesses) {
    $npmProcesses | Stop-Process -Force
    Write-Host "Processus npm arrêtés" -ForegroundColor Green
} else {
    Write-Host "Aucun processus npm trouvé" -ForegroundColor Yellow
}

Write-Host "=== SERVICES ARRÊTÉS ===" -ForegroundColor Green
