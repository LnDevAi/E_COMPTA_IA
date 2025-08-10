import { BankTransaction, BookEntry, ReconciliationSummary, MatchRule } from '../types';

export interface ReconciliationFilter {
  accountId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'matched' | 'unmatched' | 'all';
  searchTerm?: string;
}

export interface AutoMatchOptions {
  exactAmountMatch: boolean;
  dateToleranceDays: number;
  descriptionSimilarity: number; // 0-1
  referenceMatch: boolean;
}

export class ReconciliationService {
  private static instance: ReconciliationService;
  private baseUrl = '/api/bank-reconciliation';

  static getInstance(): ReconciliationService {
    if (!ReconciliationService.instance) {
      ReconciliationService.instance = new ReconciliationService();
    }
    return ReconciliationService.instance;
  }

  // Récupération des transactions bancaires
  async getBankTransactions(accountId: string, filter?: ReconciliationFilter): Promise<BankTransaction[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filter?.startDate) queryParams.append('startDate', filter.startDate);
      if (filter?.endDate) queryParams.append('endDate', filter.endDate);
      if (filter?.status) queryParams.append('status', filter.status);
      if (filter?.searchTerm) queryParams.append('search', filter.searchTerm);

      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/transactions?${queryParams}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des transactions');
      
      return await response.json();
    } catch (error) {
      console.error('Erreur getBankTransactions:', error);
      throw error;
    }
  }

  // Récupération des écritures comptables
  async getBookEntries(accountId: string, filter?: ReconciliationFilter): Promise<BookEntry[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filter?.startDate) queryParams.append('startDate', filter.startDate);
      if (filter?.endDate) queryParams.append('endDate', filter.endDate);
      if (filter?.status) queryParams.append('status', filter.status);
      if (filter?.searchTerm) queryParams.append('search', filter.searchTerm);

      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/entries?${queryParams}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des écritures');
      
      return await response.json();
    } catch (error) {
      console.error('Erreur getBookEntries:', error);
      throw error;
    }
  }

  // Obtenir le résumé de rapprochement
  async getReconciliationSummary(accountId: string, period: string): Promise<ReconciliationSummary> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/summary?period=${period}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération du résumé');
      
      return await response.json();
    } catch (error) {
      console.error('Erreur getReconciliationSummary:', error);
      throw error;
    }
  }

  // Rapprochement manuel d'éléments
  async manualMatch(bankTransactionId: string, bookEntryId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/manual-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bankTransactionId,
          bookEntryId,
          matchType: 'manual'
        }),
      });

      if (!response.ok) throw new Error('Erreur lors du rapprochement manuel');
      return true;
    } catch (error) {
      console.error('Erreur manualMatch:', error);
      throw error;
    }
  }

  // Annuler un rapprochement
  async unmatch(matchId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/unmatch/${matchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de l\'annulation du rapprochement');
      return true;
    } catch (error) {
      console.error('Erreur unmatch:', error);
      throw error;
    }
  }

  // Rapprochement automatique
  async autoMatch(accountId: string, options: AutoMatchOptions): Promise<{
    matched: number;
    suggestions: Array<{
      bankTransaction: BankTransaction;
      bookEntry: BookEntry;
      confidence: number;
      reason: string;
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/auto-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          options
        }),
      });

      if (!response.ok) throw new Error('Erreur lors du rapprochement automatique');
      return await response.json();
    } catch (error) {
      console.error('Erreur autoMatch:', error);
      throw error;
    }
  }

  // Algorithme de rapprochement automatique côté client
  findMatches(
    bankTransactions: BankTransaction[], 
    bookEntries: BookEntry[], 
    options: AutoMatchOptions
  ): Array<{
    bankTransaction: BankTransaction;
    bookEntry: BookEntry;
    confidence: number;
    reason: string;
  }> {
    const suggestions: Array<{
      bankTransaction: BankTransaction;
      bookEntry: BookEntry;
      confidence: number;
      reason: string;
    }> = [];

    const unmatchedBankTransactions = bankTransactions.filter(t => !t.matched);
    const unmatchedBookEntries = bookEntries.filter(e => !e.matched);

    unmatchedBankTransactions.forEach(bankTx => {
      unmatchedBookEntries.forEach(bookEntry => {
        const match = this.calculateMatchScore(bankTx, bookEntry, options);
        if (match.confidence >= 0.7) { // Seuil de confiance minimum
          suggestions.push({
            bankTransaction: bankTx,
            bookEntry,
            confidence: match.confidence,
            reason: match.reason
          });
        }
      });
    });

    // Trier par confiance décroissante
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateMatchScore(
    bankTx: BankTransaction, 
    bookEntry: BookEntry, 
    options: AutoMatchOptions
  ): { confidence: number; reason: string } {
    let score = 0;
    let reasons: string[] = [];

    // 1. Correspondance exacte du montant (poids: 40%)
    const bankAmount = Math.abs(bankTx.amount);
    const bookAmount = Math.abs(bookEntry.debit || bookEntry.credit);
    
    if (options.exactAmountMatch && bankAmount === bookAmount) {
      score += 0.4;
      reasons.push('Montant identique');
    } else if (Math.abs(bankAmount - bookAmount) / Math.max(bankAmount, bookAmount) < 0.01) {
      score += 0.35; // Tolérance de 1%
      reasons.push('Montant proche');
    }

    // 2. Correspondance de date (poids: 30%)
    const bankDate = new Date(bankTx.date);
    const bookDate = new Date(bookEntry.date);
    const daysDiff = Math.abs((bankDate.getTime() - bookDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      score += 0.3;
      reasons.push('Date identique');
    } else if (daysDiff <= options.dateToleranceDays) {
      score += 0.3 * (1 - daysDiff / options.dateToleranceDays);
      reasons.push(`Date proche (${daysDiff} jours)`);
    }

    // 3. Correspondance de référence (poids: 20%)
    if (options.referenceMatch && this.normalizeReference(bankTx.reference) === this.normalizeReference(bookEntry.reference)) {
      score += 0.2;
      reasons.push('Référence identique');
    }

    // 4. Similarité de description (poids: 10%)
    const similarity = this.calculateStringSimilarity(
      this.normalizeDescription(bankTx.description),
      this.normalizeDescription(bookEntry.description)
    );
    
    if (similarity >= options.descriptionSimilarity) {
      score += 0.1 * similarity;
      reasons.push(`Description similaire (${Math.round(similarity * 100)}%)`);
    }

    return {
      confidence: Math.min(score, 1),
      reason: reasons.join(', ')
    };
  }

  private normalizeReference(ref: string): string {
    return ref.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  private normalizeDescription(desc: string): string {
    return desc.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Import de relevé bancaire
  async importBankStatement(accountId: string, file: File, format: 'csv' | 'ofx' | 'mt940'): Promise<{
    imported: number;
    duplicates: number;
    errors: string[];
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);
      formData.append('accountId', accountId);

      const response = await fetch(`${this.baseUrl}/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erreur lors de l\'import du relevé');
      return await response.json();
    } catch (error) {
      console.error('Erreur importBankStatement:', error);
      throw error;
    }
  }

  // Export des données de rapprochement
  async exportReconciliation(accountId: string, format: 'pdf' | 'excel' | 'csv', period: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/export?accountId=${accountId}&format=${format}&period=${period}`);
      if (!response.ok) throw new Error('Erreur lors de l\'export');
      
      return await response.blob();
    } catch (error) {
      console.error('Erreur exportReconciliation:', error);
      throw error;
    }
  }

  // Validation du rapprochement
  async validateReconciliation(accountId: string, period: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    summary: ReconciliationSummary;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          period
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la validation');
      return await response.json();
    } catch (error) {
      console.error('Erreur validateReconciliation:', error);
      throw error;
    }
  }

  // Archivage du rapprochement
  async archiveReconciliation(accountId: string, period: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          period
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'archivage');
      return true;
    } catch (error) {
      console.error('Erreur archiveReconciliation:', error);
      throw error;
    }
  }
}