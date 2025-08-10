# 🔗 Connecter GitHub à AWS Amplify

## 🎯 **ÉTAPE MANQUANTE IDENTIFIÉE**

Vous devez d'abord **connecter votre repository GitHub** à AWS Amplify avant de pouvoir déployer.

---

## 🚀 **PROCÉDURE COMPLÈTE :**

### **1. Dans AWS Amplify Console :**

```
AWS Amplify → "Create new app" → "Host web app"
```

### **2. Connecter le source code :**

**Choisissez "GitHub" :**
- Cliquez sur **"GitHub"**
- **Autorisez** AWS Amplify à accéder à vos repos
- **Sélectionnez** votre repository `E_COMPTA_IA`

### **3. Configurer la branche :**

```
Repository: E_COMPTA_IA
Branch: main (ou master)
```

### **4. Build settings :**

Amplify détectera automatiquement votre `amplify.yml` !

```yaml
# amplify.yml sera utilisé automatiquement
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --legacy-peer-deps
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist/e-compta-ia
    files:
      - '**/*'
```

### **5. Review et Deploy :**

- **Vérifiez** les paramètres
- **Cliquez** "Save and deploy"

---

## 🔧 **SI VOTRE REPO N'EST PAS SUR GITHUB :**

### **Option A - Pousser vers GitHub :**

```bash
# Créer un repo GitHub d'abord, puis :
git remote add origin https://github.com/VOTRE_USERNAME/E_COMPTA_IA.git
git branch -M main
git push -u origin main
```

### **Option B - Upload ZIP :**

```
Amplify Console → "Deploy without Git provider" → 
Upload ZIP du projet
```

---

## 📱 **ÉTAPES DÉTAILLÉES DANS L'INTERFACE :**

### **Écran 1 - Amplify Home :**
```
┌─────────────────────────────────────┐
│ [Create new app] [Get started]     │
│                                     │
│ Host your web app ✓                │
│ Build your backend                  │
└─────────────────────────────────────┘
```

### **Écran 2 - Connect repository :**
```
┌─────────────────────────────────────┐
│ Connect repository                  │
│                                     │
│ [GitHub] [GitLab] [Bitbucket]      │
│ [Connect branch]                    │
└─────────────────────────────────────┘
```

### **Écran 3 - Configure build :**
```
┌─────────────────────────────────────┐
│ App name: e-compta-ia              │
│ Environment: production             │
│                                     │
│ Build settings detected ✓           │
│ amplify.yml found                   │
└─────────────────────────────────────┘
```

---

## 🎯 **ACTION IMMÉDIATE :**

1. **Assurez-vous** que votre code est sur GitHub
2. **Retournez** dans Amplify Console
3. **Cliquez** "Host web app" 
4. **Connectez** GitHub
5. **Sélectionnez** votre repo E_COMPTA_IA

**Le déploiement se lancera automatiquement !** 🚀

---

## ❓ **Questions pour vous aider :**

- Votre code est-il déjà sur GitHub ?
- Quel est le nom de votre repository ?
- Voyez-vous l'option "Host web app" dans Amplify ?

**Dites-moi où vous en êtes !** 👀