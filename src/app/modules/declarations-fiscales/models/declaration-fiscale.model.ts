export interface DeclarationFiscale {
  id?: string;
  type: TypeDeclaration;
  periode: PeriodeDeclaration;
  exercice: string;
  statut: StatutDeclaration;
  formulaire: FormulaireDeclaration;
  calculs: CalculsFiscaux;
  documents: DocumentJoint[];
  validation: ValidationDeclaration;
  transmission: TransmissionDeclaration;
  historique: HistoriqueDeclaration[];
  dateCreation: Date;
  creePar: string;
}

export interface PeriodeDeclaration {
  debut: Date;
  fin: Date;
  mois?: number;
  trimestre?: number;
  annee: number;
  libelle: string;
  echeance: Date;
}

export interface FormulaireDeclaration {
  code: string;
  version: string;
  sections: SectionFormulaire[];
  totaux: TotalFormulaire[];
  preremplissage: PreRemplissage;
  controles: ControleFormulaire[];
}

export interface SectionFormulaire {
  code: string;
  libelle: string;
  ordre: number;
  lignes: LigneFormulaire[];
  obligatoire: boolean;
  visible: boolean;
}

export interface LigneFormulaire {
  code: string;
  libelle: string;
  type: TypeLigne;
  valeur?: number;
  formule?: string;
  comptes?: string[];
  obligatoire: boolean;
  controles: string[];
  aide?: string;
}

export interface TotalFormulaire {
  code: string;
  libelle: string;
  formule: string;
  valeur: number;
  section: string;
}

export interface PreRemplissage {
  automatique: boolean;
  sources: SourcePreRemplissage[];
  regles: ReglePreRemplissage[];
  validation: ValidationPreRemplissage;
}

export interface SourcePreRemplissage {
  type: TypeSource;
  comptes: string[];
  periode: PeriodeSource;
  filtres: FiltreSource[];
  transformation?: TransformationSource;
}

export interface ReglePreRemplissage {
  ligne: string;
  condition: string;
  calcul: string;
  priorite: number;
  actif: boolean;
}

export interface ValidationPreRemplissage {
  controles: string[];
  seuils: SeuilValidation[];
  alertes: AlertePreRemplissage[];
}

export interface SeuilValidation {
  ligne: string;
  min?: number;
  max?: number;
  tolerance: number;
}

export interface AlertePreRemplissage {
  type: string;
  message: string;
  niveau: NiveauAlerte;
  action?: string;
}

export interface ControleFormulaire {
  code: string;
  nom: string;
  type: TypeControle;
  expression: string;
  message: string;
  bloquant: boolean;
}

export interface CalculsFiscaux {
  baseImposable: number;
  tauxApplicable: number;
  montantImpot: number;
  credits: CreditImpot[];
  deductions: DeductionFiscale[];
  penalites?: PenaliteFiscale[];
  acomptes: AcompteFiscal[];
  solde: number;
}

export interface CreditImpot {
  type: string;
  montant: number;
  justification: string;
  documents: string[];
}

export interface DeductionFiscale {
  type: string;
  montant: number;
  base: number;
  taux?: number;
  plafond?: number;
}

export interface PenaliteFiscale {
  type: string;
  base: number;
  taux: number;
  montant: number;
  motif: string;
}

export interface AcompteFiscal {
  date: Date;
  montant: number;
  reference: string;
  type: string;
}

export interface DocumentJoint {
  id?: string;
  nom: string;
  type: TypeDocument;
  obligatoire: boolean;
  taille: number;
  contenu?: File;
  statut: StatutDocument;
  dateAjout: Date;
}

export interface ValidationDeclaration {
  valide: boolean;
  validePar?: string;
  dateValidation?: Date;
  controles: ResultatControle[];
  erreurs: ErreurValidation[];
  avertissements: AvertissementValidation[];
}

export interface ResultatControle {
  code: string;
  nom: string;
  resultat: boolean;
  valeur?: number;
  reference?: number;
  message: string;
}

export interface ErreurValidation {
  code: string;
  ligne: string;
  message: string;
  gravite: GraviteErreur;
  correction?: string;
}

export interface AvertissementValidation {
  code: string;
  ligne: string;
  message: string;
  impact: string;
  ignore: boolean;
}

export interface TransmissionDeclaration {
  mode: ModeTransmission;
  date?: Date;
  reference?: string;
  accuse?: AccuseReception;
  statut: StatutTransmission;
  tentatives: TentativeTransmission[];
}

export interface AccuseReception {
  numero: string;
  date: Date;
  statut: string;
  message?: string;
}

export interface TentativeTransmission {
  date: Date;
  statut: string;
  erreur?: string;
  duree: number;
}

export interface HistoriqueDeclaration {
  id: string;
  date: Date;
  action: ActionHistorique;
  utilisateur: string;
  details: any;
  ancienneValeur?: any;
  nouvelleValeur?: any;
}

// Spécialisations par type de déclaration

export interface DeclarationTVA extends DeclarationFiscale {
  regime: RegimeTVA;
  operations: OperationTVA[];
  deduction: DeductionTVA;
  liquidation: LiquidationTVA;
}

export interface OperationTVA {
  type: TypeOperationTVA;
  base: number;
  taux: number;
  montant: number;
  deductible: boolean;
}

export interface DeductionTVA {
  immobilisations: number;
  biens: number;
  services: number;
  autres: number;
  total: number;
  report?: number;
}

export interface LiquidationTVA {
  tvaCollectee: number;
  tvaDeductible: number;
  tvaADecaisser: number;
  creditReporte?: number;
  acomptes: number;
  solde: number;
}

export interface DeclarationIS extends DeclarationFiscale {
  resultatComptable: number;
  reintegrations: ReintegrationIS[];
  deductions: DeductionIS[];
  resultatFiscal: number;
  deficits: DeficitIS[];
  baseImposable: number;
}

export interface ReintegrationIS {
  nature: string;
  montant: number;
  justification: string;
  permanent: boolean;
}

export interface DeductionIS {
  nature: string;
  montant: number;
  justification: string;
  plafond?: number;
}

export interface DeficitIS {
  exercice: string;
  montant: number;
  impute: number;
  reporte: number;
}

export interface DeclarationSociale extends DeclarationFiscale {
  salaires: SalaireSocial[];
  cotisations: CotisationSociale[];
  organismes: OrganismeSocial[];
}

export interface SalaireSocial {
  employe: string;
  salaireBrut: number;
  salaireNet: number;
  cotisationsEmploye: number;
  cotisationsEmployeur: number;
}

export interface CotisationSociale {
  organisme: string;
  base: number;
  tauxEmploye: number;
  tauxEmployeur: number;
  montantEmploye: number;
  montantEmployeur: number;
}

export interface OrganismeSocial {
  code: string;
  nom: string;
  taux: TauxCotisation[];
  plafonds: PlafondCotisation[];
}

export interface TauxCotisation {
  type: string;
  tauxEmploye: number;
  tauxEmployeur: number;
  assiette: string;
}

export interface PlafondCotisation {
  type: string;
  montant: number;
  periode: string;
}

// ==================== ÉNUMÉRATIONS ====================

export enum TypeDeclaration {
  TVA_MENSUELLE = 'TVA_MENSUELLE',
  TVA_TRIMESTRIELLE = 'TVA_TRIMESTRIELLE',
  IS_ANNUELLE = 'IS_ANNUELLE',
  IS_ACOMPTE = 'IS_ACOMPTE',
  CNSS = 'CNSS',
  IRPP = 'IRPP',
  PATENTE = 'PATENTE',
  TAXE_APPRENTISSAGE = 'TAXE_APPRENTISSAGE'
}

export enum StatutDeclaration {
  BROUILLON = 'BROUILLON',
  EN_COURS = 'EN_COURS',
  VALIDEE = 'VALIDEE',
  TRANSMISE = 'TRANSMISE',
  ACCEPTEE = 'ACCEPTEE',
  REJETEE = 'REJETEE'
}

export enum TypeLigne {
  SAISIE = 'SAISIE',
  CALCUL = 'CALCUL',
  TOTAL = 'TOTAL',
  REPORT = 'REPORT',
  INFORMATION = 'INFORMATION'
}

export enum TypeSource {
  COMPTABILITE = 'COMPTABILITE',
  PAIE = 'PAIE',
  IMMOBILISATIONS = 'IMMOBILISATIONS',
  STOCKS = 'STOCKS',
  MANUEL = 'MANUEL'
}

export enum TypeControle {
  COHERENCE = 'COHERENCE',
  COMPLETUDE = 'COMPLETUDE',
  CALCUL = 'CALCUL',
  PLAFOND = 'PLAFOND',
  OBLIGATOIRE = 'OBLIGATOIRE'
}

export enum NiveauAlerte {
  INFO = 'INFO',
  ATTENTION = 'ATTENTION',
  ERREUR = 'ERREUR',
  CRITIQUE = 'CRITIQUE'
}

export enum TypeDocument {
  JUSTIFICATIF = 'JUSTIFICATIF',
  ANNEXE = 'ANNEXE',
  CERTIFICAT = 'CERTIFICAT',
  ATTESTATION = 'ATTESTATION'
}

export enum StatutDocument {
  MANQUANT = 'MANQUANT',
  PRESENT = 'PRESENT',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE'
}

export enum GraviteErreur {
  FAIBLE = 'FAIBLE',
  MOYENNE = 'MOYENNE',
  FORTE = 'FORTE',
  BLOQUANTE = 'BLOQUANTE'
}

export enum ModeTransmission {
  ELECTRONIQUE = 'ELECTRONIQUE',
  PAPIER = 'PAPIER',
  MIXTE = 'MIXTE'
}

export enum StatutTransmission {
  NON_TRANSMISE = 'NON_TRANSMISE',
  EN_COURS = 'EN_COURS',
  TRANSMISE = 'TRANSMISE',
  ECHEC = 'ECHEC'
}

export enum ActionHistorique {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  VALIDATION = 'VALIDATION',
  TRANSMISSION = 'TRANSMISSION',
  ANNULATION = 'ANNULATION'
}

export enum RegimeTVA {
  REEL_MENSUEL = 'REEL_MENSUEL',
  REEL_TRIMESTRIEL = 'REEL_TRIMESTRIEL',
  SIMPLIFIE = 'SIMPLIFIE',
  FRANCHISE = 'FRANCHISE'
}

export enum TypeOperationTVA {
  VENTES_LOCALES = 'VENTES_LOCALES',
  EXPORTATIONS = 'EXPORTATIONS',
  PRESTATIONS = 'PRESTATIONS',
  IMPORTATIONS = 'IMPORTATIONS'
}

// ==================== DONNÉES DE RÉFÉRENCE ====================

export const DECLARATIONS_DEFAUT = [
  {
    type: TypeDeclaration.TVA_MENSUELLE,
    nom: 'Déclaration TVA Mensuelle',
    periodicite: 'MENSUELLE',
    echeance: 15
  },
  {
    type: TypeDeclaration.IS_ANNUELLE,
    nom: 'Déclaration IS Annuelle',
    periodicite: 'ANNUELLE',
    echeance: 90
  },
  {
    type: TypeDeclaration.CNSS,
    nom: 'Déclaration CNSS',
    periodicite: 'MENSUELLE',
    echeance: 15
  }
];

export const TAUX_TVA_SYSCOHADA = {
  STANDARD: 18,
  REDUIT: 9,
  ZERO: 0,
  EXONERE: 0
};

export const TAUX_IS_SYSCOHADA = {
  STANDARD: 25,
  PME: 20,
  REDUIT: 15
};

export const CONTROLES_FISCAUX_DEFAUT = [
  {
    code: 'TVA_EQUILIBRE',
    nom: 'Équilibre TVA',
    expression: 'tva_collectee >= tva_deductible',
    message: 'La TVA collectée doit être supérieure ou égale à la TVA déductible'
  },
  {
    code: 'IS_POSITIF',
    nom: 'IS Positif',
    expression: 'base_imposable >= 0',
    message: 'La base imposable ne peut pas être négative'
  }
];

export const ORGANISMES_SOCIAUX_DEFAUT = [
  {
    code: 'CNSS',
    nom: 'Caisse Nationale de Sécurité Sociale',
    taux: [
      { type: 'MALADIE', tauxEmploye: 3.5, tauxEmployeur: 7.0 },
      { type: 'PENSION', tauxEmploye: 3.2, tauxEmployeur: 4.8 },
      { type: 'ACCIDENT', tauxEmploye: 0.0, tauxEmployeur: 2.0 }
    ]
  }
];