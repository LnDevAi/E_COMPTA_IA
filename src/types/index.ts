// Types de base pour la comptabilité EBNL
export interface Account {
  id: string
  code: string
  name: string
  class: AccountClass
  type: AccountType
  parentId?: string
  isActive: boolean
  description?: string
}

export enum AccountClass {
  CLASSE_1 = 1, // Comptes de ressources durables
  CLASSE_2 = 2, // Comptes d'actif immobilisé
  CLASSE_3 = 3, // Comptes de stocks
  CLASSE_4 = 4, // Comptes de tiers
  CLASSE_5 = 5, // Comptes financiers
  CLASSE_6 = 6, // Comptes de charges
  CLASSE_7 = 7, // Comptes de produits
  CLASSE_8 = 8, // Comptes spéciaux
}

export enum AccountType {
  ASSET = 'ASSET',           // Actif
  LIABILITY = 'LIABILITY',   // Passif
  EQUITY = 'EQUITY',         // Capitaux propres
  REVENUE = 'REVENUE',       // Produits
  EXPENSE = 'EXPENSE',       // Charges
  SPECIAL = 'SPECIAL',       // Comptes spéciaux
}

export interface Transaction {
  id: string
  date: Date
  reference: string
  description: string
  entries: TransactionEntry[]
  status: TransactionStatus
  attachments?: Attachment[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface TransactionEntry {
  id: string
  accountId: string
  account: Account
  debit?: number
  credit?: number
  description?: string
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

export interface Attachment {
  id: string
  filename: string
  mimeType: string
  size: number
  url: string
  uploadedAt: Date
}

// Types spécifiques aux EBNL
export interface Member {
  id: string
  memberNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: Address
  membershipType: MembershipType
  joinDate: Date
  status: MemberStatus
  contributions: Contribution[]
}

export interface Address {
  street: string
  city: string
  postalCode: string
  country: string
}

export enum MembershipType {
  ACTIVE = 'ACTIVE',
  HONORARY = 'HONORARY',
  FOUNDING = 'FOUNDING',
  ASSOCIATE = 'ASSOCIATE',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPELLED = 'EXPELLED',
}

export interface Contribution {
  id: string
  memberId: string
  type: ContributionType
  amount: number
  date: Date
  description?: string
  transactionId?: string
}

export enum ContributionType {
  MEMBERSHIP_FEE = 'MEMBERSHIP_FEE',    // Cotisation
  ENTRANCE_FEE = 'ENTRANCE_FEE',        // Droit d'entrée
  DONATION = 'DONATION',                // Don
  VOLUNTEER_WORK = 'VOLUNTEER_WORK',    // Contribution volontaire
}

// Types pour les fonds affectés
export interface DesignatedFund {
  id: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  startDate: Date
  endDate?: Date
  status: FundStatus
  restrictions?: string
  transactions: Transaction[]
}

export enum FundStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

// Types pour l'IA
export interface AIAnalysis {
  id: string
  documentId: string
  extractedData: ExtractedData
  suggestedEntries: SuggestedEntry[]
  confidence: number
  processedAt: Date
  status: AIAnalysisStatus
}

export interface ExtractedData {
  vendor?: string
  amount?: number
  date?: Date
  description?: string
  invoiceNumber?: string
  taxAmount?: number
  category?: string
}

export interface SuggestedEntry {
  accountCode: string
  accountName: string
  debit?: number
  credit?: number
  confidence: number
  reasoning: string
}

export enum AIAnalysisStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVIEWED = 'REVIEWED',
}

// Types pour les états financiers
export interface FinancialStatement {
  id: string
  type: StatementType
  period: Period
  data: FinancialStatementData
  generatedAt: Date
  generatedBy: string
}

export enum StatementType {
  BALANCE_SHEET = 'BALANCE_SHEET',          // Bilan
  INCOME_STATEMENT = 'INCOME_STATEMENT',    // Compte de résultat
  CASH_FLOW = 'CASH_FLOW',                  // Flux de trésorerie
  NOTES = 'NOTES',                          // Annexes
}

export interface Period {
  startDate: Date
  endDate: Date
  year: number
  label: string
}

export interface FinancialStatementData {
  [key: string]: FinancialStatementItem[]
}

export interface FinancialStatementItem {
  accountCode: string
  accountName: string
  currentAmount: number
  previousAmount?: number
  variance?: number
  variancePercent?: number
}