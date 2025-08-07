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

export type CategorieComptable = 
  | 'COMPTABILITE_GENERALE'
  | 'COMPTABILITE_ANALYTIQUE'
  | 'FISCALITE'
  | 'AUDIT'
  | 'GESTION_FINANCIERE'
  | 'SYSCOHADA';

export type RythmeApprentissage = 'LENT' | 'REGULIER' | 'RAPIDE' | 'INTENSIF';

export type PrioriteRecommandation = 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';

export type RareteBadge = 'COMMUN' | 'RARE' | 'LEGENDAIRE' | 'UNIQUE';

// ===================================
// TYPES PAIEMENT
// ===================================

export type MethodePaiement = 
  | 'MOBILE_MONEY'
  | 'CARTE_CREDIT'
  | 'VIREMENT_BANCAIRE'
  | 'PAYPAL'
  | 'CHEQUE'
  | 'ESPECES';

export type TypePaiement = MethodePaiement; // Alias pour compatibilité

// ===================================
// TYPES ÉCRITURES COMPTABLES
// ===================================

export type PrioriteControle = 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';

export type SensComptable = 'DEBIT' | 'CREDIT';

// ===================================
// EXPORTS GROUPÉS POUR INDEX
// ===================================

// Ce fichier définit tous les types communs
// Les autres modules peuvent importer depuis './common.types'