# Script de déploiement Docker pour E COMPTA IA INTERNATIONAL
Write-Host "=== DÉPLOIEMENT DOCKER E COMPTA IA INTERNATIONAL ===" -ForegroundColor Green

# Vérifier Docker
try {
    $dockerVersion = docker --version
    Write-Host "Docker détecté: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Docker non trouvé!" -ForegroundColor Red
    exit 1
}

# Vérifier Docker Compose
try {
    $composeVersion = docker compose version
    Write-Host "Docker Compose détecté: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Docker Compose non trouvé!" -ForegroundColor Red
    exit 1
}

# Configuration de l'environnement
Write-Host "Configuration de l'environnement..." -ForegroundColor Yellow
& ".\setup.ps1"

# Build du frontend
Write-Host "Build du frontend Angular..." -ForegroundColor Yellow
Set-Location "..\frontend"
npm install
npm run build
Set-Location "..\local_deploy"

# Copier le build frontend vers le dossier servi par Nginx
Write-Host "Copie du build frontend..." -ForegroundColor Yellow
$targetDir = "frontend\e-compta-ia"
if (Test-Path $targetDir) {
    Remove-Item "$targetDir\*" -Recurse -Force
} else {
    New-Item -ItemType Directory -Path $targetDir -Force
}
Copy-Item "..\frontend\dist\e-compta-ia\*" -Destination $targetDir -Recurse -Force

# Build et démarrage des services Docker
Write-Host "Build et démarrage des services Docker..." -ForegroundColor Yellow
docker compose down
docker compose up --build -d

Write-Host "=== DÉPLOIEMENT DOCKER TERMINÉ ===" -ForegroundColor Green

# Afficher les URLs
$envContent = Get-Content ".env" | ForEach-Object { if ($_ -match "=") { $_.Split("=") } }
$apiPort = ($envContent | Where-Object { $_[0] -eq "ECOMPTA_API_PORT" })[1]
$webPort = ($envContent | Where-Object { $_[0] -eq "ECOMPTA_WEB_PORT" })[1]

Write-Host "Frontend: http://localhost:$webPort" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:$apiPort" -ForegroundColor Cyan
Write-Host "API Health: http://localhost:$apiPort/api/health" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "Utilisez 'docker compose logs -f' pour voir les logs" -ForegroundColor Yellow
Write-Host "Utilisez 'docker compose down' pour arrêter les services" -ForegroundColor Yellow

