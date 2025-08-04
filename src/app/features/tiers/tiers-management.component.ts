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
  
  // Contact
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  
  // Financier
  creditLimit: number;
  currentBalance: number;
  paymentTerms: number;
  
  // Scoring
  creditScore: number;
  riskLevel: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
  averagePaymentDelay: number;
  
  // Stats
  totalTransactions: number;
  totalAmount: number;
  overdueAmount: number;
  
  // Paramètres
  autoReminder: boolean;
  blockedForOrders: boolean;
  
  // Dates
  createdDate: Date;
  lastModified: Date;
}

@Component({
  selector: 'app-tiers-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="tiers-container">
      <!-- Header -->
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
          <button class="btn-secondary">
            <i>📥</i> Importer
          </button>
          <button class="btn-secondary">
            <i>📧</i> Relances
          </button>
          <button class="btn-primary" (click)="showAddModal = true">
            <i>➕</i> Nouveau Tiers
          </button>
        </div>
      </div>

      <!-- Filtres -->
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

          <div class="toggle-group">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="showOnlyOverdue">
              Impayés uniquement
            </label>
          </div>
        </div>
      </div>

      <!-- Liste des tiers -->
      <div class="main-content">
        <div class="tiers-grid">
          <div *ngFor="let tiers of filteredTiers()" 
               class="tiers-card"
               [class.client]="tiers.type === 'CLIENT'"
               [class.fournisseur]="tiers.type === 'FOURNISSEUR'"
               [class.overdue]="tiers.overdueAmount > 0">
            
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
                <button class="action-btn" (click)="editTiers(tiers)" title="Modifier">
                  <i>✏️</i>
                </button>
                <button class="action-btn" title="Transactions">
                  <i>📊</i>
                </button>
                <button class="action-btn" 
                        *ngIf="tiers.overdueAmount > 0"
                        (click)="sendReminder(tiers)"
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
                <span class="indicator blocked" *ngIf="tiers.blockedForOrders" title="Bloqué">
                  🚫
                </span>
                <span class="indicator reminder" *ngIf="tiers.autoReminder" title="Relances auto">
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
    </div>

    <!-- Modal d'ajout/modification -->
    <div class="modal-overlay" *ngIf="showAddModal || editingTiers" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingTiers ? '✏️ Modifier le tiers' : '➕ Nouveau tiers' }}</h3>
          <button class="modal-close" (click)="closeModal()">✕</button>
        </div>

        <div class="modal-body">
          <form [formGroup]="tiersForm" class="tiers-form">
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
              <label>Nom *</label>
              <input type="text" formControlName="name" class="form-input">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Ville *</label>
                <input type="text" formControlName="city" class="form-input">
              </div>
              <div class="form-group">
                <label>Pays *</label>
                <select formControlName="country" class="form-select">
                  <option value="CI">Côte d'Ivoire</option>
                  <option value="SN">Sénégal</option>
                  <option value="BF">Burkina Faso</option>
                  <option value="ML">Mali</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Adresse *</label>
              <textarea formControlName="address" class="form-textarea"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" formControlName="phone" class="form-input">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" formControlName="email" class="form-input">
              </div>
            </div>

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

            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="autoReminder">
                Relances automatiques
              </label>
              <label class="checkbox-label">
                <input type="checkbox" formControlName="blockedForOrders">
                Bloquer les commandes
              </label>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeModal()">
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
      background: white;
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

    .tiers-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
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

    .form-options {
      display: flex;
      gap: 20px;
      margin-top: 16px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
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
  showOnlyOverdue = signal(false);
  
  // Modals
  showAddModal = signal(false);
  editingTiers = signal<Tiers | null>(null);
  
  // Form
  tiersForm: FormGroup;

  // Données des tiers avec exemples réalistes
  tiersList = signal<Tiers[]>([
    {
      id: '1',
      code: 'CLI001',
      name: 'SARL DISTRIBUTION PLUS',
      type: 'CLIENT',
      category: 'Grande distribution',
      status: 'ACTIF',
      address: '15 Boulevard de la République',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      phone: '+225 20 21 22 23',
      email: 'contact@distribplus.ci',
      creditLimit: 50000000,
      currentBalance: 15000000,
      paymentTerms: 30,
      creditScore: 85,
      riskLevel: 'FAIBLE',
      averagePaymentDelay: 25,
      totalTransactions: 156,
      totalAmount: 450000000,
      overdueAmount: 0,
      autoReminder: true,
      blockedForOrders: false,
      createdDate: new Date('2023-01-10'),
      lastModified: new Date('2024-01-20')
    },
    {
      id: '2',
      code: 'CLI002',
      name: 'ENTREPRISE KONE & FILS',
      type: 'CLIENT',
      category: 'BTP',
      status: 'ACTIF',
      address: 'Zone Industrielle de Yopougon',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      phone: '+225 23 45 67 89',
      email: 'info@konebtp.ci',
      creditLimit: 25000000,
      currentBalance: 32000000,
      paymentTerms: 45,
      creditScore: 65,
      riskLevel: 'MOYEN',
      averagePaymentDelay: 52,
      totalTransactions: 89,
      totalAmount: 180000000,
      overdueAmount: 8500000,
      autoReminder: true,
      blockedForOrders: false,
      createdDate: new Date('2023-03-15'),
      lastModified: new Date('2024-01-18')
    },
    {
      id: '3',
      code: 'FOU001',
      name: 'FOURNISSEUR GLOBAL SARL',
      type: 'FOURNISSEUR',
      category: 'Fournitures bureau',
      status: 'ACTIF',
      address: 'Rue du Commerce, Plateau',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      phone: '+225 20 30 40 50',
      email: 'commercial@fourglobal.ci',
      creditLimit: 15000000,
      currentBalance: -5500000,
      paymentTerms: 30,
      creditScore: 78,
      riskLevel: 'FAIBLE',
      averagePaymentDelay: 28,
      totalTransactions: 234,
      totalAmount: 95000000,
      overdueAmount: 0,
      autoReminder: false,
      blockedForOrders: false,
      createdDate: new Date('2022-06-01'),
      lastModified: new Date('2024-01-22')
    },
    {
      id: '4',
      code: 'CLI003',
      name: 'PHARMACIE CENTRALE',
      type: 'CLIENT',
      category: 'Santé',
      status: 'ACTIF',
      address: 'Avenue Chardy, Cocody',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      phone: '+225 22 44 55 66',
      email: 'contact@pharmaciecentrale.ci',
      creditLimit: 20000000,
      currentBalance: 18500000,
      paymentTerms: 30,
      creditScore: 42,
      riskLevel: 'ELEVE',
      averagePaymentDelay: 65,
      totalTransactions: 67,
      totalAmount: 125000000,
      overdueAmount: 12000000,
      autoReminder: true,
      blockedForOrders: true,
      createdDate: new Date('2023-06-01'),
      lastModified: new Date('2024-01-15')
    },
    {
      id: '5',
      code: 'FOU002',
      name: 'IMPORT EXPORT DIALLO',
      type: 'FOURNISSEUR',
      category: 'Import/Export',
      status: 'ACTIF',
      address: 'Port Autonome d\'Abidjan',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      phone: '+225 21 35 46 57',
      email: 'diallo@importexport.ci',
      creditLimit: 75000000,
      currentBalance: -25000000,
      paymentTerms: 60,
      creditScore: 92,
      riskLevel: 'FAIBLE',
      averagePaymentDelay: 22,
      totalTransactions: 198,
      totalAmount: 380000000,
      overdueAmount: 0,
      autoReminder: false,
      blockedForOrders: false,
      createdDate: new Date('2022-01-15'),
      lastModified: new Date('2024-01-25')
    }
  ]);

  constructor(private fb: FormBuilder) {
    this.tiersForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      type: ['CLIENT', Validators.required],
      category: [''],
      status: ['ACTIF'],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['CI', Validators.required],
      phone: [''],
      email: [''],
      creditLimit: [0],
      paymentTerms: [30],
      creditScore: [50],
      riskLevel: ['MOYEN'],
      autoReminder: [false],
      blockedForOrders: [false]
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
    
    // Filtre impayés uniquement
    if (this.showOnlyOverdue()) {
      filtered = filtered.filter(tiers => tiers.overdueAmount > 0);
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

  // Méthodes
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
      alert(`Tiers "${formValue.name}" modifié avec succès !`);
    } else {
      // Création
      const newTiers: Tiers = {
        id: Date.now().toString(),
        ...formValue,
        totalTransactions: 0,
        totalAmount: 0,
        currentBalance: 0,
        overdueAmount: 0,
        averagePaymentDelay: 0,
        createdDate: new Date(),
        lastModified: new Date()
      };
      
      this.tiersList.update(list => [...list, newTiers]);
      alert(`Nouveau tiers "${formValue.name}" créé avec succès !`);
    }
    
    this.closeModal();
  }

  closeModal(): void {
    this.showAddModal.set(false);
    this.editingTiers.set(null);
    this.tiersForm.reset({
      type: 'CLIENT',
      status: 'ACTIF',
      country: 'CI',
      paymentTerms: 30,
      creditScore: 50,
      riskLevel: 'MOYEN'
    });
  }

  sendReminder(tiers: Tiers): void {
    alert(`Relance envoyée à ${tiers.name} pour ${this.formatCurrency(tiers.overdueAmount)} d'impayés`);
    // Ici on implémenterait l'envoi de relance
  }

  // Méthodes utilitaires
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
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
}