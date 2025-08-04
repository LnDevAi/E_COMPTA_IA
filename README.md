# ComptaEBNL-IA

## 🎯 Plateforme de Gestion Comptable avec IA pour Entités à But Non Lucratif

**ComptaEBNL-IA** est une plateforme SaaS révolutionnaire de gestion comptable avec intelligence artificielle intégrée, spécialement conçue pour les entités à but non lucratif (associations, fondations, projets de développement) utilisant le référentiel SYCEBNL officiel.

### 🚀 Fonctionnalités Principales

- **🤖 Agent IA Comptable** : Scan de pièces et génération automatique d'écritures
- **📊 Plan Comptable SYCEBNL** : 1162 comptes officiels intégrés
- **📈 États Financiers Conformes** : Bilan, compte de résultat, flux de trésorerie
- **🔧 Gestion Spécialisée EBNL** : Adhérents, fonds affectés, contributions volontaires
- **📱 Interface Moderne** : React responsive avec tableau de bord intelligent

### 🛠 Technologies Utilisées

- **Frontend** : React 18 + TypeScript + Vite
- **UI/UX** : Tailwind CSS + Radix UI + Lucide Icons
- **État Global** : Zustand
- **Requêtes** : TanStack Query
- **Formulaires** : React Hook Form + Zod
- **Graphiques** : Recharts
- **Export** : jsPDF + XLSX

### 🏗 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base
│   ├── forms/          # Composants de formulaires
│   └── charts/         # Composants de graphiques
├── pages/              # Pages de l'application
├── hooks/              # Hooks personnalisés
├── stores/             # Stores Zustand
├── services/           # Services API
├── utils/              # Utilitaires
├── types/              # Types TypeScript
└── data/               # Données statiques (plan comptable)
```

### 🚀 Installation et Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Build de production
npm run build

# Tests
npm run test
```

### 📋 Plan Comptable SYCEBNL

Le système intègre les 1162 comptes officiels du référentiel SYCEBNL, organisés en :

- **Classe 1** : Comptes de ressources durables
- **Classe 2** : Comptes d'actif immobilisé
- **Classe 3** : Comptes de stocks
- **Classe 4** : Comptes de tiers
- **Classe 5** : Comptes financiers
- **Classe 6** : Comptes de charges
- **Classe 7** : Comptes de produits
- **Classe 8** : Comptes spéciaux

### 🤖 Intelligence Artificielle

L'agent IA intégré permet :

- **Reconnaissance OCR** : Extraction automatique des données des pièces comptables
- **Classification Intelligente** : Attribution automatique des comptes comptables
- **Validation** : Contrôle de cohérence des écritures
- **Suggestions** : Propositions d'amélioration et d'optimisation

### 📊 États Financiers

Génération automatique des états financiers conformes :

- **Bilan** : Actif/Passif avec comparatifs N-1
- **Compte de Résultat** : Charges/Produits par nature
- **Flux de Trésorerie** : Méthode directe et indirecte
- **Annexes** : Notes explicatives détaillées

### 🎯 Spécificités EBNL

- **Gestion des Adhérents** : Cotisations, droits d'entrée
- **Fonds Affectés** : Suivi des projets et subventions
- **Contributions Volontaires** : Valorisation du bénévolat
- **Reporting** : États spécifiques aux organismes de contrôle

### 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

### 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

### 📞 Support

Pour toute question ou support : [issues](https://github.com/LnDevAi/ComptaEBNL-IA/issues)
