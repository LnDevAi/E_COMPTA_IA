import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Account {
  code: string;
  label: string;
  type: 'ACTIF' | 'PASSIF' | 'CHARGE' | 'PRODUIT' | 'RESULTAT';
  category: string;
  level: number;
  parent?: string;
  children?: Account[];
  active: boolean;
  mandatory: boolean;
  balance: number;
  lastModified: Date;
  createdBy: string;
}

interface ImportResult {
  success: boolean;
  totalAccounts: number;
  importedAccounts: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

interface ImportError {
  line: number;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ImportWarning {
  line: number;
  code: string;
  message: string;
  suggestion: string;
}

@Component({
  selector: 'app-chart-of-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="chart-container">
      <!-- Header avec actions principales -->
      <div class="chart-header">
        <div class="header-left">
          <h1 class="page-title">
            <i class="title-icon">📁</i>
            Plan Comptable AUDCIF
          </h1>
          <div class="compliance-badge">
            <i>✅</i>
            <span>Conforme SYSCOHADA</span>
          </div>
        </div>

        <div class="header-actions">
          <button class="btn-secondary" (click)="showImportModal = true">
            <i>📥</i> Importer
          </button>
          <button class="btn-secondary" (click)="exportChart()">
            <i>📤</i> Exporter
          </button>
          <button class="btn-primary" (click)="showAddAccountModal = true">
            <i>➕</i> Nouveau Compte
          </button>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="filters-section">
        <div class="search-box">
          <i class="search-icon">🔍</i>
          <input type="text" 
                 [(ngModel)]="searchTerm" 
                 placeholder="Rechercher par code ou libellé..."
                 class="search-input">
        </div>

        <div class="filter-controls">
          <select [(ngModel)]="selectedType" class="filter-select">
            <option value="">Tous les types</option>
            <option value="ACTIF">Actif</option>
            <option value="PASSIF">Passif</option>
            <option value="CHARGE">Charge</option>
            <option value="PRODUIT">Produit</option>
            <option value="RESULTAT">Résultat</option>
          </select>

          <select [(ngModel)]="selectedLevel" class="filter-select">
            <option value="">Tous les niveaux</option>
            <option value="1">Niveau 1 (Classes)</option>
            <option value="2">Niveau 2 (Comptes)</option>
            <option value="3">Niveau 3 (Sous-comptes)</option>
            <option value="4">Niveau 4 (Détail)</option>
          </select>

          <div class="toggle-group">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="showInactiveAccounts">
              Afficher inactifs
            </label>
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="showOnlyWithBalance">
              Avec solde uniquement
            </label>
          </div>
        </div>
      </div>

      <!-- Statistiques du plan comptable -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ filteredAccounts().length }}</div>
            <div class="stat-label">Comptes affichés</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ activeAccountsCount() }}</div>
            <div class="stat-label">Comptes actifs</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-value">{{ accountsWithBalanceCount() }}</div>
            <div class="stat-label">Avec solde</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🏛️</div>
          <div class="stat-content">
            <div class="stat-value">{{ mandatoryAccountsCount() }}</div>
            <div class="stat-label">Obligatoires AUDCIF</div>
          </div>
        </div>
      </div>

      <!-- Vue hiérarchique du plan comptable -->
      <div class="accounts-section">
        <div class="section-header">
          <h3>Structure Hiérarchique</h3>
          <div class="view-controls">
            <button class="view-btn" 
                    [class.active]="viewMode() === 'tree'"
                    (click)="setViewMode('tree')">
              <i>🌳</i> Arbre
            </button>
            <button class="view-btn" 
                    [class.active]="viewMode() === 'table'"
                    (click)="setViewMode('table')">
              <i>📋</i> Tableau
            </button>
            <button class="view-btn" 
                    [class.active]="viewMode() === 'cards'"
                    (click)="setViewMode('cards')">
              <i>🗃️</i> Cartes
            </button>
          </div>
        </div>

        <!-- Vue en arbre -->
        <div class="tree-view" *ngIf="viewMode() === 'tree'">
          <div *ngFor="let account of getTreeStructure()" class="tree-node">
            <div class="account-node" 
                 [class]="'level-' + account.level"
                 [class.inactive]="!account.active"
                 [class.mandatory]="account.mandatory">
              
              <div class="node-toggle" 
                   *ngIf="account.children && account.children.length > 0"
                   (click)="toggleNode(account.code)">
                <i>{{ isNodeExpanded(account.code) ? '▼' : '▶' }}</i>
              </div>

              <div class="account-info">
                <div class="account-code">{{ account.code }}</div>
                <div class="account-label">{{ account.label }}</div>
                <div class="account-type">{{ account.type }}</div>
                <div class="account-balance" *ngIf="account.balance !== 0">
                  {{ formatCurrency(account.balance) }}
                </div>
              </div>

              <div class="account-actions">
                <button class="action-btn" (click)="editAccount(account)" title="Modifier">
                  <i>✏️</i>
                </button>
                <button class="action-btn" (click)="duplicateAccount(account)" title="Dupliquer">
                  <i>📋</i>
                </button>
                <button class="action-btn danger" 
                        *ngIf="!account.mandatory"
                        (click)="deleteAccount(account)" 
                        title="Supprimer">
                  <i>🗑️</i>
                </button>
              </div>
            </div>

            <!-- Enfants du nœud -->
            <div class="tree-children" *ngIf="isNodeExpanded(account.code) && account.children">
              <div *ngFor="let child of account.children" 
                   class="account-node child"
                   [class.inactive]="!child.active"
                   [class.mandatory]="child.mandatory">
                
                <div class="account-info">
                  <div class="account-code">{{ child.code }}</div>
                  <div class="account-label">{{ child.label }}</div>
                  <div class="account-type">{{ child.type }}</div>
                  <div class="account-balance" *ngIf="child.balance !== 0">
                    {{ formatCurrency(child.balance) }}
                  </div>
                </div>

                <div class="account-actions">
                  <button class="action-btn" (click)="editAccount(child)">
                    <i>✏️</i>
                  </button>
                  <button class="action-btn" (click)="duplicateAccount(child)">
                    <i>📋</i>
                  </button>
                  <button class="action-btn danger" 
                          *ngIf="!child.mandatory"
                          (click)="deleteAccount(child)">
                    <i>🗑️</i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vue en tableau -->
        <div class="table-view" *ngIf="viewMode() === 'table'">
          <table class="accounts-table">
            <thead>
              <tr>
                <th (click)="sortBy('code')">
                  Code
                  <i class="sort-icon">{{ getSortIcon('code') }}</i>
                </th>
                <th (click)="sortBy('label')">
                  Libellé
                  <i class="sort-icon">{{ getSortIcon('label') }}</i>
                </th>
                <th (click)="sortBy('type')">
                  Type
                  <i class="sort-icon">{{ getSortIcon('type') }}</i>
                </th>
                <th (click)="sortBy('balance')">
                  Solde
                  <i class="sort-icon">{{ getSortIcon('balance') }}</i>
                </th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let account of filteredAccounts()" 
                  [class.inactive]="!account.active"
                  [class.mandatory]="account.mandatory">
                <td class="account-code">{{ account.code }}</td>
                <td class="account-label">{{ account.label }}</td>
                <td>
                  <span class="type-badge" [class]="account.type.toLowerCase()">
                    {{ account.type }}
                  </span>
                </td>
                <td class="account-balance">
                  {{ account.balance !== 0 ? formatCurrency(account.balance) : '-' }}
                </td>
                <td>
                  <div class="status-indicators">
                    <span class="status-badge active" *ngIf="account.active">Actif</span>
                    <span class="status-badge inactive" *ngIf="!account.active">Inactif</span>
                    <span class="status-badge mandatory" *ngIf="account.mandatory">AUDCIF</span>
                  </div>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="action-btn" (click)="editAccount(account)">
                      <i>✏️</i>
                    </button>
                    <button class="action-btn" (click)="duplicateAccount(account)">
                      <i>📋</i>
                    </button>
                    <button class="action-btn danger" 
                            *ngIf="!account.mandatory"
                            (click)="deleteAccount(account)">
                      <i>🗑️</i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vue en cartes -->
        <div class="cards-view" *ngIf="viewMode() === 'cards'">
          <div class="accounts-grid">
            <div *ngFor="let account of filteredAccounts()" 
                 class="account-card"
                 [class.inactive]="!account.active"
                 [class.mandatory]="account.mandatory">
              
              <div class="card-header">
                <div class="account-code">{{ account.code }}</div>
                <div class="card-actions">
                  <button class="action-btn" (click)="editAccount(account)">
                    <i>✏️</i>
                  </button>
                  <button class="action-btn danger" 
                          *ngIf="!account.mandatory"
                          (click)="deleteAccount(account)">
                    <i>🗑️</i>
                  </button>
                </div>
              </div>

              <div class="card-content">
                <h4 class="account-label">{{ account.label }}</h4>
                <div class="account-meta">
                  <span class="type-badge" [class]="account.type.toLowerCase()">
                    {{ account.type }}
                  </span>
                  <span class="level-badge">Niveau {{ account.level }}</span>
                </div>
                
                <div class="account-balance" *ngIf="account.balance !== 0">
                  <strong>{{ formatCurrency(account.balance) }}</strong>
                </div>

                <div class="card-status">
                  <span class="status-badge active" *ngIf="account.active">Actif</span>
                  <span class="status-badge inactive" *ngIf="!account.active">Inactif</span>
                  <span class="status-badge mandatory" *ngIf="account.mandatory">AUDCIF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'import -->
    <div class="modal-overlay" *ngIf="showImportModal" (click)="showImportModal = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>📥 Importer un plan comptable</h3>
          <button class="modal-close" (click)="showImportModal = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="import-tabs">
            <button class="tab-btn" 
                    [class.active]="importTab() === 'file'"
                    (click)="setImportTab('file')">
              📁 Fichier
            </button>
            <button class="tab-btn" 
                    [class.active]="importTab() === 'template'"
                    (click)="setImportTab('template')">
              📋 Modèle AUDCIF
            </button>
            <button class="tab-btn" 
                    [class.active]="importTab() === 'assistant'"
                    (click)="setImportTab('assistant')">
              🤖 Assistant IA
            </button>
          </div>

          <!-- Import fichier -->
          <div class="tab-content" *ngIf="importTab() === 'file'">
            <div class="upload-zone" 
                 [class.dragover]="dragover"
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event)">
              <i class="upload-icon">📁</i>
              <h4>Glissez-déposez votre fichier ici</h4>
              <p>Formats acceptés: Excel (.xlsx), CSV (.csv)</p>
              <button class="btn-upload" (click)="selectImportFile()">
                Parcourir les fichiers
              </button>
              <input type="file" 
                     #importFileInput
                     (change)="onImportFileSelected($event)"
                     accept=".xlsx,.csv"
                     style="display: none;">
            </div>

            <div class="import-options" *ngIf="importFile">
              <h4>Options d'import</h4>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="importOptions.validateAUDCIF">
                Valider la conformité AUDCIF
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="importOptions.mergeExisting">
                Fusionner avec le plan existant
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="importOptions.createBackup">
                Créer une sauvegarde avant import
              </label>
            </div>
          </div>

          <!-- Modèle AUDCIF -->
          <div class="tab-content" *ngIf="importTab() === 'template'">
            <div class="template-section">
              <h4>📋 Modèles SYSCOHADA AUDCIF</h4>
              <div class="template-grid">
                <div class="template-card" (click)="loadTemplate('standard')">
                  <i class="template-icon">🏢</i>
                  <h5>Standard AUDCIF</h5>
                  <p>Plan comptable complet conforme SYSCOHADA</p>
                </div>
                <div class="template-card" (click)="loadTemplate('minimal')">
                  <i class="template-icon">📝</i>
                  <h5>Minimal AUDCIF</h5>
                  <p>Comptes essentiels pour petites entreprises</p>
                </div>
                <div class="template-card" (click)="loadTemplate('commerce')">
                  <i class="template-icon">🛒</i>
                  <h5>Commerce AUDCIF</h5>
                  <p>Adapté aux activités commerciales</p>
                </div>
                <div class="template-card" (click)="loadTemplate('services')">
                  <i class="template-icon">⚙️</i>
                  <h5>Services AUDCIF</h5>
                  <p>Optimisé pour les prestations de services</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Assistant IA -->
          <div class="tab-content" *ngIf="importTab() === 'assistant'">
            <div class="ai-assistant-section">
              <h4>🤖 Assistant IA Intelligent</h4>
              <p>Décrivez votre activité et l'IA créera un plan comptable personnalisé</p>
              
              <form [formGroup]="aiAssistantForm" class="ai-form">
                <div class="form-group">
                  <label>Secteur d'activité</label>
                  <select formControlName="sector" class="form-select">
                    <option value="">Sélectionnez...</option>
                    <option value="COMMERCE">Commerce</option>
                    <option value="INDUSTRIE">Industrie</option>
                    <option value="SERVICES">Services</option>
                    <option value="AGRICULTURE">Agriculture</option>
                    <option value="BTP">BTP</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Description de l'activité</label>
                  <textarea formControlName="description" 
                            placeholder="Décrivez votre activité en détail..."
                            class="form-textarea"></textarea>
                </div>

                <div class="form-group">
                  <label>Taille de l'entreprise</label>
                  <select formControlName="size" class="form-select">
                    <option value="TPE">Très Petite Entreprise</option>
                    <option value="PE">Petite Entreprise</option>
                    <option value="ME">Moyenne Entreprise</option>
                    <option value="GE">Grande Entreprise</option>
                  </select>
                </div>

                <button type="button" 
                        class="btn-ai" 
                        [disabled]="!aiAssistantForm.valid || aiGenerating()"
                        (click)="generateAIPlan()">
                  <i>{{ aiGenerating() ? '⏳' : '🤖' }}</i>
                  {{ aiGenerating() ? 'Génération en cours...' : 'Générer le plan comptable' }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="showImportModal = false">
            Annuler
          </button>
          <button class="btn-primary" 
                  [disabled]="!canImport()"
                  (click)="executeImport()">
            Importer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification de compte -->
    <div class="modal-overlay" *ngIf="showAddAccountModal || editingAccount" (click)="closeAccountModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingAccount ? '✏️ Modifier le compte' : '➕ Nouveau compte' }}</h3>
          <button class="modal-close" (click)="closeAccountModal()">✕</button>
        </div>

        <div class="modal-body">
          <form [formGroup]="accountForm" class="account-form">
            <div class="form-row">
              <div class="form-group">
                <label>Code compte *</label>
                <input type="text" 
                       formControlName="code" 
                       placeholder="Ex: 411001"
                       class="form-input"
                       [class.error]="accountForm.get('code')?.invalid && accountForm.get('code')?.touched">
                <div class="validation-message" *ngIf="codeValidation()">
                  <i [class]="codeValidation()?.valid ? '✅' : '❌'"></i>
                  {{ codeValidation()?.message }}
                </div>
              </div>

              <div class="form-group">
                <label>Type *</label>
                <select formControlName="type" class="form-select">
                  <option value="">Sélectionnez...</option>
                  <option value="ACTIF">Actif</option>
                  <option value="PASSIF">Passif</option>
                  <option value="CHARGE">Charge</option>
                  <option value="PRODUIT">Produit</option>
                  <option value="RESULTAT">Résultat</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Libellé *</label>
              <input type="text" 
                     formControlName="label" 
                     placeholder="Ex: Clients - Ventes de marchandises"
                     class="form-input">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Compte parent</label>
                <select formControlName="parent" class="form-select">
                  <option value="">Aucun (compte racine)</option>
                  <option *ngFor="let parent of getParentAccounts()" [value]="parent.code">
                    {{ parent.code }} - {{ parent.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Catégorie</label>
                <input type="text" 
                       formControlName="category" 
                       placeholder="Ex: Créances clients"
                       class="form-input">
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="active">
                Compte actif
              </label>
              <label class="checkbox-label">
                <input type="checkbox" formControlName="mandatory" [disabled]="!canSetMandatory()">
                Obligatoire AUDCIF
              </label>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeAccountModal()">
            Annuler
          </button>
          <button class="btn-primary" 
                  [disabled]="!accountForm.valid"
                  (click)="saveAccount()">
            {{ editingAccount ? 'Modifier' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      padding: 24px;
      background: #f8fafc;
      min-height: 100vh;
    }

    .chart-header {
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
      gap: 16px;
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

    .compliance-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #dcfce7;
      color: #16a34a;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
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

    .filter-select {
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

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 32px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      border-radius: 8px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 14px;
      color: #6b7280;
    }

    .accounts-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .section-header h3 {
      margin: 0;
      color: #1e293b;
    }

    .view-controls {
      display: flex;
      gap: 8px;
    }

    .view-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .tree-view {
      padding: 24px;
    }

    .tree-node {
      margin-bottom: 8px;
    }

    .account-node {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .account-node:hover {
      background: #f8fafc;
      border-color: #3b82f6;
    }

    .account-node.inactive {
      opacity: 0.6;
      background: #f9fafb;
    }

    .account-node.mandatory {
      border-left: 4px solid #10b981;
    }

    .node-toggle {
      cursor: pointer;
      width: 20px;
      color: #6b7280;
    }

    .account-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .account-code {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #1e293b;
      min-width: 80px;
    }

    .account-label {
      flex: 1;
      color: #374151;
    }

    .account-type {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .account-type.actif { background: #dbeafe; color: #1d4ed8; }
    .account-type.passif { background: #fef3c7; color: #d97706; }
    .account-type.charge { background: #fee2e2; color: #dc2626; }
    .account-type.produit { background: #dcfce7; color: #16a34a; }
    .account-type.resultat { background: #f3e8ff; color: #7c3aed; }

    .account-balance {
      font-weight: 600;
      color: #1e293b;
      min-width: 120px;
      text-align: right;
    }

    .account-actions {
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
      background: #fee2e2;
      color: #dc2626;
    }

    .tree-children {
      margin-left: 32px;
      margin-top: 8px;
    }

    .account-node.child {
      background: #f8fafc;
    }

    .accounts-table {
      width: 100%;
      border-collapse: collapse;
    }

    .accounts-table th {
      background: #f8fafc;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;
    }

    .accounts-table th:hover {
      background: #f1f5f9;
    }

    .accounts-table td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    .accounts-table tr:hover {
      background: #f8fafc;
    }

    .accounts-table tr.inactive {
      opacity: 0.6;
    }

    .accounts-table tr.mandatory {
      border-left: 4px solid #10b981;
    }

    .type-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-indicators {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .status-badge {
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 500;
    }

    .status-badge.active {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-badge.inactive {
      background: #f3f4f6;
      color: #6b7280;
    }

    .status-badge.mandatory {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .table-actions {
      display: flex;
      gap: 4px;
    }

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      padding: 24px;
    }

    .account-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.2s;
    }

    .account-card:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .account-card.inactive {
      opacity: 0.6;
    }

    .account-card.mandatory {
      border-left: 4px solid #10b981;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .card-actions {
      display: flex;
      gap: 4px;
    }

    .card-content h4 {
      margin: 0 0 8px 0;
      color: #1e293b;
    }

    .account-meta {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .level-badge {
      padding: 2px 6px;
      background: #f1f5f9;
      color: #374151;
      border-radius: 10px;
      font-size: 10px;
    }

    .card-status {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin-top: 8px;
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
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
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

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .import-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .tab-btn {
      padding: 12px 16px;
      border: none;
      background: none;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab-btn.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .upload-zone {
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      transition: all 0.3s;
    }

    .upload-zone.dragover {
      border-color: #3b82f6;
      background: #f8fafc;
    }

    .upload-icon {
      font-size: 48px;
      margin-bottom: 16px;
      display: block;
    }

    .btn-upload {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 16px;
    }

    .import-options {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      cursor: pointer;
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .template-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .template-card:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
    }

    .template-icon {
      font-size: 32px;
      margin-bottom: 8px;
      display: block;
    }

    .template-card h5 {
      margin: 0 0 8px 0;
      color: #1e293b;
    }

    .template-card p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }

    .ai-form {
      max-width: 500px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }

    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .form-input.error {
      border-color: #ef4444;
    }

    .btn-ai {
      background: linear-gradient(45deg, #10b981, #3b82f6);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-ai:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .validation-message {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      font-size: 12px;
    }

    .form-options {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }

    .sort-icon {
      margin-left: 4px;
      opacity: 0.5;
    }

    @media (max-width: 768px) {
      .chart-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .filter-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .accounts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ChartOfAccountsComponent {
  // Signals pour l'état du composant
  searchTerm = signal('');
  selectedType = signal('');
  selectedLevel = signal('');
  showInactiveAccounts = signal(false);
  showOnlyWithBalance = signal(false);
  viewMode = signal<'tree' | 'table' | 'cards'>('tree');
  sortField = signal('code');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // Modals
  showImportModal = signal(false);
  showAddAccountModal = signal(false);
  editingAccount = signal<Account | null>(null);
  
  // Import
  importTab = signal<'file' | 'template' | 'assistant'>('file');
  importFile = signal<File | null>(null);
  dragover = signal(false);
  aiGenerating = signal(false);
  
  // Tree state
  expandedNodes = signal<Set<string>>(new Set());
  
  // Forms
  accountForm: FormGroup;
  aiAssistantForm: FormGroup;
  
  // Options
  importOptions = {
    validateAUDCIF: true,
    mergeExisting: false,
    createBackup: true
  };

  // Données du plan comptable AUDCIF
  accounts = signal<Account[]>([
    // Classe 1 - Comptes de ressources durables
    {
      code: '10',
      label: 'CAPITAL ET RESERVES',
      type: 'PASSIF',
      category: 'Capitaux propres',
      level: 1,
      active: true,
      mandatory: true,
      balance: 0,
      lastModified: new Date(),
      createdBy: 'system'
    },
    {
      code: '101',
      label: 'Capital social',
      type: 'PASSIF',
      category: 'Capital',
      level: 2,
      parent: '10',
      active: true,
      mandatory: true,
      balance: 50000000,
      lastModified: new Date(),
      createdBy: 'system'
    },
    {
      code: '106',
      label: 'Réserves',
      type: 'PASSIF',
      category: 'Réserves',
      level: 2,
      parent: '10',
      active: true,
      mandatory: true,
      balance: 12000000,
      lastModified: new Date(),
      createdBy: 'system'
    },
    
    // Classe 2 - Comptes d'actif immobilisé
    {
      code: '20',
      label: 'CHARGES IMMOBILISEES',
      type: 'ACTIF',
      category: 'Immobilisations incorporelles',
      level: 1,
      active: true,
      mandatory: true,
      balance: 0,
      lastModified: new Date(),
      createdBy: 'system'
    },
    {
      code: '21',
      label: 'IMMOBILISATIONS INCORPORELLES',
      type: 'ACTIF',
      category: 'Immobilisations incorporelles',
      level: 1,
      active: true,
      mandatory: true,
      balance: 0,
      lastModified: new Date(),
      createdBy: 'system'
    },
    {
      code: '24',
      label: 'MATERIELS',
      type: 'ACTIF',
      category: 'Immobilisations corporelles',
      level: 1,
      active: true,
      mandatory: true,
      balance: 0,
      lastModified: new Date(),
      createdBy: 'system'
    },
    {
      code: '241',
      label: 'Matériel et outillage industriel et commercial',
      type: 'ACTIF',
      category: 'Matériel',
      level: 2,
      parent: '24',
      active: true,
      mandatory: true,
      balance: 15000000,
      lastModified: new Date(),
      createdBy: 'system'
    },
    
    // Classe 4 - Comptes de tiers
    {
      code: '40',
      label: 'FOURNISSEURS ET COMPTES RATTACHES',
      type: 'PASSIF',
      category: 'Dettes fournisseurs',
      level: 1,
      active: true,
      mandatory: true,
      balance: 0,
      lastModified: new Date(),
      createdBy: 'system'
    },
    {
      code: '401',
      label: 'Fournisseurs, dettes en compte',
      type: 'PASSIF',
      category: 'Fournisseurs',
      level: 2,
      parent: '40',
      active: true,
      mandatory: true,
      balance: -8500000,
      lastModified: new Date(),
      createdBy: 'system'
    },
    {
      code: '41',
      label: 'CLIENTS ET COMPTES RATTACHES',
      type: 'ACTIF',
      category: 'Créances clients',
      level: 1,
      active: true,
      mandatory: true,
      balance: 0,
      lastModified: new Date(),
      createdBy: 'system'
    },
    {
      code: '411',
      label: 'Clients',
      type: 'ACTIF',
      category: 'Clients',
      level: 2,
      parent: '41',
      active: true,
      mandatory: true,
      balance: 32000000,
      lastModified: new Date(),
      createdBy: 'system'
    },
    
    // Classe 6 - Comptes de charges
    {
      code: '60',
      label: 'ACHATS ET VARIATIONS DE STOCKS',
      type: 'CHARGE',
      category: 'Achats',
      level: 1,
      active: true,
      mandatory: true,
      balance: 0,
      lastModified: new Date(),
      createdBy: 'system'
    },
    {
      code: '601',
      label: 'Achats de marchandises',
      type: 'CHARGE',
      category: 'Achats',
      level: 2,
      parent: '60',
      active: true,
      mandatory: true,
      balance: 85000000,
      lastModified: new Date(),
      createdBy: 'system'
    },
    
    // Classe 7 - Comptes de produits
    {
      code: '70',
      label: 'VENTES',
      type: 'PRODUIT',
      category: 'Ventes',
      level: 1,
      active: true,
      mandatory: true,
      balance: 0,
      lastModified: new Date(),
      createdBy: 'system'
    },
    {
      code: '701',
      label: 'Ventes de marchandises',
      type: 'PRODUIT',
      category: 'Ventes',
      level: 2,
      parent: '70',
      active: true,
      mandatory: true,
      balance: -125000000,
      lastModified: new Date(),
      createdBy: 'system'
    }
  ]);

  constructor(private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      label: ['', Validators.required],
      type: ['', Validators.required],
      parent: [''],
      category: [''],
      active: [true],
      mandatory: [false]
    });

    this.aiAssistantForm = this.fb.group({
      sector: ['', Validators.required],
      description: ['', Validators.required],
      size: ['PE', Validators.required]
    });
  }

  // Computed properties
  filteredAccounts = computed(() => {
    let filtered = this.accounts();
    
    // Filtre par recherche
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(acc => 
        acc.code.toLowerCase().includes(term) || 
        acc.label.toLowerCase().includes(term)
      );
    }
    
    // Filtre par type
    if (this.selectedType()) {
      filtered = filtered.filter(acc => acc.type === this.selectedType());
    }
    
    // Filtre par niveau
    if (this.selectedLevel()) {
      filtered = filtered.filter(acc => acc.level === parseInt(this.selectedLevel()));
    }
    
    // Filtre comptes inactifs
    if (!this.showInactiveAccounts()) {
      filtered = filtered.filter(acc => acc.active);
    }
    
    // Filtre comptes avec solde
    if (this.showOnlyWithBalance()) {
      filtered = filtered.filter(acc => acc.balance !== 0);
    }
    
    // Tri
    filtered.sort((a, b) => {
      const field = this.sortField();
      const direction = this.sortDirection() === 'asc' ? 1 : -1;
      
      if (field === 'balance') {
        return (a.balance - b.balance) * direction;
      }
      
      const aValue = a[field as keyof Account]?.toString() || '';
      const bValue = b[field as keyof Account]?.toString() || '';
      
      return aValue.localeCompare(bValue) * direction;
    });
    
    return filtered;
  });

  activeAccountsCount = computed(() => 
    this.accounts().filter(acc => acc.active).length
  );

  accountsWithBalanceCount = computed(() => 
    this.accounts().filter(acc => acc.balance !== 0).length
  );

  mandatoryAccountsCount = computed(() => 
    this.accounts().filter(acc => acc.mandatory).length
  );

  codeValidation = computed(() => {
    const code = this.accountForm.get('code')?.value;
    if (!code) return null;
    
    // Vérification unicité
    const exists = this.accounts().some(acc => 
      acc.code === code && acc !== this.editingAccount()
    );
    
    if (exists) {
      return { valid: false, message: 'Ce code existe déjà' };
    }
    
    // Vérification conformité AUDCIF
    const isAUDCIFCompliant = this.validateAUDCIFCode(code);
    if (!isAUDCIFCompliant.valid) {
      return isAUDCIFCompliant;
    }
    
    return { valid: true, message: 'Code valide et conforme AUDCIF' };
  });

  // Méthodes de navigation et affichage
  setViewMode(mode: 'tree' | 'table' | 'cards'): void {
    this.viewMode.set(mode);
  }

  sortBy(field: string): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField() !== field) return '↕️';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  toggleNode(code: string): void {
    const expanded = this.expandedNodes();
    if (expanded.has(code)) {
      expanded.delete(code);
    } else {
      expanded.add(code);
    }
    this.expandedNodes.set(new Set(expanded));
  }

  isNodeExpanded(code: string): boolean {
    return this.expandedNodes().has(code);
  }

  getTreeStructure(): Account[] {
    const accounts = this.filteredAccounts();
    const tree: Account[] = [];
    
    // Créer la structure hiérarchique
    accounts.forEach(account => {
      if (!account.parent) {
        const accountWithChildren = { ...account };
        accountWithChildren.children = this.getChildren(account.code, accounts);
        tree.push(accountWithChildren);
      }
    });
    
    return tree;
  }

  private getChildren(parentCode: string, accounts: Account[]): Account[] {
    return accounts.filter(acc => acc.parent === parentCode);
  }

  // Méthodes de gestion des comptes
  editAccount(account: Account): void {
    this.editingAccount.set(account);
    this.accountForm.patchValue({
      code: account.code,
      label: account.label,
      type: account.type,
      parent: account.parent || '',
      category: account.category,
      active: account.active,
      mandatory: account.mandatory
    });
  }

  duplicateAccount(account: Account): void {
    this.editingAccount.set(null);
    this.accountForm.patchValue({
      code: '',
      label: `Copie de ${account.label}`,
      type: account.type,
      parent: account.parent || '',
      category: account.category,
      active: account.active,
      mandatory: false
    });
    this.showAddAccountModal.set(true);
  }

  deleteAccount(account: Account): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le compte ${account.code} - ${account.label} ?`)) {
      this.accounts.update(accounts => 
        accounts.filter(acc => acc.code !== account.code)
      );
    }
  }

  saveAccount(): void {
    if (!this.accountForm.valid) return;
    
    const formValue = this.accountForm.value;
    const editing = this.editingAccount();
    
    if (editing) {
      // Modification
      this.accounts.update(accounts => 
        accounts.map(acc => 
          acc.code === editing.code 
            ? { ...acc, ...formValue, lastModified: new Date() }
            : acc
        )
      );
    } else {
      // Création
      const newAccount: Account = {
        ...formValue,
        level: this.calculateLevel(formValue.code),
        balance: 0,
        lastModified: new Date(),
        createdBy: 'user'
      };
      
      this.accounts.update(accounts => [...accounts, newAccount]);
    }
    
    this.closeAccountModal();
  }

  closeAccountModal(): void {
    this.showAddAccountModal.set(false);
    this.editingAccount.set(null);
    this.accountForm.reset();
  }

  getParentAccounts(): Account[] {
    const currentCode = this.accountForm.get('code')?.value;
    return this.accounts().filter(acc => 
      acc.level < this.calculateLevel(currentCode) && 
      acc.code !== currentCode
    );
  }

  canSetMandatory(): boolean {
    // Seuls les administrateurs peuvent marquer un compte comme obligatoire
    return true; // À adapter selon les droits utilisateur
  }

  // Méthodes d'import
  setImportTab(tab: 'file' | 'template' | 'assistant'): void {
    this.importTab.set(tab);
  }

  selectImportFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.csv';
    input.onchange = (e) => this.onImportFileSelected(e);
    input.click();
  }

  onImportFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.importFile.set(file);
    }
  }

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
      this.importFile.set(files[0]);
    }
  }

  loadTemplate(templateType: string): void {
    // Simulation du chargement de modèles AUDCIF
    console.log(`Chargement du modèle ${templateType}`);
    
    // Ici on chargerait les comptes du modèle sélectionné
    this.showImportModal.set(false);
    alert(`Modèle ${templateType} chargé avec succès !`);
  }

  generateAIPlan(): void {
    if (!this.aiAssistantForm.valid) return;
    
    this.aiGenerating.set(true);
    
    // Simulation de la génération IA
    setTimeout(() => {
      const formValue = this.aiAssistantForm.value;
      console.log('Génération IA pour:', formValue);
      
      // Ici on appellerait l'API IA pour générer le plan comptable
      this.aiGenerating.set(false);
      this.showImportModal.set(false);
      alert('Plan comptable généré par IA avec succès !');
    }, 3000);
  }

  canImport(): boolean {
    return this.importFile() !== null || 
           this.importTab() === 'template' || 
           (this.importTab() === 'assistant' && this.aiAssistantForm.valid);
  }

  executeImport(): void {
    console.log('Exécution de l\'import...');
    // Logique d'import selon le type sélectionné
    this.showImportModal.set(false);
  }

  // Méthodes utilitaires
  exportChart(): void {
    // Génération du fichier d'export
    const data = this.filteredAccounts();
    console.log('Export du plan comptable:', data);
    alert('Export en cours... Le fichier sera téléchargé automatiquement.');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  }

  private calculateLevel(code: string): number {
    return code.length;
  }

  private validateAUDCIFCode(code: string): { valid: boolean; message: string } {
    // Validation des règles AUDCIF
    if (code.length < 1 || code.length > 6) {
      return { valid: false, message: 'Code doit avoir entre 1 et 6 chiffres' };
    }
    
    const firstDigit = parseInt(code[0]);
    if (firstDigit < 1 || firstDigit > 8) {
      return { valid: false, message: 'Le premier chiffre doit être entre 1 et 8' };
    }
    
    return { valid: true, message: 'Code conforme AUDCIF' };
  }
}