/**
 * Types communs pour E-COMPTA-IA
 * Définitions TypeScript pour les entités métier SYSCOHADA
 */

// ===================================
// TYPES GÉOGRAPHIQUES ET RÉGIONAUX
// ===================================

export type PaysOHADA = 
  | 'BF' // Burkina Faso
  | 'CI' // Côte d'Ivoire
  | 'SN' // Sénégal
  | 'ML' // Mali
  | 'NE' // Niger
  | 'TG' // Togo
  | 'BJ' // Bénin
  | 'GN' // Guinée
  | 'GW' // Guinée-Bissau
  | 'CF' // République centrafricaine
  | 'TD' // Tchad
  | 'CM' // Cameroun
  | 'GA' // Gabon
  | 'GQ' // Guinée équatoriale
  | 'CG' // Congo
  | 'CD' // République démocratique du Congo
  | 'KM'; // Comores

export interface CoordonneesOrganisme {
  adresse: string;
  ville?: string;
  pays?: PaysOHADA;
  telephone?: string;
  email?: string;
  siteWeb?: string;
}

// ===================================
// TYPES ENTREPRISE
// ===================================

export interface IdentiteEntreprise {
  id: string;
  nom: string;
  raisonSociale: string;
  formeJuridique: string;
  siret?: string;
  numeroRCS?: string;
  adresse: string;
  ville: string;
  pays: PaysOHADA;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  activitePrincipale: string;
  dateCreation: Date;
  capitalSocial?: number;
  devise: 'XOF' | 'XAF' | 'EUR' | 'USD';
}

export type StatutEntreprise = 
  | 'EN_CREATION'
  | 'ACTIF'
  | 'SUSPENDU'
  | 'INACTIF'
  | 'DISSOLUE';

// ===================================
// TYPES FISCAUX
// ===================================

export type RegimeFiscal =
  | 'REEL_NORMAL'
  | 'REEL_SIMPLIFIE'
  | 'SYNTHETIQUE'
  | 'MINIMAL';

export interface SpecificitesFiscales {
  regimeTVA: 'NORMAL' | 'EXONERE' | 'FRANCHISE';
  numeroTVA?: string;
  periodiciteDeclaration: 'MENSUELLE' | 'TRIMESTRIELLE' | 'ANNUELLE';
  dateClotureExercice: string; // Format MM-DD
}

export interface TauxFiscaux {
  tva: number;
  is: number; // Impôt sur les sociétés
  cf: number; // Contribution forfaitaire
  patente?: number;
  autres?: { [nom: string]: number };
}

// ===================================
// TYPES DÉCLARATIONS FISCALES
// ===================================

export interface FormulaireDeclaration {
  type: string;
  numero: string;
  version: string;
  champs: { [id: string]: any };
}

export interface AnnexeDeclaration {
  id: string;
  nom: string;
  type: string;
  obligatoire: boolean;
  contenu?: any;
}

export interface PieceJustificative {
  id: string;
  nom: string;
  type: string;
  taille: number;
  url?: string;
  obligatoire: boolean;
}

export interface DonneesComptablesSource {
  bilanComptable: any;
  compteResultat: any;
  journaux: any[];
  balanceGenerale: any;
}

export interface AjustementExtraComptable {
  id: string;
  nature: string;
  montant: number;
  description: string;
  justification: string;
}

export interface CalculsFiscaux {
  baseImposable: number;
  deductions: number;
  impotDu: number;
  creditsImpots: number;
  soldeAPayer: number;
}

export interface BaseImposable {
  nature: string;
  montant: number;
  taux: number;
}

export interface ImpotCalcule {
  type: string;
  base: number;
  taux: number;
  montant: number;
}

export interface CreditImpot {
  type: string;
  montant: number;
  origine: string;
}

export interface ControleFiscal {
  id: string;
  nature: string;
  resultat: 'CONFORME' | 'ANOMALIE' | 'ERREUR';
  message: string;
}

export interface AnomalieFiscale {
  id: string;
  type: string;
  severite: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  suggestions?: string[];
}

export interface InformationsTransmission {
  dateTransmission?: Date;
  modeTransmission: 'ELECTRONIQUE' | 'PAPIER';
  accuseReception?: string;
  statut: 'BROUILLON' | 'TRANSMISE' | 'VALIDEE' | 'REJETEE';
}

export interface InformationsPaiement {
  modePaiement: 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'MOBILE_MONEY';
  dateEcheance: Date;
  datePaiement?: Date;
  reference?: string;
  statut: 'A_PAYER' | 'PAYE' | 'RETARD' | 'ECHELONNE';
}

export interface EcheancierFiscal {
  id: string;
  type: string;
  dateEcheance: Date;
  montant: number;
  statut: 'A_VENIR' | 'ECHU' | 'PAYE';
}

export interface VersionDeclaration {
  id: string;
  numero: number;
  dateCreation: Date;
  dateModification: Date;
  statut: string;
  commentaire?: string;
}

export interface SuggestionFiscaleIA {
  id: string;
  type: string;
  message: string;
  impact: number;
  confiance: number;
}

export interface AlerteReglementaire {
  id: string;
  niveau: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  source: string;
  dateExpiration?: Date;
}

// ===================================
// TYPES TVA
// ===================================

export interface PeriodeTVA {
  annee: number;
  mois?: number;
  trimestre?: number;
  type: 'MENSUELLE' | 'TRIMESTRIELLE';
}

export interface ControleTVA {
  id: string;
  nature: string;
  resultat: 'OK' | 'ANOMALIE';
  message: string;
}

// ===================================
// TYPES IMPÔT SUR LES SOCIÉTÉS
// ===================================

export interface ExerciceFiscal {
  annee: number;
  dateDebut: Date;
  dateFin: Date;
}

export interface AcompteIS {
  numero: number;
  dateEcheance: Date;
  montant: number;
  paye: boolean;
}

export interface Tableau2058A {
  resultatComptable: number;
  reintegrations: number;
  deductions: number;
  resultatFiscal: number;
}

export interface Tableau2058B {
  amortissements: any;
  provisions: any;
  deficitsReportables: number;
}

export interface Tableau2058C {
  passageResultatComptableFiscal: any;
}

export interface TableauFiscalGenerique {
  numero: string;
  nom: string;
  contenu: any;
}

export interface InformationFiliale {
  nom: string;
  pays: PaysOHADA;
  pourcentageDetention: number;
  resultat: number;
}

export interface OperationIntragroupe {
  nature: string;
  montant: number;
  contrepartie: string;
}

export interface ControleIS {
  id: string;
  nature: string;
  resultat: 'CONFORME' | 'ANOMALIE';
  message: string;
}

export interface AlerteOptimisationIS {
  id: string;
  type: string;
  economie: number;
  description: string;
}

// ===================================
// TYPES CHARGES SOCIALES
// ===================================

export interface EcheanceCotisation {
  id: string;
  organisme: string;
  periode: string;
  montant: number;
  dateEcheance: Date;
  statut: 'A_PAYER' | 'PAYE' | 'RETARD';
}

export interface RetardPaiement {
  id: string;
  echeance: string;
  joursRetard: number;
  penalites: number;
}

export interface PenaliteRetard {
  id: string;
  type: string;
  taux: number;
  montant: number;
}

export interface ControleChargesSociales {
  id: string;
  nature: string;
  resultat: 'OK' | 'ANOMALIE';
  message: string;
}

export type TypeOrganismeSecurite =
  | 'CNSS'
  | 'CARFO'
  | 'CNBSS'
  | 'CASTEL'
  | 'securite_sociale'
  | 'AUTRE';

export type TypeCotisation =
  | 'RETRAITE'
  | 'FAMILLE'
  | 'ACCIDENT_TRAVAIL'
  | 'MALADIE'
  | 'CHOMAGE'
  | 'retraite'
  | 'accident_travail'
  | 'prestations_familiales';

export interface ExonerationCotisation {
  type: string;
  dateDebut: Date;
  dateFin: Date;
  pourcentage: number;
}

export type ModalitePaiement =
  | 'MENSUELLE'
  | 'TRIMESTRIELLE'
  | 'ANNUELLE'
  | {
      periodicite: string;
      dateEcheance: number;
      modePaiement: string[];
    };

// ===================================
// TYPES OPTIMISATION FISCALE
// ===================================

export interface OptimisationFiscale {
  id: string;
  type: string;
  description: string;
  impactFinancier: {
    economieEstimee: number;
    coutMiseEnOeuvre: number;
    economieNette: number;
    retourInvestissement: number;
  };
  risque: 'FAIBLE' | 'MOYEN' | 'ELEVE';
  legalite: 'LEGAL' | 'ZONE_GRISE' | 'ILLEGAL';
}

export interface VerificationCoherence {
  id: string;
  champ: string;
  valeur: any;
  attendu: any;
  statut: 'OK' | 'INCOHERENT';
}

export interface VerificationCompletude {
  id: string;
  section: string;
  champManquant: string;
  obligatoire: boolean;
}

export interface SuggestionOptimisation {
  id: string;
  type: string;
  description: string;
  economies: number;
  complexite: 'SIMPLE' | 'MOYENNE' | 'COMPLEXE';
}

export interface ParametrePreRemplissage {
  source: string;
  champ: string;
  valeur: any;
  fiabilite: number;
}

export interface Risque {
  id: string;
  type: string;
  niveau: 'FAIBLE' | 'MOYEN' | 'ELEVE';
  description: string;
  mitigation: string;
}

export interface IndicateurPerformance {
  nom: string;
  valeur: number;
  unite: string;
  evolution: number;
}

export interface PointControle {
  id: string;
  libelle: string;
  statut: 'VALIDE' | 'INVALIDE' | 'A_VERIFIER';
  commentaire?: string;
}

export interface ImpactReglementaire {
  reglementation: string;
  impact: string;
  actions: string[];
}

export type StatutAction =
  | 'A_FAIRE'
  | 'EN_COURS'
  | 'TERMINEE'
  | 'REPORTEE'
  | 'ANNULEE';

// ===================================
// TYPES PÉRIODES
// ===================================

export type TypePeriode =
  | 'JOUR'
  | 'SEMAINE'
  | 'MOIS'
  | 'TRIMESTRE'
  | 'SEMESTRE'
  | 'ANNEE';

// ===================================
// TYPES STYLES ET UI
// ===================================

export interface StyleLegende {
  position: 'top' | 'bottom' | 'left' | 'right';
  couleur?: string;
  taille?: number;
}

export interface StyleSerie {
  couleur?: string;
  type?: 'line' | 'bar' | 'pie';
  epaisseur?: number;
}

export type PositionAnnotation = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface StyleAnnotation {
  couleur?: string;
  taille?: number;
  style?: 'normal' | 'bold' | 'italic';
}

export interface DimensionsExport {
  largeur: number;
  hauteur: number;
  unite: 'px' | 'cm' | 'in';
}

export interface StyleMenu {
  theme: 'light' | 'dark';
  couleurPrimaire?: string;
  couleurSecondaire?: string;
}

export interface StyleBreadcrumb {
  separateur: string;
  couleur?: string;
}

export interface StylePagination {
  nombreElements: number;
  couleurActive?: string;
  couleurInactive?: string;
}

// ===================================
// TYPES MÉTIER E-LEARNING
// ===================================

export type NiveauDifficulte = 'FACILE' | 'INTERMEDIAIRE' | 'AVANCE' | 'EXPERT';

export enum CategorieComptable {
  COMPTABILITE_GENERALE = 'COMPTABILITE_GENERALE',
  COMPTABILITE_ANALYTIQUE = 'COMPTABILITE_ANALYTIQUE',
  FISCALITE = 'FISCALITE',
  AUDIT = 'AUDIT',
  GESTION_FINANCIERE = 'GESTION_FINANCIERE',
  SYSCOHADA = 'SYSCOHADA',
  ANALYSE_FINANCIERE = 'ANALYSE_FINANCIERE'
}

export type RythmeApprentissage = 'LENT' | 'REGULIER' | 'RAPIDE' | 'INTENSIF';

export type PrioriteRecommandation = 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';

export type RareteBadge = 'COMMUN' | 'RARE' | 'LEGENDAIRE' | 'UNIQUE';

// ===================================
// TYPES PAIEMENT
// ===================================

export enum MethodePaiement {
  MOBILE_MONEY = 'MOBILE_MONEY',
  CARTE_CREDIT = 'CARTE_CREDIT',
  VIREMENT_BANCAIRE = 'VIREMENT_BANCAIRE',
  PAYPAL = 'PAYPAL',
  CHEQUE = 'CHEQUE',
  ESPECES = 'ESPECES'
}

export type TypePaiement = MethodePaiement; // Alias pour compatibilité

// ===================================
// TYPES ÉCRITURES COMPTABLES
// ===================================

export type PrioriteControle = 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';

export type SensComptable = 'DEBIT' | 'CREDIT';

// ===================================
// TYPES E-LEARNING SUPPLÉMENTAIRES
// ===================================

// Types de ressources et documents
export interface Ressource {
  id: string;
  nom: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'LIEN' | 'DOCUMENT';
  url: string;
  taille?: number;
  duree?: number;
  description?: string;
}

export interface Schema {
  id: string;
  nom: string;
  type: 'DIAGRAMME' | 'FLOWCHART' | 'MINDMAP' | 'ORGANIGRAMME';
  contenu: string;
  description: string;
}

export interface ExempleChiffre {
  id: string;
  titre: string;
  valeurs: { [key: string]: number };
  explication: string;
  contexte: string;
}

export interface ExerciceInteractif {
  id: string;
  nom: string;
  type: 'DRAG_DROP' | 'QCM_INTERACTIF' | 'SIMULATION' | 'CALCUL';
  contenu: any;
  solution: any;
  dureeEstimee: number;
}

export interface QuizRapide {
  id: string;
  questions: string[];
  reponses: string[][];
  bonnesReponses: number[];
  explication: string[];
}

export interface PointVerification {
  id: string;
  titre: string;
  description: string;
  methodeVerification: string;
  critereReussite: string;
}

// Types multimédias
export interface CalculatriceInteractive {
  id: string;
  type: 'FINANCIERE' | 'SCIENTIFIQUE' | 'COMPTABLE';
  fonctions: string[];
  presets: { [nom: string]: any };
}

export interface ExerciceCode {
  id: string;
  langage: 'JAVASCRIPT' | 'PYTHON' | 'SQL';
  codeInitial: string;
  codeAttendu: string;
  tests: string[];
}

export interface SousTitre {
  id: string;
  langue: string;
  contenu: { temps: number; texte: string }[];
}

export interface QualiteVideo {
  resolution: string;
  bitrate: number;
  url: string;
  taille: number;
}

export interface ChapitreVideo {
  id: string;
  titre: string;
  tempsDebut: number;
  tempsFin: number;
  description?: string;
}

export interface MarqueurVideo {
  id: string;
  temps: number;
  titre: string;
  description: string;
  type: 'INFO' | 'EXERCICE' | 'RAPPEL' | 'ATTENTION';
}

export interface QuestionEmbedded {
  id: string;
  temps: number;
  question: string;
  reponses: string[];
  bonneReponse: number;
  explication: string;
}

export interface AnnotationVideo {
  id: string;
  temps: number;
  position: { x: number; y: number };
  contenu: string;
  type: 'TEXTE' | 'LIEN' | 'POPUP';
}

// Types exercices
export type DifficulteExercice = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE' | 'EXPERT';

export interface EtapeExercice {
  id: string;
  ordre: number;
  description: string;
  action: string;
  validation: string;
}

export type SolutionType = 'UNIQUE' | 'MULTIPLE' | 'OUVERTE' | 'CALCUL';

export interface CritereEvaluation {
  id: string;
  nom: string;
  description: string;
  poids: number;
  baremePoints: number;
}

export interface FeedbackExercice {
  condition: string;
  message: string;
  type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  conseils?: string[];
}

export interface ErreurCourante {
  id: string;
  description: string;
  explication: string;
  correction: string;
  frequence: number;
}

// Types quiz et évaluations
export type TypeQuiz = 'QCM' | 'VRAI_FAUX' | 'CORRESPONDANCE' | 'CLASSEMENT' | 'SAISIE_LIBRE';

export interface StatistiquesQuiz {
  nombreTentatives: number;
  moyenneScore: number;
  tempsmoyen: number;
  tauxReussite: number;
  questionsProblematiques: string[];
}

export interface TableauComptable {
  id: string;
  nom: string;
  colonnes: string[];
  lignes: any[][];
  totaux?: any[];
}

export interface ReponseQuestion {
  id: string;
  texte: string;
  correcte: boolean;
  explication?: string;
  poids?: number;
}

export type DifficulteQuestion = 'FACILE' | 'MOYENNE' | 'DIFFICILE' | 'EXPERTE';

export interface SectionEvaluation {
  id: string;
  nom: string;
  description: string;
  questions: string[];
  dureeMaximale: number;
  noteMinimale: number;
}

// Types certification
export interface BlockchainRecord {
  hash: string;
  timestamp: number;
  previousHash: string;
  certificatId: string;
  validation: string;
}

export type FormatCertificat = 'PDF' | 'PNG' | 'SVG' | 'BADGE_DIGITAL';

// Types progression et analyse
export interface DifficulteIdentifiee {
  domaine: string;
  concept: string;
  niveau: string;
  frequence: number;
  suggestions: string[];
}

export type PeriodeAnalyse = 'SEMAINE' | 'MOIS' | 'TRIMESTRE' | 'SEMESTRE' | 'ANNEE';

export interface CoursuLaire {
  id: string;
  nom: string;
  popularite: number;
  tauxCompletion: number;
}

export interface CoursProblematique {
  id: string;
  nom: string;
  problemes: string[];
  suggestions: string[];
}

export type FrequenceConnexion = 'QUOTIDIENNE' | 'HEBDOMADAIRE' | 'IRREGULIERE' | 'RARE';

export interface TauxAbandon {
  global: number;
  parModule: { [moduleId: string]: number };
  parDifficulte: { [niveau: string]: number };
}

export interface QuestionEchouee {
  questionId: string;
  tauxEchec: number;
  erreursFrequentes: string[];
}

export interface ExerciceProblematique {
  exerciceId: string;
  problemes: string[];
  ameliorationsSuggeres: string[];
}

export interface FeedbackEtudiant {
  id: string;
  note: number;
  commentaire: string;
  suggestions: string[];
  date: Date;
}

export interface PredictionReussite {
  etudiantId: string;
  probabiliteReussite: number;
  facteursRisque: string[];
  recommandations: string[];
}

// Types simulation
export interface EntrepriseVirtuelle {
  id: string;
  nom: string;
  secteur: string;
  taille: string;
  patrimoine: any;
  parametres: any;
}

export interface ScenarioComptable {
  id: string;
  nom: string;
  description: string;
  contexte: string;
  objectifs: string[];
  dureeEstimee: number;
}

export interface OperationComptable {
  id: string;
  type: string;
  description: string;
  montant: number;
  comptes: string[];
  justification: string;
}

export interface DocumentSimulation {
  id: string;
  type: 'FACTURE' | 'BILAN' | 'COMPTE_RESULTAT' | 'JOURNAL' | 'BALANCE';
  contenu: any;
  dateGeneration: Date;
}

export interface CritereEvaluationSimulation {
  id: string;
  nom: string;
  description: string;
  poids: number;
  methodeEvaluation: string;
}

export interface IndiceSimulation {
  id: string;
  titre: string;
  contenu: string;
  cout: number;
  niveau: string;
}

// Types cas d'étude
export interface DonneesCasEtude {
  entreprise: any;
  contexte: string;
  documents: any[];
  contraintes: string[];
}

export interface QuestionAnalyse {
  id: string;
  question: string;
  type: 'ANALYSE' | 'CALCUL' | 'INTERPRETATION' | 'PROPOSITION';
  pointsAttribues: number;
}

export interface LivrableAttendu {
  id: string;
  nom: string;
  description: string;
  format: string;
  criteres: string[];
}

export interface DocumentCasEtude {
  id: string;
  nom: string;
  type: string;
  contenu: any;
  confidentiel: boolean;
}

export interface GrilleEvaluation {
  id: string;
  criteres: CritereEvaluation[];
  baremeTotal: number;
  seuils: { [niveau: string]: number };
}

// =====================================================
// TYPES E-LEARNING COMPLÉMENTAIRES 
// =====================================================

export interface ConfigurationCertificat {
  disponible: boolean;
  type: string;
  validite: number; // en mois
  prerequis: string[];
}

export interface Formateur {
  id: string;
  nom: string;
  titre: string;
  experience: string;
  certifications: string[];
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

export enum DomaineCompetence {
  COMPTABILITE_GENERALE = 'COMPTABILITE_GENERALE',
  FISCALITE = 'FISCALITE',
  AUDIT = 'AUDIT',
  ANALYSE_FINANCIERE = 'ANALYSE_FINANCIERE'
}

export enum TypeRecommandation {
  REVISION = 'REVISION',
  EXERCICE_SUPPLEMENTAIRE = 'EXERCICE_SUPPLEMENTAIRE',
  COURS_COMPLEMENT = 'COURS_COMPLEMENT',
  PAUSE_RECOMMANDEE = 'PAUSE_RECOMMANDEE'
}

export interface ActionRecommandee {
  type: string;
  description: string;
  url?: string;
}

export enum TypeSimulation {
  TENUE_COMPTABILITE = 'TENUE_COMPTABILITE',
  CLOTURE_EXERCICE = 'CLOTURE_EXERCICE',
  ANALYSE_ENTREPRISE = 'ANALYSE_ENTREPRISE',
  AUDIT_COMPLET = 'AUDIT_COMPLET'
}

// ===================================
// EXPORTS GROUPÉS POUR INDEX
// ===================================

// Ce fichier définit tous les types communs
// Les autres modules peuvent importer depuis './common.types'