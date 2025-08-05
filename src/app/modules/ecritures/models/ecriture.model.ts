export interface EcritureComptable {
  id?: string;
  
  // Informations de base
  numero: string; // Auto-généré ou manuel
  date: Date;
  dateEcheance?: Date;
  dateValeur?: Date;
  
  // Classification
  journal: JournalComptable;
  typeEcriture: TypeEcriture;
  origineEcriture: OrigineEcriture;
  
  // Informations générales
  libelle: string;
  reference?: string; // N° facture, chèque, etc.
  numeropiece?: string;
  exerciceComptable: string;
  periode: string; // YYYY-MM
  
  // Lignes d'écriture
  lignes: LigneEcriture[];
  
  // Totaux
  totalDebit: number;
  totalCredit: number;
  equilibree: boolean;
  
  // Validation et contrôles
  validationIA?: ValidationEcritureIA;
  controles?: ControleEcriture[];
  
  // Documents joints
  documentsJoints?: DocumentJoint[];
  
  // Workflow et statut
  statut: StatutEcriture;
  etapeValidation?: EtapeValidation;
  historique?: HistoriqueEcriture[];
  
  // Métadonnées
  creePar: string;
  dateCreation: Date;
  modifiePar?: string;
  derniereModification?: Date;
  validePar?: string;
  dateValidation?: Date;
  
  // Liens et relations
  ecritureOriginale?: string; // Pour contrepassation
  ecrituresLiees?: string[]; // Écritures liées
  
  // Propriétés SYSCOHADA
  conformiteSYSCOHADA: boolean;
  impactRatiosAUDCIF?: string[];
  categorieComptable: CategorieComptable;
  
  // Propriétés spéciales
  provisoire: boolean;
  simulation: boolean;
  lettrable: boolean;
  extourne: boolean;
  dateExtourne?: Date;
  
  // Notes et observations
  notes?: string;
  observations?: ObservationEcriture[];
}

export interface LigneEcriture {
  id?: string;
  ecritureId?: string;
  ordre: number;
  
  // Compte et intitulé
  compteComptable: string;
  libelle: string;
  
  // Montants
  montantDebit: number;
  montantCredit: number;
  devise: string;
  
  // Analytique
  ventilationAnalytique?: VentilationAnalytique[];
  
  // Tiers et références
  tiersId?: string;
  tiersNom?: string;
  reference?: string;
  numeropiece?: string;
  
  // Échéances
  dateEcheance?: Date;
  modePaiement?: string;
  
  // Lettrage
  lettrage?: InfoLettrage;
  
  // Rapprochement bancaire
  rapprochement?: InfoRapprochement;
  
  // Contrôles et validation
  controles?: ControleLigne[];
  erreurs?: ErreurLigne[];
  avertissements?: AvertissementLigne[];
  
  // Propriétés spéciales
  bloquee: boolean;
  provisoire: boolean;
  
  // Métadonnées
  dateCreation: Date;
  creePar: string;
}

export interface JournalComptable {
  id: string;
  code: string;
  libelle: string;
  type: TypeJournal;
  couleur: string;
  compteContrepartie?: string;
  nature: NatureJournal;
  actif: boolean;
  numeroSequence?: number;
  formatage?: FormatageJournal;
  controles?: ControleJournal[];
}

export interface VentilationAnalytique {
  id?: string;
  axeAnalytique: string;
  sectionAnalytique: string;
  pourcentage: number;
  montant: number;
  libelle?: string;
}

export interface InfoLettrage {
  lettre?: string;
  dateLettrage?: Date;
  utilisateurLettrage?: string;
  montantLettre?: number;
  automatique: boolean;
  statut: StatutLettrage;
}

export interface InfoRapprochement {
  releve: string;
  dateReleve: Date;
  montantReleve: number;
  ecart?: number;
  statut: StatutRapprochement;
  dateRapprochement?: Date;
}

export interface DocumentJoint {
  id: string;
  nom: string;
  type: TypeDocumentJoint;
  taille: number;
  mimeType: string;
  contenu: File | string | Blob;
  dateUpload: Date;
  uploadePar: string;
  description?: string;
  principal: boolean;
  numeroPage?: number;
  confidentiel: boolean;
  validationOCR?: ValidationOCR;
}

export interface ValidationOCR {
  score: number; // 0-100
  donneesExtraites: DonneesOCR;
  suggestionsEcriture?: SuggestionEcriture[];
  confiance: number;
  dateAnalyse: Date;
}

export interface DonneesOCR {
  typeDocument: TypeDocumentJoint;
  numero?: string;
  date?: Date;
  montantHT?: number;
  montantTTC?: number;
  montantTVA?: number;
  tauxTVA?: number;
  fournisseur?: string;
  client?: string;
  description?: string;
  comptesSuggeres?: string[];
}

export interface SuggestionEcriture {
  type: TypeSuggestion;
  confiance: number; // 0-100
  libelle: string;
  lignesSuggerees: LigneSuggeree[];
  justification: string;
  reglesAppliquees: string[];
}

export interface LigneSuggeree {
  compteComptable: string;
  libelle: string;
  montantDebit: number;
  montantCredit: number;
  tiersId?: string;
  justification: string;
}

export interface ValidationEcritureIA {
  score: number; // 0-100
  controles: ControleEcritureIA[];
  anomalies: AnomalieEcriture[];
  suggestions: SuggestionAmelioration[];
  conformiteSYSCOHADA: boolean;
  niveauRisque: NiveauRisque;
  dateValidation: Date;
  tempsValidation: number; // en ms
}

export interface ControleEcritureIA {
  type: TypeControleEcriture;
  resultat: ResultatControle;
  message: string;
  details?: any;
  priorite: PrioriteControle;
  impactRatio?: string[];
  actionCorrectrice?: string;
}

export interface AnomalieEcriture {
  type: TypeAnomalieEcriture;
  gravite: GraviteAnomalie;
  description: string;
  lignesConcernees: number[];
  valeurDetectee?: any;
  valeurAttendue?: any;
  impactFinancier?: number;
  solutionSuggeree: string;
  dateDetection: Date;
}

export interface SuggestionAmelioration {
  type: TypeSuggestionAmelioration;
  titre: string;
  description: string;
  beneficeAttendu: string;
  faciliteImplementation: NiveauFacilite;
  impactEstime: NiveauImpact;
  etapes?: string[];
}

export interface TemplateEcriture {
  id: string;
  nom: string;
  description: string;
  typeEcriture: TypeEcriture;
  journal: string;
  modele: ModeleEcriture;
  utilisationFrequente: boolean;
  partage: boolean;
  creePar: string;
  dateCreation: Date;
  nombreUtilisations: number;
  derniereUtilisation?: Date;
  tags?: string[];
  favoris: boolean;
}

export interface ModeleEcriture {
  libelle: string;
  lignesModeles: LigneModele[];
  reglesCalcul?: RegleCalcul[];
  validationsRequises?: string[];
  documentsObligatoires?: TypeDocumentJoint[];
}

export interface LigneModele {
  ordre: number;
  compteComptable: string;
  libelle: string;
  sensComptable: 'DEBIT' | 'CREDIT';
  montantFixe?: number;
  montantFormule?: string; // Formule de calcul
  pourcentage?: number;
  obligatoire: boolean;
  modifiable: boolean;
  tiersRequis: boolean;
  analytique?: string[];
}

export interface RegleCalcul {
  nom: string;
  formule: string;
  variables: VariableCalcul[];
  description: string;
  exemples?: string[];
}

export interface VariableCalcul {
  nom: string;
  type: 'MONTANT' | 'POURCENTAGE' | 'NOMBRE' | 'DATE';
  obligatoire: boolean;
  valeurDefaut?: any;
  min?: number;
  max?: number;
  description: string;
}

export interface HistoriqueEcriture {
  id: string;
  action: ActionHistorique;
  utilisateur: string;
  date: Date;
  detailsAvant?: any;
  detailsApres?: any;
  commentaire?: string;
  adresseIP?: string;
}

export interface ObservationEcriture {
  id: string;
  auteur: string;
  date: Date;
  type: TypeObservation;
  priorite: PrioriteObservation;
  titre: string;
  contenu: string;
  confidentielle: boolean;
  dateEcheance?: Date;
  statut: StatutObservation;
  actionsSuites?: string[];
}

export interface ControleEcriture {
  type: TypeControleEcriture;
  actif: boolean;
  parametres?: any;
  messageBlocant?: string;
  messageAvertissement?: string;
  niveauControle: NiveauControle;
}

export interface StatistiquesSaisie {
  periodeAnalyse: string;
  nombreEcritures: number;
  nombreLignes: number;
  montantTotalDebits: number;
  montantTotalCredits: number;
  repartitionParJournal: RepartitionJournal[];
  repartitionParType: RepartitionType[];
  tempsRedactionMoyen: number;
  tauxErreurs: number;
  performanceOperateur: PerformanceOperateur[];
  tendances: TendanceSaisie[];
}

export interface RepartitionJournal {
  journal: string;
  nombreEcritures: number;
  montantTotal: number;
  pourcentage: number;
}

export interface RepartitionType {
  typeEcriture: TypeEcriture;
  nombreEcritures: number;
  pourcentage: number;
}

export interface PerformanceOperateur {
  operateur: string;
  nombreEcritures: number;
  tempsRedactionMoyen: number;
  tauxErreurs: number;
  scoreQualite: number;
}

export interface TendanceSaisie {
  periode: string;
  nombreEcritures: number;
  evolution: number; // %
  tendance: 'HAUSSE' | 'BAISSE' | 'STABLE';
}

// ==================== ÉNUMÉRATIONS ====================

export enum TypeEcriture {
  STANDARD = 'STANDARD',
  OUVERTURE = 'OUVERTURE',
  CLOTURE = 'CLOTURE',
  ABONNEMENT = 'ABONNEMENT',
  EXTOURNE = 'EXTOURNE',
  CONTREPASSATION = 'CONTREPASSATION',
  AJUSTEMENT = 'AJUSTEMENT',
  PROVISION = 'PROVISION',
  REGULISATION = 'REGULARISATION',
  SIMULATION = 'SIMULATION'
}

export enum OrigineEcriture {
  SAISIE_MANUELLE = 'SAISIE_MANUELLE',
  IMPORT_FICHIER = 'IMPORT_FICHIER',
  AUTOMATIQUE = 'AUTOMATIQUE',
  OCR = 'OCR',
  API_EXTERNE = 'API_EXTERNE',
  INTERFACE_BANCAIRE = 'INTERFACE_BANCAIRE',
  TEMPLATE = 'TEMPLATE',
  DUPLICATION = 'DUPLICATION',
  MOBILE_MONEY = 'MOBILE_MONEY'
}

export enum StatutEcriture {
  BROUILLON = 'BROUILLON',
  EN_ATTENTE = 'EN_ATTENTE',
  EN_VALIDATION = 'EN_VALIDATION',
  VALIDEE = 'VALIDEE',
  COMPTABILISEE = 'COMPTABILISEE',
  REJETE = 'REJETE',
  ARCHIVE = 'ARCHIVE',
  EXTOURNEE = 'EXTOURNEE'
}

export enum TypeJournal {
  ACHAT = 'ACHAT',
  VENTE = 'VENTE',
  BANQUE = 'BANQUE',
  CAISSE = 'CAISSE',
  OPERATIONS_DIVERSES = 'OPERATIONS_DIVERSES',
  PAIE = 'PAIE',
  INVENTAIRE = 'INVENTAIRE',
  IMMOBILISATIONS = 'IMMOBILISATIONS',
  SOCIAL = 'SOCIAL',
  FISCAL = 'FISCAL'
}

export enum NatureJournal {
  CENTRALISATEUR = 'CENTRALISATEUR',
  AUXILIAIRE = 'AUXILIAIRE',
  SPECIAL = 'SPECIAL'
}

export enum StatutLettrage {
  NON_LETTRE = 'NON_LETTRE',
  LETTRE_PARTIEL = 'LETTRE_PARTIEL',
  LETTRE_TOTAL = 'LETTRE_TOTAL',
  EN_COURS = 'EN_COURS'
}

export enum StatutRapprochement {
  NON_RAPPROCHE = 'NON_RAPPROCHE',
  RAPPROCHE = 'RAPPROCHE',
  RAPPROCHE_PARTIEL = 'RAPPROCHE_PARTIEL',
  ECART = 'ECART'
}

export enum TypeDocumentJoint {
  FACTURE_ACHAT = 'FACTURE_ACHAT',
  FACTURE_VENTE = 'FACTURE_VENTE',
  RECU = 'RECU',
  RELEVE_BANCAIRE = 'RELEVE_BANCAIRE',
  CHEQUE = 'CHEQUE',
  VIREMENT = 'VIREMENT',
  CONTRAT = 'CONTRAT',
  BON_COMMANDE = 'BON_COMMANDE',
  BON_LIVRAISON = 'BON_LIVRAISON',
  AUTRE = 'AUTRE'
}

export enum TypeSuggestion {
  ECRITURE_COMPLETE = 'ECRITURE_COMPLETE',
  COMPTE_MANQUANT = 'COMPTE_MANQUANT',
  TIERS_SUGGESTION = 'TIERS_SUGGESTION',
  ANALYTIQUE_SUGGESTION = 'ANALYTIQUE_SUGGESTION',
  ECHEANCE_SUGGESTION = 'ECHEANCE_SUGGESTION'
}

export enum TypeControleEcriture {
  EQUILIBRE = 'EQUILIBRE',
  COMPTES_EXISTANTS = 'COMPTES_EXISTANTS',
  DATES_COHERENTES = 'DATES_COHERENTES',
  MONTANTS_POSITIFS = 'MONTANTS_POSITIFS',
  TIERS_OBLIGATOIRE = 'TIERS_OBLIGATOIRE',
  ANALYTIQUE_OBLIGATOIRE = 'ANALYTIQUE_OBLIGATOIRE',
  PIECE_JUSTIFICATIVE = 'PIECE_JUSTIFICATIVE',
  LIMITES_MONTANTS = 'LIMITES_MONTANTS',
  COHERENCE_TVA = 'COHERENCE_TVA',
  EXERCICE_OUVERT = 'EXERCICE_OUVERT',
  DOUBLONS = 'DOUBLONS',
  CONFORMITE_SYSCOHADA = 'CONFORMITE_SYSCOHADA'
}

export enum ResultatControle {
  CONFORME = 'CONFORME',
  NON_CONFORME = 'NON_CONFORME',
  ATTENTION = 'ATTENTION',
  BLOQUANT = 'BLOQUANT',
  INFORMATION = 'INFORMATION'
}

export enum PrioriteControle {
  CRITIQUE = 'CRITIQUE',
  HAUTE = 'HAUTE',
  MOYENNE = 'MOYENNE',
  BASSE = 'BASSE',
  INFORMATION = 'INFORMATION'
}

export enum TypeAnomalieEcriture {
  DESEQUILIBRE = 'DESEQUILIBRE',
  COMPTE_INEXISTANT = 'COMPTE_INEXISTANT',
  DATE_INCOHERENTE = 'DATE_INCOHERENTE',
  MONTANT_ABERRANT = 'MONTANT_ABERRANT',
  TIERS_MANQUANT = 'TIERS_MANQUANT',
  ANALYTIQUE_INCOMPLETE = 'ANALYTIQUE_INCOMPLETE',
  TVA_INCOHERENTE = 'TVA_INCOHERENTE',
  EXERCICE_FERME = 'EXERCICE_FERME',
  DOUBLON_SUSPECTE = 'DOUBLON_SUSPECTE',
  LIBELLE_INCOMPLET = 'LIBELLE_INCOMPLET'
}

export enum GraviteAnomalie {
  BLOQUANTE = 'BLOQUANTE',
  MAJEURE = 'MAJEURE',
  MINEURE = 'MINEURE',
  COSMETIQUE = 'COSMETIQUE'
}

export enum TypeSuggestionAmelioration {
  OPTIMISATION_SAISIE = 'OPTIMISATION_SAISIE',
  AUTOMATISATION = 'AUTOMATISATION',
  TEMPLATE_PERSONALISE = 'TEMPLATE_PERSONALISE',
  FORMATION = 'FORMATION',
  PARAMETRAGE = 'PARAMETRAGE'
}

export enum NiveauFacilite {
  TRES_FACILE = 'TRES_FACILE',
  FACILE = 'FACILE',
  MOYEN = 'MOYEN',
  DIFFICILE = 'DIFFICILE',
  TRES_DIFFICILE = 'TRES_DIFFICILE'
}

export enum NiveauImpact {
  TRES_FAIBLE = 'TRES_FAIBLE',
  FAIBLE = 'FAIBLE',
  MOYEN = 'MOYEN',
  FORT = 'FORT',
  TRES_FORT = 'TRES_FORT'
}

export enum NiveauRisque {
  TRES_FAIBLE = 'TRES_FAIBLE',
  FAIBLE = 'FAIBLE',
  MOYEN = 'MOYEN',
  ELEVE = 'ELEVE',
  TRES_ELEVE = 'TRES_ELEVE'
}

export enum ActionHistorique {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  VALIDATION = 'VALIDATION',
  REJET = 'REJET',
  SUPPRESSION = 'SUPPRESSION',
  DUPLICATION = 'DUPLICATION',
  EXTOURNE = 'EXTOURNE',
  LETTRAGE = 'LETTRAGE',
  DELETTRAGE = 'DELETTRAGE'
}

export enum TypeObservation {
  GENERALE = 'GENERALE',
  TECHNIQUE = 'TECHNIQUE',
  COMPTABLE = 'COMPTABLE',
  FISCALE = 'FISCALE',
  CONTROLE = 'CONTROLE'
}

export enum PrioriteObservation {
  URGENTE = 'URGENTE',
  HAUTE = 'HAUTE',
  NORMALE = 'NORMALE',
  BASSE = 'BASSE'
}

export enum StatutObservation {
  OUVERTE = 'OUVERTE',
  EN_COURS = 'EN_COURS',
  RESOLUE = 'RESOLUE',
  FERMEE = 'FERMEE',
  REPORTEE = 'REPORTEE'
}

export enum NiveauControle {
  BLOQUANT = 'BLOQUANT',
  AVERTISSEMENT = 'AVERTISSEMENT',
  INFORMATION = 'INFORMATION'
}

export enum EtapeValidation {
  SAISIE = 'SAISIE',
  CONTROLE_FORME = 'CONTROLE_FORME',
  CONTROLE_FOND = 'CONTROLE_FOND',
  VALIDATION_COMPTABLE = 'VALIDATION_COMPTABLE',
  VALIDATION_FINALE = 'VALIDATION_FINALE'
}

export enum CategorieComptable {
  CHARGES = 'CHARGES',
  PRODUITS = 'PRODUITS',
  ACTIF = 'ACTIF',
  PASSIF = 'PASSIF',
  IMMOBILISATIONS = 'IMMOBILISATIONS',
  STOCKS = 'STOCKS',
  CREANCES = 'CREANCES',
  DETTES = 'DETTES',
  TRESORERIE = 'TRESORERIE'
}

// ==================== DONNÉES DE RÉFÉRENCE ====================

export const JOURNAUX_SYSCOHADA_DEFAUT = [
  {
    code: 'ACH',
    libelle: 'Journal des Achats',
    type: TypeJournal.ACHAT,
    couleur: '#FF5722',
    nature: NatureJournal.CENTRALISATEUR
  },
  {
    code: 'VTE',
    libelle: 'Journal des Ventes',
    type: TypeJournal.VENTE,
    couleur: '#4CAF50',
    nature: NatureJournal.CENTRALISATEUR
  },
  {
    code: 'BQ',
    libelle: 'Journal de Banque',
    type: TypeJournal.BANQUE,
    couleur: '#2196F3',
    nature: NatureJournal.CENTRALISATEUR
  },
  {
    code: 'CAI',
    libelle: 'Journal de Caisse',
    type: TypeJournal.CAISSE,
    couleur: '#FF9800',
    nature: NatureJournal.CENTRALISATEUR
  },
  {
    code: 'OD',
    libelle: 'Opérations Diverses',
    type: TypeJournal.OPERATIONS_DIVERSES,
    couleur: '#9C27B0',
    nature: NatureJournal.CENTRALISATEUR
  }
];

export const TEMPLATES_ECRITURES_DEFAUT = [
  {
    nom: 'Facture d\'achat avec TVA',
    typeEcriture: TypeEcriture.STANDARD,
    lignes: [
      { compteComptable: '601', libelle: 'Achats', sensComptable: 'DEBIT' },
      { compteComptable: '445', libelle: 'TVA récupérable', sensComptable: 'DEBIT' },
      { compteComptable: '401', libelle: 'Fournisseur', sensComptable: 'CREDIT' }
    ]
  },
  {
    nom: 'Facture de vente avec TVA',
    typeEcriture: TypeEcriture.STANDARD,
    lignes: [
      { compteComptable: '411', libelle: 'Client', sensComptable: 'DEBIT' },
      { compteComptable: '701', libelle: 'Ventes', sensComptable: 'CREDIT' },
      { compteComptable: '443', libelle: 'TVA collectée', sensComptable: 'CREDIT' }
    ]
  },
  {
    nom: 'Règlement fournisseur',
    typeEcriture: TypeEcriture.STANDARD,
    lignes: [
      { compteComptable: '401', libelle: 'Fournisseur', sensComptable: 'DEBIT' },
      { compteComptable: '521', libelle: 'Banque', sensComptable: 'CREDIT' }
    ]
  },
  {
    nom: 'Encaissement client',
    typeEcriture: TypeEcriture.STANDARD,
    lignes: [
      { compteComptable: '521', libelle: 'Banque', sensComptable: 'DEBIT' },
      { compteComptable: '411', libelle: 'Client', sensComptable: 'CREDIT' }
    ]
  },
  {
    nom: 'Salaire et charges sociales',
    typeEcriture: TypeEcriture.STANDARD,
    lignes: [
      { compteComptable: '661', libelle: 'Salaires', sensComptable: 'DEBIT' },
      { compteComptable: '664', libelle: 'Charges sociales', sensComptable: 'DEBIT' },
      { compteComptable: '421', libelle: 'Personnel à payer', sensComptable: 'CREDIT' },
      { compteComptable: '431', libelle: 'Sécurité sociale', sensComptable: 'CREDIT' }
    ]
  }
];

export const CONTROLES_DEFAUT = [
  {
    type: TypeControleEcriture.EQUILIBRE,
    actif: true,
    niveauControle: NiveauControle.BLOQUANT,
    messageBlocant: 'L\'écriture doit être équilibrée (Débits = Crédits)'
  },
  {
    type: TypeControleEcriture.COMPTES_EXISTANTS,
    actif: true,
    niveauControle: NiveauControle.BLOQUANT,
    messageBlocant: 'Tous les comptes utilisés doivent exister dans le plan comptable'
  },
  {
    type: TypeControleEcriture.DATES_COHERENTES,
    actif: true,
    niveauControle: NiveauControle.AVERTISSEMENT,
    messageAvertissement: 'Vérifiez la cohérence des dates (écriture, échéance, valeur)'
  },
  {
    type: TypeControleEcriture.MONTANTS_POSITIFS,
    actif: true,
    niveauControle: NiveauControle.BLOQUANT,
    messageBlocant: 'Les montants doivent être positifs'
  },
  {
    type: TypeControleEcriture.EXERCICE_OUVERT,
    actif: true,
    niveauControle: NiveauControle.BLOQUANT,
    messageBlocant: 'L\'exercice comptable doit être ouvert pour cette période'
  }
];

export const FORMATS_NUMEROTATION = {
  AUTOMATIQUE: '{JOURNAL}-{YYYY}-{######}', // Ex: VTE-2024-000001
  JOURNAL_MOIS: '{JOURNAL}{MM}{######}', // Ex: VTE01000001
  SIMPLE: '{######}', // Ex: 000001
  PERSONNALISE: '{JOURNAL}-{DD}{MM}{YY}-{###}' // Ex: VTE-151224-001
};