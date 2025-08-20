# Déploiement Local - E COMPTA IA INTERNATIONAL

Prérequis: Docker(+Compose), Node.js 18+, npm, Maven 3.9+, JDK 17.

Commandes principales:
```bash
cd "E COMPTA IA INTERNATIONAL"
bash deploy-local.sh up      # build + up
bash deploy-local.sh logs    # logs
bash deploy-local.sh down    # stop
```

URLs (selon `vps/.env`):
- Web: http://localhost:<ECOMPTA_WEB_PORT>/
- Swagger: http://localhost:<ECOMPTA_WEB_PORT>/swagger-ui/
- API: http://localhost:<ECOMPTA_API_PORT>/api/health

Détails:
- Le build Angular est copié vers `vps/frontend/e-compta-ia/` et servi par Nginx.
- Le backend Java est buildé et lancé via `vps/docker-compose.yml`.
- `vps/setup.sh` génère `.env` avec des ports libres si nécessaire.

