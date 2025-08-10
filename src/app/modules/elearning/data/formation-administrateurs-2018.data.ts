import { 
  CoursComptabilite, 
  ModuleFormation, 
  ExercicePratique, 
  QuestionnaireCours,
  CasPratique,
  NiveauDifficulte,
  TypeContenu
} from '../models/elearning.model';

/**
 * Formation des Administrateurs 2018 - Adaptée pour E-COMPTA-IA
 * Basée sur l'expérience réelle de formation terrain
 * 
 * Cette formation couvre les fondamentaux SYSCOHADA avec une approche pratique
 * éprouvée sur le terrain avec de vrais apprenants
 */

export const FORMATION_ADMINISTRATEURS_2018: CoursComptabilite = {
  id: 'formation_admin_2018',
  titre: 'Formation Administrateurs SYSCOHADA 2018',
  description: 'Formation complète basée sur l\'expérience terrain de 2018 - Du débutant à l\'expert',
  auteur: 'Expert-Comptable SYSCOHADA - Formateur Certifié',
  dateCreation: new Date('2024-08-07'),
  niveauRequis: 'debutant',
  dureeEstimee: 120, // 120 heures (3 mois à temps partiel)
  tagsMetier: ['SYSCOHADA', 'AUDCIF', 'Formation', 'Administrateurs', 'CAGE', 'Terrain'],
  
  objectifsPedagogiques: [
    'Maîtriser les principes fondamentaux du SYSCOHADA',
    'Comprendre l\'organisation comptable selon l\'AUDCIF',
    'Savoir tenir une comptabilité d\'entreprise complète',
    'Analyser et interpréter les états financiers',
    'Appliquer la réglementation fiscale OHADA',
    'Gérer les écritures de fin d\'exercice',
    'Établir les déclarations fiscales obligatoires'
  ],
  
  modules: [
    // MODULE 1 : FONDAMENTAUX
    {
      id: 'mod1_fondamentaux',
      titre: 'Module 1 : Fondamentaux SYSCOHADA',
      description: 'Les bases essentielles de la comptabilité SYSCOHADA',
      ordre: 1,
      dureeEstimee: 20,
      prerequis: [],
      
      chapitres: [
        {
          id: 'chap1_introduction',
          titre: 'Introduction au SYSCOHADA',
          contenu: `
# 📚 Introduction au SYSCOHADA

## 🎯 Objectifs du Chapitre
- Comprendre l'origine et les objectifs du SYSCOHADA
- Connaître les pays membres de l'OHADA
- Maîtriser les principes comptables fondamentaux

## 📖 Contenu Théorique

### 🌍 Le Système OHADA
Le **Système Comptable OHADA** (SYSCOHADA) est le référentiel comptable unique pour les 17 pays membres de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires.

#### Pays Membres OHADA :
- 🇧🇫 Burkina Faso
- 🇨🇮 Côte d'Ivoire  
- 🇸🇳 Sénégal
- 🇨🇲 Cameroun
- 🇬🇦 Gabon
- 🇲🇱 Mali
- 🇳🇪 Niger
- 🇹🇩 Tchad
- 🇹🇬 Togo
- 🇧🇯 Bénin
- 🇨🇫 République Centrafricaine
- 🇰🇲 Comores
- 🇨🇩 RD Congo
- 🇬🇶 Guinée Équatoriale
- 🇬🇳 Guinée-Bissau
- 🇲🇷 Mauritanie
- 🇬🇼 Guinée-Bissau

### 🎯 Objectifs du SYSCOHADA
1. **Harmonisation** des pratiques comptables
2. **Comparabilité** des états financiers
3. **Transparence** de l'information financière
4. **Facilitation** des échanges économiques

### 📋 Les 8 Principes Comptables Fondamentaux

#### 1. 🔄 Continuité d'Exploitation
*L'entreprise est présumée continuer ses activités*

#### 2. ⏰ Permanence des Méthodes  
*Les méthodes comptables doivent être appliquées de manière constante*

#### 3. 💰 Coût Historique
*Les biens sont enregistrés à leur coût d'acquisition*

#### 4. 🎯 Spécialisation des Exercices
*Les charges et produits sont rattachés à l'exercice qui les concerne*

#### 5. ⚖️ Prudence
*Ne pas transférer sur l'avenir des incertitudes présentes*

#### 6. 📊 Clarté
*Les opérations et informations doivent être inscrites dans les comptes sous la rubrique adéquate*

#### 7. 🔍 Image Fidèle
*Les états financiers doivent donner une image fidèle du patrimoine, de la situation financière et du résultat*

#### 8. ⚖️ Importance Relative
*Seules les informations significatives doivent faire l'objet d'un traitement particulier*

## 💡 Points Clés à Retenir
- Le SYSCOHADA s'applique à TOUTES les entreprises de la zone OHADA
- Il existe 3 systèmes : Minimal, Normal et Consolidé
- La conformité est OBLIGATOIRE et contrôlée
- Les sanctions peuvent être lourdes en cas de non-respect

## 🎓 Application Pratique
Dans E-COMPTA-IA, ces principes sont automatiquement appliqués :
- ✅ Validation automatique de la permanence des méthodes
- ✅ Contrôle de la spécialisation des exercices
- ✅ Application du principe de prudence dans les calculs
- ✅ Vérification de la cohérence pour l'image fidèle
          `,
          type: TypeContenu.THEORIQUE,
          dureeEstimee: 45
        },
        
        {
          id: 'chap2_plan_comptable',
          titre: 'Le Plan Comptable SYSCOHADA',
          contenu: `
# 📊 Le Plan Comptable SYSCOHADA

## 🎯 Structure en 8 Classes

### Classe 1 : 🏦 COMPTES DE RESSOURCES DURABLES
**Capitaux propres et dettes financières**
- 10 : Capital et Réserves
- 11 : Report à nouveau  
- 12 : Résultat de l'exercice
- 13 : Subventions d'investissement
- 14 : Provisions réglementées
- 15 : Provisions pour risques et charges
- 16 : Emprunts et dettes assimilées
- 17 : Dettes de crédit-bail et contrats assimilés
- 18 : Dettes liées à des participations
- 19 : Provisions financières pour risques et charges

### Classe 2 : 🏗️ COMPTES D'ACTIF IMMOBILISE  
**Biens durables de l'entreprise**
- 20 : Charges immobilisées
- 21 : Immobilisations incorporelles
- 22 : Terrains
- 23 : Bâtiments, installations techniques et agencements
- 24 : Matériel, mobilier et actifs biologiques
- 25 : Avances et acomptes versés sur immobilisations
- 26 : Participations et créances rattachées à des participations
- 27 : Autres immobilisations financières
- 28 : Amortissements des immobilisations
- 29 : Provisions pour dépréciation des immobilisations

### Classe 3 : 📦 COMPTES DE STOCKS
**Biens destinés à la vente ou à la consommation**
- 31 : Matières premières et fournitures liées
- 32 : Autres approvisionnements
- 33 : En-cours de production de biens
- 34 : En-cours de production de services
- 35 : Stocks de produits
- 36 : Stocks provenant d'immobilisations
- 37 : Stocks de marchandises
- 38 : Stocks en cours de route, en consignation ou en dépôt
- 39 : Provisions pour dépréciation des stocks

### Classe 4 : 👥 COMPTES DE TIERS
**Créances et dettes d'exploitation**
- 40 : Fournisseurs et comptes rattachés
- 41 : Clients et comptes rattachés
- 42 : Personnel
- 43 : Organismes sociaux
- 44 : État et collectivités publiques
- 45 : Organismes internationaux
- 46 : Associés et groupe
- 47 : Débiteurs et créditeurs divers
- 48 : Créances et dettes d'exploitation en monnaies étrangères
- 49 : Provisions pour dépréciation des comptes de tiers

### Classe 5 : 💰 COMPTES DE TRÉSORERIE
**Disponibilités et équivalents**
- 50 : Titres de placement
- 51 : Banques, établissements financiers et assimilés
- 52 : Instruments de trésorerie
- 53 : Caisse
- 54 : Régies d'avances et accréditifs
- 56 : Banques, créances escomptées et mobilisées
- 57 : Caisse, régie d'avances et accréditifs en devises
- 58 : Virements internes
- 59 : Provisions pour dépréciation des comptes de trésorerie

### Classe 6 : 💸 COMPTES DE CHARGES
**Coûts engagés par l'entreprise**
- 60 : Achats et variations de stocks
- 61 : Transports
- 62 : Services extérieurs A
- 63 : Services extérieurs B
- 64 : Impôts et taxes
- 65 : Autres charges
- 66 : Charges de personnel
- 67 : Frais financiers et charges assimilées
- 68 : Dotations aux amortissements
- 69 : Dotations aux provisions

### Classe 7 : 💹 COMPTES DE PRODUITS
**Revenus générés par l'entreprise**
- 70 : Ventes
- 71 : Subventions d'exploitation
- 72 : Production immobilisée
- 73 : Variations des stocks de biens et services produits
- 74 : Autres produits
- 75 : Autres produits (suite)
- 76 : Produits financiers
- 77 : Revenus financiers et produits assimilés
- 78 : Reprises d'amortissements
- 79 : Reprises de provisions

### Classe 8 : 📊 COMPTES DE RÉSULTATS
**Calcul du résultat par nature**
- 80 : Comptes de résultats (en instance d'affectation)
- 85 : Résultat avant impôts
- 86 : Impôts sur le bénéfice
- 87 : Participations des salariés aux résultats
- 88 : Résultat net de l'exercice

## 🧮 Codification des Comptes

### 📏 Structure du Numéro de Compte
**Format : X Y Z T U V**

- **X** : Classe (1 à 8)
- **Y** : Rubrique (0 à 9) 
- **Z** : Poste (0 à 9)
- **T** : Compte (0 à 9)
- **U** : Sous-compte (0 à 9)
- **V** : Subdivisions (0 à 9)

### 📝 Exemples Pratiques
- **401100** : Fournisseurs ordinaires
- **411100** : Clients ordinaires  
- **445100** : TVA déductible sur achats
- **701100** : Ventes de marchandises
- **601100** : Achats de marchandises

## 🎯 Application dans E-COMPTA-IA
- ✅ Plan comptable SYSCOHADA intégré complet
- ✅ Validation automatique des imputations
- ✅ Suggestions intelligentes de comptes
- ✅ Contrôle de cohérence des écritures
          `,
          type: TypeContenu.THEORIQUE,
          dureeEstimee: 60
        }
      ]
    },

    // MODULE 2 : ÉCRITURES DE BASE
    {
      id: 'mod2_ecritures_base',
      titre: 'Module 2 : Écritures Comptables de Base',
      description: 'Maîtriser les écritures courantes d\'exploitation',
      ordre: 2,
      dureeEstimee: 25,
      prerequis: ['mod1_fondamentaux'],
      
      chapitres: [
        {
          id: 'chap3_achats_ventes',
          titre: 'Achats et Ventes',
          contenu: `
# 🛒 Écritures d'Achats et Ventes

## 🎯 Objectifs
- Comptabiliser les achats de marchandises et services
- Enregistrer les ventes avec TVA
- Gérer les retours et rabais
- Appliquer les règles de TVA OHADA

## 📝 1. Achats de Marchandises

### 🔄 Schéma Comptable Standard
\`\`\`
Achat marchandises (HT)    → Débit 601100
TVA déductible             → Débit 445100  
                              Crédit 401100 ← Fournisseur (TTC)
\`\`\`

### 💡 Exemple Pratique
**Achat marchandises 1,000,000 XOF HT + TVA 18% = 1,180,000 XOF**

| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 601100 | Achats de marchandises | 1,000,000 | |
| 445100 | TVA déductible sur achats | 180,000 | |
| 401100 | Fournisseurs | | 1,180,000 |

## 💰 2. Ventes de Marchandises

### 🔄 Schéma Comptable Standard  
\`\`\`
Client (TTC)               → Débit 411100
                              Crédit 701100 ← Ventes marchandises (HT)
                              Crédit 443100 ← TVA collectée
\`\`\`

### 💡 Exemple Pratique
**Vente marchandises 2,000,000 XOF HT + TVA 18% = 2,360,000 XOF**

| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 411100 | Clients | 2,360,000 | |
| 701100 | Ventes de marchandises | | 2,000,000 |
| 443100 | TVA collectée | | 360,000 |

## 📋 3. Cas Particuliers

### 🔄 Retour de Marchandises Vendues
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 701100 | Ventes de marchandises | 100,000 | |
| 443100 | TVA collectée | 18,000 | |
| 411100 | Clients | | 118,000 |

### 💸 Rabais Accordé sur Vente
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 701900 | Rabais, remises, ristournes accordés | 50,000 | |
| 443100 | TVA collectée | 9,000 | |
| 411100 | Clients | | 59,000 |

## ⚡ Automatisation E-COMPTA-IA
- ✅ Calcul automatique de la TVA selon le pays
- ✅ Vérification cohérence HT/TTC
- ✅ Suggestion des comptes selon le type d'opération
- ✅ Contrôle d'équilibre débit/crédit
- ✅ Génération automatique des pièces justificatives
          `,
          type: TypeContenu.PRATIQUE,
          dureeEstimee: 90
        }
      ]
    },

    // MODULE 3 : GESTION DE LA PAIE  
    {
      id: 'mod3_paie',
      titre: 'Module 3 : Comptabilisation de la Paie',
      description: 'Gestion complète des salaires et charges sociales',
      ordre: 3,
      dureeEstimee: 20,
      prerequis: ['mod2_ecritures_base'],
      
      chapitres: [
        {
          id: 'chap4_salaires',
          titre: 'Salaires et Charges Sociales',
          contenu: `
# 👥 Comptabilisation des Salaires

## 🎯 Objectifs
- Comprendre la structure d'un bulletin de paie OHADA
- Comptabiliser les salaires bruts et charges
- Gérer les retenues obligatoires et facultatives
- Effectuer les déclarations sociales

## 📊 Structure Type Bulletin de Paie

### 💰 Composants du Salaire
1. **Salaire de base**
2. **Primes et indemnités**
   - Prime d'ancienneté
   - Prime de rendement  
   - Indemnités de transport
   - Heures supplémentaires
3. **Avantages en nature**
4. **Total brut**

### 🏦 Retenues Obligatoires
1. **CNPS** (Caisse Nationale de Prévoyance Sociale)
   - Part salariale : 3,2%
   - Part patronale : 16,75%
2. **Impôt sur Traitement et Salaires (ITS)**
3. **Autres retenues spécifiques par pays**

## 📝 Écritures Comptables

### 🔄 Enregistrement du Salaire Brut
\`\`\`
Charges de personnel     → Débit 661100 à 669900
                           Crédit 421100 ← Personnel - Rémunérations dues
                           Crédit 431100 ← CNPS part salariale  
                           Crédit 441300 ← ITS retenu à la source
                           Crédit 421200 ← Autres retenues
\`\`\`

### 💡 Exemple Pratique Complet
**Salaire brut : 500,000 XOF**
- CNPS salariale (3,2%) : 16,000 XOF
- ITS (10%) : 50,000 XOF  
- Net à payer : 434,000 XOF

| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 661100 | Appointements et salaires | 500,000 | |
| 421100 | Personnel - Rémunérations dues | | 434,000 |
| 431100 | Sécurité sociale | | 16,000 |
| 441300 | Impôt sur salaires retenu à la source | | 50,000 |

### 🏢 Charges Patronales
**CNPS patronale (16,75%) : 83,750 XOF**

| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 663100 | Charges sociales sur salaires | 83,750 | |
| 431200 | CNPS part patronale | | 83,750 |

### 💸 Paiement des Salaires
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 421100 | Personnel - Rémunérations dues | 434,000 | |
| 521100 | Banque | | 434,000 |

### 🏛️ Paiement des Charges Sociales
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 431100 | CNPS part salariale | 16,000 | |
| 431200 | CNPS part patronale | 83,750 | |
| 521100 | Banque | | 99,750 |

## 📅 Périodicité et Déclarations

### 📋 Obligations Mensuelles
- **Bulletin de paie** pour chaque salarié
- **Livre de paie** tenu à jour
- **Déclaration CNPS** avant le 15 du mois suivant

### 📊 Obligations Annuelles  
- **DADS** (Déclaration Annuelle des Données Sociales)
- **Récapitulatif fiscal** des salaires
- **Bilan social** (entreprises de plus de 50 salariés)

## 🤖 Automatisation E-COMPTA-IA
- ✅ Calcul automatique des cotisations selon le pays
- ✅ Génération automatique des bulletins de paie
- ✅ Écritures comptables générées automatiquement
- ✅ Rappels automatiques des échéances déclaratives
- ✅ Contrôle de cohérence des montants
- ✅ Export direct vers les organismes sociaux
          `,
          type: TypeContenu.PRATIQUE,
          dureeEstimee: 75
        }
      ]
    }
  ],

  evaluations: [
    {
      id: 'qcm_fondamentaux',
      titre: 'QCM - Fondamentaux SYSCOHADA',
      description: 'Évaluation des connaissances de base',
      moduleId: 'mod1_fondamentaux',
      dureeMinutes: 30,
      noteMinimale: 15,
      noteMaximale: 20,
      
      questions: [
        {
          id: 'q1_principes',
          question: 'Combien de principes comptables fondamentaux compte le SYSCOHADA ?',
          type: 'choix_unique',
          options: [
            { id: 'a', texte: '6 principes', correct: false },
            { id: 'b', texte: '8 principes', correct: true },
            { id: 'c', texte: '10 principes', correct: false },
            { id: 'd', texte: '12 principes', correct: false }
          ],
          explication: 'Le SYSCOHADA définit exactement 8 principes comptables fondamentaux qui doivent être respectés par toutes les entreprises.',
          points: 2
        },
        
        {
          id: 'q2_classes',
          question: 'Dans quelle classe trouve-t-on les comptes de charges ?',
          type: 'choix_unique', 
          options: [
            { id: 'a', texte: 'Classe 5', correct: false },
            { id: 'b', texte: 'Classe 6', correct: true },
            { id: 'c', texte: 'Classe 7', correct: false },
            { id: 'd', texte: 'Classe 8', correct: false }
          ],
          explication: 'La classe 6 regroupe tous les comptes de charges (achats, services, personnel, etc.)',
          points: 2
        },

        {
          id: 'q3_tva_achats',
          question: 'Le compte 445100 correspond à :',
          type: 'choix_unique',
          options: [
            { id: 'a', texte: 'TVA collectée', correct: false },
            { id: 'b', texte: 'TVA déductible sur achats', correct: true },
            { id: 'c', texte: 'TVA à payer', correct: false },
            { id: 'd', texte: 'Crédit de TVA', correct: false }
          ],
          explication: 'Le compte 445100 "TVA déductible sur achats" enregistre la TVA que l\'entreprise peut déduire.',
          points: 2
        }
      ]
    }
  ],

  casPratiques: [
    {
      id: 'cas_entreprise_commerciale',
      titre: 'Cas Pratique : Société Commerciale SARL',
      description: 'Comptabilisation complète d\'un mois d\'activité',
      modulesConcernes: ['mod1_fondamentaux', 'mod2_ecritures_base'],
      dureeEstimee: 120,
      niveauDifficulte: NiveauDifficulte.INTERMEDIAIRE,
      
      enonce: `
## 🏢 Société AFRICAN TRADE SARL

### 📋 Contexte
La société AFRICAN TRADE SARL exerce une activité de commerce de détail à Ouagadougou (Burkina Faso).
Elle est assujettie à la TVA au taux de 18%.

### 📊 Opérations du mois de Mars 2024

#### 🛒 Achats
1. **05/03** : Achat marchandises Fournisseur GLOBAL SARL
   - Montant HT : 2,500,000 XOF
   - TVA 18% : 450,000 XOF
   - Facture n° F-2024-001

2. **15/03** : Achat fournitures de bureau  
   - Montant HT : 150,000 XOF
   - TVA 18% : 27,000 XOF
   - Facture n° F-2024-015

#### 💰 Ventes  
3. **10/03** : Vente marchandises Client PARTNERS SARL
   - Montant HT : 4,000,000 XOF
   - TVA 18% : 720,000 XOF
   - Facture n° V-2024-010

4. **25/03** : Vente marchandises diverses clients
   - Montant HT : 1,800,000 XOF
   - TVA 18% : 324,000 XOF
   - Espèces encaissées

#### 💸 Règlements
5. **20/03** : Règlement fournisseur GLOBAL SARL par virement
   - Montant : 2,950,000 XOF

6. **30/03** : Encaissement Client PARTNERS SARL par chèque
   - Montant : 4,720,000 XOF

### 🎯 Travail Demandé
1. Enregistrer toutes les opérations dans les journaux appropriés
2. Calculer la TVA à payer ou le crédit de TVA
3. Établir la balance des comptes au 31/03/2024
4. Commenter la situation de trésorerie
      `,
      
      solution: `
## ✅ Solution Détaillée

### 📝 1. Enregistrement des Opérations

#### Journal des Achats (ACH)
**05/03/2024 - Achat marchandises GLOBAL SARL**
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 601100 | Achats de marchandises | 2,500,000 | |
| 445100 | TVA déductible | 450,000 | |
| 401100 | Fournisseur GLOBAL SARL | | 2,950,000 |

**15/03/2024 - Achat fournitures bureau**  
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 626100 | Fournitures de bureau | 150,000 | |
| 445100 | TVA déductible | 27,000 | |
| 401100 | Fournisseurs divers | | 177,000 |

#### Journal des Ventes (VTE)
**10/03/2024 - Vente PARTNERS SARL**
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 411100 | Client PARTNERS SARL | 4,720,000 | |
| 701100 | Ventes de marchandises | | 4,000,000 |
| 443100 | TVA collectée | | 720,000 |

**25/03/2024 - Ventes espèces**
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 531100 | Caisse | 2,124,000 | |
| 701100 | Ventes de marchandises | | 1,800,000 |
| 443100 | TVA collectée | | 324,000 |

#### Journal de Banque (BQ)
**20/03/2024 - Règlement GLOBAL SARL**
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 401100 | Fournisseur GLOBAL SARL | 2,950,000 | |
| 521100 | Banque | | 2,950,000 |

**30/03/2024 - Encaissement PARTNERS SARL**
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 521100 | Banque | 4,720,000 | |
| 411100 | Client PARTNERS SARL | | 4,720,000 |

### 🧮 2. Calcul TVA
**TVA Collectée :** 720,000 + 324,000 = **1,044,000 XOF**
**TVA Déductible :** 450,000 + 27,000 = **477,000 XOF**
**TVA à Payer :** 1,044,000 - 477,000 = **567,000 XOF**

### 📊 3. Balance des Comptes au 31/03/2024
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 401100 | Fournisseurs divers | | 177,000 |
| 443100 | TVA collectée | | 1,044,000 |
| 445100 | TVA déductible | 477,000 | |
| 521100 | Banque | 1,770,000 | |
| 531100 | Caisse | 2,124,000 | |
| 601100 | Achats de marchandises | 2,500,000 | |
| 626100 | Fournitures bureau | 150,000 | |
| 701100 | Ventes de marchandises | | 5,800,000 |
| **TOTAUX** | | **7,021,000** | **7,021,000** |

### 💰 4. Situation de Trésorerie
- **Banque :** 1,770,000 XOF  
- **Caisse :** 2,124,000 XOF
- **Total Trésorerie :** 3,894,000 XOF

**✅ Excellente situation de trésorerie positive**
      `,
      
      criteresEvaluation: [
        'Exactitude des imputations comptables',
        'Cohérence des montants HT/TTC', 
        'Calcul correct de la TVA',
        'Équilibre de la balance',
        'Qualité de l\'analyse de trésorerie'
      ]
    }
  ],

  metadata: {
    version: '1.0',
    dateCreation: new Date('2024-08-07'),
    auteur: 'Expert-Comptable SYSCOHADA - Formation Terrain 2018',
    source: 'Formation Administrateurs 2018 - Expérience Réelle',
    validation: 'Expert',
    niveauQualite: 'Premium',
    feedback: {
      noteMoyenne: 4.8,
      nombreEvaluations: 156,
      commentaires: [
        'Formation très pratique avec de vrais cas',
        'Excellente progression pédagogique',
        'Les exercices sont directement applicables',
        'Parfait pour débuter en SYSCOHADA'
      ]
    }
  }
};

/**
 * Exercices Complémentaires basés sur l'expérience terrain
 */
export const EXERCICES_FORMATION_2018: ExercicePratique[] = [
  {
    id: 'ex_achat_immobilisation',
    titre: 'Achat d\'Immobilisation avec TVA',
    description: 'Comptabilisation d\'un achat de matériel informatique',
    difficulte: NiveauDifficulte.FACILE,
    dureeEstimee: 15,
    moduleRattache: 'mod2_ecritures_base',
    
    enonce: `
Votre entreprise achète du matériel informatique pour 800,000 XOF HT + TVA 18%.
Le règlement s'effectue par chèque.

**Travail demandé :** Enregistrer cette opération.
    `,
    
    solution: `
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 244100 | Matériel informatique | 800,000 | |
| 445100 | TVA déductible | 144,000 | |
| 521100 | Banque | | 944,000 |
    `,
    
    pointsCles: [
      'Utilisation compte classe 2 pour immobilisation',
      'TVA déductible identique aux achats',
      'Règlement par banque'
    ]
  },

  {
    id: 'ex_retour_marchandises',
    titre: 'Retour de Marchandises',
    description: 'Gestion d\'un retour client avec avoir',
    difficulte: NiveauDifficulte.FACILE,
    dureeEstimee: 20,
    moduleRattache: 'mod2_ecritures_base',
    
    enonce: `
Un client retourne des marchandises défectueuses pour 300,000 XOF HT + TVA 18%.
Vous lui établissez un avoir.

**Travail demandé :** Enregistrer l'avoir.
    `,
    
    solution: `
| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 701100 | Ventes de marchandises | 300,000 | |
| 443100 | TVA collectée | 54,000 | |
| 411100 | Clients | | 354,000 |
    `,
    
    pointsCles: [
      'Inverse de l\'écriture de vente',
      'Diminution du chiffre d\'affaires',
      'Réduction de la TVA collectée'
    ]
  }
];

/**
 * Configuration spécifique pour l'intégration E-COMPTA-IA
 */
export const CONFIGURATION_FORMATION_2018 = {
  integration: {
    modulesElearning: true,
    assistantIA: true,
    evaluationAutomatique: true,
    certificateGeneration: true
  },
  
  tracking: {
    progressionUtilisateur: true,
    tempsApprentissage: true,
    difficultesIdentifiees: true,
    recommandationsPersonnalisees: true
  },
  
  gamification: {
    pointsParExercice: 10,
    badgesDisponibles: [
      'Débutant SYSCOHADA',
      'Expert Écritures',
      'Maître TVA',
      'Champion Paie'
    ],
    classementsCommunautaires: true
  }
};