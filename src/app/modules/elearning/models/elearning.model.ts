// =====================================================
// MODÈLES E-LEARNING E-COMPTA-IA
// Système complet de formation comptable avec certifications
// =====================================================

export interface CoursComptabilite {
  id: string;
  titre: string;
  description: string;
  slug: string;
  
  // Métadonnées du cours
  niveau: NiveauCours;
  categorie: CategorieComptable;
  dureeEstimee: number; // en heures
  langue: string;
  
  // Structure du cours
  modules: ModuleCours[];
  prerequis: string[];
  objectifs: ObjectifApprentissage[];
  
  // Contenu et ressources
  introduction: ContenuCours;
  ressourcesComplementaires: Ressource[];
  bibliographie: string[];
  
  // Évaluation et certification
  evaluations: Evaluation[];
  certification: ConfigurationCertificat;
  
  // Accès et restrictions
  niveauAbonnementRequis: NiveauAccesElearning;
  gratuit: boolean;
  prix?: number;
  
  // Statistiques et métriques
  nombreEtudiants: number;
  notemoyenne: number;
  tauxReussite: number;
  
  // Métadonnées
  auteur: Formateur;
  dateCreation: Date;
  derniereModification: Date;
  version: string;
  statut: StatutCours;
  
  // SEO et découvrabilité
  motsCles: string[];
  imagePreview: string;
  videoIntro?: string;
}

export interface ModuleCours {
  id: string;
  coursId: string;
  titre: string;
  description: string;
  ordre: number;
  
  // Structure du module
  lecons: Lecon[];
  dureeEstimee: number;
  
  // Prérequis et objectifs
  prerequisModules: string[];
  objectifs: string[];
  
  // Évaluation
  quizModule?: Quiz;
  exercicesPratiques: ExercicePratique[];
  
  // Ressources
  documentsSupport: Document[];
  outilsRecommandes: string[];
  
  // Progression
  obligatoire: boolean;
  seuileReussite: number; // Pourcentage minimum
  
  // Métadonnées
  dateCreation: Date;
  auteur: string;
}

export interface Lecon {
  id: string;
  moduleId: string;
  titre: string;
  description: string;
  ordre: number;
  
  // Contenu de la leçon
  contenu: ContenuCours;
  dureeEstimee: number; // en minutes
  
  // Médias et ressources
  videos: VideoEducative[];
  documents: Document[];
  schemas: Schema[];
  exemplesChiffres: ExempleChiffre[];
  
  // Interactivité
  exercicesInteractifs: ExerciceInteractif[];
  casEtudes: CasEtude[];
  
  // Suivi de progression
  obligatoire: boolean;
  marqueeComplete: boolean;
  tempsConsomme: number;
  
  // Évaluation
  quizRapide?: QuizRapide;
  pointsVerification: PointVerification[];
}

export interface ContenuCours {
  id: string;
  type: TypeContenu;
  titre: string;
  
  // Contenu textuel
  texte?: string;
  markdown?: string;
  html?: string;
  
  // Contenu multimédia
  urlVideo?: string;
  urlAudio?: string;
  images?: string[];
  
  // Contenu interactif
  simulation?: SimulationComptable;
  calculatrice?: CalculatriceInteractive;
  exerciceCode?: ExerciceCode;
  
  // Métadonnées
  duree?: number;
  transcription?: string;
  sousTitres?: SousTitre[];
  
  // Accessibilité
  altText?: string;
  descriptionAudio?: string;
}

export interface VideoEducative {
  id: string;
  titre: string;
  description: string;
  
  // Fichier vidéo
  urlVideo: string;
  duree: number;
  qualites: QualiteVideo[];
  
  // Contenu structuré
  chapitres: ChapitreVideo[];
  marqueurs: MarqueurVideo[];
  transcription: string;
  sousTitres: SousTitre[];
  
  // Interactivité
  questionsEmbedded: QuestionEmbedded[];
  annotations: AnnotationVideo[];
  
  // Analytics
  vuesTotal: number;
  tempsVisionne: number;
  tauxCompletion: number;
}

export interface ExercicePratique {
  id: string;
  titre: string;
  description: string;
  type: TypeExercice;
  
  // Configuration
  difficulte: DifficulteExercice;
  dureeEstimee: number;
  pointsMax: number;
  
  // Contenu de l'exercice
  enonce: string;
  donneesInitiales: any;
  etapesAttendue: EtapeExercice[];
  
  // Correction et feedback
  solutionType: SolutionType;
  solutionDetaillee: string;
  criteresEvaluation: CritereEvaluation[];
  feedbackPersonnalise: FeedbackExercice[];
  
  // Outils et ressources
  outilsAutorises: string[];
  documentsReferences: string[];
  
  // Suivi et analytics
  nombreTentatives: number;
  tauxReussite: number;
  erreursCourantes: ErreurCourante[];
}

export interface Quiz {
  id: string;
  titre: string;
  description: string;
  type: TypeQuiz;
  
  // Configuration
  dureeMaximale?: number;
  nombreTentatives: number;
  melangementQuestions: boolean;
  melangementReponses: boolean;
  
  // Questions
  questions: Question[];
  notePassage: number; // Pourcentage minimum
  
  // Feedback et résultats
  feedbackImmediat: boolean;
  affichageCorrection: boolean;
  certificatReussite: boolean;
  
  // Analytics
  statistiques: StatistiquesQuiz;
}

export interface Question {
  id: string;
  type: TypeQuestion;
  enonce: string;
  
  // Médias associés
  image?: string;
  schema?: string;
  tableau?: TableauComptable;
  
  // Réponses et correction
  reponses: ReponseQuestion[];
  explicationCorrection: string;
  pointsQuestion: number;
  
  // Métadonnées
  difficulte: DifficulteQuestion;
  tempsReponseRecommande: number;
  motsCles: string[];
  
  // Analytics
  tauxReussite: number;
  tempsReponseNoyen: number;
}

export interface Evaluation {
  id: string;
  type: TypeEvaluation;
  titre: string;
  description: string;
  
  // Configuration
  dureeMaximale: number;
  nombreTentatives: number;
  noteMinimale: number;
  
  // Contenu
  sections: SectionEvaluation[];
  pointsTotal: number;
  
  // Planification
  dateOuverture?: Date;
  dateFermeture?: Date;
  disponibilitePersonnalisee: boolean;
  
  // Surveillance et sécurité
  surveillanceActivee: boolean;
  detecteurTricherie: boolean;
  verrouillageNavigateur: boolean;
  
  // Résultats et certification
  genereCertificat: boolean;
  templateCertificat?: string;
  validiteCertificat?: number; // en mois
}

export interface Certificat {
  id: string;
  numeroUnique: string;
  
  // Bénéficiaire
  etudiantId: string;
  nomEtudiant: string;
  emailEtudiant: string;
  
  // Cours et formation
  coursId: string;
  titreCours: string;
  niveauCours: NiveauCours;
  dureeFormation: number;
  
  // Résultats
  noteObtenue: number;
  noteMaximale: number;
  pourcentageReussite: number;
  mention: MentionCertificat;
  
  // Compétences validées
  competencesValidees: CompetenceValidee[];
  objectifsAtteints: string[];
  
  // Métadonnées du certificat
  dateObtention: Date;
  dateExpiration?: Date;
  version: string;
  
  // Authentification et sécurité
  hashVerification: string;
  signatureNumerique: string;
  blockchainRecord?: BlockchainRecord;
  
  // Formatage et export
  templateUtilise: string;
  urlPublique: string;
  urlVerification: string;
  formatsPEisponibles: FormatCertificat[];
}

export interface ProgressionEtudiant {
  id: string;
  etudiantId: string;
  coursId: string;
  
  // Progression générale
  pourcentageCompletion: number;
  statut: StatutProgression;
  dateInscription: Date;
  dateDerniereActivite: Date;
  
  // Progression détaillée
  modulesCompletes: string[];
  leconsVues: ProgressionLecon[];
  exercicesRealises: ProgressionExercice[];
  
  // Performances
  noteActuelle: number;
  moyenneQuiz: number;
  moyenneExercices: number;
  
  // Temps et engagement
  tempsTotal: number; // en minutes
  nombreConnexions: number;
  streakJours: number;
  
  // Difficultés et recommandations
  difficultesIdentifiees: DifficulteIdentifiee[];
  recommandationsIA: RecommandationIA[];
  
  // Objectifs et planification
  objectifCompletion?: Date;
  rythmeApprentissage: RythmeApprentissage;
  
  // Badges et récompenses
  badgesObtenus: Badge[];
  pointsExperience: number;
  niveau: number;
}

export interface AnalyticsApprentissage {
  id: string;
  periode: PeriodeAnalyse;
  
  // Métriques globales
  nombreEtudiants: number;
  nouveauxEtudiants: number;
  etudiantsActifs: number;
  tauxCompletion: number;
  
  // Performance des cours
  coursPopulaires: CoursuLaire[];
  coursProblematiques: CoursProblematique[];
  noteMoyenne: number;
  tauxReussiteGlobal: number;
  
  // Engagement
  tempsMoyenParSession: number;
  frequenceConnexion: FrequenceConnexion;
  tauxAbandon: TauxAbandon;
  
  // Difficultés et améliorations
  questionsEchouees: QuestionEchouee[];
  exercicesProblematiques: ExerciceProblematique[];
  feedbackEtudiants: FeedbackEtudiant[];
  
  // Certificats et succès
  certificatsDelivres: number;
  competencesValidees: CompetenceValidee[];
  progressionMoyenne: number;
  
  // Prédictions IA
  predictionsReussite: PredictionReussite[];
  recommandationsAmelioration: string[];
}

// =====================================================
// ENUMERATIONS
// =====================================================

export enum NiveauCours {
  DEBUTANT = 'debutant',
  INTERMEDIAIRE = 'intermediaire',
  AVANCE = 'avance',
  EXPERT = 'expert'
}

export enum CategorieComptable {
  COMPTABILITE_GENERALE = 'comptabilite_generale',
  COMPTABILITE_ANALYTIQUE = 'comptabilite_analytique',
  FISCALITE = 'fiscalite',
  AUDIT = 'audit',
  CONTROLE_GESTION = 'controle_gestion',
  ANALYSE_FINANCIERE = 'analyse_financiere',
  SYSCOHADA = 'syscohada',
  IFRS = 'ifrs',
  NORMES_LOCALES = 'normes_locales',
  LOGICIELS_COMPTABLES = 'logiciels_comptables'
}

export enum NiveauAccesElearning {
  GRATUIT = 'gratuit',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  MULTINATIONAL = 'multinational'
}

export enum TypeContenu {
  TEXTE = 'texte',
  VIDEO = 'video',
  AUDIO = 'audio',
  SIMULATION = 'simulation',
  EXERCICE_INTERACTIF = 'exercice_interactif',
  CAS_ETUDE = 'cas_etude',
  QUIZ = 'quiz',
  SCHEMA = 'schema',
  TABLEAU = 'tableau'
}

export enum TypeExercice {
  ECRITURE_COMPTABLE = 'ecriture_comptable',
  BILAN = 'bilan',
  COMPTE_RESULTAT = 'compte_resultat',
  ANALYSE_RATIOS = 'analyse_ratios',
  CALCUL_TVA = 'calcul_tva',
  RAPPROCHEMENT_BANCAIRE = 'rapprochement_bancaire',
  BUDGET = 'budget',
  CONSOLIDATION = 'consolidation',
  CAS_PRATIQUE = 'cas_pratique'
}

export enum TypeQuestion {
  QCM = 'qcm',
  QCU = 'qcu',
  VRAI_FAUX = 'vrai_faux',
  REPONSE_COURTE = 'reponse_courte',
  REPONSE_LONGUE = 'reponse_longue',
  NUMERIQUE = 'numerique',
  CORRESPONDANCE = 'correspondance',
  CLASSEMENT = 'classement',
  ZONES_CLIQUABLES = 'zones_cliquables'
}

export enum TypeEvaluation {
  QUIZ_MODULE = 'quiz_module',
  EXAMEN_INTERMEDIAIRE = 'examen_intermediaire',
  EXAMEN_FINAL = 'examen_final',
  PROJET_PRATIQUE = 'projet_pratique',
  EVALUATION_CONTINUE = 'evaluation_continue'
}

export enum MentionCertificat {
  PASSABLE = 'passable',
  ASSEZ_BIEN = 'assez_bien',
  BIEN = 'bien',
  TRES_BIEN = 'tres_bien',
  EXCELLENT = 'excellent'
}

export enum StatutProgression {
  NON_COMMENCE = 'non_commence',
  EN_COURS = 'en_cours',
  COMPLETE = 'complete',
  SUSPENDU = 'suspendu',
  ABANDONNE = 'abandonne',
  CERTIFIE = 'certifie'
}

export enum RythmeApprentissage {
  INTENSIF = 'intensif',        // 2h+/jour
  REGULIER = 'regulier',        // 1h/jour
  FLEXIBLE = 'flexible',        // À son rythme
  WEEKEND = 'weekend'           // Weekends uniquement
}

// =====================================================
// INTERFACES COMPLÉMENTAIRES
// =====================================================

export interface ObjectifApprentissage {
  id: string;
  description: string;
  niveau: NiveauCompetence;
  competencesCibles: string[];
  mesurable: boolean;
  critereReussite: string;
}

export interface CompetenceValidee {
  id: string;
  nom: string;
  description: string;
  niveau: NiveauCompetence;
  domaine: DomaineCompetence;
  dateValidation: Date;
  preuveValidation: string;
}

export interface Badge {
  id: string;
  nom: string;
  description: string;
  icone: string;
  couleur: string;
  critereObtention: string;
  rarete: RareteBadge;
  dateObtention: Date;
  pointsExperience: number;
}

export interface RecommandationIA {
  type: TypeRecommandation;
  priorite: PrioriteRecommandation;
  titre: string;
  description: string;
  actions: ActionRecommandee[];
  dateGeneration: Date;
  confidence: number; // 0-1
}

export interface SimulationComptable {
  id: string;
  nom: string;
  description: string;
  type: TypeSimulation;
  
  // Configuration
  entrepriseVirtuelle: EntrepriseVirtuelle;
  scenarioInitial: ScenarioComptable;
  
  // Interactions possibles
  operationsDisponibles: OperationComptable[];
  documentsGeneres: DocumentSimulation[];
  
  // Évaluation
  objectifsSimulation: string[];
  criteresEvaluation: CritereEvaluationSimulation[];
  
  // Aide et guidage
  indicesDisponibles: IndiceSimulation[];
  tutorielInterne: boolean;
}

export interface CasEtude {
  id: string;
  titre: string;
  description: string;
  secteurActivite: string;
  
  // Contexte
  contexteEntreprise: string;
  problematiqueComptable: string;
  donnees: DonneesCasEtude;
  
  // Questions et analyse
  questionsAnalyse: QuestionAnalyse[];
  livrableAttendu: LivrableAttendu;
  
  // Ressources
  documentsSupport: DocumentCasEtude[];
  outilsRecommandes: string[];
  
  // Évaluation
  grilleEvaluation: GrilleEvaluation;
  exempleSolution: string;
  variantesSolution: string[];
}

// =====================================================
// DONNÉES DE RÉFÉRENCE - COURS SYSCOHADA
// =====================================================

export const COURS_SYSCOHADA_CATALOG: CoursComptabilite[] = [
  {
    id: 'syscohada-fundamentals',
    titre: 'Fondamentaux du SYSCOHADA',
    description: 'Maîtrisez les bases du système comptable OHADA',
    slug: 'fondamentaux-syscohada',
    niveau: NiveauCours.DEBUTANT,
    categorie: CategorieComptable.SYSCOHADA,
    dureeEstimee: 25,
    langue: 'fr',
    modules: [], // À définir
    prerequis: [],
    objectifs: [
      {
        id: 'obj1',
        description: 'Comprendre la structure du plan comptable SYSCOHADA',
        niveau: NiveauCompetence.FONDAMENTAL,
        competencesCibles: ['plan-comptable', 'classification-comptes'],
        mesurable: true,
        critereReussite: 'Quiz réussi à 80%'
      }
    ],
    introduction: {
      id: 'intro1',
      type: TypeContenu.VIDEO,
      titre: 'Introduction au SYSCOHADA',
      urlVideo: '/videos/syscohada-intro.mp4',
      duree: 15
    },
    ressourcesComplementaires: [],
    bibliographie: [
      'Acte uniforme relatif au droit comptable et à l\'information financière',
      'Guide d\'application du SYSCOHADA'
    ],
    evaluations: [],
    certification: {
      disponible: true,
      type: TypeCertification.COURS_COMPLET,
      validite: 24,
      prerequis: ['quiz-final']
    },
    niveauAbonnementRequis: NiveauAccesElearning.PROFESSIONAL,
    gratuit: false,
    prix: 49,
    nombreEtudiants: 0,
    notemoyenne: 0,
    tauxReussite: 0,
    auteur: {
      id: 'formateur1',
      nom: 'Dr. Kouassi Michel',
      titre: 'Expert-comptable SYSCOHADA',
      experience: '15 ans',
      certifications: ['Expert-comptable', 'Formateur agréé OHADA']
    },
    dateCreation: new Date(),
    derniereModification: new Date(),
    version: '1.0',
    statut: StatutCours.PUBLIE,
    motsCles: ['SYSCOHADA', 'OHADA', 'comptabilité', 'plan comptable'],
    imagePreview: '/images/cours/syscohada-preview.jpg',
    videoIntro: '/videos/syscohada-intro-courte.mp4'
  },
  {
    id: 'analyse-financiere-syscohada',
    titre: 'Analyse Financière avec SYSCOHADA',
    description: 'Analysez les états financiers selon les normes OHADA',
    slug: 'analyse-financiere-syscohada',
    niveau: NiveauCours.INTERMEDIAIRE,
    categorie: CategorieComptable.ANALYSE_FINANCIERE,
    dureeEstimee: 35,
    langue: 'fr',
    modules: [],
    prerequis: ['syscohada-fundamentals'],
    objectifs: [],
    introduction: {
      id: 'intro2',
      type: TypeContenu.VIDEO,
      titre: 'Introduction à l\'analyse financière',
      duree: 20
    },
    ressourcesComplementaires: [],
    bibliographie: [],
    evaluations: [],
    certification: {
      disponible: true,
      type: TypeCertification.SPECIALISATION,
      validite: 36,
      prerequis: ['projet-analyse']
    },
    niveauAbonnementRequis: NiveauAccesElearning.ENTERPRISE,
    gratuit: false,
    prix: 89,
    nombreEtudiants: 0,
    notemoyenne: 0,
    tauxReussite: 0,
    auteur: {
      id: 'formateur2',
      nom: 'Mme. Fatou Diallo',
      titre: 'Analyste financière senior',
      experience: '12 ans',
      certifications: ['CFA', 'Expert-comptable']
    },
    dateCreation: new Date(),
    derniereModification: new Date(),
    version: '1.0',
    statut: StatutCours.PUBLIE,
    motsCles: ['analyse financière', 'ratios', 'états financiers'],
    imagePreview: '/images/cours/analyse-financiere-preview.jpg'
  }
];

// =====================================================
// UTILITAIRES ET HELPERS
// =====================================================

export function obtenirCoursParNiveauAbonnement(niveauAbonnement: NiveauAccesElearning): CoursComptabilite[] {
  const hierarchie = {
    [NiveauAccesElearning.GRATUIT]: 0,
    [NiveauAccesElearning.STARTER]: 1,
    [NiveauAccesElearning.PROFESSIONAL]: 2,
    [NiveauAccesElearning.ENTERPRISE]: 3,
    [NiveauAccesElearning.MULTINATIONAL]: 4
  };

  const niveauUtilisateur = hierarchie[niveauAbonnement];
  
  return COURS_SYSCOHADA_CATALOG.filter(cours => {
    const niveauRequis = hierarchie[cours.niveauAbonnementRequis];
    return niveauUtilisateur >= niveauRequis;
  });
}

export function calculerPourcentageProgression(progression: ProgressionEtudiant): number {
  // Calcul détaillé basé sur les modules, leçons et exercices
  const totalElements = progression.leconsVues.length + progression.exercicesRealises.length;
  const elementsCompletes = progression.leconsVues.filter(l => l.complete).length + 
                           progression.exercicesRealises.filter(e => e.reussi).length;
  
  return totalElements > 0 ? (elementsCompletes / totalElements) * 100 : 0;
}

export function genererNumeroCertificat(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ECOMPTA-CERT-${timestamp}-${random}`.toUpperCase();
}

export function determinerMention(pourcentage: number): MentionCertificat {
  if (pourcentage >= 90) return MentionCertificat.EXCELLENT;
  if (pourcentage >= 80) return MentionCertificat.TRES_BIEN;
  if (pourcentage >= 70) return MentionCertificat.BIEN;
  if (pourcentage >= 60) return MentionCertificat.ASSEZ_BIEN;
  return MentionCertificat.PASSABLE;
}

// Enums et interfaces supplémentaires pour la complétude
export enum NiveauCompetence {
  FONDAMENTAL = 'fondamental',
  INTERMEDIAIRE = 'intermediaire',
  AVANCE = 'avance',
  EXPERT = 'expert'
}

export enum DomaineCompetence {
  COMPTABILITE_GENERALE = 'comptabilite_generale',
  FISCALITE = 'fiscalite',
  AUDIT = 'audit',
  ANALYSE_FINANCIERE = 'analyse_financiere'
}

export enum RareteBadge {
  COMMUN = 'commun',
  RARE = 'rare',
  EPIQUE = 'epique',
  LEGENDAIRE = 'legendaire'
}

export enum TypeRecommandation {
  REVISION = 'revision',
  EXERCICE_SUPPLEMENTAIRE = 'exercice_supplementaire',
  COURS_COMPLEMENT = 'cours_complement',
  PAUSE_RECOMMANDEE = 'pause_recommandee'
}

export enum PrioriteRecommandation {
  BASSE = 'basse',
  MOYENNE = 'moyenne',
  HAUTE = 'haute',
  CRITIQUE = 'critique'
}

export enum TypeSimulation {
  TENUE_COMPTABILITE = 'tenue_comptabilite',
  CLOTURE_EXERCICE = 'cloture_exercice',
  ANALYSE_ENTREPRISE = 'analyse_entreprise',
  AUDIT_COMPLET = 'audit_complet'
}

export enum TypeCertification {
  COURS_COMPLET = 'cours_complet',
  MODULE_SPECIALISE = 'module_specialise',
  PARCOURS_METIER = 'parcours_metier',
  SPECIALISATION = 'specialisation'
}

export enum StatutCours {
  BROUILLON = 'brouillon',
  EN_REVISION = 'en_revision',
  PUBLIE = 'publie',
  ARCHIVE = 'archive'
}

// Interfaces pour les composants complexes (à développer selon les besoins)
export interface Formateur {
  id: string;
  nom: string;
  titre: string;
  experience: string;
  certifications: string[];
}

export interface ConfigurationCertificat {
  disponible: boolean;
  type: TypeCertification;
  validite: number; // en mois
  prerequis: string[];
}

export interface Document {
  id: string;
  nom: string;
  type: string;
  url: string;
}

export interface ProgressionLecon {
  leconId: string;
  complete: boolean;
  tempsConsomme: number;
}

export interface ProgressionExercice {
  exerciceId: string;
  reussi: boolean;
  noteObtenue: number;
  nombreTentatives: number;
}

export interface ActionRecommandee {
  type: string;
  description: string;
  url?: string;
}