# Déploiement VPS E-COMPTA-IA

- Backend Java (Spring Boot): conteneur `api` (port interne 8080)
- Nginx: conteneur `web` (port interne 80)
- Proxy API: `/api/*` → `api:8080`
- Swagger UI: `http://{IP}/swagger-ui/`

## Préparation

1) Copier le dossier `E COMPTA IA INTERNATIONAL/vps/` sur le VPS (MobaXterm/SFTP)
2) Placer le build Angular dans `vps/frontend/e-compta-ia/`
3) Choisir les ports via `.env` (facultatif). Exemple:
```
ECOMPTA_API_PORT=18080
ECOMPTA_WEB_PORT=18081
```
4) Démarrer:
```
cd vps
# teste et choisit des ports libres si non définis
bash setup.sh
# lance les conteneurs
docker compose up -d --build
```

## Ports déjà utilisés
- Les ports hôtes sont configurables via `.env` (voir ci-dessus).
- Le script `setup.sh` détecte des ports libres si variables absentes.

## Mises à jour
```
cd vps
docker compose pull || true
docker compose build --no-cache api
docker compose up -d
```