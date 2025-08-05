export interface Rapport {
  id?: string;
  nom: string;
  type: TypeRapport;
  categorie: CategorieRapport;
  description?: string;
  structure: StructureRapport;
  donnees: DonneesRapport;
  visualisation: VisualisationRapport;
  parametres: ParametresRapport;
  planification?: PlanificationRapport;
  partage: PartageRapport;
  historique: HistoriqueRapport[];
  dateCreation: Date;
  creePar: string;
}

export interface StructureRapport {
  sections: SectionRapport[];
  navigation: NavigationRapport;
  mise_en_page: MiseEnPageRapport;
  interactivite: InteractiviteRapport;
}

export interface SectionRapport {
  id: string;
  nom: string;
  type: TypeSection;
  ordre: number;
  contenu: ContenuSection;
  style: StyleSection;
  visible: boolean;
  conditions?: ConditionAffichage[];
}

export interface ContenuSection {
  titre?: string;
  description?: string;
  donnees: SourceDonnees[];
  graphiques: GraphiqueRapport[];
  tableaux: TableauRapport[];
  indicateurs: IndicateurRapport[];
  texte?: TexteRapport;
}

export interface SourceDonnees {
  nom: string;
  type: TypeSourceDonnees;
  requete: RequeteDonnees;
  transformation?: TransformationDonnees;
  cache: CacheDonnees;
}

export interface RequeteDonnees {
  source: string;
  filtres: FiltreDonnees[];
  jointures?: JointureDonnees[];
  groupement?: GroupementDonnees;
  tri?: TriDonnees[];
  limite?: number;
}

export interface FiltreDonnees {
  champ: string;
  operateur: OperateurFiltre;
  valeur: any;
  logique: LogiqueFiltre;
}

export interface JointureDonnees {
  source: string;
  type: TypeJointure;
  condition: string;
  alias?: string;
}

export interface GroupementDonnees {
  champs: string[];
  fonctions: FonctionAgregation[];
}

export interface FonctionAgregation {
  champ: string;
  fonction: TypeAgregation;
  alias: string;
}

export interface TriDonnees {
  champ: string;
  ordre: OrdreTri;
  priorite: number;
}

export interface TransformationDonnees {
  regles: RegleTransformation[];
  calculs: CalculDonnees[];
  formatage: FormatageDonnees[];
}

export interface RegleTransformation {
  nom: string;
  condition: string;
  action: string;
  parametres: any;
}

export interface CalculDonnees {
  nom: string;
  formule: string;
  type: TypeCalcul;
  dependances: string[];
}

export interface FormatageDonnees {
  champ: string;
  type: TypeFormatage;
  parametres: any;
}

export interface CacheDonnees {
  actif: boolean;
  duree: number;
  cle?: string;
  conditions?: string[];
}

export interface GraphiqueRapport {
  id: string;
  nom: string;
  type: TypeGraphique;
  donnees: string;
  configuration: ConfigurationGraphique;
  interactivite: InteractiviteGraphique;
  export: ExportGraphique;
}

export interface ConfigurationGraphique {
  largeur: number;
  hauteur: number;
  couleurs: string[];
  legende: LegendeGraphique;
  axes: AxeGraphique[];
  series: SerieGraphique[];
  annotations?: AnnotationGraphique[];
}

export interface LegendeGraphique {
  visible: boolean;
  position: PositionLegende;
  style: StyleLegende;
}

export interface AxeGraphique {
  nom: string;
  titre: string;
  type: TypeAxe;
  min?: number;
  max?: number;
  format?: string;
  grille: GrilleAxe;
}

export interface GrilleAxe {
  visible: boolean;
  couleur: string;
  style: StyleLigne;
}

export interface SerieGraphique {
  nom: string;
  champ: string;
  type: TypeSerie;
  couleur: string;
  style: StyleSerie;
  marqueurs?: MarqueurSerie;
}

export interface MarqueurSerie {
  visible: boolean;
  forme: FormeMarqueur;
  taille: number;
  couleur: string;
}

export interface AnnotationGraphique {
  type: TypeAnnotation;
  position: PositionAnnotation;
  texte: string;
  style: StyleAnnotation;
}

export interface InteractiviteGraphique {
  zoom: boolean;
  selection: boolean;
  tooltip: TooltipGraphique;
  evenements: EvenementGraphique[];
}

export interface TooltipGraphique {
  actif: boolean;
  format: string;
  personnalise?: string;
}

export interface EvenementGraphique {
  type: TypeEvenement;
  action: string;
  parametres: any;
}

export interface ExportGraphique {
  formats: FormatExportGraphique[];
  qualite: QualiteExport;
  dimensions?: DimensionsExport;
}

export interface TableauRapport {
  id: string;
  nom: string;
  donnees: string;
  colonnes: ColonneTableau[];
  style: StyleTableau;
  pagination: PaginationTableau;
  tri: TriTableau;
  filtrage: FiltrageTableau;
  export: ExportTableau;
}

export interface ColonneTableau {
  nom: string;
  libelle: string;
  type: TypeColonne;
  largeur: number;
  alignement: AlignementColonne;
  format?: FormatColonne;
  tri: boolean;
  filtre: boolean;
  visible: boolean;
}

export interface StyleTableau {
  theme: ThemeTableau;
  couleurs: CouleursTableau;
  bordures: BordersTableau;
  polices: PolicesTableau;
}

export interface CouleursTableau {
  entete: string;
  lignesPaires: string;
  lignesImpaires: string;
  selection: string;
  survol: string;
}

export interface BordersTableau {
  externes: BorderTableau;
  internes: BorderTableau;
  entete: BorderTableau;
}

export interface BorderTableau {
  visible: boolean;
  couleur: string;
  epaisseur: number;
  style: StyleBordure;
}

export interface PolicesTableau {
  entete: PoliceTableau;
  contenu: PoliceTableau;
}

export interface PoliceTableau {
  famille: string;
  taille: number;
  poids: PoidsPolice;
  couleur: string;
}

export interface PaginationTableau {
  active: boolean;
  taillePage: number;
  taillesDisponibles: number[];
  position: PositionPagination;
}

export interface TriTableau {
  actif: boolean;
  multi: boolean;
  defaut?: TriDefaut[];
}

export interface TriDefaut {
  colonne: string;
  ordre: OrdreTri;
}

export interface FiltrageTableau {
  actif: boolean;
  globale: boolean;
  colonnes: FiltreColonne[];
}

export interface FiltreColonne {
  colonne: string;
  type: TypeFiltreColonne;
  options?: any;
}

export interface ExportTableau {
  formats: FormatExportTableau[];
  options: OptionsExportTableau;
}

export interface OptionsExportTableau {
  entetes: boolean;
  donneesFiltrees: boolean;
  formatage: boolean;
  pagination: boolean;
}

export interface IndicateurRapport {
  id: string;
  nom: string;
  type: TypeIndicateur;
  valeur: ValeurIndicateur;
  seuils: SeuilIndicateur[];
  style: StyleIndicateur;
  animation: AnimationIndicateur;
}

export interface ValeurIndicateur {
  actuelle: number;
  precedente?: number;
  objectif?: number;
  unite: string;
  format: string;
}

export interface SeuilIndicateur {
  nom: string;
  valeur: number;
  couleur: string;
  condition: ConditionSeuil;
}

export interface StyleIndicateur {
  taille: TailleIndicateur;
  couleurs: CouleursIndicateur;
  police: PoliceIndicateur;
  icone?: IconeIndicateur;
}

export interface CouleursIndicateur {
  valeur: string;
  label: string;
  fond: string;
  bordure: string;
}

export interface PoliceIndicateur {
  famille: string;
  taille: number;
  poids: PoidsPolice;
}

export interface IconeIndicateur {
  nom: string;
  position: PositionIcone;
  taille: number;
  couleur: string;
}

export interface AnimationIndicateur {
  active: boolean;
  type: TypeAnimation;
  duree: number;
  delai: number;
}

export interface TexteRapport {
  contenu: string;
  format: FormatTexte;
  variables: VariableTexte[];
}

export interface FormatTexte {
  police: PoliceTexte;
  alignement: AlignementTexte;
  espacement: EspacementTexte;
  couleurs: CouleursTexte;
}

export interface PoliceTexte {
  famille: string;
  taille: number;
  poids: PoidsPolice;
  style: StylePolice;
}

export interface EspacementTexte {
  lignes: number;
  paragraphes: number;
  indentation: number;
}

export interface CouleursTexte {
  texte: string;
  fond: string;
  liens: string;
}

export interface VariableTexte {
  nom: string;
  type: TypeVariable;
  source: string;
  format?: string;
}

export interface StyleSection {
  fond: CouleurFond;
  bordures: BordersSection;
  espacement: EspacementSection;
  ombre?: OmbreSection;
}

export interface CouleurFond {
  type: TypeFond;
  couleur?: string;
  gradient?: GradientFond;
  image?: ImageFond;
}

export interface GradientFond {
  type: TypeGradient;
  couleurs: string[];
  direction: number;
}

export interface ImageFond {
  url: string;
  position: PositionImage;
  repetition: RepetitionImage;
  taille: TailleImage;
}

export interface BordersSection {
  visible: boolean;
  couleur: string;
  epaisseur: number;
  style: StyleBordure;
  rayon: number;
}

export interface EspacementSection {
  interne: EspacementInterne;
  externe: EspacementExterne;
}

export interface EspacementInterne {
  haut: number;
  bas: number;
  gauche: number;
  droite: number;
}

export interface EspacementExterne {
  haut: number;
  bas: number;
  gauche: number;
  droite: number;
}

export interface OmbreSection {
  visible: boolean;
  couleur: string;
  decalageX: number;
  decalageY: number;
  flou: number;
  etendue: number;
}

export interface ConditionAffichage {
  champ: string;
  operateur: OperateurCondition;
  valeur: any;
  logique: LogiqueCondition;
}

export interface NavigationRapport {
  menu: MenuNavigation;
  breadcrumb: BreadcrumbNavigation;
  pagination: PaginationNavigation;
}

export interface MenuNavigation {
  visible: boolean;
  position: PositionMenu;
  style: StyleMenu;
  elements: ElementMenu[];
}

export interface ElementMenu {
  nom: string;
  icone?: string;
  action: string;
  sousElements?: ElementMenu[];
}

export interface BreadcrumbNavigation {
  visible: boolean;
  separateur: string;
  style: StyleBreadcrumb;
}

export interface PaginationNavigation {
  visible: boolean;
  type: TypePaginationNav;
  style: StylePagination;
}

export interface MiseEnPageRapport {
  orientation: OrientationPage;
  format: FormatPage;
  marges: MargesPage;
  colonnes: ColonnesPage;
  entete: EnteteRapport;
  piedPage: PiedPageRapport;
}

export interface MargesPage {
  haut: number;
  bas: number;
  gauche: number;
  droite: number;
}

export interface ColonnesPage {
  nombre: number;
  espacement: number;
  equilibrees: boolean;
}

export interface EnteteRapport {
  visible: boolean;
  hauteur: number;
  contenu: ContenuEntete;
  style: StyleEntete;
  repetition: boolean;
}

export interface ContenuEntete {
  gauche?: string;
  centre?: string;
  droite?: string;
  logo?: LogoEntete;
}

export interface LogoEntete {
  url: string;
  largeur: number;
  hauteur: number;
  position: PositionLogo;
}

export interface StyleEntete {
  fond: string;
  bordure: BorderEntete;
  police: PoliceEntete;
}

export interface BorderEntete {
  visible: boolean;
  couleur: string;
  epaisseur: number;
  position: PositionBordure;
}

export interface PoliceEntete {
  famille: string;
  taille: number;
  couleur: string;
  poids: PoidsPolice;
}

export interface PiedPageRapport {
  visible: boolean;
  hauteur: number;
  contenu: ContenuPiedPage;
  style: StylePiedPage;
  repetition: boolean;
}

export interface ContenuPiedPage {
  gauche?: string;
  centre?: string;
  droite?: string;
  numerotation: NumerotationPage;
}

export interface NumerotationPage {
  visible: boolean;
  format: string;
  position: PositionNumerotation;
}

export interface StylePiedPage {
  fond: string;
  bordure: BorderPiedPage;
  police: PolicePiedPage;
}

export interface BorderPiedPage {
  visible: boolean;
  couleur: string;
  epaisseur: number;
  position: PositionBordure;
}

export interface PolicePiedPage {
  famille: string;
  taille: number;
  couleur: string;
  poids: PoidsPolice;
}

export interface InteractiviteRapport {
  filtres: FiltreInteractif[];
  parametres: ParametreInteractif[];
  actions: ActionInteractive[];
  navigation: NavigationInteractive;
}

export interface FiltreInteractif {
  nom: string;
  type: TypeFiltreInteractif;
  champ: string;
  valeurs?: any[];
  defaut?: any;
  obligatoire: boolean;
}

export interface ParametreInteractif {
  nom: string;
  type: TypeParametre;
  valeur: any;
  options?: any[];
  validation?: ValidationParametre;
}

export interface ValidationParametre {
  obligatoire: boolean;
  min?: number;
  max?: number;
  regex?: string;
  message?: string;
}

export interface ActionInteractive {
  nom: string;
  type: TypeAction;
  declencheur: DeclencheurAction;
  cible: string;
  parametres: any;
}

export interface DeclencheurAction {
  evenement: TypeEvenement;
  element: string;
  condition?: string;
}

export interface NavigationInteractive {
  liens: LienNavigation[];
  boutons: BoutonNavigation[];
  raccourcis: RaccourciNavigation[];
}

export interface LienNavigation {
  nom: string;
  url: string;
  type: TypeLien;
  ouverture: TypeOuverture;
}

export interface BoutonNavigation {
  nom: string;
  icone?: string;
  action: string;
  style: StyleBouton;
  visible: boolean;
}

export interface StyleBouton {
  couleur: string;
  fond: string;
  bordure: string;
  taille: TailleBouton;
}

export interface RaccourciNavigation {
  combinaison: string;
  action: string;
  description: string;
  actif: boolean;
}

export interface DonneesRapport {
  sources: SourceDonnees[];
  cache: CacheRapport;
  actualisation: ActualisationRapport;
  securite: SecuriteRapport;
}

export interface CacheRapport {
  actif: boolean;
  duree: number;
  strategie: StrategieCache;
  invalidation: InvalidationCache;
}

export interface InvalidationCache {
  automatique: boolean;
  conditions: string[];
  evenements: string[];
}

export interface ActualisationRapport {
  automatique: boolean;
  intervalle: number;
  conditions?: string[];
  notification: boolean;
}

export interface SecuriteRapport {
  niveauAcces: NiveauAcces;
  restrictions: RestrictionAcces[];
  audit: AuditRapport;
  chiffrement: ChiffrementRapport;
}

export interface RestrictionAcces {
  type: TypeRestriction;
  valeur: any;
  condition?: string;
}

export interface AuditRapport {
  actif: boolean;
  evenements: string[];
  retention: number;
  export: boolean;
}

export interface ChiffrementRapport {
  actif: boolean;
  algorithme: string;
  cle?: string;
}

export interface VisualisationRapport {
  theme: ThemeVisuel;
  responsive: ResponsiveDesign;
  animations: AnimationRapport;
  accessibilite: AccessibiliteRapport;
}

export interface ThemeVisuel {
  nom: string;
  couleurs: PaletteTheme;
  polices: PolicesTheme;
  espacements: EspacementsTheme;
  ombres: OmbresTheme;
}

export interface PaletteTheme {
  primaire: string;
  secondaire: string;
  accent: string;
  fond: string;
  surface: string;
  texte: string;
  erreur: string;
  succes: string;
  avertissement: string;
  info: string;
}

export interface PolicesTheme {
  titre: PoliceTheme;
  sousTitre: PoliceTheme;
  corps: PoliceTheme;
  legende: PoliceTheme;
  code: PoliceTheme;
}

export interface PoliceTheme {
  famille: string;
  poids: PoidsPolice;
  taille: TaillePolice;
  hauteurLigne: number;
}

export interface TaillePolice {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface EspacementsTheme {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface OmbresTheme {
  petite: string;
  moyenne: string;
  grande: string;
  focus: string;
}

export interface ResponsiveDesign {
  actif: boolean;
  breakpoints: BreakpointResponsive[];
  adaptations: AdaptationResponsive[];
}

export interface BreakpointResponsive {
  nom: string;
  largeur: number;
  description: string;
}

export interface AdaptationResponsive {
  breakpoint: string;
  modifications: ModificationResponsive[];
}

export interface ModificationResponsive {
  element: string;
  propriete: string;
  valeur: any;
}

export interface AnimationRapport {
  actives: boolean;
  entree: AnimationEntree;
  sortie: AnimationSortie;
  transition: AnimationTransition;
  performance: PerformanceAnimation;
}

export interface AnimationEntree {
  type: TypeAnimationEntree;
  duree: number;
  delai: number;
  easing: TypeEasing;
}

export interface AnimationSortie {
  type: TypeAnimationSortie;
  duree: number;
  easing: TypeEasing;
}

export interface AnimationTransition {
  proprietes: string[];
  duree: number;
  easing: TypeEasing;
}

export interface PerformanceAnimation {
  gpu: boolean;
  reduction: boolean;
  prefere: PreferenceAnimation;
}

export interface AccessibiliteRapport {
  conforme: boolean;
  niveau: NiveauAccessibilite;
  options: OptionAccessibilite[];
  tests: TestAccessibilite[];
}

export interface OptionAccessibilite {
  nom: string;
  active: boolean;
  configuration: any;
}

export interface TestAccessibilite {
  nom: string;
  resultat: boolean;
  score: number;
  recommandations: string[];
}

export interface ParametresRapport {
  general: ParametresGeneraux;
  performance: ParametresPerformance;
  export: ParametresExport;
  notification: ParametresNotification;
}

export interface ParametresGeneraux {
  langue: string;
  timezone: string;
  devise: string;
  format: FormatRegional;
  precision: number;
}

export interface FormatRegional {
  date: string;
  heure: string;
  nombre: string;
  devise: string;
}

export interface ParametresPerformance {
  cache: boolean;
  compression: boolean;
  lazy: boolean;
  preload: number;
  timeout: number;
}

export interface ParametresExport {
  formats: FormatExport[];
  qualite: QualiteExport;
  protection: ProtectionExport;
  metadonnees: MetadonneesExport;
}

export interface ProtectionExport {
  motDePasse: boolean;
  filigrane: boolean;
  expiration: boolean;
  telechargement: boolean;
}

export interface MetadonneesExport {
  auteur: boolean;
  titre: boolean;
  description: boolean;
  motsCles: boolean;
  dateCreation: boolean;
}

export interface ParametresNotification {
  actives: boolean;
  types: TypeNotification[];
  canaux: CanalNotification[];
  frequence: FrequenceNotification;
}

export interface CanalNotification {
  type: TypeCanal;
  actif: boolean;
  configuration: any;
}

export interface FrequenceNotification {
  immediat: boolean;
  quotidien: boolean;
  hebdomadaire: boolean;
  mensuel: boolean;
}

export interface PlanificationRapport {
  active: boolean;
  frequence: FrequencePlanification;
  heures: string[];
  jours?: number[];
  mois?: number[];
  conditions?: string[];
  destinataires: DestinataireRapport[];
  format: FormatPlanification;
}

export interface DestinataireRapport {
  type: TypeDestinataire;
  adresse: string;
  nom?: string;
  personnalisation?: PersonnalisationDestinataire;
}

export interface PersonnalisationDestinataire {
  filtres: any;
  format: string;
  langue: string;
  template?: string;
}

export interface FormatPlanification {
  type: FormatExport;
  options: any;
  template?: string;
}

export interface PartageRapport {
  public: boolean;
  utilisateurs: UtilisateurPartage[];
  roles: RolePartage[];
  liens: LienPartage[];
  permissions: PermissionPartage[];
}

export interface UtilisateurPartage {
  id: string;
  nom: string;
  permissions: string[];
  expiration?: Date;
}

export interface RolePartage {
  nom: string;
  permissions: string[];
  utilisateurs: string[];
}

export interface LienPartage {
  id: string;
  url: string;
  expire: Date;
  permissions: string[];
  actif: boolean;
}

export interface PermissionPartage {
  action: ActionPartage;
  autorise: boolean;
  conditions?: string[];
}

export interface HistoriqueRapport {
  id: string;
  date: Date;
  action: ActionHistorique;
  utilisateur: string;
  version: string;
  modifications: ModificationHistorique[];
  taille?: number;
  duree?: number;
}

export interface ModificationHistorique {
  section: string;
  propriete: string;
  ancienneValeur: any;
  nouvelleValeur: any;
  impact: ImpactModification;
}

// ==================== ÉNUMÉRATIONS ====================

export enum TypeRapport {
  DASHBOARD = 'DASHBOARD',
  ANALYTIQUE = 'ANALYTIQUE',
  OPERATIONNEL = 'OPERATIONNEL',
  FINANCIER = 'FINANCIER',
  REGLEMENTAIRE = 'REGLEMENTAIRE',
  PERSONNALISE = 'PERSONNALISE'
}

export enum CategorieRapport {
  COMPTABILITE = 'COMPTABILITE',
  FINANCE = 'FINANCE',
  GESTION = 'GESTION',
  AUDIT = 'AUDIT',
  PERFORMANCE = 'PERFORMANCE',
  CONFORMITE = 'CONFORMITE'
}

export enum TypeSection {
  RESUME = 'RESUME',
  DETAIL = 'DETAIL',
  GRAPHIQUE = 'GRAPHIQUE',
  TABLEAU = 'TABLEAU',
  INDICATEUR = 'INDICATEUR',
  TEXTE = 'TEXTE',
  IMAGE = 'IMAGE'
}

export enum TypeSourceDonnees {
  BASE_DONNEES = 'BASE_DONNEES',
  API = 'API',
  FICHIER = 'FICHIER',
  CALCUL = 'CALCUL',
  TEMPS_REEL = 'TEMPS_REEL'
}

export enum OperateurFiltre {
  EGAL = 'EGAL',
  DIFFERENT = 'DIFFERENT',
  SUPERIEUR = 'SUPERIEUR',
  INFERIEUR = 'INFERIEUR',
  CONTIENT = 'CONTIENT',
  COMMENCE = 'COMMENCE',
  FINIT = 'FINIT',
  ENTRE = 'ENTRE',
  DANS = 'DANS',
  VIDE = 'VIDE'
}

export enum LogiqueFiltre {
  ET = 'ET',
  OU = 'OU',
  NON = 'NON'
}

export enum TypeJointure {
  INNER = 'INNER',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  FULL = 'FULL'
}

export enum TypeAgregation {
  SOMME = 'SOMME',
  MOYENNE = 'MOYENNE',
  COMPTE = 'COMPTE',
  MIN = 'MIN',
  MAX = 'MAX',
  MEDIANE = 'MEDIANE',
  ECART_TYPE = 'ECART_TYPE'
}

export enum OrdreTri {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum TypeCalcul {
  ARITHMETIQUE = 'ARITHMETIQUE',
  STATISTIQUE = 'STATISTIQUE',
  FINANCIER = 'FINANCIER',
  LOGIQUE = 'LOGIQUE',
  TEXTE = 'TEXTE',
  DATE = 'DATE'
}

export enum TypeFormatage {
  NOMBRE = 'NOMBRE',
  DEVISE = 'DEVISE',
  POURCENTAGE = 'POURCENTAGE',
  DATE = 'DATE',
  HEURE = 'HEURE',
  TEXTE = 'TEXTE'
}

export enum TypeGraphique {
  LIGNE = 'LIGNE',
  BARRE = 'BARRE',
  SECTEUR = 'SECTEUR',
  AIRE = 'AIRE',
  NUAGE = 'NUAGE',
  RADAR = 'RADAR',
  TREEMAP = 'TREEMAP',
  HEATMAP = 'HEATMAP',
  GAUGE = 'GAUGE',
  FUNNEL = 'FUNNEL'
}

export enum PositionLegende {
  HAUT = 'HAUT',
  BAS = 'BAS',
  GAUCHE = 'GAUCHE',
  DROITE = 'DROITE',
  FLOTTANTE = 'FLOTTANTE'
}

export enum TypeAxe {
  LINEAIRE = 'LINEAIRE',
  LOGARITHMIQUE = 'LOGARITHMIQUE',
  CATEGORIEL = 'CATEGORIEL',
  TEMPOREL = 'TEMPOREL'
}

export enum StyleLigne {
  SOLIDE = 'SOLIDE',
  POINTILLE = 'POINTILLE',
  TIRET = 'TIRET',
  MIXTE = 'MIXTE'
}

export enum TypeSerie {
  LIGNE = 'LIGNE',
  BARRE = 'BARRE',
  AIRE = 'AIRE',
  POINT = 'POINT'
}

export enum FormeMarqueur {
  CERCLE = 'CERCLE',
  CARRE = 'CARRE',
  TRIANGLE = 'TRIANGLE',
  DIAMANT = 'DIAMANT',
  ETOILE = 'ETOILE'
}

export enum TypeAnnotation {
  TEXTE = 'TEXTE',
  LIGNE = 'LIGNE',
  RECTANGLE = 'RECTANGLE',
  FLECHE = 'FLECHE'
}

export enum TypeEvenement {
  CLIC = 'CLIC',
  SURVOL = 'SURVOL',
  SELECTION = 'SELECTION',
  ZOOM = 'ZOOM',
  CHANGEMENT = 'CHANGEMENT'
}

export enum FormatExportGraphique {
  PNG = 'PNG',
  JPG = 'JPG',
  SVG = 'SVG',
  PDF = 'PDF'
}

export enum QualiteExport {
  BASSE = 'BASSE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  MAXIMALE = 'MAXIMALE'
}

export enum TypeColonne {
  TEXTE = 'TEXTE',
  NOMBRE = 'NOMBRE',
  DEVISE = 'DEVISE',
  POURCENTAGE = 'POURCENTAGE',
  DATE = 'DATE',
  BOOLEEN = 'BOOLEEN',
  LIEN = 'LIEN',
  IMAGE = 'IMAGE'
}

export enum AlignementColonne {
  GAUCHE = 'GAUCHE',
  CENTRE = 'CENTRE',
  DROITE = 'DROITE'
}

export enum FormatColonne {
  DEFAUT = 'DEFAUT',
  PERSONNALISE = 'PERSONNALISE'
}

export enum ThemeTableau {
  CLAIR = 'CLAIR',
  SOMBRE = 'SOMBRE',
  CONTRASTE = 'CONTRASTE',
  MINIMAL = 'MINIMAL',
  CLASSIQUE = 'CLASSIQUE'
}

export enum StyleBordure {
  SOLIDE = 'SOLIDE',
  POINTILLE = 'POINTILLE',
  TIRET = 'TIRET',
  DOUBLE = 'DOUBLE'
}

export enum PoidsPolice {
  LEGER = 'LEGER',
  NORMAL = 'NORMAL',
  GRAS = 'GRAS',
  EXTRA_GRAS = 'EXTRA_GRAS'
}

export enum PositionPagination {
  HAUT = 'HAUT',
  BAS = 'BAS',
  HAUT_BAS = 'HAUT_BAS'
}

export enum TypeFiltreColonne {
  TEXTE = 'TEXTE',
  LISTE = 'LISTE',
  PLAGE = 'PLAGE',
  DATE = 'DATE'
}

export enum FormatExportTableau {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  PDF = 'PDF',
  JSON = 'JSON'
}

export enum TypeIndicateur {
  SIMPLE = 'SIMPLE',
  COMPARAISON = 'COMPARAISON',
  TENDANCE = 'TENDANCE',
  JAUGE = 'JAUGE',
  GRAPHIQUE = 'GRAPHIQUE'
}

export enum ConditionSeuil {
  SUPERIEUR = 'SUPERIEUR',
  INFERIEUR = 'INFERIEUR',
  EGAL = 'EGAL',
  ENTRE = 'ENTRE'
}

export enum TailleIndicateur {
  PETIT = 'PETIT',
  MOYEN = 'MOYEN',
  GRAND = 'GRAND',
  EXTRA_GRAND = 'EXTRA_GRAND'
}

export enum PositionIcone {
  GAUCHE = 'GAUCHE',
  DROITE = 'DROITE',
  HAUT = 'HAUT',
  BAS = 'BAS'
}

export enum TypeAnimation {
  FADE = 'FADE',
  SLIDE = 'SLIDE',
  BOUNCE = 'BOUNCE',
  PULSE = 'PULSE',
  ROTATE = 'ROTATE'
}

export enum AlignementTexte {
  GAUCHE = 'GAUCHE',
  CENTRE = 'CENTRE',
  DROITE = 'DROITE',
  JUSTIFIE = 'JUSTIFIE'
}

export enum StylePolice {
  NORMAL = 'NORMAL',
  ITALIQUE = 'ITALIQUE',
  OBLIQUE = 'OBLIQUE'
}

export enum TypeVariable {
  TEXTE = 'TEXTE',
  NOMBRE = 'NOMBRE',
  DATE = 'DATE',
  BOOLEEN = 'BOOLEEN'
}

export enum TypeFond {
  COULEUR = 'COULEUR',
  GRADIENT = 'GRADIENT',
  IMAGE = 'IMAGE',
  TRANSPARENT = 'TRANSPARENT'
}

export enum TypeGradient {
  LINEAIRE = 'LINEAIRE',
  RADIAL = 'RADIAL',
  CONIQUE = 'CONIQUE'
}

export enum PositionImage {
  CENTRE = 'CENTRE',
  HAUT_GAUCHE = 'HAUT_GAUCHE',
  HAUT_DROITE = 'HAUT_DROITE',
  BAS_GAUCHE = 'BAS_GAUCHE',
  BAS_DROITE = 'BAS_DROITE'
}

export enum RepetitionImage {
  AUCUNE = 'AUCUNE',
  REPETITION = 'REPETITION',
  REPETITION_X = 'REPETITION_X',
  REPETITION_Y = 'REPETITION_Y'
}

export enum TailleImage {
  AUTO = 'AUTO',
  COUVRIR = 'COUVRIR',
  CONTENIR = 'CONTENIR',
  ETIRER = 'ETIRER'
}

export enum OperateurCondition {
  EGAL = 'EGAL',
  DIFFERENT = 'DIFFERENT',
  SUPERIEUR = 'SUPERIEUR',
  INFERIEUR = 'INFERIEUR',
  CONTIENT = 'CONTIENT',
  VIDE = 'VIDE'
}

export enum LogiqueCondition {
  ET = 'ET',
  OU = 'OU'
}

export enum PositionMenu {
  HAUT = 'HAUT',
  BAS = 'BAS',
  GAUCHE = 'GAUCHE',
  DROITE = 'DROITE',
  FLOTTANT = 'FLOTTANT'
}

export enum TypePaginationNav {
  NUMERIQUE = 'NUMERIQUE',
  PRECEDENT_SUIVANT = 'PRECEDENT_SUIVANT',
  INFINI = 'INFINI'
}

export enum OrientationPage {
  PORTRAIT = 'PORTRAIT',
  PAYSAGE = 'PAYSAGE'
}

export enum FormatPage {
  A4 = 'A4',
  A3 = 'A3',
  LETTER = 'LETTER',
  LEGAL = 'LEGAL',
  PERSONNALISE = 'PERSONNALISE'
}

export enum PositionLogo {
  GAUCHE = 'GAUCHE',
  CENTRE = 'CENTRE',
  DROITE = 'DROITE'
}

export enum PositionBordure {
  HAUT = 'HAUT',
  BAS = 'BAS',
  GAUCHE = 'GAUCHE',
  DROITE = 'DROITE',
  TOUTES = 'TOUTES'
}

export enum PositionNumerotation {
  GAUCHE = 'GAUCHE',
  CENTRE = 'CENTRE',
  DROITE = 'DROITE'
}

export enum TypeFiltreInteractif {
  LISTE = 'LISTE',
  PLAGE = 'PLAGE',
  DATE = 'DATE',
  RECHERCHE = 'RECHERCHE',
  BOOLEEN = 'BOOLEEN'
}

export enum TypeParametre {
  TEXTE = 'TEXTE',
  NOMBRE = 'NOMBRE',
  DATE = 'DATE',
  LISTE = 'LISTE',
  BOOLEEN = 'BOOLEEN'
}

export enum TypeAction {
  NAVIGATION = 'NAVIGATION',
  FILTRE = 'FILTRE',
  EXPORT = 'EXPORT',
  IMPRESSION = 'IMPRESSION',
  ACTUALISATION = 'ACTUALISATION'
}

export enum TypeLien {
  INTERNE = 'INTERNE',
  EXTERNE = 'EXTERNE',
  RAPPORT = 'RAPPORT',
  DOCUMENT = 'DOCUMENT'
}

export enum TypeOuverture {
  MEME_FENETRE = 'MEME_FENETRE',
  NOUVELLE_FENETRE = 'NOUVELLE_FENETRE',
  POPUP = 'POPUP',
  MODAL = 'MODAL'
}

export enum TailleBouton {
  PETIT = 'PETIT',
  MOYEN = 'MOYEN',
  GRAND = 'GRAND'
}

export enum StrategieCache {
  LRU = 'LRU',
  FIFO = 'FIFO',
  TTL = 'TTL',
  PERSONNALISEE = 'PERSONNALISEE'
}

export enum NiveauAcces {
  PUBLIC = 'PUBLIC',
  PRIVE = 'PRIVE',
  RESTREINT = 'RESTREINT',
  CONFIDENTIEL = 'CONFIDENTIEL'
}

export enum TypeRestriction {
  IP = 'IP',
  DOMAINE = 'DOMAINE',
  UTILISATEUR = 'UTILISATEUR',
  ROLE = 'ROLE',
  TEMPS = 'TEMPS'
}

export enum TypeAnimationEntree {
  FADE_IN = 'FADE_IN',
  SLIDE_IN = 'SLIDE_IN',
  ZOOM_IN = 'ZOOM_IN',
  BOUNCE_IN = 'BOUNCE_IN'
}

export enum TypeAnimationSortie {
  FADE_OUT = 'FADE_OUT',
  SLIDE_OUT = 'SLIDE_OUT',
  ZOOM_OUT = 'ZOOM_OUT',
  BOUNCE_OUT = 'BOUNCE_OUT'
}

export enum TypeEasing {
  LINEAR = 'LINEAR',
  EASE = 'EASE',
  EASE_IN = 'EASE_IN',
  EASE_OUT = 'EASE_OUT',
  EASE_IN_OUT = 'EASE_IN_OUT'
}

export enum PreferenceAnimation {
  AUCUNE = 'AUCUNE',
  REDUITE = 'REDUITE',
  NORMALE = 'NORMALE'
}

export enum NiveauAccessibilite {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA'
}

export enum FormatExport {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  WORD = 'WORD',
  POWERPOINT = 'POWERPOINT',
  HTML = 'HTML',
  JSON = 'JSON',
  CSV = 'CSV',
  XML = 'XML'
}

export enum TypeNotification {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  ERREUR = 'ERREUR',
  PLANIFICATION = 'PLANIFICATION',
  PARTAGE = 'PARTAGE'
}

export enum TypeCanal {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  WEBHOOK = 'WEBHOOK',
  SLACK = 'SLACK'
}

export enum FrequencePlanification {
  UNIQUE = 'UNIQUE',
  QUOTIDIEN = 'QUOTIDIEN',
  HEBDOMADAIRE = 'HEBDOMADAIRE',
  MENSUEL = 'MENSUEL',
  TRIMESTRIEL = 'TRIMESTRIEL',
  ANNUEL = 'ANNUEL',
  PERSONNALISE = 'PERSONNALISE'
}

export enum TypeDestinataire {
  UTILISATEUR = 'UTILISATEUR',
  GROUPE = 'GROUPE',
  EMAIL = 'EMAIL',
  ROLE = 'ROLE'
}

export enum ActionPartage {
  LECTURE = 'LECTURE',
  MODIFICATION = 'MODIFICATION',
  PARTAGE = 'PARTAGE',
  EXPORT = 'EXPORT',
  IMPRESSION = 'IMPRESSION',
  SUPPRESSION = 'SUPPRESSION'
}

export enum ActionHistorique {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  SUPPRESSION = 'SUPPRESSION',
  PARTAGE = 'PARTAGE',
  EXPORT = 'EXPORT',
  PLANIFICATION = 'PLANIFICATION'
}

export enum ImpactModification {
  MINEUR = 'MINEUR',
  MOYEN = 'MOYEN',
  MAJEUR = 'MAJEUR',
  CRITIQUE = 'CRITIQUE'
}

// ==================== DONNÉES DE RÉFÉRENCE ====================

export const RAPPORTS_DEFAUT = [
  {
    nom: 'Dashboard Financier',
    type: TypeRapport.DASHBOARD,
    categorie: CategorieRapport.FINANCE,
    description: 'Vue d\'ensemble des indicateurs financiers clés'
  },
  {
    nom: 'Analyse de Performance',
    type: TypeRapport.ANALYTIQUE,
    categorie: CategorieRapport.PERFORMANCE,
    description: 'Analyse détaillée des performances de l\'entreprise'
  },
  {
    nom: 'Rapport de Conformité',
    type: TypeRapport.REGLEMENTAIRE,
    categorie: CategorieRapport.CONFORMITE,
    description: 'Rapport de conformité réglementaire SYSCOHADA'
  }
];

export const THEMES_DEFAUT = [
  {
    nom: 'SYSCOHADA',
    couleurs: {
      primaire: '#1976D2',
      secondaire: '#388E3C',
      accent: '#FF5722',
      fond: '#FAFAFA',
      surface: '#FFFFFF',
      texte: '#212121'
    }
  },
  {
    nom: 'Moderne',
    couleurs: {
      primaire: '#6366F1',
      secondaire: '#8B5CF6',
      accent: '#F59E0B',
      fond: '#F8FAFC',
      surface: '#FFFFFF',
      texte: '#1E293B'
    }
  }
];

export const INDICATEURS_DEFAUT = [
  {
    nom: 'Chiffre d\'Affaires',
    type: TypeIndicateur.TENDANCE,
    format: '# ### ### €',
    seuils: [
      { nom: 'Objectif', valeur: 1000000, couleur: '#4CAF50' },
      { nom: 'Alerte', valeur: 800000, couleur: '#FF9800' }
    ]
  },
  {
    nom: 'Marge Brute',
    type: TypeIndicateur.JAUGE,
    format: '#.##%',
    seuils: [
      { nom: 'Excellent', valeur: 30, couleur: '#4CAF50' },
      { nom: 'Bon', valeur: 20, couleur: '#8BC34A' },
      { nom: 'Moyen', valeur: 10, couleur: '#FF9800' }
    ]
  }
];