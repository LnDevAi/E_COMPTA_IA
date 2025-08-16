# Déploiement VPS E-COMPTA-IA

- Backend Java (Spring Boot): exposé sur 8080 dans le conteneur `api`, mappé en `8080:8080`.
- Nginx sert le frontend depuis `vps/frontend` (copiez votre build Angular dans `vps/frontend/e-compta-ia/`).
- Proxy API: `/api/*` → `api:8080`.
- Swagger UI: `http://{VOTRE_IP}/swagger-ui/` (via proxy Nginx).

## Démarrage

```
docker compose up -d --build
```

Placez le build Angular (fichiers `index.html`, `*.js`, `*.css`, assets) dans `vps/frontend/e-compta-ia/` avant de lancer.