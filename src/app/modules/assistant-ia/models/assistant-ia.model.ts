export interface AssistantIA {
  id?: string;
  nom: string;
  description: string;
  typeAssistant: TypeAssistant;
  statut: StatutAssistant;
  niveauConfiance: number; // 0-100
  nombreUtilisations: number;
  dernierUtilisation?: Date;
  performance: PerformanceAssistant;
  parametres: ParametresAssistant;
  competences: CompetenceIA[];
  apprentissage: DonneesApprentissage;
  dateCreation: Date;
  version: string;
  actif: boolean;
}

export interface TraitementDocument {
  id?: string;
  documentOriginal: DocumentSource;
  resultatOCR: ResultatOCR;
  analyseSemantique: AnalyseSemantique;
  ecritureGeneree?: EcritureGeneree;
  validationHumaine?: ValidationHumaine;
  statut: StatutTraitement;
  tempsTraitement: number; // en ms
  scoreConfiance: number; // 0-100
  erreurs: ErreurTraitement[];
  suggestions: SuggestionAmelioration[];
  dateTraitement: Date;
  operateur?: string;
}

export interface DocumentSource {
  id: string;
  nom: string;
  type: TypeDocument;
  taille: number;
  mimeType: string;
  contenu: File | string | Blob;
  metadonnees: MetadonneesDocument;
  origine: OriginaDocument;
  dateUpload: Date;
  uploadePar: string;
  confidentialite: NiveauConfidentialite;
  langueDetectee?: string;
  qualiteImage?: QualiteImage;
}

export interface ResultatOCR {
  texteExtrait: string;
  confiance: number; // 0-100
  zonesDetectees: ZoneOCR[];
  champesStructures: ChampsStructures;
  erreurOCR: ErreurOCR[];
  tempsOCR: number; // en ms
  moteurOCR: string;
  versionMoteur: string;
  langueDetectee: string;
  formatDetecte: FormatDocument;
  qualiteReconnaissance: QualiteReconnaissance;
}

export interface ZoneOCR {
  id: string;
  type: TypeZone;
  coordonnees: CoordonneesBbox;
  texte: string;
  confiance: number;
  langue?: string;
  formatage?: FormateageTexte;
  validation: boolean;
}

export interface ChampsStructures {
  numeroDocument?: string;
  dateDocument?: Date;
  montantHT?: number;
  montantTTC?: number;
  montantTVA?: number;
  tauxTVA?: number;
  fournisseur?: InformationsFournisseur;
  client?: InformationsClient;
  description?: string;
  reference?: string;
  deviseDetectee?: string;
  comptesBancaires?: string[];
  adresses?: AdresseExtraite[];
  dates?: DateExtraite[];
  montants?: MontantExtrait[];
}

export interface AnalyseSemantique {
  typeDocumentDetecte: TypeDocument;
  confiance: number;
  intentionComptable: IntentionComptable;
  comptessuggeres: CompteSuggere[];
  categorisationAutomatique: CategorizationDocument;
  entitesNommees: EntiteNommee[];
  relationsDetectees: RelationEntite[];
  contexteComptable: ContexteComptable;
  anomaliesDetectees: AnomalieDetectee[];
  indicateursQualite: IndicateurQualite[];
}

export interface EcritureGeneree {
  id?: string;
  libelle: string;
  journal: string;
  typeEcriture: string;
  lignes: LigneGeneree[];
  documentSource: string;
  scoreConfiance: number;
  reglesAppliquees: RegleAppliquee[];
  validationAutomatique: boolean;
  ajustementsNecessaires: AjustementNecessaire[];
  metadonnees: MetadonneesGeneration;
  apprentissageUtilise: string[];
  tempsGeneration: number;
}

export interface LigneGeneree {
  ordre: number;
  compteComptable: string;
  libelle: string;
  montantDebit: number;
  montantCredit: number;
  confiance: number;
  justification: string;
  tiersDetecte?: string;
  analytique?: VentilationAnalytiqueIA;
  origineDetection: OrigineDetection;
}

export interface ValidationHumaine {
  validePar: string;
  dateValidation: Date;
  statut: StatutValidation;
  modifications: ModificationValidation[];
  commentaires: string;
  scoreQualite: number; // 1-5
  tempsValidation: number; // en ms
  difficultesRencontrees: DifficulteValidation[];
  suggestionsAmelioration: string[];
}

export interface DonneesApprentissage {
  modeleUtilise: string;
  versionModele: string;
  donneesEntrainement: StatistiquesEntrainement;
  performanceModele: PerformanceModele;
  dernierEntrainement: Date;
  prochaineMAJ: Date;
  evolutionPerformance: EvolutionPerformance[];
  domainesExpertise: DomaineExpertise[];
  personalisationEntreprise: PersonnalisationIA;
}

export interface CompetenceIA {
  domaine: DomaineCompetence;
  niveau: NiveauCompetence;
  precision: number; // 0-100
  rappel: number; // 0-100
  f1Score: number; // 0-100
  nombreEchantillons: number;
  derniereEvaluation: Date;
  tendance: TendancePerformance;
  exempleReussis: number;
  exemplesEchecs: number;
}

export interface ParametresAssistant {
  seuilConfiance: number; // 0-100
  modeValidation: ModeValidation;
  apprentissageActif: boolean;
  languesAcceptees: string[];
  typesDocumentsAcceptes: TypeDocument[];
  reglesPersonnalisees: ReglePersonnalisee[];
  integrationExterne: IntegrationExterne[];
  notificationsActives: boolean;
  sauvegardeAutomatique: boolean;
  niveauDetailLogs: NiveauLog;
}

export interface SessionApprentissage {
  id: string;
  dateDebut: Date;
  dateFin?: Date;
  statut: StatutApprentissage;
  donneesUtilisees: DonneeApprentissage[];
  parametresEntrainement: ParametresEntrainement;
  resultats: ResultatApprentissage;
  ameliorations: AmeliorationModele[];
  validationCroisee: ValidationCroisee;
  metriquesPerformance: MetriquePerformance[];
  rapportGenere: boolean;
  fichierModele?: string;
}

export interface StatistiquesAssistant {
  periodeAnalyse: string;
  nombreDocumentsTraites: number;
  nombreEcrituresGenerees: number;
  tauxReussiteOCR: number;
  tauxValidationHumaine: number;
  tempsTraitementMoyen: number;
  economieTemps: number; // en heures
  precisionMoyenne: number;
  rappelMoyen: number;
  evolutionPerformance: EvolutionTemporelle[];
  repartitionTypesDocuments: RepartitionTypeDocument[];
  erreursFrequentes: ErreurFrequente[];
  suggestionsOptimisation: SuggestionOptimisation[];
}

// ==================== ÉNUMÉRATIONS ====================

export enum TypeAssistant {
  OCR_SIMPLE = 'OCR_SIMPLE',
  OCR_AVANCE = 'OCR_AVANCE',
  GENERATION_ECRITURE = 'GENERATION_ECRITURE',
  ANALYSE_SEMANTIQUE = 'ANALYSE_SEMANTIQUE',
  APPRENTISSAGE_AUTOMATIQUE = 'APPRENTISSAGE_AUTOMATIQUE',
  ASSISTANT_COMPLET = 'ASSISTANT_COMPLET'
}

export enum StatutAssistant {
  INITIALISATION = 'INITIALISATION',
  PRET = 'PRET',
  TRAITEMENT = 'TRAITEMENT',
  APPRENTISSAGE = 'APPRENTISSAGE',
  MAINTENANCE = 'MAINTENANCE',
  ERREUR = 'ERREUR',
  HORS_LIGNE = 'HORS_LIGNE'
}

export enum TypeDocument {
  FACTURE_ACHAT = 'FACTURE_ACHAT',
  FACTURE_VENTE = 'FACTURE_VENTE',
  RECU = 'RECU',
  RELEVE_BANCAIRE = 'RELEVE_BANCAIRE',
  CHEQUE = 'CHEQUE',
  VIREMENT = 'VIREMENT',
  CONTRAT = 'CONTRAT',
  BON_COMMANDE = 'BON_COMMANDE',
  BON_LIVRAISON = 'BON_LIVRAISON',
  FICHE_PAIE = 'FICHE_PAIE',
  DECLARATION_TVA = 'DECLARATION_TVA',
  BILAN = 'BILAN',
  AUTRE = 'AUTRE'
}

export enum StatutTraitement {
  EN_ATTENTE = 'EN_ATTENTE',
  OCR_EN_COURS = 'OCR_EN_COURS',
  ANALYSE_EN_COURS = 'ANALYSE_EN_COURS',
  GENERATION_EN_COURS = 'GENERATION_EN_COURS',
  ATTENTE_VALIDATION = 'ATTENTE_VALIDATION',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE',
  ERREUR = 'ERREUR',
  TERMINE = 'TERMINE'
}

export enum OriginaDocument {
  UPLOAD_MANUEL = 'UPLOAD_MANUEL',
  EMAIL = 'EMAIL',
  SCAN = 'SCAN',
  MOBILE = 'MOBILE',
  API_EXTERNE = 'API_EXTERNE',
  IMPORT_BATCH = 'IMPORT_BATCH',
  DROPZONE = 'DROPZONE'
}

export enum NiveauConfidentialite {
  PUBLIC = 'PUBLIC',
  INTERNE = 'INTERNE',
  CONFIDENTIEL = 'CONFIDENTIEL',
  SECRET = 'SECRET'
}

export enum TypeZone {
  TITRE = 'TITRE',
  MONTANT = 'MONTANT',
  DATE = 'DATE',
  ADRESSE = 'ADRESSE',
  NUMERO = 'NUMERO',
  TEXTE = 'TEXTE',
  TABLEAU = 'TABLEAU',
  SIGNATURE = 'SIGNATURE',
  LOGO = 'LOGO',
  CODE_BARRE = 'CODE_BARRE'
}

export enum FormatDocument {
  PDF = 'PDF',
  IMAGE_JPG = 'IMAGE_JPG',
  IMAGE_PNG = 'IMAGE_PNG',
  IMAGE_TIFF = 'IMAGE_TIFF',
  DOCUMENT_SCANNE = 'DOCUMENT_SCANNE',
  DOCUMENT_NATIF = 'DOCUMENT_NATIF'
}

export enum IntentionComptable {
  ACHAT = 'ACHAT',
  VENTE = 'VENTE',
  PAIEMENT = 'PAIEMENT',
  ENCAISSEMENT = 'ENCAISSEMENT',
  REGULARISATION = 'REGULARISATION',
  CLOTURE = 'CLOTURE',
  OUVERTURE = 'OUVERTURE',
  PROVISION = 'PROVISION',
  AMORTISSEMENT = 'AMORTISSEMENT',
  AUTRE = 'AUTRE'
}

export enum StatutValidation {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDEE = 'VALIDEE',
  VALIDEE_AVEC_MODIFICATIONS = 'VALIDEE_AVEC_MODIFICATIONS',
  REJETEE = 'REJETEE',
  A_REVOIR = 'A_REVOIR'
}

export enum DomaineCompetence {
  OCR_TEXTE = 'OCR_TEXTE',
  OCR_MONTANTS = 'OCR_MONTANTS',
  OCR_DATES = 'OCR_DATES',
  DETECTION_ENTITES = 'DETECTION_ENTITES',
  CLASSIFICATION_DOCUMENTS = 'CLASSIFICATION_DOCUMENTS',
  GENERATION_ECRITURES = 'GENERATION_ECRITURES',
  VALIDATION_COMPTABLE = 'VALIDATION_COMPTABLE',
  APPRENTISSAGE_CONTEXTUEL = 'APPRENTISSAGE_CONTEXTUEL'
}

export enum NiveauCompetence {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  AVANCE = 'AVANCE',
  EXPERT = 'EXPERT',
  MAITRE = 'MAITRE'
}

export enum TendancePerformance {
  AMELIORATION = 'AMELIORATION',
  STABLE = 'STABLE',
  DEGRADATION = 'DEGRADATION',
  FLUCTUANTE = 'FLUCTUANTE'
}

export enum ModeValidation {
  AUTOMATIQUE = 'AUTOMATIQUE',
  SEMI_AUTOMATIQUE = 'SEMI_AUTOMATIQUE',
  MANUEL = 'MANUEL',
  ADAPTATIF = 'ADAPTATIF'
}

export enum StatutApprentissage {
  PLANIFIE = 'PLANIFIE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ECHEC = 'ECHEC',
  INTERROMPU = 'INTERROMPU'
}

export enum NiveauLog {
  MINIMAL = 'MINIMAL',
  NORMAL = 'NORMAL',
  DETAILLE = 'DETAILLE',
  DEBUG = 'DEBUG'
}

// ==================== INTERFACES DÉTAILLÉES ====================

export interface MetadonneesDocument {
  resolution?: number;
  nombrePages: number;
  orientation: 'portrait' | 'paysage';
  couleur: boolean;
  compression?: string;
  auteur?: string;
  dateCreation?: Date;
  application?: string;
  tailleOriginale?: number;
  checksum?: string;
}

export interface QualiteImage {
  netete: number; // 0-100
  contraste: number; // 0-100
  luminosite: number; // 0-100
  resolution: number;
  bruit: number; // 0-100
  distorsion: number; // 0-100
  qualiteGlobale: number; // 0-100
}

export interface CoordonneesBbox {
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
  page?: number;
}

export interface FormateageTexte {
  police?: string;
  taille?: number;
  gras: boolean;
  italique: boolean;
  souligne: boolean;
  couleur?: string;
}

export interface InformationsFournisseur {
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  siret?: string;
  numeroTVA?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
}

export interface InformationsClient {
  nom: string;
  adresse?: string;
  reference?: string;
  numeroClient?: string;
}

export interface AdresseExtraite {
  type: 'EXPEDITEUR' | 'DESTINATAIRE' | 'FACTURATION' | 'LIVRAISON';
  adresseComplete: string;
  rue?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  confiance: number;
}

export interface DateExtraite {
  type: 'EMISSION' | 'ECHEANCE' | 'LIVRAISON' | 'PAIEMENT';
  date: Date;
  format: string;
  confiance: number;
}

export interface MontantExtrait {
  type: 'HT' | 'TTC' | 'TVA' | 'REMISE' | 'NET';
  valeur: number;
  devise: string;
  confiance: number;
  position: CoordonneesBbox;
}

export interface CompteSuggere {
  numero: string;
  libelle: string;
  confiance: number;
  justification: string;
  typeOperation: 'DEBIT' | 'CREDIT';
  montantSuggere?: number;
}

export interface EntiteNommee {
  texte: string;
  type: 'PERSONNE' | 'ORGANISATION' | 'LIEU' | 'MONTANT' | 'DATE' | 'PRODUIT';
  confiance: number;
  position: CoordonneesBbox;
  normalisee?: string;
}

export interface RelationEntite {
  entite1: string;
  relation: string;
  entite2: string;
  confiance: number;
}

export interface ContexteComptable {
  exercice: string;
  periode: string;
  journal: string;
  entreprise: string;
  deviseDefaut: string;
  reglesApplicables: string[];
}

export interface AnomalieDetectee {
  type: string;
  description: string;
  gravite: 'FAIBLE' | 'MOYENNE' | 'FORTE' | 'CRITIQUE';
  confiance: number;
  position?: CoordonneesBbox;
  suggestionCorrection?: string;
}

export interface IndicateurQualite {
  nom: string;
  valeur: number;
  seuil: number;
  statut: 'OK' | 'ATTENTION' | 'PROBLEME';
  details?: string;
}

export interface RegleAppliquee {
  nom: string;
  type: 'PREDEFINED' | 'CUSTOM' | 'LEARNED';
  confiance: number;
  parametres: any;
  resultat: any;
}

export interface AjustementNecessaire {
  type: string;
  description: string;
  automatique: boolean;
  impact: 'FAIBLE' | 'MOYEN' | 'FORT';
  suggestion: string;
}

export interface MetadonneesGeneration {
  versionAlgorithme: string;
  tempsExecution: number;
  ressourcesUtilisees: string[];
  parametresUtilises: any;
  historique: any[];
}

export interface VentilationAnalytiqueIA {
  axe: string;
  section: string;
  pourcentage: number;
  confiance: number;
  justification: string;
}

export enum OrigineDetection {
  OCR = 'OCR',
  ANALYSE_SEMANTIQUE = 'ANALYSE_SEMANTIQUE',
  APPRENTISSAGE = 'APPRENTISSAGE',
  REGLE_PREDEFINEE = 'REGLE_PREDEFINEE',
  VALIDATION_HUMAINE = 'VALIDATION_HUMAINE'
}

export interface ModificationValidation {
  champ: string;
  valeurOriginale: any;
  nouvelleValeur: any;
  justification: string;
  impact: 'MINEUR' | 'MAJEUR' | 'CRITIQUE';
}

export interface DifficulteValidation {
  type: string;
  description: string;
  tempsSupplementaire: number;
  ressourcesConsultees: string[];
}

export interface StatistiquesEntrainement {
  nombreEchantillons: number;
  nombreEpoques: number;
  precisionFinale: number;
  rappelFinal: number;
  f1ScoreFinal: number;
  tempsEntrainement: number;
  donneesValidation: number;
  donneesTest: number;
}

export interface PerformanceModele {
  precision: number;
  rappel: number;
  f1Score: number;
  exactitude: number;
  matrixeConfusion: number[][];
  courbeROC: PointROC[];
  seuilOptimal: number;
}

export interface PointROC {
  tauxVraiPositif: number;
  tauxFauxPositif: number;
  seuil: number;
}

export interface EvolutionPerformance {
  date: Date;
  metrique: string;
  valeur: number;
  tendance: TendancePerformance;
  facteurs: string[];
}

export interface DomaineExpertise {
  domaine: string;
  niveau: number; // 0-100
  specialisations: string[];
  exemples: number;
  derniereMAJ: Date;
}

export interface PersonnalisationIA {
  entrepriseId: string;
  preferences: PreferencePersonnalisation[];
  reglesSpecifiques: RegleSpecifique[];
  vocabulaireMetier: TermeMetier[];
  historiqueDeces: DecisionHistorique[];
  performancePersonnalisee: MetriquePersonnalisee[];
}

export interface PreferencePersonnalisation {
  cle: string;
  valeur: any;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'ARRAY' | 'OBJECT';
  description: string;
}

export interface RegleSpecifique {
  nom: string;
  condition: string;
  action: string;
  priorite: number;
  active: boolean;
  dateCreation: Date;
  creePar: string;
}

export interface TermeMetier {
  terme: string;
  synonymes: string[];
  definition: string;
  contexte: string;
  frequence: number;
}

export interface DecisionHistorique {
  contexte: string;
  decision: string;
  justification: string;
  resultat: string;
  date: Date;
  utilisateur: string;
}

export interface MetriquePersonnalisee {
  nom: string;
  valeur: number;
  baseline: number;
  amelioration: number;
  dernierCalcul: Date;
}

// ==================== DONNÉES DE RÉFÉRENCE ====================

export const TYPES_DOCUMENTS_SUPPORTES = [
  TypeDocument.FACTURE_ACHAT,
  TypeDocument.FACTURE_VENTE,
  TypeDocument.RECU,
  TypeDocument.RELEVE_BANCAIRE,
  TypeDocument.CHEQUE,
  TypeDocument.VIREMENT,
  TypeDocument.FICHE_PAIE
];

export const LANGUES_SUPPORTEES = [
  'fr', 'en', 'es', 'pt', 'ar', 'sw'
];

export const SEUILS_CONFIANCE_DEFAUT = {
  OCR_MIN: 80,
  GENERATION_MIN: 75,
  VALIDATION_AUTO: 90,
  APPRENTISSAGE_MIN: 85
};

export const FORMATS_IMAGES_ACCEPTES = [
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/bmp',
  'application/pdf'
];

export const COMPETENCES_IA_DEFAUT = [
  {
    domaine: DomaineCompetence.OCR_TEXTE,
    niveau: NiveauCompetence.AVANCE,
    precision: 95,
    rappel: 92
  },
  {
    domaine: DomaineCompetence.OCR_MONTANTS,
    niveau: NiveauCompetence.EXPERT,
    precision: 98,
    rappel: 96
  },
  {
    domaine: DomaineCompetence.GENERATION_ECRITURES,
    niveau: NiveauCompetence.INTERMEDIAIRE,
    precision: 85,
    rappel: 80
  }
];

export const REGLES_GENERATION_DEFAUT = [
  {
    nom: 'Facture achat standard',
    condition: 'type=FACTURE_ACHAT AND montantTTC>0',
    action: 'GENERER_ECRITURE_ACHAT',
    confiance: 0.9
  },
  {
    nom: 'Facture vente standard',
    condition: 'type=FACTURE_VENTE AND montantTTC>0',
    action: 'GENERER_ECRITURE_VENTE',
    confiance: 0.9
  },
  {
    nom: 'Relevé bancaire',
    condition: 'type=RELEVE_BANCAIRE AND mouvements>0',
    action: 'GENERER_ECRITURES_BANCAIRES',
    confiance: 0.8
  }
];