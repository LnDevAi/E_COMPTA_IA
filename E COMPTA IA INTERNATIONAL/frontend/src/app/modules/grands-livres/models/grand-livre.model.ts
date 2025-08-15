export interface GrandLivre {
  id?: string;
  nom: string;
  description?: string;
  type: TypeGrandLivre;
  periode: PeriodeGrandLivre;
  comptes: CompteGrandLivre[];
  filtres: FiltreGrandLivre;
  parametres: ParametresGrandLivre;
  
  // Configuration affichage
  colonnes: ColonneGrandLivre[];
  tri: TriGrandLivre[];
  groupement?: GroupementGrandLivre;
  totaux: TotalGrandLivre[];
  
  // Lettrage et rapprochement
  lettrage: ParametresLettrage;
  rapprochement: ParametresRapprochement;
  
  // Recherche et navigation
  recherche: ParametresRecherche;
  navigation: ParametresNavigation;
  
  // Export et impression
  export: ParametresExport;
  impression: ParametresImpression;
  
  // Statistiques et analyses
  statistiques?: StatistiquesGrandLivre;
  analyses: AnalyseGrandLivre[];
  
  // Métadonnées
  dateCreation: Date;
  creePar: string;
  derniereModification?: Date;
  modifiePar?: string;
  partage: PartageGrandLivre;
  favoris: boolean;
}

export interface CompteGrandLivre {
  numero: string;
  libelle: string;
  soldeOuverture: number;
  soldeDebit: number;
  soldeCredit: number;
  soldeFermeture: number;
  
  // Détails des mouvements
  mouvements: MouvementGrandLivre[];
  nombreMouvements: number;
  dernierMouvement?: Date;
  
  // Lettrage
  montantLettre: number;
  montantNonLettre: number;
  pourcentageLettrage: number;
  
  // Analytique
  ventilationAnalytique?: VentilationAnalytique[];
  
  // Métadonnées
  dateOuverture?: Date;
  dateFermeture?: Date;
  actif: boolean;
  archive: boolean;
}

export interface MouvementGrandLivre {
  id: string;
  date: Date;
  piece: string;
  journal: string;
  libelle: string;
  debit: number;
  credit: number;
  solde: number;
  
  // Références
  numeroEcriture: string;
  numeroLigne: number;
  reference?: string;
  documentJoint?: string;
  
  // Tiers et analytique
  tiers?: InformationsTiers;
  analytique?: VentilationAnalytique;
  
  // Lettrage et rapprochement
  lettrage?: InformationsLettrage;
  rapprochement?: InformationsRapprochement;
  
  // Validation et contrôles
  statut: StatutMouvement;
  validePar?: string;
  dateValidation?: Date;
  controles: ControleMouvement[];
  
  // Recherche et indexation
  motsCles: string[];
  indexation: IndexationMouvement;
}

export interface InformationsTiers {
  id: string;
  nom: string;
  type: string;
  numero?: string;
  contact?: ContactTiers;
  adresse?: AdresseTiers;
  scoring?: ScoringTiers;
}

export interface ContactTiers {
  telephone?: string;
  email?: string;
  responsable?: string;
}

export interface AdresseTiers {
  rue?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
}

export interface ScoringTiers {
  score: number;
  classe: string;
  risque: string;
  derniereMiseAJour: Date;
}

export interface VentilationAnalytique {
  axe: string;
  section: string;
  pourcentage: number;
  montant: number;
  libelle: string;
}

export interface InformationsLettrage {
  code: string;
  date: Date;
  utilisateur: string;
  type: TypeLettrage;
  automatique: boolean;
  montant: number;
  ecart?: number;
  statut: StatutLettrage;
  commentaire?: string;
  documentsLies: string[];
}

export interface InformationsRapprochement {
  id: string;
  date: Date;
  type: TypeRapprochement;
  reference: string;
  montant: number;
  statut: StatutRapprochement;
  utilisateur: string;
  commentaire?: string;
  documentsJoints: string[];
}

export interface ControleMouvement {
  type: TypeControle;
  resultat: ResultatControle;
  message: string;
  niveau: NiveauControle;
  date: Date;
  utilisateur: string;
  corrige: boolean;
}

export interface IndexationMouvement {
  termes: string[];
  score: number;
  pertinence: number;
  categories: string[];
  tags: string[];
}

export interface FiltreGrandLivre {
  comptes: FiltreCritere;
  periode: FiltrePeriode;
  montants: FiltreMontant;
  tiers: FiltreTiers;
  journaux: FiltreJournal;
  lettrage: FiltreLettrage;
  analytique: FiltreAnalytique;
  recherche: FiltreRecherche;
  avances: FiltreAvance[];
}

export interface FiltreCritere {
  actif: boolean;
  valeurs: string[];
  operateur: OperateurFiltre;
  exclusions: string[];
}

export interface FiltrePeriode {
  dateDebut: Date;
  dateFin: Date;
  exercice?: string;
  periode?: string;
  relatif?: PeriodeRelative;
}

export interface PeriodeRelative {
  type: TypePeriodeRelative;
  valeur: number;
  unite: UnitePeriode;
}

export interface FiltreMontant {
  min?: number;
  max?: number;
  devise?: string;
  typemont: TypeMontant;
  inclureNuls: boolean;
}

export interface FiltreTiers {
  types: string[];
  categories: string[];
  scores: PlageScore;
  actifs: boolean;
  exclusions: string[];
}

export interface PlageScore {
  min: number;
  max: number;
}

export interface FiltreJournal {
  codes: string[];
  types: string[];
  natures: string[];
  exclusions: string[];
}

export interface FiltreLettrage {
  statuts: StatutLettrage[];
  types: TypeLettrage[];
  dateDebut?: Date;
  dateFin?: Date;
  utilisateurs: string[];
  inclureNonLettres: boolean;
}

export interface FiltreAnalytique {
  axes: string[];
  sections: string[];
  pourcentageMin?: number;
  obligatoire: boolean;
}

export interface FiltreRecherche {
  termes: string[];
  operateur: OperateurRecherche;
  champs: ChampRecherche[];
  sensibleCasse: boolean;
  motExact: boolean;
  regex: boolean;
}

export interface FiltreAvance {
  id: string;
  nom: string;
  description?: string;
  actif: boolean;
  condition: string;
  parametres: any;
  operateur: LogiqueFiltre;
}

export interface ParametresGrandLivre {
  affichageSoldes: AffichageSoldes;
  calculSoldes: CalculSoldes;
  formatage: FormateGrandLivre;
  pagination: PaginationGrandLivre;
  actualisation: ActualisationGrandLivre;
  securite: SecuriteGrandLivre;
}

export interface AffichageSoldes {
  soldeOuverture: boolean;
  soldeFermeture: boolean;
  soldesIntermediaires: boolean;
  soldesCumules: boolean;
  centrage: boolean;
  devise: string;
  precision: number;
}

export interface CalculSoldes {
  methode: MethodeCalcul;
  dateReference: Date;
  inclurerEcrituresNonValidees: boolean;
  inclurerEcrituresSimulation: boolean;
  recalculerAutomatiquement: boolean;
  cacheActivé: boolean;
}

export interface FormateGrandLivre {
  formatDate: string;
  formatMontant: string;
  formatNumero: string;
  separateurMilliers: string;
  symboleMonnaie: string;
  couleurs: CouleursGrandLivre;
  polices: PolicesGrandLivre;
}

export interface CouleursGrandLivre {
  entete: string;
  lignesPaires: string;
  lignesImpaires: string;
  totaux: string;
  negatifs: string;
  lettres: string;
  nonLettres: string;
  rapproches: string;
  nonRapproches: string;
}

export interface PolicesGrandLivre {
  famille: string;
  taille: number;
  style: StylePolice;
  entete: ConfigPolice;
  totaux: ConfigPolice;
}

export interface ConfigPolice {
  taille?: number;
  gras?: boolean;
  italique?: boolean;
  couleur?: string;
}

export interface PaginationGrandLivre {
  taillePage: number;
  taillesDisponibles: number[];
  navigationRapide: boolean;
  infosPagination: boolean;
  chargementLazy: boolean;
  preload: number;
}

export interface ActualisationGrandLivre {
  automatique: boolean;
  intervalle: number;
  conditions: string[];
  notifierChangements: boolean;
  conserverPosition: boolean;
}

export interface SecuriteGrandLivre {
  niveauAcces: NiveauAcces;
  masquageSoldes: boolean;
  restrictionComptes: string[];
  restrictionTiers: string[];
  auditConsultation: boolean;
  delaiSession: number;
}

export interface ColonneGrandLivre {
  id: string;
  nom: string;
  libelle: string;
  type: TypeColonne;
  visible: boolean;
  largeur: number;
  position: number;
  alignement: AlignementColonne;
  tri: boolean;
  filtre: boolean;
  total: boolean;
  format?: FormatColonne;
  couleur?: CouleurColonne;
  edition?: EditionColonne;
}

export interface EditionColonne {
  autorisee: boolean;
  typeEdit: TypeEdition;
  validation: ValidationEdition;
  sauvegarde: SauvegardeEdition;
}

export interface ValidationEdition {
  obligatoire: boolean;
  regex?: string;
  min?: number;
  max?: number;
  longueurMax?: number;
}

export interface SauvegardeEdition {
  automatique: boolean;
  delai: number;
  confirmation: boolean;
}

export interface TriGrandLivre {
  colonne: string;
  ordre: OrdreeTri;
  priorite: number;
  numerique: boolean;
  sensibleCasse: boolean;
}

export interface GroupementGrandLivre {
  colonnes: string[];
  niveaux: NiveauGroupement[];
  afficherTotaux: boolean;
  afficherCompteurs: boolean;
  masquerDetails: boolean;
  expansion: ExpansionGroupement;
}

export interface NiveauGroupement {
  colonne: string;
  ordre: OrdreeTri;
  totaux: boolean;
  sousGroupement?: NiveauGroupement;
}

export interface ExpansionGroupement {
  defaut: EtatExpansion;
  memoriser: boolean;
  animer: boolean;
  vitesseAnimation: number;
}

export interface TotalGrandLivre {
  colonne: string;
  fonction: FonctionTotal;
  position: PositionTotal;
  format: FormatTotal;
  condition?: string;
  visible: boolean;
}

export interface FormatTotal {
  prefixe?: string;
  suffixe?: string;
  decimales: number;
  separateur: string;
  couleur?: string;
  style?: StyleTexte;
}

export interface ParametresLettrage {
  automatique: boolean;
  tolerance: number;
  criteres: CritereLettrage[];
  algorithme: AlgorithmeLettrage;
  validation: ValidationLettrage;
  historique: HistoriqueLettrage;
}

export interface CritereLettrage {
  type: TypeCritereLettrage;
  poids: number;
  obligatoire: boolean;
  tolerance?: number;
  parametres: any;
}

export interface ValidationLettrage {
  obligatoire: boolean;
  niveaux: string[];
  delai: number;
  notification: boolean;
  blocage: boolean;
}

export interface HistoriqueLettrage {
  conserver: boolean;
  duree: number;
  details: boolean;
  export: boolean;
}

export interface ParametresRapprochement {
  automatique: boolean;
  sources: SourceRapprochement[];
  regles: RegleRapprochement[];
  tolerance: ToleranceRapprochement;
  workflow: WorkflowRapprochement;
}

export interface SourceRapprochement {
  type: TypeSourceRapprochement;
  actif: boolean;
  configuration: any;
  priorite: number;
  frequence: string;
}

export interface RegleRapprochement {
  nom: string;
  condition: string;
  action: string;
  priorite: number;
  actif: boolean;
  parametres: any;
}

export interface ToleranceRapprochement {
  montant: number;
  pourcentage: number;
  date: number;
  devise: boolean;
}

export interface WorkflowRapprochement {
  etapes: EtapeWorkflow[];
  validation: boolean;
  notification: boolean;
  escalade: boolean;
}

export interface EtapeWorkflow {
  nom: string;
  ordre: number;
  obligatoire: boolean;
  roles: string[];
  delai?: number;
  actions: string[];
}

export interface ParametresRecherche {
  indexation: IndexationRecherche;
  performance: PerformanceRecherche;
  historique: HistoriqueRecherche;
  suggestions: SuggestionsRecherche;
  export: ExportRecherche;
}

export interface IndexationRecherche {
  temps_reel: boolean;
  champs: ChampIndexe[];
  algorithme: AlgorithmeIndexation;
  optimisation: OptimisationIndexation;
}

export interface ChampIndexe {
  nom: string;
  poids: number;
  type: TypeIndex;
  analyse: AnalyseChamp;
}

export interface AnalyseChamp {
  tokenisation: boolean;
  normalisation: boolean;
  synonymes: boolean;
  stemming: boolean;
}

export interface OptimisationIndexation {
  cache: boolean;
  compression: boolean;
  partition: boolean;
  parallélisation: boolean;
}

export interface PerformanceRecherche {
  timeout: number;
  limiteResultats: number;
  pagination: boolean;
  lazy_loading: boolean;
  preload: number;
}

export interface HistoriqueRecherche {
  conserver: boolean;
  duree: number;
  utilisateur: boolean;
  statistiques: boolean;
}

export interface SuggestionsRecherche {
  actives: boolean;
  nombre: number;
  apprentissage: boolean;
  personnalisation: boolean;
}

export interface ExportRecherche {
  formats: FormatExport[];
  limite: number;
  asynchrone: boolean;
  notification: boolean;
}

export interface ParametresNavigation {
  raccourcis: RaccourciClavier[];
  navigation: NavigationRapide;
  signets: GestionSignets;
  historique: HistoriqueNavigation;
}

export interface RaccourciClavier {
  touche: string;
  action: string;
  contexte: string;
  description: string;
  actif: boolean;
}

export interface NavigationRapide {
  comptes: boolean;
  periodes: boolean;
  montants: boolean;
  recherche: boolean;
  filtres: boolean;
}

export interface GestionSignets {
  autorises: boolean;
  nombre_max: number;
  partage: boolean;
  synchronisation: boolean;
}

export interface HistoriqueNavigation {
  taille: number;
  persistence: boolean;
  nettoyage: boolean;
  export: boolean;
}

export interface ParametresExport {
  formats: ConfigFormatExport[];
  options: OptionsExport;
  securite: SecuriteExport;
  planification: PlanificationExport;
}

export interface ConfigFormatExport {
  type: FormatExport;
  actif: boolean;
  template?: string;
  options: any;
  limite?: number;
}

export interface OptionsExport {
  includeEntetes: boolean;
  includeTotaux: boolean;
  includeGraphiques: boolean;
  compression: boolean;
  protection?: ProtectionExport;
}

export interface ProtectionExport {
  motDePasse?: string;
  chiffrement: boolean;
  filigrane: boolean;
  expiration?: Date;
}

export interface SecuriteExport {
  autorisation: string[];
  auditExport: boolean;
  limiteTaille: number;
  limiteFichiers: number;
}

export interface PlanificationExport {
  automatique: boolean;
  frequence?: string;
  heure?: string;
  conditions?: string[];
  destinataires?: string[];
}

export interface ParametresImpression {
  format: FormatImpression;
  mise_en_page: MiseEnPageImpression;
  entete: EnteteImpression;
  pied: PiedImpression;
  options: OptionsImpression;
}

export interface FormatImpression {
  papier: FormatPapier;
  orientation: OrientationPapier;
  marges: MargesImpression;
  echelle: number;
}

export interface MiseEnPageImpression {
  colonnes: boolean;
  largeurColonnes: number[];
  espacementLignes: number;
  sautPage: SautPageImpression;
}

export interface SautPageImpression {
  comptes: boolean;
  groupes: boolean;
  totaux: boolean;
  automatique: boolean;
}

export interface EnteteImpression {
  actif: boolean;
  hauteur: number;
  contenu: ContenuEntete;
  repetition: boolean;
}

export interface ContenuEntete {
  gauche?: string;
  centre?: string;
  droite?: string;
  logo?: string;
  date: boolean;
  page: boolean;
}

export interface PiedImpression {
  actif: boolean;
  hauteur: number;
  contenu: ContenuPied;
  repetition: boolean;
}

export interface ContenuPied {
  gauche?: string;
  centre?: string;
  droite?: string;
  totalPages: boolean;
  signature: boolean;
}

export interface OptionsImpression {
  couleur: boolean;
  recto_verso: boolean;
  qualite: QualiteImpression;
  apercu: boolean;
  sauvegarde: boolean;
}

export interface StatistiquesGrandLivre {
  periode: string;
  nombreComptes: number;
  nombreMouvements: number;
  montantTotal: number;
  evolutionSoldes: EvolutionSolde[];
  repartitionJournaux: RepartitionJournal[];
  performanceLettrage: PerformanceLettrage;
  utilisationFiltres: UtilisationFiltre[];
  tempsConsultation: TempsConsultation;
  erreurs: ErreurStatistique[];
}

export interface EvolutionSolde {
  periode: string;
  soldeDebit: number;
  soldeCredit: number;
  evolution: number;
  tendance: TendanceEvolution;
}

export interface RepartitionJournal {
  journal: string;
  nom: string;
  nombreMouvements: number;
  montant: number;
  pourcentage: number;
}

export interface PerformanceLettrage {
  tauxLettrage: number;
  tempsTraitement: number;
  nombreLettres: number;
  ecartMoyen: number;
  efficacite: number;
}

export interface UtilisationFiltre {
  filtre: string;
  utilisation: number;
  efficacite: number;
  tempsExecution: number;
}

export interface TempsConsultation {
  ouverture: number;
  navigation: number;
  recherche: number;
  export: number;
  total: number;
}

export interface ErreurStatistique {
  type: string;
  frequence: number;
  description: string;
  gravite: GraviteErreur;
  resolution?: string;
}

export interface AnalyseGrandLivre {
  id: string;
  nom: string;
  type: TypeAnalyse;
  description?: string;
  parametres: ParametresAnalyse;
  resultats?: ResultatsAnalyse;
  planification?: PlanificationAnalyse;
  partage: PartageAnalyse;
  dateCreation: Date;
  creePar: string;
}

export interface ParametresAnalyse {
  comptes: string[];
  periode: PeriodeAnalyse;
  criteres: CritereAnalyse[];
  algorithme: string;
  options: any;
}

export interface PeriodeAnalyse {
  debut: Date;
  fin: Date;
  comparaison?: PeriodeComparaison;
}

export interface PeriodeComparaison {
  debut: Date;
  fin: Date;
  type: TypeComparaison;
}

export interface CritereAnalyse {
  nom: string;
  valeur: any;
  operateur: string;
  poids: number;
}

export interface ResultatsAnalyse {
  synthese: SyntheseAnalyse;
  details: DetailAnalyse[];
  graphiques: GraphiqueAnalyse[];
  recommandations: RecommandationAnalyse[];
  export?: string;
}

export interface SyntheseAnalyse {
  score: number;
  niveau: string;
  resume: string;
  points_cles: string[];
  metriques: MetriqueAnalyse[];
}

export interface MetriqueAnalyse {
  nom: string;
  valeur: number;
  unite: string;
  evolution?: number;
  benchmark?: number;
}

export interface DetailAnalyse {
  compte: string;
  libelle: string;
  resultats: any;
  alertes: AlerteAnalyse[];
}

export interface AlerteAnalyse {
  niveau: NiveauAlerte;
  message: string;
  action?: string;
  urgent: boolean;
}

export interface GraphiqueAnalyse {
  type: TypeGraphique;
  titre: string;
  donnees: any;
  configuration: any;
}

export interface RecommandationAnalyse {
  priorite: PrioriteRecommandation;
  titre: string;
  description: string;
  impact: string;
  difficulte: string;
  delai: string;
  actions: ActionRecommandation[];
}

export interface ActionRecommandation {
  nom: string;
  description: string;
  responsable?: string;
  echeance?: Date;
  statut: StatutAction;
}

export interface PlanificationAnalyse {
  automatique: boolean;
  frequence?: string;
  heure?: string;
  jours?: number[];
  conditions?: string[];
  notifications: boolean;
  destinataires?: string[];
}

export interface PartageAnalyse {
  public: boolean;
  utilisateurs: string[];
  roles: string[];
  departements: string[];
  lecture_seule: boolean;
  expiration?: Date;
}

export interface PartageGrandLivre {
  public: boolean;
  utilisateurs: string[];
  roles: string[];
  departements: string[];
  permissions: PermissionPartage[];
  expiration?: Date;
  notification: boolean;
}

export interface PermissionPartage {
  action: ActionPartage;
  autorise: boolean;
  conditions?: string[];
}

// ==================== ÉNUMÉRATIONS ====================

export enum TypeGrandLivre {
  GENERAL = 'GENERAL',
  AUXILIAIRE = 'AUXILIAIRE',
  ANALYTIQUE = 'ANALYTIQUE',
  BUDGETAIRE = 'BUDGETAIRE',
  CONSOLIDE = 'CONSOLIDE',
  SIMULATION = 'SIMULATION'
}

export enum StatutMouvement {
  BROUILLON = 'BROUILLON',
  VALIDE = 'VALIDE',
  COMPTABILISE = 'COMPTABILISE',
  LETTRE = 'LETTRE',
  RAPPROCHE = 'RAPPROCHE',
  ARCHIVE = 'ARCHIVE',
  ERREUR = 'ERREUR'
}

export enum TypeLettrage {
  AUTOMATIQUE = 'AUTOMATIQUE',
  MANUEL = 'MANUEL',
  SEMI_AUTOMATIQUE = 'SEMI_AUTOMATIQUE',
  FORCE = 'FORCE'
}

export enum StatutLettrage {
  NON_LETTRE = 'NON_LETTRE',
  LETTRE_PARTIEL = 'LETTRE_PARTIEL',
  LETTRE_TOTAL = 'LETTRE_TOTAL',
  DELETRE = 'DELETRE'
}

export enum TypeRapprochement {
  BANCAIRE = 'BANCAIRE',
  INTERCOMPTE = 'INTERCOMPTE',
  FOURNISSEUR = 'FOURNISSEUR',
  CLIENT = 'CLIENT',
  ANALYTIQUE = 'ANALYTIQUE'
}

export enum StatutRapprochement {
  NON_RAPPROCHE = 'NON_RAPPROCHE',
  RAPPROCHE_PARTIEL = 'RAPPROCHE_PARTIEL',
  RAPPROCHE_TOTAL = 'RAPPROCHE_TOTAL',
  ECART = 'ECART',
  VALIDE = 'VALIDE'
}

export enum TypeControle {
  EQUILIBRE = 'EQUILIBRE',
  COHERENCE = 'COHERENCE',
  AUTORISATION = 'AUTORISATION',
  CONFORMITE = 'CONFORMITE',
  QUALITE = 'QUALITE'
}

export enum ResultatControle {
  VALIDE = 'VALIDE',
  AVERTISSEMENT = 'AVERTISSEMENT',
  ERREUR = 'ERREUR',
  BLOQUE = 'BLOQUE'
}

export enum NiveauControle {
  INFO = 'INFO',
  ATTENTION = 'ATTENTION',
  ERREUR = 'ERREUR',
  CRITIQUE = 'CRITIQUE'
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
  VIDE = 'VIDE',
  NON_VIDE = 'NON_VIDE'
}

export enum OperateurRecherche {
  ET = 'ET',
  OU = 'OU',
  SAUF = 'SAUF',
  PHRASE = 'PHRASE',
  PROXIMITE = 'PROXIMITE'
}

export enum ChampRecherche {
  TOUS = 'TOUS',
  LIBELLE = 'LIBELLE',
  REFERENCE = 'REFERENCE',
  TIERS = 'TIERS',
  MONTANT = 'MONTANT',
  COMPTE = 'COMPTE',
  JOURNAL = 'JOURNAL'
}

export enum LogiqueFiltre {
  ET = 'ET',
  OU = 'OU'
}

export enum TypePeriodeRelative {
  JOUR = 'JOUR',
  SEMAINE = 'SEMAINE',
  MOIS = 'MOIS',
  TRIMESTRE = 'TRIMESTRE',
  SEMESTRE = 'SEMESTRE',
  ANNEE = 'ANNEE'
}

export enum UnitePeriode {
  JOUR = 'JOUR',
  SEMAINE = 'SEMAINE',
  MOIS = 'MOIS',
  ANNEE = 'ANNEE'
}

export enum TypeMontant {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  SOLDE = 'SOLDE',
  ABSOLU = 'ABSOLU'
}

export enum MethodeCalcul {
  CHRONOLOGIQUE = 'CHRONOLOGIQUE',
  RETROGRADE = 'RETROGRADE',
  PARALLELE = 'PARALLELE',
  OPTIMISE = 'OPTIMISE'
}

export enum StylePolice {
  NORMAL = 'NORMAL',
  GRAS = 'GRAS',
  ITALIQUE = 'ITALIQUE',
  GRAS_ITALIQUE = 'GRAS_ITALIQUE'
}

export enum NiveauAcces {
  LECTURE = 'LECTURE',
  ECRITURE = 'ECRITURE',
  VALIDATION = 'VALIDATION',
  ADMINISTRATION = 'ADMINISTRATION'
}

export enum TypeColonne {
  TEXTE = 'TEXTE',
  NOMBRE = 'NOMBRE',
  MONTANT = 'MONTANT',
  DATE = 'DATE',
  BOOLEEN = 'BOOLEEN',
  LISTE = 'LISTE',
  LIEN = 'LIEN'
}

export enum AlignementColonne {
  GAUCHE = 'GAUCHE',
  CENTRE = 'CENTRE',
  DROITE = 'DROITE',
  JUSTIFIE = 'JUSTIFIE'
}

export enum TypeEdition {
  TEXTE = 'TEXTE',
  NOMBRE = 'NOMBRE',
  LISTE = 'LISTE',
  DATE = 'DATE',
  CHECKBOX = 'CHECKBOX'
}

export enum OrdreeTri {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum EtatExpansion {
  EXPAND = 'EXPAND',
  COLLAPSE = 'COLLAPSE',
  MIXTE = 'MIXTE'
}

export enum FonctionTotal {
  SOMME = 'SOMME',
  MOYENNE = 'MOYENNE',
  COMPTE = 'COMPTE',
  MIN = 'MIN',
  MAX = 'MAX'
}

export enum PositionTotal {
  LIGNE = 'LIGNE',
  GROUPE = 'GROUPE',
  GENERAL = 'GENERAL'
}

export enum StyleTexte {
  NORMAL = 'NORMAL',
  GRAS = 'GRAS',
  ITALIQUE = 'ITALIQUE',
  SOULIGNE = 'SOULIGNE'
}

export enum AlgorithmeLettrage {
  MONTANT_EXACT = 'MONTANT_EXACT',
  MONTANT_TOLERANCE = 'MONTANT_TOLERANCE',
  REFERENCE = 'REFERENCE',
  DATE_PROXIMITE = 'DATE_PROXIMITE',
  INTELLIGENCE_ARTIFICIELLE = 'INTELLIGENCE_ARTIFICIELLE'
}

export enum TypeCritereLettrage {
  MONTANT = 'MONTANT',
  DATE = 'DATE',
  REFERENCE = 'REFERENCE',
  TIERS = 'TIERS',
  LIBELLE = 'LIBELLE'
}

export enum TypeSourceRapprochement {
  FICHIER_BANCAIRE = 'FICHIER_BANCAIRE',
  API_BANCAIRE = 'API_BANCAIRE',
  SAISIE_MANUELLE = 'SAISIE_MANUELLE',
  IMPORT_EXTERNE = 'IMPORT_EXTERNE'
}

export enum AlgorithmeIndexation {
  FULLTEXT = 'FULLTEXT',
  ELASTICSEARCH = 'ELASTICSEARCH',
  LUCENE = 'LUCENE',
  PERSONNALISE = 'PERSONNALISE'
}

export enum TypeIndex {
  TEXTE = 'TEXTE',
  NUMERIQUE = 'NUMERIQUE',
  DATE = 'DATE',
  BOOLEEN = 'BOOLEEN'
}

export enum FormatExport {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
  XML = 'XML'
}

export enum FormatPapier {
  A4 = 'A4',
  A3 = 'A3',
  LETTER = 'LETTER',
  LEGAL = 'LEGAL'
}

export enum OrientationPapier {
  PORTRAIT = 'PORTRAIT',
  PAYSAGE = 'PAYSAGE'
}

export enum QualiteImpression {
  BROUILLON = 'BROUILLON',
  NORMALE = 'NORMALE',
  HAUTE = 'HAUTE'
}

export enum TendanceEvolution {
  HAUSSE = 'HAUSSE',
  BAISSE = 'BAISSE',
  STABLE = 'STABLE',
  VOLATILE = 'VOLATILE'
}

export enum GraviteErreur {
  FAIBLE = 'FAIBLE',
  MOYENNE = 'MOYENNE',
  FORTE = 'FORTE',
  CRITIQUE = 'CRITIQUE'
}

export enum TypeAnalyse {
  EVOLUTION_SOLDES = 'EVOLUTION_SOLDES',
  PERFORMANCE_LETTRAGE = 'PERFORMANCE_LETTRAGE',
  QUALITE_DONNEES = 'QUALITE_DONNEES',
  UTILISATION_COMPTES = 'UTILISATION_COMPTES',
  ANOMALIES = 'ANOMALIES',
  TENDANCES = 'TENDANCES'
}

export enum TypeComparaison {
  PERIODE_PRECEDENTE = 'PERIODE_PRECEDENTE',
  ANNEE_PRECEDENTE = 'ANNEE_PRECEDENTE',
  BUDGET = 'BUDGET',
  PERSONNALISE = 'PERSONNALISE'
}

export enum NiveauAlerte {
  INFO = 'INFO',
  ATTENTION = 'ATTENTION',
  ALERTE = 'ALERTE',
  CRITIQUE = 'CRITIQUE'
}

export enum TypeGraphique {
  LIGNE = 'LIGNE',
  BARRE = 'BARRE',
  SECTEUR = 'SECTEUR',
  AIRE = 'AIRE',
  NUAGE = 'NUAGE',
  RADAR = 'RADAR'
}

export enum PrioriteRecommandation {
  FAIBLE = 'FAIBLE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  CRITIQUE = 'CRITIQUE'
}

export enum StatutAction {
  A_FAIRE = 'A_FAIRE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  REPORTE = 'REPORTE',
  ANNULE = 'ANNULE'
}

export enum ActionPartage {
  CONSULTER = 'CONSULTER',
  MODIFIER = 'MODIFIER',
  EXPORTER = 'EXPORTER',
  IMPRIMER = 'IMPRIMER',
  PARTAGER = 'PARTAGER'
}

// ==================== DONNÉES DE RÉFÉRENCE ====================

export const COLONNES_DEFAUT_GRAND_LIVRE: ColonneGrandLivre[] = [
  {
    id: 'date',
    nom: 'date',
    libelle: 'Date',
    type: TypeColonne.DATE,
    visible: true,
    largeur: 100,
    position: 1,
    alignement: AlignementColonne.CENTRE,
    tri: true,
    filtre: true,
    total: false
  },
  {
    id: 'piece',
    nom: 'piece',
    libelle: 'Pièce',
    type: TypeColonne.TEXTE,
    visible: true,
    largeur: 120,
    position: 2,
    alignement: AlignementColonne.GAUCHE,
    tri: true,
    filtre: true,
    total: false
  },
  {
    id: 'journal',
    nom: 'journal',
    libelle: 'Journal',
    type: TypeColonne.TEXTE,
    visible: true,
    largeur: 80,
    position: 3,
    alignement: AlignementColonne.CENTRE,
    tri: true,
    filtre: true,
    total: false
  },
  {
    id: 'libelle',
    nom: 'libelle',
    libelle: 'Libellé',
    type: TypeColonne.TEXTE,
    visible: true,
    largeur: 300,
    position: 4,
    alignement: AlignementColonne.GAUCHE,
    tri: true,
    filtre: true,
    total: false
  },
  {
    id: 'debit',
    nom: 'debit',
    libelle: 'Débit',
    type: TypeColonne.MONTANT,
    visible: true,
    largeur: 120,
    position: 5,
    alignement: AlignementColonne.DROITE,
    tri: true,
    filtre: true,
    total: true
  },
  {
    id: 'credit',
    nom: 'credit',
    libelle: 'Crédit',
    type: TypeColonne.MONTANT,
    visible: true,
    largeur: 120,
    position: 6,
    alignement: AlignementColonne.DROITE,
    tri: true,
    filtre: true,
    total: true
  },
  {
    id: 'solde',
    nom: 'solde',
    libelle: 'Solde',
    type: TypeColonne.MONTANT,
    visible: true,
    largeur: 120,
    position: 7,
    alignement: AlignementColonne.DROITE,
    tri: false,
    filtre: true,
    total: false
  },
  {
    id: 'tiers',
    nom: 'tiers',
    libelle: 'Tiers',
    type: TypeColonne.TEXTE,
    visible: true,
    largeur: 200,
    position: 8,
    alignement: AlignementColonne.GAUCHE,
    tri: true,
    filtre: true,
    total: false
  },
  {
    id: 'lettrage',
    nom: 'lettrage',
    libelle: 'Lettrage',
    type: TypeColonne.TEXTE,
    visible: true,
    largeur: 80,
    position: 9,
    alignement: AlignementColonne.CENTRE,
    tri: true,
    filtre: true,
    total: false
  }
];

export const CRITERES_LETTRAGE_DEFAUT: CritereLettrage[] = [
  {
    type: TypeCritereLettrage.MONTANT,
    poids: 50,
    obligatoire: true,
    tolerance: 0.01,
    parametres: { exacte: true }
  },
  {
    type: TypeCritereLettrage.REFERENCE,
    poids: 30,
    obligatoire: false,
    parametres: { partielle: true }
  },
  {
    type: TypeCritereLettrage.DATE,
    poids: 15,
    obligatoire: false,
    tolerance: 7,
    parametres: { jours: 7 }
  },
  {
    type: TypeCritereLettrage.TIERS,
    poids: 5,
    obligatoire: false,
    parametres: { strict: false }
  }
];

export const RACCOURCIS_DEFAUT: RaccourciClavier[] = [
  {
    touche: 'Ctrl+F',
    action: 'RECHERCHE',
    contexte: 'GLOBAL',
    description: 'Ouvrir la recherche avancée',
    actif: true
  },
  {
    touche: 'Ctrl+L',
    action: 'LETTRAGE',
    contexte: 'SELECTION',
    description: 'Lettrer les lignes sélectionnées',
    actif: true
  },
  {
    touche: 'Ctrl+R',
    action: 'RAPPROCHEMENT',
    contexte: 'SELECTION',
    description: 'Rapprocher les lignes sélectionnées',
    actif: true
  },
  {
    touche: 'F5',
    action: 'ACTUALISER',
    contexte: 'GLOBAL',
    description: 'Actualiser les données',
    actif: true
  },
  {
    touche: 'Ctrl+E',
    action: 'EXPORT',
    contexte: 'GLOBAL',
    description: 'Exporter vers Excel',
    actif: true
  },
  {
    touche: 'Ctrl+P',
    action: 'IMPRIMER',
    contexte: 'GLOBAL',
    description: 'Imprimer le grand livre',
    actif: true
  }
];

export const ANALYSES_DEFAUT: Partial<AnalyseGrandLivre>[] = [
  {
    nom: 'Évolution des soldes',
    type: TypeAnalyse.EVOLUTION_SOLDES,
    description: 'Analyse de l\'évolution des soldes par période'
  },
  {
    nom: 'Performance lettrage',
    type: TypeAnalyse.PERFORMANCE_LETTRAGE,
    description: 'Efficacité du processus de lettrage'
  },
  {
    nom: 'Qualité des données',
    type: TypeAnalyse.QUALITE_DONNEES,
    description: 'Contrôle de la qualité et cohérence des données'
  },
  {
    nom: 'Utilisation des comptes',
    type: TypeAnalyse.UTILISATION_COMPTES,
    description: 'Analyse de l\'utilisation des comptes comptables'
  },
  {
    nom: 'Détection d\'anomalies',
    type: TypeAnalyse.ANOMALIES,
    description: 'Identification automatique des anomalies'
  },
  {
    nom: 'Analyse des tendances',
    type: TypeAnalyse.TENDANCES,
    description: 'Identification des tendances financières'
  }
];

export const COULEURS_DEFAUT_GRAND_LIVRE: CouleursGrandLivre = {
  entete: '#2196F3',
  lignesPaires: '#F5F5F5',
  lignesImpaires: '#FFFFFF',
  totaux: '#E3F2FD',
  negatifs: '#F44336',
  lettres: '#4CAF50',
  nonLettres: '#FF9800',
  rapproches: '#2196F3',
  nonRapproches: '#9E9E9E'
};