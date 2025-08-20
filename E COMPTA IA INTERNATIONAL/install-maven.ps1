# Script d'installation automatique de Maven
Write-Host "=== INSTALLATION AUTOMATIQUE DE MAVEN ===" -ForegroundColor Green

# Vérifier si Maven est déjà installé
try {
    $mavenVersion = mvn -version 2>&1
    Write-Host "Maven est déjà installé: $mavenVersion" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "Maven n'est pas installé. Installation en cours..." -ForegroundColor Yellow
}

# Créer le dossier d'installation
$mavenDir = "$env:USERPROFILE\maven"
if (!(Test-Path $mavenDir)) {
    New-Item -ItemType Directory -Path $mavenDir -Force
}

# URL de téléchargement de Maven
$mavenUrl = "https://archive.apache.org/dist/maven/maven-3/3.9.5/binaries/apache-maven-3.9.5-bin.zip"
$zipPath = "$env:TEMP\maven.zip"

Write-Host "Téléchargement de Maven 3.9.5..." -ForegroundColor Yellow

# Télécharger Maven
try {
    Invoke-WebRequest -Uri $mavenUrl -OutFile $zipPath
    Write-Host "Téléchargement terminé" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors du téléchargement: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Extraire Maven
Write-Host "Extraction de Maven..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $zipPath -DestinationPath $env:TEMP -Force
    Copy-Item -Path "$env:TEMP\apache-maven-3.9.5\*" -Destination $mavenDir -Recurse -Force
    Write-Host "Extraction terminée" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de l'extraction: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Nettoyer les fichiers temporaires
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item "$env:TEMP\apache-maven-3.9.5" -Recurse -Force -ErrorAction SilentlyContinue

# Ajouter Maven au PATH pour cette session
$env:PATH = "$mavenDir\bin;$env:PATH"

Write-Host "Maven installé avec succès!" -ForegroundColor Green
Write-Host "Pour l'ajouter définitivement au PATH, ajoutez '$mavenDir\bin' à vos variables d'environnement." -ForegroundColor Yellow

# Tester l'installation
try {
    $mavenVersion = mvn -version 2>&1
    Write-Host "Test de Maven: $mavenVersion" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors du test de Maven" -ForegroundColor Red
    exit 1
}

