# Script de déploiement local pour E COMPTA IA INTERNATIONAL
Write-Host "=== DEPLOIEMENT LOCAL E COMPTA IA INTERNATIONAL ===" -ForegroundColor Green

# Vérifier les prérequis
Write-Host "Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier Java
try {
    $javaVersion = java -version 2>&1
    Write-Host "Java détecté: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Java non trouvé!" -ForegroundColor Red
    exit 1
}

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Node.js non trouvé!" -ForegroundColor Red
    exit 1
}

# Vérifier npm
try {
    $npmVersion = npm --version
    Write-Host "npm détecté: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: npm non trouvé!" -ForegroundColor Red
    exit 1
}

Write-Host "Tous les prérequis sont OK!" -ForegroundColor Green

# Démarrer le frontend
Write-Host "Démarrage du frontend Angular..." -ForegroundColor Yellow
Set-Location "frontend"
Start-Process -FilePath "cmd" -ArgumentList "/c npm start" -WindowStyle Minimized
Set-Location ".."

Write-Host "Frontend démarré sur http://localhost:4200" -ForegroundColor Green

# Démarrer le backend
Write-Host "Démarrage du backend Spring Boot..." -ForegroundColor Yellow
Set-Location "backend-java"

# Essayer de compiler avec Maven si disponible
try {
    Write-Host "Tentative de compilation avec Maven..." -ForegroundColor Yellow
    mvn clean compile -DskipTests
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Compilation réussie!" -ForegroundColor Green
        Start-Process -FilePath "cmd" -ArgumentList "/c mvn spring-boot:run" -WindowStyle Minimized
    } else {
        throw "Compilation échouée"
    }
} catch {
    Write-Host "Maven non disponible ou compilation échouée. Tentative avec JAR existant..." -ForegroundColor Yellow
    
    # Chercher un JAR existant
    $jarFile = Get-ChildItem -Path "target" -Filter "*.jar" -Recurse | Select-Object -First 1
    if ($jarFile) {
        Write-Host "JAR trouvé: $($jarFile.FullName)" -ForegroundColor Green
        Start-Process -FilePath "cmd" -ArgumentList "/c java -jar $($jarFile.FullName)" -WindowStyle Minimized
    } else {
        Write-Host "Aucun JAR trouvé. Le backend ne peut pas démarrer." -ForegroundColor Red
        Write-Host "Veuillez installer Maven ou compiler le projet manuellement." -ForegroundColor Yellow
    }
}

Set-Location ".."

Write-Host "=== DEPLOIEMENT TERMINÉ ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:4200" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "API Health: http://localhost:8080/api/health" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "Les services tournent dans des fenêtres séparées." -ForegroundColor Yellow
Write-Host "Utilisez le script stop-local.ps1 pour arrêter les services." -ForegroundColor Yellow
