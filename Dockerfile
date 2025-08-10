# ===================================================
# DOCKERFILE PRODUCTION - E-COMPTA-IA
# Architecture multi-stage pour optimisation
# ===================================================

# ===================================================
# STAGE 1: BUILD
# ===================================================
FROM node:18-alpine AS build

# Métadonnées
LABEL maintainer="E-COMPTA-IA Team"
LABEL description="Application comptable SYSCOHADA avec IA"
LABEL version="1.0.0"

# Variables d'environnement pour le build
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV ANGULAR_CLI_ANALYTICS=false

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances avec optimisations (inclure devDependencies pour build Angular)
RUN npm ci --legacy-peer-deps && \
    npm cache clean --force

# Copie du code source
COPY . .

# Build de production optimisé
RUN npm run build

# ===================================================
# STAGE 2: RUNTIME NGINX
# ===================================================
FROM nginx:1.25-alpine AS production

# Installation des dépendances système
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata

# Configuration timezone
ENV TZ=Africa/Ouagadougou
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copie de la configuration nginx optimisée
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers buildés depuis le stage précédent
COPY --from=build /app/dist/e-compta-ia/ /usr/share/nginx/html/

# Copie des scripts de démarrage
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Création utilisateur non-root pour sécurité
RUN adduser -D -s /bin/sh nginxuser && \
    chown -R nginxuser:nginxuser /usr/share/nginx/html && \
    chown -R nginxuser:nginxuser /var/cache/nginx && \
    chown -R nginxuser:nginxuser /var/log/nginx && \
    chown -R nginxuser:nginxuser /etc/nginx/conf.d

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Exposition du port
EXPOSE 80

# Utilisateur non-root
USER nginxuser

# Point d'entrée
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]