export interface Balance {
  id?: string;
  nom: string;
  type: TypeBalance;
  periode: PeriodeBalance;
  comptes: CompteBalance[];
  parametres: ParametresBalance;
  totaux: TotalBalance;
  comparaisons?: ComparaisonBalance[];
  analyses: AnalyseBalance[];
  export: ConfigurationExport;
  drill_down: ConfigurationDrillDown;
  dateCreation: Date;
  creePar: string;
}

export interface CompteBalance {
  numero: string;
  libelle: string;
  classe: string;
  nature: NatureCompte;
  
  // Soldes période actuelle
  soldeOuverture: number;
  mouvementsDebit: number;
  mouvementsCredit: number;
  soldeFermeture: number;
  
  // Soldes période comparative
  soldeOuvertureN1?: number;
  mouvementsDebitN1?: number;
  mouvementsCreditN1?: number;
  soldeFermetureN1?: number;
  
  // Analyses
  evolution: number;
  pourcentageTotal: number;
  variance: number;
  
  // Métadonnées
  actif: boolean;
  masque: boolean;
  niveau: number;
  parent?: string;
  enfants: string[];
}

export interface PeriodeBalance {
  debut: Date;
  fin: Date;
  exercice: string;
  libelle: string;
  comparative?: {
    debut: Date;
    fin: Date;
    exercice: string;
    libelle: string;
  };
}

export interface ParametresBalance {
  affichage: AffichageBalance;
  filtres: FiltresBalance;
  calculs: CalculsBalance;
  formatage: FormatageBalance;
}

export interface AffichageBalance {
  niveauDetail: NiveauDetail;
  masquerComptes: boolean;
  masquerSoldesNuls: boolean;
  regroupement: RegroupementBalance;
  couleurs: CouleursBalance;
  pagination: PaginationBalance;
}

export interface FiltresBalance {
  classes: string[];
  comptes: string[];
  natures: NatureCompte[];
  seuils: SeuilsBalance;
  exclusions: string[];
}

export interface SeuilsBalance {
  montantMin?: number;
  montantMax?: number;
  varianceMin?: number;
  evolutionMin?: number;
}

export interface CalculsBalance {
  methode: MethodeCalcul;
  arrondissement: number;
  deviseReference: string;
  taux_change?: TauxChange[];
  retraitements: Retraitement[];
}

export interface TauxChange {
  devise: string;
  taux: number;
  date: Date;
}

export interface Retraitement {
  type: TypeRetraitement;
  comptes: string[];
  formule: string;
  actif: boolean;
}

export interface FormatageBalance {
  decimales: number;
  separateurs: SeparateursNumeriques;
  symboles: SymbolesMonetaires;
  styles: StylesBalance;
}

export interface SeparateursNumeriques {
  milliers: string;
  decimales: string;
}

export interface SymbolesMonetaires {
  principal: string;
  position: 'AVANT' | 'APRES';
  espace: boolean;
}

export interface StylesBalance {
  police: ConfigPolice;
  couleurs: CouleursBalance;
  bordures: BordersBalance;
}

export interface ConfigPolice {
  famille: string;
  taille: number;
  gras: boolean;
  italique: boolean;
}

export interface CouleursBalance {
  entete: string;
  lignesPaires: string;
  lignesImpaires: string;
  totaux: string;
  negatifs: string;
  positifs: string;
  variances: string;
}

export interface BordersBalance {
  afficher: boolean;
  couleur: string;
  epaisseur: number;
  style: 'SOLID' | 'DASHED' | 'DOTTED';
}

export interface TotalBalance {
  actif: TotalSection;
  passif: TotalSection;
  charges: TotalSection;
  produits: TotalSection;
  resultat: number;
  equilibre: boolean;
}

export interface TotalSection {
  montant: number;
  evolution: number;
  pourcentage: number;
  variance: number;
}

export interface ComparaisonBalance {
  type: TypeComparaison;
  periode: PeriodeBalance;
  comptes: CompareCompte[];
  synthese: SyntheseComparaison;
  graphiques: GraphiqueComparaison[];
}

export interface CompareCompte {
  numero: string;
  libelle: string;
  montantActuel: number;
  montantComparaison: number;
  evolution: number;
  variance: number;
  pourcentageEvolution: number;
  tendance: TendanceEvolution;
  alertes: AlerteComparaison[];
}

export interface SyntheseComparaison {
  evolutionGlobale: number;
  varianceTotale: number;
  comptesCroissance: number;
  comptesDecroissance: number;
  comptesStables: number;
  ratiosImpactes: string[];
}

export interface GraphiqueComparaison {
  type: TypeGraphique;
  titre: string;
  donnees: any;
  configuration: ConfigGraphique;
}

export interface ConfigGraphique {
  largeur: number;
  hauteur: number;
  couleurs: string[];
  legende: boolean;
  axes: ConfigAxe[];
}

export interface ConfigAxe {
  nom: string;
  titre: string;
  min?: number;
  max?: number;
  format?: string;
}

export interface AlerteComparaison {
  niveau: NiveauAlerte;
  message: string;
  compte: string;
  valeur: number;
  seuil: number;
  action?: string;
}

export interface AnalyseBalance {
  type: TypeAnalyse;
  nom: string;
  resultats: ResultatAnalyse;
  recommandations: RecommandationAnalyse[];
  graphiques: GraphiqueAnalyse[];
}

export interface ResultatAnalyse {
  score: number;
  niveau: NiveauAnalyse;
  resume: string;
  details: DetailAnalyse[];
  metriques: MetriqueAnalyse[];
}

export interface DetailAnalyse {
  indicateur: string;
  valeur: number;
  reference: number;
  ecart: number;
  evolution: number;
  commentaire: string;
}

export interface MetriqueAnalyse {
  nom: string;
  valeur: number;
  unite: string;
  benchmark?: number;
  interpretation: string;
}

export interface RecommandationAnalyse {
  priorite: PrioriteRecommandation;
  titre: string;
  description: string;
  impact: ImpactRecommandation;
  actions: ActionRecommandation[];
}

export interface ImpactRecommandation {
  financier: number;
  operationnel: string;
  risque: string;
  delai: string;
}

export interface ActionRecommandation {
  nom: string;
  description: string;
  responsable?: string;
  echeance?: Date;
  ressources?: string[];
}

export interface GraphiqueAnalyse {
  type: TypeGraphique;
  titre: string;
  donnees: any;
  configuration: any;
  export?: boolean;
}

export interface ConfigurationExport {
  formats: FormatExport[];
  options: OptionsExport;
  templates: TemplateExport[];
  planification?: PlanificationExport;
}

export interface OptionsExport {
  inclureGraphiques: boolean;
  inclureComparaisons: boolean;
  inclureAnalyses: boolean;
  compressionImages: boolean;
  protection?: ProtectionExport;
  metadonnees: MetadonneesExport;
}

export interface ProtectionExport {
  motDePasse?: string;
  chiffrement: boolean;
  filigrane?: FiligraneExport;
  restrictions: RestrictionExport[];
}

export interface FiligraneExport {
  texte: string;
  position: PositionFiligrane;
  opacite: number;
  couleur: string;
}

export interface RestrictionExport {
  type: TypeRestriction;
  valeur: any;
  actif: boolean;
}

export interface MetadonneesExport {
  auteur: string;
  titre: string;
  sujet?: string;
  motsCles: string[];
  dateCreation: Date;
  version: string;
}

export interface TemplateExport {
  nom: string;
  format: FormatExport;
  structure: StructureTemplate;
  style: StyleTemplate;
  variables: VariableTemplate[];
}

export interface StructureTemplate {
  sections: SectionTemplate[];
  ordre: string[];
  pagination: PaginationTemplate;
}

export interface SectionTemplate {
  nom: string;
  type: TypeSection;
  contenu: ContenuSection;
  visible: boolean;
  ordre: number;
}

export interface ContenuSection {
  titre?: string;
  donnees: TypeDonnee[];
  formatage: FormatageSection;
  conditions?: string[];
}

export interface FormatageSection {
  colonnes: ColonneSection[];
  tri?: TriSection;
  groupement?: GroupementSection;
  totaux?: TotalSection[];
}

export interface ColonneSection {
  nom: string;
  libelle: string;
  largeur: number;
  alignement: AlignementColonne;
  format?: FormatColonne;
  visible: boolean;
}

export interface TriSection {
  colonne: string;
  ordre: 'ASC' | 'DESC';
}

export interface GroupementSection {
  colonne: string;
  totaux: boolean;
}

export interface StyleTemplate {
  police: ConfigPolice;
  couleurs: CouleursTemplate;
  marges: MargesTemplate;
  entete?: EnteteTemplate;
  piedPage?: PiedTemplate;
}

export interface CouleursTemplate {
  fond: string;
  texte: string;
  entete: string;
  bordures: string;
  alternance: string[];
}

export interface MargesTemplate {
  haut: number;
  bas: number;
  gauche: number;
  droite: number;
}

export interface EnteteTemplate {
  hauteur: number;
  contenu: string;
  logo?: string;
  repetition: boolean;
}

export interface PiedTemplate {
  hauteur: number;
  contenu: string;
  numeroPage: boolean;
  repetition: boolean;
}

export interface VariableTemplate {
  nom: string;
  type: TypeVariable;
  valeur: any;
  description: string;
}

export interface PaginationTemplate {
  activee: boolean;
  taillePage?: number;
  orientation: 'PORTRAIT' | 'PAYSAGE';
  format: FormatPapier;
}

export interface PlanificationExport {
  automatique: boolean;
  frequence: FrequenceExport;
  heures: string[];
  jours?: number[];
  conditions?: string[];
  destinataires: DestinataireExport[];
}

export interface DestinataireExport {
  type: TypeDestinataire;
  adresse: string;
  nom?: string;
  format?: FormatExport;
  options?: any;
}

export interface ConfigurationDrillDown {
  niveaux: NiveauDrillDown[];
  navigation: NavigationDrillDown;
  contextuel: MenuContextuel;
  raccourcis: RaccourciDrillDown[];
}

export interface NiveauDrillDown {
  nom: string;
  source: SourceDrillDown;
  filtres: FiltreDrillDown[];
  affichage: AffichageDrillDown;
  actions: ActionDrillDown[];
}

export interface SourceDrillDown {
  type: TypeSourceDrillDown;
  requete: string;
  parametres: any;
  cache: boolean;
}

export interface FiltreDrillDown {
  champ: string;
  valeur: any;
  operateur: OperateurFiltre;
  herite: boolean;
}

export interface AffichageDrillDown {
  colonnes: string[];
  tri: TriDrillDown;
  pagination: PaginationDrillDown;
  totaux: boolean;
}

export interface TriDrillDown {
  colonne: string;
  ordre: 'ASC' | 'DESC';
  defaut: boolean;
}

export interface PaginationDrillDown {
  taille: number;
  rapide: boolean;
  info: boolean;
}

export interface ActionDrillDown {
  nom: string;
  icone: string;
  action: string;
  raccourci?: string;
  visible: boolean;
}

export interface NavigationDrillDown {
  breadcrumb: boolean;
  historique: boolean;
  retour: boolean;
  navigation_clavier: boolean;
}

export interface MenuContextuel {
  actif: boolean;
  actions: ActionContextuelle[];
  personnalisation: boolean;
}

export interface ActionContextuelle {
  nom: string;
  icone: string;
  action: string;
  condition?: string;
  raccourci?: string;
}

export interface RaccourciDrillDown {
  touche: string;
  action: string;
  description: string;
  contexte: string;
}

// ==================== ÉNUMÉRATIONS ====================

export enum TypeBalance {
  GENERALE = 'GENERALE',
  AUXILIAIRE = 'AUXILIAIRE',
  ANALYTIQUE = 'ANALYTIQUE',
  AGED = 'AGED',
  COMPARATIVE = 'COMPARATIVE',
  BUDGETAIRE = 'BUDGETAIRE',
  CONSOLIDEE = 'CONSOLIDEE'
}

export enum NatureCompte {
  ACTIF = 'ACTIF',
  PASSIF = 'PASSIF',
  CHARGE = 'CHARGE',
  PRODUIT = 'PRODUIT',
  RESULTAT = 'RESULTAT'
}

export enum NiveauDetail {
  CLASSE = 'CLASSE',
  SOUS_CLASSE = 'SOUS_CLASSE',
  COMPTE = 'COMPTE',
  SOUS_COMPTE = 'SOUS_COMPTE',
  DETAILLE = 'DETAILLE'
}

export enum RegroupementBalance {
  CLASSE = 'CLASSE',
  NATURE = 'NATURE',
  SECTION = 'SECTION',
  PERSONNALISE = 'PERSONNALISE'
}

export enum MethodeCalcul {
  COMPTABLE = 'COMPTABLE',
  BUDGETAIRE = 'BUDGETAIRE',
  MIXTE = 'MIXTE',
  RETRAITE = 'RETRAITE'
}

export enum TypeRetraitement {
  RECLASSEMENT = 'RECLASSEMENT',
  ELIMINATION = 'ELIMINATION',
  CONVERSION = 'CONVERSION',
  AJUSTEMENT = 'AJUSTEMENT'
}

export enum TypeComparaison {
  PERIODE_PRECEDENTE = 'PERIODE_PRECEDENTE',
  EXERCICE_PRECEDENT = 'EXERCICE_PRECEDENT',
  BUDGET = 'BUDGET',
  PREVISIONNEL = 'PREVISIONNEL',
  BENCHMARK = 'BENCHMARK',
  PERSONNALISE = 'PERSONNALISE'
}

export enum TendanceEvolution {
  FORTE_HAUSSE = 'FORTE_HAUSSE',
  HAUSSE = 'HAUSSE',
  STABLE = 'STABLE',
  BAISSE = 'BAISSE',
  FORTE_BAISSE = 'FORTE_BAISSE'
}

export enum TypeGraphique {
  BARRES = 'BARRES',
  LIGNES = 'LIGNES',
  SECTEURS = 'SECTEURS',
  AIRES = 'AIRES',
  HISTOGRAMME = 'HISTOGRAMME',
  RADAR = 'RADAR',
  TREEMAP = 'TREEMAP'
}

export enum NiveauAlerte {
  INFO = 'INFO',
  ATTENTION = 'ATTENTION',
  ALERTE = 'ALERTE',
  CRITIQUE = 'CRITIQUE'
}

export enum TypeAnalyse {
  STRUCTURE_BILANCIELLE = 'STRUCTURE_BILANCIELLE',
  EVOLUTION_PATRIMONIALE = 'EVOLUTION_PATRIMONIALE',
  PERFORMANCE_FINANCIERE = 'PERFORMANCE_FINANCIERE',
  LIQUIDITE = 'LIQUIDITE',
  SOLVABILITE = 'SOLVABILITE',
  RENTABILITE = 'RENTABILITE',
  ACTIVITE = 'ACTIVITE'
}

export enum NiveauAnalyse {
  EXCELLENT = 'EXCELLENT',
  BON = 'BON',
  MOYEN = 'MOYEN',
  FAIBLE = 'FAIBLE',
  CRITIQUE = 'CRITIQUE'
}

export enum PrioriteRecommandation {
  FAIBLE = 'FAIBLE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  URGENTE = 'URGENTE'
}

export enum FormatExport {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
  XML = 'XML',
  HTML = 'HTML',
  WORD = 'WORD'
}

export enum PositionFiligrane {
  CENTRE = 'CENTRE',
  HAUT_GAUCHE = 'HAUT_GAUCHE',
  HAUT_DROITE = 'HAUT_DROITE',
  BAS_GAUCHE = 'BAS_GAUCHE',
  BAS_DROITE = 'BAS_DROITE'
}

export enum TypeRestriction {
  IMPRESSION = 'IMPRESSION',
  COPIE = 'COPIE',
  MODIFICATION = 'MODIFICATION',
  EXTRACTION = 'EXTRACTION'
}

export enum TypeSection {
  DONNEES = 'DONNEES',
  GRAPHIQUE = 'GRAPHIQUE',
  ANALYSE = 'ANALYSE',
  TEXTE = 'TEXTE',
  IMAGE = 'IMAGE'
}

export enum TypeDonnee {
  COMPTES = 'COMPTES',
  TOTAUX = 'TOTAUX',
  COMPARAISONS = 'COMPARAISONS',
  RATIOS = 'RATIOS',
  STATISTIQUES = 'STATISTIQUES'
}

export enum AlignementColonne {
  GAUCHE = 'GAUCHE',
  CENTRE = 'CENTRE',
  DROITE = 'DROITE'
}

export enum FormatColonne {
  TEXTE = 'TEXTE',
  NOMBRE = 'NOMBRE',
  MONTANT = 'MONTANT',
  POURCENTAGE = 'POURCENTAGE',
  DATE = 'DATE'
}

export enum TypeVariable {
  TEXTE = 'TEXTE',
  NOMBRE = 'NOMBRE',
  DATE = 'DATE',
  BOOLEEN = 'BOOLEEN',
  LISTE = 'LISTE'
}

export enum FormatPapier {
  A4 = 'A4',
  A3 = 'A3',
  LETTER = 'LETTER',
  LEGAL = 'LEGAL'
}

export enum FrequenceExport {
  QUOTIDIEN = 'QUOTIDIEN',
  HEBDOMADAIRE = 'HEBDOMADAIRE',
  MENSUEL = 'MENSUEL',
  TRIMESTRIEL = 'TRIMESTRIEL',
  ANNUEL = 'ANNUEL'
}

export enum TypeDestinataire {
  EMAIL = 'EMAIL',
  FTP = 'FTP',
  SHAREPOINT = 'SHAREPOINT',
  CLOUD = 'CLOUD'
}

export enum TypeSourceDrillDown {
  GRAND_LIVRE = 'GRAND_LIVRE',
  JOURNAL = 'JOURNAL',
  BALANCE_DETAILLEE = 'BALANCE_DETAILLEE',
  ECRITURES = 'ECRITURES',
  BUDGET = 'BUDGET'
}

export enum OperateurFiltre {
  EGAL = 'EGAL',
  DIFFERENT = 'DIFFERENT',
  SUPERIEUR = 'SUPERIEUR',
  INFERIEUR = 'INFERIEUR',
  CONTIENT = 'CONTIENT',
  ENTRE = 'ENTRE'
}

// ==================== DONNÉES DE RÉFÉRENCE ====================

export const BALANCES_DEFAUT = [
  {
    nom: 'Balance Générale',
    type: TypeBalance.GENERALE,
    description: 'Balance générale de tous les comptes'
  },
  {
    nom: 'Balance Clients',
    type: TypeBalance.AUXILIAIRE,
    description: 'Balance auxiliaire des comptes clients'
  },
  {
    nom: 'Balance Fournisseurs',
    type: TypeBalance.AUXILIAIRE,
    description: 'Balance auxiliaire des comptes fournisseurs'
  },
  {
    nom: 'Balance Comparative',
    type: TypeBalance.COMPARATIVE,
    description: 'Balance avec comparaison N-1'
  }
];

export const ANALYSES_DEFAUT = [
  {
    type: TypeAnalyse.STRUCTURE_BILANCIELLE,
    nom: 'Structure du Bilan',
    description: 'Analyse de la structure actif/passif'
  },
  {
    type: TypeAnalyse.LIQUIDITE,
    nom: 'Analyse de Liquidité',
    description: 'Ratios de liquidité et trésorerie'
  },
  {
    type: TypeAnalyse.SOLVABILITE,
    nom: 'Analyse de Solvabilité',
    description: 'Ratios d\'endettement et autonomie'
  },
  {
    type: TypeAnalyse.RENTABILITE,
    nom: 'Analyse de Rentabilité',
    description: 'Ratios de rentabilité et performance'
  }
];

export const COULEURS_DEFAUT: CouleursBalance = {
  entete: '#1976D2',
  lignesPaires: '#F5F5F5',
  lignesImpaires: '#FFFFFF',
  totaux: '#E3F2FD',
  negatifs: '#F44336',
  positifs: '#4CAF50',
  variances: '#FF9800'
};