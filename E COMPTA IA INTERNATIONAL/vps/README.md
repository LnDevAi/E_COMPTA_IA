# Déploiement VPS (tout-en-un)

Prérequis: Docker + Docker Compose sur le VPS.

1) Copier le dossier `vps/` ainsi que `backend/` sur le VPS (ou cloner le repo)

2) Construire le frontend en local et placer le build
- `npm ci && npm run build`
- Copier `dist/` dans `vps/frontend/` (déjà préparé si vous avez lancé la build ici)

3) Lancer
```
cd vps
docker compose up -d --build
```

- Frontend: http://IP_VPS/
- API: http://IP_VPS/api/health (proxifié vers le conteneur api)

Volumes:
- Les données API sont persistées dans `backend/data` (monté dans le conteneur).

Ajustements:
- Modifier `vps/nginx.conf` si nécessaire (domaine, chemins)
- Le backend écoute sur 3000, Nginx sert le frontend et proxifie `/api/*` vers `api:3000`.