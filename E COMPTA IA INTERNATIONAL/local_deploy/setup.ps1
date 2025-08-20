# Script de configuration pour le déploiement Docker local
Write-Host "=== CONFIGURATION DOCKER LOCAL ===" -ForegroundColor Green

# Vérifier si le fichier .env existe déjà
if (Test-Path ".env") {
    Write-Host "Fichier .env existant trouvé" -ForegroundColor Yellow
    Get-Content ".env" | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    exit 0
}

# Fonction pour vérifier si un port est libre
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $false  # Port occupé
    } catch {
        return $true   # Port libre
    }
}

# Fonction pour trouver un port libre
function Find-FreePort {
    param([int]$StartPort, [int]$EndPort)
    for ($port = $StartPort; $port -le $EndPort; $port++) {
        if (Test-Port -Port $port) {
            return $port
        }
    }
    return $StartPort  # Fallback
}

# Déterminer les ports
$apiPort = Find-FreePort -StartPort 18080 -EndPort 18999
$webPort = Find-FreePort -StartPort 18000 -EndPort 18079

# Créer le fichier .env
$envContent = @"
ECOMPTA_API_PORT=$apiPort
ECOMPTA_WEB_PORT=$webPort
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "Fichier .env créé avec:" -ForegroundColor Green
Write-Host "  API Port: $apiPort" -ForegroundColor Cyan
Write-Host "  Web Port: $webPort" -ForegroundColor Cyan

