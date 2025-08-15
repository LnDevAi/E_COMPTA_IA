export interface Journal {
  id?: string;
  code: string;
  libelle: string;
  description?: string;
  type: TypeJournal;
  nature: NatureJournal;
  couleur: CouleurJournal;
  icone?: string;
  
  // Configuration
  actif: boolean;
  obligatoire: boolean;
  systeme: boolean;
  ordre: number;
  
  // Numérotation
  formatNumero: FormatNumerotation;
  prochainNumero: number;
  prefixe?: string;
  suffixe?: string;
  
  // Comptes liés
  compteContrepartie?: string;
  comptesAutorises: string[];
  comptesInterdits: string[];
  
  // Contrôles et validations
  controles: ControleJournal[];
  validationObligatoire: boolean;
  seuilValidation?: number;
  approbationRequise: boolean;
  
  // Propriétés SYSCOHADA
  conformiteSYSCOHADA: boolean;
  categorieAUDCIF: CategorieAUDCIF;
  impactRatios: string[];
  
  // Workflow et autorisations
  workflow?: WorkflowJournal;
  autorisationsEcriture: AutorisationEcriture[];
  autorisationsLecture: AutorisationLecture[];
  
  // Analytique et tiers
  analytiqueObligatoire: boolean;
  tiersObligatoire: boolean;
  pieceJustificativeObligatoire: boolean;
  
  // Paramètres d'affichage
  affichage: ParametresAffichage;
  filtresDefaut: FiltreDefaut[];
  colonnesVisibles: string[];
  
  // Statistiques et métriques
  statistiques?: StatistiquesJournal;
  dernierUtilisation?: Date;
  nombreEcritures: number;
  montantTotal: number;
  
  // Métadonnées
  dateCreation: Date;
  creePar: string;
  derniereModification?: Date;
  modifiePar?: string;
  version: number;
  
  // Archivage et historique
  archive: boolean;
  dateArchivage?: Date;
  motifArchivage?: string;
  historique: HistoriqueJournal[];
}

export interface CouleurJournal {
  primaire: string;
  secondaire: string;
  texte: string;
  fond: string;
  bordure: string;
  gradient?: string;
  opacite: number;
  theme: ThemeCouleur;
}

export interface FormatNumerotation {
  type: TypeNumerotation;
  longueur: number;
  remplissage: string;
  separateur: string;
  reinitialisation: PeriodeReinitialisation;
  exemple: string;
  variables: VariableNumerotation[];
}

export interface ControleJournal {
  type: TypeControle;
  actif: boolean;
  parametres: any;
  message: string;
  bloquant: boolean;
  niveau: NiveauControle;
  conditions?: string[];
}

export interface WorkflowJournal {
  etapes: EtapeWorkflow[];
  etapeActuelle: string;
  obligatoire: boolean;
  parallele: boolean;
  delaiValidation?: number;
  notificationsActives: boolean;
}

export interface EtapeWorkflow {
  id: string;
  nom: string;
  description: string;
  ordre: number;
  obligatoire: boolean;
  roles: string[];
  conditions: string[];
  actions: ActionWorkflow[];
  delai?: number;
  statut: StatutEtape;
}

export interface ActionWorkflow {
  type: TypeAction;
  parametres: any;
  conditions?: string[];
  automatique: boolean;
}

export interface AutorisationEcriture {
  role: string;
  utilisateur?: string;
  departement?: string;
  conditions?: string[];
  restrictions: RestrictionEcriture;
  dateDebut?: Date;
  dateFin?: Date;
  actif: boolean;
}

export interface RestrictionEcriture {
  montantMax?: number;
  comptesAutorise?: string[];
  tiersAutorise?: string[];
  heuresAutorisees?: PlageHoraire[];
  approbationRequise: boolean;
  seuilApprobation?: number;
}

export interface PlageHoraire {
  jourSemaine: number; // 0-6 (dimanche-samedi)
  heureDebut: string; // HH:mm
  heureFin: string; // HH:mm
}

export interface AutorisationLecture {
  role: string;
  utilisateur?: string;
  departement?: string;
  niveauAcces: NiveauAcces;
  filtres?: FiltreAcces[];
  masquage?: ChampMasque[];
}

export interface FiltreAcces {
  champ: string;
  operateur: string;
  valeur: any;
  obligatoire: boolean;
}

export interface ChampMasque {
  champ: string;
  typemasquage: TypeMasquage;
  remplacement?: string;
}

export interface ParametresAffichage {
  couleurLignes: boolean;
  lignesAlternees: boolean;
  groupement: GroupementAffichage;
  tri: TriAffichage;
  pagination: PaginationAffichage;
  recap: RecapAffichage;
  export: ExportAffichage;
}

export interface GroupementAffichage {
  actif: boolean;
  champ: string;
  ordre: 'ASC' | 'DESC';
  afficherTotaux: boolean;
  masquerDetails: boolean;
}

export interface TriAffichage {
  champ: string;
  ordre: 'ASC' | 'DESC';
  secondaire?: {
    champ: string;
    ordre: 'ASC' | 'DESC';
  };
}

export interface PaginationAffichage {
  actif: boolean;
  taillePage: number;
  taillesDisponibles: number[];
  navigationRapide: boolean;
}

export interface RecapAffichage {
  actif: boolean;
  position: 'HAUT' | 'BAS' | 'HAUT_BAS';
  champsAffiches: string[];
  calculsAffiches: string[];
}

export interface ExportAffichage {
  formatsDisponibles: FormatExport[];
  optionsParDefaut: any;
  templatePersonnalise?: string;
}

export interface FiltreDefaut {
  nom: string;
  champ: string;
  operateur: OperateurFiltre;
  valeur: any;
  actif: boolean;
  modifiable: boolean;
}

export interface StatistiquesJournal {
  periode: string;
  nombreEcritures: number;
  nombreLignes: number;
  montantTotalDebit: number;
  montantTotalCredit: number;
  montantMoyen: number;
  evolutionMensuelle: EvolutionMensuelle[];
  repartitionComptes: RepartitionCompte[];
  repartitionTiers: RepartitionTiers[];
  performanceTemps: PerformanceTemps;
  erreurs: ErreurStatistique[];
  tendances: TendanceJournal[];
}

export interface EvolutionMensuelle {
  mois: string;
  nombreEcritures: number;
  montantTotal: number;
  evolution: number; // pourcentage
  tendance: 'HAUSSE' | 'BAISSE' | 'STABLE';
}

export interface RepartitionCompte {
  compte: string;
  libelle: string;
  nombreEcritures: number;
  montantTotal: number;
  pourcentage: number;
}

export interface RepartitionTiers {
  tiersId: string;
  tiersNom: string;
  nombreEcritures: number;
  montantTotal: number;
  pourcentage: number;
}

export interface PerformanceTemps {
  tempsSaisieMoyen: number;
  tempsValidationMoyen: number;
  tempsTraitementMoyen: number;
  heuresPic: string[];
  joursPic: string[];
}

export interface ErreurStatistique {
  type: string;
  frequence: number;
  pourcentage: number;
  description: string;
  gravite: GraviteErreur;
  solutionSuggeree?: string;
}

export interface TendanceJournal {
  indicateur: string;
  tendance: 'HAUSSE' | 'BAISSE' | 'STABLE';
  pourcentage: number;
  description: string;
  recommendation?: string;
}

export interface HistoriqueJournal {
  id: string;
  date: Date;
  action: ActionHistorique;
  utilisateur: string;
  details: any;
  ancienneValeur?: any;
  nouvelleValeur?: any;
  commentaire?: string;
  adresseIP?: string;
}

export interface FiltreJournal {
  id?: string;
  nom: string;
  description?: string;
  creePar: string;
  dateCreation: Date;
  partage: boolean;
  favoris: boolean;
  conditions: ConditionFiltre[];
  tri: TriFiltre;
  groupement?: GroupementFiltre;
  export?: ConfigExport;
}

export interface ConditionFiltre {
  id?: string;
  champ: string;
  operateur: OperateurFiltre;
  valeur: any;
  valeurSecondaire?: any; // Pour ENTRE, etc.
  sensibleCasse: boolean;
  obligatoire: boolean;
  logique: LogiqueFiltre; // ET, OU
}

export interface TriFiltre {
  champ: string;
  ordre: 'ASC' | 'DESC';
  priorite: number;
}

export interface GroupementFiltre {
  champ: string;
  afficherTotaux: boolean;
  afficherComptage: boolean;
  masquerDetails: boolean;
}

export interface ConfigExport {
  format: FormatExport;
  colonnes: string[];
  entetes: boolean;
  totaux: boolean;
  template?: string;
  options: any;
}

export interface EcritureJournal {
  id?: string;
  numero: string;
  date: Date;
  libelle: string;
  journal: string;
  reference?: string;
  lignes: LigneJournal[];
  totalDebit: number;
  totalCredit: number;
  statut: StatutEcriture;
  validePar?: string;
  dateValidation?: Date;
}

export interface LigneJournal {
  id?: string;
  ordre: number;
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
  tiers?: string;
  analytique?: string;
  dateEcheance?: Date;
  reference?: string;
}

export interface VueJournal {
  id?: string;
  nom: string;
  description?: string;
  journaux: string[];
  filtres: FiltreJournal[];
  colonnes: ColonneVue[];
  tri: TriVue[];
  groupement?: GroupementVue;
  totaux: TotalVue[];
  configuration: ConfigVue;
  partage: PartageVue;
  dateCreation: Date;
  creePar: string;
}

export interface ColonneVue {
  champ: string;
  libelle: string;
  visible: boolean;
  largeur?: number;
  alignement: 'LEFT' | 'CENTER' | 'RIGHT';
  format?: FormatColonne;
  couleur?: CouleurColonne;
  tri: boolean;
  filtre: boolean;
}

export interface FormatColonne {
  type: 'TEXT' | 'NUMBER' | 'CURRENCY' | 'DATE' | 'PERCENTAGE';
  decimales?: number;
  devise?: string;
  format?: string;
  masque?: string;
}

export interface CouleurColonne {
  conditions: ConditionCouleur[];
  defaut?: string;
}

export interface ConditionCouleur {
  condition: string;
  couleurTexte: string;
  couleurFond?: string;
  style?: StyleTexte;
}

export interface StyleTexte {
  gras: boolean;
  italique: boolean;
  souligne: boolean;
  barrer: boolean;
}

export interface TriVue {
  champ: string;
  ordre: 'ASC' | 'DESC';
  priorite: number;
}

export interface GroupementVue {
  champs: string[];
  afficherTotaux: boolean;
  afficherComptage: boolean;
  masquerDetails: boolean;
  sousGroupement?: GroupementVue;
}

export interface TotalVue {
  champ: string;
  fonction: FonctionTotal;
  position: PositionTotal;
  format?: FormatColonne;
  visible: boolean;
}

export interface ConfigVue {
  actualisation: ActualisationVue;
  pagination: PaginationVue;
  export: ExportVue;
  impression: ImpressionVue;
  droits: DroitsVue;
}

export interface ActualisationVue {
  automatique: boolean;
  intervalle?: number; // en secondes
  conditions?: string[];
}

export interface PaginationVue {
  taillePage: number;
  taillesDisponibles: number[];
  navigationRapide: boolean;
  infosPagination: boolean;
}

export interface ExportVue {
  formatsAutorises: FormatExport[];
  optionsDefaut: any;
  templatePersonnalise?: string;
  limiteLignes?: number;
}

export interface ImpressionVue {
  orientationDefaut: 'PORTRAIT' | 'PAYSAGE';
  formatPapier: FormatPapier;
  marges: MargesImpression;
  entete?: string;
  piedPage?: string;
}

export interface MargesImpression {
  haut: number;
  bas: number;
  gauche: number;
  droite: number;
}

export interface DroitsVue {
  lecture: string[];
  modification: string[];
  suppression: string[];
  export: string[];
  impression: string[];
}

export interface PartageVue {
  public: boolean;
  utilisateurs: string[];
  roles: string[];
  departements: string[];
  modifiable: boolean;
  commentaires: boolean;
}

// ==================== ÉNUMÉRATIONS ====================

export enum TypeJournal {
  ACHATS = 'ACHATS',
  VENTES = 'VENTES',
  BANQUE = 'BANQUE',
  CAISSE = 'CAISSE',
  OPERATIONS_DIVERSES = 'OPERATIONS_DIVERSES',
  PAIE = 'PAIE',
  IMMOBILISATIONS = 'IMMOBILISATIONS',
  STOCKS = 'STOCKS',
  ANALYTIQUE = 'ANALYTIQUE',
  BUDGETAIRE = 'BUDGETAIRE',
  CLOTURE = 'CLOTURE',
  SIMULATION = 'SIMULATION'
}

export enum NatureJournal {
  CENTRALISATEUR = 'CENTRALISATEUR',
  AUXILIAIRE = 'AUXILIAIRE',
  ANALYTIQUE = 'ANALYTIQUE',
  BUDGETAIRE = 'BUDGETAIRE',
  SPECIAL = 'SPECIAL'
}

export enum ThemeCouleur {
  SYSCOHADA = 'SYSCOHADA',
  MODERNE = 'MODERNE',
  CLASSIQUE = 'CLASSIQUE',
  PASTEL = 'PASTEL',
  CONTRASTE = 'CONTRASTE',
  PERSONNALISE = 'PERSONNALISE'
}

export enum TypeNumerotation {
  SEQUENTIEL = 'SEQUENTIEL',
  ANNUEL = 'ANNUEL',
  MENSUEL = 'MENSUEL',
  LIBRE = 'LIBRE',
  PERSONNALISE = 'PERSONNALISE'
}

export enum PeriodeReinitialisation {
  JAMAIS = 'JAMAIS',
  ANNUELLE = 'ANNUELLE',
  MENSUELLE = 'MENSUELLE',
  TRIMESTRIELLE = 'TRIMESTRIELLE',
  SEMESTRIELLE = 'SEMESTRIELLE'
}

export enum VariableNumerotation {
  ANNEE = 'ANNEE',
  MOIS = 'MOIS',
  JOUR = 'JOUR',
  JOURNAL = 'JOURNAL',
  EXERCICE = 'EXERCICE',
  SEQUENCE = 'SEQUENCE'
}

export enum TypeControle {
  EQUILIBRE = 'EQUILIBRE',
  COMPTES_AUTORISES = 'COMPTES_AUTORISES',
  MONTANT_LIMITE = 'MONTANT_LIMITE',
  TIERS_OBLIGATOIRE = 'TIERS_OBLIGATOIRE',
  ANALYTIQUE_OBLIGATOIRE = 'ANALYTIQUE_OBLIGATOIRE',
  PIECE_JUSTIFICATIVE = 'PIECE_JUSTIFICATIVE',
  DATE_COHERENTE = 'DATE_COHERENTE',
  DOUBLON = 'DOUBLON',
  CONFORMITE_SYSCOHADA = 'CONFORMITE_SYSCOHADA'
}

export enum NiveauControle {
  INFORMATION = 'INFORMATION',
  AVERTISSEMENT = 'AVERTISSEMENT',
  BLOQUANT = 'BLOQUANT',
  CRITIQUE = 'CRITIQUE'
}

export enum CategorieAUDCIF {
  ACTIF_IMMOBILISE = 'ACTIF_IMMOBILISE',
  ACTIF_CIRCULANT = 'ACTIF_CIRCULANT',
  TRESORERIE_ACTIF = 'TRESORERIE_ACTIF',
  CAPITAUX_PROPRES = 'CAPITAUX_PROPRES',
  DETTES_FINANCIERES = 'DETTES_FINANCIERES',
  PASSIF_CIRCULANT = 'PASSIF_CIRCULANT',
  TRESORERIE_PASSIF = 'TRESORERIE_PASSIF',
  CHARGES_EXPLOITATION = 'CHARGES_EXPLOITATION',
  PRODUITS_EXPLOITATION = 'PRODUITS_EXPLOITATION',
  CHARGES_FINANCIERES = 'CHARGES_FINANCIERES',
  PRODUITS_FINANCIERS = 'PRODUITS_FINANCIERS',
  CHARGES_EXCEPTIONNELLES = 'CHARGES_EXCEPTIONNELLES',
  PRODUITS_EXCEPTIONNELS = 'PRODUITS_EXCEPTIONNELS'
}

export enum StatutEtape {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  REJETE = 'REJETE',
  IGNORE = 'IGNORE'
}

export enum TypeAction {
  VALIDATION = 'VALIDATION',
  NOTIFICATION = 'NOTIFICATION',
  CALCUL = 'CALCUL',
  INTEGRATION = 'INTEGRATION',
  ARCHIVAGE = 'ARCHIVAGE',
  RAPPORT = 'RAPPORT'
}

export enum NiveauAcces {
  LECTURE = 'LECTURE',
  ECRITURE = 'ECRITURE',
  VALIDATION = 'VALIDATION',
  ADMINISTRATION = 'ADMINISTRATION',
  COMPLET = 'COMPLET'
}

export enum TypeMasquage {
  MASQUE_COMPLET = 'MASQUE_COMPLET',
  MASQUE_PARTIEL = 'MASQUE_PARTIEL',
  REMPLACEMENT = 'REMPLACEMENT',
  CHIFFREMENT = 'CHIFFREMENT'
}

export enum FormatExport {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
  XML = 'XML',
  ODS = 'ODS',
  RTF = 'RTF'
}

export enum OperateurFiltre {
  EGAL = 'EGAL',
  DIFFERENT = 'DIFFERENT',
  SUPERIEUR = 'SUPERIEUR',
  SUPERIEUR_EGAL = 'SUPERIEUR_EGAL',
  INFERIEUR = 'INFERIEUR',
  INFERIEUR_EGAL = 'INFERIEUR_EGAL',
  CONTIENT = 'CONTIENT',
  NE_CONTIENT_PAS = 'NE_CONTIENT_PAS',
  COMMENCE_PAR = 'COMMENCE_PAR',
  FINIT_PAR = 'FINIT_PAR',
  ENTRE = 'ENTRE',
  DANS = 'DANS',
  PAS_DANS = 'PAS_DANS',
  EST_VIDE = 'EST_VIDE',
  NON_VIDE = 'NON_VIDE'
}

export enum LogiqueFiltre {
  ET = 'ET',
  OU = 'OU'
}

export enum GraviteErreur {
  FAIBLE = 'FAIBLE',
  MOYENNE = 'MOYENNE',
  FORTE = 'FORTE',
  CRITIQUE = 'CRITIQUE'
}

export enum ActionHistorique {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  SUPPRESSION = 'SUPPRESSION',
  ACTIVATION = 'ACTIVATION',
  DESACTIVATION = 'DESACTIVATION',
  ARCHIVAGE = 'ARCHIVAGE',
  RESTAURATION = 'RESTAURATION',
  CONFIGURATION = 'CONFIGURATION'
}

export enum StatutEcriture {
  BROUILLON = 'BROUILLON',
  SAISIE = 'SAISIE',
  VALIDE = 'VALIDE',
  COMPTABILISE = 'COMPTABILISE',
  ARCHIVE = 'ARCHIVE'
}

export enum FonctionTotal {
  SOMME = 'SOMME',
  MOYENNE = 'MOYENNE',
  COMPTE = 'COMPTE',
  MINIMUM = 'MINIMUM',
  MAXIMUM = 'MAXIMUM',
  ECART_TYPE = 'ECART_TYPE',
  VARIANCE = 'VARIANCE'
}

export enum PositionTotal {
  GROUPE = 'GROUPE',
  SOUS_TOTAL = 'SOUS_TOTAL',
  TOTAL_GENERAL = 'TOTAL_GENERAL'
}

export enum FormatPapier {
  A4 = 'A4',
  A3 = 'A3',
  LETTER = 'LETTER',
  LEGAL = 'LEGAL',
  PERSONNALISE = 'PERSONNALISE'
}

// ==================== DONNÉES DE RÉFÉRENCE ====================

export const JOURNAUX_SYSCOHADA_DEFAUT: Partial<Journal>[] = [
  {
    code: 'ACH',
    libelle: 'Journal des Achats',
    type: TypeJournal.ACHATS,
    nature: NatureJournal.CENTRALISATEUR,
    couleur: {
      primaire: '#FF5722',
      secondaire: '#FFAB91',
      texte: '#FFFFFF',
      fond: '#FFF3E0',
      bordure: '#FF5722',
      opacite: 0.8,
      theme: ThemeCouleur.SYSCOHADA
    },
    icone: 'shopping_cart',
    conformiteSYSCOHADA: true,
    categorieAUDCIF: CategorieAUDCIF.CHARGES_EXPLOITATION
  },
  {
    code: 'VTE',
    libelle: 'Journal des Ventes',
    type: TypeJournal.VENTES,
    nature: NatureJournal.CENTRALISATEUR,
    couleur: {
      primaire: '#4CAF50',
      secondaire: '#A5D6A7',
      texte: '#FFFFFF',
      fond: '#E8F5E8',
      bordure: '#4CAF50',
      opacite: 0.8,
      theme: ThemeCouleur.SYSCOHADA
    },
    icone: 'point_of_sale',
    conformiteSYSCOHADA: true,
    categorieAUDCIF: CategorieAUDCIF.PRODUITS_EXPLOITATION
  },
  {
    code: 'BQ',
    libelle: 'Journal de Banque',
    type: TypeJournal.BANQUE,
    nature: NatureJournal.CENTRALISATEUR,
    couleur: {
      primaire: '#2196F3',
      secondaire: '#90CAF9',
      texte: '#FFFFFF',
      fond: '#E3F2FD',
      bordure: '#2196F3',
      opacite: 0.8,
      theme: ThemeCouleur.SYSCOHADA
    },
    icone: 'account_balance',
    conformiteSYSCOHADA: true,
    categorieAUDCIF: CategorieAUDCIF.TRESORERIE_ACTIF
  },
  {
    code: 'CAI',
    libelle: 'Journal de Caisse',
    type: TypeJournal.CAISSE,
    nature: NatureJournal.CENTRALISATEUR,
    couleur: {
      primaire: '#FF9800',
      secondaire: '#FFCC02',
      texte: '#FFFFFF',
      fond: '#FFF8E1',
      bordure: '#FF9800',
      opacite: 0.8,
      theme: ThemeCouleur.SYSCOHADA
    },
    icone: 'money',
    conformiteSYSCOHADA: true,
    categorieAUDCIF: CategorieAUDCIF.TRESORERIE_ACTIF
  },
  {
    code: 'OD',
    libelle: 'Opérations Diverses',
    type: TypeJournal.OPERATIONS_DIVERSES,
    nature: NatureJournal.CENTRALISATEUR,
    couleur: {
      primaire: '#9C27B0',
      secondaire: '#CE93D8',
      texte: '#FFFFFF',
      fond: '#F3E5F5',
      bordure: '#9C27B0',
      opacite: 0.8,
      theme: ThemeCouleur.SYSCOHADA
    },
    icone: 'auto_awesome',
    conformiteSYSCOHADA: true,
    categorieAUDCIF: CategorieAUDCIF.CHARGES_EXPLOITATION
  },
  {
    code: 'PAIE',
    libelle: 'Journal de Paie',
    type: TypeJournal.PAIE,
    nature: NatureJournal.CENTRALISATEUR,
    couleur: {
      primaire: '#795548',
      secondaire: '#BCAAA4',
      texte: '#FFFFFF',
      fond: '#EFEBE9',
      bordure: '#795548',
      opacite: 0.8,
      theme: ThemeCouleur.SYSCOHADA
    },
    icone: 'groups',
    conformiteSYSCOHADA: true,
    categorieAUDCIF: CategorieAUDCIF.CHARGES_EXPLOITATION
  }
];

export const COULEURS_THEMES: { [key in ThemeCouleur]: any } = {
  [ThemeCouleur.SYSCOHADA]: {
    palette: ['#FF5722', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B'],
    description: 'Couleurs officielles SYSCOHADA'
  },
  [ThemeCouleur.MODERNE]: {
    palette: ['#1976D2', '#388E3C', '#F57C00', '#7B1FA2', '#5D4037', '#455A64'],
    description: 'Thème moderne et professionnel'
  },
  [ThemeCouleur.CLASSIQUE]: {
    palette: ['#000000', '#424242', '#616161', '#757575', '#9E9E9E', '#BDBDBD'],
    description: 'Thème classique en niveaux de gris'
  },
  [ThemeCouleur.PASTEL]: {
    palette: ['#FFCDD2', '#F8BBD9', '#E1BEE7', '#D1C4E9', '#C5CAE9', '#BBDEFB'],
    description: 'Couleurs douces et apaisantes'
  },
  [ThemeCouleur.CONTRASTE]: {
    palette: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
    description: 'Couleurs très contrastées pour l\'accessibilité'
  },
  [ThemeCouleur.PERSONNALISE]: {
    palette: [],
    description: 'Couleurs personnalisées par l\'utilisateur'
  }
};

export const FORMATS_NUMEROTATION_DEFAUT = {
  [TypeNumerotation.SEQUENTIEL]: '{SEQUENCE:6}',
  [TypeNumerotation.ANNUEL]: '{JOURNAL}-{ANNEE}-{SEQUENCE:4}',
  [TypeNumerotation.MENSUEL]: '{JOURNAL}{ANNEE:2}{MOIS:2}-{SEQUENCE:3}',
  [TypeNumerotation.LIBRE]: '{PREFIXE}{SEQUENCE}{SUFFIXE}',
  [TypeNumerotation.PERSONNALISE]: '{JOURNAL}-{ANNEE}-{MOIS:2}-{SEQUENCE:6}'
};

export const CONTROLES_DEFAUT: ControleJournal[] = [
  {
    type: TypeControle.EQUILIBRE,
    actif: true,
    parametres: {},
    message: 'L\'écriture doit être équilibrée',
    bloquant: true,
    niveau: NiveauControle.CRITIQUE
  },
  {
    type: TypeControle.COMPTES_AUTORISES,
    actif: true,
    parametres: { verification: 'existence' },
    message: 'Tous les comptes doivent exister dans le plan comptable',
    bloquant: true,
    niveau: NiveauControle.BLOQUANT
  },
  {
    type: TypeControle.DATE_COHERENTE,
    actif: true,
    parametres: { tolerance: 30 },
    message: 'La date doit être cohérente avec l\'exercice',
    bloquant: false,
    niveau: NiveauControle.AVERTISSEMENT
  }
];

export const COLONNES_DEFAUT_JOURNAL = [
  'numero',
  'date',
  'libelle',
  'compte',
  'debit',
  'credit',
  'tiers',
  'reference',
  'statut'
];

export const OPERATEURS_FILTRE_LIBELLES = {
  [OperateurFiltre.EGAL]: 'égal à',
  [OperateurFiltre.DIFFERENT]: 'différent de',
  [OperateurFiltre.SUPERIEUR]: 'supérieur à',
  [OperateurFiltre.SUPERIEUR_EGAL]: 'supérieur ou égal à',
  [OperateurFiltre.INFERIEUR]: 'inférieur à',
  [OperateurFiltre.INFERIEUR_EGAL]: 'inférieur ou égal à',
  [OperateurFiltre.CONTIENT]: 'contient',
  [OperateurFiltre.NE_CONTIENT_PAS]: 'ne contient pas',
  [OperateurFiltre.COMMENCE_PAR]: 'commence par',
  [OperateurFiltre.FINIT_PAR]: 'finit par',
  [OperateurFiltre.ENTRE]: 'entre',
  [OperateurFiltre.DANS]: 'dans la liste',
  [OperateurFiltre.PAS_DANS]: 'pas dans la liste',
  [OperateurFiltre.EST_VIDE]: 'est vide',
  [OperateurFiltre.NON_VIDE]: 'n\'est pas vide'
};