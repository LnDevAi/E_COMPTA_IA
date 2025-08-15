// Structure de la balance N-1 à 6 colonnes
export interface BalanceN1 {
  id: string;
  entrepriseId: string;
  exerciceN1: string;              // Année N-1 (ex: "2023")
  exerciceActuel: string;          // Année en cours (ex: "2024")
  dateCreation: string;
  dateMiseAJour: string;
  
  // Méthode de création
  methodeCreation: MethodeCreationBalance;
  
  // Informations sur l'upload (si applicable)
  fichierOriginal?: FichierBalance;
  
  // Statut et validation
  statut: StatutBalance;
  valide: boolean;
  dateValidation?: string;
  validateurUserId?: string;
  
  // Lignes de la balance
  lignesBalance: LigneBalanceN1[];
  
  // Report à nouveau généré
  reportNouveau?: ReportNouveau;
  
  // Statistiques et contrôles
  totauxControle: TotauxControleBalance;
  anomalies: AnomalieBalance[];
  
  // Métadonnées
  creeParUserId: string;
  commentaires?: string;
}

// Méthode de création de la balance
export enum MethodeCreationBalance {
  UPLOAD_FICHIER = 'UPLOAD_FICHIER',      // Upload Excel/CSV
  SAISIE_MANUELLE = 'SAISIE_MANUELLE',    // Saisie ligne par ligne
  IMPORT_LOGICIEL = 'IMPORT_LOGICIEL',    // Import depuis autre logiciel
  GENERATION_AUTO = 'GENERATION_AUTO'      // Génération automatique
}

// Statut de la balance
export enum StatutBalance {
  BROUILLON = 'BROUILLON',
  EN_COURS = 'EN_COURS',
  COMPLETE = 'COMPLETE',
  VALIDEE = 'VALIDEE',
  ARCHIVEE = 'ARCHIVEE',
  ERREUR = 'ERREUR'
}

// Ligne de balance N-1 (6 colonnes)
export interface LigneBalanceN1 {
  id: string;
  balanceId: string;
  
  // Identification du compte
  numeroCompte: string;
  intituleCompte: string;
  classeCompte: string;           // Classe 1-8
  
  // Les 6 colonnes de la balance
  soldeDebitOuverture: number;    // Colonne 1: Soldes débiteurs d'ouverture
  soldeCreditOuverture: number;   // Colonne 2: Soldes créditeurs d'ouverture
  mouvementDebit: number;         // Colonne 3: Mouvements débiteurs
  mouvementCredit: number;        // Colonne 4: Mouvements créditeurs
  soldeDebitFinal: number;        // Colonne 5: Soldes débiteurs finaux
  soldeCreditFinal: number;       // Colonne 6: Soldes créditeurs finaux
  
  // Informations complémentaires
  typeCompte: TypeCompteBalance;
  actif: boolean;
  ordre: number;                  // Ordre d'affichage
  
  // Validation et contrôles
  controleOk: boolean;
  messageErreur?: string;
  
  // Métadonnées
  dateCreation: string;
  dateMiseAJour: string;
}

export enum TypeCompteBalance {
  ACTIF = 'ACTIF',
  PASSIF = 'PASSIF',
  CHARGE = 'CHARGE',
  PRODUIT = 'PRODUIT',
  RESULTAT = 'RESULTAT',
  AUTRE = 'AUTRE'
}

// Informations sur le fichier uploadé
export interface FichierBalance {
  nomFichier: string;
  tailleFichier: number;
  typeFile: string;               // 'xlsx', 'csv', 'xls'
  dateUpload: string;
  cheminFichier: string;
  
  // Paramètres de parsing
  feuille?: string;               // Nom de la feuille Excel
  ligneEntete: number;            // Ligne contenant les en-têtes
  premiereLineeDonnees: number;   // Première ligne de données
  derniereLineDonnees?: number;   // Dernière ligne (si spécifiée)
  
  // Mapping des colonnes
  mappingColonnes: MappingColonnesBalance;
  
  // Résultats du parsing
  lignesLues: number;
  lignesValides: number;
  lignesErreur: number;
  erreursDetectees: string[];
}

// Mapping des colonnes du fichier
export interface MappingColonnesBalance {
  numeroCompte: string | number;        // Ex: "A" ou 1
  intituleCompte: string | number;      // Ex: "B" ou 2
  soldeDebitOuverture: string | number; // Ex: "C" ou 3
  soldeCreditOuverture: string | number; // Ex: "D" ou 4
  mouvementDebit: string | number;       // Ex: "E" ou 5
  mouvementCredit: string | number;      // Ex: "F" ou 6
  soldeDebitFinal: string | number;      // Ex: "G" ou 7
  soldeCreditFinal: string | number;     // Ex: "H" ou 8
}

// Report à nouveau généré automatiquement
export interface ReportNouveau {
  id: string;
  balanceId: string;
  entrepriseId: string;
  exerciceOrigine: string;        // Exercice N-1
  exerciceDestination: string;    // Exercice N (actuel)
  
  // Informations de génération
  dateGeneration: string;
  genereParUserId: string;
  methodeGeneration: MethodeGenerationRAN;
  
  // Écritures de report à nouveau
  ecrituresRAN: EcritureReportNouveau[];
  
  // Totaux de contrôle
  totalDebit: number;
  totalCredit: number;
  equilibre: boolean;
  
  // Statut
  statut: StatutReportNouveau;
  dateComptabilisation?: string;
  numeroEcriture?: string;
  journalRAN?: string;            // Journal utilisé pour le RAN
  
  // Validation
  valide: boolean;
  dateValidation?: string;
  validateurUserId?: string;
  commentaires?: string;
}

export enum MethodeGenerationRAN {
  AUTO_BALANCE_N1 = 'AUTO_BALANCE_N1',      // Depuis balance N-1
  MANUEL = 'MANUEL',                         // Saisie manuelle
  IMPORT_EXTERNE = 'IMPORT_EXTERNE'         // Import externe
}

export enum StatutReportNouveau {
  GENERE = 'GENERE',
  VALIDE = 'VALIDE',
  COMPTABILISE = 'COMPTABILISE',
  ANNULE = 'ANNULE'
}

// Écriture de report à nouveau
export interface EcritureReportNouveau {
  id: string;
  reportNouveauId: string;
  
  // Informations comptables
  numeroCompte: string;
  intituleCompte: string;
  montantDebit: number;
  montantCredit: number;
  libelle: string;
  
  // Classification
  classeCompte: string;
  typeCompte: TypeCompteRAN;
  
  // Origine
  soldeOrigineFinal: number;      // Solde final N-1
  sensOrigineFinal: 'DEBIT' | 'CREDIT';
  
  // Métadonnées
  ordre: number;
  actif: boolean;
}

export enum TypeCompteRAN {
  BILAN_ACTIF = 'BILAN_ACTIF',
  BILAN_PASSIF = 'BILAN_PASSIF',
  RESULTAT_REPORTE = 'RESULTAT_REPORTE'
}

// Totaux de contrôle de la balance
export interface TotauxControleBalance {
  // Totaux par colonne
  totalSoldeDebitOuverture: number;
  totalSoldeCreditOuverture: number;
  totalMouvementDebit: number;
  totalMouvementCredit: number;
  totalSoldeDebitFinal: number;
  totalSoldeCreditFinal: number;
  
  // Contrôles d'équilibre
  equilibreOuverture: boolean;    // Col1 = Col2
  equilibreMouvements: boolean;   // Col3 = Col4
  equilibreFinal: boolean;        // Col5 = Col6
  equilibreGeneral: boolean;      // Cohérence globale
  
  // Contrôles de cohérence
  coherenceCalcul: boolean;       // (Col1-Col2) + (Col3-Col4) = (Col5-Col6)
  
  // Statistiques
  nombreComptes: number;
  nombreComptesActifs: number;
  nombreComptesPassifs: number;
  nombreComptesCharges: number;
  nombreComptesProduits: number;
}

// Anomalies détectées
export interface AnomalieBalance {
  id: string;
  balanceId: string;
  ligneId?: string;               // ID de la ligne concernée (si applicable)
  
  typeAnomalie: TypeAnomalieBalance;
  niveau: NiveauAnomalieBalance;
  
  titre: string;
  description: string;
  valeurAttendue?: number;
  valeurTrouvee?: number;
  
  // Résolution
  resolue: boolean;
  dateResolution?: string;
  resolutionUserId?: string;
  commentaireResolution?: string;
  
  dateDetection: string;
}

export enum TypeAnomalieBalance {
  EQUILIBRE_COLONNE = 'EQUILIBRE_COLONNE',
  COHERENCE_CALCUL = 'COHERENCE_CALCUL',
  COMPTE_INEXISTANT = 'COMPTE_INEXISTANT',
  MONTANT_ABERRANT = 'MONTANT_ABERRANT',
  DOUBLON_COMPTE = 'DOUBLON_COMPTE',
  CLASSE_INCOHERENTE = 'CLASSE_INCOHERENTE',
  SOLDE_NEGATIF_ANORMAL = 'SOLDE_NEGATIF_ANORMAL'
}

export enum NiveauAnomalieBalance {
  INFO = 'INFO',
  AVERTISSEMENT = 'AVERTISSEMENT',
  ERREUR = 'ERREUR',
  CRITIQUE = 'CRITIQUE'
}

// Template pour l'upload de balance
export interface TemplateBalance {
  id: string;
  nom: string;
  description: string;
  
  // Structure du template
  colonnes: ColonneTemplate[];
  
  // Format de fichier
  formatsFichierSupporte: string[];
  
  // Exemple de données
  exempleData: any[][];
  
  // Instructions
  instructions: string[];
  
  // Métadonnées
  actif: boolean;
  dateCreation: string;
  creeParUserId: string;
}

export interface ColonneTemplate {
  nom: string;
  libelle: string;
  type: 'text' | 'number' | 'compte';
  obligatoire: boolean;
  ordre: number;
  exemple?: string;
  validation?: ValidationColonne;
}

export interface ValidationColonne {
  min?: number;
  max?: number;
  regex?: string;
  longueurMin?: number;
  longueurMax?: number;
}

// Configuration d'entreprise pour les balances
export interface ConfigurationBalanceEntreprise {
  id: string;
  entrepriseId: string;
  
  // Paramètres généraux
  exerciceEnCours: string;
  exercicePrecedent: string;
  dateDebutExercice: string;
  dateFinExercice: string;
  
  // Configuration RAN
  journalReportNouveau: string;   // Journal pour les écritures RAN
  compteResultatReporte: string;  // Compte de résultat reporté (ex: 110000)
  
  // Paramètres de validation
  validationObligatoire: boolean;
  seuilAnomalieBloquante: NiveauAnomalieBalance;
  
  // Templates autorisés
  templatesAutorises: string[];
  
  // Automatisation
  generationRANAutomatique: boolean;
  comptabilisationRANAutomatique: boolean;
  
  // Notifications
  notifierAnomalies: boolean;
  notifierValidation: boolean;
  
  dateCreation: string;
  dateMiseAJour: string;
}

// Historique des balances
export interface HistoriqueBalance {
  id: string;
  entrepriseId: string;
  exercice: string;
  
  balances: BalanceN1[];
  reportNouveau?: ReportNouveau;
  
  statut: 'EN_COURS' | 'TERMINE' | 'ARCHIVE';
  dateCreation: string;
  dateFinalisation?: string;
}

// Statistiques des balances
export interface StatistiquesBalance {
  entrepriseId: string;
  
  // Globales
  nombreBalancesCreees: number;
  nombreBalancesValidees: number;
  nombreRANGeneres: number;
  
  // Par exercice
  statistiquesParExercice: StatistiqueExercice[];
  
  // Qualité des données
  tauxAnomalies: number;
  tauxResolutionAnomalies: number;
  
  // Performance
  tempsTraitementMoyen: number;   // En secondes
  
  dateCalcul: string;
}

export interface StatistiqueExercice {
  exercice: string;
  nombreComptes: number;
  totalActif: number;
  totalPassif: number;
  resultatExercice: number;
  dateCreation: string;
  statut: string;
}

// Utilitaires et constantes
export const CLASSES_COMPTES_BILAN = ['1', '2', '3', '4', '5'];
export const CLASSES_COMPTES_GESTION = ['6', '7'];
export const CLASSES_COMPTES_RESULTAT = ['8'];

export const TEMPLATE_BALANCE_STANDARD: TemplateBalance = {
  id: 'standard_6_colonnes',
  nom: 'Balance Standard 6 Colonnes',
  description: 'Template standard pour balance à 6 colonnes conforme SYSCOHADA',
  colonnes: [
    {
      nom: 'numeroCompte',
      libelle: 'N° Compte',
      type: 'compte',
      obligatoire: true,
      ordre: 1,
      exemple: '101000',
      validation: {
        longueurMin: 6,
        longueurMax: 8,
        regex: '^[1-8][0-9]{5,7}$'
      }
    },
    {
      nom: 'intituleCompte',
      libelle: 'Intitulé du Compte',
      type: 'text',
      obligatoire: true,
      ordre: 2,
      exemple: 'Capital social',
      validation: {
        longueurMin: 3,
        longueurMax: 100
      }
    },
    {
      nom: 'soldeDebitOuverture',
      libelle: 'Solde Débit Ouverture',
      type: 'number',
      obligatoire: false,
      ordre: 3,
      exemple: '1000000'
    },
    {
      nom: 'soldeCreditOuverture',
      libelle: 'Solde Crédit Ouverture',
      type: 'number',
      obligatoire: false,
      ordre: 4,
      exemple: '1000000'
    },
    {
      nom: 'mouvementDebit',
      libelle: 'Mouvement Débit',
      type: 'number',
      obligatoire: false,
      ordre: 5,
      exemple: '500000'
    },
    {
      nom: 'mouvementCredit',
      libelle: 'Mouvement Crédit',
      type: 'number',
      obligatoire: false,
      ordre: 6,
      exemple: '300000'
    },
    {
      nom: 'soldeDebitFinal',
      libelle: 'Solde Débit Final',
      type: 'number',
      obligatoire: false,
      ordre: 7,
      exemple: '1200000'
    },
    {
      nom: 'soldeCreditFinal',
      libelle: 'Solde Crédit Final',
      type: 'number',
      obligatoire: false,
      ordre: 8,
      exemple: '1200000'
    }
  ],
  formatsFichierSupporte: ['xlsx', 'xls', 'csv'],
  exempleData: [
    ['N° Compte', 'Intitulé', 'Solde Débit Ouv.', 'Solde Crédit Ouv.', 'Mvt Débit', 'Mvt Crédit', 'Solde Débit Final', 'Solde Crédit Final'],
    ['101000', 'Capital social', 0, 1000000, 0, 0, 0, 1000000],
    ['401100', 'Fournisseurs', 0, 500000, 200000, 300000, 0, 600000],
    ['411100', 'Clients', 800000, 0, 400000, 300000, 900000, 0]
  ],
  instructions: [
    'Utilisez la première ligne pour les en-têtes',
    'Les numéros de compte doivent respecter le plan SYSCOHADA',
    'Les montants doivent être en valeur absolue',
    'Vérifiez l\'équilibre de chaque ligne',
    'Les colonnes vides sont autorisées (valeur 0)'
  ],
  actif: true,
  dateCreation: new Date().toISOString(),
  creeParUserId: 'system'
};

// Fonctions utilitaires pour les calculs
export interface CalculsBalanceUtils {
  // Vérifications d'équilibre
  verifierEquilibreColonnes(ligne: LigneBalanceN1): boolean;
  verifierCoherenceCalcul(ligne: LigneBalanceN1): boolean;
  calculerTotauxControle(lignes: LigneBalanceN1[]): TotauxControleBalance;
  
  // Génération RAN
  genererReportNouveau(balance: BalanceN1): ReportNouveau;
  calculerEcrituresRAN(lignes: LigneBalanceN1[]): EcritureReportNouveau[];
  
  // Détection d'anomalies
  detecterAnomalies(balance: BalanceN1): AnomalieBalance[];
  
  // Classification des comptes
  determinerTypeCompte(numeroCompte: string): TypeCompteBalance;
  determinerClasseCompte(numeroCompte: string): string;
}

// Interface pour les résultats d'import
export interface ResultatImportBalance {
  succes: boolean;
  balanceId?: string;
  
  // Statistiques d'import
  lignesTraitees: number;
  lignesImportees: number;
  lignesIgnorees: number;
  erreursRencontrees: string[];
  
  // Anomalies détectées
  anomalies: AnomalieBalance[];
  
  // Report à nouveau généré
  reportNouveauGenere: boolean;
  reportNouveauId?: string;
  
  // Temps de traitement
  tempsTraitement: number;
  
  // Recommandations
  recommandations: string[];
}