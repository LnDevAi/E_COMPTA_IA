export interface Entreprise {
  // Informations générales
  raisonSociale: string;
  formeJuridique: string;
  numeroIdentification: string;
  dateCreation: Date;
  adresse: AdresseEntreprise;
  contact: ContactEntreprise;
  
  // Informations comptables et réglementaires
  systemeComptable: SystemeComptable;
  exerciceComptable: ExerciceComptable;
  regimeFiscal: RegimeFiscal;
  specificitesFiscales: SpecificitesFiscales;
  specificitesSociales: SpecificitesSociales;
  
  // Validation et conformité
  documentsOfficiel: DocumentOfficiel[];
  validationIA: ValidationEntrepriseIA;
  
  // Métadonnées
  dateCreationProfil: Date;
  derniereModification: Date;
  statut: StatutEntreprise;
}

export interface AdresseEntreprise {
  pays: string;
  continent: string;
  region: string;
  ville: string;
  codePostal: string;
  adresseLigne1: string;
  adresseLigne2?: string;
}

export interface ContactEntreprise {
  telephone: string;
  email: string;
  siteWeb?: string;
  personneContact: string;
  fonctionContact: string;
}

export interface SystemeComptable {
  nom: string;
  referentielDetail: string;
  auditObligatoire: boolean;
  devise: string;
  langue: string;
  espaceGeographique: string;
  particularites: string[];
}

export interface ExerciceComptable {
  dateDebut: Date;
  dateFin: Date;
  dureeEnMois: number;
  premiereAnnee: boolean;
}

export interface RegimeFiscal {
  regime: string;
  numeroTVA?: string;
  centreImpots: string;
}

export interface SpecificitesFiscales {
  tauxIS: number;           // Taux Impôt sur les Sociétés
  tauxTVA: number;          // Taux TVA principal
  baremeIR?: string;        // Barème Impôt sur le Revenu
  autresTaxes: string[];    // Autres taxes importantes
  declarationsTVA: FrequenceDeclaration;
  echeancesFiscales: EcheanceFiscale[];
}

export interface SpecificitesSociales {
  organisme: string;                    // Organisme principal
  cotisationsPatronales: number;        // Pourcentage
  cotisationsSalariales: number;        // Pourcentage
  declarationsSociales: FrequenceDeclaration;
  echeancesSociales: EcheanceSociale[];
  regimesComplementaires?: string[];    // Régimes complémentaires
}

export interface FrequenceDeclaration {
  type: 'Mensuelle' | 'Trimestrielle' | 'Annuelle';
  jourLimite?: number;
  details: string;
}

export interface EcheanceFiscale {
  type: string;
  dateEcheance: Date;
  montantEstime?: number;
}

export interface EcheanceSociale {
  organisme: string;
  type: string;
  dateEcheance: Date;
  montantEstime?: number;
}

export interface DocumentOfficiel {
  type: TypeDocument;
  numero: string;
  dateObtention: Date;
  dateExpiration?: Date;
  fichier?: string;
}

export interface ValidationEntrepriseIA {
  scoreConformite: number;
  pointsVerifies: string[];
  recommandations: string[];
  alertes: string[];
  dernierControle: Date;
}

export enum TypeDocument {
  REGISTRE_COMMERCE = 'Registre du Commerce',
  NUMERO_TVA = 'Numéro TVA',
  ATTESTATION_FISCALE = 'Attestation Fiscale',
  CERTIFICAT_SOCIAL = 'Certificat Social'
}

export enum StatutEntreprise {
  ACTIF = 'Actif',
  SUSPENDU = 'Suspendu',
  EN_CREATION = 'En Création',
  CESSE = 'Cessé'
}

// =====================================================
// DONNÉES MONDIALES DES SYSTÈMES COMPTABLES
// =====================================================

export interface PaysMondial {
  nom: string;
  continent: string;
  region: string;
  devise: string;
  langue: string;
  systemeComptable: SystemeComptableDetail;
  systemeFiscal: SystemeFiscalDetail;
  systemeSocial: SystemeSocialDetail;
  particularites: string;
  statutEconomique: 'Développé' | 'En développement' | 'PMA';
}

export interface SystemeComptableDetail {
  nom: string;
  referentielDetail: string;
  auditObligatoire: boolean;
  caracteristiques: string[];
}

export interface SystemeFiscalDetail {
  tauxIS: number;
  tauxTVA: number;
  baremeIR?: string;
  autresTaxes?: string[];
  particularitesFiscales?: string[];
}

export interface SystemeSocialDetail {
  organisme: string;
  cotisationsPatronales: number;
  cotisationsSalariales: number;
  declarationsSociales: string;
  regimesComplementaires?: string[];
  particularitesSociales?: string[];
}

// =====================================================
// BASE DE DONNÉES MONDIALE COMPLÈTE
// =====================================================

export const PAYS_MONDIAUX: PaysMondial[] = [
  // ZONE OHADA - SYSCOHADA
  {
    nom: 'Bénin',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XOF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Système harmonisé OHADA', 'Comptabilité en français obligatoire', 'Plan comptable unifié']
    },
    systemeFiscal: {
      tauxIS: 30.00,
      tauxTVA: 18.00,
      particularitesFiscales: ['Régime simplifié pour PME', 'Exonérations zones franches']
    },
    systemeSocial: {
      organisme: 'CNSS',
      cotisationsPatronales: 16.40,
      cotisationsSalariales: 3.60,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['Régime unifié CNSS', 'Prestations familiales incluses']
    },
    particularites: 'Système harmonisé OHADA, comptabilité en français obligatoire',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Burkina Faso',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XOF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Système harmonisé OHADA', 'Contribution du secteur informel']
    },
    systemeFiscal: {
      tauxIS: 27.50,
      tauxTVA: 18.00,
      particularitesFiscales: ['Régime du secteur informel', 'Fiscalité minière spécifique']
    },
    systemeSocial: {
      organisme: 'CNSS',
      cotisationsPatronales: 16.75,
      cotisationsSalariales: 5.50,
      declarationsSociales: 'Trimestrielle',
      particularitesSociales: ['Contribution secteur informel', 'Régime agricole spécifique']
    },
    particularites: 'Contribution du secteur informel',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Cameroun',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XAF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Système normal et minimal de trésorerie', 'Bilinguisme français-anglais']
    },
    systemeFiscal: {
      tauxIS: 30.00,
      tauxTVA: 19.25,
      particularitesFiscales: ['Régime zone CEMAC', 'Fiscalité pétrolière']
    },
    systemeSocial: {
      organisme: 'CNPS',
      cotisationsPatronales: 16.20,
      cotisationsSalariales: 4.20,
      declarationsSociales: 'Mensuelle avant le 15',
      particularitesSociales: ['CNPS obligatoire', 'Régime complémentaire volontaire']
    },
    particularites: 'Système normal et système minimal de trésorerie',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Centrafrique',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XAF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Tenue obligatoire des livres comptables', 'Système CEMAC']
    },
    systemeFiscal: {
      tauxIS: 30.00,
      tauxTVA: 19.00,
      particularitesFiscales: ['Régime zone CEMAC', 'Simplifications administratives']
    },
    systemeSocial: {
      organisme: 'ACSS',
      cotisationsPatronales: 16.00,
      cotisationsSalariales: 4.00,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['ACSS - régime de base', 'Couverture limitée']
    },
    particularites: 'Tenue obligatoire des livres comptables',
    statutEconomique: 'PMA'
  },
  {
    nom: 'Comores',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'KMF',
    langue: 'Français/Arabe',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Comptes consolidés pour les groupes', 'Adaptation insulaire']
    },
    systemeFiscal: {
      tauxIS: 35.00,
      tauxTVA: 10.00,
      particularitesFiscales: ['TVA réduite', 'Économie insulaire']
    },
    systemeSocial: {
      organisme: 'CSSC',
      cotisationsPatronales: 15.00,
      cotisationsSalariales: 3.50,
      declarationsSociales: 'Trimestrielle',
      particularitesSociales: ['CSSC - Caisse de Sécurité Sociale des Comores', 'Système en développement']
    },
    particularites: 'Comptes consolidés pour les groupes',
    statutEconomique: 'PMA'
  },
  {
    nom: 'Congo',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XAF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Audit obligatoire selon seuils', 'Système CEMAC']
    },
    systemeFiscal: {
      tauxIS: 30.00,
      tauxTVA: 18.00,
      particularitesFiscales: ['Régime zone CEMAC', 'Fiscalité pétrolière']
    },
    systemeSocial: {
      organisme: 'CNSS',
      cotisationsPatronales: 16.50,
      cotisationsSalariales: 4.00,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['CNSS Congo', 'Prestations sociales de base']
    },
    particularites: 'Audit obligatoire selon seuils',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Côte d\'Ivoire',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XOF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Système selon taille entreprise', 'Leader économique UEMOA']
    },
    systemeFiscal: {
      tauxIS: 25.00,
      tauxTVA: 18.00,
      particularitesFiscales: ['Régime UEMOA', 'Centre financier régional']
    },
    systemeSocial: {
      organisme: 'CNPS',
      cotisationsPatronales: 16.40,
      cotisationsSalariales: 6.30,
      declarationsSociales: 'Mensuelle avant le 10',
      particularitesSociales: ['CNPS - système complet', 'Prestations étendues']
    },
    particularites: 'Système selon taille entreprise',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Gabon',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XAF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Commissariat aux comptes obligatoire selon seuils', 'Économie pétrolière']
    },
    systemeFiscal: {
      tauxIS: 30.00,
      tauxTVA: 18.00,
      particularitesFiscales: ['Régime zone CEMAC', 'Fiscalité pétrolière avancée']
    },
    systemeSocial: {
      organisme: 'CNSS',
      cotisationsPatronales: 20.15,
      cotisationsSalariales: 4.50,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['CNSS Gabon', 'Taux élevés - économie développée']
    },
    particularites: 'Commissariat aux comptes obligatoire selon seuils',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Guinée',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'GNF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Tenue en langue française obligatoire', 'Économie minière']
    },
    systemeFiscal: {
      tauxIS: 35.00,
      tauxTVA: 18.00,
      particularitesFiscales: ['Fiscalité minière spécifique', 'Régime des zones franches']
    },
    systemeSocial: {
      organisme: 'CNSS',
      cotisationsPatronales: 18.00,
      cotisationsSalariales: 5.00,
      declarationsSociales: 'Trimestrielle',
      particularitesSociales: ['CNSS Guinée', 'Système en reconstruction']
    },
    particularites: 'Tenue en langue française obligatoire',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Guinée-Bissau',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XOF',
    langue: 'Portugais',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: false,
      caracteristiques: ['Application progressive des normes', 'Transition lusophone']
    },
    systemeFiscal: {
      tauxIS: 25.00,
      tauxTVA: 17.00,
      particularitesFiscales: ['Transition vers UEMOA', 'Simplifications transitoires']
    },
    systemeSocial: {
      organisme: 'INPS',
      cotisationsPatronales: 7.00,
      cotisationsSalariales: 3.00,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['INPS - système simplifié', 'En cours de développement']
    },
    particularites: 'Application progressive des normes',
    statutEconomique: 'PMA'
  },
  {
    nom: 'Guinée Équatoriale',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XAF',
    langue: 'Espagnol',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Normes adaptées au secteur pétrolier', 'Économie pétrolière dominante']
    },
    systemeFiscal: {
      tauxIS: 35.00,
      tauxTVA: 15.00,
      particularitesFiscales: ['Fiscalité pétrolière complexe', 'Régime zone CEMAC']
    },
    systemeSocial: {
      organisme: 'INSESO',
      cotisationsPatronales: 21.50,
      cotisationsSalariales: 4.50,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['INSESO - système complet', 'Prestations étendues']
    },
    particularites: 'Normes adaptées au secteur pétrolier',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Mali',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XOF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Deux systèmes comptables disponibles', 'Économie agro-minière']
    },
    systemeFiscal: {
      tauxIS: 30.00,
      tauxTVA: 18.00,
      particularitesFiscales: ['Régime UEMOA', 'Fiscalité minière or']
    },
    systemeSocial: {
      organisme: 'INPS',
      cotisationsPatronales: 18.60,
      cotisationsSalariales: 5.40,
      declarationsSociales: 'Mensuelle avant le 10',
      particularitesSociales: ['INPS Mali', 'Système complet de sécurité sociale']
    },
    particularites: 'Deux systèmes comptables disponibles',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Niger',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XOF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Comptes de résultat et bilan obligatoires', 'Économie agro-pastorale']
    },
    systemeFiscal: {
      tauxIS: 30.00,
      tauxTVA: 19.00,
      particularitesFiscales: ['Régime UEMOA', 'Fiscalité uranium']
    },
    systemeSocial: {
      organisme: 'CNSS',
      cotisationsPatronales: 17.80,
      cotisationsSalariales: 1.00,
      declarationsSociales: 'Trimestrielle',
      particularitesSociales: ['CNSS Niger', 'Taux salarié réduit']
    },
    particularites: 'Comptes de résultat et bilan obligatoires',
    statutEconomique: 'PMA'
  },
  {
    nom: 'Sénégal',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XOF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Consolidation obligatoire pour les groupes', 'Hub économique régional']
    },
    systemeFiscal: {
      tauxIS: 30.00,
      tauxTVA: 18.00,
      particularitesFiscales: ['Régime UEMOA', 'Centre financier régional']
    },
    systemeSocial: {
      organisme: 'CSS',
      cotisationsPatronales: 21.70,
      cotisationsSalariales: 5.60,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['CSS - Caisse de Sécurité Sociale', 'Système le plus développé UEMOA']
    },
    particularites: 'Consolidation obligatoire pour les groupes',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Tchad',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XAF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['CAC selon seuils secteur pétrolier spécifique', 'Économie pétrolière']
    },
    systemeFiscal: {
      tauxIS: 40.00,
      tauxTVA: 18.00,
      particularitesFiscales: ['Taux IS le plus élevé OHADA', 'Fiscalité pétrolière']
    },
    systemeSocial: {
      organisme: 'CNSS',
      cotisationsPatronales: 16.50,
      cotisationsSalariales: 3.50,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['CNSS Tchad', 'Système en développement']
    },
    particularites: 'CAC selon seuils secteur pétrolier spécifique',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Togo',
    continent: 'Afrique',
    region: 'OHADA',
    devise: 'XOF',
    langue: 'Français',
    systemeComptable: {
      nom: 'SYSCOHADA',
      referentielDetail: 'Système Comptable OHADA harmonisé',
      auditObligatoire: true,
      caracteristiques: ['Trois systèmes selon taille: normal allégé trésorerie', 'Hub portuaire']
    },
    systemeFiscal: {
      tauxIS: 27.00,
      tauxTVA: 18.00,
      particularitesFiscales: ['Régime UEMOA', 'Zone franche portuaire']
    },
    systemeSocial: {
      organisme: 'CNSS',
      cotisationsPatronales: 16.50,
      cotisationsSalariales: 4.00,
      declarationsSociales: 'Mensuelle avant le 15',
      particularitesSociales: ['CNSS Togo', 'Système standard UEMOA']
    },
    particularites: 'Trois systèmes selon taille: normal allégé trésorerie',
    statutEconomique: 'En développement'
  },

  // PAYS AFRICAINS NON-OHADA
  {
    nom: 'Afrique du Sud',
    continent: 'Afrique',
    region: 'Afrique Australe',
    devise: 'ZAR',
    langue: 'Anglais',
    systemeComptable: {
      nom: 'IFRS',
      referentielDetail: 'International Financial Reporting Standards',
      auditObligatoire: true,
      caracteristiques: ['IFRS complets', 'Système anglo-saxon', 'Marché financier développé']
    },
    systemeFiscal: {
      tauxIS: 27.00,
      tauxTVA: 15.00,
      particularitesFiscales: ['VAT system', 'SARS - administration moderne']
    },
    systemeSocial: {
      organisme: 'SARS',
      cotisationsPatronales: 3.00,
      cotisationsSalariales: 2.00,
      declarationsSociales: 'Mensuelle SARS',
      particularitesSociales: ['UIF: 2%', 'SDL: 1%', 'WC: variable selon secteur']
    },
    particularites: 'UIF: 2% SDL: 1% WC: variable selon secteur',
    statutEconomique: 'Développé'
  },
  {
    nom: 'Algérie',
    continent: 'Afrique',
    region: 'Afrique du Nord',
    devise: 'DZD',
    langue: 'Arabe',
    systemeComptable: {
      nom: 'SCF',
      referentielDetail: 'Système Comptable Financier',
      auditObligatoire: true,
      caracteristiques: ['Inspiré des IFRS', 'Plan comptable national', 'Consolidation obligatoire']
    },
    systemeFiscal: {
      tauxIS: 25.00,
      tauxTVA: 19.00,
      particularitesFiscales: ['Économie dirigée', 'Secteur hydrocarbures dominant']
    },
    systemeSocial: {
      organisme: 'CNAS',
      cotisationsPatronales: 26.00,
      cotisationsSalariales: 9.00,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['CNAS - sécurité sociale', 'Système complet universel']
    },
    particularites: 'Plan de comptes national + consolidation obligatoire',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Maroc',
    continent: 'Afrique',
    region: 'Afrique du Nord',
    devise: 'MAD',
    langue: 'Arabe',
    systemeComptable: {
      nom: 'CGNC',
      referentielDetail: 'Code Général de Normalisation Comptable',
      auditObligatoire: true,
      caracteristiques: ['Loi comptable n°9-88', 'Transition progressive vers IFRS']
    },
    systemeFiscal: {
      tauxIS: 31.00,
      tauxTVA: 20.00,
      particularitesFiscales: ['Système fiscal moderne', 'Zones franches développées']
    },
    systemeSocial: {
      organisme: 'CNSS',
      cotisationsPatronales: 20.48,
      cotisationsSalariales: 4.48,
      declarationsSociales: 'DAMANCOM mensuelle',
      particularitesSociales: ['CNSS moderne', 'AMO - couverture médicale']
    },
    particularites: 'Loi comptable n°9-88 transition progressive vers IFRS',
    statutEconomique: 'En développement'
  },

  // PAYS EUROPÉENS
  {
    nom: 'France',
    continent: 'Europe',
    region: 'Europe de l\'Ouest',
    devise: 'EUR',
    langue: 'Français',
    systemeComptable: {
      nom: 'PCG',
      referentielDetail: 'Plan Comptable Général',
      auditObligatoire: true,
      caracteristiques: ['ANC oversight', 'Régimes complémentaires complexes', 'Normes françaises + IFRS']
    },
    systemeFiscal: {
      tauxIS: 25.00,
      tauxTVA: 20.00,
      particularitesFiscales: ['Système fiscal complexe', 'Multiples taux TVA']
    },
    systemeSocial: {
      organisme: 'URSSAF',
      cotisationsPatronales: 45.00,
      cotisationsSalariales: 23.00,
      declarationsSociales: 'Mensuelle DSN',
      particularitesSociales: ['Système le plus complet au monde', 'DSN - déclaration sociale nominative']
    },
    particularites: 'ANC oversight régimes complémentaires complexes',
    statutEconomique: 'Développé'
  },
  {
    nom: 'Allemagne',
    continent: 'Europe',
    region: 'Europe de l\'Ouest',
    devise: 'EUR',
    langue: 'Allemand',
    systemeComptable: {
      nom: 'HGB/IFRS',
      referentielDetail: 'Handelsgesetzbuch / IFRS pour groupes',
      auditObligatoire: true,
      caracteristiques: ['Double système HGB/IFRS', 'Principe de prudence']
    },
    systemeFiscal: {
      tauxIS: 30.00,
      tauxTVA: 19.00,
      particularitesFiscales: ['Taxe commerciale locale', 'Système fédéral']
    },
    systemeSocial: {
      organisme: 'Multiple',
      cotisationsPatronales: 21.00,
      cotisationsSalariales: 21.00,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['Système d\'assurance sociale complexe: 42% total', '4 piliers sociaux']
    },
    particularites: 'Système d\'assurance sociale complexe: 42% total',
    statutEconomique: 'Développé'
  },
  {
    nom: 'Royaume-Uni',
    continent: 'Europe',
    region: 'Europe de l\'Ouest',
    devise: 'GBP',
    langue: 'Anglais',
    systemeComptable: {
      nom: 'UK-GAAP/IFRS',
      referentielDetail: 'UK Generally Accepted Accounting Principles / IFRS',
      auditObligatoire: true,
      caracteristiques: ['Système anglo-saxon', 'Post-Brexit adaptations']
    },
    systemeFiscal: {
      tauxIS: 25.00,
      tauxTVA: 20.00,
      particularitesFiscales: ['Corporation Tax', 'VAT system', 'HMRC modernisé']
    },
    systemeSocial: {
      organisme: 'HMRC',
      cotisationsPatronales: 13.80,
      cotisationsSalariales: 12.00,
      declarationsSociales: 'RTI mensuelle',
      particularitesSociales: ['National Insurance', 'Real Time Information']
    },
    particularites: 'National Insurance Class 1 employeur: 13.8%',
    statutEconomique: 'Développé'
  },

  // PAYS AMÉRICAINS
  {
    nom: 'États-Unis',
    continent: 'Amérique du Nord',
    region: 'Amérique du Nord',
    devise: 'USD',
    langue: 'Anglais',
    systemeComptable: {
      nom: 'US-GAAP',
      referentielDetail: 'United States Generally Accepted Accounting Principles',
      auditObligatoire: true,
      caracteristiques: ['FASB oversight', 'SEC regulations', 'Sarbanes-Oxley Act']
    },
    systemeFiscal: {
      tauxIS: 21.00,
      tauxTVA: 0.00,
      particularitesFiscales: ['Pas de TVA fédérale', 'Sales Tax par état', 'IRS - système fédéral']
    },
    systemeSocial: {
      organisme: 'IRS',
      cotisationsPatronales: 15.30,
      cotisationsSalariales: 7.65,
      declarationsSociales: 'Trimestrielle',
      particularitesSociales: ['Social Security: 12.4%', 'Medicare: 2.9%', 'FUTA: 6%']
    },
    particularites: 'Social Security: 12.4% Medicare: 2.9% FUTA: 6%',
    statutEconomique: 'Développé'
  },
  {
    nom: 'Canada',
    continent: 'Amérique du Nord',
    region: 'Amérique du Nord',
    devise: 'CAD',
    langue: 'Anglais/Français',
    systemeComptable: {
      nom: 'IFRS/ASPE',
      referentielDetail: 'IFRS pour entreprises publiques / ASPE pour privées',
      auditObligatoire: true,
      caracteristiques: ['Double système IFRS/ASPE', 'Bilinguisme obligatoire']
    },
    systemeFiscal: {
      tauxIS: 15.00,
      tauxTVA: 5.00,
      particularitesFiscales: ['GST fédérale + PST provinciale', 'Système bicaméral']
    },
    systemeSocial: {
      organisme: 'ARC',
      cotisationsPatronales: 8.51,
      cotisationsSalariales: 8.51,
      declarationsSociales: 'Mensuelle ARC',
      particularitesSociales: ['RPC: 5.95%', 'AE: 2.56%', 'Taux variables par province']
    },
    particularites: 'RPC: 5.95% AE: 2.56% taux variables par province',
    statutEconomique: 'Développé'
  },
  {
    nom: 'Brésil',
    continent: 'Amérique du Sud',
    region: 'Amérique du Sud',
    devise: 'BRL',
    langue: 'Portugais',
    systemeComptable: {
      nom: 'BR-GAAP',
      referentielDetail: 'Brazilian Generally Accepted Accounting Principles',
      auditObligatoire: true,
      caracteristiques: ['CPC - standards convergents IFRS', 'SPED - système digital']
    },
    systemeFiscal: {
      tauxIS: 25.00,
      tauxTVA: 0.00,
      particularitesFiscales: ['ICMS par état', 'Système fiscal complexe', 'Multiples taxes']
    },
    systemeSocial: {
      organisme: 'INSS',
      cotisationsPatronales: 20.00,
      cotisationsSalariales: 8.00,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['FGTS: 8%', 'Diverses contributions (SESI SENAI etc.)']
    },
    particularites: 'FGTS: 8% diverses contributions (SESI SENAI etc.)',
    statutEconomique: 'En développement'
  },

  // PAYS ASIATIQUES
  {
    nom: 'Chine',
    continent: 'Asie',
    region: 'Asie de l\'Est',
    devise: 'CNY',
    langue: 'Chinois',
    systemeComptable: {
      nom: 'CAS',
      referentielDetail: 'Chinese Accounting Standards',
      auditObligatoire: true,
      caracteristiques: ['Convergence progressive vers IFRS', 'Système socialiste de marché']
    },
    systemeFiscal: {
      tauxIS: 25.00,
      tauxTVA: 13.00,
      particularitesFiscales: ['VAT réformée', 'Zones économiques spéciales']
    },
    systemeSocial: {
      organisme: 'Multiple',
      cotisationsPatronales: 37.00,
      cotisationsSalariales: 22.00,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['Système des 5 assurances + 1 fonds', 'Hukou system']
    },
    particularites: 'Système des 5 assurances + 1 fonds',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Japon',
    continent: 'Asie',
    region: 'Asie de l\'Est',
    devise: 'JPY',
    langue: 'Japonais',
    systemeComptable: {
      nom: 'J-GAAP/IFRS',
      referentielDetail: 'Japanese GAAP / IFRS pour groupes internationaux',
      auditObligatoire: true,
      caracteristiques: ['Double système', 'Conservatisme japonais']
    },
    systemeFiscal: {
      tauxIS: 23.20,
      tauxTVA: 10.00,
      particularitesFiscales: ['Système fiscal complexe', 'Multiples taxes locales']
    },
    systemeSocial: {
      organisme: 'Multiple',
      cotisationsPatronales: 15.00,
      cotisationsSalariales: 15.00,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['Système d\'assurances complexe et stratifié', 'Vieillissement population']
    },
    particularites: 'Système d\'assurances complexe et stratifié',
    statutEconomique: 'Développé'
  },
  {
    nom: 'Inde',
    continent: 'Asie',
    region: 'Asie du Sud',
    devise: 'INR',
    langue: 'Hindi/Anglais',
    systemeComptable: {
      nom: 'Ind-AS',
      referentielDetail: 'Indian Accounting Standards (convergent IFRS)',
      auditObligatoire: true,
      caracteristiques: ['Convergence IFRS', 'Système en transition']
    },
    systemeFiscal: {
      tauxIS: 30.00,
      tauxTVA: 18.00,
      particularitesFiscales: ['GST unifié', 'Système digitalisé moderne']
    },
    systemeSocial: {
      organisme: 'EPFO',
      cotisationsPatronales: 12.00,
      cotisationsSalariales: 12.00,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['PF: 12%', 'ESI: 3.25% pour salaires < 21000']
    },
    particularites: 'PF: 12% ESI: 3.25% pour salaires < 21000',
    statutEconomique: 'En développement'
  },
  {
    nom: 'Singapour',
    continent: 'Asie',
    region: 'Asie du Sud-Est',
    devise: 'SGD',
    langue: 'Anglais',
    systemeComptable: {
      nom: 'SFRS(I)',
      referentielDetail: 'Singapore Financial Reporting Standards (International)',
      auditObligatoire: true,
      caracteristiques: ['Identique aux IFRS', 'Hub financier asiatique']
    },
    systemeFiscal: {
      tauxIS: 17.00,
      tauxTVA: 7.00,
      particularitesFiscales: ['Système attractif', 'Hub fiscal régional']
    },
    systemeSocial: {
      organisme: 'CPF',
      cotisationsPatronales: 17.00,
      cotisationsSalariales: 20.00,
      declarationsSociales: 'Mensuelle',
      particularitesSociales: ['CPF rates vary by age and salary level', 'Système de retraite obligatoire']
    },
    particularites: 'CPF rates vary by age and salary level',
    statutEconomique: 'Développé'
  }
];

// =====================================================
// DONNÉES DE RÉFÉRENCE POUR SÉLECTION
// =====================================================

export const CONTINENTS = [
  'Afrique',
  'Europe', 
  'Amérique du Nord',
  'Amérique du Sud',
  'Asie',
  'Océanie'
];

export const REGIONS_OHADA = [
  'OHADA'
];

export const SYSTEMES_COMPTABLES_PRINCIPAUX = [
  'SYSCOHADA',
  'IFRS',
  'US-GAAP',
  'PCG',
  'UK-GAAP',
  'HGB',
  'CGNC',
  'SCF',
  'BR-GAAP',
  'CAS',
  'J-GAAP',
  'Ind-AS',
  'SFRS(I)'
];

export const DEVISES_PRINCIPALES = [
  'XOF', 'XAF', 'EUR', 'USD', 'GBP', 'CAD', 'CNY', 'JPY', 'INR', 'SGD',
  'MAD', 'DZD', 'ZAR', 'GHS', 'KES', 'NGN', 'EGP', 'TND', 'CLP', 'BRL', 'ARS'
];

// =====================================================
// HELPERS POUR RECHERCHE ET FILTRAGE
// =====================================================

export function getPaysByRegion(region: string): PaysMondial[] {
  return PAYS_MONDIAUX.filter(pays => pays.region === region);
}

export function getPaysBySystemeComptable(systeme: string): PaysMondial[] {
  return PAYS_MONDIAUX.filter(pays => pays.systemeComptable.nom === systeme);
}

export function getPaysByContinent(continent: string): PaysMondial[] {
  return PAYS_MONDIAUX.filter(pays => pays.continent === continent);
}

export function getPaysByDevise(devise: string): PaysMondial[] {
  return PAYS_MONDIAUX.filter(pays => pays.devise === devise);
}

export function getPaysByStatutEconomique(statut: 'Développé' | 'En développement' | 'PMA'): PaysMondial[] {
  return PAYS_MONDIAUX.filter(pays => pays.statutEconomique === statut);
}

export function getPaysByLangue(langue: string): PaysMondial[] {
  return PAYS_MONDIAUX.filter(pays => pays.langue.includes(langue));
}

// =====================================================
// UTILITAIRES POUR L'INTERFACE
// =====================================================

export function getStatistiquesMondialesComptabilite() {
  return {
    totalPays: PAYS_MONDIAUX.length,
    paysOHADA: getPaysBySystemeComptable('SYSCOHADA').length,
    paysIFRS: getPaysBySystemeComptable('IFRS').length,
    systemesComptables: [...new Set(PAYS_MONDIAUX.map(p => p.systemeComptable.nom))].length,
    continents: [...new Set(PAYS_MONDIAUX.map(p => p.continent))].length,
    devises: [...new Set(PAYS_MONDIAUX.map(p => p.devise))].length
  };
}