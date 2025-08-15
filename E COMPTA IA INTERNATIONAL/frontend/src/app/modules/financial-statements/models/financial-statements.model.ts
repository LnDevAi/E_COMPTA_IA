// =====================================================
// MODÈLES ÉTATS FINANCIERS SYSCOHADA AUDCIF
// Système complet de génération automatique OHADA
// =====================================================

export interface EtatsFinanciers {
  id: string;
  exercice: ExerciceComptable;
  entreprise: IdentiteEntreprise;
  
  // États financiers obligatoires AUDCIF
  bilan: BilanAUDCIF;
  compteResultat: CompteResultatAUDCIF;
  tafire: TAFIRE; // Tableau Financier des Ressources et Emplois
  
  // Notes annexes obligatoires
  notesAnnexes: NotesAnnexes;
  
  // États complémentaires
  tableauVariationCapitaux?: TableauVariationCapitaux;
  etatFluxTresorerie?: EtatFluxTresorerie;
  
  // Métadonnées et validation
  statut: StatutEtatsFinanciers;
  dateGeneration: Date;
  dateValidation?: Date;
  utilisateur: string;
  
  // Conformité AUDCIF
  conformiteAUDCIF: ConformiteAUDCIF;
  controles: ControleEtatsFinanciers[];
  anomalies: AnomalieEtatsFinanciers[];
  
  // Analyses et ratios
  analysesFinancieres: AnalyseFinanciere;
  ratiosObligatoires: RatiosAUDCIF;
  indicateursPerformance: IndicateurPerformance[];
  
  // Export et publication
  formatsGeneres: FormatExport[];
  datePublication?: Date;
  publieParAGO?: boolean;
  
  // Comparaison et historique
  exercicePrecedent?: ComparaisonExercice;
  evolutionIndicateurs: EvolutionIndicateur[];
  
  // Audit et certification
  auditExterne?: InformationsAudit;
  certificationCAC?: CertificationCAC;
  
  // Métadonnées techniques
  versionAUDCIF: string;
  dateCreation: Date;
  derniereModification: Date;
  hashIntegrite: string;
}

export interface BilanAUDCIF {
  id: string;
  exercice: string;
  devise: string;
  dateArrete: Date;
  
  // ACTIF
  actif: {
    // ACTIF IMMOBILISE (classe 2)
    actifImmobilise: {
      chargesImmobilisees: PosteBilan;
      immobilisationsIncorporelles: PosteBilan;
      immobilisationsCorporelles: PosteBilan;
      immobilisationsFinancieres: PosteBilan;
      total: number;
    };
    
    // ACTIF CIRCULANT (classes 3, 4, 5)
    actifCirculant: {
      // Actif circulant HAO
      actifCirculantHAO: PosteBilan;
      
      // Stocks (classe 3)
      stocks: {
        marchandises: PosteBilan;
        matieresPremieresEtFournitures: PosteBilan;
        autresApprovisionnnements: PosteBilan;
        enCoursProduction: PosteBilan;
        produitsFinis: PosteBilan;
        total: number;
      };
      
      // Créances et emplois assimilés (classe 4)
      creances: {
        fournituresdbiteurs: PosteBilan;
        clientesEtComptesRattaches: PosteBilan;
        autresCreances: PosteBilan;
        total: number;
      };
      
      // Trésorerie-Actif (classe 5)
      tresorerie: {
        titresPlacement: PosteBilan;
        valeursAEncaisser: PosteBilan;
        banquesChequesPostaux: PosteBilan;
        caisses: PosteBilan;
        total: number;
      };
      
      total: number;
    };
    
    // ÉCARTS DE CONVERSION-ACTIF
    ecartsConversionActif: PosteBilan;
    
    // TOTAL GÉNÉRAL ACTIF
    totalActif: number;
  };
  
  // PASSIF
  passif: {
    // CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES
    capitauxPropres: {
      // Capital (classe 1)
      capital: PosteBilan;
      primesEtReserves: PosteBilan;
      ecartsReevaluation: PosteBilan;
      
      // Résultat
      resultatReportes: PosteBilan;
      resultatExercice: PosteBilan;
      
      // Autres
      subventionsInvestissement: PosteBilan;
      provisionsReglementees: PosteBilan;
      
      total: number;
    };
    
    // DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES
    dettesFinancieres: {
      // Dettes financières et ressources assimilées HAO
      dettesFinancieresHAO: PosteBilan;
      
      // Emprunts et dettes financières
      empruntsEtDettesFinancieres: PosteBilan;
      provisionsFinancieresPourRisques: PosteBilan;
      
      total: number;
    };
    
    // TOTAL RESSOURCES STABLES
    totalRessourcesStables: number;
    
    // PASSIF CIRCULANT
    passifCirculant: {
      // Passif circulant HAO
      passifCirculantHAO: PosteBilan;
      
      // Dettes circulantes et ressources assimilées (classe 4)
      dettesCirculantes: {
        clientsCrediteurs: PosteBilan;
        fournisseursEtComptesRattaches: PosteBilan;
        dettesSchales: PosteBilan;
        autresDettes: PosteBilan;
        total: number;
      };
      
      // Trésorerie-Passif (classe 5)
      tresorerie: {
        banquesCredits: PosteBilan;
        decouvertsBancaires: PosteBilan;
        total: number;
      };
      
      total: number;
    };
    
    // ÉCARTS DE CONVERSION-PASSIF
    ecartsConversionPassif: PosteBilan;
    
    // TOTAL GÉNÉRAL PASSIF
    totalPassif: number;
  };
  
  // Contrôles et validations
  equilibreBilan: boolean;
  controles: ControleBilan[];
  notes: NoteBilan[];
}

export interface CompteResultatAUDCIF {
  id: string;
  exercice: string;
  devise: string;
  periode: PeriodeExercice;
  
  // ACTIVITÉS ORDINAIRES (AO)
  activitesOrdinaires: {
    // CHIFFRE D'AFFAIRES ET PRODUITS
    produits: {
      ventesMArchandises: PosteResultat;
      ventesProduitsOuvrage: PosteResultat;
      prestationsServices: PosteResultat;
      productionStockee: PosteResultat;
      productionImmobilise: PosteResultat;
      subventionsExploitation: PosteResultat;
      autresProduits: PosteResultat;
      total: number;
    };
    
    // CHARGES
    charges: {
      achatsMarchandises: PosteResultat;
      achatsMatieresPremieres: PosteResultat;
      autresAchats: PosteResultat;
      transports: PosteResultat;
      servicesuérieurs: PosteResultat;
      impotsTaxes: PosteResultat;
      autresCharges: PosteResultat;
      chargesPersonnel: PosteResultat;
      total: number;
    };
    
    // Résultat d'exploitation
    resultatExploitation: number;
    
    // RÉSULTAT FINANCIER
    resultatFinancier: {
      produitsFinanciers: PosteResultat;
      chargesFinancieres: PosteResultat;
      resultatNet: number;
    };
    
    // Résultat des activités ordinaires
    resultatActivitesOrdinaires: number;
  };
  
  // HORS ACTIVITÉS ORDINAIRES (HAO)
  horsActivitesOrdinaires: {
    produits: PosteResultat;
    charges: PosteResultat;
    resultatHAO: number;
  };
  
  // RÉSULTAT NET
  resultatAvantImpots: number;
  impotsSurBenefices: PosteResultat;
  resultatNetExercice: number;
  
  // Informations complémentaires
  amortissements: PosteResultat;
  provisions: PosteResultat;
  
  // Contrôles
  equilibreResultat: boolean;
  controles: ControleResultat[];
  ventilationAnalytique?: VentilationAnalytique[];
}

export interface TAFIRE {
  id: string;
  exercice: string;
  devise: string;
  
  // I. RESSOURCES DURABLES DE L'EXERCICE
  ressourcesDurables: {
    capaciteAutofinancement: PosteTAFIRE;
    cessionAPPOrtCeded: PosteTAFIRE;
    augmentationCapitaux: PosteTAFIRE;
    augmentationDettesFinancieres: PosteTAFIRE;
    total: number;
  };
  
  // II. EMPLOIS STABLES DE L'EXERCICE
  emploisStables: {
    acquisitionsImmobilisations: PosteTAFIRE;
    chargesRestalerEtales: PosteTAFIRE;
    diminutionDettesFinancieres: PosteTAFIRE;
    emploisDivers: PosteTAFIRE;
    total: number;
  };
  
  // A. VARIATION DU FONDS DE ROULEMENT NET GLOBAL (FRNG)
  variationFRNG: number;
  
  // III. VARIATION DES EMPLOIS D'EXPLOITATION
  variationEmploisExploitation: {
    variationStocks: PosteTAFIRE;
    variationCreancesExploitation: PosteTAFIRE;
    total: number;
  };
  
  // IV. VARIATION DES RESSOURCES D'EXPLOITATION
  variationRessourcesExploitation: {
    variationDettesExploitation: PosteTAFIRE;
    total: number;
  };
  
  // B. VARIATION DU BESOIN DE FINANCEMENT D'EXPLOITATION (BFR)
  variationBFR: number;
  
  // V. VARIATION DES EMPLOIS HORS ACTIVITES ORDINAIRES (HAO)
  variationEmploisHAO: PosteTAFIRE;
  
  // VI. VARIATION DES RESSOURCES HAO
  variationRessourcesHAO: PosteTAFIRE;
  
  // C. VARIATION DU BESOIN DE FINANCEMENT HAO
  variationBesoinHAO: number;
  
  // D. VARIATION DE LA TRÉSORERIE
  variationTresorerie: {
    tresorerieInitiale: number;
    tresorerieFinale: number;
    variationNette: number;
  };
  
  // Contrôles et validations
  equilibreTAFIRE: boolean;
  formuleVerification: string;
  controles: ControleTAFIRE[];
}

export interface NotesAnnexes {
  id: string;
  exercice: string;
  
  // RÈGLES ET MÉTHODES COMPTABLES (Obligatoire)
  reglesMethodesComptables: {
    referentielComptable: string;
    methodsEvaluation: MethodeEvaluation[];
    modificationsMethodes: ModificationMethode[];
    optionsComptables: OptionComptable[];
  };
  
  // COMPLÉMENTS D'INFORMATION AU BILAN
  complementsBilan: {
    immobilisations: NoteImmobilisations;
    amortissements: NoteAmortissements;
    provisions: NoteProvisions;
    creances: NoteCreances;
    dettes: NoteDettes;
    capitauxPropres: NoteCapitauxPropres;
  };
  
  // COMPLÉMENTS D'INFORMATION AU COMPTE DE RÉSULTAT
  complementsResultat: {
    chiffreAffaires: NoteChiffreAffaires;
    chargesPersonnel: NoteChargesPersonnel;
    chargesFinancieres: NoteChargesFinancieres;
    impotsTaxes: NoteImpotsTaxes;
    resultatsExceptionnels: NoteResultatsExceptionnels;
  };
  
  // AUTRES INFORMATIONS OBLIGATOIRES
  autresInformations: {
    engagementsHorsBilan: EngagementHorsBilan[];
    evenementsPosteieurs: EvenementPosterieur[];
    partiesLiees: InformationPartiesLiees[];
    effectifs: InformationEffectifs;
    environnement: InformationEnvironnement;
  };
  
  // TABLEAUX DE PASSAGE (si applicable)
  tableauxPassage?: {
    passageComptabiliteNormalisee: TableauPassage;
    passageComptabiliteSimplifiee?: TableauPassage;
  };
  
  // INFORMATIONS SECTORIELLES (si applicable)
  informationsSectorielles?: InformationSectorielle[];
  
  // Métadonnées
  dateArrete: Date;
  preparation: string;
  validation: string;
  approbation?: string;
}

export interface RatiosAUDCIF {
  id: string;
  exercice: string;
  
  // RATIOS OBLIGATOIRES AUDCIF (8 ratios)
  ratiosObligatoires: {
    // 1. Ratio de structure financière
    ratioStructureFinanciere: {
      valeur: number;
      formule: string;
      interpretation: string;
      seuil: SeuilRatio;
    };
    
    // 2. Ratio d'autonomie financière
    ratioAutonomieFinanciere: {
      valeur: number;
      formule: string;
      interpretation: string;
      seuil: SeuilRatio;
    };
    
    // 3. Ratio de liquidité générale
    ratioLiquiditeGenerale: {
      valeur: number;
      formule: string;
      interpretation: string;
      seuil: SeuilRatio;
    };
    
    // 4. Ratio de liquidité restreinte
    ratioLiquiditeRestreinte: {
      valeur: number;
      formule: string;
      interpretation: string;
      seuil: SeuilRatio;
    };
    
    // 5. Ratio de rentabilité économique
    ratioRentabiliteEconomique: {
      valeur: number;
      formule: string;
      interpretation: string;
      seuil: SeuilRatio;
    };
    
    // 6. Ratio de rentabilité financière
    ratioRentabiliteFinanciere: {
      valeur: number;
      formule: string;
      interpretation: string;
      seuil: SeuilRatio;
    };
    
    // 7. Ratio de rotation des stocks
    ratioRotationStocks: {
      valeur: number;
      formule: string;
      interpretation: string;
      seuil: SeuilRatio;
    };
    
    // 8. Ratio de couverture des intérêts
    ratioCouvertureInterets: {
      valeur: number;
      formule: string;
      interpretation: string;
      seuil: SeuilRatio;
    };
  };
  
  // RATIOS COMPLÉMENTAIRES
  autresRatios: {
    ratiosSolvabilite: RatioCalcule[];
    ratiosActivite: RatioCalcule[];
    ratiosGestion: RatioCalcule[];
    ratiosMarketising: RatioCalcule[];
  };
  
  // ANALYSE ET COMMENTAIRES
  analyseGlobale: string;
  pointsForts: string[];
  pointsAmelioration: string[];
  recommandations: string[];
  
  // ÉVOLUTION ET COMPARAISON
  evolutionRatios: EvolutionRatio[];
  comparaisonSectorielle?: ComparaisonSectorielle;
  
  // Métadonnées
  dateCalcul: Date;
  methodECalcul: string;
  sourceDonnees: string;
}

export interface AnalyseFinanciere {
  id: string;
  exercice: string;
  
  // ANALYSE DE LA STRUCTURE FINANCIÈRE
  analyseStructure: {
    fondRoulementNetGlobal: AnalyseIndicateur;
    besoinFinancementExploitation: AnalyseIndicateur;
    tresorerieNette: AnalyseIndicateur;
    equilibreFinancier: EvaluationEquilibre;
  };
  
  // ANALYSE DE LA PERFORMANCE
  analysePerformance: {
    croissanceChiffreAffaires: AnalyseIndicateur;
    profitabiliteExploitation: AnalyseIndicateur;
    rentabiliteCapitaux: AnalyseIndicateur;
    efficaciteGestion: AnalyseIndicateur;
  };
  
  // ANALYSE DES RISQUES
  analyseRisques: {
    risqueLiquidite: EvaluationRisque;
    risqueSolvabilite: EvaluationRisque;
    risqueActivite: EvaluationRisque;
    risqueFinancier: EvaluationRisque;
  };
  
  // DIAGNOSTIC GLOBAL
  diagnosticGlobal: {
    noteGlobale: NoteEvaluation;
    syntheseExecutive: string;
    tendanceEvolution: TendanceEvolution;
    scenariosPrevisionnels: ScenarioProvisionnel[];
  };
  
  // RECOMMANDATIONS STRATÉGIQUES
  recommandationsStrategiques: {
    recommandationsUrgentes: RecommandationStrategique[];
    recommandationsMoyenTerme: RecommandationStrategique[];
    opportunitesAmelioration: OpportuniteAmelioration[];
  };
  
  // Métadonnées
  dateAnalyse: Date;
  analysteResponsable: string;
  niveauConfiance: number;
  limitesAnalyse: string[];
}

// =====================================================
// ENUMERATIONS
// =====================================================

export enum StatutEtatsFinanciers {
  BROUILLON = 'brouillon',
  EN_PREPARATION = 'en_preparation',
  EN_VALIDATION = 'en_validation',
  VALIDE = 'valide',
  PUBLIE = 'publie',
  CERTIFIE = 'certifie',
  ARCHIVE = 'archive'
}

export enum TypeEtatFinancier {
  BILAN = 'bilan',
  COMPTE_RESULTAT = 'compte_resultat',
  TAFIRE = 'tafire',
  NOTES_ANNEXES = 'notes_annexes',
  VARIATION_CAPITAUX = 'variation_capitaux',
  FLUX_TRESORERIE = 'flux_tresorerie'
}

export enum FormatExport {
  PDF = 'pdf',
  EXCEL = 'excel',
  WORD = 'word',
  XML_XBRL = 'xml_xbrl',
  JSON = 'json',
  HTML = 'html'
}

export enum NiveauConformite {
  CONFORME = 'conforme',
  NON_CONFORME_MINEUR = 'non_conforme_mineur',
  NON_CONFORME_MAJEUR = 'non_conforme_majeur',
  NON_APPLICABLE = 'non_applicable'
}

export enum TypeControle {
  COHERENCE = 'coherence',
  EXHAUSTIVITE = 'exhaustivite',
  EXACTITUDE = 'exactitude',
  CONFORMITE = 'conformite',
  CALCUL = 'calcul'
}

export enum NiveauRisque {
  FAIBLE = 'faible',
  MOYEN = 'moyen',
  ELEVE = 'eleve',
  CRITIQUE = 'critique'
}

export enum TendanceEvolution {
  TRES_POSITIVE = 'tres_positive',
  POSITIVE = 'positive',
  STABLE = 'stable',
  NEGATIVE = 'negative',
  TRES_NEGATIVE = 'tres_negative'
}

// =====================================================
// INTERFACES COMPLÉMENTAIRES
// =====================================================

export interface PosteBilan {
  code: string;
  libelle: string;
  montantBrut: number;
  amortissementProvision: number;
  montantNet: number;
  exercicePrecedent: number;
  variation: number;
  pourcentageVariation: number;
  notes?: string[];
}

export interface PosteResultat {
  code: string;
  libelle: string;
  montantExercice: number;
  exercicePrecedent: number;
  variation: number;
  pourcentageVariation: number;
  notes?: string[];
}

export interface PosteTAFIRE {
  code: string;
  libelle: string;
  montant: number;
  exercicePrecedent: number;
  variation: number;
  notes?: string[];
}

export interface ExerciceComptable {
  annee: number;
  dateDebut: Date;
  dateFin: Date;
  dureeEnMois: number;
  exerciceClos: boolean;
  monnaieReference: string;
}

export interface ConformiteAUDCIF {
  niveauGlobal: NiveauConformite;
  pointsConformite: PointConformite[];
  pointsNonConformite: PointNonConformite[];
  scoreConformite: number;
  recommandationsConformite: string[];
}

export interface ControleEtatsFinanciers {
  id: string;
  type: TypeControle;
  description: string;
  resultat: boolean;
  messageErreur?: string;
  impactEstime: string;
  priorite: number;
  dateControle: Date;
}

export interface SeuilRatio {
  minimum?: number;
  maximum?: number;
  optimal?: number;
  secteur?: number;
  interpretation: string;
}

export interface RatioCalcule {
  nom: string;
  valeur: number;
  formule: string;
  interpretation: string;
  evolution?: EvolutionRatio;
}

// =====================================================
// UTILITAIRES ET HELPERS
// =====================================================

export function calculerRatiosAUDCIF(
  bilan: BilanAUDCIF,
  resultat: CompteResultatAUDCIF
): RatiosAUDCIF {
  const ratios: any = {
    id: `ratios_${bilan.exercice}`,
    exercice: bilan.exercice,
    ratiosObligatoires: {}
  };
  
  // 1. Ratio de structure financière
  ratios.ratiosObligatoires.ratioStructureFinanciere = {
    valeur: (bilan.passif.capitauxPropres.total / bilan.passif.totalPassif) * 100,
    formule: '(Capitaux Propres / Total Passif) × 100',
    interpretation: 'Mesure la part des capitaux propres dans le financement',
    seuil: { minimum: 30, optimal: 50, interpretation: 'Plus élevé = meilleure stabilité' }
  };
  
  // 2. Ratio d'autonomie financière
  ratios.ratiosObligatoires.ratioAutonomieFinanciere = {
    valeur: bilan.passif.capitauxPropres.total / bilan.passif.dettesFinancieres.total,
    formule: 'Capitaux Propres / Dettes Financières',
    interpretation: 'Mesure l\'indépendance financière de l\'entreprise',
    seuil: { minimum: 1, optimal: 2, interpretation: 'Plus élevé = plus d\'autonomie' }
  };
  
  // 3. Ratio de liquidité générale
  ratios.ratiosObligatoires.ratioLiquiditeGenerale = {
    valeur: bilan.actif.actifCirculant.total / bilan.passif.passifCirculant.total,
    formule: 'Actif Circulant / Passif Circulant',
    interpretation: 'Capacité à honorer les dettes à court terme',
    seuil: { minimum: 1, optimal: 1.5, interpretation: 'Plus élevé = meilleure solvabilité CT' }
  };
  
  // 4. Ratio de rentabilité économique
  const totalActif = bilan.actif.totalActif;
  ratios.ratiosObligatoires.ratioRentabiliteEconomique = {
    valeur: (resultat.activitesOrdinaires.resultatActivitesOrdinaires / totalActif) * 100,
    formule: '(Résultat d\'exploitation / Total Actif) × 100',
    interpretation: 'Efficacité de l\'utilisation des actifs',
    seuil: { minimum: 5, optimal: 10, interpretation: 'Plus élevé = meilleure performance' }
  };
  
  return ratios as RatiosAUDCIF;
}

export function genererNotesAnnexes(
  bilan: BilanAUDCIF,
  resultat: CompteResultatAUDCIF,
  informationsComplementaires: any
): NotesAnnexes {
  return {
    id: `notes_${bilan.exercice}`,
    exercice: bilan.exercice,
    reglesMethodesComptables: {
      referentielComptable: 'SYSCOHADA AUDCIF 2019',
      methodsEvaluation: [
        {
          poste: 'Immobilisations corporelles',
          methode: 'Coût historique',
          amortissement: 'Linéaire'
        },
        {
          poste: 'Stocks',
          methode: 'Premier entré, premier sorti (FIFO)',
          valorisation: 'Coût moyen pondéré'
        }
      ],
      modificationsMethodes: [],
      optionsComptables: []
    },
    complementsBilan: {
      immobilisations: {
        mouvements: [],
        methodsAmortissement: [],
        tests: ''
      },
      amortissements: {
        dotations: [],
        reprises: [],
        methodes: []
      },
      provisions: {
        constitution: [],
        reprises: [],
        justifications: []
      },
      creances: {
        echeancier: [],
        provisionsClient: [],
        creancesDiverses: []
      },
      dettes: {
        echeancier: [],
        garanties: [],
        dettesEnDevises: []
      },
      capitauxPropres: {
        mouvementsCapital: [],
        affectationResultat: [],
        dividendes: []
      }
    },
    complementsResultat: {
      chiffreAffaires: {
        ventilationGeographique: [],
        ventilationProduits: [],
        clientsPrincipaux: []
      },
      chargesPersonnel: {
        effectifs: 0,
        masseSalariale: 0,
        chargesSociales: 0
      },
      chargesFinancieres: {
        interetsEmprunts: 0,
        fraisBancaires: 0,
        pertesChange: 0
      },
      impotsTaxes: {
        impotBenefices: 0,
        autresImpots: 0,
        creditImpot: 0
      },
      resultatsExceptionnels: {
        cessions: [],
        provisions: [],
        autresElements: []
      }
    },
    autresInformations: {
      engagementsHorsBilan: [],
      evenementsPosteieurs: [],
      partiesLiees: [],
      effectifs: {
        nombreSalaries: 0,
        evolutionEffectifs: 0,
        masseSalariale: 0
      },
      environnement: {
        impactEnvironnemental: '',
        investissementsEnvironnement: 0,
        provisionsEnvironnement: 0
      }
    },
    dateArrete: new Date(),
    preparation: 'Direction Générale',
    validation: 'Conseil d\'Administration'
  };
}

export function controlerCoherenceEtatsFinanciers(
  bilan: BilanAUDCIF,
  resultat: CompteResultatAUDCIF,
  tafire: TAFIRE
): ControleEtatsFinanciers[] {
  const controles: ControleEtatsFinanciers[] = [];
  
  // Contrôle équilibre bilan
  controles.push({
    id: 'ctrl_equilibre_bilan',
    type: TypeControle.COHERENCE,
    description: 'Vérification équilibre Actif = Passif',
    resultat: Math.abs(bilan.actif.totalActif - bilan.passif.totalPassif) < 0.01,
    messageErreur: bilan.actif.totalActif !== bilan.passif.totalPassif ? 
      `Écart détecté: ${bilan.actif.totalActif - bilan.passif.totalPassif}` : undefined,
    impactEstime: 'Critique',
    priorite: 1,
    dateControle: new Date()
  });
  
  // Contrôle cohérence résultat
  const resultatBilan = bilan.passif.capitauxPropres.resultatExercice.montantNet;
  const resultatCompte = resultat.resultatNetExercice;
  
  controles.push({
    id: 'ctrl_coherence_resultat',
    type: TypeControle.COHERENCE,
    description: 'Cohérence résultat Bilan vs Compte de résultat',
    resultat: Math.abs(resultatBilan - resultatCompte) < 0.01,
    messageErreur: resultatBilan !== resultatCompte ? 
      `Écart résultat: ${resultatBilan - resultatCompte}` : undefined,
    impactEstime: 'Majeur',
    priorite: 2,
    dateControle: new Date()
  });
  
  // Contrôle TAFIRE
  const frng = bilan.actif.actifImmobilise.total - bilan.passif.totalRessourcesStables;
  controles.push({
    id: 'ctrl_frng_tafire',
    type: TypeControle.CALCUL,
    description: 'Cohérence FRNG entre Bilan et TAFIRE',
    resultat: Math.abs(frng - tafire.variationFRNG) < 0.01,
    messageErreur: frng !== tafire.variationFRNG ? 
      `Écart FRNG: ${frng - tafire.variationFRNG}` : undefined,
    impactEstime: 'Moyen',
    priorite: 3,
    dateControle: new Date()
  });
  
  return controles;
}

// =====================================================
// DONNÉES DE RÉFÉRENCE AUDCIF
// =====================================================

export const STRUCTURE_BILAN_AUDCIF = {
  actif: {
    classes: ['2', '3', '4', '5'],
    sousClasses: {
      '2': ['20', '21', '22', '23', '24', '25', '26', '27'],
      '3': ['31', '32', '33', '34', '35', '36', '37', '38'],
      '4': ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'],
      '5': ['50', '51', '52', '53', '54', '55', '56', '57', '58']
    }
  },
  passif: {
    classes: ['1', '4', '5'],
    sousClasses: {
      '1': ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
      '4': ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'],
      '5': ['50', '51', '52', '53', '54', '55', '56', '57', '58']
    }
  }
};

export const SEUILS_RATIOS_SECTEUR = {
  commerce: {
    liquiditeGenerale: { min: 1.0, opt: 1.5 },
    autonomieFinanciere: { min: 0.5, opt: 1.0 },
    rentabiliteEconomique: { min: 3, opt: 8 }
  },
  industrie: {
    liquiditeGenerale: { min: 1.2, opt: 1.8 },
    autonomieFinanciere: { min: 0.8, opt: 1.5 },
    rentabiliteEconomique: { min: 5, opt: 12 }
  },
  services: {
    liquiditeGenerale: { min: 0.8, opt: 1.2 },
    autonomieFinanciere: { min: 0.6, opt: 1.2 },
    rentabiliteEconomique: { min: 8, opt: 15 }
  }
};

export default {
  calculerRatiosAUDCIF,
  genererNotesAnnexes,
  controlerCoherenceEtatsFinanciers,
  STRUCTURE_BILAN_AUDCIF,
  SEUILS_RATIOS_SECTEUR
};