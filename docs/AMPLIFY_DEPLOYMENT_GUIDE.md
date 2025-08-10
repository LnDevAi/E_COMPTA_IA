# 🚀 Guide de Déploiement AWS Amplify - E-COMPTA-IA

## 📋 Pourquoi AWS Amplify ?

**AWS Amplify** est le choix parfait pour E-COMPTA-IA car :

- ✅ **Déploiement simplifié** : Frontend + Backend + Base de données automatique
- ✅ **GraphQL API** : API moderne et type-safe pour Angular
- ✅ **Authentication** : Gestion utilisateurs intégrée avec Cognito
- ✅ **Hosting** : CDN global avec SSL automatique
- ✅ **CI/CD** : Déploiement automatique depuis GitHub
- ✅ **Coût réduit** : Serverless, vous payez seulement ce que vous utilisez

---

## 🎯 Architecture Amplify

```
Frontend (Angular) → GraphQL API → DynamoDB
        ↓              ↓           ↓
    CloudFront    AppSync     Database
        ↓              ↓           ↓
   Global CDN     Resolvers   NoSQL Storage
```

### **Services AWS Inclus**
- **Amplify Hosting** : CDN global + SSL automatique
- **AppSync** : API GraphQL managed
- **DynamoDB** : Base de données NoSQL serverless
- **Cognito** : Authentification et gestion utilisateurs
- **Lambda** : Fonctions serverless pour logique métier
- **S3** : Stockage de fichiers

---

## ⚙️ Étape 1 : Installation Amplify CLI

```bash
# Installer Amplify CLI
npm install -g @aws-amplify/cli

# Configurer avec vos credentials AWS
amplify configure
```

**Configuration interactive** :
1. Choisir la région : `us-west-2` (Oregon)
2. Créer un utilisateur IAM pour Amplify
3. Configurer les credentials

---

## 🚀 Étape 2 : Initialiser Amplify dans le Projet

```bash
# Dans le répertoire E-COMPTA-IA
cd /workspace

# Initialiser Amplify
amplify init
```

**Configuration recommandée** :
```
? Enter a name for the project: ecomptaia
? Initialize the project with the above configuration? Yes
? Select the authentication method you want to use: AWS profile
? Please choose the profile you want to use: default
```

---

## 📊 Étape 3 : Configurer l'API GraphQL

```bash
# Ajouter une API GraphQL
amplify add api
```

**Configuration** :
```
? Select from one of the below mentioned services: GraphQL
? Here is the GraphQL API that we will create. Select a setting to edit or continue: Continue
? Choose a schema template: Blank Schema
```

Ensuite, éditez le schéma dans `amplify/backend/api/ecomptaia/schema.graphql` avec notre schéma comptable complet.

---

## 🔐 Étape 4 : Configurer l'Authentification

```bash
# Ajouter l'authentification
amplify add auth
```

**Configuration** :
```
? Do you want to use the default authentication and security configuration? Manual configuration
? Select the authentication/authorization services that you want to use: User Sign-Up, Sign-In, connected with AWS IAM controls
? Please provide a friendly name for your resource that will be used to label this category in the project: ecomptaiaauth
? Please enter a name for your identity pool: ecomptaia_identitypool
? Allow unauthenticated logins? No
? Do you want to enable 3rd party authentication providers in your identity pool? No
? Please provide a name for your user pool: ecomptaia_userpool
? How do you want users to be able to sign in? Email
? Do you want to add User Pool Groups? Yes
? Provide a name for your user pool group: Administrators
? Do you want to add another User Pool Group? Yes
? Provide a name for your user pool group: Comptables
? Do you want to add another User Pool Group? No
```

---

## 💾 Étape 5 : Configurer le Stockage

```bash
# Ajouter stockage S3
amplify add storage
```

**Configuration** :
```
? Select from one of the below mentioned services: Content (Images, audio, video, etc.)
? Provide a friendly name for your resource that will be used to label this category in the project: ecomptaiastorage
? Provide bucket name: ecomptaia-storage
? Who should have access: Auth users only
? What kind of access do you want for Authenticated users? create/update, read, delete
```

---

## 🌐 Étape 6 : Configurer le Hosting

```bash
# Ajouter hosting
amplify add hosting
```

**Configuration** :
```
? Select the plugin module to execute: Amazon CloudFront and S3
? Select the environment setup: PROD (S3 with CloudFront using HTTPS)
? hosting bucket name: ecomptaia-hosting
```

---

## 🔨 Étape 7 : Déployer le Backend

```bash
# Déployer toute l'infrastructure backend
amplify push
```

Cela va créer :
- ✅ Base de données DynamoDB avec toutes les tables
- ✅ API GraphQL avec AppSync
- ✅ Authentification Cognito
- ✅ Stockage S3
- ✅ Toutes les permissions IAM

---

## 🏗️ Étape 8 : Configurer Angular pour Amplify

### **Installer les dépendances Angular**

```bash
npm install aws-amplify @aws-amplify/ui-angular
```

### **Configurer main.ts**

```typescript
// src/main.ts
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent);
```

### **Créer le service Amplify**

```typescript
// src/app/services/amplify.service.ts
import { Injectable } from '@angular/core';
import { Auth, API, Storage } from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})
export class AmplifyService {
  
  // Authentification
  async signIn(email: string, password: string) {
    return await Auth.signIn(email, password);
  }
  
  async signOut() {
    return await Auth.signOut();
  }
  
  async getCurrentUser() {
    return await Auth.currentAuthenticatedUser();
  }
  
  // API GraphQL
  async createEntreprise(input: any) {
    const mutation = `
      mutation CreateEntreprise($input: CreateEntrepriseInput!) {
        createEntreprise(input: $input) {
          id
          nom
          secteurActivite
        }
      }
    `;
    return await API.graphql({
      query: mutation,
      variables: { input }
    });
  }
  
  async listEntreprises() {
    const query = `
      query ListEntreprises {
        listEntreprises {
          items {
            id
            nom
            secteurActivite
            dateCreation
          }
        }
      }
    `;
    return await API.graphql({ query });
  }
  
  // Stockage
  async uploadFile(file: File) {
    return await Storage.put(file.name, file);
  }
}
```

---

## 🌐 Étape 9 : Déployer le Frontend

```bash
# Build et déploiement
npm run build:prod
amplify publish
```

**Résultat** : Votre application sera accessible via une URL CloudFront :
```
https://d1a2b3c4d5e6f7.amplifyapp.com
```

---

## 🌍 Étape 10 : Configurer un Domaine Personnalisé

### **Via la Console AWS Amplify**

1. Aller dans AWS Console → Amplify
2. Sélectionner votre app `ecomptaia`
3. Onglet "Domain management"
4. "Add domain"
5. Entrer votre domaine : `e-compta-ia.com`
6. Valider automatiquement le certificat SSL

### **Via Amplify CLI**

```bash
# Ajouter un domaine personnalisé
amplify add hosting
```

---

## 📊 Étape 11 : Monitoring et Analytics

```bash
# Ajouter analytics
amplify add analytics
```

**Configuration** :
```
? Select an Analytics provider: Amazon Pinpoint
? Provide your pinpoint resource name: ecomptaiaAnalytics
? Apps need authorization to send analytics events. Do you want to allow guests and unauthenticated users to send analytics events? No
```

---

## 🚀 Automatisation CI/CD

### **Connecter à GitHub**

1. **Console AWS Amplify** → Votre app
2. **App settings** → **Build settings**
3. **Connect branch** → Sélectionner votre repository GitHub
4. Amplify détectera automatiquement `amplify.yml`

### **Branches automatiques**
- `main` → Production
- `develop` → Staging
- `feature/*` → Preview branches

---

## 💰 Coûts Amplify (très économiques)

### **Configuration Startup (~$15-30/mois)**
| Service | Usage | Coût |
|---------|-------|------|
| **Amplify Hosting** | 5GB, 150GB transfer | $5 |
| **AppSync** | 1M requests | $4 |
| **DynamoDB** | 5GB stockage | $1.25 |
| **Cognito** | 1000 utilisateurs | Gratuit |
| **Lambda** | 1M executions | Gratuit |
| **S3** | 10GB stockage | $0.25 |

### **Configuration Croissance (~$50-100/mois)**
- Pour 10K utilisateurs actifs
- 100GB de data
- 1M de requests API/mois

---

## 🛠️ Commandes Utiles

```bash
# Statut de l'infrastructure
amplify status

# Voir les ressources créées
amplify console

# Mettre à jour le backend
amplify push

# Déployer frontend + backend
amplify publish

# Supprimer toute l'infrastructure
amplify delete
```

---

## 🔧 Configuration Avancée

### **Variables d'environnement par branche**

```typescript
// amplify/backend/function/ecomptaiaapi/src/index.js
const environment = process.env.ENV;
const config = {
  dev: {
    apiUrl: 'https://dev-api.e-compta-ia.com'
  },
  prod: {
    apiUrl: 'https://api.e-compta-ia.com'
  }
};
```

### **Fonctions Lambda personnalisées**

```bash
# Ajouter une fonction Lambda
amplify add function
```

---

## 🎯 Avantages vs Solution ECS

| Aspect | **Amplify** | ECS/Terraform |
|--------|-------------|---------------|
| **Simplicité** | ✅ Très simple | ❌ Complexe |
| **Coût** | ✅ $15-100/mois | ❌ $200-500/mois |
| **Maintenance** | ✅ Zéro maintenance | ❌ Maintenance infrastructure |
| **Scalabilité** | ✅ Automatique illimitée | ⚠️ Configuration manuelle |
| **Déploiement** | ✅ 1 commande | ❌ Multiple étapes |
| **Sécurité** | ✅ AWS managed | ⚠️ Configuration manuelle |

---

## 🎉 Résumé des Commandes de Déploiement

```bash
# 1. Installation et configuration
npm install -g @aws-amplify/cli
amplify configure

# 2. Initialisation du projet
amplify init

# 3. Ajouter les services
amplify add api      # GraphQL + DynamoDB
amplify add auth     # Cognito Authentication
amplify add storage  # S3
amplify add hosting  # CloudFront

# 4. Déploiement
amplify push         # Backend
amplify publish      # Frontend + Backend

# 5. URL de l'application
# https://d1a2b3c4d5e6f7.amplifyapp.com
```

---

## 🎯 **AMPLIFY EST LE CHOIX PARFAIT !**

Pour E-COMPTA-IA, **AWS Amplify** offre :

- ✅ **Déploiement ultra-simple** (1 commande vs 20+ avec ECS)
- ✅ **Coût très réduit** ($30/mois vs $200+/mois)
- ✅ **Scalabilité automatique** (millions d'utilisateurs)
- ✅ **Sécurité managed** par AWS
- ✅ **CI/CD intégré** avec GitHub
- ✅ **GraphQL moderne** pour Angular

**Votre plateforme sera en ligne en 30 minutes !** 🚀✨

---

*Guide créé pour E-COMPTA-IA - Déploiement Amplify optimisé*