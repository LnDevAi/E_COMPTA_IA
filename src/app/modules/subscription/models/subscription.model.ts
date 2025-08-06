// =====================================================
// MODÈLES D'ABONNEMENT E-COMPTA-IA
// Système complet avec Mobile Money pour l'Afrique
// =====================================================

export interface Abonnement {
  id: string;
  userId: string;
  entrepriseId: string;
  
  // Plan et facturation
  planId: string;
  plan: PlanAbonnement;
  statut: StatutAbonnement;
  
  // Dates et périodes
  dateDebut: Date;
  dateFin: Date;
  dateRenouvellement: Date;
  periodeFacturation: PeriodeFacturation;
  
  // Paiement
  methodePaiement: MethodePaiement;
  montantHT: number;
  montantTTC: number;
  devise: string;
  taux: number; // Conversion locale si nécessaire
  
  // Statut et utilisation
  essaiGratuit: boolean;
  dateFinEssai?: Date;
  utilisationActuelle: UtilisationRessources;
  limitesActuelles: LimitesRessources;
  
  // Facturation
  derniereFacturation?: Date;
  prochaineFacturation: Date;
  factures: Facture[];
  
  // Historique et modifications
  historique: HistoriqueAbonnement[];
  dateCreation: Date;
  derniereModification: Date;
  
  // Métadonnées
  codePromo?: string;
  reductionAppliquee?: number;
  referenceExterne?: string; // Pour intégrations tierces
}

export interface PlanAbonnement {
  id: string;
  nom: string;
  description: string;
  slug: string; // 'starter', 'professional', 'enterprise', 'multinational'
  
  // Tarification
  prixMensuel: number;
  prixAnnuel: number;
  reductionAnnuelle: number; // Pourcentage
  deviseBase: string;
  
  // Tarification par région
  tarifsRegionaux: TarifRegional[];
  
  // Fonctionnalités et limites
  fonctionnalites: FonctionnalitePlan[];
  limites: LimitesRessources;
  
  // Configuration
  essaiGratuitJours: number;
  visibilite: boolean;
  populaire: boolean;
  
  // Métadonnées
  ordre: number;
  couleurTheme: string;
  icone: string;
  
  // Conditions et restrictions
  conditionsSpeciales?: string[];
  paysRestreints?: string[];
  dateCreation: Date;
  dateModification: Date;
}

export interface TarifRegional {
  region: string; // 'OHADA', 'Europe', 'Amerique', 'Asie'
  pays: string[];
  devise: string;
  prixMensuel: number;
  prixAnnuel: number;
  ajustementLocal: number; // Facteur d'ajustement (-50% à +100%)
  methodesDisponibles: MethodePaiement[];
}

export interface FonctionnalitePlan {
  id: string;
  nom: string;
  description: string;
  actif: boolean;
  valeurLimite?: number; // Si applicable
  configurationsSpeciales?: any;
}

export interface LimitesRessources {
  // Entreprises et utilisateurs
  nombreEntreprises: number;
  nombreUtilisateurs: number;
  
  // Données comptables
  nombreEcritures: number; // Par mois
  nombreComptes: number;
  nombreJournaux: number;
  
  // Stockage et documents
  espaceStockage: number; // En GB
  nombreDocuments: number; // Par mois
  
  // Fonctionnalités IA
  requetesIA: number; // Par mois
  analysesAvancees: number; // Par mois
  
  // Intégrations et API
  appelAPI: number; // Par mois
  integrationsExternes: number;
  
  // Fonctionnalités avancées
  consolidationEntreprises: boolean;
  multiPays: boolean;
  auditAvance: boolean;
  supportPrioritaire: boolean;
  formationPersonnalisee: boolean;
  
  // Exportations et rapports
  exportsIllimites: boolean;
  rapportsPersonnalises: number;
  tableauxBordPersonnalises: number;
}

export interface UtilisationRessources {
  // Période de mesure
  periodeDebut: Date;
  periodeFin: Date;
  
  // Utilisation actuelle
  entreprisesUtilisees: number;
  utilisateursActifs: number;
  ecrituresCeMois: number;
  comptesUtilises: number;
  
  // Stockage et documents
  espaceUtilise: number; // En GB
  documentsUploadeCeMois: number;
  
  // IA et analyses
  requetesIACeMois: number;
  analysesLanceesCeMois: number;
  
  // API et intégrations
  appelsAPICeMois: number;
  integrationsActives: number;
  
  // Rapports et exports
  exportsCeMois: number;
  rapportsGeneresCeMois: number;
  
  // Historique d'utilisation
  historiqueUtilisation: HistoriqueUtilisation[];
}

export interface HistoriqueUtilisation {
  date: Date;
  ressource: string;
  quantite: number;
  details?: any;
}

export interface MethodePaiement {
  id: string;
  type: TypePaiement;
  nom: string;
  
  // Informations selon le type
  detailsCarte?: DetailsCarte;
  detailsVirement?: DetailsVirement;
  detailsMobileMoney?: DetailsMobileMoney;
  detailsPayPal?: DetailsPayPal;
  
  // Configuration
  actif: boolean;
  defaut: boolean;
  
  // Métadonnées
  dateAjout: Date;
  derniereUtilisation?: Date;
  
  // Sécurité
  tokenSecurise?: string;
  empreinteDigitale?: string;
}

export interface DetailsCarte {
  // Stripe/Visa/Mastercard
  dernierQuatreChiffres: string;
  marque: string; // 'visa', 'mastercard', 'amex'
  typeCompte: string; // 'credit', 'debit'
  moisExpiration: number;
  anneeExpiration: number;
  nomPorteur: string;
  paysEmission: string;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
}

export interface DetailsVirement {
  banque: string;
  iban: string;
  bic?: string;
  nomTitulaire: string;
  referenceVirement?: string;
  delaiTraitement: number; // Jours
}

export interface DetailsMobileMoney {
  operateur: OperateurMobileMoney;
  numeroTelephone: string;
  nomTitulaire: string;
  pays: string;
  
  // Configuration spécifique
  apiEndpoint?: string;
  merchantId?: string;
  
  // Limites selon l'opérateur
  limiteMensuelle: number;
  limiteTransaction: number;
  
  // Statut KYC
  niveauVerification: NiveauKYC;
  documentVerification?: boolean;
}

export interface DetailsPayPal {
  emailPayPal: string;
  nomCompte: string;
  paypalCustomerId?: string;
  typeCompte: 'personnel' | 'professionnel';
  paysCompte: string;
}

export interface Facture {
  id: string;
  numero: string;
  
  // Références
  abonnementId: string;
  entrepriseId: string;
  
  // Détails de facturation
  dateEmission: Date;
  dateEcheance: Date;
  periode: PeriodeFacturation;
  
  // Montants
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  devise: string;
  
  // Lignes de facturation
  lignes: LigneFacture[];
  
  // Paiement
  statut: StatutFacture;
  methodePaiement: MethodePaiement;
  datePaiement?: Date;
  referencePaiement?: string;
  
  // Documents
  fichierPDF?: string;
  lienTelechargement?: string;
  
  // Historique
  tentativesPaiement: TentativePaiement[];
  
  // Métadonnées
  notes?: string;
  dateCreation: Date;
}

export interface LigneFacture {
  description: string;
  quantite: number;
  prixUnitaireHT: number;
  montantHT: number;
  tauxTVA: number;
  montantTVA: number;
  montantTTC: number;
  periode?: string;
}

export interface TentativePaiement {
  id: string;
  date: Date;
  montant: number;
  methodePaiement: MethodePaiement;
  statut: 'reussi' | 'echec' | 'en_attente' | 'annule';
  codeErreur?: string;
  messageErreur?: string;
  referencePaiement?: string;
  fraisTransaction?: number;
}

export interface HistoriqueAbonnement {
  id: string;
  date: Date;
  action: ActionAbonnement;
  ancienneValeur?: any;
  nouvelleValeur?: any;
  utilisateurId?: string;
  details: string;
  metadata?: any;
}

// =====================================================
// ENUMERATIONS
// =====================================================

export enum TypePaiement {
  CARTE_CREDIT = 'carte_credit',
  CARTE_DEBIT = 'carte_debit',
  VIREMENT_BANCAIRE = 'virement_bancaire',
  PAYPAL = 'paypal',
  MOBILE_MONEY = 'mobile_money',
  CRYPTO = 'crypto',
  CHEQUE = 'cheque',
  ESPECES = 'especes'
}

export enum OperateurMobileMoney {
  // Afrique de l'Ouest (UEMOA)
  ORANGE_MONEY = 'orange_money',
  MTN_MONEY = 'mtn_money',
  MOOV_MONEY = 'moov_money',
  WAVE = 'wave',
  
  // Afrique Centrale (CEMAC)
  EXPRESS_UNION = 'express_union',
  YUP = 'yup',
  
  // Afrique de l'Est
  M_PESA = 'm_pesa',
  AIRTEL_MONEY = 'airtel_money',
  TIGO_PESA = 'tigo_pesa',
  
  // Afrique du Nord
  FLOUCI = 'flouci',
  CIB_WALLET = 'cib_wallet',
  
  // International
  GOOGLE_PAY = 'google_pay',
  APPLE_PAY = 'apple_pay',
  SAMSUNG_PAY = 'samsung_pay'
}

export enum NiveauKYC {
  NIVEAU_1 = 'niveau_1', // Limite basse
  NIVEAU_2 = 'niveau_2', // Limite moyenne
  NIVEAU_3 = 'niveau_3', // Limite élevée
  NIVEAU_PREMIUM = 'niveau_premium' // Sans limite
}

export enum StatutAbonnement {
  ACTIF = 'actif',
  SUSPENDU = 'suspendu',
  EXPIRE = 'expire',
  ANNULE = 'annule',
  EN_ESSAI = 'en_essai',
  EN_ATTENTE_PAIEMENT = 'en_attente_paiement',
  EN_COURS_MODIFICATION = 'en_cours_modification'
}

export enum PeriodeFacturation {
  MENSUEL = 'mensuel',
  TRIMESTRIEL = 'trimestriel',
  SEMESTRIEL = 'semestriel',
  ANNUEL = 'annuel'
}

export enum StatutFacture {
  BROUILLON = 'brouillon',
  ENVOYEE = 'envoyee',
  PAYEE = 'payee',
  EN_RETARD = 'en_retard',
  PARTIELLEMENT_PAYEE = 'partiellement_payee',
  ANNULEE = 'annulee',
  REMBOURSEE = 'remboursee'
}

export enum ActionAbonnement {
  CREATION = 'creation',
  MODIFICATION_PLAN = 'modification_plan',
  RENOUVELLEMENT = 'renouvellement',
  SUSPENSION = 'suspension',
  REACTIVATION = 'reactivation',
  ANNULATION = 'annulation',
  CHANGEMENT_PAIEMENT = 'changement_paiement',
  MISE_A_JOUR_LIMITES = 'mise_a_jour_limites'
}

// =====================================================
// PLANS PRÉDÉFINIS E-COMPTA-IA
// =====================================================

export const PLANS_ABONNEMENT: PlanAbonnement[] = [
  {
    id: 'starter',
    nom: 'Starter',
    description: 'Parfait pour débuter en comptabilité',
    slug: 'starter',
    prixMensuel: 0,
    prixAnnuel: 0,
    reductionAnnuelle: 0,
    deviseBase: 'EUR',
    tarifsRegionaux: [
      {
        region: 'OHADA',
        pays: ['Bénin', 'Burkina Faso', 'Cameroun', 'Côte d\'Ivoire', 'Mali', 'Niger', 'Sénégal', 'Togo', 'Gabon', 'Congo', 'Tchad', 'Centrafrique', 'Guinée', 'Guinée-Bissau', 'Guinée Équatoriale', 'Comores'],
        devise: 'XOF',
        prixMensuel: 0,
        prixAnnuel: 0,
        ajustementLocal: 0,
        methodesDisponibles: [TypePaiement.MOBILE_MONEY, TypePaiement.CARTE_CREDIT, TypePaiement.VIREMENT_BANCAIRE]
      },
      {
        region: 'Europe',
        pays: ['France', 'Allemagne', 'Royaume-Uni', 'Espagne', 'Italie'],
        devise: 'EUR',
        prixMensuel: 0,
        prixAnnuel: 0,
        ajustementLocal: 0,
        methodesDisponibles: [TypePaiement.CARTE_CREDIT, TypePaiement.PAYPAL, TypePaiement.VIREMENT_BANCAIRE]
      }
    ],
    fonctionnalites: [
      { id: 'entreprise_unique', nom: '1 Entreprise', description: 'Gestion d\'une seule entreprise', actif: true },
      { id: 'plan_comptable_base', nom: 'Plan comptable de base', description: 'Plan comptable standard', actif: true },
      { id: 'ecritures_limitees', nom: '50 écritures/mois', description: 'Saisie limitée à 50 écritures par mois', actif: true, valeurLimite: 50 },
      { id: 'support_email', nom: 'Support email', description: 'Support par email uniquement', actif: true }
    ],
    limites: {
      nombreEntreprises: 1,
      nombreUtilisateurs: 1,
      nombreEcritures: 50,
      nombreComptes: 100,
      nombreJournaux: 5,
      espaceStockage: 1,
      nombreDocuments: 20,
      requetesIA: 10,
      analysesAvancees: 0,
      appelAPI: 100,
      integrationsExternes: 0,
      consolidationEntreprises: false,
      multiPays: false,
      auditAvance: false,
      supportPrioritaire: false,
      formationPersonnalisee: false,
      exportsIllimites: false,
      rapportsPersonnalises: 1,
      tableauxBordPersonnalises: 1
    },
    essaiGratuitJours: 14,
    visibilite: true,
    populaire: false,
    ordre: 1,
    couleurTheme: '#10B981',
    icone: '🚀',
    dateCreation: new Date(),
    dateModification: new Date()
  },
  {
    id: 'professional',
    nom: 'Professional',
    description: 'Solution complète pour PME',
    slug: 'professional',
    prixMensuel: 29,
    prixAnnuel: 290,
    reductionAnnuelle: 17,
    deviseBase: 'EUR',
    tarifsRegionaux: [
      {
        region: 'OHADA',
        pays: ['Bénin', 'Burkina Faso', 'Cameroun', 'Côte d\'Ivoire', 'Mali', 'Niger', 'Sénégal', 'Togo', 'Gabon', 'Congo', 'Tchad', 'Centrafrique', 'Guinée', 'Guinée-Bissau', 'Guinée Équatoriale', 'Comores'],
        devise: 'XOF',
        prixMensuel: 15000,
        prixAnnuel: 150000,
        ajustementLocal: -50,
        methodesDisponibles: [TypePaiement.MOBILE_MONEY, TypePaiement.CARTE_CREDIT, TypePaiement.VIREMENT_BANCAIRE]
      },
      {
        region: 'Europe',
        pays: ['France', 'Allemagne', 'Royaume-Uni'],
        devise: 'EUR',
        prixMensuel: 29,
        prixAnnuel: 290,
        ajustementLocal: 0,
        methodesDisponibles: [TypePaiement.CARTE_CREDIT, TypePaiement.PAYPAL, TypePaiement.VIREMENT_BANCAIRE]
      }
    ],
    fonctionnalites: [
      { id: 'multi_entreprises', nom: '3 Entreprises', description: 'Gestion de 3 entreprises', actif: true, valeurLimite: 3 },
      { id: 'tous_modules', nom: 'Tous les modules', description: 'Accès à tous les modules comptables', actif: true },
      { id: 'ecritures_illimitees', nom: 'Écritures illimitées', description: 'Saisie illimitée d\'écritures', actif: true },
      { id: 'ia_basique', nom: 'IA basique', description: 'Fonctionnalités IA de base', actif: true },
      { id: 'support_prioritaire', nom: 'Support prioritaire', description: 'Support email et chat prioritaire', actif: true }
    ],
    limites: {
      nombreEntreprises: 3,
      nombreUtilisateurs: 5,
      nombreEcritures: -1, // Illimité
      nombreComptes: 1000,
      nombreJournaux: 20,
      espaceStockage: 10,
      nombreDocuments: 500,
      requetesIA: 1000,
      analysesAvancees: 50,
      appelAPI: 5000,
      integrationsExternes: 3,
      consolidationEntreprises: false,
      multiPays: true,
      auditAvance: false,
      supportPrioritaire: true,
      formationPersonnalisee: false,
      exportsIllimites: true,
      rapportsPersonnalises: 10,
      tableauxBordPersonnalises: 5
    },
    essaiGratuitJours: 30,
    visibilite: true,
    populaire: true,
    ordre: 2,
    couleurTheme: '#3B82F6',
    icone: '💼',
    dateCreation: new Date(),
    dateModification: new Date()
  },
  {
    id: 'enterprise',
    nom: 'Enterprise',
    description: 'Solution avancée pour grandes entreprises',
    slug: 'enterprise',
    prixMensuel: 99,
    prixAnnuel: 990,
    reductionAnnuelle: 17,
    deviseBase: 'EUR',
    tarifsRegionaux: [
      {
        region: 'OHADA',
        pays: ['Bénin', 'Burkina Faso', 'Cameroun', 'Côte d\'Ivoire', 'Mali', 'Niger', 'Sénégal', 'Togo', 'Gabon', 'Congo', 'Tchad', 'Centrafrique', 'Guinée', 'Guinée-Bissau', 'Guinée Équatoriale', 'Comores'],
        devise: 'XOF',
        prixMensuel: 50000,
        prixAnnuel: 500000,
        ajustementLocal: -50,
        methodesDisponibles: [TypePaiement.MOBILE_MONEY, TypePaiement.CARTE_CREDIT, TypePaiement.VIREMENT_BANCAIRE]
      },
      {
        region: 'Europe',
        pays: ['France', 'Allemagne', 'Royaume-Uni'],
        devise: 'EUR',
        prixMensuel: 99,
        prixAnnuel: 990,
        ajustementLocal: 0,
        methodesDisponibles: [TypePaiement.CARTE_CREDIT, TypePaiement.PAYPAL, TypePaiement.VIREMENT_BANCAIRE]
      }
    ],
    fonctionnalites: [
      { id: 'entreprises_illimitees', nom: 'Entreprises illimitées', description: 'Nombre illimité d\'entreprises', actif: true },
      { id: 'ia_avancee', nom: 'IA avancée', description: 'Toutes les fonctionnalités IA', actif: true },
      { id: 'consolidation', nom: 'Consolidation', description: 'Consolidation multi-entreprises', actif: true },
      { id: 'api_access', nom: 'API Access', description: 'Accès complet à l\'API', actif: true },
      { id: 'support_dedie', nom: 'Support dédié', description: 'Support téléphonique dédié', actif: true }
    ],
    limites: {
      nombreEntreprises: -1, // Illimité
      nombreUtilisateurs: 20,
      nombreEcritures: -1,
      nombreComptes: -1,
      nombreJournaux: -1,
      espaceStockage: 100,
      nombreDocuments: -1,
      requetesIA: 10000,
      analysesAvancees: 500,
      appelAPI: 50000,
      integrationsExternes: 10,
      consolidationEntreprises: true,
      multiPays: true,
      auditAvance: true,
      supportPrioritaire: true,
      formationPersonnalisee: false,
      exportsIllimites: true,
      rapportsPersonnalises: 50,
      tableauxBordPersonnalises: 20
    },
    essaiGratuitJours: 30,
    visibilite: true,
    populaire: false,
    ordre: 3,
    couleurTheme: '#8B5CF6',
    icone: '🏢',
    dateCreation: new Date(),
    dateModification: new Date()
  },
  {
    id: 'multinational',
    nom: 'Multinational',
    description: 'Solution premium pour groupes multinationaux',
    slug: 'multinational',
    prixMensuel: 299,
    prixAnnuel: 2990,
    reductionAnnuelle: 17,
    deviseBase: 'EUR',
    tarifsRegionaux: [
      {
        region: 'OHADA',
        pays: ['Bénin', 'Burkina Faso', 'Cameroun', 'Côte d\'Ivoire', 'Mali', 'Niger', 'Sénégal', 'Togo', 'Gabon', 'Congo', 'Tchad', 'Centrafrique', 'Guinée', 'Guinée-Bissau', 'Guinée Équatoriale', 'Comores'],
        devise: 'XOF',
        prixMensuel: 150000,
        prixAnnuel: 1500000,
        ajustementLocal: -50,
        methodesDisponibles: [TypePaiement.MOBILE_MONEY, TypePaiement.CARTE_CREDIT, TypePaiement.VIREMENT_BANCAIRE]
      },
      {
        region: 'Europe',
        pays: ['France', 'Allemagne', 'Royaume-Uni'],
        devise: 'EUR',
        prixMensuel: 299,
        prixAnnuel: 2990,
        ajustementLocal: 0,
        methodesDisponibles: [TypePaiement.CARTE_CREDIT, TypePaiement.PAYPAL, TypePaiement.VIREMENT_BANCAIRE]
      }
    ],
    fonctionnalites: [
      { id: 'tout_enterprise', nom: 'Tout Enterprise +', description: 'Toutes les fonctionnalités Enterprise', actif: true },
      { id: 'consolidation_multi_pays', nom: 'Consolidation multi-pays', description: 'Consolidation entre différents pays', actif: true },
      { id: 'conformite_avancee', nom: 'Conformité avancée', description: 'Conformité réglementaire avancée', actif: true },
      { id: 'formation_personnalisee', nom: 'Formation personnalisée', description: 'Formation sur mesure', actif: true },
      { id: 'account_manager', nom: 'Account Manager', description: 'Gestionnaire de compte dédié', actif: true }
    ],
    limites: {
      nombreEntreprises: -1,
      nombreUtilisateurs: -1,
      nombreEcritures: -1,
      nombreComptes: -1,
      nombreJournaux: -1,
      espaceStockage: -1,
      nombreDocuments: -1,
      requetesIA: -1,
      analysesAvancees: -1,
      appelAPI: -1,
      integrationsExternes: -1,
      consolidationEntreprises: true,
      multiPays: true,
      auditAvance: true,
      supportPrioritaire: true,
      formationPersonnalisee: true,
      exportsIllimites: true,
      rapportsPersonnalises: -1,
      tableauxBordPersonnalises: -1
    },
    essaiGratuitJours: 30,
    visibilite: true,
    populaire: false,
    ordre: 4,
    couleurTheme: '#F59E0B',
    icone: '🌍',
    dateCreation: new Date(),
    dateModification: new Date()
  }
];

// =====================================================
// OPÉRATEURS MOBILE MONEY PAR PAYS
// =====================================================

export const OPERATEURS_MOBILE_MONEY_PAR_PAYS: { [pays: string]: OperateurMobileMoney[] } = {
  'Bénin': [OperateurMobileMoney.MTN_MONEY, OperateurMobileMoney.MOOV_MONEY],
  'Burkina Faso': [OperateurMobileMoney.ORANGE_MONEY, OperateurMobileMoney.MOOV_MONEY],
  'Cameroun': [OperateurMobileMoney.MTN_MONEY, OperateurMobileMoney.ORANGE_MONEY],
  'Côte d\'Ivoire': [OperateurMobileMoney.ORANGE_MONEY, OperateurMobileMoney.MTN_MONEY, OperateurMobileMoney.MOOV_MONEY, OperateurMobileMoney.WAVE],
  'Mali': [OperateurMobileMoney.ORANGE_MONEY, OperateurMobileMoney.MOOV_MONEY],
  'Niger': [OperateurMobileMoney.ORANGE_MONEY, OperateurMobileMoney.MOOV_MONEY],
  'Sénégal': [OperateurMobileMoney.ORANGE_MONEY, OperateurMobileMoney.WAVE, OperateurMobileMoney.EXPRESS_UNION],
  'Togo': [OperateurMobileMoney.MOOV_MONEY, OperateurMobileMoney.MTN_MONEY],
  'Gabon': [OperateurMobileMoney.AIRTEL_MONEY, OperateurMobileMoney.MTN_MONEY],
  'Congo': [OperateurMobileMoney.AIRTEL_MONEY, OperateurMobileMoney.MTN_MONEY],
  'Tchad': [OperateurMobileMoney.AIRTEL_MONEY, OperateurMobileMoney.TIGO_PESA],
  'Centrafrique': [OperateurMobileMoney.ORANGE_MONEY, OperateurMobileMoney.AIRTEL_MONEY],
  'Guinée': [OperateurMobileMoney.ORANGE_MONEY, OperateurMobileMoney.MTN_MONEY],
  'Kenya': [OperateurMobileMoney.M_PESA, OperateurMobileMoney.AIRTEL_MONEY],
  'Tanzanie': [OperateurMobileMoney.M_PESA, OperateurMobileMoney.TIGO_PESA, OperateurMobileMoney.AIRTEL_MONEY],
  'Ouganda': [OperateurMobileMoney.MTN_MONEY, OperateurMobileMoney.AIRTEL_MONEY],
  'Ghana': [OperateurMobileMoney.MTN_MONEY, OperateurMobileMoney.AIRTEL_MONEY, OperateurMobileMoney.TIGO_PESA],
  'Nigeria': [OperateurMobileMoney.MTN_MONEY, OperateurMobileMoney.AIRTEL_MONEY],
  'Maroc': [OperateurMobileMoney.ORANGE_MONEY],
  'Tunisie': [OperateurMobileMoney.FLOUCI],
  'Algérie': [OperateurMobileMoney.CIB_WALLET]
};

// =====================================================
// CONFIGURATION FRAIS ET LIMITES MOBILE MONEY
// =====================================================

export const CONFIGURATION_MOBILE_MONEY: { [operateur: string]: any } = {
  [OperateurMobileMoney.ORANGE_MONEY]: {
    fraisTransaction: 0.015, // 1.5%
    limiteMensuelle: 1000000, // XOF
    limiteTransaction: 250000, // XOF
    delaiTraitement: 0, // Instantané
    niveauxKYC: {
      [NiveauKYC.NIVEAU_1]: { limite: 50000 },
      [NiveauKYC.NIVEAU_2]: { limite: 200000 },
      [NiveauKYC.NIVEAU_3]: { limite: 1000000 }
    }
  },
  [OperateurMobileMoney.MTN_MONEY]: {
    fraisTransaction: 0.02, // 2%
    limiteMensuelle: 2000000,
    limiteTransaction: 500000,
    delaiTraitement: 0,
    niveauxKYC: {
      [NiveauKYC.NIVEAU_1]: { limite: 25000 },
      [NiveauKYC.NIVEAU_2]: { limite: 150000 },
      [NiveauKYC.NIVEAU_3]: { limite: 2000000 }
    }
  },
  [OperateurMobileMoney.WAVE]: {
    fraisTransaction: 0.01, // 1%
    limiteMensuelle: 1000000,
    limiteTransaction: 200000,
    delaiTraitement: 0,
    niveauxKYC: {
      [NiveauKYC.NIVEAU_1]: { limite: 50000 },
      [NiveauKYC.NIVEAU_2]: { limite: 250000 },
      [NiveauKYC.NIVEAU_3]: { limite: 1000000 }
    }
  },
  [OperateurMobileMoney.M_PESA]: {
    fraisTransaction: 0.025, // 2.5%
    limiteMensuelle: 3000000, // KES equivalent
    limiteTransaction: 300000,
    delaiTraitement: 0,
    niveauxKYC: {
      [NiveauKYC.NIVEAU_1]: { limite: 70000 },
      [NiveauKYC.NIVEAU_2]: { limite: 500000 },
      [NiveauKYC.NIVEAU_3]: { limite: 3000000 }
    }
  }
};

// =====================================================
// UTILITAIRES ET HELPERS
// =====================================================

export function obtenirTarifPourRegion(plan: PlanAbonnement, pays: string): TarifRegional | null {
  return plan.tarifsRegionaux.find(tarif => tarif.pays.includes(pays)) || null;
}

export function calculerPrixAvecReduction(prixBase: number, reductionPourcentage: number): number {
  return prixBase * (1 - reductionPourcentage / 100);
}

export function obtenirOperateursMobileMoneyPourPays(pays: string): OperateurMobileMoney[] {
  return OPERATEURS_MOBILE_MONEY_PAR_PAYS[pays] || [];
}

export function verifierLimiteRessource(utilisation: number, limite: number): boolean {
  if (limite === -1) return true; // Illimité
  return utilisation <= limite;
}

export function calculerPourcentageUtilisation(utilisation: number, limite: number): number {
  if (limite === -1) return 0; // Illimité
  return Math.min(100, (utilisation / limite) * 100);
}