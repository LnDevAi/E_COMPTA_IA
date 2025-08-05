export interface Entreprise {
  id?: string;
  
  // Informations de base
  raisonSociale: string;
  sigle?: string;
  formeJuridique: string;
  secteurActivite: string;
  
  // Localisation et système comptable
  pays: string;
  ville: string;
  adresseComplete: string;
  systemeComptable: SystemeComptable;
  specificitesFiscales: SpecificitesFiscales; // NOUVEAU
  specificitesSociales: SpecificitesSociales; // NOUVEAU
  
  // Informations légales
  numeroRegistreCommerce?: string;
  numeroIFU?: string; // Identifiant Fiscal Unique
  numeroSocial?: string;
  dateCreation: Date;
  capitalSocial?: number;
  
  // Informations fiscales
  regimeFiscal: RegimeFiscal;
  numeroTVA?: string;
  exerciceComptable: ExerciceComptable;
  
  // Coordonnées
  telephone?: string;
  email?: string;
  siteWeb?: string;
  
  // Documents
  documentsOfficiels: DocumentOfficiel[];
  
  // Paramètres SYSCOHADA/Autres
  monnaie: string; // FCFA, EUR, USD, etc.
  tauxTVA: number;
  
  // Métadonnées
  dateCreationDossier: Date;
  derniereModification: Date;
  statut: StatutEntreprise;
  validationIA?: ValidationIA;
}

export interface SystemeComptable {
  nom: string; // SYSCOHADA_AUDCIF, IFRS, US_GAAP, FRANCE_PCG, etc.
  version: string;
  dateApplication: Date;
  caracteristiques: string[];
  espaceGeographique: 'OHADA' | 'IFRS' | 'US_GAAP' | 'FRANCE' | 'AUTRE'; // NOUVEAU
}

// NOUVEAU : Spécificités fiscales par pays
export interface SpecificitesFiscales {
  paysCode: string;
  paysNom: string;
  regimesTVA: RegimeTVA[];
  tauxTVAStandard: number;
  tauxTVAReduit?: number[];
  declarationsTVA: FrequenceDeclaration[];
  impotSocietes: ImpotSocietes;
  autresImpots: AutreImpot[];
  calendrierFiscal: EcheanceFiscale[];
}

// NOUVEAU : Spécificités sociales par pays  
export interface SpecificitesSociales {
  paysCode: string;
  paysNom: string;
  organismesSecurite: OrganismeSecurite[];
  cotisationsSociales: CotisationSociale[];
  declarationsSociales: FrequenceDeclaration[];
  calendrierSocial: EcheanceSociale[];
}

export interface RegimeTVA {
  nom: string;
  seuilCA?: number;
  taux: number;
  description: string;
}

export interface FrequenceDeclaration {
  type: 'MENSUEL' | 'TRIMESTRIEL' | 'ANNUEL';
  echeance: string; // "15 du mois suivant", "fin janvier", etc.
  obligatoire: boolean;
}

export interface ImpotSocietes {
  taux: number;
  seuilExoneration?: number;
  acomptes: boolean;
  echeances: string[];
}

export interface AutreImpot {
  nom: string;
  type: 'FORFAITAIRE' | 'PROPORTIONNEL';
  taux?: number;
  montantFixe?: number;
  assiette: string;
}

export interface EcheanceFiscale {
  nom: string;
  date: string; // Format "15/01", "31/03", etc.
  type: 'TVA' | 'IS' | 'AUTRE';
  obligatoire: boolean;
}

export interface OrganismeSecurite {
  nom: string;
  acronyme: string;
  typesCotisations: string[];
}

export interface CotisationSociale {
  nom: string;
  tauxEmployeur: number;
  tauxEmploye: number;
  plafond?: number;
  assiette: string;
}

export interface EcheanceSociale {
  nom: string;
  date: string;
  organisme: string;
  obligatoire: boolean;
}

export interface RegimeFiscal {
  type: 'REEL_NORMAL' | 'REEL_SIMPLIFIE' | 'SYNTHETIQUE' | 'MICRO_ENTREPRISE';
  description: string;
  seuilCA?: number;
  obligationsComptables: string[];
  specificitesPays: any; // Spécificités du régime selon le pays
}

export interface ExerciceComptable {
  dateDebut: Date;
  dateFin: Date;
  dureeEnMois: number;
  statut: 'EN_COURS' | 'CLOTURE' | 'EN_PREPARATION';
}

export interface DocumentOfficiel {
  id: string;
  type: TypeDocument;
  nom: string;
  numeroDocument: string;
  dateEmission: Date;
  dateExpiration?: Date;
  fichier: File | string;
  statutValidation: StatutValidation;
  remarquesIA?: string[];
}

export enum TypeDocument {
  REGISTRE_COMMERCE = 'REGISTRE_COMMERCE',
  IFU = 'IFU',
  NUMERO_SOCIAL = 'NUMERO_SOCIAL',
  STATUTS = 'STATUTS',
  PROCES_VERBAL = 'PROCES_VERBAL',
  ATTESTATION_FISCALE = 'ATTESTATION_FISCALE'
}

export enum StatutValidation {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE',
  VERIFICATION_MANUELLE = 'VERIFICATION_MANUELLE'
}

export enum StatutEntreprise {
  NOUVEAU = 'NOUVEAU',
  EN_COURS_VALIDATION = 'EN_COURS_VALIDATION',
  VALIDE = 'VALIDE',
  INCOMPLET = 'INCOMPLET',
  SUSPENDU = 'SUSPENDU'
}

export interface ValidationIA {
  score: number; // 0-100
  controles: ControleIA[];
  recommandations: string[];
  dateValidation: Date;
}

export interface ControleIA {
  type: string;
  resultat: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION';
  message: string;
  details?: any;
}

// DONNÉES CORRIGÉES : Tous pays OHADA = même système comptable AUDCIF
export const PAYS_OHADA = [
  { 
    code: 'BJ', nom: 'Bénin', monnaie: 'XOF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'UEMOA',
    fiscaliteSpecifique: 'BENIN_FISCAL'
  },
  { 
    code: 'BF', nom: 'Burkina Faso', monnaie: 'XOF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'UEMOA',
    fiscaliteSpecifique: 'BURKINA_FISCAL'
  },
  { 
    code: 'CI', nom: 'Côte d\'Ivoire', monnaie: 'XOF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'UEMOA',
    fiscaliteSpecifique: 'COTE_IVOIRE_FISCAL'
  },
  { 
    code: 'GW', nom: 'Guinée-Bissau', monnaie: 'XOF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'UEMOA',
    fiscaliteSpecifique: 'GUINEE_BISSAU_FISCAL'
  },
  { 
    code: 'ML', nom: 'Mali', monnaie: 'XOF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'UEMOA',
    fiscaliteSpecifique: 'MALI_FISCAL'
  },
  { 
    code: 'NE', nom: 'Niger', monnaie: 'XOF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'UEMOA',
    fiscaliteSpecifique: 'NIGER_FISCAL'
  },
  { 
    code: 'SN', nom: 'Sénégal', monnaie: 'XOF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'UEMOA',
    fiscaliteSpecifique: 'SENEGAL_FISCAL'
  },
  { 
    code: 'TG', nom: 'Togo', monnaie: 'XOF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'UEMOA',
    fiscaliteSpecifique: 'TOGO_FISCAL'
  },
  { 
    code: 'CM', nom: 'Cameroun', monnaie: 'XAF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'CEMAC',
    fiscaliteSpecifique: 'CAMEROUN_FISCAL'
  },
  { 
    code: 'CF', nom: 'République Centrafricaine', monnaie: 'XAF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'CEMAC',
    fiscaliteSpecifique: 'CENTRAFRIQUE_FISCAL'
  },
  { 
    code: 'TD', nom: 'Tchad', monnaie: 'XAF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'CEMAC',
    fiscaliteSpecifique: 'TCHAD_FISCAL'
  },
  { 
    code: 'CG', nom: 'Congo', monnaie: 'XAF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'CEMAC',
    fiscaliteSpecifique: 'CONGO_FISCAL'
  },
  { 
    code: 'GA', nom: 'Gabon', monnaie: 'XAF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'CEMAC',
    fiscaliteSpecifique: 'GABON_FISCAL'
  },
  { 
    code: 'GQ', nom: 'Guinée Équatoriale', monnaie: 'XAF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'CEMAC',
    fiscaliteSpecifique: 'GUINEE_EQ_FISCAL'
  },
  { 
    code: 'KM', nom: 'Comores', monnaie: 'KMF', 
    systemeComptable: 'SYSCOHADA_AUDCIF',
    unionMonetaire: 'INDEPENDANT',
    fiscaliteSpecifique: 'COMORES_FISCAL'
  }
];

// NOUVEAUX PAYS HORS OHADA (exemples)
export const AUTRES_PAYS = [
  {
    code: 'FR', nom: 'France', monnaie: 'EUR',
    systemeComptable: 'PCG_FRANCE',
    fiscaliteSpecifique: 'FRANCE_FISCAL'
  },
  {
    code: 'US', nom: 'États-Unis', monnaie: 'USD',
    systemeComptable: 'US_GAAP',
    fiscaliteSpecifique: 'USA_FISCAL'
  },
  {
    code: 'MA', nom: 'Maroc', monnaie: 'MAD',
    systemeComptable: 'CGNC_MAROC',
    fiscaliteSpecifique: 'MAROC_FISCAL'
  },
  {
    code: 'DZ', nom: 'Algérie', monnaie: 'DZD',
    systemeComptable: 'SCF_ALGERIE',
    fiscaliteSpecifique: 'ALGERIE_FISCAL'
  }
];

export const FORMES_JURIDIQUES = [
  'SARL', 'SA', 'SAS', 'SASU', 'SNC', 'SCS', 'GIE', 'EI', 'EURL', 'SCA'
];

export const SECTEURS_ACTIVITE = [
  'Agriculture', 'Industrie', 'Commerce', 'Services', 'BTP', 'Transport',
  'Télécommunications', 'Banque', 'Assurance', 'Immobilier', 'Tourisme',
  'Santé', 'Éducation', 'Administration', 'Autres'
];