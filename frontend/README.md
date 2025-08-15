# E-COMPTA-IA VPS Deployment

## Backend (Node.js Express)

- Path: `backend/`
- Start: `cd backend && npm ci && npm start`
- API listens on `:3000` by default; reverse-proxy `/api/*` to it.

## Frontend (Angular)

- Build: `npm ci && npm run build`
- Serve `dist/` via Nginx:

```
server {
  listen 80;
  server_name your_domain;

  root /var/www/e-compta-ia/dist/e-compta-ia/browser;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

- Ensure hash routing is enabled (already set in Angular `RouterModule.forRoot(..., { useHash: true })`).