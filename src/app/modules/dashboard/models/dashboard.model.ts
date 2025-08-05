export interface KPI {
  id: string;
  titre: string;
  valeur: number;
  valeurFormatee: string;
  unite: string;
  evolution: Evolution;
  icone: string;
  couleur: string;
  type: TypeKPI;
  periode: Periode;
  objetifValeur?: number;
  alerteSeuil?: SeuilAlerte;
}

export interface Evolution {
  pourcentage: number;
  tendance: 'HAUSSE' | 'BAISSE' | 'STABLE';
  periodeComparaison: string;
  valeurPrecedente: number;
  estPositive: boolean;
}

export interface SeuilAlerte {
  min?: number;
  max?: number;
  critique?: number;
  statut: 'BON' | 'ATTENTION' | 'CRITIQUE';
  message?: string;
}

export enum TypeKPI {
  CHIFFRE_AFFAIRES = 'CHIFFRE_AFFAIRES',
  RESULTAT_NET = 'RESULTAT_NET',
  TRESORERIE = 'TRESORERIE',
  CREANCES_CLIENTS = 'CREANCES_CLIENTS',
  DETTES_FOURNISSEURS = 'DETTES_FOURNISSEURS',
  STOCKS = 'STOCKS',
  CAPITAUX_PROPRES = 'CAPITAUX_PROPRES',
  ENDETTEMENT = 'ENDETTEMENT'
}

export interface Periode {
  dateDebut: Date;
  dateFin: Date;
  libelle: string;
  type: 'MENSUEL' | 'TRIMESTRIEL' | 'ANNUEL' | 'PERSONNALISE';
}

// Ratios financiers SYSCOHADA AUDCIF
export interface RatioAUDCIF {
  code: string;
  nom: string;
  formule: string;
  valeur: number;
  valeurFormatee: string;
  unite: '%' | 'ratio' | 'jours';
  interpretation: InterpretationRatio;
  categorie: CategorieRatio;
  conformiteAUDCIF: boolean;
  seuilsRecommandes: SeuilsRatio;
}

export interface InterpretationRatio {
  niveau: 'EXCELLENT' | 'BON' | 'MOYEN' | 'FAIBLE' | 'CRITIQUE';
  message: string;
  conseils: string[];
  impact: string;
}

export interface SeuilsRatio {
  excellent: number;
  bon: number;
  moyen: number;
  faible: number;
  critique: number;
}

export enum CategorieRatio {
  LIQUIDITE = 'LIQUIDITE',
  RENTABILITE = 'RENTABILITE',
  ENDETTEMENT = 'ENDETTEMENT',
  ACTIVITE = 'ACTIVITE',
  STRUCTURE_FINANCIERE = 'STRUCTURE_FINANCIERE'
}

// Graphiques et visualisations
export interface GraphiqueData {
  id: string;
  titre: string;
  type: TypeGraphique;
  donnees: PointGraphique[];
  options: OptionsGraphique;
  periode: Periode;
}

export interface PointGraphique {
  x: string | number | Date;
  y: number;
  label?: string;
  couleur?: string;
  metadata?: any;
}

export enum TypeGraphique {
  LIGNE = 'LIGNE',
  BARRE = 'BARRE',
  CAMEMBERT = 'CAMEMBERT',
  AIRE = 'AIRE',
  RADAR = 'RADAR',
  JAUGE = 'JAUGE'
}

export interface OptionsGraphique {
  couleurs: string[];
  legende: boolean;
  grille: boolean;
  animation: boolean;
  responsive: boolean;
  hauteur: number;
  formatage: FormatageGraphique;
}

export interface FormatageGraphique {
  devise: string;
  separateurMilliers: string;
  decimales: number;
  prefixe?: string;
  suffixe?: string;
}

// Alertes et notifications
export interface Alerte {
  id: string;
  type: TypeAlerte;
  niveau: NiveauAlerte;
  titre: string;
  message: string;
  kpiConcerne?: string;
  ratioConcerne?: string;
  valeurActuelle: number;
  valeurSeuil: number;
  dateCreation: Date;
  dateEcheance?: Date;
  statut: StatutAlerte;
  actions: ActionAlerte[];
}

export enum TypeAlerte {
  KPI_SEUIL = 'KPI_SEUIL',
  RATIO_CRITIQUE = 'RATIO_CRITIQUE',
  TRESORERIE_FAIBLE = 'TRESORERIE_FAIBLE',
  RETARD_PAIEMENT = 'RETARD_PAIEMENT',
  OBJECTIF_NON_ATTEINT = 'OBJECTIF_NON_ATTEINT',
  CONFORMITE_AUDCIF = 'CONFORMITE_AUDCIF'
}

export enum NiveauAlerte {
  INFO = 'INFO',
  ATTENTION = 'ATTENTION',
  CRITIQUE = 'CRITIQUE',
  URGENCE = 'URGENCE'
}

export enum StatutAlerte {
  NOUVELLE = 'NOUVELLE',
  VUE = 'VUE',
  EN_COURS = 'EN_COURS',
  RESOLUE = 'RESOLUE',
  IGNOREE = 'IGNOREE'
}

export interface ActionAlerte {
  id: string;
  libelle: string;
  action: () => void;
  icone: string;
  priorite: number;
}

// Dashboard configuration
export interface ConfigurationDashboard {
  utilisateurId: string;
  layout: LayoutDashboard;
  widgets: WidgetConfig[];
  filtres: FiltresDashboard;
  preferences: PreferencesDashboard;
  derniereMiseAJour: Date;
}

export interface LayoutDashboard {
  colonnes: number;
  largeurWidget: number;
  hauteurWidget: number;
  espacement: number;
  responsive: boolean;
}

export interface WidgetConfig {
  id: string;
  type: TypeWidget;
  position: PositionWidget;
  taille: TailleWidget;
  configuration: any;
  visible: boolean;
  ordre: number;
}

export interface PositionWidget {
  x: number;
  y: number;
}

export interface TailleWidget {
  largeur: number;
  hauteur: number;
}

export enum TypeWidget {
  KPI_SIMPLE = 'KPI_SIMPLE',
  KPI_EVOLUTION = 'KPI_EVOLUTION',
  GRAPHIQUE_LIGNE = 'GRAPHIQUE_LIGNE',
  GRAPHIQUE_BARRE = 'GRAPHIQUE_BARRE',
  GRAPHIQUE_CAMEMBERT = 'GRAPHIQUE_CAMEMBERT',
  RATIO_AUDCIF = 'RATIO_AUDCIF',
  ALERTES = 'ALERTES',
  ACTIONS_RAPIDES = 'ACTIONS_RAPIDES',
  CALENDRIER_FISCAL = 'CALENDRIER_FISCAL'
}

export interface FiltresDashboard {
  periode: Periode;
  exerciceComptable: string;
  centresCouts: string[];
  devises: string[];
  comparaisonPeriode: boolean;
}

export interface PreferencesDashboard {
  thème: 'CLAIR' | 'SOMBRE' | 'AUTO';
  langue: 'FR' | 'EN';
  formatDevise: string;
  formatDate: string;
  rafraichissementAuto: boolean;
  intervalleRafraichissement: number; // en secondes
  notifications: boolean;
}

// Constantes SYSCOHADA AUDCIF
export const RATIOS_AUDCIF_OBLIGATOIRES = [
  {
    code: 'R01',
    nom: 'Ratio de Liquidité Générale',
    formule: 'Actif Circulant / Dettes à Court Terme',
    seuilsRecommandes: { excellent: 2, bon: 1.5, moyen: 1.2, faible: 1, critique: 0.8 },
    categorie: CategorieRatio.LIQUIDITE
  },
  {
    code: 'R02',
    nom: 'Ratio de Liquidité Réduite',
    formule: '(Actif Circulant - Stocks) / Dettes à Court Terme',
    seuilsRecommandes: { excellent: 1.5, bon: 1.2, moyen: 1, faible: 0.8, critique: 0.6 },
    categorie: CategorieRatio.LIQUIDITE
  },
  {
    code: 'R03',
    nom: 'Ratio d\'Endettement',
    formule: 'Total Dettes / Total Actif',
    seuilsRecommandes: { excellent: 0.3, bon: 0.5, moyen: 0.7, faible: 0.85, critique: 1 },
    categorie: CategorieRatio.ENDETTEMENT
  },
  {
    code: 'R04',
    nom: 'Ratio d\'Autonomie Financière',
    formule: 'Capitaux Propres / Total Passif',
    seuilsRecommandes: { excellent: 0.7, bon: 0.5, moyen: 0.3, faible: 0.15, critique: 0 },
    categorie: CategorieRatio.STRUCTURE_FINANCIERE
  },
  {
    code: 'R05',
    nom: 'Rentabilité Nette',
    formule: 'Résultat Net / Chiffre d\'Affaires',
    seuilsRecommandes: { excellent: 0.15, bon: 0.1, moyen: 0.05, faible: 0.02, critique: 0 },
    categorie: CategorieRatio.RENTABILITE
  },
  {
    code: 'R06',
    nom: 'Rentabilité des Capitaux Propres',
    formule: 'Résultat Net / Capitaux Propres',
    seuilsRecommandes: { excellent: 0.2, bon: 0.15, moyen: 0.1, faible: 0.05, critique: 0 },
    categorie: CategorieRatio.RENTABILITE
  },
  {
    code: 'R07',
    nom: 'Rotation des Stocks',
    formule: 'Coût des Marchandises Vendues / Stock Moyen',
    seuilsRecommandes: { excellent: 12, bon: 8, moyen: 6, faible: 4, critique: 2 },
    categorie: CategorieRatio.ACTIVITE
  },
  {
    code: 'R08',
    nom: 'Délai de Recouvrement Clients',
    formule: '(Créances Clients / CA TTC) × 365',
    seuilsRecommandes: { excellent: 30, bon: 45, moyen: 60, faible: 90, critique: 120 },
    categorie: CategorieRatio.ACTIVITE
  }
];

export const KPIS_SYSCOHADA = [
  {
    id: 'ca_ttc',
    titre: 'Chiffre d\'Affaires TTC',
    type: TypeKPI.CHIFFRE_AFFAIRES,
    icone: 'trending_up',
    couleur: '#4caf50',
    unite: 'FCFA'
  },
  {
    id: 'resultat_net',
    titre: 'Résultat Net',
    type: TypeKPI.RESULTAT_NET,
    icone: 'account_balance',
    couleur: '#2196f3',
    unite: 'FCFA'
  },
  {
    id: 'tresorerie',
    titre: 'Trésorerie',
    type: TypeKPI.TRESORERIE,
    icone: 'savings',
    couleur: '#9c27b0',
    unite: 'FCFA'
  },
  {
    id: 'creances_clients',
    titre: 'Créances Clients',
    type: TypeKPI.CREANCES_CLIENTS,
    icone: 'account_balance_wallet',
    couleur: '#ff9800',
    unite: 'FCFA'
  },
  {
    id: 'dettes_fournisseurs',
    titre: 'Dettes Fournisseurs',
    type: TypeKPI.DETTES_FOURNISSEURS,
    icone: 'payment',
    couleur: '#f44336',
    unite: 'FCFA'
  },
  {
    id: 'capitaux_propres',
    titre: 'Capitaux Propres',
    type: TypeKPI.CAPITAUX_PROPRES,
    icone: 'business_center',
    couleur: '#607d8b',
    unite: 'FCFA'
  }
];