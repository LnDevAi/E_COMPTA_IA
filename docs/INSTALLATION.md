# 📦 **GUIDE D'INSTALLATION E-COMPTA-IA**

## **Installation Complète et Configuration**

---

## 📋 **PRÉREQUIS SYSTÈME**

### **💻 Environnement de Développement**

- **Node.js** : Version 18.0.0+ (LTS recommandée)
- **npm** : Version 9.0.0+ (inclus avec Node.js)
- **Angular CLI** : Version 20.0.0+
- **Git** : Version 2.30+
- **IDE Recommandé** : VS Code avec extensions Angular

### **🖥️ Spécifications Système Minimales**

- **RAM** : 8 GB minimum (16 GB recommandé)
- **Disque** : 10 GB d'espace libre
- **OS** : Windows 10+, macOS 10.15+, Linux Ubuntu 18.04+
- **Processeur** : Intel i5 ou équivalent AMD

### **🌐 Navigateurs Supportés**

- **Chrome** : Version 90+
- **Firefox** : Version 88+
- **Safari** : Version 14+
- **Edge** : Version 90+

---

## 🚀 **INSTALLATION RAPIDE (5 MINUTES)**

### **1️⃣ Clonage du Repository**

```bash
# Cloner le projet
git clone https://github.com/LnDevAi/E_COMPTA_IA.git

# Aller dans le dossier
cd E_COMPTA_IA

# Vérifier la structure
ls -la
```

### **2️⃣ Installation des Dépendances**

```bash
# Installer les dépendances Node.js
npm install

# Vérifier l'installation
npm list --depth=0
```

### **3️⃣ Configuration Initiale**

```bash
# Copier le fichier d'environnement
cp src/environments/environment.example.ts src/environments/environment.ts

# Éditer la configuration (optionnel pour le développement)
# nano src/environments/environment.ts
```

### **4️⃣ Démarrage de l'Application**

```bash
# Démarrer le serveur de développement
npm start

# Ou avec ng serve directement
ng serve --open
```

🎉 **L'application sera accessible sur http://localhost:4200**

---

## 🔧 **INSTALLATION DÉTAILLÉE**

### **📥 Installation de Node.js**

#### **Windows**
```powershell
# Télécharger depuis https://nodejs.org
# Ou utiliser Chocolatey
choco install nodejs

# Vérifier l'installation
node --version
npm --version
```

#### **macOS**
```bash
# Utiliser Homebrew
brew install node

# Ou télécharger depuis https://nodejs.org
# Vérifier l'installation
node --version
npm --version
```

#### **Linux (Ubuntu/Debian)**
```bash
# Via apt (peut être une version ancienne)
sudo apt update
sudo apt install nodejs npm

# Ou via NodeSource pour la dernière version
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

### **⚡ Installation d'Angular CLI**

```bash
# Installation globale d'Angular CLI
npm install -g @angular/cli@20

# Vérifier l'installation
ng version

# Mettre à jour si nécessaire
npm update -g @angular/cli
```

### **📂 Configuration du Projet**

#### **Structure des Dossiers**
```
E_COMPTA_IA/
├── 📁 src/
│   ├── 📁 app/
│   ├── 📁 assets/
│   └── 📁 environments/
├── 📁 docs/
├── 📁 scripts/
├── 📄 package.json
├── 📄 angular.json
└── 📄 README.md
```

#### **Variables d'Environnement**

Créez `src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  
  // Configuration de base
  appConfig: {
    name: 'E-COMPTA-IA',
    version: '1.0.0',
    defaultLanguage: 'fr',
    defaultCountry: 'BF'
  },
  
  // Configuration IA
  aiConfig: {
    enabled: true,
    apiKey: 'your-ai-api-key', // Remplacer par votre clé
    model: 'gpt-4',
    maxTokens: 4000,
    temperature: 0.7
  },
  
  // Configuration OHADA
  ohadaConfig: {
    defaultCountry: 'BF', // BF, CI, SN, CM, GA, etc.
    fiscalYear: 'calendar', // calendar | custom
    currency: 'XOF',
    planComptable: 'SYSCOHADA_2017'
  },
  
  // Configuration sécurité
  security: {
    jwtSecret: 'your-super-secret-jwt-key',
    sessionTimeout: 3600000, // 1 heure en ms
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 8,
      requireNumbers: true,
      requireSpecialChars: true,
      requireUppercase: true
    }
  },
  
  // Configuration de développement
  development: {
    enableDebugMode: true,
    showPerformanceMetrics: true,
    mockData: true,
    autoLogin: false
  }
};
```

---

## 🐳 **INSTALLATION DOCKER**

### **🔧 Prérequis Docker**

```bash
# Installer Docker
# Windows/Mac: Docker Desktop
# Linux: Docker Engine

# Vérifier Docker
docker --version
docker-compose --version
```

### **🚀 Déploiement avec Docker Compose**

```bash
# Build et démarrage des conteneurs
docker-compose up -d

# Vérifier les conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f

# Arrêter les conteneurs
docker-compose down
```

### **📋 Configuration Docker**

Le fichier `docker-compose.yml` inclut :
- **Frontend** : Application Angular
- **Nginx** : Reverse proxy et serveur web
- **Base de données** : PostgreSQL (optionnel)
- **Redis** : Cache et sessions (optionnel)

---

## ⚙️ **CONFIGURATION AVANCÉE**

### **🔗 Configuration API Backend**

Si vous avez un backend séparé :

```typescript
// src/environments/environment.ts
export const environment = {
  // ... autres configurations
  
  api: {
    baseUrl: 'https://api.e-compta-ia.com',
    timeout: 30000,
    retryAttempts: 3,
    endpoints: {
      auth: '/auth',
      users: '/users',
      companies: '/companies',
      accounting: '/accounting',
      ai: '/ai'
    }
  }
};
```

### **🎨 Configuration du Thème**

```typescript
// src/environments/environment.ts
export const environment = {
  // ... autres configurations
  
  theme: {
    primary: '#1976d2',
    secondary: '#424242',
    accent: '#82B1FF',
    warn: '#f44336',
    darkMode: false,
    customCss: '/assets/themes/custom.css'
  }
};
```

### **📊 Configuration Analytics**

```typescript
// src/environments/environment.ts
export const environment = {
  // ... autres configurations
  
  analytics: {
    enabled: true,
    googleAnalytics: 'GA-XXXXXXXXX',
    hotjar: 'HJ-XXXXXXX',
    mixpanel: 'MP-XXXXXXX'
  }
};
```

---

## 🔍 **VÉRIFICATION DE L'INSTALLATION**

### **✅ Tests de Vérification**

```bash
# 1. Vérifier que l'application démarre
npm start

# 2. Vérifier la compilation
npm run build

# 3. Lancer les tests unitaires
npm test

# 4. Vérifier le linting
npm run lint

# 5. Vérifier la structure du projet
ng build --prod
```

### **🌐 Test dans le Navigateur**

1. **Ouvrir** http://localhost:4200
2. **Vérifier** que la page de connexion s'affiche
3. **Tester** la navigation entre les modules
4. **Vérifier** la console (F12) pour les erreurs

### **📊 Métriques de Performance**

```bash
# Analyser la taille du bundle
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/e-compta-ia/stats.json

# Audit de sécurité
npm audit

# Audit automatisé
npm audit fix
```

---

## 🛠️ **DÉPANNAGE**

### **❌ Problèmes Courants**

#### **Erreur : "ng: command not found"**
```bash
# Solution
npm install -g @angular/cli
# Ou redémarrer le terminal
```

#### **Erreur : "Cannot resolve dependency"**
```bash
# Solution
rm -rf node_modules package-lock.json
npm install
```

#### **Erreur : "Port 4200 already in use"**
```bash
# Solution 1: Utiliser un autre port
ng serve --port 4201

# Solution 2: Tuer le processus
lsof -ti:4200 | xargs kill -9
```

#### **Erreur : "Memory heap limit"**
```bash
# Solution: Augmenter la mémoire Node.js
node --max-old-space-size=8192 node_modules/@angular/cli/bin/ng serve
```

### **🔧 Outils de Debug**

```bash
# Mode debug avancé
ng serve --source-map --verbose

# Profiling de build
ng build --stats-json

# Analyse des modules
ng build --named-chunks
```

---

## 🔄 **MISE À JOUR**

### **📈 Mise à Jour de l'Application**

```bash
# Récupérer les dernières modifications
git pull origin main

# Mettre à jour les dépendances
npm update

# Redémarrer l'application
npm start
```

### **⬆️ Mise à Jour d'Angular**

```bash
# Mise à jour Angular CLI
npm update -g @angular/cli

# Mise à jour du projet Angular
ng update @angular/core @angular/cli

# Mise à jour Angular Material
ng update @angular/material
```

---

## 🌍 **DÉPLOIEMENT PRODUCTION**

### **🏗️ Build de Production**

```bash
# Build optimisé pour la production
npm run build --prod

# Vérifier la taille du build
ls -lh dist/e-compta-ia/

# Test du build en local
npx http-server dist/e-compta-ia -p 8080
```

### **🚀 Déploiement sur Serveur**

```bash
# Copier les fichiers sur le serveur
scp -r dist/e-compta-ia/* user@server:/var/www/html/

# Ou utiliser rsync
rsync -avz dist/e-compta-ia/ user@server:/var/www/html/
```

### **☁️ Déploiement Cloud**

#### **Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
npm run build --prod
netlify deploy --prod --dir=dist/e-compta-ia
```

#### **Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run build --prod
vercel --prod
```

---

## 📞 **SUPPORT INSTALLATION**

### **🆘 Besoin d'Aide ?**

- 📖 **Documentation** : [docs.e-compta-ia.com](https://docs.e-compta-ia.com)
- 🐛 **Issues GitHub** : [GitHub Issues](https://github.com/LnDevAi/E_COMPTA_IA/issues)
- 💬 **Discord** : [Communauté E-COMPTA-IA](https://discord.gg/e-compta-ia)
- 📧 **Email** : support@e-compta-ia.com

### **✅ Checklist d'Installation Réussie**

- [ ] Node.js 18+ installé
- [ ] Angular CLI 20+ installé
- [ ] Repository cloné
- [ ] Dépendances installées sans erreur
- [ ] Application démarre sur localhost:4200
- [ ] Aucune erreur dans la console
- [ ] Navigation entre modules fonctionnelle
- [ ] Build de production réussi

---

**🎉 Félicitations ! E-COMPTA-IA est maintenant installé et prêt à révolutionner votre comptabilité !**