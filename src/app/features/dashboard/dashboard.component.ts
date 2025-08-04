import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <!-- Header avec informations entreprise -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">
          <i class="icon-dashboard"></i>
          Tableau de Bord - {{ companyName() }}
        </h1>
        <div class="period-selector">
          <select [(ngModel)]="selectedPeriod" class="period-select">
            <option value="current">Période courante</option>
            <option value="previous">Mois précédent</option>
            <option value="year">Année en cours</option>
          </select>
        </div>
      </div>

      <!-- KPIs AUDCIF principaux -->
      <div class="kpis-grid">
        <!-- Chiffre d'affaires -->
        <div class="kpi-card revenue" (click)="drillDown('revenue')">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <h3>Chiffre d'Affaires</h3>
            <div class="kpi-value">{{ formatCurrency(revenueKPI().current) }}</div>
            <div class="kpi-evolution" [class.positive]="revenueKPI().evolution > 0" [class.negative]="revenueKPI().evolution < 0">
              {{ revenueKPI().evolution > 0 ? '+' : '' }}{{ revenueKPI().evolution }}%
            </div>
          </div>
          <div class="kpi-progress">
            <div class="progress-bar" [style.width.%]="revenueKPI().progress"></div>
          </div>
        </div>

        <!-- Résultat Net -->
        <div class="kpi-card profit" (click)="drillDown('profit')">
          <div class="kpi-icon">📈</div>
          <div class="kpi-content">
            <h3>Résultat Net</h3>
            <div class="kpi-value">{{ formatCurrency(profitKPI().current) }}</div>
            <div class="kpi-evolution" [class.positive]="profitKPI().evolution > 0" [class.negative]="profitKPI().evolution < 0">
              {{ profitKPI().evolution > 0 ? '+' : '' }}{{ profitKPI().evolution }}%
            </div>
          </div>
          <div class="kpi-progress">
            <div class="progress-bar" [style.width.%]="profitKPI().progress"></div>
          </div>
        </div>

        <!-- Trésorerie -->
        <div class="kpi-card treasury" (click)="drillDown('treasury')">
          <div class="kpi-icon">🏦</div>
          <div class="kpi-content">
            <h3>Trésorerie</h3>
            <div class="kpi-value">{{ formatCurrency(treasuryKPI().current) }}</div>
            <div class="kpi-status" [class]="treasuryKPI().status">
              {{ treasuryKPI().statusText }}
            </div>
          </div>
          <div class="multi-currency">
            <span>FCFA: {{ formatCurrency(treasuryKPI().fcfa) }}</span>
            <span>EUR: {{ formatCurrency(treasuryKPI().eur) }}</span>
          </div>
        </div>

        <!-- Créances clients -->
        <div class="kpi-card receivables" (click)="drillDown('receivables')">
          <div class="kpi-icon">👥</div>
          <div class="kpi-content">
            <h3>Créances Clients</h3>
            <div class="kpi-value">{{ formatCurrency(receivablesKPI().current) }}</div>
            <div class="kpi-details">
              <span class="overdue">En retard: {{ formatCurrency(receivablesKPI().overdue) }}</span>
            </div>
          </div>
          <div class="aging-indicator">
            <div class="aging-0-30" [style.width.%]="receivablesKPI().aging030"></div>
            <div class="aging-30-60" [style.width.%]="receivablesKPI().aging3060"></div>
            <div class="aging-60+" [style.width.%]="receivablesKPI().aging60plus"></div>
          </div>
        </div>
      </div>

      <!-- Graphiques AUDCIF -->
      <div class="charts-section">
        <div class="chart-container">
          <h3>Évolution du Chiffre d'Affaires</h3>
          <div class="chart-placeholder">
            <!-- Recharts sera intégré ici -->
            <canvas #revenueChart></canvas>
          </div>
        </div>

        <div class="chart-container">
          <h3>Répartition des Charges</h3>
          <div class="chart-placeholder">
            <!-- Graphique camembert -->
            <canvas #expensesChart></canvas>
          </div>
        </div>
      </div>

      <!-- Alertes AUDCIF -->
      <div class="alerts-section" *ngIf="alerts().length > 0">
        <h3>🚨 Alertes Comptables</h3>
        <div class="alerts-list">
          <div *ngFor="let alert of alerts()" class="alert-item" [class]="alert.severity">
            <i [class]="alert.icon"></i>
            <span>{{ alert.message }}</span>
            <button (click)="resolveAlert(alert.id)">Traiter</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      background: #f8fafc;
      min-height: 100vh;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .dashboard-title {
      font-size: 28px;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .icon-dashboard::before {
      content: '📊';
      font-size: 32px;
    }

    .period-selector select {
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: white;
    }

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .kpi-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 4px solid;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .kpi-card.revenue { border-left-color: #10b981; }
    .kpi-card.profit { border-left-color: #3b82f6; }
    .kpi-card.treasury { border-left-color: #8b5cf6; }
    .kpi-card.receivables { border-left-color: #f59e0b; }

    .kpi-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    .kpi-content h3 {
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .kpi-value {
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .kpi-evolution {
      font-size: 14px;
      font-weight: 500;
    }

    .kpi-evolution.positive { color: #10b981; }
    .kpi-evolution.negative { color: #ef4444; }

    .kpi-progress {
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 12px;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #3b82f6);
      transition: width 0.3s ease;
    }

    .multi-currency {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #6b7280;
      margin-top: 8px;
    }

    .charts-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
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

    .alerts-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .alert-item.warning {
      background: #fef3c7;
      border-left-color: #f59e0b;
    }

    .alert-item.error {
      background: #fee2e2;
      border-left-color: #ef4444;
    }

    .alert-item button {
      margin-left: auto;
      padding: 6px 12px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .kpis-grid {
        grid-template-columns: 1fr;
      }
      
      .charts-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent {
  companyName = signal('VOTRE ENTREPRISE SARL');
  selectedPeriod = signal('current');

  // KPIs calculés
  revenueKPI = computed(() => ({
    current: 125000000, // FCFA
    evolution: 15.5,
    progress: 75
  }));

  profitKPI = computed(() => ({
    current: 18500000, // FCFA
    evolution: 8.2,
    progress: 62
  }));

  treasuryKPI = computed(() => ({
    current: 45000000, // FCFA
    fcfa: 45000000,
    eur: 68580, // Conversion automatique
    status: 'good',
    statusText: 'Bonne santé'
  }));

  receivablesKPI = computed(() => ({
    current: 32000000,
    overdue: 8500000,
    aging030: 60,
    aging3060: 25,
    aging60plus: 15
  }));

  alerts = signal([
    {
      id: 1,
      severity: 'warning',
      icon: '⚠️',
      message: 'Rapprochement bancaire en attente depuis 5 jours'
    },
    {
      id: 2,
      severity: 'error',
      icon: '🚨',
      message: 'Déclaration TVA à déposer avant le 15/12'
    }
  ]);

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  drillDown(kpiType: string): void {
    console.log(`Drill-down vers ${kpiType}`);
    // Navigation vers le détail du KPI
  }

  resolveAlert(alertId: number): void {
    this.alerts.update(alerts => 
      alerts.filter(alert => alert.id !== alertId)
    );
  }
}