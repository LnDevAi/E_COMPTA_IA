export interface CompteComptable {
  id?: string;
  numero: string; // 101000, 411000, etc.
  intitule: string;
  description?: string;
  
  // Classification SYSCOHADA
  classe: ClasseComptable;
  sousClasse?: string;
  divisionnaire?: string;
  subdivionnaire?: string;
  
  // Propriétés comptables
  typeCompte: TypeCompte;
  natureSolde: NatureSolde;
  utilisationAnalytique: boolean;
  lettrable: boolean;
  rapprochable: boolean;
  
  // Contraintes et validations
  saisieAutorisee: boolean;
  ventilationObligatoire: boolean;
  auxiliaireObligatoire: boolean;
  pieceJustificativeObligatoire: boolean;
  
  // Informations complémentaires
  compteRacine?: string; // Compte parent
  comptesEnfants?: string[]; // Comptes dérivés
  compteCollectif?: string; // Pour les comptes individuels
  
  // Paramètres AUDCIF
  categorieAUDCIF: CategorieAUDCIF;
  ratiosAffectes: string[]; // Ratios AUDCIF concernés
  
  // Métadonnées
  dateCreation: Date;
  derniereModification: Date;
  statut: StatutCompte;
  personnalise: boolean; // Ajouté par l'entreprise
  
  // Soldes et mouvements
  soldeDebit?: number;
  soldeCredit?: number;
  mouvementDebit?: number;
  mouvementCredit?: number;
  
  // Validation IA
  validationIA?: ValidationCompteIA;
}

export interface PlanComptable {
  id: string;
  nom: string;
  version: string;
  dateApplication: Date;
  
  // Configuration
  entrepriseId: string;
  systemeComptable: string; // SYSCOHADA_AUDCIF, etc.
  paysCode: string;
  exerciceComptable: string;
  
  // Structure
  comptes: CompteComptable[];
  nombreComptes: number;
  nombreComptesCrees: number;
  nombreComptesUtilises: number;
  
  // États
  statut: StatutPlanComptable;
  pourcentageCompletion: number;
  derniereAnalyse?: Date;
  
  // Configuration avancée
  parametresValidation: ParametresValidation;
  reglesAutomatisation: RegleAutomatisation[];
  
  // Métadonnées
  dateCreation: Date;
  derniereModification: Date;
  creePar: string;
  
  // Statistiques
  statistiques: StatistiquesPlan;
}

export interface ValidationCompteIA {
  score: number; // 0-100
  conformiteSYSCOHADA: boolean;
  controles: ControleCompteIA[];
  suggestions: SuggestionCompte[];
  anomalies: AnomalieCompte[];
  dateValidation: Date;
}

export interface ControleCompteIA {
  type: TypeControle;
  resultat: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION' | 'SUGGESTION';
  message: string;
  details?: any;
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE';
}

export interface SuggestionCompte {
  type: TypeSuggestion;
  titre: string;
  description: string;
  comptesSuggeres?: string[];
  parametresRecommandes?: any;
  beneficeAttendu: string;
}

export interface AnomalieCompte {
  type: TypeAnomalie;
  gravite: 'CRITIQUE' | 'IMPORTANTE' | 'MINEURE';
  description: string;
  compteConcerne: string;
  actionCorrectrice: string;
  dateDetection: Date;
}

export interface ParametresValidation {
  validationAutomatique: boolean;
  seuilAlerteSolde: number;
  controleCoherenceObligatoire: boolean;
  validationHierarchique: boolean;
  alerteCompteInexistant: boolean;
  blocageSaisieCompteInactif: boolean;
}

export interface RegleAutomatisation {
  id: string;
  nom: string;
  description: string;
  conditions: ConditionRegle[];
  actions: ActionRegle[];
  active: boolean;
  priorite: number;
  dateCreation: Date;
}

export interface ConditionRegle {
  champ: string;
  operateur: 'EGAL' | 'DIFFERENT' | 'CONTIENT' | 'COMMENCE_PAR' | 'SUPERIEUR' | 'INFERIEUR';
  valeur: any;
  logique?: 'ET' | 'OU';
}

export interface ActionRegle {
  type: 'CREER_COMPTE' | 'MODIFIER_PROPRIETE' | 'ASSOCIER_AUXILIAIRE' | 'GENERER_ALERTE';
  parametres: any;
}

export interface StatistiquesPlan {
  repartitionParClasse: { [classe: string]: number };
  comptesLettres: number;
  comptesRapproches: number;
  comptesAvecAuxiliaires: number;
  moyenneMouvementsParCompte: number;
  tauxUtilisationPlan: number;
  conformiteSYSCOHADA: number;
  scoreQualite: number;
}

export interface ImportPlanComptable {
  id?: string;
  fichier: File;
  format: FormatImport;
  options: OptionsImport;
  
  // Résultats import
  statut: StatutImport;
  comptesImportes?: number;
  comptesRejetes?: number;
  erreurs?: ErreurImport[];
  
  // Validation
  validationPrealable: boolean;
  mappingColonnes: MappingColonne[];
  
  dateImport?: Date;
  importePar: string;
}

export interface MappingColonne {
  colonneSource: string;
  champDestination: string;
  transformation?: string;
  obligatoire: boolean;
  valeurParDefaut?: any;
}

export interface ErreurImport {
  ligne: number;
  colonne?: string;
  erreur: string;
  gravite: 'BLOQUANTE' | 'AVERTISSEMENT';
  suggestion?: string;
}

// Énumérations
export enum ClasseComptable {
  CLASSE_1 = 'CLASSE_1', // Comptes de ressources durables
  CLASSE_2 = 'CLASSE_2', // Comptes d'actif immobilisé
  CLASSE_3 = 'CLASSE_3', // Comptes de stocks
  CLASSE_4 = 'CLASSE_4', // Comptes de tiers
  CLASSE_5 = 'CLASSE_5', // Comptes de trésorerie
  CLASSE_6 = 'CLASSE_6', // Comptes de charges
  CLASSE_7 = 'CLASSE_7', // Comptes de produits
  CLASSE_8 = 'CLASSE_8', // Comptes spéciaux
  CLASSE_9 = 'CLASSE_9'  // Comptes analytiques
}

export enum TypeCompte {
  BILAN = 'BILAN',
  GESTION = 'GESTION',
  SPECIAL = 'SPECIAL',
  ANALYTIQUE = 'ANALYTIQUE'
}

export enum NatureSolde {
  DEBITEUR = 'DEBITEUR',
  CREDITEUR = 'CREDITEUR',
  SANS_SOLDE = 'SANS_SOLDE'
}

export enum CategorieAUDCIF {
  ACTIF_IMMOBILISE = 'ACTIF_IMMOBILISE',
  ACTIF_CIRCULANT = 'ACTIF_CIRCULANT',
  TRESORERIE_ACTIF = 'TRESORERIE_ACTIF',
  RESSOURCES_STABLES = 'RESSOURCES_STABLES',
  PASSIF_CIRCULANT = 'PASSIF_CIRCULANT',
  TRESORERIE_PASSIF = 'TRESORERIE_PASSIF',
  CHARGES_EXPLOITATION = 'CHARGES_EXPLOITATION',
  CHARGES_FINANCIERES = 'CHARGES_FINANCIERES',
  CHARGES_EXCEPTIONNELLES = 'CHARGES_EXCEPTIONNELLES',
  PRODUITS_EXPLOITATION = 'PRODUITS_EXPLOITATION',
  PRODUITS_FINANCIERS = 'PRODUITS_FINANCIERS',
  PRODUITS_EXCEPTIONNELS = 'PRODUITS_EXCEPTIONNELS'
}

export enum StatutCompte {
  ACTIF = 'ACTIF',
  INACTIF = 'INACTIF',
  SUSPENDU = 'SUSPENDU',
  ARCHIVE = 'ARCHIVE'
}

export enum StatutPlanComptable {
  EN_CREATION = 'EN_CREATION',
  EN_VALIDATION = 'EN_VALIDATION',
  VALIDE = 'VALIDE',
  ACTIF = 'ACTIF',
  ARCHIVE = 'ARCHIVE'
}

export enum FormatImport {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  XML = 'XML',
  JSON = 'JSON',
  SYSCOHADA_STANDARD = 'SYSCOHADA_STANDARD'
}

export enum StatutImport {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ERREUR = 'ERREUR',
  ANNULE = 'ANNULE'
}

export enum TypeControle {
  NUMERO_VALIDE = 'NUMERO_VALIDE',
  INTITULE_COHERENT = 'INTITULE_COHERENT',
  CLASSIFICATION_CORRECTE = 'CLASSIFICATION_CORRECTE',
  PROPRIETES_VALIDES = 'PROPRIETES_VALIDES',
  CONFORMITE_SYSCOHADA = 'CONFORMITE_SYSCOHADA',
  COHERENCE_HIERARCHIE = 'COHERENCE_HIERARCHIE',
  DOUBLONS_DETECTES = 'DOUBLONS_DETECTES'
}

export enum TypeSuggestion {
  CREATION_COMPTE = 'CREATION_COMPTE',
  MODIFICATION_PROPRIETE = 'MODIFICATION_PROPRIETE',
  REGROUPEMENT_COMPTES = 'REGROUPEMENT_COMPTES',
  OPTIMISATION_STRUCTURE = 'OPTIMISATION_STRUCTURE',
  CONFORMITE_AUDCIF = 'CONFORMITE_AUDCIF'
}

export enum TypeAnomalie {
  NUMERO_INVALIDE = 'NUMERO_INVALIDE',
  INTITULE_MANQUANT = 'INTITULE_MANQUANT',
  CLASSIFICATION_INCORRECTE = 'CLASSIFICATION_INCORRECTE',
  PROPRIETES_INCOHERENTES = 'PROPRIETES_INCOHERENTES',
  DOUBLON = 'DOUBLON',
  COMPTE_ORPHELIN = 'COMPTE_ORPHELIN'
}

export interface OptionsImport {
  separateur?: string;
  encodage?: string;
  ignorerPremiersLignes?: number;
  creerComptesManquants?: boolean;
  mettreAJourExistants?: boolean;
  validerAvantImport?: boolean;
  sauvegarderAvantImport?: boolean;
}

// Données de référence SYSCOHADA AUDCIF
export const PLAN_COMPTABLE_SYSCOHADA_BASE = [
  // CLASSE 1 - COMPTES DE RESSOURCES DURABLES
  { numero: '10', intitule: 'CAPITAL ET RESERVES', classe: ClasseComptable.CLASSE_1 },
  { numero: '101', intitule: 'Capital social', classe: ClasseComptable.CLASSE_1 },
  { numero: '1011', intitule: 'Capital souscrit, non appelé', classe: ClasseComptable.CLASSE_1 },
  { numero: '1012', intitule: 'Capital souscrit, appelé, non versé', classe: ClasseComptable.CLASSE_1 },
  { numero: '1013', intitule: 'Capital souscrit, appelé, versé', classe: ClasseComptable.CLASSE_1 },
  
  // CLASSE 2 - COMPTES D'ACTIF IMMOBILISE
  { numero: '20', intitule: 'CHARGES IMMOBILISEES', classe: ClasseComptable.CLASSE_2 },
  { numero: '201', intitule: 'Frais de développement', classe: ClasseComptable.CLASSE_2 },
  { numero: '21', intitule: 'IMMOBILISATIONS INCORPORELLES', classe: ClasseComptable.CLASSE_2 },
  { numero: '211', intitule: 'Frais de recherche et de développement', classe: ClasseComptable.CLASSE_2 },
  { numero: '22', intitule: 'TERRAINS', classe: ClasseComptable.CLASSE_2 },
  { numero: '221', intitule: 'Terrains agricoles et forestiers', classe: ClasseComptable.CLASSE_2 },
  
  // CLASSE 3 - COMPTES DE STOCKS
  { numero: '31', intitule: 'MARCHANDISES', classe: ClasseComptable.CLASSE_3 },
  { numero: '311', intitule: 'Marchandises A', classe: ClasseComptable.CLASSE_3 },
  { numero: '32', intitule: 'MATIERES PREMIERES ET FOURNITURES', classe: ClasseComptable.CLASSE_3 },
  { numero: '321', intitule: 'Matières A', classe: ClasseComptable.CLASSE_3 },
  
  // CLASSE 4 - COMPTES DE TIERS
  { numero: '40', intitule: 'FOURNISSEURS ET COMPTES RATTACHES', classe: ClasseComptable.CLASSE_4 },
  { numero: '401', intitule: 'Fournisseurs, dettes en compte', classe: ClasseComptable.CLASSE_4 },
  { numero: '41', intitule: 'CLIENTS ET COMPTES RATTACHES', classe: ClasseComptable.CLASSE_4 },
  { numero: '411', intitule: 'Clients', classe: ClasseComptable.CLASSE_4 },
  
  // CLASSE 5 - COMPTES DE TRESORERIE
  { numero: '50', intitule: 'TITRES DE PLACEMENT', classe: ClasseComptable.CLASSE_5 },
  { numero: '501', intitule: 'Titres de participation', classe: ClasseComptable.CLASSE_5 },
  { numero: '52', intitule: 'BANQUES', classe: ClasseComptable.CLASSE_5 },
  { numero: '521', intitule: 'Banques locales', classe: ClasseComptable.CLASSE_5 },
  { numero: '53', intitule: 'ETABLISSEMENTS FINANCIERS ET ASSIMILES', classe: ClasseComptable.CLASSE_5 },
  { numero: '57', intitule: 'CAISSE', classe: ClasseComptable.CLASSE_5 },
  { numero: '571', intitule: 'Caisse siège social', classe: ClasseComptable.CLASSE_5 },
  
  // CLASSE 6 - COMPTES DE CHARGES
  { numero: '60', intitule: 'ACHATS ET VARIATIONS DE STOCKS', classe: ClasseComptable.CLASSE_6 },
  { numero: '601', intitule: 'Achats de marchandises', classe: ClasseComptable.CLASSE_6 },
  { numero: '61', intitule: 'TRANSPORTS', classe: ClasseComptable.CLASSE_6 },
  { numero: '611', intitule: 'Transports sur achats', classe: ClasseComptable.CLASSE_6 },
  { numero: '62', intitule: 'SERVICES EXTERIEURS A', classe: ClasseComptable.CLASSE_6 },
  { numero: '621', intitule: 'Sous-traitance générale', classe: ClasseComptable.CLASSE_6 },
  
  // CLASSE 7 - COMPTES DE PRODUITS
  { numero: '70', intitule: 'VENTES', classe: ClasseComptable.CLASSE_7 },
  { numero: '701', intitule: 'Ventes de marchandises', classe: ClasseComptable.CLASSE_7 },
  { numero: '72', intitule: 'PRODUCTION VENDUE', classe: ClasseComptable.CLASSE_7 },
  { numero: '721', intitule: 'Ventes en l\'état', classe: ClasseComptable.CLASSE_7 }
];

export const REGLES_VALIDATION_SYSCOHADA = {
  numeroCompte: {
    longueurMin: 2,
    longueurMax: 8,
    formatAutorise: /^[1-9][0-9]*$/,
    classesValides: ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  },
  hierarchie: {
    respecterOrdreClasses: true,
    compteParentObligatoire: false,
    profondeurMax: 4
  },
  proprietes: {
    intituleObligatoire: true,
    longueurIntituleMax: 100,
    caracteresInterditIntitule: ['<', '>', '"', '&']
  }
};