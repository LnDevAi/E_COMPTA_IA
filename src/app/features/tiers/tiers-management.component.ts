import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Tiers {
  id: string;
  code: string;
  name: string;
  type: 'CLIENT' | 'FOURNISSEUR' | 'AUTRE';
  category: string;
  status: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
  
  // Informations générales
  legalName?: string;
  commercialName?: string;
  siret?: string;
  nif?: string;
  rccm?: string;
  
  // Contact
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  
  // Contact principal
  contactPerson?: string;
  contactTitle?: string;
  contactPhone?: string;
  contactEmail?: string;
  
  // Informations financières
  creditLimit: number;
  currentBalance: number;
  paymentTerms: number; // en jours
  paymentMethod: string;
  bankAccount?: string;
  
  // Scoring et risque
  creditScore: number; // 0-100
  riskLevel: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
  lastPaymentDate?: Date;
  averagePaymentDelay: number; // en jours
  
  // Statistiques
  totalTransactions: number;
  totalAmount: number;
  lastTransactionDate?: Date;
  createdDate: Date;
  lastModified: Date;
  
  // Relances
  overdueAmount: number;
  oldestOverdueDate?: Date;
  remindersSent: number;
  lastReminderDate?: Date;
  
  // Notes et documents
  notes?: string;
  documents: TiersDocument[];
  
  // Paramètres
  autoReminder: boolean;
  reminderFrequency: number; // en jours
  blockedForOrders: boolean;
}

interface TiersDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  url: string;
}

interface Transaction {
  id: string;
  tiersId: string;
  date: Date;
  type: 'FACTURE' | 'PAIEMENT' | 'AVOIR' | 'COMMANDE';
  reference: string;
  amount: number;
  balance: number;
  dueDate?: Date;
  status: 'EN_ATTENTE' | 'PAYE' | 'RETARD' | 'ANNULE';
  description: string;
}

interface ReminderTemplate {
  id: string;
  name: string;
  type: 'EMAIL' | 'SMS' | 'COURRIER';
  subject: string;
  content: string;
  delayDays: number;
}

@Component({
  selector: 'app-tiers-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="tiers-container">
      <!-- Header avec actions principales -->
      <div class="tiers-header">
        <div class="header-left">
          <h1 class="page-title">
            <i class="title-icon">👥</i>
            Gestion des Tiers
          </h1>
          <div class="quick-stats">
            <div class="stat-item">
              <span class="stat-value">{{ activeThirdParties() }}</span>
              <span class="stat-label">Actifs</span>
            </div>
            <div class="stat-item overdue">
              <span class="stat-value">{{ overdueCount() }}</span>
              <span class="stat-label">En retard</span>
            </div>
            <div class="stat-item amount">
              <span class="stat-value">{{ formatCurrency(totalOverdueAmount()) }}</span>
              <span class="stat-label">Impayés</span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button class="btn-secondary" (click)="showImportModal = true">
            <i>📥</i> Importer
          </button>
          <button class="btn-secondary" (click)="showReminderModal = true">
            <i>📧</i> Relances
          </button>
          <button class="btn-primary" (click)="showAddTiersModal = true">
            <i>➕</i> Nouveau Tiers
          </button>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="filters-section">
        <div class="search-box">
          <i class="search-icon">🔍</i>
          <input type="text" 
                 [(ngModel)]="searchTerm" 
                 placeholder="Rechercher par nom, code ou email..."
                 class="search-input">
        </div>

        <div class="filter-controls">
          <select [(ngModel)]="selectedType" class="filter-select">
            <option value="">Tous les types</option>
            <option value="CLIENT">Clients</option>
            <option value="FOURNISSEUR">Fournisseurs</option>
            <option value="AUTRE">Autres</option>
          </select>

          <select [(ngModel)]="selectedStatus" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
            <option value="SUSPENDU">Suspendu</option>
          </select>

          <select [(ngModel)]="selectedRisk" class="filter-select">
            <option value="">Tous les risques</option>
            <option value="FAIBLE">Risque faible</option>
            <option value="MOYEN">Risque moyen</option>
            <option value="ELEVE">Risque élevé</option>
            <option value="CRITIQUE">Risque critique</option>
          </select>

          <div class="toggle-group">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="showOnlyOverdue">
              Impayés uniquement
            </label>
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="showOnlyBlocked">
              Bloqués uniquement
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
            <i>📋</i> Liste des Tiers
          </button>
          <button class="tab-btn" 
                  [class.active]="activeTab() === 'dashboard'"
                  (click)="setActiveTab('dashboard')">
            <i>📊</i> Tableau de Bord
          </button>
          <button class="tab-btn" 
                  [class.active]="activeTab() === 'aging'"
                  (click)="setActiveTab('aging')">
            <i>⏰</i> Balance Âgée
          </button>
          <button class="tab-btn" 
                  [class.active]="activeTab() === 'reminders'"
                  (click)="setActiveTab('reminders')">
            <i>📧</i> Relances
          </button>
        </div>

        <!-- Liste des tiers -->
        <div class="tab-content" *ngIf="activeTab() === 'list'">
          <div class="tiers-grid">
            <div *ngFor="let tiers of filteredTiers()" 
                 class="tiers-card"
                 [class.client]="tiers.type === 'CLIENT'"
                 [class.fournisseur]="tiers.type === 'FOURNISSEUR'"
                 [class.overdue]="tiers.overdueAmount > 0"
                 [class.blocked]="tiers.blockedForOrders"
                 (click)="selectTiers(tiers)">
              
              <div class="card-header">
                <div class="tiers-info">
                  <div class="tiers-code">{{ tiers.code }}</div>
                  <div class="tiers-name">{{ tiers.name }}</div>
                  <div class="tiers-type">
                    <span class="type-badge" [class]="tiers.type.toLowerCase()">
                      {{ tiers.type }}
                    </span>
                  </div>
                </div>
                
                <div class="card-actions">
                  <button class="action-btn" (click)="editTiers(tiers); $event.stopPropagation()" title="Modifier">
                    <i>✏️</i>
                  </button>
                  <button class="action-btn" (click)="viewTransactions(tiers); $event.stopPropagation()" title="Transactions">
                    <i>📊</i>
                  </button>
                  <button class="action-btn" 
                          *ngIf="tiers.overdueAmount > 0"
                          (click)="sendReminder(tiers); $event.stopPropagation()" 
                          title="Relancer">
                    <i>📧</i>
                  </button>
                </div>
              </div>

              <div class="card-content">
                <div class="contact-info">
                  <div class="info-item" *ngIf="tiers.email">
                    <i>📧</i> {{ tiers.email }}
                  </div>
                  <div class="info-item" *ngIf="tiers.phone">
                    <i>📞</i> {{ tiers.phone }}
                  </div>
                  <div class="info-item">
                    <i>📍</i> {{ tiers.city }}, {{ tiers.country }}
                  </div>
                </div>

                <div class="financial-info">
                  <div class="balance-info">
                    <div class="balance-item">
                      <span class="label">Solde actuel:</span>
                      <span class="value" [class.negative]="tiers.currentBalance < 0">
                        {{ formatCurrency(tiers.currentBalance) }}
                      </span>
                    </div>
                    <div class="balance-item" *ngIf="tiers.overdueAmount > 0">
                      <span class="label">Impayés:</span>
                      <span class="value overdue">
                        {{ formatCurrency(tiers.overdueAmount) }}
                      </span>
                    </div>
                  </div>

                  <div class="credit-info">
                    <div class="credit-limit">
                      <span class="label">Limite crédit:</span>
                      <span class="value">{{ formatCurrency(tiers.creditLimit) }}</span>
                    </div>
                    <div class="credit-usage">
                      <div class="progress-bar">
                        <div class="progress-fill" 
                             [style.width.%]="getCreditUsagePercentage(tiers)"
                             [class.warning]="getCreditUsagePercentage(tiers) > 80"
                             [class.danger]="getCreditUsagePercentage(tiers) > 100">
                        </div>
                      </div>
                      <span class="percentage">{{ getCreditUsagePercentage(tiers) }}%</span>
                    </div>
                  </div>
                </div>

                <div class="scoring-info">
                  <div class="score-item">
                    <span class="label">Score crédit:</span>
                    <div class="score-display">
                      <div class="score-bar">
                        <div class="score-fill" 
                             [style.width.%]="tiers.creditScore"
                             [class]="getScoreClass(tiers.creditScore)">
                        </div>
                      </div>
                      <span class="score-value">{{ tiers.creditScore }}/100</span>
                    </div>
                  </div>

                  <div class="risk-item">
                    <span class="label">Niveau risque:</span>
                    <span class="risk-badge" [class]="tiers.riskLevel.toLowerCase()">
                      {{ tiers.riskLevel }}
                    </span>
                  </div>
                </div>

                <div class="stats-info">
                  <div class="stat-row">
                    <div class="stat-col">
                      <span class="stat-value">{{ tiers.totalTransactions }}</span>
                      <span class="stat-label">Transactions</span>
                    </div>
                    <div class="stat-col">
                      <span class="stat-value">{{ tiers.averagePaymentDelay }}j</span>
                      <span class="stat-label">Délai moyen</span>
                    </div>
                    <div class="stat-col">
                      <span class="stat-value">{{ formatCurrency(tiers.totalAmount) }}</span>
                      <span class="stat-label">CA Total</span>
                    </div>
                  </div>
                </div>

                <div class="status-indicators">
                  <span class="status-badge" [class]="tiers.status.toLowerCase()">
                    {{ tiers.status }}
                  </span>
                  <span class="indicator blocked" *ngIf="tiers.blockedForOrders" title="Bloqué pour commandes">
                    🚫
                  </span>
                  <span class="indicator reminder" *ngIf="tiers.autoReminder" title="Relances automatiques">
                    📧
                  </span>
                  <span class="indicator overdue" *ngIf="tiers.overdueAmount > 0" title="Impayés">
                    ⚠️
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard analytique -->
        <div class="tab-content" *ngIf="activeTab() === 'dashboard'">
          <div class="dashboard-grid">
            <!-- KPIs principaux -->
            <div class="kpi-section">
              <div class="kpi-card">
                <div class="kpi-icon">👥</div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ tiersList().length }}</div>
                  <div class="kpi-label">Total Tiers</div>
                </div>
              </div>

              <div class="kpi-card">
                <div class="kpi-icon">💰</div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ formatCurrency(totalReceivables()) }}</div>
                  <div class="kpi-label">Créances Totales</div>
                </div>
              </div>

              <div class="kpi-card warning">
                <div class="kpi-icon">⚠️</div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ formatCurrency(totalOverdueAmount()) }}</div>
                  <div class="kpi-label">Impayés</div>
                </div>
              </div>

              <div class="kpi-card">
                <div class="kpi-icon">📊</div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ averagePaymentDelay() }}j</div>
                  <div class="kpi-label">Délai Moyen</div>
                </div>
              </div>
            </div>

            <!-- Graphiques -->
            <div class="charts-section">
              <div class="chart-container">
                <h3>Répartition par Type</h3>
                <div class="chart-placeholder">
                  <!-- Graphique camembert sera intégré ici -->
                  <canvas #typeChart></canvas>
                </div>
              </div>

              <div class="chart-container">
                <h3>Évolution des Impayés</h3>
                <div class="chart-placeholder">
                  <!-- Graphique courbe sera intégré ici -->
                  <canvas #overdueChart></canvas>
                </div>
              </div>
            </div>

            <!-- Top listes -->
            <div class="top-lists">
              <div class="top-list">
                <h3>🏆 Top Clients (CA)</h3>
                <div class="list-items">
                  <div *ngFor="let tiers of getTopClients()" class="list-item">
                    <span class="item-name">{{ tiers.name }}</span>
                    <span class="item-value">{{ formatCurrency(tiers.totalAmount) }}</span>
                  </div>
                </div>
              </div>

              <div class="top-list">
                <h3>⚠️ Plus Gros Impayés</h3>
                <div class="list-items">
                  <div *ngFor="let tiers of getBiggestOverdue()" class="list-item">
                    <span class="item-name">{{ tiers.name }}</span>
                    <span class="item-value overdue">{{ formatCurrency(tiers.overdueAmount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Balance âgée -->
        <div class="tab-content" *ngIf="activeTab() === 'aging'">
          <div class="aging-section">
            <div class="aging-header">
              <h3>Balance Âgée des Créances</h3>
              <div class="aging-controls">
                <button class="btn-secondary" (click)="refreshAging()">
                  <i>🔄</i> Actualiser
                </button>
                <button class="btn-secondary" (click)="exportAging()">
                  <i>📤</i> Exporter
                </button>
              </div>
            </div>

            <div class="aging-table">
              <table class="table">
                <thead>
                  <tr>
                    <th>Tiers</th>
                    <th>Total</th>
                    <th>Non échu</th>
                    <th>1-30 jours</th>
                    <th>31-60 jours</th>
                    <th>61-90 jours</th>
                    <th>+ 90 jours</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let aging of getAgingData()" 
                      [class.overdue]="aging.overdue > 0">
                    <td>
                      <div class="tiers-cell">
                        <strong>{{ aging.name }}</strong>
                        <small>{{ aging.code }}</small>
                      </div>
                    </td>
                    <td class="amount">{{ formatCurrency(aging.total) }}</td>
                    <td class="amount">{{ formatCurrency(aging.notDue) }}</td>
                    <td class="amount" [class.overdue]="aging.days1to30 > 0">
                      {{ formatCurrency(aging.days1to30) }}
                    </td>
                    <td class="amount" [class.overdue]="aging.days31to60 > 0">
                      {{ formatCurrency(aging.days31to60) }}
                    </td>
                    <td class="amount" [class.overdue]="aging.days61to90 > 0">
                      {{ formatCurrency(aging.days61to90) }}
                    </td>
                    <td class="amount" [class.critical]="aging.daysOver90 > 0">
                      {{ formatCurrency(aging.daysOver90) }}
                    </td>
                    <td>
                      <div class="table-actions">
                        <button class="action-btn" (click)="viewTiersDetail(aging.id)">
                          <i>👁️</i>
                        </button>
                        <button class="action-btn" 
                                *ngIf="aging.overdue > 0"
                                (click)="sendReminder(getTiersById(aging.id))">
                          <i>📧</i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Gestion des relances -->
        <div class="tab-content" *ngIf="activeTab() === 'reminders'">
          <div class="reminders-section">
            <div class="reminders-header">
              <h3>Gestion des Relances</h3>
              <div class="reminder-actions">
                <button class="btn-secondary" (click)="showReminderTemplateModal = true">
                  <i>📝</i> Modèles
                </button>
                <button class="btn-primary" (click)="sendBulkReminders()">
                  <i>📧</i> Relances Automatiques
                </button>
              </div>
            </div>

            <div class="reminder-stats">
              <div class="stat-card">
                <div class="stat-value">{{ getOverdueTiers().length }}</div>
                <div class="stat-label">Tiers en retard</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ getTotalRemindersThisMonth() }}</div>
                <div class="stat-label">Relances ce mois</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ getResponseRate() }}%</div>
                <div class="stat-label">Taux de réponse</div>
              </div>
            </div>

            <div class="reminder-list">
              <div *ngFor="let tiers of getOverdueTiers()" class="reminder-item">
                <div class="reminder-info">
                  <div class="tiers-name">{{ tiers.name }}</div>
                  <div class="overdue-info">
                    <span class="amount">{{ formatCurrency(tiers.overdueAmount) }}</span>
                    <span class="days">{{ getDaysOverdue(tiers) }} jours de retard</span>
                  </div>
                  <div class="last-reminder" *ngIf="tiers.lastReminderDate">
                    Dernière relance: {{ formatDate(tiers.lastReminderDate) }}
                  </div>
                </div>

                <div class="reminder-actions">
                  <button class="btn-reminder email" (click)="sendEmailReminder(tiers)">
                    <i>📧</i> Email
                  </button>
                  <button class="btn-reminder sms" (click)="sendSMSReminder(tiers)">
                    <i>📱</i> SMS
                  </button>
                  <button class="btn-reminder call" (click)="scheduleCall(tiers)">
                    <i>📞</i> Appel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification de tiers -->
    <div class="modal-overlay" *ngIf="showAddTiersModal || editingTiers" (click)="closeTiersModal()">
      <div class="modal-content large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingTiers ? '✏️ Modifier le tiers' : '➕ Nouveau tiers' }}</h3>
          <button class="modal-close" (click)="closeTiersModal()">✕</button>
        </div>

        <div class="modal-body">
          <form [formGroup]="tiersForm" class="tiers-form">
            <!-- Onglets du formulaire -->
            <div class="form-tabs">
              <button type="button" class="form-tab" 
                      [class.active]="formTab() === 'general'"
                      (click)="setFormTab('general')">
                Général
              </button>
              <button type="button" class="form-tab" 
                      [class.active]="formTab() === 'contact'"
                      (click)="setFormTab('contact')">
                Contact
              </button>
              <button type="button" class="form-tab" 
                      [class.active]="formTab() === 'financial'"
                      (click)="setFormTab('financial')">
                Financier
              </button>
              <button type="button" class="form-tab" 
                      [class.active]="formTab() === 'settings'"
                      (click)="setFormTab('settings')">
                Paramètres
              </button>
            </div>

            <!-- Onglet Général -->
            <div class="form-content" *ngIf="formTab() === 'general'">
              <div class="form-row">
                <div class="form-group">
                  <label>Code tiers *</label>
                  <input type="text" formControlName="code" class="form-input">
                </div>
                <div class="form-group">
                  <label>Type *</label>
                  <select formControlName="type" class="form-select">
                    <option value="CLIENT">Client</option>
                    <option value="FOURNISSEUR">Fournisseur</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Nom commercial *</label>
                <input type="text" formControlName="name" class="form-input">
              </div>

              <div class="form-group">
                <label>Raison sociale</label>
                <input type="text" formControlName="legalName" class="form-input">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>SIRET</label>
                  <input type="text" formControlName="siret" class="form-input">
                </div>
                <div class="form-group">
                  <label>NIF</label>
                  <input type="text" formControlName="nif" class="form-input">
                </div>
                <div class="form-group">
                  <label>RCCM</label>
                  <input type="text" formControlName="rccm" class="form-input">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Catégorie</label>
                  <input type="text" formControlName="category" class="form-input">
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select formControlName="status" class="form-select">
                    <option value="ACTIF">Actif</option>
                    <option value="INACTIF">Inactif</option>
                    <option value="SUSPENDU">Suspendu</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Onglet Contact -->
            <div class="form-content" *ngIf="formTab() === 'contact'">
              <div class="form-group">
                <label>Adresse *</label>
                <textarea formControlName="address" class="form-textarea"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Ville *</label>
                  <input type="text" formControlName="city" class="form-input">
                </div>
                <div class="form-group">
                  <label>Code postal</label>
                  <input type="text" formControlName="postalCode" class="form-input">
                </div>
                <div class="form-group">
                  <label>Pays *</label>
                  <select formControlName="country" class="form-select">
                    <option value="CI">Côte d'Ivoire</option>
                    <option value="SN">Sénégal</option>
                    <option value="BF">Burkina Faso</option>
                    <option value="ML">Mali</option>
                    <option value="FR">France</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Téléphone</label>
                  <input type="tel" formControlName="phone" class="form-input">
                </div>
                <div class="form-group">
                  <label>Mobile</label>
                  <input type="tel" formControlName="mobile" class="form-input">
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" formControlName="email" class="form-input">
                </div>
              </div>

              <div class="form-group">
                <label>Site web</label>
                <input type="url" formControlName="website" class="form-input">
              </div>

              <h4>Contact principal</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Nom du contact</label>
                  <input type="text" formControlName="contactPerson" class="form-input">
                </div>
                <div class="form-group">
                  <label>Fonction</label>
                  <input type="text" formControlName="contactTitle" class="form-input">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Téléphone contact</label>
                  <input type="tel" formControlName="contactPhone" class="form-input">
                </div>
                <div class="form-group">
                  <label>Email contact</label>
                  <input type="email" formControlName="contactEmail" class="form-input">
                </div>
              </div>
            </div>

            <!-- Onglet Financier -->
            <div class="form-content" *ngIf="formTab() === 'financial'">
              <div class="form-row">
                <div class="form-group">
                  <label>Limite de crédit</label>
                  <input type="number" formControlName="creditLimit" class="form-input">
                </div>
                <div class="form-group">
                  <label>Délai de paiement (jours)</label>
                  <input type="number" formControlName="paymentTerms" class="form-input">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Mode de paiement</label>
                  <select formControlName="paymentMethod" class="form-select">
                    <option value="VIREMENT">Virement</option>
                    <option value="CHEQUE">Chèque</option>
                    <option value="ESPECES">Espèces</option>
                    <option value="CARTE">Carte bancaire</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Compte bancaire</label>
                  <input type="text" formControlName="bankAccount" class="form-input">
                </div>
              </div>

              <div class="scoring-section">
                <h4>Évaluation du risque</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label>Score de crédit (0-100)</label>
                    <input type="range" 
                           formControlName="creditScore" 
                           min="0" max="100" 
                           class="form-range">
                    <div class="range-value">{{ tiersForm.get('creditScore')?.value }}/100</div>
                  </div>
                  <div class="form-group">
                    <label>Niveau de risque</label>
                    <select formControlName="riskLevel" class="form-select">
                      <option value="FAIBLE">Faible</option>
                      <option value="MOYEN">Moyen</option>
                      <option value="ELEVE">Élevé</option>
                      <option value="CRITIQUE">Critique</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet Paramètres -->
            <div class="form-content" *ngIf="formTab() === 'settings'">
              <div class="settings-section">
                <h4>Relances automatiques</h4>
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="autoReminder">
                    Activer les relances automatiques
                  </label>
                </div>

                <div class="form-group" *ngIf="tiersForm.get('autoReminder')?.value">
                  <label>Fréquence des relances (jours)</label>
                  <select formControlName="reminderFrequency" class="form-select">
                    <option value="7">Hebdomadaire</option>
                    <option value="15">Bi-mensuelle</option>
                    <option value="30">Mensuelle</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="blockedForOrders">
                    Bloquer les nouvelles commandes
                  </label>
                </div>
              </div>

              <div class="notes-section">
                <h4>Notes et commentaires</h4>
                <div class="form-group">
                  <label>Notes internes</label>
                  <textarea formControlName="notes" 
                            class="form-textarea" 
                            rows="4"
                            placeholder="Notes internes sur ce tiers..."></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeTiersModal()">
            Annuler
          </button>
          <button class="btn-primary" 
                  [disabled]="!tiersForm.valid"
                  (click)="saveTiers()">
            {{ editingTiers ? 'Modifier' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de détail des transactions -->
    <div class="modal-overlay" *ngIf="showTransactionsModal" (click)="showTransactionsModal = false">
      <div class="modal-content large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>📊 Transactions - {{ selectedTiers()?.name }}</h3>
          <button class="modal-close" (click)="showTransactionsModal = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="transactions-summary">
            <div class="summary-item">
              <span class="label">Solde actuel:</span>
              <span class="value">{{ formatCurrency(selectedTiers()?.currentBalance || 0) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Impayés:</span>
              <span class="value overdue">{{ formatCurrency(selectedTiers()?.overdueAmount || 0) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total transactions:</span>
              <span class="value">{{ selectedTiers()?.totalTransactions || 0 }}</span>
            </div>
          </div>

          <div class="transactions-table">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Référence</th>
                  <th>Montant</th>
                  <th>Échéance</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let transaction of getTransactionsForTiers(selectedTiers()?.id || '')"
                    [class.overdue]="isTransactionOverdue(transaction)">
                  <td>{{ formatDate(transaction.date) }}</td>
                  <td>
                    <span class="type-badge" [class]="transaction.type.toLowerCase()">
                      {{ transaction.type }}
                    </span>
                  </td>
                  <td>{{ transaction.reference }}</td>
                  <td class="amount">{{ formatCurrency(transaction.amount) }}</td>
                  <td>{{ transaction.dueDate ? formatDate(transaction.dueDate) : '-' }}</td>
                  <td>
                    <span class="status-badge" [class]="transaction.status.toLowerCase()">
                      {{ transaction.status }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn" title="Voir détail">
                        <i>👁️</i>
                      </button>
                      <button class="action-btn" title="Modifier">
                        <i>✏️</i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tiers-container {
      padding: 24px;
      background: #f8fafc;
      min-height: 100vh;
    }

    .tiers-header {
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

    .stat-item.overdue {
      background: #fef3c7;
      color: #d97706;
    }

    .stat-item.amount {
      background: #dcfce7;
      color: #16a34a;
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

    .tiers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .tiers-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s;
      cursor: pointer;
    }

    .tiers-card:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .tiers-card.client {
      border-left: 4px solid #10b981;
    }

    .tiers-card.fournisseur {
      border-left: 4px solid #3b82f6;
    }

    .tiers-card.overdue {
      border-left: 4px solid #ef4444;
      background: #fef2f2;
    }

    .tiers-card.blocked {
      opacity: 0.7;
      background: #f9fafb;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .tiers-info {
      flex: 1;
    }

    .tiers-code {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #6b7280;
      font-size: 12px;
    }

    .tiers-name {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 4px 0;
    }

    .type-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .type-badge.client {
      background: #dcfce7;
      color: #16a34a;
    }

    .type-badge.fournisseur {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .type-badge.autre {
      background: #f3f4f6;
      color: #374151;
    }

    .card-actions {
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

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #6b7280;
    }

    .financial-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .balance-info {
      display: flex;
      justify-content: space-between;
    }

    .balance-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .balance-item .label {
      font-size: 12px;
      color: #6b7280;
    }

    .balance-item .value {
      font-weight: 600;
      color: #1e293b;
    }

    .balance-item .value.negative {
      color: #ef4444;
    }

    .balance-item .value.overdue {
      color: #ef4444;
    }

    .credit-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .credit-limit {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }

    .credit-usage {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #10b981;
      transition: width 0.3s ease;
    }

    .progress-fill.warning {
      background: #f59e0b;
    }

    .progress-fill.danger {
      background: #ef4444;
    }

    .percentage {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
    }

    .scoring-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .score-item, .risk-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .score-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .score-bar {
      width: 60px;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
    }

    .score-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .score-fill.excellent {
      background: #10b981;
    }

    .score-fill.good {
      background: #3b82f6;
    }

    .score-fill.average {
      background: #f59e0b;
    }

    .score-fill.poor {
      background: #ef4444;
    }

    .score-value {
      font-size: 12px;
      font-weight: 600;
    }

    .risk-badge {
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 500;
    }

    .risk-badge.faible {
      background: #dcfce7;
      color: #16a34a;
    }

    .risk-badge.moyen {
      background: #fef3c7;
      color: #d97706;
    }

    .risk-badge.eleve {
      background: #fed7d7;
      color: #dc2626;
    }

    .risk-badge.critique {
      background: #fecaca;
      color: #991b1b;
    }

    .stats-info {
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
    }

    .stat-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .stat-col .stat-value {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .stat-col .stat-label {
      font-size: 10px;
      color: #6b7280;
    }

    .status-indicators {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .status-badge {
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 500;
    }

    .status-badge.actif {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-badge.inactif {
      background: #f3f4f6;
      color: #6b7280;
    }

    .status-badge.suspendu {
      background: #fef3c7;
      color: #d97706;
    }

    .indicator {
      font-size: 14px;
    }

    .dashboard-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .kpi-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .kpi-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 16px;
      border-left: 4px solid #3b82f6;
    }

    .kpi-card.warning {
      border-left-color: #f59e0b;
    }

    .kpi-icon {
      font-size: 32px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      border-radius: 8px;
    }

    .kpi-content {
      flex: 1;
    }

    .kpi-value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .kpi-label {
      font-size: 14px;
      color: #6b7280;
    }

    .charts-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .chart-container h3 {
      margin-bottom: 16px;
      color: #1e293b;
    }

    .chart-placeholder {
      height: 300px;
      background: #f8fafc;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
    }

    .top-lists {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .top-list {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .top-list h3 {
      margin-bottom: 16px;
      color: #1e293b;
    }

    .list-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .item-name {
      font-weight: 500;
      color: #374151;
    }

    .item-value {
      font-weight: 600;
      color: #1e293b;
    }

    .item-value.overdue {
      color: #ef4444;
    }

    .aging-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .aging-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .aging-controls {
      display: flex;
      gap: 12px;
    }

    .aging-table {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th {
      background: #f8fafc;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }

    .table td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    .table tr:hover {
      background: #f8fafc;
    }

    .table tr.overdue {
      background: #fef2f2;
    }

    .tiers-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tiers-cell strong {
      color: #1e293b;
    }

    .tiers-cell small {
      color: #6b7280;
      font-size: 12px;
    }

    .amount {
      text-align: right;
      font-weight: 600;
    }

    .amount.overdue {
      color: #ef4444;
    }

    .amount.critical {
      color: #dc2626;
      background: #fef2f2;
    }

    .table-actions {
      display: flex;
      gap: 4px;
    }

    .reminders-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .reminders-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .reminder-actions {
      display: flex;
      gap: 12px;
    }

    .reminder-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .stat-card {
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
    }

    .reminder-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .reminder-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .reminder-info {
      flex: 1;
    }

    .tiers-name {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .overdue-info {
      display: flex;
      gap: 16px;
      margin-bottom: 4px;
    }

    .overdue-info .amount {
      color: #ef4444;
      font-weight: 600;
    }

    .overdue-info .days {
      color: #6b7280;
    }

    .last-reminder {
      font-size: 12px;
      color: #6b7280;
    }

    .reminder-actions {
      display: flex;
      gap: 8px;
    }

    .btn-reminder {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    }

    .btn-reminder.email {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .btn-reminder.sms {
      background: #dcfce7;
      color: #16a34a;
    }

    .btn-reminder.call {
      background: #fef3c7;
      color: #d97706;
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

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .form-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .form-tab {
      padding: 12px 16px;
      border: none;
      background: none;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .form-tab.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .form-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-weight: 500;
      color: #374151;
    }

    .form-input, .form-select, .form-textarea {
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
      min-height: 80px;
    }

    .form-range {
      width: 100%;
    }

    .range-value {
      text-align: center;
      font-weight: 600;
      color: #3b82f6;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .scoring-section, .settings-section, .notes-section {
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .scoring-section h4, .settings-section h4, .notes-section h4 {
      margin: 0 0 16px 0;
      color: #1e293b;
    }

    .transactions-summary {
      display: flex;
      justify-content: space-around;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .summary-item .label {
      font-size: 12px;
      color: #6b7280;
    }

    .summary-item .value {
      font-weight: 600;
      color: #1e293b;
    }

    .summary-item .value.overdue {
      color: #ef4444;
    }

    .transactions-table {
      overflow-x: auto;
    }

    .status-badge.en_attente {
      background: #fef3c7;
      color: #d97706;
    }

    .status-badge.paye {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-badge.retard {
      background: #fee2e2;
      color: #dc2626;
    }

    .status-badge.annule {
      background: #f3f4f6;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .tiers-header {
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

      .tiers-grid {
        grid-template-columns: 1fr;
      }

      .charts-section, .top-lists {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TiersManagementComponent {
  // Signals pour l'état du composant
  searchTerm = signal('');
  selectedType = signal('');
  selectedStatus = signal('');
  selectedRisk = signal('');
  showOnlyOverdue = signal(false);
  showOnlyBlocked = signal(false);
  
  // Onglets
  activeTab = signal<'list' | 'dashboard' | 'aging' | 'reminders'>('list');
  formTab = signal<'general' | 'contact' | 'financial' | 'settings'>('general');
  
  // Modals
  showAddTiersModal = signal(false);
  showImportModal = signal(false);
  showReminderModal = signal(false);
  showReminderTemplateModal = signal(false);
  showTransactionsModal = signal(false);
  
  // Sélection
  editingTiers = signal<Tiers | null>(null);
  selectedTiers = signal<Tiers | null>(null);
  
  // Forms
  tiersForm: FormGroup;

  // Données des tiers
  tiersList = signal<Tiers[]>([
    {
      id: '1',
      code: 'CLI001',
      name: 'SARL DISTRIBUTION PLUS',
      type: 'CLIENT',
      category: 'Grande distribution',
      status: 'ACTIF',
      legalName: 'SARL DISTRIBUTION PLUS',
      commercialName: 'DistribPlus',
      siret: '12345678901234',
      nif: 'NIF123456789',
      rccm: 'RCCM2023001',
      address: '15 Boulevard de la République',
      city: 'Abidjan',
      postalCode: '01 BP 1234',
      country: 'CI',
      phone: '+225 20 21 22 23',
      mobile: '+225 07 08 09 10',
      email: 'contact@distribplus.ci',
      website: 'www.distribplus.ci',
      contactPerson: 'Kouamé ASSI',
      contactTitle: 'Directeur Commercial',
      contactPhone: '+225 07 08 09 11',
      contactEmail: 'k.assi@distribplus.ci',
      creditLimit: 50000000,
      currentBalance: 15000000,
      paymentTerms: 30,
      paymentMethod: 'VIREMENT',
      bankAccount: 'CI05 BCI 01234567890123456789',
      creditScore: 85,
      riskLevel: 'FAIBLE',
      lastPaymentDate: new Date('2024-01-15'),
      averagePaymentDelay: 25,
      totalTransactions: 156,
      totalAmount: 450000000,
      lastTransactionDate: new Date('2024-01-20'),
      createdDate: new Date('2023-01-10'),
      lastModified: new Date('2024-01-20'),
      overdueAmount: 0,
      remindersSent: 0,
      autoReminder: true,
      reminderFrequency: 15,
      blockedForOrders: false,
      notes: 'Client premium avec excellent historique de paiement',
      documents: []
    },
    {
      id: '2',
      code: 'CLI002',
      name: 'ENTREPRISE KONE & FILS',
      type: 'CLIENT',
      category: 'BTP',
      status: 'ACTIF',
      legalName: 'ENTREPRISE KONE & FILS SARL',
      commercialName: 'KONE BTP',
      siret: '23456789012345',
      nif: 'NIF234567890',
      rccm: 'RCCM2023002',
      address: 'Zone Industrielle de Yopougon',
      city: 'Abidjan',
      postalCode: '23 BP 5678',
      country: 'CI',
      phone: '+225 23 45 67 89',
      email: 'info@konebtp.ci',
      contactPerson: 'Ibrahim KONE',
      contactTitle: 'Gérant',
      contactPhone: '+225 05 06 07 08',
      contactEmail: 'i.kone@konebtp.ci',
      creditLimit: 25000000,
      currentBalance: 32000000,
      paymentTerms: 45,
      paymentMethod: 'CHEQUE',
      creditScore: 65,
      riskLevel: 'MOYEN',
      lastPaymentDate: new Date('2023-12-20'),
      averagePaymentDelay: 52,
      totalTransactions: 89,
      totalAmount: 180000000,
      lastTransactionDate: new Date('2024-01-18'),
      createdDate: new Date('2023-03-15'),
      lastModified: new Date('2024-01-18'),
      overdueAmount: 8500000,
      oldestOverdueDate: new Date('2023-11-15'),
      remindersSent: 3,
      lastReminderDate: new Date('2024-01-10'),
      autoReminder: true,
      reminderFrequency: 7,
      blockedForOrders: false,
      notes: 'Retards de paiement récurrents, surveillance nécessaire',
      documents: []
    },
    {
      id: '3',
      code: 'FOU001',
      name: 'FOURNISSEUR GLOBAL SARL',
      type: 'FOURNISSEUR',
      category: 'Fournitures bureau',
      status: 'ACTIF',
      legalName: 'FOURNISSEUR GLOBAL SARL',
      address: 'Rue du Commerce, Plateau',
      city: 'Abidjan',
      postalCode: '08 BP 9012',
      country: 'CI',
      phone: '+225 20 30 40 50',
      email: 'commercial@fourglobal.ci',
      contactPerson: 'Marie DIABATE',
      contactTitle: 'Responsable Ventes',
      contactPhone: '+225 01 02 03 04',
      contactEmail: 'm.diabate@fourglobal.ci',
      creditLimit: 15000000,
      currentBalance: -5500000,
      paymentTerms: 30,
      paymentMethod: 'VIREMENT',
      creditScore: 78,
      riskLevel: 'FAIBLE',
      lastPaymentDate: new Date('2024-01-22'),
      averagePaymentDelay: 28,
      totalTransactions: 234,
      totalAmount: 95000000,
      lastTransactionDate: new Date('2024-01-22'),
      createdDate: new Date('2022-06-01'),
      lastModified: new Date('2024-01-22'),
      overdueAmount: 0,
      remindersSent: 0,
      autoReminder: false,
      reminderFrequency: 30,
      blockedForOrders: false,
      notes: 'Fournisseur fiable avec des prix compétitifs',
      documents: []
    }
  ]);

  // Données des transactions (simulation)
  transactions = signal<Transaction[]>([
    {
      id: '1',
      tiersId: '1',
      date: new Date('2024-01-20'),
      type: 'FACTURE',
      reference: 'FAC-2024-001',
      amount: 2500000,
      balance: 15000000,
      dueDate: new Date('2024-02-19'),
      status: 'EN_ATTENTE',
      description: 'Vente marchandises janvier'
    },
    {
      id: '2',
      tiersId: '1',
      date: new Date('2024-01-15'),
      type: 'PAIEMENT',
      reference: 'PAY-2024-001',
      amount: -3000000,
      balance: 12500000,
      status: 'PAYE',
      description: 'Règlement facture FAC-2023-156'
    },
    {
      id: '3',
      tiersId: '2',
      date: new Date('2024-01-18'),
      type: 'FACTURE',
      reference: 'FAC-2024-002',
      amount: 5500000,
      balance: 32000000,
      dueDate: new Date('2024-01-18'),
      status: 'RETARD',
      description: 'Travaux construction phase 2'
    }
  ]);

  constructor(private fb: FormBuilder) {
    this.tiersForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      type: ['CLIENT', Validators.required],
      category: [''],
      status: ['ACTIF'],
      legalName: [''],
      commercialName: [''],
      siret: [''],
      nif: [''],
      rccm: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: [''],
      country: ['CI', Validators.required],
      phone: [''],
      mobile: [''],
      email: [''],
      website: [''],
      contactPerson: [''],
      contactTitle: [''],
      contactPhone: [''],
      contactEmail: [''],
      creditLimit: [0],
      paymentTerms: [30],
      paymentMethod: ['VIREMENT'],
      bankAccount: [''],
      creditScore: [50],
      riskLevel: ['MOYEN'],
      autoReminder: [false],
      reminderFrequency: [15],
      blockedForOrders: [false],
      notes: ['']
    });
  }

  // Computed properties
  filteredTiers = computed(() => {
    let filtered = this.tiersList();
    
    // Filtre par recherche
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(tiers => 
        tiers.name.toLowerCase().includes(term) || 
        tiers.code.toLowerCase().includes(term) ||
        tiers.email?.toLowerCase().includes(term)
      );
    }
    
    // Filtre par type
    if (this.selectedType()) {
      filtered = filtered.filter(tiers => tiers.type === this.selectedType());
    }
    
    // Filtre par statut
    if (this.selectedStatus()) {
      filtered = filtered.filter(tiers => tiers.status === this.selectedStatus());
    }
    
    // Filtre par risque
    if (this.selectedRisk()) {
      filtered = filtered.filter(tiers => tiers.riskLevel === this.selectedRisk());
    }
    
    // Filtre impayés uniquement
    if (this.showOnlyOverdue()) {
      filtered = filtered.filter(tiers => tiers.overdueAmount > 0);
    }
    
    // Filtre bloqués uniquement
    if (this.showOnlyBlocked()) {
      filtered = filtered.filter(tiers => tiers.blockedForOrders);
    }
    
    return filtered;
  });

  activeThirdParties = computed(() => 
    this.tiersList().filter(t => t.status === 'ACTIF').length
  );

  overdueCount = computed(() => 
    this.tiersList().filter(t => t.overdueAmount > 0).length
  );

  totalOverdueAmount = computed(() => 
    this.tiersList().reduce((sum, t) => sum + t.overdueAmount, 0)
  );

  totalReceivables = computed(() => 
    this.tiersList()
      .filter(t => t.type === 'CLIENT')
      .reduce((sum, t) => sum + Math.max(0, t.currentBalance), 0)
  );

  averagePaymentDelay = computed(() => {
    const clients = this.tiersList().filter(t => t.type === 'CLIENT');
    if (clients.length === 0) return 0;
    return Math.round(clients.reduce((sum, t) => sum + t.averagePaymentDelay, 0) / clients.length);
  });

  // Méthodes de navigation
  setActiveTab(tab: 'list' | 'dashboard' | 'aging' | 'reminders'): void {
    this.activeTab.set(tab);
  }

  setFormTab(tab: 'general' | 'contact' | 'financial' | 'settings'): void {
    this.formTab.set(tab);
  }

  // Méthodes de gestion des tiers
  selectTiers(tiers: Tiers): void {
    this.selectedTiers.set(tiers);
    // Ici on pourrait ouvrir un panneau de détail
  }

  editTiers(tiers: Tiers): void {
    this.editingTiers.set(tiers);
    this.tiersForm.patchValue(tiers);
  }

  saveTiers(): void {
    if (!this.tiersForm.valid) return;
    
    const formValue = this.tiersForm.value;
    const editing = this.editingTiers();
    
    if (editing) {
      // Modification
      this.tiersList.update(list => 
        list.map(t => 
          t.id === editing.id 
            ? { ...t, ...formValue, lastModified: new Date() }
            : t
        )
      );
    } else {
      // Création
      const newTiers: Tiers = {
        id: Date.now().toString(),
        ...formValue,
        totalTransactions: 0,
        totalAmount: 0,
        currentBalance: 0,
        overdueAmount: 0,
        remindersSent: 0,
        createdDate: new Date(),
        lastModified: new Date(),
        documents: []
      };
      
      this.tiersList.update(list => [...list, newTiers]);
    }
    
    this.closeTiersModal();
  }

  closeTiersModal(): void {
    this.showAddTiersModal.set(false);
    this.editingTiers.set(null);
    this.tiersForm.reset({
      type: 'CLIENT',
      status: 'ACTIF',
      country: 'CI',
      paymentTerms: 30,
      paymentMethod: 'VIREMENT',
      creditScore: 50,
      riskLevel: 'MOYEN',
      reminderFrequency: 15
    });
    this.setFormTab('general');
  }

  // Méthodes utilitaires
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  getCreditUsagePercentage(tiers: Tiers): number {
    if (tiers.creditLimit === 0) return 0;
    return Math.round((Math.max(0, tiers.currentBalance) / tiers.creditLimit) * 100);
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }

  // Méthodes pour les analyses
  getTopClients(): Tiers[] {
    return this.tiersList()
      .filter(t => t.type === 'CLIENT')
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }

  getBiggestOverdue(): Tiers[] {
    return this.tiersList()
      .filter(t => t.overdueAmount > 0)
      .sort((a, b) => b.overdueAmount - a.overdueAmount)
      .slice(0, 5);
  }

  getAgingData(): any[] {
    // Simulation des données de balance âgée
    return this.tiersList()
      .filter(t => t.type === 'CLIENT' && t.currentBalance > 0)
      .map(t => ({
        id: t.id,
        name: t.name,
        code: t.code,
        total: t.currentBalance,
        notDue: Math.max(0, t.currentBalance - t.overdueAmount),
        days1to30: t.overdueAmount * 0.4,
        days31to60: t.overdueAmount * 0.3,
        days61to90: t.overdueAmount * 0.2,
        daysOver90: t.overdueAmount * 0.1,
        overdue: t.overdueAmount
      }));
  }

  getOverdueTiers(): Tiers[] {
    return this.tiersList().filter(t => t.overdueAmount > 0);
  }

  getTotalRemindersThisMonth(): number {
    // Simulation
    return this.tiersList().reduce((sum, t) => sum + t.remindersSent, 0);
  }

  getResponseRate(): number {
    // Simulation du taux de réponse aux relances
    return 65;
  }

  getDaysOverdue(tiers: Tiers): number {
    if (!tiers.oldestOverdueDate) return 0;
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - tiers.oldestOverdueDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getTiersById(id: string): Tiers | undefined {
    return this.tiersList().find(t => t.id === id);
  }

  getTransactionsForTiers(tiersId: string): Transaction[] {
    return this.transactions().filter(t => t.tiersId === tiersId);
  }

  isTransactionOverdue(transaction: Transaction): boolean {
    if (!transaction.dueDate) return false;
    return new Date() > transaction.dueDate && transaction.status !== 'PAYE';
  }

  // Méthodes d'actions
  viewTransactions(tiers: Tiers): void {
    this.selectedTiers.set(tiers);
    this.showTransactionsModal.set(true);
  }

  viewTiersDetail(tiersId: string): void {
    const tiers = this.getTiersById(tiersId);
    if (tiers) {
      this.selectTiers(tiers);
    }
  }

  sendReminder(tiers: Tiers): void {
    console.log('Envoi relance pour:', tiers.name);
    // Ici on implémenterait l'envoi de relance
    alert(`Relance envoyée à ${tiers.name}`);
  }

  sendEmailReminder(tiers: Tiers): void {
    console.log('Envoi email relance pour:', tiers.name);
    alert(`Email de relance envoyé à ${tiers.name}`);
  }

  sendSMSReminder(tiers: Tiers): void {
    console.log('Envoi SMS relance pour:', tiers.name);
    alert(`SMS de relance envoyé à ${tiers.name}`);
  }

  scheduleCall(tiers: Tiers): void {
    console.log('Planification appel pour:', tiers.name);
    alert(`Appel planifié pour ${tiers.name}`);
  }

  sendBulkReminders(): void {
    const overdueTiers = this.getOverdueTiers();
    console.log('Envoi relances automatiques pour:', overdueTiers.length, 'tiers');
    alert(`${overdueTiers.length} relances automatiques envoyées`);
  }

  refreshAging(): void {
    console.log('Actualisation balance âgée');
    alert('Balance âgée actualisée');
  }

  exportAging(): void {
    console.log('Export balance âgée');
    alert('Export de la balance âgée en cours...');
  }
}