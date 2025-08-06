// =====================================================
// MODÈLES RAPPROCHEMENTS BANCAIRES E-COMPTA-IA
// Système complet d'import et matching automatique
// =====================================================

export interface RapprochementBancaire {
  id: string;
  compteComptable: string;
  nomCompte: string;
  banque: InformationsBanque;
  
  // Période de rapprochement
  periodeDebut: Date;
  periodeFin: Date;
  
  // Soldes
  soldeComptableDebut: number;
  soldeComptableFin: number;
  soldeBancaireDebut: number;
  soldeBancaireFin: number;
  
  // Statut et progression
  statut: StatutRapprochement;
  pourcentageRapproche: number;
  
  // Éléments du rapprochement
  mouvementsComptables: MouvementComptable[];
  mouvementsBancaires: MouvementBancaire[];
  correspondances: CorrespondanceMovement[];
  ecarts: EcartRapprochement[];
  
  // Résultat
  soldeRapproche: number;
  ecartsNonResolus: number;
  dateRapprochement?: Date;
  utilisateurRapprochement?: string;
  
  // Automatisation et IA
  configurationMatching: ConfigurationMatching;
  resultatsIA: ResultatsMatchingIA;
  suggestionsCorrection: SuggestionCorrection[];
  
  // Métadonnées
  dateCreation: Date;
  derniereModification: Date;
  commentaires: CommentaireRapprochement[];
  documentsJoints: DocumentJoint[];
  
  // Validation et audit
  valide: boolean;
  dateValidation?: Date;
  validePar?: string;
  motifInvalidation?: string;
}

export interface InformationsBanque {
  codeBanque: string;
  nomBanque: string;
  codeAgence: string;
  nomAgence: string;
  numeroCompte: string;
  cleRIB: string;
  IBAN?: string;
  BIC?: string;
  deviseCompte: string;
  typeCompte: TypeCompteBancaire;
}

export interface MouvementComptable {
  id: string;
  numeroEcriture: string;
  date: Date;
  libelle: string;
  reference: string;
  
  // Montants
  debit: number;
  credit: number;
  sens: SensEcriture;
  
  // Classification
  journal: string;
  piece: string;
  tiers?: string;
  
  // Statut rapprochement
  rapproche: boolean;
  dateRapprochement?: Date;
  correspondanceId?: string;
  
  // Métadonnées
  origine: OrigineMouvement;
  utilisateur: string;
  dateCreation: Date;
  
  // IA et matching
  scoreConfiance?: number;
  motsClesIA?: string[];
  categoriePredite?: CategorieTransaction;
}

export interface MouvementBancaire {
  id: string;
  
  // Identification
  numeroOpertion: string;
  referenceUniuqe: string;
  date: Date;
  dateValeur: Date;
  
  // Description
  libelle: string;
  libelleComplemente: string;
  codeOpertion: string;
  typeOperation: TypeOperationBancaire;
  
  // Montants
  montant: number;
  sens: SensMouvement;
  devise: string;
  
  // Informations complémentaires
  tiers?: InformationsTiers;
  reference?: string;
  numerocheque?: string;
  modePaiement?: ModePaiement;
  
  // Statut rapprochement
  rapproche: boolean;
  dateRapprochement?: Date;
  correspondanceId?: string;
  
  // Source et import
  source: SourceReleveBancaire;
  fichierImport?: string;
  ligneImport?: number;
  
  // IA et classification
  scoreConfiance?: number;
  categoriePredite?: CategorieTransaction;
  tiersPredits?: string[];
  compteComptableSuggere?: string;
}

export interface CorrespondanceMovement {
  id: string;
  type: TypeCorrespondance;
  
  // Mouvements liés
  mouvementComptableId: string;
  mouvementBancaireId: string;
  
  // Qualité du matching
  scoreConfiance: number;
  methodMatching: MethodeMatching;
  criteresPrincipal: CriterMatching[];
  
  // Écarts et ajustements
  ecartMontant: number;
  ecartDate: number; // jours
  ecartLibelle: boolean;
  
  // Validation
  valide: boolean;
  valideManuellement: boolean;
  dateValidation?: Date;
  utilisateurValidation?: string;
  
  // Métadonnées
  dateCreation: Date;
  commentaire?: string;
  
  // IA et apprentissage
  confirmeUtilisateur?: boolean;
  ajustementIA?: AjustementIA;
}

export interface EcartRapprochement {
  id: string;
  type: TypeEcart;
  
  // Description
  libelle: string;
  description: string;
  
  // Montant et impact
  montant: number;
  sens: SensEcart;
  
  // Classification
  categorie: CategorieEcart;
  sousCategorie?: string;
  recurrent: boolean;
  
  // Résolution
  statut: StatutEcart;
  dateResolution?: Date;
  modeResolution?: ModeResolution;
  actionCorrectrice?: string;
  
  // Référencement
  mouvementLie?: string;
  docummentJustificatif?: string;
  
  // Métadonnées
  dateDetection: Date;
  utilisateurDetection: string;
  priorite: PrioriteEcart;
  
  // Suggestions IA
  suggestionsResolution: SuggestionResolution[];
  probabiliteErreur: number;
}

export interface ReleveBancaire {
  id: string;
  
  // Identification
  compteId: string;
  numeroReleve: string;
  periodeDebut: Date;
  periodeFin: Date;
  
  // Soldes
  soldeInitial: number;
  soldeFinal: number;
  totalDebits: number;
  totalCredits: number;
  
  // Import et traitement
  fichierSource: FichierImport;
  statutImport: StatutImport;
  dateImport: Date;
  utilisateurImport: string;
  
  // Mouvements
  mouvements: MouvementBancaire[];
  nombreMouvements: number;
  
  // Analyse et validation
  analysesPreliminaires: AnalysePreliminaire[];
  erreurImport: ErreurImport[];
  avertissements: AvertissementImport[];
  
  // Rapprochement
  rapprochementLie?: string;
  pourcentageMatche: number;
  
  // Configuration
  formatImport: FormatImport;
  mappingColonnes: MappingColonne[];
  reglesTransformation: RegleTransformation[];
  
  // Métadonnées
  dateCreation: Date;
  commentaires: string;
  tags: string[];
}

export interface ConfigurationMatching {
  id: string;
  nom: string;
  description: string;
  
  // Critères de matching
  toleranceMontant: number; // pourcentage
  toleranceDate: number; // jours
  toleranceLibelle: number; // pourcentage similarité
  
  // Pondération des critères
  poidsMontant: number;
  poidsDate: number;
  poidsLibelle: number;
  poidsReference: number;
  poidsTiers: number;
  
  // Seuils de décision
  seuilMatchingAutomatique: number;
  seuilSuggestion: number;
  seuilRejet: number;
  
  // Règles métier
  reglesSpecifiques: RegleMatching[];
  exceptionsDefinies: ExceptionMatching[];
  
  // IA et apprentissage
  utilisationIA: boolean;
  modeleIAActif: string;
  apprentissageAutomatique: boolean;
  
  // Validation
  active: boolean;
  dateCreation: Date;
  derniereModification: Date;
  utilisateur: string;
}

export interface ResultatsMatchingIA {
  id: string;
  sessionMatching: string;
  
  // Métriques globales
  nombreMouvementsAnalyses: number;
  nombreMatchsAutomatiques: number;
  nombreSuggestions: number;
  nombreRejets: number;
  
  // Performance
  scoreConfianceMoyen: number;
  tempsTraitement: number; // millisecondes
  tauxPrecision: number;
  tauxRappel: number;
  
  // Détails par type
  resultatsParType: ResultatParType[];
  
  // Analyse des difficultés
  mouvementsProblematiques: MouvementProblematique[];
  patternsDetectes: PatternDetecte[];
  
  // Amélioration continue
  suggestionsAmelioration: SuggestionAmelioration[];
  donnessApprentissage: DonneeApprentissage[];
  
  // Métadonnées
  dateTraitement: Date;
  versionModele: string;
  parametresUtilises: ParametreIA[];
}

export interface AnalysePreliminaire {
  type: TypeAnalyse;
  resultat: boolean;
  message: string;
  niveau: NiveauAnalyse;
  suggestions: string[];
  impactPotentiel: number;
}

export interface FichierImport {
  nom: string;
  taille: number;
  formatDetecte: FormatFichier;
  encoding: string;
  separateur?: string;
  nombreLignes: number;
  nombreColonnes: number;
  entetes: string[];
  apercu: string[][];
  hashFichier: string;
  dateImport: Date;
}

// =====================================================
// ENUMERATIONS
// =====================================================

export enum StatutRapprochement {
  BROUILLON = 'brouillon',
  EN_COURS = 'en_cours',
  TERMINE = 'termine',
  VALIDE = 'valide',
  INVALIDE = 'invalide',
  ARCHIVE = 'archive'
}

export enum TypeCompteBancaire {
  COURANT = 'courant',
  EPARGNE = 'epargne',
  TERME = 'terme',
  DEVISES = 'devises',
  SPECIAL = 'special'
}

export enum TypeOperationBancaire {
  VIREMENT = 'virement',
  CHEQUE = 'cheque',
  CARTE = 'carte',
  PRELEVEMENT = 'prelevement',
  ESPECES = 'especes',
  FRAIS = 'frais',
  INTERETS = 'interets',
  AUTRE = 'autre'
}

export enum TypeCorrespondance {
  EXACTE = 'exacte',
  APPROXIMATIVE = 'approximative',
  FORCEE = 'forcee',
  MULTIPLE = 'multiple',
  PARTIELLE = 'partielle'
}

export enum MethodeMatching {
  AUTOMATIQUE_IA = 'automatique_ia',
  AUTOMATIQUE_REGLE = 'automatique_regle',
  SEMI_AUTOMATIQUE = 'semi_automatique',
  MANUELLE = 'manuelle',
  IMPORT_EXTERNE = 'import_externe'
}

export enum TypeEcart {
  MOUVEMENT_COMPTABLE_NON_RAPPROCHE = 'mouvement_comptable_non_rapproche',
  MOUVEMENT_BANCAIRE_NON_RAPPROCHE = 'mouvement_bancaire_non_rapproche',
  DIFFERENCE_MONTANT = 'difference_montant',
  DIFFERENCE_DATE = 'difference_date',
  ERREUR_SAISIE = 'erreur_saisie',
  FRAIS_BANCAIRES = 'frais_bancaires',
  AGIOS = 'agios',
  COMMISSION = 'commission',
  AUTRE = 'autre'
}

export enum CategorieTransaction {
  VENTES = 'ventes',
  ACHATS = 'achats',
  SALAIRES = 'salaires',
  CHARGES_SOCIALES = 'charges_sociales',
  IMPOTS_TAXES = 'impots_taxes',
  FRAIS_GENERAUX = 'frais_generaux',
  FRAIS_BANCAIRES = 'frais_bancaires',
  INVESTISSEMENTS = 'investissements',
  FINANCEMENT = 'financement',
  TRESORERIE = 'tresorerie',
  AUTRE = 'autre'
}

export enum FormatImport {
  CSV = 'csv',
  EXCEL = 'excel',
  QIF = 'qif',
  OFX = 'ofx',
  MT940 = 'mt940',
  CAMT = 'camt',
  PDF = 'pdf',
  PROPRIETARY = 'proprietary'
}

export enum StatutImport {
  EN_ATTENTE = 'en_attente',
  EN_COURS = 'en_cours',
  TERMINE = 'termine',
  ERREUR = 'erreur',
  ANNULE = 'annule'
}

export enum SensEcriture {
  DEBIT = 'debit',
  CREDIT = 'credit'
}

export enum SensMouvement {
  ENTREE = 'entree',
  SORTIE = 'sortie'
}

export enum SensEcart {
  POSITIF = 'positif',
  NEGATIF = 'negatif'
}

// =====================================================
// INTERFACES COMPLÉMENTAIRES
// =====================================================

export interface CriterMatching {
  type: string;
  valeur: any;
  poids: number;
  tolerance: number;
}

export interface RegleMatching {
  id: string;
  nom: string;
  condition: string;
  action: string;
  priorite: number;
  active: boolean;
}

export interface SuggestionCorrection {
  type: string;
  description: string;
  mouvementConcerne: string;
  actionSuggeree: string;
  confidence: number;
}

export interface MappingColonne {
  nomColonne: string;
  champDestination: string;
  typeConverion: string;
  transformation?: string;
  obligatoire: boolean;
}

export interface RegleTransformation {
  id: string;
  nom: string;
  champSource: string;
  champDestination: string;
  regle: string;
  active: boolean;
}

// =====================================================
// UTILITAIRES ET HELPERS
// =====================================================

export function calculerScoreMatching(
  mouvementComptable: MouvementComptable,
  mouvementBancaire: MouvementBancaire,
  configuration: ConfigurationMatching
): number {
  let score = 0;
  
  // Score montant
  const ecartMontant = Math.abs(mouvementComptable.debit || mouvementComptable.credit - Math.abs(mouvementBancaire.montant));
  const pourcentageEcartMontant = ecartMontant / Math.abs(mouvementBancaire.montant) * 100;
  
  if (pourcentageEcartMontant <= configuration.toleranceMontant) {
    score += configuration.poidsMontant * (1 - pourcentageEcartMontant / configuration.toleranceMontant);
  }
  
  // Score date
  const ecartJours = Math.abs(
    (mouvementComptable.date.getTime() - mouvementBancaire.date.getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  if (ecartJours <= configuration.toleranceDate) {
    score += configuration.poidsDate * (1 - ecartJours / configuration.toleranceDate);
  }
  
  // Score libellé (similarité de chaînes)
  const similariteLibelle = calculerSimilariteChaines(
    mouvementComptable.libelle,
    mouvementBancaire.libelle
  );
  
  if (similariteLibelle >= configuration.toleranceLibelle / 100) {
    score += configuration.poidsLibelle * similariteLibelle;
  }
  
  return Math.min(score, 100);
}

export function calculerSimilariteChaines(str1: string, str2: string): number {
  // Implémentation simplifiée de la distance de Levenshtein
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);
  
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

export function detecterFormatFichier(nom: string, contenu: string): FormatImport {
  const extension = nom.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv': return FormatImport.CSV;
    case 'xlsx':
    case 'xls': return FormatImport.EXCEL;
    case 'qif': return FormatImport.QIF;
    case 'ofx': return FormatImport.OFX;
    case 'pdf': return FormatImport.PDF;
    default:
      // Analyse du contenu pour détecter le format
      if (contenu.includes(':MT940:')) return FormatImport.MT940;
      if (contenu.includes('<?xml') && contenu.includes('camt.')) return FormatImport.CAMT;
      return FormatImport.CSV; // Par défaut
  }
}

// =====================================================
// DONNÉES DE RÉFÉRENCE
// =====================================================

export const CONFIGURATIONS_MATCHING_DEFAUT: ConfigurationMatching[] = [
  {
    id: 'config-strict',
    nom: 'Matching Strict',
    description: 'Configuration avec critères stricts pour matching automatique',
    toleranceMontant: 0, // 0% de tolérance
    toleranceDate: 2, // 2 jours max
    toleranceLibelle: 80, // 80% de similarité min
    poidsMontant: 40,
    poidsDate: 20,
    poidsLibelle: 25,
    poidsReference: 10,
    poidsTiers: 5,
    seuilMatchingAutomatique: 85,
    seuilSuggestion: 60,
    seuilRejet: 30,
    reglesSpecifiques: [],
    exceptionsDefinies: [],
    utilisationIA: true,
    modeleIAActif: 'model-v2.1',
    apprentissageAutomatique: true,
    active: true,
    dateCreation: new Date(),
    derniereModification: new Date(),
    utilisateur: 'system'
  },
  {
    id: 'config-souple',
    nom: 'Matching Souple',
    description: 'Configuration avec critères plus flexibles',
    toleranceMontant: 5, // 5% de tolérance
    toleranceDate: 7, // 7 jours max
    toleranceLibelle: 60, // 60% de similarité min
    poidsMontant: 50,
    poidsDate: 15,
    poidsLibelle: 20,
    poidsReference: 10,
    poidsTiers: 5,
    seuilMatchingAutomatique: 70,
    seuilSuggestion: 45,
    seuilRejet: 25,
    reglesSpecifiques: [],
    exceptionsDefinies: [],
    utilisationIA: true,
    modeleIAActif: 'model-v2.1',
    apprentissageAutomatique: true,
    active: true,
    dateCreation: new Date(),
    derniereModification: new Date(),
    utilisateur: 'system'
  }
];

export const FORMATS_IMPORT_SUPPORTES = [
  {
    format: FormatImport.CSV,
    nom: 'CSV (Comma Separated Values)',
    extensions: ['.csv', '.txt'],
    description: 'Format texte avec séparateurs de colonnes',
    parametres: ['separateur', 'encodage', 'guillemets']
  },
  {
    format: FormatImport.EXCEL,
    nom: 'Microsoft Excel',
    extensions: ['.xlsx', '.xls'],
    description: 'Fichiers de tableur Excel',
    parametres: ['feuille', 'ligneEntete', 'plage']
  },
  {
    format: FormatImport.QIF,
    nom: 'Quicken Interchange Format',
    extensions: ['.qif'],
    description: 'Format standard Quicken',
    parametres: ['typeCompte']
  },
  {
    format: FormatImport.OFX,
    nom: 'Open Financial Exchange',
    extensions: ['.ofx', '.qfx'],
    description: 'Format bancaire standardisé',
    parametres: ['version']
  }
];

export default {
  CONFIGURATIONS_MATCHING_DEFAUT,
  FORMATS_IMPORT_SUPPORTES,
  calculerScoreMatching,
  detecterFormatFichier
};