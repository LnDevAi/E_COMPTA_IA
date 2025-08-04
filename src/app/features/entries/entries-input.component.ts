import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

interface Account {
  code: string;
  label: string;
  type: 'DEBIT' | 'CREDIT';
  mandatory: boolean;
}

interface EntryLine {
  id: string;
  accountCode: string;
  accountLabel: string;
  debit: number;
  credit: number;
  reference?: string;
  description: string;
  analyticalCode?: string;
  tiers?: string;
  dueDate?: Date;
  documentRef?: string;
}

interface JournalEntry {
  id: string;
  journalCode: string;
  journalLabel: string;
  entryNumber: string;
  date: Date;
  reference: string;
  description: string;
  lines: EntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'DRAFT' | 'VALIDATED' | 'POSTED';
  createdBy: string;
  createdDate: Date;
  validatedBy?: string;
  validatedDate?: Date;
  origin: 'MANUAL' | 'IMPORT' | 'AI_GENERATED' | 'TEMPLATE';
}

interface Journal {
  code: string;
  label: string;
  type: 'VENTE' | 'ACHAT' | 'BANQUE' | 'CAISSE' | 'OD' | 'PAIE';
  color: string;
  counterAccount?: string;
  autoNumbering: boolean;
  prefix: string;
}

interface EntryTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  journalCode: string;
  lines: Omit<EntryLine, 'id'>[];
  isActive: boolean;
}

@Component({
  selector: 'app-entries-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="entries-container">
      <!-- Header avec actions principales -->
      <div class="entries-header">
        <div class="header-left">
          <h1 class="page-title">
            <i class="title-icon">✍️</i>
            Saisie des Écritures
          </h1>
          <div class="quick-stats">
            <div class="stat-item">
              <span class="stat-value">{{ draftEntriesCount() }}</span>
              <span class="stat-label">Brouillons</span>
            </div>
            <div class="stat-item validated">
              <span class="stat-value">{{ validatedEntriesCount() }}</span>
              <span class="stat-label">Validées</span>
            </div>
            <div class="stat-item amount">
              <span class="stat-value">{{ formatCurrency(totalAmount()) }}</span>
              <span class="stat-label">Montant total</span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button class="btn-secondary" (click)="showImportModal = true">
            <i>📥</i> Importer
          </button>
          <button class="btn-secondary" (click)="showTemplatesModal = true">
            <i>📋</i> Modèles
          </button>
          <button class="btn-primary" (click)="createNewEntry()">
            <i>➕</i> Nouvelle Écriture
          </button>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="filters-section">
        <div class="search-box">
          <i class="search-icon">🔍</i>
          <input type="text" 
                 [(ngModel)]="searchTerm" 
                 placeholder="Rechercher par référence, description ou compte..."
                 class="search-input">
        </div>

        <div class="filter-controls">
          <select [(ngModel)]="selectedJournal" class="filter-select">
            <option value="">Tous les journaux</option>
            <option *ngFor="let journal of journals" [value]="journal.code">
              {{ journal.code }} - {{ journal.label }}
            </option>
          </select>

          <select [(ngModel)]="selectedStatus" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="DRAFT">Brouillons</option>
            <option value="VALIDATED">Validées</option>
            <option value="POSTED">Comptabilisées</option>
          </select>

          <input type="date" 
                 [(ngModel)]="dateFrom" 
                 class="date-input"
                 placeholder="Date début">
          <input type="date" 
                 [(ngModel)]="dateTo" 
                 class="date-input"
                 placeholder="Date fin">

          <div class="toggle-group">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="showOnlyUnbalanced">
              Écritures déséquilibrées
            </label>
          </div>
        </div>
      </div>

      <!-- Vue principale avec onglets -->
      <div class="main-content">
        <div class="content-tabs">
          <button class="tab-btn" 
                  [class.active]="activeTab() === 'list'"
                  (click)="setActiveTab('list')">
            <i>📋</i> Liste des Écritures
          </button>
          <button class="tab-btn" 
                  [class.active]="activeTab() === 'entry'"
                  (click)="setActiveTab('entry')"
                  *ngIf="currentEntry()">
            <i>✏️</i> Saisie
          </button>
          <button class="tab-btn" 
                  [class.active]="activeTab() === 'validation'"
                  (click)="setActiveTab('validation')">
            <i>✅</i> Validation
          </button>
        </div>

        <!-- Liste des écritures -->
        <div class="tab-content" *ngIf="activeTab() === 'list'">
          <div class="entries-table">
            <div class="table-header">
              <div class="header-cell">Date</div>
              <div class="header-cell">Journal</div>
              <div class="header-cell">N° Écriture</div>
              <div class="header-cell">Référence</div>
              <div class="header-cell">Description</div>
              <div class="header-cell">Débit</div>
              <div class="header-cell">Crédit</div>
              <div class="header-cell">Statut</div>
              <div class="header-cell">Actions</div>
            </div>

            <div *ngFor="let entry of filteredEntries()" 
                 class="table-row"
                 [class.unbalanced]="!isEntryBalanced(entry)"
                 [class.draft]="entry.status === 'DRAFT'"
                 [class.validated]="entry.status === 'VALIDATED'">
              
              <div class="table-cell date">{{ formatDate(entry.date) }}</div>
              <div class="table-cell journal">
                <span class="journal-badge" [style.background-color]="getJournalColor(entry.journalCode)">
                  {{ entry.journalCode }}
                </span>
              </div>
              <div class="table-cell">{{ entry.entryNumber }}</div>
              <div class="table-cell">{{ entry.reference }}</div>
              <div class="table-cell description">{{ entry.description }}</div>
              <div class="table-cell amount">{{ formatCurrency(entry.totalDebit) }}</div>
              <div class="table-cell amount">{{ formatCurrency(entry.totalCredit) }}</div>
              <div class="table-cell status">
                <span class="status-badge" [class]="entry.status.toLowerCase()">
                  {{ getStatusLabel(entry.status) }}
                </span>
              </div>
              <div class="table-cell actions">
                <button class="action-btn" (click)="editEntry(entry)" title="Modifier">
                  <i>✏️</i>
                </button>
                <button class="action-btn" (click)="duplicateEntry(entry)" title="Dupliquer">
                  <i>📋</i>
                </button>
                <button class="action-btn" 
                        *ngIf="entry.status === 'DRAFT'"
                        (click)="validateEntry(entry)" 
                        title="Valider">
                  <i>✅</i>
                </button>
                <button class="action-btn danger" 
                        *ngIf="entry.status === 'DRAFT'"
                        (click)="deleteEntry(entry)" 
                        title="Supprimer">
                  <i>🗑️</i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Saisie d'écriture -->
        <div class="tab-content" *ngIf="activeTab() === 'entry' && currentEntry()">
          <div class="entry-form-container">
            <form [formGroup]="entryForm" class="entry-form">
              <!-- En-tête de l'écriture -->
              <div class="entry-header-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Journal *</label>
                    <select formControlName="journalCode" class="form-select" (change)="onJournalChange()">
                      <option value="">Sélectionner un journal</option>
                      <option *ngFor="let journal of journals" [value]="journal.code">
                        {{ journal.code }} - {{ journal.label }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Date *</label>
                    <input type="date" formControlName="date" class="form-input">
                  </div>
                  <div class="form-group">
                    <label>N° Écriture</label>
                    <input type="text" formControlName="entryNumber" class="form-input" readonly>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Référence</label>
                    <input type="text" formControlName="reference" class="form-input">
                  </div>
                  <div class="form-group full-width">
                    <label>Description *</label>
                    <input type="text" formControlName="description" class="form-input">
                  </div>
                </div>
              </div>

              <!-- Lignes d'écriture -->
              <div class="entry-lines-section">
                <div class="section-header">
                  <h3>Lignes d'écriture</h3>
                  <button type="button" class="btn-secondary" (click)="addEntryLine()">
                    <i>➕</i> Ajouter une ligne
                  </button>
                </div>

                <div class="lines-table">
                  <div class="lines-header">
                    <div class="line-cell">Compte</div>
                    <div class="line-cell">Libellé</div>
                    <div class="line-cell">Débit</div>
                    <div class="line-cell">Crédit</div>
                    <div class="line-cell">Tiers</div>
                    <div class="line-cell">Échéance</div>
                    <div class="line-cell">Actions</div>
                  </div>

                  <div formArrayName="lines">
                    <div *ngFor="let line of entryLines.controls; let i = index" 
                         [formGroupName]="i" 
                         class="line-row"
                         [class.error]="hasLineErrors(i)">
                      
                      <div class="line-cell account">
                        <input type="text" 
                               formControlName="accountCode" 
                               class="line-input"
                               (blur)="onAccountCodeChange(i)"
                               (keyup.enter)="searchAccount(i)"
                               placeholder="Code compte">
                        <button type="button" 
                                class="account-search-btn" 
                                (click)="openAccountSearch(i)">
                          🔍
                        </button>
                      </div>

                      <div class="line-cell label">
                        <input type="text" 
                               formControlName="accountLabel" 
                               class="line-input" 
                               readonly>
                      </div>

                      <div class="line-cell amount">
                        <input type="number" 
                               formControlName="debit" 
                               class="line-input amount-input"
                               (input)="onAmountChange(i, 'debit')"
                               placeholder="0,00">
                      </div>

                      <div class="line-cell amount">
                        <input type="number" 
                               formControlName="credit" 
                               class="line-input amount-input"
                               (input)="onAmountChange(i, 'credit')"
                               placeholder="0,00">
                      </div>

                      <div class="line-cell tiers">
                        <select formControlName="tiers" class="line-select">
                          <option value="">Aucun</option>
                          <option *ngFor="let tiers of tiersList" [value]="tiers.code">
                            {{ tiers.name }}
                          </option>
                        </select>
                      </div>

                      <div class="line-cell date">
                        <input type="date" formControlName="dueDate" class="line-input">
                      </div>

                      <div class="line-cell actions">
                        <button type="button" 
                                class="line-action-btn" 
                                (click)="insertLineAbove(i)" 
                                title="Insérer ligne au-dessus">
                          ⬆️
                        </button>
                        <button type="button" 
                                class="line-action-btn" 
                                (click)="insertLineBelow(i)" 
                                title="Insérer ligne en-dessous">
                          ⬇️
                        </button>
                        <button type="button" 
                                class="line-action-btn danger" 
                                (click)="removeLine(i)" 
                                title="Supprimer ligne"
                                [disabled]="entryLines.length <= 2">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Totaux -->
                  <div class="totals-row">
                    <div class="total-cell"></div>
                    <div class="total-cell"><strong>TOTAUX:</strong></div>
                    <div class="total-cell amount">
                      <strong [class.error]="!isFormBalanced()">
                        {{ formatCurrency(getTotalDebit()) }}
                      </strong>
                    </div>
                    <div class="total-cell amount">
                      <strong [class.error]="!isFormBalanced()">
                        {{ formatCurrency(getTotalCredit()) }}
                      </strong>
                    </div>
                    <div class="total-cell"></div>
                    <div class="total-cell"></div>
                    <div class="total-cell">
                      <div class="balance-indicator" [class.balanced]="isFormBalanced()">
                        {{ isFormBalanced() ? '✅ Équilibrée' : '⚠️ Déséquilibrée' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contrôles AUDCIF -->
              <div class="audcif-controls" *ngIf="showAudcifControls()">
                <h4>🔍 Contrôles SYSCOHADA AUDCIF</h4>
                <div class="controls-list">
                  <div *ngFor="let control of audcifValidations()" 
                       class="control-item"
                       [class.success]="control.status === 'OK'"
                       [class.warning]="control.status === 'WARNING'"
                       [class.error]="control.status === 'ERROR'">
                    <i class="control-icon">{{ control.icon }}</i>
                    <span class="control-message">{{ control.message }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions de l'écriture -->
              <div class="entry-actions">
                <button type="button" class="btn-secondary" (click)="cancelEntry()">
                  Annuler
                </button>
                <button type="button" class="btn-secondary" (click)="saveAsDraft()" [disabled]="!canSaveAsDraft()">
                  💾 Sauver brouillon
                </button>
                <button type="button" class="btn-primary" (click)="validateAndSave()" [disabled]="!canValidate()">
                  ✅ Valider et sauver
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Validation par lot -->
        <div class="tab-content" *ngIf="activeTab() === 'validation'">
          <div class="validation-section">
            <div class="validation-header">
              <h3>Validation des Écritures</h3>
              <div class="validation-actions">
                <button class="btn-secondary" (click)="selectAllDrafts()">
                  Sélectionner tous les brouillons
                </button>
                <button class="btn-primary" 
                        (click)="validateSelectedEntries()" 
                        [disabled]="selectedEntries().length === 0">
                  Valider la sélection ({{ selectedEntries().length }})
                </button>
              </div>
            </div>

            <div class="validation-list">
              <div *ngFor="let entry of getDraftEntries()" 
                   class="validation-item"
                   [class.selected]="isEntrySelected(entry.id)"
                   [class.error]="!isEntryBalanced(entry)">
                
                <div class="validation-checkbox">
                  <input type="checkbox" 
                         [checked]="isEntrySelected(entry.id)"
                         (change)="toggleEntrySelection(entry.id)">
                </div>

                <div class="validation-info">
                  <div class="entry-summary">
                    <span class="entry-date">{{ formatDate(entry.date) }}</span>
                    <span class="entry-journal">{{ entry.journalCode }}</span>
                    <span class="entry-reference">{{ entry.reference }}</span>
                    <span class="entry-description">{{ entry.description }}</span>
                  </div>
                  <div class="entry-amounts">
                    <span class="amount-debit">Débit: {{ formatCurrency(entry.totalDebit) }}</span>
                    <span class="amount-credit">Crédit: {{ formatCurrency(entry.totalCredit) }}</span>
                  </div>
                </div>

                <div class="validation-status">
                  <div class="balance-check" [class.balanced]="isEntryBalanced(entry)">
                    {{ isEntryBalanced(entry) ? '✅ Équilibrée' : '❌ Déséquilibrée' }}
                  </div>
                  <div class="audcif-check" [class.valid]="isAudcifCompliant(entry)">
                    {{ isAudcifCompliant(entry) ? '✅ AUDCIF OK' : '⚠️ Contrôles requis' }}
                  </div>
                </div>

                <div class="validation-actions">
                  <button class="action-btn" (click)="editEntry(entry)">✏️</button>
                  <button class="action-btn" (click)="previewEntry(entry)">👁️</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de recherche de compte -->
    <div class="modal-overlay" *ngIf="showAccountSearchModal" (click)="closeAccountSearch()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>🔍 Rechercher un compte</h3>
          <button class="modal-close" (click)="closeAccountSearch()">✕</button>
        </div>
        <div class="modal-body">
          <div class="account-search">
            <input type="text" 
                   [(ngModel)]="accountSearchTerm" 
                   placeholder="Rechercher par code ou libellé..."
                   class="search-input"
                   (keyup)="filterAccounts()">
            
            <div class="accounts-list">
              <div *ngFor="let account of filteredAccounts" 
                   class="account-item"
                   (click)="selectAccount(account)">
                <span class="account-code">{{ account.code }}</span>
                <span class="account-label">{{ account.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal des modèles -->
    <div class="modal-overlay" *ngIf="showTemplatesModal" (click)="showTemplatesModal = false">
      <div class="modal-content large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>📋 Modèles d'écritures</h3>
          <button class="modal-close" (click)="showTemplatesModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="templates-grid">
            <div *ngFor="let template of entryTemplates" 
                 class="template-card"
                 (click)="useTemplate(template)">
              <div class="template-header">
                <h4>{{ template.name }}</h4>
                <span class="template-category">{{ template.category }}</span>
              </div>
              <div class="template-description">{{ template.description }}</div>
              <div class="template-journal">Journal: {{ template.journalCode }}</div>
              <div class="template-lines">{{ template.lines.length }} lignes</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'import -->
    <div class="modal-overlay" *ngIf="showImportModal" (click)="showImportModal = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>📥 Importer des écritures</h3>
          <button class="modal-close" (click)="showImportModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="import-options">
            <div class="import-format">
              <h4>Format d'import</h4>
              <select class="form-select">
                <option>Excel (.xlsx)</option>
                <option>CSV (.csv)</option>
                <option>Format AUDCIF</option>
              </select>
            </div>
            
            <div class="file-upload">
              <div class="upload-zone" 
                   [class.dragover]="dragover"
                   (dragover)="onDragOver($event)"
                   (dragleave)="onDragLeave($event)"
                   (drop)="onDrop($event)">
                <i class="upload-icon">📁</i>
                <p>Glissez votre fichier ici ou cliquez pour sélectionner</p>
                <input type="file" 
                       #fileInput 
                       (change)="onFileSelected($event)"
                       accept=".xlsx,.csv"
                       style="display: none;">
                <button class="btn-secondary" (click)="fileInput.click()">
                  Choisir un fichier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .entries-container {
      padding: 24px;
      background: #f8fafc;
      min-height: 100vh;
    }

    .entries-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
    }

    .title-icon {
      font-size: 32px;
    }

    .quick-stats {
      display: flex;
      gap: 24px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 8px;
      min-width: 100px;
    }

    .stat-item.validated {
      background: #dcfce7;
      color: #16a34a;
    }

    .stat-item.amount {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
    }

    .stat-label {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn-primary, .btn-secondary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .filters-section {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 24px;
    }

    .search-box {
      position: relative;
      margin-bottom: 20px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
    }

    .search-input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .filter-controls {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-select, .date-input {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
    }

    .toggle-group {
      display: flex;
      gap: 16px;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      cursor: pointer;
    }

    .main-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .content-tabs {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 24px;
      border: none;
      background: none;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab-btn.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
      background: #f8fafc;
    }

    .tab-content {
      padding: 24px;
    }

    .entries-table {
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .table-header, .table-row {
      display: grid;
      grid-template-columns: 100px 80px 120px 120px 2fr 100px 100px 100px 120px;
      background: white;
    }

    .table-header {
      background: #f8fafc;
      font-weight: 600;
      color: #374151;
    }

    .header-cell, .table-cell {
      padding: 12px;
      display: flex;
      align-items: center;
    }

    .table-row.unbalanced {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
    }

    .table-row.draft {
      background: #fefce8;
    }

    .table-row.validated {
      background: #f0fdf4;
    }

    .journal-badge {
      padding: 4px 8px;
      border-radius: 4px;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.draft {
      background: #fef3c7;
      color: #d97706;
    }

    .status-badge.validated {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-badge.posted {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .amount {
      text-align: right;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 4px;
    }

    .action-btn {
      padding: 6px;
      border: none;
      background: #f3f4f6;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #e5e7eb;
    }

    .action-btn.danger:hover {
      background: #fecaca;
      color: #dc2626;
    }

    .entry-form-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .entry-header-form {
      background: #f8fafc;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 500;
      color: #374151;
    }

    .form-input, .form-select {
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .entry-lines-section {
      margin-bottom: 24px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h3 {
      margin: 0;
      color: #1e293b;
    }

    .lines-table {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .lines-header, .line-row {
      display: grid;
      grid-template-columns: 150px 2fr 120px 120px 150px 120px 100px;
      border-bottom: 1px solid #e5e7eb;
    }

    .lines-header {
      background: #f8fafc;
      font-weight: 600;
      color: #374151;
    }

    .line-cell {
      padding: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .line-row.error {
      background: #fef2f2;
    }

    .line-input, .line-select {
      width: 100%;
      padding: 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 14px;
    }

    .amount-input {
      text-align: right;
    }

    .account-search-btn {
      padding: 4px 8px;
      border: 1px solid #d1d5db;
      background: #f9fafb;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .line-action-btn {
      padding: 4px;
      border: none;
      background: #f3f4f6;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .line-action-btn:hover {
      background: #e5e7eb;
    }

    .line-action-btn.danger:hover {
      background: #fecaca;
    }

    .line-action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .totals-row {
      display: grid;
      grid-template-columns: 150px 2fr 120px 120px 150px 120px 100px;
      background: #f8fafc;
      border-top: 2px solid #3b82f6;
      font-weight: 600;
    }

    .total-cell {
      padding: 12px 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .total-cell.amount {
      justify-content: flex-end;
    }

    .balance-indicator {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .balance-indicator.balanced {
      background: #dcfce7;
      color: #16a34a;
    }

    .balance-indicator:not(.balanced) {
      background: #fecaca;
      color: #dc2626;
    }

    .error {
      color: #dc2626 !important;
    }

    .audcif-controls {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .audcif-controls h4 {
      margin: 0 0 12px 0;
      color: #0c4a6e;
    }

    .controls-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 4px;
    }

    .control-item.success {
      background: #dcfce7;
      color: #16a34a;
    }

    .control-item.warning {
      background: #fef3c7;
      color: #d97706;
    }

    .control-item.error {
      background: #fecaca;
      color: #dc2626;
    }

    .entry-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .validation-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .validation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .validation-actions {
      display: flex;
      gap: 12px;
    }

    .validation-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .validation-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .validation-item.selected {
      border-color: #3b82f6;
      background: #f0f9ff;
    }

    .validation-item.error {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .validation-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .entry-summary {
      display: flex;
      gap: 16px;
      font-weight: 500;
    }

    .entry-amounts {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: #6b7280;
    }

    .validation-status {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
    }

    .balance-check, .audcif-check {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .balance-check.balanced, .audcif-check.valid {
      background: #dcfce7;
      color: #16a34a;
    }

    .balance-check:not(.balanced), .audcif-check:not(.valid) {
      background: #fecaca;
      color: #dc2626;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content.large {
      max-width: 900px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      color: #1e293b;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 4px;
    }

    .modal-body {
      padding: 24px;
    }

    .account-search {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .accounts-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .account-item {
      display: flex;
      gap: 16px;
      padding: 12px;
      cursor: pointer;
      border-bottom: 1px solid #f1f5f9;
    }

    .account-item:hover {
      background: #f8fafc;
    }

    .account-code {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #1e293b;
      min-width: 80px;
    }

    .account-label {
      color: #6b7280;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .template-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .template-card:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .template-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .template-header h4 {
      margin: 0;
      color: #1e293b;
    }

    .template-category {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      color: #6b7280;
    }

    .template-description {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .template-journal, .template-lines {
      font-size: 12px;
      color: #9ca3af;
    }

    .import-options {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .upload-zone {
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 48px 24px;
      text-align: center;
      transition: all 0.2s;
    }

    .upload-zone.dragover {
      border-color: #3b82f6;
      background: #f0f9ff;
    }

    .upload-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .entries-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header-left {
        flex-direction: column;
        gap: 16px;
      }

      .quick-stats {
        justify-content: space-around;
      }

      .header-actions {
        justify-content: center;
      }

      .filter-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .table-header, .table-row {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(9, auto);
      }

      .lines-header, .line-row {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(7, auto);
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EntriesInputComponent {
  // Signals pour l'état du composant
  searchTerm = signal('');
  selectedJournal = signal('');
  selectedStatus = signal('');
  dateFrom = signal('');
  dateTo = signal('');
  showOnlyUnbalanced = signal(false);
  
  // Onglets
  activeTab = signal<'list' | 'entry' | 'validation'>('list');
  
  // Modals
  showImportModal = signal(false);
  showTemplatesModal = signal(false);
  showAccountSearchModal = signal(false);
  
  // État de l'écriture courante
  currentEntry = signal<JournalEntry | null>(null);
  currentLineIndex = signal(-1);
  
  // Recherche de comptes
  accountSearchTerm = signal('');
  filteredAccounts: Account[] = [];
  
  // Sélection pour validation
  selectedEntries = signal<string[]>([]);
  
  // Drag & drop
  dragover = signal(false);
  
  // Forms
  entryForm: FormGroup;

  // Données
  journals: Journal[] = [
    { code: 'VE', label: 'Ventes', type: 'VENTE', color: '#10b981', autoNumbering: true, prefix: 'VE' },
    { code: 'AC', label: 'Achats', type: 'ACHAT', color: '#f59e0b', autoNumbering: true, prefix: 'AC' },
    { code: 'BQ', label: 'Banque', type: 'BANQUE', color: '#3b82f6', autoNumbering: true, prefix: 'BQ' },
    { code: 'CA', label: 'Caisse', type: 'CAISSE', color: '#8b5cf6', autoNumbering: true, prefix: 'CA' },
    { code: 'OD', label: 'Opérations Diverses', type: 'OD', color: '#6b7280', autoNumbering: true, prefix: 'OD' }
  ];

  accounts: Account[] = [
    { code: '101000', label: 'Capital social', type: 'CREDIT', mandatory: true },
    { code: '411000', label: 'Clients', type: 'DEBIT', mandatory: false },
    { code: '401000', label: 'Fournisseurs', type: 'CREDIT', mandatory: false },
    { code: '512000', label: 'Banque', type: 'DEBIT', mandatory: false },
    { code: '531000', label: 'Caisse', type: 'DEBIT', mandatory: false },
    { code: '701000', label: 'Ventes de marchandises', type: 'CREDIT', mandatory: false },
    { code: '601000', label: 'Achats de marchandises', type: 'DEBIT', mandatory: false },
    { code: '445700', label: 'TVA collectée', type: 'CREDIT', mandatory: false },
    { code: '445200', label: 'TVA déductible', type: 'DEBIT', mandatory: false }
  ];

  tiersList = [
    { code: 'CLI001', name: 'SARL DISTRIBUTION PLUS' },
    { code: 'CLI002', name: 'ENTREPRISE KONE & FILS' },
    { code: 'FOU001', name: 'FOURNISSEUR GLOBAL SARL' }
  ];

  entries = signal<JournalEntry[]>([
    {
      id: '1',
      journalCode: 'VE',
      journalLabel: 'Ventes',
      entryNumber: 'VE2024001',
      date: new Date('2024-01-15'),
      reference: 'FAC-001',
      description: 'Vente marchandises Client SARL DISTRIBUTION',
      lines: [
        {
          id: '1-1',
          accountCode: '411000',
          accountLabel: 'Clients',
          debit: 2950000,
          credit: 0,
          description: 'Vente marchandises',
          tiers: 'CLI001'
        },
        {
          id: '1-2',
          accountCode: '701000',
          accountLabel: 'Ventes de marchandises',
          debit: 0,
          credit: 2500000,
          description: 'Vente marchandises'
        },
        {
          id: '1-3',
          accountCode: '445700',
          accountLabel: 'TVA collectée',
          debit: 0,
          credit: 450000,
          description: 'TVA 18%'
        }
      ],
      totalDebit: 2950000,
      totalCredit: 2950000,
      status: 'VALIDATED',
      createdBy: 'Admin',
      createdDate: new Date('2024-01-15'),
      validatedBy: 'Admin',
      validatedDate: new Date('2024-01-15'),
      origin: 'MANUAL'
    },
    {
      id: '2',
      journalCode: 'AC',
      journalLabel: 'Achats',
      entryNumber: 'AC2024001',
      date: new Date('2024-01-16'),
      reference: 'FACT-SUP-001',
      description: 'Achat fournitures bureau',
      lines: [
        {
          id: '2-1',
          accountCode: '601000',
          accountLabel: 'Achats de marchandises',
          debit: 1500000,
          credit: 0,
          description: 'Achat fournitures'
        },
        {
          id: '2-2',
          accountCode: '445200',
          accountLabel: 'TVA déductible',
          debit: 270000,
          credit: 0,
          description: 'TVA 18%'
        },
        {
          id: '2-3',
          accountCode: '401000',
          accountLabel: 'Fournisseurs',
          debit: 0,
          credit: 1770000,
          description: 'Achat fournitures',
          tiers: 'FOU001'
        }
      ],
      totalDebit: 1770000,
      totalCredit: 1770000,
      status: 'DRAFT',
      createdBy: 'Admin',
      createdDate: new Date('2024-01-16'),
      origin: 'MANUAL'
    }
  ]);

  entryTemplates: EntryTemplate[] = [
    {
      id: '1',
      name: 'Vente avec TVA',
      description: 'Modèle pour vente de marchandises avec TVA 18%',
      category: 'Ventes',
      journalCode: 'VE',
      isActive: true,
      lines: [
        {
          accountCode: '411000',
          accountLabel: 'Clients',
          debit: 0,
          credit: 0,
          description: 'Vente marchandises'
        },
        {
          accountCode: '701000',
          accountLabel: 'Ventes de marchandises',
          debit: 0,
          credit: 0,
          description: 'Vente marchandises'
        },
        {
          accountCode: '445700',
          accountLabel: 'TVA collectée',
          debit: 0,
          credit: 0,
          description: 'TVA 18%'
        }
      ]
    },
    {
      id: '2',
      name: 'Achat avec TVA',
      description: 'Modèle pour achat avec TVA déductible',
      category: 'Achats',
      journalCode: 'AC',
      isActive: true,
      lines: [
        {
          accountCode: '601000',
          accountLabel: 'Achats de marchandises',
          debit: 0,
          credit: 0,
          description: 'Achat marchandises'
        },
        {
          accountCode: '445200',
          accountLabel: 'TVA déductible',
          debit: 0,
          credit: 0,
          description: 'TVA 18%'
        },
        {
          accountCode: '401000',
          accountLabel: 'Fournisseurs',
          debit: 0,
          credit: 0,
          description: 'Achat marchandises'
        }
      ]
    }
  ];

  constructor(private fb: FormBuilder) {
    this.entryForm = this.fb.group({
      journalCode: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      entryNumber: [''],
      reference: [''],
      description: ['', Validators.required],
      lines: this.fb.array([])
    });

    this.filteredAccounts = this.accounts;
  }

  get entryLines() {
    return this.entryForm.get('lines') as FormArray;
  }

  // Computed properties
  filteredEntries = computed(() => {
    let filtered = this.entries();
    
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(entry => 
        entry.reference.toLowerCase().includes(term) ||
        entry.description.toLowerCase().includes(term) ||
        entry.lines.some(line => 
          line.accountCode.includes(term) || 
          line.accountLabel.toLowerCase().includes(term)
        )
      );
    }
    
    if (this.selectedJournal()) {
      filtered = filtered.filter(entry => entry.journalCode === this.selectedJournal());
    }
    
    if (this.selectedStatus()) {
      filtered = filtered.filter(entry => entry.status === this.selectedStatus());
    }
    
    if (this.showOnlyUnbalanced()) {
      filtered = filtered.filter(entry => !this.isEntryBalanced(entry));
    }
    
    return filtered;
  });

  draftEntriesCount = computed(() => 
    this.entries().filter(e => e.status === 'DRAFT').length
  );

  validatedEntriesCount = computed(() => 
    this.entries().filter(e => e.status === 'VALIDATED').length
  );

  totalAmount = computed(() => 
    this.entries().reduce((sum, e) => sum + e.totalDebit, 0)
  );

  // Méthodes de navigation
  setActiveTab(tab: 'list' | 'entry' | 'validation'): void {
    this.activeTab.set(tab);
  }

  // Méthodes de gestion des écritures
  createNewEntry(): void {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      journalCode: '',
      journalLabel: '',
      entryNumber: '',
      date: new Date(),
      reference: '',
      description: '',
      lines: [],
      totalDebit: 0,
      totalCredit: 0,
      status: 'DRAFT',
      createdBy: 'Admin',
      createdDate: new Date(),
      origin: 'MANUAL'
    };
    
    this.currentEntry.set(newEntry);
    this.initializeEntryForm();
    this.setActiveTab('entry');
  }

  editEntry(entry: JournalEntry): void {
    this.currentEntry.set({ ...entry });
    this.initializeEntryForm(entry);
    this.setActiveTab('entry');
  }

  duplicateEntry(entry: JournalEntry): void {
    const duplicated: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      entryNumber: '',
      reference: entry.reference + ' (Copie)',
      status: 'DRAFT',
      createdDate: new Date(),
      validatedBy: undefined,
      validatedDate: undefined
    };
    
    this.currentEntry.set(duplicated);
    this.initializeEntryForm(duplicated);
    this.setActiveTab('entry');
  }

  deleteEntry(entry: JournalEntry): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'écriture ${entry.entryNumber} ?`)) {
      this.entries.update(entries => entries.filter(e => e.id !== entry.id));
    }
  }

  validateEntry(entry: JournalEntry): void {
    if (this.isEntryBalanced(entry) && this.isAudcifCompliant(entry)) {
      this.entries.update(entries => 
        entries.map(e => 
          e.id === entry.id 
            ? { ...e, status: 'VALIDATED', validatedBy: 'Admin', validatedDate: new Date() }
            : e
        )
      );
      alert(`Écriture ${entry.entryNumber} validée avec succès !`);
    } else {
      alert('Impossible de valider : écriture déséquilibrée ou non conforme AUDCIF');
    }
  }

  // Méthodes du formulaire
  initializeEntryForm(entry?: JournalEntry): void {
    if (entry) {
      this.entryForm.patchValue({
        journalCode: entry.journalCode,
        date: entry.date.toISOString().split('T')[0],
        entryNumber: entry.entryNumber,
        reference: entry.reference,
        description: entry.description
      });
      
      // Vider le FormArray et ajouter les lignes
      while (this.entryLines.length !== 0) {
        this.entryLines.removeAt(0);
      }
      
      entry.lines.forEach(line => {
        this.entryLines.push(this.fb.group({
          accountCode: [line.accountCode, Validators.required],
          accountLabel: [line.accountLabel],
          debit: [line.debit || 0],
          credit: [line.credit || 0],
          tiers: [line.tiers || ''],
          dueDate: [line.dueDate ? line.dueDate.toISOString().split('T')[0] : '']
        }));
      });
    } else {
      this.entryForm.reset({
        date: new Date().toISOString().split('T')[0]
      });
      
      while (this.entryLines.length !== 0) {
        this.entryLines.removeAt(0);
      }
      
      // Ajouter 2 lignes par défaut
      this.addEntryLine();
      this.addEntryLine();
    }
  }

  onJournalChange(): void {
    const journalCode = this.entryForm.get('journalCode')?.value;
    const journal = this.journals.find(j => j.code === journalCode);
    
    if (journal && journal.autoNumbering) {
      // Générer le numéro automatiquement
      const nextNumber = this.getNextEntryNumber(journalCode);
      this.entryForm.patchValue({ entryNumber: nextNumber });
    }
  }

  getNextEntryNumber(journalCode: string): string {
    const existingEntries = this.entries().filter(e => e.journalCode === journalCode);
    const maxNumber = existingEntries.reduce((max, entry) => {
      const match = entry.entryNumber.match(/(\d+)$/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    
    return `${journalCode}${new Date().getFullYear()}${String(maxNumber + 1).padStart(3, '0')}`;
  }

  addEntryLine(): void {
    this.entryLines.push(this.fb.group({
      accountCode: ['', Validators.required],
      accountLabel: [''],
      debit: [0],
      credit: [0],
      tiers: [''],
      dueDate: ['']
    }));
  }

  removeLine(index: number): void {
    if (this.entryLines.length > 2) {
      this.entryLines.removeAt(index);
    }
  }

  insertLineAbove(index: number): void {
    this.entryLines.insert(index, this.fb.group({
      accountCode: ['', Validators.required],
      accountLabel: [''],
      debit: [0],
      credit: [0],
      tiers: [''],
      dueDate: ['']
    }));
  }

  insertLineBelow(index: number): void {
    this.entryLines.insert(index + 1, this.fb.group({
      accountCode: ['', Validators.required],
      accountLabel: [''],
      debit: [0],
      credit: [0],
      tiers: [''],
      dueDate: ['']
    }));
  }

  onAccountCodeChange(index: number): void {
    const accountCode = this.entryLines.at(index).get('accountCode')?.value;
    const account = this.accounts.find(a => a.code === accountCode);
    
    if (account) {
      this.entryLines.at(index).patchValue({
        accountLabel: account.label
      });
    }
  }

  onAmountChange(index: number, type: 'debit' | 'credit'): void {
    const line = this.entryLines.at(index);
    const amount = line.get(type)?.value || 0;
    
    if (amount > 0) {
      // Vider l'autre colonne
      const otherType = type === 'debit' ? 'credit' : 'debit';
      line.patchValue({ [otherType]: 0 });
    }
  }

  openAccountSearch(index: number): void {
    this.currentLineIndex.set(index);
    this.showAccountSearchModal.set(true);
    this.filteredAccounts = this.accounts;
  }

  closeAccountSearch(): void {
    this.showAccountSearchModal.set(false);
    this.currentLineIndex.set(-1);
    this.accountSearchTerm.set('');
  }

  filterAccounts(): void {
    const term = this.accountSearchTerm().toLowerCase();
    this.filteredAccounts = this.accounts.filter(account =>
      account.code.toLowerCase().includes(term) ||
      account.label.toLowerCase().includes(term)
    );
  }

  selectAccount(account: Account): void {
    const index = this.currentLineIndex();
    if (index >= 0) {
      this.entryLines.at(index).patchValue({
        accountCode: account.code,
        accountLabel: account.label
      });
    }
    this.closeAccountSearch();
  }

  searchAccount(index: number): void {
    this.openAccountSearch(index);
  }

  // Méthodes de validation
  getTotalDebit(): number {
    return this.entryLines.controls.reduce((sum, line) => 
      sum + (line.get('debit')?.value || 0), 0
    );
  }

  getTotalCredit(): number {
    return this.entryLines.controls.reduce((sum, line) => 
      sum + (line.get('credit')?.value || 0), 0
    );
  }

  isFormBalanced(): boolean {
    return Math.abs(this.getTotalDebit() - this.getTotalCredit()) < 0.01;
  }

  isEntryBalanced(entry: JournalEntry): boolean {
    return Math.abs(entry.totalDebit - entry.totalCredit) < 0.01;
  }

  hasLineErrors(index: number): boolean {
    const line = this.entryLines.at(index);
    return line.get('accountCode')?.invalid || false;
  }

  showAudcifControls(): boolean {
    return this.entryLines.length > 0 && this.entryForm.get('journalCode')?.value;
  }

  audcifValidations = computed(() => {
    const validations = [];
    
    // Contrôle équilibre
    if (this.isFormBalanced()) {
      validations.push({
        icon: '✅',
        message: 'Écriture équilibrée (Débit = Crédit)',
        status: 'OK'
      });
    } else {
      validations.push({
        icon: '❌',
        message: 'Écriture déséquilibrée - Vérifiez les montants',
        status: 'ERROR'
      });
    }
    
    // Contrôle comptes obligatoires
    const hasValidAccounts = this.entryLines.controls.every(line => 
      line.get('accountCode')?.value && line.get('accountLabel')?.value
    );
    
    if (hasValidAccounts) {
      validations.push({
        icon: '✅',
        message: 'Tous les comptes sont valides',
        status: 'OK'
      });
    } else {
      validations.push({
        icon: '⚠️',
        message: 'Certains comptes sont manquants ou invalides',
        status: 'WARNING'
      });
    }
    
    // Contrôle montants non nuls
    const hasNonZeroAmounts = this.entryLines.controls.some(line => 
      (line.get('debit')?.value || 0) > 0 || (line.get('credit')?.value || 0) > 0
    );
    
    if (hasNonZeroAmounts) {
      validations.push({
        icon: '✅',
        message: 'Montants renseignés',
        status: 'OK'
      });
    } else {
      validations.push({
        icon: '❌',
        message: 'Aucun montant renseigné',
        status: 'ERROR'
      });
    }
    
    return validations;
  });

  canSaveAsDraft(): boolean {
    return this.entryForm.get('description')?.valid || false;
  }

  canValidate(): boolean {
    return this.entryForm.valid && this.isFormBalanced() && this.entryLines.length >= 2;
  }

  isAudcifCompliant(entry: JournalEntry): boolean {
    return this.isEntryBalanced(entry) && 
           entry.lines.every(line => line.accountCode && line.accountLabel) &&
           entry.lines.some(line => line.debit > 0 || line.credit > 0);
  }

  // Actions de sauvegarde
  saveAsDraft(): void {
    if (this.canSaveAsDraft()) {
      this.saveEntry('DRAFT');
    }
  }

  validateAndSave(): void {
    if (this.canValidate()) {
      this.saveEntry('VALIDATED');
    }
  }

  saveEntry(status: 'DRAFT' | 'VALIDATED'): void {
    const formValue = this.entryForm.value;
    const current = this.currentEntry();
    
    if (!current) return;
    
    const updatedEntry: JournalEntry = {
      ...current,
      journalCode: formValue.journalCode,
      journalLabel: this.journals.find(j => j.code === formValue.journalCode)?.label || '',
      entryNumber: formValue.entryNumber,
      date: new Date(formValue.date),
      reference: formValue.reference,
      description: formValue.description,
      lines: formValue.lines.map((line: any, index: number) => ({
        id: `${current.id}-${index + 1}`,
        accountCode: line.accountCode,
        accountLabel: line.accountLabel,
        debit: line.debit || 0,
        credit: line.credit || 0,
        description: formValue.description,
        tiers: line.tiers,
        dueDate: line.dueDate ? new Date(line.dueDate) : undefined
      })),
      totalDebit: this.getTotalDebit(),
      totalCredit: this.getTotalCredit(),
      status,
      validatedBy: status === 'VALIDATED' ? 'Admin' : undefined,
      validatedDate: status === 'VALIDATED' ? new Date() : undefined
    };
    
    // Mettre à jour ou ajouter l'écriture
    const existingIndex = this.entries().findIndex(e => e.id === current.id);
    if (existingIndex >= 0) {
      this.entries.update(entries => 
        entries.map((e, i) => i === existingIndex ? updatedEntry : e)
      );
    } else {
      this.entries.update(entries => [...entries, updatedEntry]);
    }
    
    alert(`Écriture ${status === 'DRAFT' ? 'sauvée en brouillon' : 'validée'} avec succès !`);
    this.setActiveTab('list');
    this.currentEntry.set(null);
  }

  cancelEntry(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications non sauvées seront perdues.')) {
      this.setActiveTab('list');
      this.currentEntry.set(null);
    }
  }

  // Méthodes de validation par lot
  getDraftEntries(): JournalEntry[] {
    return this.entries().filter(e => e.status === 'DRAFT');
  }

  isEntrySelected(entryId: string): boolean {
    return this.selectedEntries().includes(entryId);
  }

  toggleEntrySelection(entryId: string): void {
    this.selectedEntries.update(selected => 
      selected.includes(entryId) 
        ? selected.filter(id => id !== entryId)
        : [...selected, entryId]
    );
  }

  selectAllDrafts(): void {
    const draftIds = this.getDraftEntries().map(e => e.id);
    this.selectedEntries.set(draftIds);
  }

  validateSelectedEntries(): void {
    const selected = this.selectedEntries();
    const validEntries = selected.filter(id => {
      const entry = this.entries().find(e => e.id === id);
      return entry && this.isEntryBalanced(entry) && this.isAudcifCompliant(entry);
    });
    
    if (validEntries.length === 0) {
      alert('Aucune écriture sélectionnée ne peut être validée (déséquilibrée ou non conforme)');
      return;
    }
    
    this.entries.update(entries => 
      entries.map(e => 
        validEntries.includes(e.id)
          ? { ...e, status: 'VALIDATED', validatedBy: 'Admin', validatedDate: new Date() }
          : e
      )
    );
    
    this.selectedEntries.set([]);
    alert(`${validEntries.length} écriture(s) validée(s) avec succès !`);
  }

  previewEntry(entry: JournalEntry): void {
    // Ici on pourrait ouvrir une modal de prévisualisation
    console.log('Preview entry:', entry);
  }

  // Méthodes des modèles
  useTemplate(template: EntryTemplate): void {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      journalCode: template.journalCode,
      journalLabel: this.journals.find(j => j.code === template.journalCode)?.label || '',
      entryNumber: '',
      date: new Date(),
      reference: '',
      description: template.description,
      lines: template.lines.map((line, index) => ({
        id: `${Date.now()}-${index}`,
        ...line
      })),
      totalDebit: 0,
      totalCredit: 0,
      status: 'DRAFT',
      createdBy: 'Admin',
      createdDate: new Date(),
      origin: 'TEMPLATE'
    };
    
    this.currentEntry.set(newEntry);
    this.initializeEntryForm(newEntry);
    this.showTemplatesModal.set(false);
    this.setActiveTab('entry');
  }

  // Méthodes utilitaires
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  getJournalColor(journalCode: string): string {
    return this.journals.find(j => j.code === journalCode)?.color || '#6b7280';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'VALIDATED': 'Validée',
      'POSTED': 'Comptabilisée'
    };
    return labels[status] || status;
  }

  // Méthodes d'import
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processImportFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processImportFile(file);
    }
  }

  processImportFile(file: File): void {
    console.log('Processing import file:', file.name);
    // Ici on implémenterait le traitement du fichier
    alert(`Import du fichier ${file.name} en cours de développement...`);
  }
}