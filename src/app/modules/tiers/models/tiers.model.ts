export interface Tiers {
  id?: string;
  
  // Informations de base
  code: string; // Code unique (C001, F001, etc.)
  raisonSociale: string;
  nom?: string; // Pour les particuliers
  prenom?: string; // Pour les particuliers
  sigle?: string;
  
  // Classification
  typeTiers: TypeTiers;
  categorieTiers: CategorieTiers;
  natureTiers: NatureTiers;
  
  // Informations légales
  formeJuridique?: string;
  numeroRegistreCommerce?: string;
  numeroIFU?: string;
  numeroTVA?: string;
  
  // Localisation
  pays: string;
  ville: string;
  adresseComplete: string;
  codePostal?: string;
  region?: string;
  
  // Coordonnées
  telephone?: string;
  mobile?: string;
  email?: string;
  siteWeb?: string;
  
  // Contact principal
  contactPrincipal?: ContactTiers;
  contacts?: ContactTiers[];
  
  // Informations comptables
  compteComptable: string; // 411001, 401001, etc.
  compteComptableAuxiliaire?: string;
  modePaiementPrefere?: ModePaiement;
  delaiPaiement?: number; // En jours
  plafondCredit?: number;
  
  // Informations bancaires
  informationsBancaires?: InformationBancaire[];
  
  // Scoring et évaluation
  scoring?: ScoringTiers;
  evaluation?: EvaluationTiers;
  
  // Historique et statistiques
  statistiques?: StatistiquesTiers;
  historiquePaiements?: HistoriquePaiement[];
  
  // Paramètres commerciaux
  tauxRemise?: number;
  conditionsSpeciales?: string;
  territoireCommercial?: string;
  representantCommercial?: string;
  
  // Gestion des relances
  parametresRelance?: ParametresRelance;
  historiqueRelances?: HistoriqueRelance[];
  
  // Documents et pièces jointes
  documents?: DocumentTiers[];
  
  // Métadonnées
  dateCreation: Date;
  derniereModification: Date;
  creePar: string;
  statut: StatutTiers;
  
  // Validation et conformité
  validationIA?: ValidationTiersIA;
  conformiteReglementaire?: ConformiteReglementaire;
  
  // Notes et observations
  notes?: string;
  observations?: ObservationTiers[];
}

export interface ContactTiers {
  id?: string;
  tiersId: string;
  civilite: 'M' | 'Mme' | 'Mlle' | 'Dr' | 'Pr';
  nom: string;
  prenom: string;
  fonction: string;
  telephone?: string;
  mobile?: string;
  email?: string;
  principal: boolean;
  actif: boolean;
  dateCreation: Date;
}

export interface InformationBancaire {
  id?: string;
  banque: string;
  agence?: string;
  numeroCompte: string;
  codeSwift?: string;
  iban?: string;
  titulaire: string;
  devise: string;
  principale: boolean;
  active: boolean;
  dateValidation?: Date;
}

export interface ScoringTiers {
  scoreGlobal: number; // 0-1000
  scorePaiement: number; // 0-100
  scoreStabilite: number; // 0-100
  scoreVolume: number; // 0-100
  scoreRentabilite: number; // 0-100
  
  // Détails scoring
  indicateurs: IndicateurScoring[];
  evolution: EvolutionScoring[];
  
  // Classification risque
  classeRisque: ClasseRisque;
  probabiliteDefaut: number; // 0-100%
  
  // Recommandations
  recommandations: RecommandationScoring[];
  
  dateCalcul: Date;
  prochainRecalcul: Date;
}

export interface IndicateurScoring {
  nom: string;
  valeur: number;
  poids: number;
  evolution: 'HAUSSE' | 'BAISSE' | 'STABLE';
  commentaire?: string;
}

export interface EvolutionScoring {
  date: Date;
  score: number;
  evenement?: string;
}

export interface RecommandationScoring {
  type: TypeRecommandation;
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE';
  titre: string;
  description: string;
  actionRecommandee: string;
  impactAttendu: string;
}

export interface EvaluationTiers {
  noteGlobale: number; // 1-5 étoiles
  criteresEvaluation: CritereEvaluation[];
  commentaireEvaluation?: string;
  evaluePar: string;
  dateEvaluation: Date;
  prochainEvaluation?: Date;
}

export interface CritereEvaluation {
  critere: string;
  note: number; // 1-5
  poids: number;
  commentaire?: string;
}

export interface StatistiquesTiers {
  // Volumes
  chiffreAffairesTotal: number;
  chiffreAffairesAnnuel: number;
  nombreFactures: number;
  panierMoyen: number;
  
  // Paiements
  delaiMoyenPaiement: number;
  tauxRetard: number;
  montantEnCours: number;
  montantEchu: number;
  
  // Activité
  derniereTransaction: Date;
  frequenceCommandes: number;
  saisonnalite?: string;
  
  // Évolution
  evolutionCA: number; // %
  evolutionVolume: number; // %
  tendance: 'CROISSANCE' | 'STABILITE' | 'DECLIN';
  
  // Calculs
  dateCalcul: Date;
  periodeAnalyse: string;
}

export interface HistoriquePaiement {
  id: string;
  factureId: string;
  numeroFacture: string;
  montantFacture: number;
  montantPaye: number;
  dateFacture: Date;
  dateEcheance: Date;
  datePaiement?: Date;
  delaiPaiement?: number;
  modePaiement: ModePaiement;
  statut: StatutPaiement;
  retard?: number; // En jours
  penalites?: number;
  observations?: string;
}

export interface ParametresRelance {
  relanceAutomatique: boolean;
  delaiPremierRelance: number; // Jours après échéance
  delaiDeuxiemeRelance: number;
  delaiTroisiemeRelance: number;
  delaiMiseEnDemeure: number;
  
  // Personnalisation
  modelesRelance: ModeleRelance[];
  contactRelance?: string;
  modeRelance: ModeRelance[];
  
  // Escalade
  escaladeAutomatique: boolean;
  seuilEscalade: number; // Montant
  responsableEscalade?: string;
  
  // Paramètres spéciaux
  joursOuvresUniquement: boolean;
  excludreWeekend: boolean;
  excludreJoursFeries: boolean;
}

export interface ModeleRelance {
  niveau: NiveauRelance;
  objet: string;
  contenu: string;
  pieceJointe?: boolean;
  modeEnvoi: 'EMAIL' | 'COURRIER' | 'SMS' | 'TELEPHONE';
}

export interface HistoriqueRelance {
  id: string;
  factureId: string;
  niveau: NiveauRelance;
  dateEnvoi: Date;
  modeEnvoi: 'EMAIL' | 'COURRIER' | 'SMS' | 'TELEPHONE';
  destinataire: string;
  objet: string;
  contenu?: string;
  statutEnvoi: 'ENVOYE' | 'ECHEC' | 'EN_ATTENTE';
  dateReponse?: Date;
  reponse?: string;
  actionSuite?: string;
  montantConcerne: number;
  operateur: string;
}

export interface DocumentTiers {
  id: string;
  nom: string;
  type: TypeDocumentTiers;
  fichier: File | string;
  taille: number;
  dateUpload: Date;
  uploadePar: string;
  description?: string;
  version?: string;
  dateExpiration?: Date;
  confidentiel: boolean;
  tags?: string[];
}

export interface ValidationTiersIA {
  score: number; // 0-100
  controles: ControleTiersIA[];
  anomalies: AnomalieTiers[];
  suggestions: SuggestionTiers[];
  conformite: boolean;
  dateValidation: Date;
}

export interface ControleTiersIA {
  type: TypeControleTiers;
  resultat: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION' | 'SUGGESTION';
  message: string;
  details?: any;
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE';
}

export interface AnomalieTiers {
  type: TypeAnomalieTiers;
  gravite: 'CRITIQUE' | 'IMPORTANTE' | 'MINEURE';
  description: string;
  champConcerne: string;
  valeurActuelle?: any;
  valeurSuggeree?: any;
  actionCorrectrice: string;
  dateDetection: Date;
}

export interface SuggestionTiers {
  type: TypeSuggestionTiers;
  titre: string;
  description: string;
  beneficeAttendu: string;
  faciliteImplementation: 'FACILE' | 'MOYENNE' | 'DIFFICILE';
  impactEstime: 'FAIBLE' | 'MOYEN' | 'FORT';
}

export interface ConformiteReglementaire {
  conformiteGDPR: boolean;
  conformiteFiscale: boolean;
  conformiteComptable: boolean;
  derniereVerification: Date;
  prochainControle?: Date;
  observations?: string[];
}

export interface ObservationTiers {
  id: string;
  date: Date;
  auteur: string;
  type: 'GENERALE' | 'COMMERCIALE' | 'FINANCIERE' | 'JURIDIQUE';
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE';
  titre: string;
  contenu: string;
  confidentielle: boolean;
  dateEcheance?: Date;
  statut: 'OUVERTE' | 'EN_COURS' | 'RESOLUE' | 'FERMEE';
}

// Énumérations
export enum TypeTiers {
  CLIENT = 'CLIENT',
  FOURNISSEUR = 'FOURNISSEUR',
  CLIENT_FOURNISSEUR = 'CLIENT_FOURNISSEUR',
  PROSPECT = 'PROSPECT',
  PARTENAIRE = 'PARTENAIRE',
  SOUS_TRAITANT = 'SOUS_TRAITANT'
}

export enum CategorieTiers {
  ENTREPRISE = 'ENTREPRISE',
  PARTICULIER = 'PARTICULIER',
  ADMINISTRATION = 'ADMINISTRATION',
  ASSOCIATION = 'ASSOCIATION',
  ORGANISME_PUBLIC = 'ORGANISME_PUBLIC'
}

export enum NatureTiers {
  PERSONNE_PHYSIQUE = 'PERSONNE_PHYSIQUE',
  PERSONNE_MORALE = 'PERSONNE_MORALE'
}

export enum ModePaiement {
  ESPECES = 'ESPECES',
  CHEQUE = 'CHEQUE',
  VIREMENT = 'VIREMENT',
  CARTE_BANCAIRE = 'CARTE_BANCAIRE',
  MOBILE_MONEY = 'MOBILE_MONEY',
  LETTRE_CHANGE = 'LETTRE_CHANGE',
  BILLET_ORDRE = 'BILLET_ORDRE'
}

export enum StatutTiers {
  ACTIF = 'ACTIF',
  INACTIF = 'INACTIF',
  SUSPENDU = 'SUSPENDU',
  BLOQUE = 'BLOQUE',
  ARCHIVE = 'ARCHIVE'
}

export enum ClasseRisque {
  EXCELLENT = 'EXCELLENT',
  BON = 'BON',
  MOYEN = 'MOYEN',
  RISQUE = 'RISQUE',
  TRES_RISQUE = 'TRES_RISQUE'
}

export enum StatutPaiement {
  EN_ATTENTE = 'EN_ATTENTE',
  PAYE = 'PAYE',
  PAYE_PARTIEL = 'PAYE_PARTIEL',
  EN_RETARD = 'EN_RETARD',
  IMPAYE = 'IMPAYE',
  LITIGIEUX = 'LITIGIEUX'
}

export enum NiveauRelance {
  RELANCE_1 = 'RELANCE_1',
  RELANCE_2 = 'RELANCE_2',
  RELANCE_3 = 'RELANCE_3',
  MISE_EN_DEMEURE = 'MISE_EN_DEMEURE',
  CONTENTIEUX = 'CONTENTIEUX'
}

export enum ModeRelance {
  EMAIL = 'EMAIL',
  COURRIER = 'COURRIER',
  SMS = 'SMS',
  TELEPHONE = 'TELEPHONE',
  VISITE = 'VISITE'
}

export enum TypeDocumentTiers {
  REGISTRE_COMMERCE = 'REGISTRE_COMMERCE',
  IFU = 'IFU',
  ATTESTATION_TVA = 'ATTESTATION_TVA',
  RIB = 'RIB',
  CONTRAT = 'CONTRAT',
  BON_COMMANDE = 'BON_COMMANDE',
  FACTURE = 'FACTURE',
  AUTRE = 'AUTRE'
}

export enum TypeRecommandation {
  CREDIT = 'CREDIT',
  PAIEMENT = 'PAIEMENT',
  COMMERCIAL = 'COMMERCIAL',
  JURIDIQUE = 'JURIDIQUE',
  OPERATIONNEL = 'OPERATIONNEL'
}

export enum TypeControleTiers {
  INFORMATIONS_OBLIGATOIRES = 'INFORMATIONS_OBLIGATOIRES',
  COHERENCE_DONNEES = 'COHERENCE_DONNEES',
  VALIDATION_EMAIL = 'VALIDATION_EMAIL',
  VALIDATION_TELEPHONE = 'VALIDATION_TELEPHONE',
  VALIDATION_IFU = 'VALIDATION_IFU',
  VALIDATION_BANCAIRE = 'VALIDATION_BANCAIRE',
  DOUBLONS = 'DOUBLONS'
}

export enum TypeAnomalieTiers {
  DONNEE_MANQUANTE = 'DONNEE_MANQUANTE',
  FORMAT_INVALIDE = 'FORMAT_INVALIDE',
  DOUBLON_DETECTE = 'DOUBLON_DETECTE',
  INCOHERENCE = 'INCOHERENCE',
  DONNEE_PERIMEE = 'DONNEE_PERIMEE'
}

export enum TypeSuggestionTiers {
  OPTIMISATION_CREDIT = 'OPTIMISATION_CREDIT',
  AMELIORATION_RECOUVREMENT = 'AMELIORATION_RECOUVREMENT',
  OPPORTUNITE_COMMERCIALE = 'OPPORTUNITE_COMMERCIALE',
  REDUCTION_RISQUE = 'REDUCTION_RISQUE',
  AUTOMATISATION = 'AUTOMATISATION'
}

// Données de référence
export const DELAIS_PAIEMENT_STANDARDS = [
  { code: '0', libelle: 'Comptant', jours: 0 },
  { code: '30', libelle: '30 jours net', jours: 30 },
  { code: '45', libelle: '45 jours net', jours: 45 },
  { code: '60', libelle: '60 jours net', jours: 60 },
  { code: '30FDM', libelle: '30 jours fin de mois', jours: 30 },
  { code: '45FDM', libelle: '45 jours fin de mois', jours: 45 }
];

export const SEUILS_SCORING = {
  EXCELLENT: { min: 800, max: 1000, couleur: '#28a745' },
  BON: { min: 600, max: 799, couleur: '#17a2b8' },
  MOYEN: { min: 400, max: 599, couleur: '#ffc107' },
  RISQUE: { min: 200, max: 399, couleur: '#fd7e14' },
  TRES_RISQUE: { min: 0, max: 199, couleur: '#dc3545' }
};

export const CRITERES_SCORING_DEFAUT = [
  { nom: 'Ponctualité paiements', poids: 30, description: 'Respect des échéances' },
  { nom: 'Volume d\'affaires', poids: 25, description: 'Chiffre d\'affaires généré' },
  { nom: 'Ancienneté relation', poids: 15, description: 'Durée de la relation commerciale' },
  { nom: 'Stabilité financière', poids: 15, description: 'Régularité des paiements' },
  { nom: 'Rentabilité', poids: 10, description: 'Marge générée' },
  { nom: 'Litiges', poids: 5, description: 'Nombre et gravité des litiges' }
];

export const MODELES_RELANCE_DEFAUT = {
  [NiveauRelance.RELANCE_1]: {
    objet: 'Rappel échéance - Facture {numeroFacture}',
    contenu: `Madame, Monsieur,

Nous vous rappelons que la facture {numeroFacture} d'un montant de {montant} {devise} était échue le {dateEcheance}.

Nous vous remercions de bien vouloir régulariser cette situation dans les meilleurs délais.

Cordialement,`
  },
  [NiveauRelance.RELANCE_2]: {
    objet: '2ème rappel - Facture {numeroFacture} en retard',
    contenu: `Madame, Monsieur,

Malgré notre premier rappel, nous constatons que la facture {numeroFacture} d'un montant de {montant} {devise} n'a toujours pas été réglée.

Cette facture était échue le {dateEcheance}, soit un retard de {joursRetard} jours.

Nous vous demandons de procéder au règlement sous 8 jours, faute de quoi nous serions contraints de suspendre nos livraisons.

Cordialement,`
  },
  [NiveauRelance.MISE_EN_DEMEURE]: {
    objet: 'MISE EN DEMEURE - Facture {numeroFacture}',
    contenu: `MISE EN DEMEURE

Madame, Monsieur,

Nous vous mettons en demeure de régler la facture {numeroFacture} d'un montant de {montant} {devise}, échue depuis le {dateEcheance}.

Vous disposez d'un délai de 15 jours à compter de la réception de cette mise en demeure pour procéder au règlement.

À défaut, nous nous réserverons le droit d'engager toute action en recouvrement.

Cordialement,`
  }
};