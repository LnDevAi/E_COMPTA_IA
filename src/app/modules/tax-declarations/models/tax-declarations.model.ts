// =====================================================
// MODÈLES DÉCLARATIONS FISCALES E-COMPTA-IA
// Système complet OHADA - TVA, IS, Charges sociales
// =====================================================

export interface DeclarationFiscale {
  id: string;
  type: TypeDeclaration;
  periode: PeriodeDeclarative;
  entreprise: IdentiteEntreprise;
  pays: PaysOHADA;
  
  // Configuration fiscale
  regimeFiscal: RegimeFiscal;
  specificitesFiscales: SpecificitesFiscales;
  tauxApplicables: TauxFiscaux;
  
  // Formulaires de déclaration
  formulaire: FormulaireDeclaration;
  annexes: AnnexeDeclaration[];
  piecesJustificatives: PieceJustificative[];
  
  // Données sources
  donneesComptables: DonneesComptablesSource;
  ajustementsExtra: AjustementExtraComptable[];
  preRemplissage: PreRemplissageAutomatique;
  
  // Calculs et résultats
  calculsFiscaux: CalculsFiscaux;
  basesImposables: BaseImposable[];
  impotDu: ImpotCalcule[];
  creditsImpots: CreditImpot[];
  
  // Statut et validation
  statut: StatutDeclaration;
  controlesFiscaux: ControleFiscal[];
  anomalies: AnomalieFiscale[];
  
  // Transmission et paiement
  transmission: InformationsTransmission;
  paiement: InformationsPaiement;
  echeancias: EcheancierFiscal[];
  
  // Historique et suivi
  dateCreation: Date;
  derniereModification: Date;
  utilisateur: string;
  versionsAnterieur: VersionDeclaration[];
  
  // IA et assistance
  suggestionsIA: SuggestionFiscaleIA[];
  optimisationsFiscales: OptimisationFiscale[];
  alertesReglementaires: AlerteReglementaire[];
}

export interface DeclarationTVA {
  id: string;
  periode: PeriodeTVA;
  regimeTVA: RegimeTVA;
  
  // CHIFFRE D'AFFAIRES ET OPERATIONS IMPOSABLES
  operationsImposables: {
    // Ventes et prestations imposables
    ventesImposables: LigneDeclarationTVA;
    prestationsImposables: LigneDeclarationTVA;
    autresOperationsImposables: LigneDeclarationTVA;
    
    // Livraisons à soi-même
    livraisonsSoiMeme: LigneDeclarationTVA;
    
    // Operations intracommunautaires (si applicable)
    operationsIntracommunautaires?: LigneDeclarationTVA;
    
    // Total CA imposable
    totalChiffreAffaires: number;
  };
  
  // TVA COLLECTÉE
  tvaCollectee: {
    // Par taux
    tvaCollecteeTauxNormal: CalculTVA;
    tvaCollecteeTauxReduit: CalculTVA;
    tvaCollecteeAutresTaux: CalculTVA[];
    
    // TVA sur opérations spécifiques
    tvaLivraisonsSoiMeme: CalculTVA;
    tvaOperationsSpeciales: CalculTVA[];
    
    // Total TVA collectée
    totalTVACollectee: number;
  };
  
  // TVA DÉDUCTIBLE
  tvaDeductible: {
    // TVA sur immobilisations
    tvaImmobilisations: CalculTVA;
    
    // TVA sur biens et services
    tvaBiensServices: CalculTVA;
    
    // TVA sur carburants (selon règles locales)
    tvaCarburants: CalculTVA;
    
    // TVA déductible autres
    tvaAutres: CalculTVA[];
    
    // Crédit de TVA reporté
    creditTVAReporte: number;
    
    // Total TVA déductible
    totalTVADeductible: number;
  };
  
  // LIQUIDATION TVA
  liquidationTVA: {
    tvaADeduire: number;
    tvaADecaisser: number;
    creditTVA: number;
    tvaNetteADecaisser: number;
  };
  
  // ACOMPTES ET PAIEMENTS
  acomptes: {
    acomptePrecedent: number;
    acompteVerse: number;
    resteAVerser: number;
    acompteProchain?: number;
  };
  
  // Contrôles et validations
  controles: ControleTVA[];
  coherenceDonnees: boolean;
  messagesAvertissement: string[];
}

export interface DeclarationIS {
  id: string;
  exerciceImposition: ExerciceFiscal;
  regimeImposition: RegimeIS;
  
  // DÉTERMINATION DU RÉSULTAT FISCAL
  determinationResultat: {
    // Résultat comptable
    resultatComptableAvantImpot: number;
    
    // Réintégrations fiscales
    reintegrations: {
      chargesNonDeductibles: LigneAjustementFiscal[];
      amortissementsExcedentaires: LigneAjustementFiscal[];
      provisionsNonDeductibles: LigneAjustementFiscal[];
      autresReintegrations: LigneAjustementFiscal[];
      totalReintegrations: number;
    };
    
    // Déductions fiscales
    deductions: {
      quoteParts: LigneAjustementFiscal[];
      plusValuesExonerees: LigneAjustementFiscal[];
      amortissementsDifferes: LigneAjustementFiscal[];
      autresDeductions: LigneAjustementFiscal[];
      totalDeductions: number;
    };
    
    // Résultat fiscal avant déficits
    resultatFiscalBrut: number;
    
    // Déficits reportables
    deficits: {
      deficitN1: number;
      deficitN2: number;
      deficitN3: number;
      deficitN4: number;
      deficitN5: number;
      totalDeficitsImputes: number;
      deficitsRestants: number;
    };
    
    // Résultat imposable
    resultatImposable: number;
  };
  
  // CALCUL DE L'IMPÔT
  calculImpot: {
    // Base imposable
    baseImposable: number;
    
    // Taux d'imposition
    tauxIS: number;
    tauxCentimes: number;
    
    // Impôt théorique
    impotTheorique: number;
    
    // Crédits d'impôts
    creditsImpots: {
      creditImpotInvestissement: number;
      creditImpotRecherche: number;
      creditImpotFormation: number;
      autresCredits: CreditImpotDetail[];
      totalCredits: number;
    };
    
    // Impôt net
    impotNetDu: number;
    
    // Acomptes versés
    acomptesVerses: {
      acompte1: AcompteIS;
      acompte2: AcompteIS;
      acompte3: AcompteIS;
      acompte4: AcompteIS;
      totalAcomptes: number;
    };
    
    // Solde à payer ou crédit
    soldeAPayer: number;
    creditImpot: number;
  };
  
  // TABLEAUX FISCAUX SPECIFIQUES
  tableauxFiscaux: {
    tableau2058A?: Tableau2058A; // Détermination du résultat fiscal
    tableau2058B?: Tableau2058B; // Déficits, amortissements, provisions
    tableau2058C?: Tableau2058C; // Tableau de passage résultat comptable/fiscal
    autresTableaux: TableauFiscalGenerique[];
  };
  
  // INFORMATIONS COMPLÉMENTAIRES
  informationsComplementaires: {
    effectifsMoyens: number;
    montantSalaires: number;
    investissementsRealises: number;
    exportations: number;
    filiales: InformationFiliale[];
    operationsIntragroupe: OperationIntragroupe[];
  };
  
  // Contrôles et validations
  controles: ControleIS[];
  alertesOptimisation: AlerteOptimisationIS[];
}

export interface DeclarationChargesSociales {
  id: string;
  periode: PeriodeDeclarative;
  organismes: OrganismeSecuriteSociale[];
  
  // ASSIETTE COTISATIONS
  assietteCotisations: {
    // Rémunérations imposables
    salairesBruts: number;
    primes: number;
    indemnites: number;
    avantagesEnNature: number;
    
    // Base de cotisations
    baseCalcul: number;
    plafondSecu: number;
    basePlafonies: number;
    baseDeplafonee: number;
  };
  
  // COTISATIONS PAR ORGANISME
  cotisationsParOrganisme: {
    [organismeId: string]: {
      organisme: OrganismeSecuriteSociale;
      cotisations: {
        cotisationEmployeur: CotisationDetail[];
        cotisationSalarie: CotisationDetail[];
        totalCotisations: number;
      };
      baseSpecifique?: number;
      tauxSpecifique?: number;
    };
  };
  
  // RÉCAPITULATIF GÉNÉRAL
  recapitulatif: {
    totalCotisationsEmployeur: number;
    totalCotisationsSalarie: number;
    totalGeneral: number;
    
    // Ventilation par nature
    cotisationsSecuriteSociale: number;
    cotisationsRetraite: number;
    cotisationsChomage: number;
    cotisationsAutres: number;
  };
  
  // PAIEMENTS ET ÉCHÉANCIERS
  paiements: {
    echeancesPassees: EcheanceCotisation[];
    echeanceEnCours: EcheanceCotisation;
    echeancesFutures: EcheanceCotisation[];
    
    retards: RetardPaiement[];
    penalites: PenaliteRetard[];
    
    soldeAPayer: number;
    creditCotisations: number;
  };
  
  // EFFECTIFS ET MASSES SALARIALES
  effectifs: {
    effectifMoyen: number;
    effectifFinPeriode: number;
    heuresTravaillees: number;
    masseSalarialeBrute: number;
    masseSalarialeNette: number;
  };
  
  // Contrôles et validations
  controles: ControleChargesSociales[];
  coherenceDeclarations: boolean;
}

export interface PreRemplissageAutomatique {
  id: string;
  declarationId: string;
  
  // Sources de données
  sourcesDonnees: {
    donneesComptables: boolean;
    declarationsPrecedentes: boolean;
    parametrageFiscal: boolean;
    basesExterne: boolean;
  };
  
  // Données pré-remplies
  donneesPreRemplies: {
    [champDeclaration: string]: {
      valeur: any;
      source: SourcePreRemplissage;
      confidence: number;
      verifiee: boolean;
      modifieeUtilisateur: boolean;
    };
  };
  
  // Calculs automatiques
  calculsAutomatiques: {
    basesImposables: CalculAutomatique[];
    deductions: CalculAutomatique[];
    credits: CalculAutomatique[];
    totaux: CalculAutomatique[];
  };
  
  // Vérifications et alertes
  verifications: {
    coherenceDonnees: VerificationCoherence[];
    completudeDonnees: VerificationCompletude[];
    alertesReglementaires: AlerteReglementaire[];
    suggestionsOptimisation: SuggestionOptimisation[];
  };
  
  // Statistiques et performance
  statistiques: {
    pourcentagePreRempli: number;
    champsCompletes: number;
    champsTotal: number;
    tempsTraitement: number;
    erreurDetectees: number;
  };
  
  // Métadonnées
  datePreRemplissage: Date;
  versionAlgorithme: string;
  parametresUtilises: ParametrePreRemplissage[];
}

export interface OptimisationFiscale {
  id: string;
  type: TypeOptimisation;
  priorite: PrioriteOptimisation;
  
  // Description
  titre: string;
  description: string;
  explicationDetaillee: string;
  
  // Impact financier
  impactFinancier: {
    economieEstimee: number;
    coutMiseEnOeuvre: number;
    economieNette: number;
    retourInvestissement: number;
  };
  
  // Conditions et prérequis
  conditions: {
    conditionsRequises: string[];
    delaiMiseEnOeuvre: number;
    complexiteMiseEnOeuvre: NiveauComplexite;
    risquesAssocies: Risque[];
  };
  
  // Actions recommandées
  actionsRecommandees: {
    actionsImmediates: ActionOptimisation[];
    actionsMoyenTerme: ActionOptimisation[];
    actionsLongTerme: ActionOptimisation[];
  };
  
  // Suivi et mesure
  suivi: {
    indicateursPerformance: IndicateurPerformance[];
    pointsControle: PointControle[];
    frequenceRevision: string;
  };
  
  // Validité et applicabilité
  validite: {
    applicable: boolean;
    dateExpiration?: Date;
    conditionsMarche: string[];
    impactReglementaire: ImpactReglementaire[];
  };
  
  // Métadonnées
  dateIdentification: Date;
  sourceIdentification: string;
  niveauConfiance: number;
  statutMiseEnOeuvre: StatutOptimisation;
}

// =====================================================
// ENUMERATIONS
// =====================================================

export enum TypeDeclaration {
  TVA = 'tva',
  IMPOT_SOCIETES = 'impot_societes',
  CHARGES_SOCIALES = 'charges_sociales',
  TAXE_APPRENTISSAGE = 'taxe_apprentissage',
  CONTRIBUTION_FORMATION = 'contribution_formation',
  IMPOT_FONCIER = 'impot_foncier',
  DECLARATION_DADS = 'declaration_dads',
  LIASSE_FISCALE = 'liasse_fiscale'
}

export enum RegimeTVA {
  REEL_NORMAL = 'reel_normal',
  REEL_SIMPLIFIE = 'reel_simplifie',
  MICRO_ENTREPRISE = 'micro_entreprise',
  FRANCHISE_BASE = 'franchise_base',
  REGIME_SPECIAL = 'regime_special'
}

export enum RegimeIS {
  DROIT_COMMUN = 'droit_commun',
  PME = 'pme',
  TAUX_REDUIT = 'taux_reduit',
  EXONERE = 'exonere',
  REGIME_SPECIAL = 'regime_special'
}

export enum PeriodiciteTVA {
  MENSUELLE = 'mensuelle',
  TRIMESTRIELLE = 'trimestrielle',
  ANNUELLE = 'annuelle'
}

export enum StatutDeclaration {
  BROUILLON = 'brouillon',
  EN_COURS = 'en_cours',
  PRETE = 'prete',
  TRANSMISE = 'transmise',
  ACCEPTEE = 'acceptee',
  REJETEE = 'rejetee',
  PAYEE = 'payee',
  CONTENTIEUX = 'contentieux'
}

export enum TypeOptimisation {
  REDUCTION_IS = 'reduction_is',
  OPTIMISATION_TVA = 'optimisation_tva',
  CREDIT_IMPOT = 'credit_impot',
  AMORTISSEMENT_ACCELERE = 'amortissement_accelere',
  PROVISION_DEDUCTIBLE = 'provision_deductible',
  DEFICITS_REPORTABLES = 'deficits_reportables',
  EXONERATION = 'exoneration',
  REGIME_FAVORABLE = 'regime_favorable'
}

export enum SourcePreRemplissage {
  COMPTABILITE = 'comptabilite',
  DECLARATION_PRECEDENTE = 'declaration_precedente',
  PARAMETRAGE_FISCAL = 'parametrage_fiscal',
  BASE_EXTERNE = 'base_externe',
  CALCUL_AUTOMATIQUE = 'calcul_automatique',
  SAISIE_MANUELLE = 'saisie_manuelle'
}

export enum NiveauComplexite {
  SIMPLE = 'simple',
  MOYEN = 'moyen',
  COMPLEXE = 'complexe',
  EXPERT = 'expert'
}

export enum PrioriteOptimisation {
  BASSE = 'basse',
  MOYENNE = 'moyenne',
  HAUTE = 'haute',
  CRITIQUE = 'critique'
}

export enum StatutOptimisation {
  IDENTIFIEE = 'identifiee',
  EN_ANALYSE = 'en_analyse',
  APPROUVEE = 'approuvee',
  EN_COURS = 'en_cours',
  REALISEE = 'realisee',
  ABANDONNEE = 'abandonnee'
}

// =====================================================
// INTERFACES COMPLÉMENTAIRES
// =====================================================

export interface PeriodeDeclarative {
  type: TypePeriode;
  annee: number;
  mois?: number;
  trimestre?: number;
  dateDebut: Date;
  dateFin: Date;
  dateLimiteDeclaration: Date;
  dateLimitePaiement: Date;
}

export interface LigneDeclarationTVA {
  code: string;
  libelle: string;
  montantHT: number;
  tauxTVA: number;
  montantTVA: number;
  montantTTC: number;
  observations?: string;
}

export interface CalculTVA {
  baseHT: number;
  taux: number;
  montantTVA: number;
  deductibilite: number; // pourcentage
  tvaDeductible: number;
}

export interface LigneAjustementFiscal {
  code: string;
  libelle: string;
  montantComptable: number;
  ajustementFiscal: number;
  montantFiscal: number;
  justification: string;
  reference?: string;
}

export interface CreditImpotDetail {
  type: string;
  libelle: string;
  montant: number;
  tauxCredit: number;
  baseCalcul: number;
  limitePlafond?: number;
  reportPossible: boolean;
  dureeReport?: number;
}

export interface OrganismeSecuriteSociale {
  code: string;
  nom: string;
  pays: string;
  typeOrganisme: TypeOrganismeSecurite;
  coordonnees: CoordonneesOrganisme;
  cotisationsGerees: TypeCotisation[];
  modalitesPaiement: ModalitePaiement;
}

export interface CotisationDetail {
  type: TypeCotisation;
  libelle: string;
  base: number;
  taux: number;
  montant: number;
  plafond?: number;
  plancher?: number;
  exoneration?: ExonerationCotisation;
}

export interface CalculAutomatique {
  champ: string;
  formuleCalcul: string;
  valeurCalculee: number;
  sourcesUtilisees: string[];
  dateCalcul: Date;
  valide: boolean;
  commentaire?: string;
}

export interface ActionOptimisation {
  description: string;
  delai: number;
  responsable: string;
  cout: number;
  beneficeAttendu: number;
  statut: StatutAction;
  dateRealisation?: Date;
}

// =====================================================
// UTILITAIRES ET HELPERS FISCAUX
// =====================================================

export function calculerTVADeductible(
  montantTVA: number,
  tauxDeductibilite: number,
  plafondDeduction?: number
): number {
  const tvaDeductible = montantTVA * (tauxDeductibilite / 100);
  
  if (plafondDeduction && tvaDeductible > plafondDeduction) {
    return plafondDeduction;
  }
  
  return Math.round(tvaDeductible * 100) / 100;
}

export function calculerISProgressive(
  beneficeImposable: number,
  baremesIS: BaremeIS[]
): CalculIS {
  let impotTotal = 0;
  let resteAImposer = beneficeImposable;
  const detailCalcul: DetailCalculIS[] = [];
  
  for (const bareme of baremesIS.sort((a, b) => a.seuil - b.seuil)) {
    if (resteAImposer <= 0) break;
    
    const baseTrache = Math.min(resteAImposer, bareme.seuil);
    const impotTrache = baseTrache * (bareme.taux / 100);
    
    impotTotal += impotTrache;
    resteAImposer -= baseTrache;
    
    detailCalcul.push({
      tranche: bareme.libelle,
      base: baseTrache,
      taux: bareme.taux,
      impot: impotTrache
    });
  }
  
  return {
    beneficeImposable,
    impotTotal: Math.round(impotTotal),
    tauxEffectif: (impotTotal / beneficeImposable) * 100,
    detailCalcul
  };
}

export function detecterOptimisationsFiscales(
  declaration: DeclarationFiscale,
  donneesComptables: any,
  parametresFiscaux: any
): OptimisationFiscale[] {
  const optimisations: OptimisationFiscale[] = [];
  
  // Analyse amortissements dérogatoires
  if (donneesComptables.immobilisations?.length > 0) {
    const optimisationAmortissement = analyserAmortissementsDerogatoires(
      donneesComptables.immobilisations,
      parametresFiscaux.amortissements
    );
    
    if (optimisationAmortissement.economieEstimee > 0) {
      optimisations.push(optimisationAmortissement);
    }
  }
  
  // Analyse provisions déductibles
  if (donneesComptables.provisions?.length > 0) {
    const optimisationProvisions = analyserProvisionsDeductibles(
      donneesComptables.provisions,
      parametresFiscaux.provisions
    );
    
    if (optimisationProvisions.economieEstimee > 0) {
      optimisations.push(optimisationProvisions);
    }
  }
  
  // Analyse crédits d'impôts
  const optimisationCredits = analyserCreditsImpotDisponibles(
    donneesComptables,
    parametresFiscaux.creditsImpot
  );
  
  if (optimisationCredits.length > 0) {
    optimisations.push(...optimisationCredits);
  }
  
  return optimisations;
}

export function validerCoherenceDeclarations(
  declarationTVA: DeclarationTVA,
  declarationIS: DeclarationIS,
  donneesComptables: any
): ControleCoherence[] {
  const controles: ControleCoherence[] = [];
  
  // Contrôle cohérence CA TVA vs Comptabilité
  const caTVA = declarationTVA.operationsImposables.totalChiffreAffaires;
  const caComptable = donneesComptables.chiffreAffaires || 0;
  
  if (Math.abs(caTVA - caComptable) / caComptable > 0.05) {
    controles.push({
      type: 'coherence_ca',
      severite: 'warning',
      message: `Écart significatif entre CA TVA (${caTVA}) et CA comptable (${caComptable})`,
      impact: 'Risque de contrôle fiscal',
      suggestion: 'Vérifier les opérations exonérées ou hors champ TVA'
    });
  }
  
  // Contrôle cohérence résultat IS vs Comptabilité
  const resultatIS = declarationIS.determinationResultat.resultatImposable;
  const resultatComptable = donneesComptables.resultatComptable || 0;
  
  if (Math.abs(resultatIS - resultatComptable) > 1000) {
    controles.push({
      type: 'coherence_resultat',
      severite: 'error',
      message: `Écart entre résultat IS (${resultatIS}) et résultat comptable (${resultatComptable})`,
      impact: 'Déclaration incohérente',
      suggestion: 'Vérifier les retraitements extra-comptables'
    });
  }
  
  return controles;
}

// Fonctions d'analyse des optimisations (implémentations simplifiées)
function analyserAmortissementsDerogatoires(immobilisations: any[], parametres: any): OptimisationFiscale {
  // Implémentation simplifiée
  return {
    id: 'opt_amortissements',
    type: TypeOptimisation.AMORTISSEMENT_ACCELERE,
    priorite: PrioriteOptimisation.MOYENNE,
    titre: 'Amortissements dérogatoires',
    description: 'Possibilité d\'amortissements accélérés sur certains équipements',
    explicationDetaillee: 'Analyse des immobilisations éligibles aux amortissements dérogatoires',
    impactFinancier: {
      economieEstimee: 15000,
      coutMiseEnOeuvre: 500,
      economieNette: 14500,
      retourInvestissement: 29
    },
    conditions: {
      conditionsRequises: ['Équipements éligibles', 'Respect des seuils'],
      delaiMiseEnOeuvre: 30,
      complexiteMiseEnOeuvre: NiveauComplexite.MOYEN,
      risquesAssocies: []
    },
    actionsRecommandees: {
      actionsImmediates: [],
      actionsMoyenTerme: [],
      actionsLongTerme: []
    },
    suivi: {
      indicateursPerformance: [],
      pointsControle: [],
      frequenceRevision: 'Annuelle'
    },
    validite: {
      applicable: true,
      conditionsMarche: [],
      impactReglementaire: []
    },
    dateIdentification: new Date(),
    sourceIdentification: 'Analyse automatique',
    niveauConfiance: 0.8,
    statutMiseEnOeuvre: StatutOptimisation.IDENTIFIEE
  };
}

function analyserProvisionsDeductibles(provisions: any[], parametres: any): OptimisationFiscale {
  // Implémentation similaire...
  return {} as OptimisationFiscale;
}

function analyserCreditsImpotDisponibles(donneesComptables: any, parametres: any): OptimisationFiscale[] {
  // Implémentation similaire...
  return [];
}

// =====================================================
// DONNÉES DE RÉFÉRENCE FISCALES OHADA
// =====================================================

export const TAUX_TVA_PAR_PAYS: { [pays: string]: TauxTVAPays } = {
  'BF': { // Burkina Faso
    tauxNormal: 18,
    tauxReduit: 9,
    tauxSpeciaux: [{ produit: 'Médicaments', taux: 0 }],
    seuilFranchise: 30000000
  },
  'CI': { // Côte d'Ivoire
    tauxNormal: 18,
    tauxReduit: 9,
    tauxSpeciaux: [{ produit: 'Exportations', taux: 0 }],
    seuilFranchise: 50000000
  },
  'SN': { // Sénégal
    tauxNormal: 18,
    tauxReduit: 10,
    tauxSpeciaux: [{ produit: 'Produits de première nécessité', taux: 0 }],
    seuilFranchise: 25000000
  }
  // Autres pays OHADA...
};

export const BAREMES_IS_PAR_PAYS: { [pays: string]: BaremeIS[] } = {
  'BF': [
    { seuil: 10000000, taux: 25, libelle: 'Taux normal' },
    { seuil: Infinity, taux: 27.5, libelle: 'Taux majoré' }
  ],
  'CI': [
    { seuil: Infinity, taux: 25, libelle: 'Taux unique' }
  ],
  'SN': [
    { seuil: 50000000, taux: 25, libelle: 'PME' },
    { seuil: Infinity, taux: 30, libelle: 'Grandes entreprises' }
  ]
  // Autres pays...
};

export const ORGANISMES_SOCIAUX_PAR_PAYS: { [pays: string]: OrganismeSecuriteSociale[] } = {
  'CI': [
    {
      code: 'CNPS_CI',
      nom: 'Caisse Nationale de Prévoyance Sociale',
      pays: 'CI',
      typeOrganisme: 'securite_sociale',
      coordonnees: {
        adresse: 'Abidjan, Côte d\'Ivoire',
        telephone: '+225 20 32 10 00',
        email: 'info@cnps.ci'
      },
      cotisationsGerees: ['retraite', 'accident_travail', 'prestations_familiales'],
      modalitesPaiement: {
        periodicite: 'mensuelle',
        dateEcheance: 15,
        modePaiement: ['virement', 'cheque']
      }
    }
  ]
  // Autres pays...
};

// Types d'interfaces de référence
export interface TauxTVAPays {
  tauxNormal: number;
  tauxReduit: number;
  tauxSpeciaux: { produit: string; taux: number }[];
  seuilFranchise: number;
}

export interface BaremeIS {
  seuil: number;
  taux: number;
  libelle: string;
}

export interface CalculIS {
  beneficeImposable: number;
  impotTotal: number;
  tauxEffectif: number;
  detailCalcul: DetailCalculIS[];
}

export interface DetailCalculIS {
  tranche: string;
  base: number;
  taux: number;
  impot: number;
}

export interface ControleCoherence {
  type: string;
  severite: 'info' | 'warning' | 'error';
  message: string;
  impact: string;
  suggestion: string;
}

export default {
  calculerTVADeductible,
  calculerISProgressive,
  detecterOptimisationsFiscales,
  validerCoherenceDeclarations,
  TAUX_TVA_PAR_PAYS,
  BAREMES_IS_PAR_PAYS,
  ORGANISMES_SOCIAUX_PAR_PAYS
};