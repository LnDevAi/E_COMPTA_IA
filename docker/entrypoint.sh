#!/bin/sh

# ===================================================
# ENTRYPOINT SCRIPT - E-COMPTA-IA
# Configuration dynamique à l'exécution
# ===================================================

set -e

echo "🚀 Démarrage E-COMPTA-IA..."
echo "📅 Date: $(date)"
echo "🌍 Timezone: $TZ"
echo "👤 User: $(whoami)"

# ===================================================
# CONFIGURATION DYNAMIQUE
# ===================================================

# Remplacement des variables d'environnement dans les fichiers de configuration
if [ -f "/usr/share/nginx/html/assets/config/config.js" ]; then
    echo "🔧 Configuration des variables d'environnement..."
    
    # Remplacer les placeholders par les vraies valeurs
    sed -i "s|{{API_URL}}|${API_URL:-http://localhost:3000}|g" /usr/share/nginx/html/assets/config/config.js
    sed -i "s|{{APP_ENV}}|${APP_ENV:-production}|g" /usr/share/nginx/html/assets/config/config.js
    sed -i "s|{{OPENAI_API_URL}}|${OPENAI_API_URL:-https://api.openai.com}|g" /usr/share/nginx/html/assets/config/config.js
    
    echo "✅ Variables d'environnement configurées"
else
    echo "⚠️  Fichier de configuration non trouvé, utilisation des valeurs par défaut"
fi

# ===================================================
# CONFIGURATION NGINX DYNAMIQUE
# ===================================================

# Configuration du backend dans nginx si URL fournie
if [ -n "$BACKEND_URL" ]; then
    echo "🔗 Configuration du proxy backend: $BACKEND_URL"
    
    # Décommenter et configurer les directives proxy dans nginx
    sed -i "s|# proxy_pass http://backend-service:3000;|proxy_pass $BACKEND_URL;|g" /etc/nginx/conf.d/default.conf
    sed -i "s|return 404;|# return 404; # Backend configuré|g" /etc/nginx/conf.d/default.conf
fi

# Configuration du service d'authentification
if [ -n "$AUTH_SERVICE_URL" ]; then
    echo "🔐 Configuration du service d'authentification: $AUTH_SERVICE_URL"
    
    sed -i "s|# proxy_pass http://auth-service:3001;|proxy_pass $AUTH_SERVICE_URL;|g" /etc/nginx/conf.d/default.conf
fi

# ===================================================
# VÉRIFICATIONS DE SANTÉ
# ===================================================

# Vérifier que les fichiers essentiels existent
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    echo "❌ ERREUR: index.html non trouvé!"
    exit 1
fi

# Vérifier les permissions
echo "📋 Vérification des permissions..."
ls -la /usr/share/nginx/html/ | head -5

# Test de la configuration nginx
echo "🧪 Test de la configuration nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration nginx valide"
else
    echo "❌ Configuration nginx invalide!"
    exit 1
fi

# ===================================================
# INFORMATIONS DE DÉMARRAGE
# ===================================================

echo ""
echo "🎯 E-COMPTA-IA prêt à démarrer!"
echo "📊 Configuration:"
echo "   - App Environment: ${APP_ENV:-production}"
echo "   - API URL: ${API_URL:-http://localhost:3000}"
echo "   - Backend URL: ${BACKEND_URL:-non configuré}"
echo "   - Auth Service: ${AUTH_SERVICE_URL:-non configuré}"
echo "   - Timezone: $TZ"
echo ""
echo "🌐 Application disponible sur: http://localhost:80"
echo "💚 Health check: http://localhost:80/health"
echo ""

# ===================================================
# DÉMARRAGE DE L'APPLICATION
# ===================================================

echo "🚀 Démarrage de nginx..."
exec "$@"