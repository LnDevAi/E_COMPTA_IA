// =====================================================
// CONTENU COMPLET DES COURS SYSCOHADA E-COMPTA-IA
// Parcours d'apprentissage de la comptabilité OHADA
// =====================================================

import {
  CoursComptabilite,
  ModuleCours,
  Lecon,
  Quiz,
  Question,
  ExercicePratique,
  NiveauCours,
  CategorieComptable,
  NiveauAccesElearning,
  TypeContenu,
  TypeQuestion,
  TypeExercice,
  TypeCertification,
  StatutCours,
  NiveauCompetence
} from '../models/elearning.model';

// =====================================================
// COURS 1: FONDAMENTAUX DU SYSCOHADA
// =====================================================

export const COURS_FONDAMENTAUX_SYSCOHADA: CoursComptabilite = {
  id: 'syscohada-fundamentals',
  titre: 'Fondamentaux du SYSCOHADA AUDCIF',
  description: 'Maîtrisez les bases essentielles du système comptable OHADA et découvrez les principes fondamentaux de la comptabilité dans l\'espace OHADA',
  slug: 'fondamentaux-syscohada',
  niveau: NiveauCours.DEBUTANT,
  categorie: CategorieComptable.SYSCOHADA,
  dureeEstimee: 30,
  langue: 'fr',
  
  modules: [
    {
      id: 'module-1-introduction',
      coursId: 'syscohada-fundamentals',
      titre: 'Introduction au SYSCOHADA',
      description: 'Découvrez l\'histoire, la philosophie et les objectifs du système comptable OHADA',
      ordre: 1,
      dureeEstimee: 8,
      lecons: [
        {
          id: 'lecon-1-1',
          moduleId: 'module-1-introduction',
          titre: 'Histoire et contexte de l\'OHADA',
          description: 'Comprendre les origines et l\'évolution du droit comptable OHADA',
          ordre: 1,
          dureeEstimee: 45,
          contenu: {
            id: 'contenu-1-1',
            type: TypeContenu.VIDEO,
            titre: 'Histoire de l\'OHADA et contexte économique africain',
            urlVideo: '/videos/ohada-histoire.mp4',
            duree: 25,
            transcription: 'L\'Organisation pour l\'Harmonisation en Afrique du Droit des Affaires (OHADA) a été créée en 1993...',
            sousTitres: []
          },
          videos: [],
          documents: [
            {
              id: 'doc-1-1-1',
              nom: 'Traité OHADA - Texte officiel',
              type: 'PDF',
              url: '/documents/traite-ohada.pdf'
            },
            {
              id: 'doc-1-1-2',
              nom: 'Chronologie de l\'OHADA',
              type: 'PDF',
              url: '/documents/chronologie-ohada.pdf'
            }
          ],
          schemas: [],
          exemplesChiffres: [],
          exercicesInteractifs: [],
          casEtudes: [],
          obligatoire: true,
          marqueeComplete: false,
          tempsConsomme: 0,
          pointsVerification: [
            {
              id: 'verif-1-1-1',
              position: 15,
              question: 'En quelle année a été créée l\'OHADA ?',
              reponseCorrecte: '1993',
              type: 'numerique'
            }
          ]
        },
        {
          id: 'lecon-1-2',
          moduleId: 'module-1-introduction',
          titre: 'Les 17 pays membres de l\'OHADA',
          description: 'Exploration géographique et économique de l\'espace OHADA',
          ordre: 2,
          dureeEstimee: 30,
          contenu: {
            id: 'contenu-1-2',
            type: TypeContenu.SCHEMA,
            titre: 'Carte interactive des pays OHADA',
            images: ['/images/carte-ohada.svg']
          },
          videos: [],
          documents: [],
          schemas: [],
          exemplesChiffres: [],
          exercicesInteractifs: [
            {
              id: 'exercice-1-2-1',
              titre: 'Quiz interactif - Pays OHADA',
              type: 'identification-pays',
              description: 'Identifiez les pays membres sur la carte'
            }
          ],
          casEtudes: [],
          obligatoire: true,
          marqueeComplete: false,
          tempsConsomme: 0,
          pointsVerification: []
        },
        {
          id: 'lecon-1-3',
          moduleId: 'module-1-introduction',
          titre: 'Objectifs et avantages du SYSCOHADA',
          description: 'Les bénéfices de l\'harmonisation comptable pour les entreprises',
          ordre: 3,
          dureeEstimee: 40,
          contenu: {
            id: 'contenu-1-3',
            type: TypeContenu.TEXTE,
            titre: 'Avantages du SYSCOHADA pour les entreprises',
            texte: `Le SYSCOHADA AUDCIF apporte de nombreux avantages :
            
            **Harmonisation et standardisation**
            - Normes comptables unifiées sur 17 pays
            - Facilitation des échanges économiques
            - Comparabilité des états financiers
            
            **Amélioration de la transparence**
            - Informations financières fiables
            - Confiance des investisseurs renforcée
            - Accès facilité au financement
            
            **Conformité internationale**
            - Rapprochement avec les normes IFRS
            - Reconnaissance internationale des états financiers
            - Intégration dans l'économie mondiale`
          },
          videos: [],
          documents: [],
          schemas: [],
          exemplesChiffres: [],
          exercicesInteractifs: [],
          casEtudes: [],
          obligatoire: true,
          marqueeComplete: false,
          tempsConsomme: 0,
          pointsVerification: []
        }
      ],
      prerequisModules: [],
      objectifs: [
        'Comprendre le contexte historique et géographique de l\'OHADA',
        'Identifier les 17 pays membres et leurs spécificités',
        'Analyser les avantages du SYSCOHADA pour les entreprises'
      ],
      quizModule: {
        id: 'quiz-module-1',
        titre: 'Évaluation - Introduction au SYSCOHADA',
        description: 'Testez vos connaissances sur les fondamentaux de l\'OHADA',
        type: 'evaluation-module',
        dureeMaximale: 20,
        nombreTentatives: 3,
        melangementQuestions: true,
        melangementReponses: true,
        questions: [
          {
            id: 'q1-1',
            type: TypeQuestion.QCU,
            enonce: 'Combien de pays sont membres de l\'OHADA ?',
            reponses: [
              { id: 'r1', texte: '15 pays', correcte: false },
              { id: 'r2', texte: '17 pays', correcte: true },
              { id: 'r3', texte: '19 pays', correcte: false },
              { id: 'r4', texte: '21 pays', correcte: false }
            ],
            explicationCorrection: 'L\'OHADA compte actuellement 17 pays membres, tous situés en Afrique subsaharienne.',
            pointsQuestion: 2,
            difficulte: 'facile',
            tempsReponseRecommande: 30,
            motsCles: ['OHADA', 'pays membres'],
            tauxReussite: 85,
            tempsReponseNoyen: 25
          },
          {
            id: 'q1-2',
            type: TypeQuestion.QCM,
            enonce: 'Quels sont les principaux avantages du SYSCOHADA ? (Plusieurs réponses possibles)',
            reponses: [
              { id: 'r1', texte: 'Harmonisation des normes comptables', correcte: true },
              { id: 'r2', texte: 'Facilitation des échanges économiques', correcte: true },
              { id: 'r3', texte: 'Complexification des procédures', correcte: false },
              { id: 'r4', texte: 'Amélioration de la transparence financière', correcte: true }
            ],
            explicationCorrection: 'Le SYSCOHADA vise à harmoniser, faciliter et améliorer la transparence, pas à complexifier.',
            pointsQuestion: 3,
            difficulte: 'moyen',
            tempsReponseRecommande: 45,
            motsCles: ['avantages', 'harmonisation', 'transparence'],
            tauxReussite: 72,
            tempsReponseNoyen: 40
          }
        ],
        notePassage: 70,
        feedbackImmediat: true,
        affichageCorrection: true,
        certificatReussite: false,
        statistiques: {
          nombrePassages: 0,
          noteMoyenne: 0,
          tauxReussite: 0,
          tempsModyen: 0
        }
      },
      exercicesPratiques: [],
      documentsSupport: [],
      outilsRecommandes: ['Calculatrice', 'Bloc-notes'],
      obligatoire: true,
      seuileReussite: 70,
      dateCreation: new Date(),
      auteur: 'Dr. Kouassi Michel'
    },
    
    {
      id: 'module-2-plan-comptable',
      coursId: 'syscohada-fundamentals',
      titre: 'Le Plan Comptable SYSCOHADA',
      description: 'Maîtrisez la structure et l\'organisation du plan comptable AUDCIF',
      ordre: 2,
      dureeEstimee: 12,
      lecons: [
        {
          id: 'lecon-2-1',
          moduleId: 'module-2-plan-comptable',
          titre: 'Structure générale du plan comptable',
          description: 'Découvrez l\'organisation en 9 classes du plan SYSCOHADA',
          ordre: 1,
          dureeEstimee: 60,
          contenu: {
            id: 'contenu-2-1',
            type: TypeContenu.TABLEAU,
            titre: 'Les 9 classes du plan comptable SYSCOHADA',
            tableau: {
              titre: 'Plan comptable SYSCOHADA - Vue d\'ensemble',
              colonnes: ['Classe', 'Intitulé', 'Nature', 'Exemples'],
              lignes: [
                ['1', 'Comptes de ressources durables', 'Passif', 'Capital, Emprunts'],
                ['2', 'Comptes d\'actif immobilisé', 'Actif', 'Immobilisations'],
                ['3', 'Comptes de stocks', 'Actif', 'Marchandises, Matières'],
                ['4', 'Comptes de tiers', 'Actif/Passif', 'Clients, Fournisseurs'],
                ['5', 'Comptes de trésorerie', 'Actif', 'Banque, Caisse'],
                ['6', 'Comptes de charges', 'Charges', 'Achats, Services'],
                ['7', 'Comptes de produits', 'Produits', 'Ventes, Prestations'],
                ['8', 'Comptes de résultats', 'Résultat', 'Résultat de l\'exercice'],
                ['9', 'Comptes de la comptabilité analytique', 'Analytique', 'Centres de coûts']
              ]
            }
          },
          videos: [
            {
              id: 'video-2-1-1',
              titre: 'Présentation détaillée des 9 classes',
              description: 'Explication approfondie de chaque classe comptable',
              urlVideo: '/videos/9-classes-syscohada.mp4',
              duree: 35,
              qualites: ['720p', '1080p'],
              chapitres: [
                { titre: 'Introduction', debut: 0, fin: 5 },
                { titre: 'Classes 1-3: Patrimoine', debut: 5, fin: 15 },
                { titre: 'Classes 4-5: Exploitation', debut: 15, fin: 25 },
                { titre: 'Classes 6-9: Gestion', debut: 25, fin: 35 }
              ],
              marqueurs: [],
              transcription: 'Le plan comptable SYSCOHADA s\'organise en 9 classes...',
              sousTitres: [],
              questionsEmbedded: [
                {
                  position: 10,
                  question: 'Quelle classe concerne les immobilisations ?',
                  options: ['Classe 1', 'Classe 2', 'Classe 3'],
                  reponseCorrecte: 1
                }
              ],
              annotations: [],
              vuesTotal: 0,
              tempsVisionne: 0,
              tauxCompletion: 0
            }
          ],
          documents: [
            {
              id: 'doc-2-1-1',
              nom: 'Plan comptable SYSCOHADA complet',
              type: 'PDF',
              url: '/documents/plan-comptable-syscohada.pdf'
            }
          ],
          schemas: [],
          exemplesChiffres: [
            {
              id: 'exemple-2-1-1',
              titre: 'Exemple de codification comptable',
              description: 'Comment coder un compte client',
              donnees: {
                compte: '411000',
                intitule: 'Clients ordinaires',
                classe: '4 - Comptes de tiers',
                sousClasse: '41 - Clients et comptes rattachés',
                explication: 'Le compte 411000 fait partie de la classe 4 (tiers), sous-classe 41 (clients)'
              }
            }
          ],
          exercicesInteractifs: [
            {
              id: 'exercice-2-1-1',
              titre: 'Classification interactive',
              type: 'drag-drop',
              description: 'Classez les comptes dans les bonnes catégories'
            }
          ],
          casEtudes: [],
          obligatoire: true,
          marqueeComplete: false,
          tempsConsomme: 0,
          pointsVerification: []
        },
        {
          id: 'lecon-2-2',
          moduleId: 'module-2-plan-comptable',
          titre: 'Codification et numérotation',
          description: 'Apprenez les règles de codification des comptes SYSCOHADA',
          ordre: 2,
          dureeEstimee: 45,
          contenu: {
            id: 'contenu-2-2',
            type: TypeContenu.TEXTE,
            titre: 'Règles de codification SYSCOHADA',
            markdown: `# Codification des comptes SYSCOHADA

## Principe général
La codification SYSCOHADA utilise un système décimal hiérarchique :

### Structure du code compte
- **1er chiffre** : Classe (1 à 9)
- **2ème chiffre** : Sous-classe
- **3ème chiffre** : Compte principal
- **4-6ème chiffres** : Sous-comptes

### Exemples pratiques
\`\`\`
411000 - Clients ordinaires
├── 4 : Classe des tiers
├── 1 : Clients et comptes rattachés
├── 1 : Clients ordinaires
└── 000 : Compte général
\`\`\`

### Subdivision possible
\`\`\`
411100 - Clients - Catégorie A
411200 - Clients - Catégorie B
411300 - Clients - Exports
\`\`\``
          },
          videos: [],
          documents: [],
          schemas: [],
          exemplesChiffres: [],
          exercicesInteractifs: [
            {
              id: 'exercice-2-2-1',
              titre: 'Atelier de codification',
              type: 'saisie-code',
              description: 'Créez les codes comptables appropriés pour différentes situations'
            }
          ],
          casEtudes: [],
          obligatoire: true,
          marqueeComplete: false,
          tempsConsomme: 0,
          pointsVerification: []
        }
      ],
      prerequisModules: ['module-1-introduction'],
      objectifs: [
        'Maîtriser la structure en 9 classes du plan SYSCOHADA',
        'Comprendre les règles de codification et numérotation',
        'Savoir classifier les comptes selon leur nature'
      ],
      quizModule: {
        id: 'quiz-module-2',
        titre: 'Évaluation - Plan Comptable',
        description: 'Évaluez votre compréhension du plan comptable SYSCOHADA',
        type: 'evaluation-module',
        dureeMaximale: 30,
        nombreTentatives: 3,
        melangementQuestions: true,
        melangementReponses: true,
        questions: [
          {
            id: 'q2-1',
            type: TypeQuestion.CORRESPONDANCE,
            enonce: 'Associez chaque classe à son contenu principal',
            correspondances: [
              { gauche: 'Classe 1', droite: 'Ressources durables' },
              { gauche: 'Classe 2', droite: 'Actif immobilisé' },
              { gauche: 'Classe 6', droite: 'Charges' },
              { gauche: 'Classe 7', droite: 'Produits' }
            ],
            explicationCorrection: 'Chaque classe a un rôle spécifique dans l\'organisation comptable.',
            pointsQuestion: 4,
            difficulte: 'moyen',
            tempsReponseRecommande: 60,
            motsCles: ['classes', 'plan comptable'],
            tauxReussite: 68,
            tempsReponseNoyen: 55
          }
        ],
        notePassage: 75,
        feedbackImmediat: true,
        affichageCorrection: true,
        certificatReussite: false,
        statistiques: {
          nombrePassages: 0,
          noteMoyenne: 0,
          tauxReussite: 0,
          tempsModyen: 0
        }
      },
      exercicesPratiques: [
        {
          id: 'exercice-module-2-1',
          titre: 'Création d\'un plan comptable simplifié',
          description: 'Créez un plan comptable pour une PME de commerce',
          type: TypeExercice.CAS_PRATIQUE,
          difficulte: 'moyen',
          dureeEstimee: 90,
          pointsMax: 20,
          enonce: `Vous êtes chargé de créer le plan comptable d'une société de commerce de matériaux de construction.

**Données de l'entreprise :**
- Forme : SARL
- Capital : 10 000 000 FCFA
- Activité : Commerce de gros de matériaux de construction
- Effectif : 15 salariés

**Travail demandé :**
1. Proposez une liste de 30 comptes minimum
2. Respectez la codification SYSCOHADA
3. Justifiez vos choix pour 5 comptes`,
          donneesInitiales: {
            typeEntreprise: 'Commerce',
            secteur: 'Matériaux de construction',
            forme: 'SARL',
            capital: 10000000
          },
          etapesAttendue: [
            { ordre: 1, description: 'Identifier les comptes de base nécessaires' },
            { ordre: 2, description: 'Appliquer la codification SYSCOHADA' },
            { ordre: 3, description: 'Organiser par classes' },
            { ordre: 4, description: 'Justifier les choix' }
          ],
          solutionType: 'libre-avec-criteres',
          solutionDetaillee: 'Solution type avec plan comptable complet...',
          criteresEvaluation: [
            { critere: 'Respect de la codification', points: 5 },
            { critere: 'Complétude du plan', points: 5 },
            { critere: 'Pertinence des comptes', points: 5 },
            { critere: 'Justifications', points: 5 }
          ],
          feedbackPersonnalise: [],
          outilsAutorises: ['Plan comptable SYSCOHADA', 'Calculatrice'],
          documentsReferences: ['Plan comptable SYSCOHADA complet'],
          nombreTentatives: 0,
          tauxReussite: 0,
          erreursCourantes: []
        }
      ],
      documentsSupport: [],
      outilsRecommandes: ['Plan comptable SYSCOHADA', 'Logiciel comptable'],
      obligatoire: true,
      seuileReussite: 75,
      dateCreation: new Date(),
      auteur: 'Dr. Kouassi Michel'
    }
  ],
  
  prerequis: [],
  objectifs: [
    {
      id: 'obj-global-1',
      description: 'Maîtriser les fondamentaux du système comptable OHADA',
      niveau: NiveauCompetence.FONDAMENTAL,
      competencesCibles: ['SYSCOHADA', 'plan-comptable', 'codification'],
      mesurable: true,
      critereReussite: 'Réussir l\'examen final avec une note ≥ 75%'
    },
    {
      id: 'obj-global-2',
      description: 'Comprendre l\'organisation et la structure du plan comptable AUDCIF',
      niveau: NiveauCompetence.FONDAMENTAL,
      competencesCibles: ['classification-comptes', 'organisation-comptable'],
      mesurable: true,
      critereReussite: 'Compléter tous les exercices pratiques avec succès'
    }
  ],
  
  introduction: {
    id: 'intro-cours-1',
    type: TypeContenu.VIDEO,
    titre: 'Bienvenue dans votre formation SYSCOHADA',
    urlVideo: '/videos/introduction-cours-syscohada.mp4',
    duree: 10,
    transcription: 'Bienvenue dans cette formation complète sur les fondamentaux du SYSCOHADA...'
  },
  
  ressourcesComplementaires: [],
  bibliographie: [
    'Acte uniforme relatif au droit comptable et à l\'information financière (AUDCIF)',
    'Guide d\'application du SYSCOHADA - Version 2019',
    'Plan comptable général SYSCOHADA',
    'Droit comptable OHADA - Éditions ENA'
  ],
  
  evaluations: [
    {
      id: 'evaluation-finale-cours-1',
      type: 'examen-final',
      titre: 'Examen final - Fondamentaux SYSCOHADA',
      description: 'Évaluation complète de vos acquis sur les fondamentaux du SYSCOHADA',
      dureeMaximale: 120,
      nombreTentatives: 2,
      noteMinimale: 75,
      sections: [
        {
          id: 'section-1',
          titre: 'Questions théoriques',
          pointsMax: 60,
          dureeMax: 60
        },
        {
          id: 'section-2',
          titre: 'Cas pratique',
          pointsMax: 40,
          dureeMax: 60
        }
      ],
      pointsTotal: 100,
      dateOuverture: new Date(),
      disponibilitePersonnalisee: false,
      surveillanceActivee: true,
      detecteurTricherie: true,
      verrouillageNavigateur: true,
      genereCertificat: true,
      templateCertificat: 'certificat-syscohada-fondamentaux',
      validiteCertificat: 24
    }
  ],
  
  certification: {
    disponible: true,
    type: TypeCertification.COURS_COMPLET,
    validite: 24,
    prerequis: ['evaluation-finale-cours-1']
  },
  
  niveauAbonnementRequis: NiveauAccesElearning.PROFESSIONAL,
  gratuit: false,
  prix: 49,
  nombreEtudiants: 247,
  notemoyenne: 82.5,
  tauxReussite: 87.3,
  
  auteur: {
    id: 'formateur-1',
    nom: 'Dr. Kouassi Michel',
    titre: 'Expert-comptable SYSCOHADA certifié',
    experience: '15 ans d\'expérience en formation comptable OHADA',
    certifications: [
      'Expert-comptable diplômé OHADA',
      'Formateur agréé SYSCOHADA',
      'Auditeur certifié IFRS'
    ]
  },
  
  dateCreation: new Date('2024-01-15'),
  derniereModification: new Date('2024-12-01'),
  version: '2.1',
  statut: StatutCours.PUBLIE,
  
  motsCles: [
    'SYSCOHADA', 'OHADA', 'comptabilité', 'plan comptable',
    'AUDCIF', 'normalisation', 'Afrique', 'harmonisation'
  ],
  imagePreview: '/images/cours/syscohada-fundamentals-preview.jpg',
  videoIntro: '/videos/syscohada-intro-30s.mp4'
};

// =====================================================
// COURS 2: TENUE DE COMPTABILITÉ SYSCOHADA
// =====================================================

export const COURS_TENUE_COMPTABILITE: CoursComptabilite = {
  id: 'tenue-comptabilite-syscohada',
  titre: 'Tenue de Comptabilité selon SYSCOHADA',
  description: 'Apprenez à tenir une comptabilité complète selon les normes SYSCOHADA : écritures, journaux, grand livre et balance',
  slug: 'tenue-comptabilite-syscohada',
  niveau: NiveauCours.INTERMEDIAIRE,
  categorie: CategorieComptable.COMPTABILITE_GENERALE,
  dureeEstimee: 45,
  langue: 'fr',
  
  modules: [
    {
      id: 'module-ecritures',
      coursId: 'tenue-comptabilite-syscohada',
      titre: 'Les Écritures Comptables',
      description: 'Maîtrisez l\'art de la passation des écritures comptables',
      ordre: 1,
      dureeEstimee: 15,
      lecons: [
        {
          id: 'lecon-principe-partie-double',
          moduleId: 'module-ecritures',
          titre: 'Principe de la partie double',
          description: 'Comprendre et appliquer le principe fondamental de la comptabilité',
          ordre: 1,
          dureeEstimee: 60,
          contenu: {
            id: 'contenu-partie-double',
            type: TypeContenu.SIMULATION,
            titre: 'Simulation interactive de la partie double',
            simulation: {
              id: 'sim-partie-double',
              nom: 'Atelier partie double',
              description: 'Pratiquez la partie double avec des opérations réelles',
              type: 'TENUE_COMPTABILITE',
              entrepriseVirtuelle: {
                nom: 'Entreprise Virtuelle SARL',
                secteur: 'Commerce',
                capitale: 5000000
              },
              scenarioInitial: {
                titre: 'Première semaine d\'activité',
                operations: [
                  'Création de l\'entreprise',
                  'Achat de marchandises',
                  'Première vente',
                  'Paiement fournisseur'
                ]
              },
              operationsDisponibles: [],
              documentsGeneres: [],
              objectifsSimulation: [
                'Respecter la partie double',
                'Équilibrer débit et crédit',
                'Choisir les bons comptes'
              ],
              criteresEvaluation: [],
              indicesDisponibles: [],
              tutorielInterne: true
            }
          },
          videos: [],
          documents: [],
          schemas: [],
          exemplesChiffres: [
            {
              id: 'exemple-achat-marchandises',
              titre: 'Achat de marchandises à crédit',
              description: 'Exemple complet d\'écriture d\'achat',
              donnees: {
                operation: 'Achat marchandises 500 000 F à crédit',
                ecriture: {
                  debit: { compte: '601100', intitule: 'Achats de marchandises', montant: 500000 },
                  credit: { compte: '401100', intitule: 'Fournisseurs ordinaires', montant: 500000 }
                },
                explication: 'L\'achat augmente les charges (débit 601) et les dettes fournisseurs (crédit 401)'
              }
            }
          ],
          exercicesInteractifs: [],
          casEtudes: [],
          obligatoire: true,
          marqueeComplete: false,
          tempsConsomme: 0,
          pointsVerification: []
        }
      ],
      prerequisModules: [],
      objectifs: [
        'Maîtriser le principe de la partie double',
        'Savoir identifier débit et crédit',
        'Passer des écritures équilibrées'
      ],
      exercicesPratiques: [
        {
          id: 'exercice-ecritures-base',
          titre: 'Passation d\'écritures de base',
          description: 'Passez 10 écritures comptables courantes',
          type: TypeExercice.ECRITURE_COMPTABLE,
          difficulte: 'facile',
          dureeEstimee: 45,
          pointsMax: 20,
          enonce: 'Passez les écritures correspondant aux opérations suivantes...',
          donneesInitiales: {
            operations: [
              'Vente marchandises 750 000 F espèces',
              'Achat fournitures 125 000 F chèque',
              'Règlement client 450 000 F banque'
            ]
          },
          etapesAttendue: [],
          solutionType: 'automatique',
          solutionDetaillee: '',
          criteresEvaluation: [],
          feedbackPersonnalise: [],
          outilsAutorises: ['Plan comptable'],
          documentsReferences: [],
          nombreTentatives: 0,
          tauxReussite: 0,
          erreursCourantes: []
        }
      ],
      documentsSupport: [],
      outilsRecommandes: [],
      obligatoire: true,
      seuileReussite: 80,
      dateCreation: new Date(),
      auteur: 'Dr. Kouassi Michel'
    }
  ],
  
  prerequis: ['syscohada-fundamentals'],
  objectifs: [],
  introduction: {
    id: 'intro-tenue-compta',
    type: TypeContenu.VIDEO,
    titre: 'Introduction à la tenue de comptabilité',
    duree: 8
  },
  ressourcesComplementaires: [],
  bibliographie: [],
  evaluations: [],
  certification: {
    disponible: true,
    type: TypeCertification.SPECIALISATION,
    validite: 36,
    prerequis: []
  },
  niveauAbonnementRequis: NiveauAccesElearning.PROFESSIONAL,
  gratuit: false,
  prix: 79,
  nombreEtudiants: 156,
  notemoyenne: 78.2,
  tauxReussite: 82.1,
  auteur: {
    id: 'formateur-1',
    nom: 'Dr. Kouassi Michel',
    titre: 'Expert-comptable SYSCOHADA',
    experience: '15 ans',
    certifications: []
  },
  dateCreation: new Date(),
  derniereModification: new Date(),
  version: '1.0',
  statut: StatutCours.PUBLIE,
  motsCles: ['tenue comptabilité', 'écritures', 'journaux'],
  imagePreview: '/images/cours/tenue-comptabilite-preview.jpg'
};

// =====================================================
// COURS 3: ANALYSE FINANCIÈRE SYSCOHADA
// =====================================================

export const COURS_ANALYSE_FINANCIERE: CoursComptabilite = {
  id: 'analyse-financiere-syscohada',
  titre: 'Analyse Financière selon SYSCOHADA',
  description: 'Maîtrisez l\'analyse des états financiers SYSCOHADA : ratios, tableaux de flux et diagnostic financier',
  slug: 'analyse-financiere-syscohada',
  niveau: NiveauCours.AVANCE,
  categorie: CategorieComptable.ANALYSE_FINANCIERE,
  dureeEstimee: 50,
  langue: 'fr',
  modules: [],
  prerequis: ['syscohada-fundamentals', 'tenue-comptabilite-syscohada'],
  objectifs: [],
  introduction: {
    id: 'intro-analyse',
    type: TypeContenu.VIDEO,
    titre: 'Introduction à l\'analyse financière',
    duree: 12
  },
  ressourcesComplementaires: [],
  bibliographie: [],
  evaluations: [],
  certification: {
    disponible: true,
    type: TypeCertification.SPECIALISATION,
    validite: 36,
    prerequis: []
  },
  niveauAbonnementRequis: NiveauAccesElearning.ENTERPRISE,
  gratuit: false,
  prix: 129,
  nombreEtudiants: 89,
  notemoyenne: 85.7,
  tauxReussite: 79.8,
  auteur: {
    id: 'formateur-2',
    nom: 'Mme. Fatou Diallo',
    titre: 'Analyste financière senior',
    experience: '12 ans',
    certifications: ['CFA', 'Expert-comptable']
  },
  dateCreation: new Date(),
  derniereModification: new Date(),
  version: '1.0',
  statut: StatutCours.PUBLIE,
  motsCles: ['analyse financière', 'ratios', 'diagnostic'],
  imagePreview: '/images/cours/analyse-financiere-preview.jpg'
};

// =====================================================
// CATALOGUE COMPLET DES COURS
// =====================================================

export const CATALOGUE_COURS_ELEARNING: CoursComptabilite[] = [
  COURS_FONDAMENTAUX_SYSCOHADA,
  COURS_TENUE_COMPTABILITE,
  COURS_ANALYSE_FINANCIERE,
  
  // Cours gratuits pour tous niveaux d'abonnement
  {
    id: 'introduction-comptabilite',
    titre: 'Introduction à la Comptabilité',
    description: 'Découvrez les bases de la comptabilité générale',
    slug: 'introduction-comptabilite',
    niveau: NiveauCours.DEBUTANT,
    categorie: CategorieComptable.COMPTABILITE_GENERALE,
    dureeEstimee: 8,
    langue: 'fr',
    modules: [],
    prerequis: [],
    objectifs: [],
    introduction: {
      id: 'intro-base',
      type: TypeContenu.VIDEO,
      titre: 'Qu\'est-ce que la comptabilité ?',
      duree: 5
    },
    ressourcesComplementaires: [],
    bibliographie: [],
    evaluations: [],
    certification: {
      disponible: false,
      type: TypeCertification.COURS_COMPLET,
      validite: 12,
      prerequis: []
    },
    niveauAbonnementRequis: NiveauAccesElearning.GRATUIT,
    gratuit: true,
    nombreEtudiants: 1247,
    notemoyenne: 76.8,
    tauxReussite: 91.2,
    auteur: {
      id: 'formateur-3',
      nom: 'M. Jean-Paul Sagna',
      titre: 'Formateur comptabilité',
      experience: '8 ans',
      certifications: []
    },
    dateCreation: new Date(),
    derniereModification: new Date(),
    version: '1.0',
    statut: StatutCours.PUBLIE,
    motsCles: ['comptabilité', 'introduction', 'bases'],
    imagePreview: '/images/cours/intro-comptabilite-preview.jpg'
  }
];

// =====================================================
// PARCOURS D'APPRENTISSAGE RECOMMANDÉS
// =====================================================

export const PARCOURS_APPRENTISSAGE = {
  debutant: {
    titre: 'Parcours Débutant en Comptabilité',
    description: 'De zéro à comptable opérationnel en SYSCOHADA',
    dureeEstimee: 120, // heures
    cours: [
      'introduction-comptabilite',
      'syscohada-fundamentals',
      'tenue-comptabilite-syscohada'
    ],
    niveauRequis: NiveauAccesElearning.PROFESSIONAL
  },
  
  intermediaire: {
    titre: 'Parcours Intermédiaire - Spécialisation',
    description: 'Approfondissez vos compétences en comptabilité OHADA',
    dureeEstimee: 80,
    cours: [
      'tenue-comptabilite-syscohada',
      'analyse-financiere-syscohada'
    ],
    niveauRequis: NiveauAccesElearning.ENTERPRISE
  },
  
  expert: {
    titre: 'Parcours Expert - Maîtrise complète',
    description: 'Devenez expert en comptabilité et analyse financière SYSCOHADA',
    dureeEstimee: 150,
    cours: [
      'syscohada-fundamentals',
      'tenue-comptabilite-syscohada',
      'analyse-financiere-syscohada'
    ],
    niveauRequis: NiveauAccesElearning.MULTINATIONAL
  }
};

// =====================================================
// EXEMPLES DE QUESTIONS D'ÉVALUATION
// =====================================================

export const BANQUE_QUESTIONS_SYSCOHADA = [
  {
    id: 'q-sysco-001',
    type: TypeQuestion.QCU,
    categorie: CategorieComptable.SYSCOHADA,
    niveau: 'debutant',
    enonce: 'Le SYSCOHADA s\'applique dans combien de pays ?',
    reponses: [
      { id: 'a', texte: '15 pays', correcte: false },
      { id: 'b', texte: '17 pays', correcte: true },
      { id: 'c', texte: '19 pays', correcte: false },
      { id: 'd', texte: '21 pays', correcte: false }
    ],
    explicationCorrection: 'Le SYSCOHADA s\'applique dans les 17 pays membres de l\'OHADA.',
    pointsQuestion: 2,
    difficulte: 'facile',
    tempsReponseRecommande: 30,
    motsCles: ['OHADA', 'pays', 'nombre'],
    tauxReussite: 88,
    tempsReponseNoyen: 22
  },
  
  {
    id: 'q-sysco-002',
    type: TypeQuestion.NUMERIQUE,
    categorie: CategorieComptable.COMPTABILITE_GENERALE,
    niveau: 'intermediaire',
    enonce: 'Une entreprise achète des marchandises pour 250 000 F HT avec une TVA à 18%. Quel est le montant TTC ?',
    reponseNumerique: 295000,
    tolerancePourcentage: 0,
    explicationCorrection: '250 000 + (250 000 × 18%) = 250 000 + 45 000 = 295 000 F',
    pointsQuestion: 3,
    difficulte: 'moyen',
    tempsReponseRecommande: 45,
    motsCles: ['TVA', 'calcul', 'TTC'],
    tauxReussite: 72,
    tempsReponseNoyen: 38
  }
];

export default {
  CATALOGUE_COURS_ELEARNING,
  PARCOURS_APPRENTISSAGE,
  BANQUE_QUESTIONS_SYSCOHADA
};