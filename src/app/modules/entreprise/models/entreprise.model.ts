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
  
  // Paramètres SYSCOHADA
  monnaie: string; // FCFA, EUR, USD
  tauxTVA: number;
  
  // Métadonnées
  dateCreationDossier: Date;
  derniereModification: Date;
  statut: StatutEntreprise;
  validationIA?: ValidationIA;
}

export interface SystemeComptable {
  nom: string; // SYSCOHADA_AUDCIF, IFRS, US_GAAP, etc.
  version: string;
  dateApplication: Date;
  caracteristiques: string[];
}

export interface RegimeFiscal {
  type: 'REEL_NORMAL' | 'REEL_SIMPLIFIE' | 'SYNTHETIQUE' | 'MICRO_ENTREPRISE';
  description: string;
  seuilCA?: number;
  obligationsComptables: string[];
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

// Données de référence SYSCOHADA
export const PAYS_SYSCOHADA = [
  { code: 'BJ', nom: 'Bénin', monnaie: 'XOF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'BF', nom: 'Burkina Faso', monnaie: 'XOF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'CI', nom: 'Côte d\'Ivoire', monnaie: 'XOF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'GW', nom: 'Guinée-Bissau', monnaie: 'XOF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'ML', nom: 'Mali', monnaie: 'XOF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'NE', nom: 'Niger', monnaie: 'XOF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'SN', nom: 'Sénégal', monnaie: 'XOF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'TG', nom: 'Togo', monnaie: 'XOF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'CM', nom: 'Cameroun', monnaie: 'XAF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'CF', nom: 'République Centrafricaine', monnaie: 'XAF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'TD', nom: 'Tchad', monnaie: 'XAF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'CG', nom: 'Congo', monnaie: 'XAF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'GA', nom: 'Gabon', monnaie: 'XAF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'GQ', nom: 'Guinée Équatoriale', monnaie: 'XAF', systeme: 'SYSCOHADA_AUDCIF' },
  { code: 'KM', nom: 'Comores', monnaie: 'KMF', systeme: 'SYSCOHADA_AUDCIF' }
];

export const FORMES_JURIDIQUES = [
  'SARL', 'SA', 'SAS', 'SASU', 'SNC', 'SCS', 'GIE', 'EI', 'EURL', 'SCA'
];

export const SECTEURS_ACTIVITE = [
  'Agriculture', 'Industrie', 'Commerce', 'Services', 'BTP', 'Transport',
  'Télécommunications', 'Banque', 'Assurance', 'Immobilier', 'Tourisme',
  'Santé', 'Éducation', 'Administration', 'Autres'
];