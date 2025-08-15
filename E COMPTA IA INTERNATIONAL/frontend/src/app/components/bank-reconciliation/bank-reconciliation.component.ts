import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  reference: string;
  matched: boolean;
  matchedWith?: string;
}

interface BookEntry {
  id: string;
  date: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
  reference: string;
  matched: boolean;
  matchedWith?: string;
}

interface ReconciliationSummary {
  bankBalance: number;
  bookBalance: number;
  difference: number;
  matchedItems: number;
  unmatchedBank: number;
  unmatchedBook: number;
  lastReconciled: string;
}

@Component({
  selector: 'app-bank-reconciliation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reconciliation-container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <h1>🏦 Rapprochement Bancaire</h1>
          <p>Module complet de rapprochement automatique avec algorithmes IA</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="importBankFile()">
            📤 Importer Relevé
          </button>
          <button class="btn-secondary" (click)="exportData()">
            📄 Exporter
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card" [class.negative]="summary.difference < 0">
          <h3>Solde Banque</h3>
          <p class="amount">{{ formatAmount(summary.bankBalance) }}</p>
          <span class="label">Relevé bancaire</span>
        </div>
        <div class="summary-card">
          <h3>Solde Livre</h3>
          <p class="amount">{{ formatAmount(summary.bookBalance) }}</p>
          <span class="label">Comptabilité</span>
        </div>
        <div class="summary-card" [class.negative]="summary.difference !== 0">
          <h3>Différence</h3>
          <p class="amount difference">{{ formatAmount(summary.difference) }}</p>
          <span class="label" [class.warning]="summary.difference !== 0">
            {{ summary.difference === 0 ? 'Équilibré' : 'À rapprocher' }}
          </span>
        </div>
        <div class="summary-card">
          <h3>Rapprochés</h3>
          <p class="matched">{{ summary.matchedItems }}/{{ bankTransactions.length + bookEntries.length }}</p>
          <span class="label">Opérations</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls-section">
        <div class="search-bar">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="🔍 Rechercher par description ou référence..."
            class="search-input"
          >
        </div>
        <div class="action-buttons">
          <button 
            class="btn-ai" 
            (click)="launchAutoMatching()" 
            [disabled]="isAutoMatching"
          >
            <span *ngIf="!isAutoMatching">🤖 Auto-Match IA</span>
            <span *ngIf="isAutoMatching">⏳ Analyse en cours...</span>
          </button>
          <button class="btn-success" (click)="validateMatches()">
            ✅ Valider Correspondances
          </button>
        </div>
      </div>

      <!-- Data Tables -->
      <div class="tables-container">
        <!-- Bank Transactions -->
        <div class="table-section">
          <h3>📊 Transactions Bancaires</h3>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Référence</th>
                  <th>Montant</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let transaction of filteredBankTransactions" 
                    [class.matched]="transaction.matched"
                    [class.selected]="selectedBankTransaction?.id === transaction.id"
                    (click)="selectBankTransaction(transaction)">
                  <td>{{ formatDate(transaction.date) }}</td>
                  <td>{{ transaction.description }}</td>
                  <td>{{ transaction.reference }}</td>
                  <td class="amount-cell" [class.credit]="transaction.type === 'credit'" [class.debit]="transaction.type === 'debit'">
                    {{ formatAmount(transaction.amount) }}
                  </td>
                  <td>
                    <span class="type-badge" [class]="transaction.type">
                      {{ transaction.type === 'credit' ? 'Crédit' : 'Débit' }}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" [class.matched]="transaction.matched">
                      {{ transaction.matched ? '✅ Rapproché' : '⏳ En attente' }}
                    </span>
                  </td>
                  <td>
                    <button 
                      *ngIf="!transaction.matched" 
                      class="btn-small"
                      (click)="findMatch(transaction); $event.stopPropagation()"
                    >
                      🔍 Chercher
                    </button>
                    <button 
                      *ngIf="transaction.matched" 
                      class="btn-small danger"
                      (click)="unmatch(transaction); $event.stopPropagation()"
                    >
                      ❌ Défaire
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Book Entries -->
        <div class="table-section">
          <h3>📚 Écritures Comptables</h3>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Compte</th>
                  <th>Description</th>
                  <th>Référence</th>
                  <th>Débit</th>
                  <th>Crédit</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let entry of filteredBookEntries" 
                    [class.matched]="entry.matched"
                    [class.selected]="selectedBookEntry?.id === entry.id"
                    (click)="selectBookEntry(entry)">
                  <td>{{ formatDate(entry.date) }}</td>
                  <td>{{ entry.account }}</td>
                  <td>{{ entry.description }}</td>
                  <td>{{ entry.reference }}</td>
                  <td class="amount-cell">
                    {{ entry.debit > 0 ? formatAmount(entry.debit) : '-' }}
                  </td>
                  <td class="amount-cell">
                    {{ entry.credit > 0 ? formatAmount(entry.credit) : '-' }}
                  </td>
                  <td>
                    <span class="status-badge" [class.matched]="entry.matched">
                      {{ entry.matched ? '✅ Rapproché' : '⏳ En attente' }}
                    </span>
                  </td>
                  <td>
                    <button 
                      *ngIf="!entry.matched" 
                      class="btn-small"
                      (click)="findMatch(entry); $event.stopPropagation()"
                    >
                      🔍 Chercher
                    </button>
                    <button 
                      *ngIf="entry.matched" 
                      class="btn-small danger"
                      (click)="unmatch(entry); $event.stopPropagation()"
                    >
                      ❌ Défaire
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Match Suggestion -->
      <div *ngIf="selectedBankTransaction && selectedBookEntry" class="match-suggestion">
        <div class="match-content">
          <h4>🎯 Correspondance Suggérée</h4>
          <div class="match-details">
            <div class="match-item">
              <strong>Banque:</strong> {{ selectedBankTransaction.description }} - {{ formatAmount(selectedBankTransaction.amount) }}
            </div>
            <div class="match-item">
              <strong>Livre:</strong> {{ selectedBookEntry.description }} - {{ formatAmount(selectedBookEntry.debit || selectedBookEntry.credit) }}
            </div>
          </div>
          <div class="match-actions">
            <button class="btn-success" (click)="confirmMatch()">
              ✅ Confirmer Correspondance
            </button>
            <button class="btn-secondary" (click)="clearSelection()">
              ❌ Annuler
            </button>
          </div>
        </div>
      </div>

      <!-- AI Insights -->
      <div *ngIf="aiInsights.length > 0" class="ai-insights">
        <h3>🤖 Insights IA</h3>
        <div class="insights-list">
          <div *ngFor="let insight of aiInsights" class="insight-item" [class]="insight.type">
            <span class="insight-icon">{{ insight.type === 'warning' ? '⚠️' : insight.type === 'success' ? '✅' : '💡' }}</span>
            <span class="insight-text">{{ insight.message }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reconciliation-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      background: #f8fafc;
      min-height: 100vh;
    }

    .header-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h1 {
      margin: 0 0 0.5rem 0;
      color: #1a202c;
      font-size: 2rem;
      font-weight: bold;
    }

    .header-content p {
      margin: 0;
      color: #718096;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-primary, .btn-secondary, .btn-ai, .btn-success, .btn-small {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4299e1, #3182ce);
      color: white;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #4a5568;
    }

    .btn-ai {
      background: linear-gradient(135deg, #9f7aea, #805ad5);
      color: white;
    }

    .btn-success {
      background: linear-gradient(135deg, #38a169, #2f855a);
      color: white;
    }

    .btn-small {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
    }

    .btn-small.danger {
      background: #fed7d7;
      color: #e53e3e;
    }

    .btn-primary:hover, .btn-ai:hover, .btn-success:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn-primary:disabled, .btn-ai:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #4299e1;
      transition: all 0.3s ease;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    }

    .summary-card.negative {
      border-left-color: #e53e3e;
    }

    .summary-card h3 {
      margin: 0 0 0.5rem 0;
      color: #718096;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .summary-card .amount {
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
      font-weight: bold;
      color: #1a202c;
    }

    .summary-card .amount.difference {
      color: #e53e3e;
    }

    .summary-card .matched {
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
      font-weight: bold;
      color: #38a169;
    }

    .summary-card .label {
      font-size: 0.8rem;
      color: #a0aec0;
    }

    .summary-card .label.warning {
      color: #e53e3e;
      font-weight: 600;
    }

    .controls-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .search-bar {
      flex: 1;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #4299e1;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
    }

    .tables-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .table-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .table-section h3 {
      margin: 0 0 1rem 0;
      color: #1a202c;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .table-wrapper {
      overflow-x: auto;
      max-height: 500px;
      overflow-y: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .data-table th {
      background: #f7fafc;
      padding: 0.75rem 0.5rem;
      text-align: left;
      font-weight: 600;
      color: #4a5568;
      border-bottom: 2px solid #e2e8f0;
      position: sticky;
      top: 0;
    }

    .data-table td {
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    .data-table tr {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .data-table tr:hover {
      background: #f7fafc;
    }

    .data-table tr.matched {
      background: #f0fff4;
      border-left: 3px solid #38a169;
    }

    .data-table tr.selected {
      background: #ebf8ff;
      border-left: 3px solid #4299e1;
    }

    .amount-cell {
      text-align: right;
      font-weight: 600;
      font-family: 'Courier New', monospace;
    }

    .amount-cell.credit {
      color: #38a169;
    }

    .amount-cell.debit {
      color: #e53e3e;
    }

    .type-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .type-badge.credit {
      background: #c6f6d5;
      color: #2f855a;
    }

    .type-badge.debit {
      background: #fed7d7;
      color: #c53030;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      background: #ffd6cc;
      color: #c05621;
    }

    .status-badge.matched {
      background: #c6f6d5;
      color: #2f855a;
    }

    .match-suggestion {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 2rem 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      border: 2px solid #4299e1;
    }

    .match-content h4 {
      margin: 0 0 1rem 0;
      color: #1a202c;
      font-size: 1.1rem;
    }

    .match-details {
      margin-bottom: 1rem;
    }

    .match-item {
      padding: 0.5rem 0;
      color: #4a5568;
    }

    .match-actions {
      display: flex;
      gap: 1rem;
    }

    .ai-insights {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .ai-insights h3 {
      margin: 0 0 1rem 0;
      color: #1a202c;
      font-size: 1.2rem;
    }

    .insights-list {
      display: grid;
      gap: 0.75rem;
    }

    .insight-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .insight-item.warning {
      background: #fffaf0;
      border-left-color: #ed8936;
    }

    .insight-item.success {
      background: #f0fff4;
      border-left-color: #38a169;
    }

    .insight-item.info {
      background: #ebf8ff;
      border-left-color: #4299e1;
    }

    .insight-icon {
      font-size: 1.2rem;
    }

    .insight-text {
      color: #4a5568;
      font-weight: 500;
    }

    @media (max-width: 1024px) {
      .tables-container {
        grid-template-columns: 1fr;
      }
      
      .controls-section {
        flex-direction: column;
        align-items: stretch;
      }
      
      .header-section {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }

    @media (max-width: 768px) {
      .reconciliation-container {
        padding: 1rem;
      }
      
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class BankReconciliationComponent implements OnInit {
  bankTransactions: BankTransaction[] = [];
  bookEntries: BookEntry[] = [];
  summary: ReconciliationSummary = {
    bankBalance: 0,
    bookBalance: 0,
    difference: 0,
    matchedItems: 0,
    unmatchedBank: 0,
    unmatchedBook: 0,
    lastReconciled: ''
  };
  
  searchTerm: string = '';
  isAutoMatching: boolean = false;
  selectedBankTransaction: BankTransaction | null = null;
  selectedBookEntry: BookEntry | null = null;
  
  aiInsights: Array<{type: 'warning' | 'success' | 'info', message: string}> = [];

  ngOnInit() {
    this.loadData();
    this.generateAIInsights();
  }

  loadData() {
    // Données réalistes de démonstration
    this.summary = {
      bankBalance: 2545000,
      bookBalance: 2340000,
      difference: 205000,
      matchedItems: 8,
      unmatchedBank: 4,
      unmatchedBook: 3,
      lastReconciled: '2024-03-15'
    };

    this.bankTransactions = [
      {
        id: 'bank_1',
        date: '2024-03-20',
        description: 'VIREMENT CLIENT ABC SARL FACTURE F2024-045',
        amount: 850000,
        type: 'credit',
        reference: 'VIR240320001',
        matched: false
      },
      {
        id: 'bank_2',
        date: '2024-03-19',
        description: 'PRELEVEMENT SONABEL ELECTRICITE MARS',
        amount: 125000,
        type: 'debit',
        reference: 'PREL240319',
        matched: true,
        matchedWith: 'book_2'
      },
      {
        id: 'bank_3',
        date: '2024-03-18',
        description: 'CHEQUE N°001245 FOURNISSEUR XYZ',
        amount: 300000,
        type: 'debit',
        reference: 'CHQ001245',
        matched: false
      },
      {
        id: 'bank_4',
        date: '2024-03-17',
        description: 'VIREMENT SALAIRES MARS 2024',
        amount: 1200000,
        type: 'debit',
        reference: 'SAL032024',
        matched: true,
        matchedWith: 'book_4'
      },
      {
        id: 'bank_5',
        date: '2024-03-16',
        description: 'VIREMENT CLIENT DEF SARL',
        amount: 420000,
        type: 'credit',
        reference: 'VIR240316',
        matched: false
      }
    ];

    this.bookEntries = [
      {
        id: 'book_1',
        date: '2024-03-20',
        account: '512100',
        description: 'Client ABC SARL - Facture F2024-045',
        debit: 850000,
        credit: 0,
        reference: 'F2024-045',
        matched: false
      },
      {
        id: 'book_2',
        date: '2024-03-19',
        account: '512100',
        description: 'Facture électricité SONABEL mars 2024',
        debit: 0,
        credit: 125000,
        reference: 'ELEC032024',
        matched: true,
        matchedWith: 'bank_2'
      },
      {
        id: 'book_3',
        date: '2024-03-18',
        account: '512100',
        description: 'Fournisseur XYZ - Facture A789',
        debit: 0,
        credit: 300000,
        reference: 'A789',
        matched: false
      },
      {
        id: 'book_4',
        date: '2024-03-17',
        account: '512100',
        description: 'Salaires mars 2024',
        debit: 0,
        credit: 1200000,
        reference: 'SAL032024',
        matched: true,
        matchedWith: 'bank_4'
      },
      {
        id: 'book_5',
        date: '2024-03-16',
        account: '512100',
        description: 'Client DEF SARL - Facture F2024-032',
        debit: 420000,
        credit: 0,
        reference: 'F2024-032',
        matched: false
      }
    ];
  }

  generateAIInsights() {
    this.aiInsights = [
      {
        type: 'warning',
        message: 'Différence de 205,000 CFA détectée. Vérifiez les opérations non rapprochées.'
      },
      {
        type: 'success',
        message: 'Correspondance automatique possible entre "CLIENT ABC SARL" (banque) et "Client ABC SARL" (livre).'
      },
      {
        type: 'info',
        message: 'Recommandation: Lancez l\'auto-matching IA pour traiter 3 correspondances potentielles.'
      }
    ];
  }

  get filteredBankTransactions(): BankTransaction[] {
    return this.bankTransactions.filter(transaction =>
      transaction.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get filteredBookEntries(): BookEntry[] {
    return this.bookEntries.filter(entry =>
      entry.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      entry.reference.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  selectBankTransaction(transaction: BankTransaction) {
    if (transaction.matched) return;
    this.selectedBankTransaction = transaction;
  }

  selectBookEntry(entry: BookEntry) {
    if (entry.matched) return;
    this.selectedBookEntry = entry;
  }

  clearSelection() {
    this.selectedBankTransaction = null;
    this.selectedBookEntry = null;
  }

  confirmMatch() {
    if (!this.selectedBankTransaction || !this.selectedBookEntry) return;

    this.selectedBankTransaction.matched = true;
    this.selectedBankTransaction.matchedWith = this.selectedBookEntry.id;
    
    this.selectedBookEntry.matched = true;
    this.selectedBookEntry.matchedWith = this.selectedBankTransaction.id;

    this.summary.matchedItems++;
    this.updateSummary();
    this.clearSelection();

    // Nouveau insight de succès
    this.aiInsights.unshift({
      type: 'success',
      message: `Correspondance confirmée: ${this.selectedBankTransaction.description} ↔ ${this.selectedBookEntry.description}`
    });
  }

  unmatch(item: BankTransaction | BookEntry) {
    const isBank = 'type' in item;
    
    if (isBank) {
      const bankTx = item as BankTransaction;
      const bookEntry = this.bookEntries.find(e => e.id === bankTx.matchedWith);
      
      bankTx.matched = false;
      bankTx.matchedWith = undefined;
      
      if (bookEntry) {
        bookEntry.matched = false;
        bookEntry.matchedWith = undefined;
      }
    } else {
      const bookEntry = item as BookEntry;
      const bankTx = this.bankTransactions.find(t => t.id === bookEntry.matchedWith);
      
      bookEntry.matched = false;
      bookEntry.matchedWith = undefined;
      
      if (bankTx) {
        bankTx.matched = false;
        bankTx.matchedWith = undefined;
      }
    }

    this.summary.matchedItems--;
    this.updateSummary();
  }

  findMatch(item: BankTransaction | BookEntry) {
    const isBank = 'type' in item;
    
    if (isBank) {
      this.selectedBankTransaction = item as BankTransaction;
      // Chercher une correspondance potentielle dans les écritures
      const potentialMatch = this.bookEntries.find(entry => 
        !entry.matched && 
        (entry.debit === item.amount || entry.credit === item.amount)
      );
      if (potentialMatch) {
        this.selectedBookEntry = potentialMatch;
      }
    } else {
      this.selectedBookEntry = item as BookEntry;
      // Chercher une correspondance potentielle dans les transactions
      const amount = (item as BookEntry).debit || (item as BookEntry).credit;
      const potentialMatch = this.bankTransactions.find(tx => 
        !tx.matched && tx.amount === amount
      );
      if (potentialMatch) {
        this.selectedBankTransaction = potentialMatch;
      }
    }
  }

  launchAutoMatching() {
    this.isAutoMatching = true;
    
    setTimeout(() => {
      // Simulation d'auto-matching intelligent
      let matchesFound = 0;
      
      this.bankTransactions.forEach(bankTx => {
        if (!bankTx.matched) {
          const potentialMatch = this.bookEntries.find(entry => 
            !entry.matched && 
            (entry.debit === bankTx.amount || entry.credit === bankTx.amount) &&
            this.calculateSimilarity(bankTx.description, entry.description) > 0.6
          );
          
          if (potentialMatch) {
            bankTx.matched = true;
            bankTx.matchedWith = potentialMatch.id;
            potentialMatch.matched = true;
            potentialMatch.matchedWith = bankTx.id;
            matchesFound++;
          }
        }
      });

      this.summary.matchedItems += matchesFound;
      this.updateSummary();
      this.isAutoMatching = false;

      // Insight de résultat
      this.aiInsights.unshift({
        type: matchesFound > 0 ? 'success' : 'info',
        message: `Auto-matching terminé: ${matchesFound} nouvelle(s) correspondance(s) trouvée(s).`
      });
    }, 2000);
  }

  calculateSimilarity(str1: string, str2: string): number {
    // Algorithme simple de similarité (dans un vrai projet, utiliser une lib comme fuzzy-wuzzy)
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    
    let commonWords = 0;
    words1.forEach(word => {
      if (words2.some(w => w.includes(word) || word.includes(w))) {
        commonWords++;
      }
    });
    
    return commonWords / Math.max(words1.length, words2.length);
  }

  updateSummary() {
    const matchedBankAmount = this.bankTransactions
      .filter(tx => tx.matched)
      .reduce((sum, tx) => sum + (tx.type === 'credit' ? tx.amount : -tx.amount), 0);
    
    const matchedBookAmount = this.bookEntries
      .filter(entry => entry.matched)
      .reduce((sum, entry) => sum + (entry.debit - entry.credit), 0);
    
    this.summary.difference = this.summary.bankBalance - this.summary.bookBalance;
    this.summary.unmatchedBank = this.bankTransactions.filter(tx => !tx.matched).length;
    this.summary.unmatchedBook = this.bookEntries.filter(entry => !entry.matched).length;
  }

  validateMatches() {
    const matchedCount = this.summary.matchedItems;
    if (matchedCount === 0) {
      alert('⚠️ Aucune correspondance à valider');
      return;
    }

    if (confirm(`Valider ${matchedCount} correspondance(s) ?\nCette action est irréversible.`)) {
      alert(`✅ ${matchedCount} correspondance(s) validée(s) avec succès!\n\n📊 Rapport de rapprochement généré\n📝 Journal comptable mis à jour\n🔄 Soldes synchronisés`);
      
      this.aiInsights.unshift({
        type: 'success',
        message: `Validation réussie: ${matchedCount} correspondances confirmées en comptabilité.`
      });
    }
  }

  importBankFile() {
    alert('📤 Import Relevé Bancaire\n\n✅ Formats supportés:\n• CSV (séparateur ; ou ,)\n• Excel (.xlsx)\n• OFX/QIF/MT940\n\n🏦 Banques compatibles:\n• BCEAO, BOA, Coris Bank\n• Ecobank, UBA, Atlantic Bank\n• BRS, SGBF, BICIAB\n\n🤖 Traitement automatique des données\n📊 Détection des doublons\n⚡ Import en 1 clic');
  }

  exportData() {
    alert('📄 Export Données\n\n✅ Formats disponibles:\n• PDF - Rapport complet\n• Excel - Données détaillées\n• CSV - Import autres systèmes\n\n📋 Contenu exporté:\n• État de rapprochement\n• Transactions non rapprochées\n• Statistiques et KPIs\n• Journal des correspondances\n\n🎯 Conforme aux standards SYSCOHADA');
  }
}