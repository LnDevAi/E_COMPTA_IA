# 🤖 PROMPT : GÉNÉRATION D'ÉCRITURES COMPTABLES SYSCOHADA

## 📋 Template Principal

```
Tu es un expert-comptable spécialisé en SYSCOHADA AUDCIF. 
Génère une écriture comptable précise et conforme pour l'opération suivante :

**CONTEXTE ENTREPRISE :**
- Pays : {pays}
- Secteur d'activité : {secteur}
- Régime TVA : {regime_tva}
- Monnaie : {monnaie}
- Plan comptable : SYSCOHADA AUDCIF

**OPÉRATION À COMPTABILISER :**
- Type : {type_operation}
- Date : {date}
- Description : {description}
- Montant HT : {montant_ht} {monnaie}
- TVA : {tva} {monnaie} (taux : {taux_tva}%)
- Montant TTC : {montant_ttc} {monnaie}
- Référence : {reference}
- Tiers : {tiers}

**INSTRUCTIONS SPÉCIFIQUES :**
1. Utilise exclusivement les comptes du plan SYSCOHADA AUDCIF
2. Respecte les règles de débit/crédit
3. Assure l'équilibre de l'écriture
4. Gère correctement la TVA selon le régime
5. Indique les contrôles à effectuer
6. Propose des variantes si applicable

**FORMAT DE RÉPONSE :**
Présente sous forme JSON structuré avec :
- Numéro d'écriture
- Date et libellé
- Détail des lignes (compte, libellé, débit, crédit, tiers)
- Contrôles effectués
- Justifications des choix comptables
```

## 🎯 Prompts Spécialisés

### 💰 Opérations de Vente
```
CONTEXTE SPÉCIFIQUE VENTE :
- Type client : {type_client} (particulier/entreprise/export)
- Mode de paiement : {mode_paiement}
- Conditions particulières : {conditions}

RÈGLES VENTE SYSCOHADA :
- Produits classe 7
- TVA collectée si assujetti
- Clients classe 4
- Gestion des acomptes si applicable
```

### 🛒 Opérations d'Achat
```
CONTEXTE SPÉCIFIQUE ACHAT :
- Type achat : {type_achat} (marchandises/services/immobilisations)
- Fournisseur : {type_fournisseur} (local/import)
- Déductibilité TVA : {deductibilite_tva}

RÈGLES ACHAT SYSCOHADA :
- Charges classe 6 ou immobilisations classe 2
- TVA déductible selon règles locales
- Fournisseurs classe 4
```

### 💵 Opérations de Trésorerie
```
CONTEXTE SPÉCIFIQUE TRÉSORERIE :
- Type mouvement : {type_mouvement} (encaissement/décaissement)
- Moyen de paiement : {moyen_paiement}
- Banque/Caisse : {compte_tresorerie}

RÈGLES TRÉSORERIE SYSCOHADA :
- Comptes classe 5 pour trésorerie
- Cohérence avec opérations d'origine
- Frais bancaires si applicable
```

### 👥 Opérations de Personnel
```
CONTEXTE SPÉCIFIQUE PERSONNEL :
- Type charge : {type_charge} (salaire/cotisations/provisions)
- Nombre salariés : {nb_salaries}
- Organismes sociaux : {organismes_pays}

RÈGLES PERSONNEL SYSCOHADA :
- Charges personnel classe 6
- Dettes sociales classe 4
- Respect barèmes sociaux pays
```

## 🔍 Prompts de Validation

### ✅ Contrôle de Cohérence
```
Vérifie la cohérence de cette écriture comptable :
{ecriture_json}

CONTRÔLES À EFFECTUER :
1. ✓ Équilibre débit/crédit
2. ✓ Comptes SYSCOHADA valides
3. ✓ Logique débit/crédit respectée
4. ✓ TVA correctement calculée
5. ✓ Tiers cohérents
6. ✓ Respect des règles métier

SIGNALE TOUTE ANOMALIE ET PROPOSE CORRECTIONS.
```

### 🎯 Suggestion d'Optimisation
```
Analyse cette écriture et propose des optimisations :
{ecriture_json}

AXES D'OPTIMISATION :
- Optimisation fiscale
- Simplification comptable
- Amélioration des contrôles
- Automatisation possible
- Conformité renforcée

JUSTIFIE CHAQUE PROPOSITION.
```

## 📊 Prompts Analytiques

### 📈 Analyse d'Impact
```
Analyse l'impact de cette écriture sur :
{ecriture_json}

IMPACTS À ANALYSER :
- Bilan (actif/passif)
- Compte de résultat
- Trésorerie
- Ratios financiers
- Situation fiscale
- Indicateurs de gestion

PRÉSENTE SOUS FORME DE DASHBOARD.
```

### 🔮 Prédiction Automatique
```
Prédis les écritures nécessaires pour cette opération :
{description_operation}

BASÉ SUR :
- Historique des opérations similaires
- Patterns sectoriels
- Règles comptables SYSCOHADA
- Spécificités pays : {pays}

PROPOSE PLUSIEURS SCÉNARIOS AVEC PROBABILITÉS.
```

## 🛠️ Variables Dynamiques

### 📍 Variables Contextuelles
- `{pays}` : Code pays OHADA (CI, BF, SN, etc.)
- `{secteur}` : Secteur d'activité de l'entreprise
- `{regime_tva}` : Régime TVA (réel normal/simplifié/franchise)
- `{monnaie}` : Devise locale (XOF, XAF, etc.)
- `{taux_tva}` : Taux TVA applicable
- `{date}` : Date de l'opération

### 💼 Variables Opérationnelles
- `{type_operation}` : Type d'opération comptable
- `{montant_ht}` : Montant hors taxes
- `{montant_ttc}` : Montant toutes taxes comprises
- `{tiers}` : Information sur le tiers
- `{reference}` : Référence du document

### 🎛️ Variables de Configuration
- `{niveau_detail}` : Niveau de détail souhaité
- `{format_sortie}` : Format de présentation
- `{langue}` : Langue de réponse (fr/en)
- `{niveau_expertise}` : Niveau d'expertise utilisateur

## 🔄 Prompts de Mise à Jour

### 📅 Veille Réglementaire
```
Vérifie si cette pratique comptable est toujours conforme :
{pratique_comptable}

SOURCES À CONSULTER :
- Derniers textes SYSCOHADA
- Modifications fiscales {pays}
- Circulaires récentes
- Jurisprudence comptable

SIGNALE TOUT CHANGEMENT IMPACTANT.
```

### 🆕 Nouveau Texte
```
Intègre ce nouveau texte réglementaire :
{nouveau_texte}

ACTIONS À EFFECTUER :
1. Analyser l'impact sur pratiques existantes
2. Identifier les changements nécessaires
3. Mettre à jour les règles de génération
4. Créer des exemples d'application
5. Alerter sur les transitions

PRODUIS UN PLAN DE MISE À JOUR.
```

---

## 📋 Utilisation

Ces prompts sont utilisés par l'IA selon le contexte :
- **Génération automatique** : Prompts principaux
- **Validation** : Prompts de contrôle
- **Optimisation** : Prompts analytiques
- **Apprentissage** : Prompts de mise à jour

Chaque prompt est paramétrable et s'adapte aux spécificités de l'entreprise et du pays.