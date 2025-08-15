// Types de taxes disponibles au Burkina Faso et région OHADA
export enum TypeTaxe {
  TVA = 'TVA',
  IRPP = 'IRPP',
  IS = 'IS',
  TAP = 'TAP',
  TPA = 'TPA',
  IUTS = 'IUTS',
  ASDI = 'ASDI',
  FDFP = 'FDFP',
  CNSS_EMPLOYEUR = 'CNSS_EMPLOYEUR',
  CNSS_EMPLOYE = 'CNSS_EMPLOYE',
  RETENUE_SOURCE = 'RETENUE_SOURCE',
  PATENTE = 'PATENTE',
  TAXE_FONCIERE = 'TAXE_FONCIERE',
  DROITS_ENREGISTREMENT = 'DROITS_ENREGISTREMENT',
  TIMBRE = 'TIMBRE'
}

// Nature de la taxe pour le calcul
export enum NatureTaxe {
  COLLECTEE = 'COLLECTEE',        // TVA collectée
  DEDUCTIBLE = 'DEDUCTIBLE',      // TVA déductible
  A_PAYER = 'A_PAYER',           // Taxes à payer
  RETENUE = 'RETENUE',           // Retenues à la source
  COTISATION = 'COTISATION'       // Cotisations sociales
}

// Mode de calcul de la taxe
export enum ModeCalculTaxe {
  POURCENTAGE = 'POURCENTAGE',    // Pourcentage du montant HT
  MONTANT_FIXE = 'MONTANT_FIXE',  // Montant fixe
  BAREME = 'BAREME',              // Barème progressif
  FORFAITAIRE = 'FORFAITAIRE'     // Forfait selon critères
}

// Période d'exigibilité
export enum PeriodeExigibilite {
  IMMEDIATEMENT = 'IMMEDIATEMENT',
  MENSUEL = 'MENSUEL',
  TRIMESTRIEL = 'TRIMESTRIEL',
  SEMESTRIEL = 'SEMESTRIEL',
  ANNUEL = 'ANNUEL'
}

// Configuration d'une taxe fiscale
export interface ConfigurationTaxeFiscale {
  id: string;
  entrepriseId: string;
  typeTaxe: TypeTaxe;
  natureTaxe: NatureTaxe;
  
  // Informations générales
  libelle: string;
  description?: string;
  actif: boolean;
  obligatoire: boolean;
  
  // Calcul de la taxe
  modeCalcul: ModeCalculTaxe;
  taux?: number;                  // Pourcentage (ex: 18 pour 18%)
  montantFixe?: number;           // Montant fixe
  bareme?: BaremeFiscal[];        // Barème progressif
  
  // Comptes comptables
  compteCollecte?: string;        // Compte de collecte (ex: 4432)
  compteDeduction?: string;       // Compte de déduction (ex: 4451)
  compteDette?: string;           // Compte de dette fiscale (ex: 4421)
  compteCharge?: string;          // Compte de charge (ex: 6311)
  compteProduit?: string;         // Compte de produit
  
  // Conditions d'application
  seuilApplication?: number;      // Seuil minimum d'application
  tauxReduit?: number;           // Taux réduit si applicable
  exonerations?: ExonerationFiscale[];
  
  // Périodicité et déclaration
  periodeExigibilite: PeriodeExigibilite;
  dateEcheance?: string;         // Date d'échéance mensuelle (ex: "15")
  
  // Métadonnées
  codeOfficiel?: string;         // Code officiel de la taxe
  texteReglementaire?: string;   // Référence du texte
  dateApplication: string;       // Date d'entrée en vigueur
  dateExpiration?: string;       // Date de fin si applicable
  
  // Paramètres avancés
  calculAutoматique: boolean;    // Calcul automatique lors des écritures
  controleCoherence: boolean;    // Contrôle de cohérence activé
  alerteSeuil?: number;          // Alerte si dépassement de seuil
  
  // Intégration
  modulesConcernes: string[];    // Modules où la taxe s'applique
  journauxConcernes: string[];   // Journaux où la taxe s'applique
  
  // Historique
  versionsHistorique?: VersionTaxe[];
  dateCreation: string;
  dateMiseAJour: string;
  creeParUserId: string;
  modifieParUserId?: string;
}

// Barème fiscal pour les taxes progressives
export interface BaremeFiscal {
  id: string;
  trancheDe: number;            // Montant minimum de la tranche
  trancheA: number;             // Montant maximum de la tranche
  taux: number;                 // Taux applicable à cette tranche
  abattement?: number;          // Abattement éventuel
  ordre: number;                // Ordre de la tranche
}

// Exonérations fiscales
export interface ExonerationFiscale {
  id: string;
  libelle: string;
  description: string;
  typeExoneration: TypeExoneration;
  valeur?: number;              // Pourcentage ou montant
  conditionsApplication: string[];
  dateDebut: string;
  dateFin?: string;
  actif: boolean;
}

export enum TypeExoneration {
  TOTALE = 'TOTALE',           // Exonération totale
  PARTIELLE = 'PARTIELLE',     // Exonération partielle
  ABATTEMENT = 'ABATTEMENT',   // Abattement sur la base
  PLAFOND = 'PLAFOND'          // Plafonnement
}

// Historique des versions de taxe
export interface VersionTaxe {
  id: string;
  version: string;
  dateVersion: string;
  modifications: string[];
  utilisateurId: string;
  raisonModification: string;
  configurationPrecedente: Partial<ConfigurationTaxeFiscale>;
}

// Configuration complète des taxes d'une entreprise
export interface ConfigurationFiscaleEntreprise {
  id: string;
  entrepriseId: string;
  nomEntreprise: string;
  pays: string;                 // Code pays (BF, CI, SN, etc.)
  
  // Configuration générale
  regimeFiscal: RegimeFiscal;
  numeroContribuable?: string;
  rccm?: string;
  dateCreationFiscale: string;
  
  // Taxes configurées
  taxes: ConfigurationTaxeFiscale[];
  
  // Paramètres de calcul
  arrondissement: ModeArrondissement;
  deviseParDefaut: string;
  precisonDecimale: number;
  
  // Contrôles automatiques
  controlesCohérence: ControleFiscal[];
  alertesActivees: boolean;
  seuilsAlertes: SeuilAlerte[];
  
  // Intégration comptable
  automatisationEcritures: boolean;
  journalTaxesDefaut?: string;
  compteAttenteTaxes?: string;
  
  // Métadonnées
  dateCreation: string;
  dateMiseAJour: string;
  version: string;
  statut: StatutConfiguration;
}

export enum RegimeFiscal {
  NORMAL = 'NORMAL',
  SIMPLIFIE = 'SIMPLIFIE',
  FORFAITAIRE = 'FORFAITAIRE',
  EXONERE = 'EXONERE'
}

export enum ModeArrondissement {
  STANDARD = 'STANDARD',        // Arrondi mathématique
  SUPERIEUR = 'SUPERIEUR',      // Arrondi supérieur
  INFERIEUR = 'INFERIEUR',      // Arrondi inférieur
  TRONQUE = 'TRONQUE'          // Troncature
}

export enum StatutConfiguration {
  BROUILLON = 'BROUILLON',
  ACTIF = 'ACTIF',
  ARCHIVE = 'ARCHIVE',
  SUSPENDU = 'SUSPENDU'
}

// Contrôles fiscaux automatiques
export interface ControleFiscal {
  id: string;
  libelle: string;
  description: string;
  typeControle: TypeControleFiscal;
  conditionsApplication: string[];
  actif: boolean;
  niveau: NiveauControle;
}

export enum TypeControleFiscal {
  COHERENCE_TAUX = 'COHERENCE_TAUX',
  SEUILS_REGLEMENTAIRES = 'SEUILS_REGLEMENTAIRES',
  CALCULS_TAXES = 'CALCULS_TAXES',
  DATES_ECHEANCES = 'DATES_ECHEANCES',
  COMPTES_COMPTABLES = 'COMPTES_COMPTABLES'
}

export enum NiveauControle {
  INFORMATION = 'INFORMATION',
  AVERTISSEMENT = 'AVERTISSEMENT',
  ERREUR = 'ERREUR',
  BLOQUANT = 'BLOQUANT'
}

// Seuils d'alerte
export interface SeuilAlerte {
  id: string;
  typeSeuil: TypeSeuil;
  valeurSeuil: number;
  typeComparaison: TypeComparaison;
  messageAlerte: string;
  actionsRecommandees: string[];
  actif: boolean;
}

export enum TypeSeuil {
  TVA_COLLECTEE = 'TVA_COLLECTEE',
  TVA_DEDUCTIBLE = 'TVA_DEDUCTIBLE',
  CREDIT_TVA = 'CREDIT_TVA',
  TOTAL_TAXES = 'TOTAL_TAXES',
  RETENUES_SOURCE = 'RETENUES_SOURCE'
}

export enum TypeComparaison {
  SUPERIEUR = 'SUPERIEUR',
  INFERIEUR = 'INFERIEUR',
  EGAL = 'EGAL',
  DIFFERENT = 'DIFFERENT'
}

// Configuration prédéfinie pour le Burkina Faso
export const CONFIGURATION_FISCALE_BURKINA_FASO: Partial<ConfigurationTaxeFiscale>[] = [
  {
    typeTaxe: TypeTaxe.TVA,
    natureTaxe: NatureTaxe.COLLECTEE,
    libelle: 'TVA Collectée (18%)',
    description: 'Taxe sur la Valeur Ajoutée collectée sur les ventes',
    modeCalcul: ModeCalculTaxe.POURCENTAGE,
    taux: 18,
    compteCollecte: '4432',
    periodeExigibilite: PeriodeExigibilite.MENSUEL,
    dateEcheance: '15',
    codeOfficiel: 'TVA_COLL',
    obligatoire: true,
    actif: true,
    calculAutoматique: true,
    modulesConcernes: ['VENTES', 'PRESTATIONS'],
    journauxConcernes: ['VTE']
  },
  {
    typeTaxe: TypeTaxe.TVA,
    natureTaxe: NatureTaxe.DEDUCTIBLE,
    libelle: 'TVA Déductible (18%)',
    description: 'Taxe sur la Valeur Ajoutée déductible sur les achats',
    modeCalcul: ModeCalculTaxe.POURCENTAGE,
    taux: 18,
    compteDeduction: '4451',
    periodeExigibilite: PeriodeExigibilite.MENSUEL,
    codeOfficiel: 'TVA_DED',
    obligatoire: true,
    actif: true,
    calculAutoматique: true,
    modulesConcernes: ['ACHATS', 'IMMOBILISATIONS'],
    journauxConcernes: ['ACH']
  },
  {
    typeTaxe: TypeTaxe.TAP,
    natureTaxe: NatureTaxe.A_PAYER,
    libelle: 'Taxe d\'Apprentissage Professionnel (2%)',
    description: 'TAP sur masse salariale',
    modeCalcul: ModeCalculTaxe.POURCENTAGE,
    taux: 2,
    compteDette: '4421',
    compteCharge: '6311',
    periodeExigibilite: PeriodeExigibilite.MENSUEL,
    codeOfficiel: 'TAP',
    obligatoire: true,
    actif: true,
    modulesConcernes: ['PAIE'],
    journauxConcernes: ['PAIE']
  },
  {
    typeTaxe: TypeTaxe.CNSS_EMPLOYEUR,
    natureTaxe: NatureTaxe.COTISATION,
    libelle: 'CNSS Employeur (16%)',
    description: 'Cotisation sociale employeur',
    modeCalcul: ModeCalculTaxe.POURCENTAGE,
    taux: 16,
    compteDette: '4311',
    compteCharge: '6611',
    periodeExigibilite: PeriodeExigibilite.MENSUEL,
    codeOfficiel: 'CNSS_EMP',
    obligatoire: true,
    actif: true,
    modulesConcernes: ['PAIE'],
    journauxConcernes: ['PAIE']
  },
  {
    typeTaxe: TypeTaxe.CNSS_EMPLOYE,
    natureTaxe: NatureTaxe.RETENUE,
    libelle: 'CNSS Employé (5.5%)',
    description: 'Cotisation sociale employé',
    modeCalcul: ModeCalculTaxe.POURCENTAGE,
    taux: 5.5,
    compteDette: '4311',
    periodeExigibilite: PeriodeExigibilite.MENSUEL,
    codeOfficiel: 'CNSS_EMP',
    obligatoire: true,
    actif: true,
    modulesConcernes: ['PAIE'],
    journauxConcernes: ['PAIE']
  }
];

// Utilitaires de calcul
export interface CalculTaxeParams {
  montantBase: number;
  typeTaxe: TypeTaxe;
  configurationTaxe: ConfigurationTaxeFiscale;
  dateOperation: string;
  exonerations?: ExonerationFiscale[];
}

export interface ResultatCalculTaxe {
  montantBase: number;
  montantTaxe: number;
  tauxApplique: number;
  montantExonere?: number;
  detailsCalcul: DetailCalculTaxe[];
  ecrituresComptables: EcritureComptableTaxe[];
}

export interface DetailCalculTaxe {
  etape: string;
  description: string;
  calcul: string;
  montant: number;
}

export interface EcritureComptableTaxe {
  compteDebit?: string;
  compteCredit?: string;
  libelle: string;
  montant: number;
  sensOperation: 'DEBIT' | 'CREDIT';
}

// Statistiques fiscales
export interface StatistiquesFiscales {
  entrepriseId: string;
  periode: string;
  
  // TVA
  tvaCollectee: number;
  tvaDeductible: number;
  creditTva: number;
  detteeTva: number;
  
  // Autres taxes
  totalTaxesPayees: number;
  totalRetenues: number;
  totalCotisationsSociales: number;
  
  // Évolution
  evolutionMensuelle: EvolutionFiscale[];
  comparaisonAnneesPrecedentes: ComparaisonFiscale[];
  
  // Alertes
  alertesActives: AlerteFiscale[];
  recommandations: RecommandationFiscale[];
}

export interface EvolutionFiscale {
  mois: string;
  tvaCollectee: number;
  tvaDeductible: number;
  autresTaxes: number;
  evolution: number; // Pourcentage d'évolution
}

export interface ComparaisonFiscale {
  annee: string;
  montantTotal: number;
  evolution: number;
}

export interface AlerteFiscale {
  id: string;
  type: string;
  niveau: NiveauControle;
  message: string;
  dateDetection: string;
  recommandations: string[];
  traite: boolean;
}

export interface RecommandationFiscale {
  id: string;
  titre: string;
  description: string;
  impact: 'POSITIF' | 'NEUTRE' | 'NEGATIF';
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE';
  actions: string[];
  echeance?: string;
}