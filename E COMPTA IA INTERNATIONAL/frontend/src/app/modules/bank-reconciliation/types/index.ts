export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  reference: string;
  accountId: string;
  matched: boolean;
  matchedWith?: string;
  matchedDate?: string;
  matchedBy?: string;
  importedDate: string;
  statementDate?: string;
  category?: string;
  notes?: string;
}

export interface BookEntry {
  id: string;
  date: string;
  account: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  reference: string;
  journalId: string;
  journalType: string;
  matched: boolean;
  matchedWith?: string;
  matchedDate?: string;
  matchedBy?: string;
  pieceNumber?: string;
  notes?: string;
}

export interface ReconciliationSummary {
  accountId: string;
  accountName: string;
  bankBalance: number;
  bookBalance: number;
  difference: number;
  matchedItems: number;
  unmatchedBank: number;
  unmatchedBook: number;
  lastReconciled: string;
  reconciliationDate?: string;
  reconciliationPeriod: {
    startDate: string;
    endDate: string;
  };
  status: 'in_progress' | 'completed' | 'validated' | 'archived';
}

export interface MatchRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    amountMatch: 'exact' | 'tolerance';
    amountTolerance?: number;
    dateMatch: 'exact' | 'range';
    dateRange?: number; // days
    referenceMatch: boolean;
    descriptionSimilarity?: number; // 0-1
  };
  priority: number;
  isActive: boolean;
  autoApply: boolean;
}

export interface ReconciliationMatch {
  id: string;
  bankTransactionId: string;
  bookEntryId: string;
  matchType: 'manual' | 'auto' | 'rule';
  confidence: number;
  reason: string;
  matchedDate: string;
  matchedBy: string;
  ruleId?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  notes?: string;
}

export interface ReconciliationPeriod {
  id: string;
  accountId: string;
  startDate: string;
  endDate: string;
  status: 'open' | 'closed' | 'archived';
  createdDate: string;
  closedDate?: string;
  closedBy?: string;
  summary?: ReconciliationSummary;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'credit' | 'loan';
  currency: string;
  isActive: boolean;
  lastReconciled?: string;
  currentBalance?: number;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: string[];
  warnings: string[];
  transactions?: BankTransaction[];
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeMatched: boolean;
  includeUnmatched: boolean;
  period: {
    startDate: string;
    endDate: string;
  };
  groupBy?: 'date' | 'type' | 'status';
}

export interface ReconciliationReport {
  accountId: string;
  accountName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: ReconciliationSummary;
  unmatchedTransactions: BankTransaction[];
  unmatchedEntries: BookEntry[];
  matches: ReconciliationMatch[];
  generatedDate: string;
  generatedBy: string;
}

// Types pour les filtres et la recherche
export interface ReconciliationFilters {
  accountIds?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  status?: ('matched' | 'unmatched')[];
  amountRange?: {
    min?: number;
    max?: number;
  };
  searchTerm?: string;
  transactionTypes?: ('debit' | 'credit')[];
}

// Types pour les validations
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  details?: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  suggestion?: string;
}

// Types pour les notifications
export interface ReconciliationNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  accountId?: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary';
}

// Types pour les statistiques
export interface ReconciliationStats {
  totalAccounts: number;
  totalTransactions: number;
  totalMatched: number;
  totalUnmatched: number;
  averageMatchTime: number; // en jours
  reconciliationAccuracy: number; // pourcentage
  lastUpdate: string;
}

// Types pour l'audit
export interface AuditLog {
  id: string;
  action: string;
  entityType: 'transaction' | 'entry' | 'match' | 'reconciliation';
  entityId: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

// Types pour les préférences utilisateur
export interface ReconciliationPreferences {
  defaultMatchOptions: {
    exactAmountMatch: boolean;
    dateToleranceDays: number;
    descriptionSimilarity: number;
    referenceMatch: boolean;
  };
  autoSaveInterval: number; // minutes
  showConfidenceScores: boolean;
  defaultExportFormat: 'pdf' | 'excel' | 'csv';
  notifications: {
    emailOnCompletion: boolean;
    emailOnErrors: boolean;
    inAppNotifications: boolean;
  };
}

// Types pour l'IA et l'apprentissage automatique
export interface MLMatchSuggestion {
  bankTransactionId: string;
  bookEntryId: string;
  confidence: number;
  features: {
    amountSimilarity: number;
    dateDifference: number;
    textSimilarity: number;
    patternMatch: boolean;
  };
  explanation: string;
}

export interface MLTrainingData {
  correctMatches: Array<{
    bankTransaction: BankTransaction;
    bookEntry: BookEntry;
    features: any;
  }>;
  incorrectMatches: Array<{
    bankTransaction: BankTransaction;
    bookEntry: BookEntry;
    features: any;
  }>;
}

// Re-export pour faciliter l'utilisation
export * from './validation';
export * from './events';