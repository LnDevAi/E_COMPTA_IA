import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CompanyIdentityComponent } from './features/onboarding/company-identity.component';
import { ChartOfAccountsComponent } from './features/chart-of-accounts/chart-of-accounts.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, DashboardComponent, CompanyIdentityComponent, ChartOfAccountsComponent],
  template: `
    <div class="app-container">
      <!-- Sidebar Navigation -->
      <nav class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="logo">
            <i class="logo-icon">🧮</i>
            <span class="logo-text" *ngIf="!sidebarCollapsed()">E COMPTA IA</span>
          </div>
          <button class="sidebar-toggle" (click)="toggleSidebar()">
            <i>{{ sidebarCollapsed() ? '→' : '←' }}</i>
          </button>
        </div>

        <div class="nav-menu">
          <!-- Tableau de bord -->
          <a class="nav-item active" (click)="setActiveView('dashboard')">
            <i class="nav-icon">📊</i>
            <span class="nav-text" *ngIf="!sidebarCollapsed()">Tableau de Bord</span>
          </a>

          <!-- Identité Entreprise -->
          <a class="nav-item" (click)="setActiveView('identity')">
            <i class="nav-icon">🏢</i>
            <span class="nav-text" *ngIf="!sidebarCollapsed()">Identité Entreprise</span>
          </a>

          <!-- Plan Comptable -->
          <a class="nav-item" (click)="setActiveView('chart-accounts')">
            <i class="nav-icon">📁</i>
            <span class="nav-text" *ngIf="!sidebarCollapsed()">Plan Comptable</span>
          </a>

          <!-- Gestion Tiers -->
          <a class="nav-item" (click)="setActiveView('tiers')">
            <i class="nav-icon">👥</i>
            <span class="nav-text" *ngIf="!sidebarCollapsed()">Gestion Tiers</span>
          </a>

          <!-- Saisie Écritures -->
          <a class="nav-item" (click)="setActiveView('entries')">
            <i class="nav-icon">✍️</i>
            <span class="nav-text" *ngIf="!sidebarCollapsed()">Saisie Écritures</span>
          </a>

          <!-- Assistant IA -->
          <a class="nav-item ai-assistant" (click)="setActiveView('ai-assistant')">
            <i class="nav-icon">🤖</i>
            <span class="nav-text" *ngIf="!sidebarCollapsed()">Assistant IA</span>
            <span class="badge" *ngIf="!sidebarCollapsed()">NOUVEAU</span>
          </a>

          <!-- Journaux -->
          <a class="nav-item" (click)="setActiveView('journals')">
            <i class="nav-icon">📚</i>
            <span class="nav-text" *ngIf="!sidebarCollapsed()">Journaux</span>
          </a>

          <!-- Grands Livres -->
          <a class="nav-item" (click)="setActiveView('ledgers')">
            <i class="nav-icon">📖</i>
            <span class="nav-text" *ngIf="!sidebarCollapsed()">Grands Livres</span>
          </a>

          <!-- Balances -->
          <a class="nav-item" (click)="setActiveView('balances')">
            <i class="nav-icon">⚖️</i>
            <span class="nav-text" *ngIf="!sidebarCollapsed()">Balances</span>
          </a>

          <!-- Rapprochements -->
          <a class="nav-item" (click)="setActiveView('reconciliations')">
            <i class="nav-icon">🏦</i>
            <span class="nav-text" *ngIf="!sidebarCollapsed()">Rapprochements</span>
          </a>

          <!-- États Financiers -->
          <a class="nav-item" (click)="setActiveView('statements')">
            <i class="nav-icon">📊</i>
            <span class="nav-text" *ngIf="!sidebarCollapsed()">États Financiers</span>
          </a>

          <!-- Déclarations -->
          <a class="nav-item" (click)="setActiveView('declarations')">
            <i class="nav-icon">🏛️</i>
            <span class="nav-text" *ngIf="!sidebarCollapsed()">Déclarations</span>
          </a>
        </div>

        <!-- User section -->
        <div class="sidebar-footer">
          <div class="user-info" *ngIf="!sidebarCollapsed()">
            <div class="user-avatar">👤</div>
            <div class="user-details">
              <div class="user-name">Utilisateur</div>
              <div class="user-role">Administrateur</div>
            </div>
          </div>
          <button class="logout-btn" title="Déconnexion">
            <i>🚪</i>
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="main-content" [class.expanded]="sidebarCollapsed()">
        <div class="content-area">
          <!-- Dashboard par défaut -->
          <app-dashboard *ngIf="activeView() === 'dashboard'"></app-dashboard>
          
          <!-- Identité Entreprise -->
          <app-company-identity *ngIf="activeView() === 'identity'"></app-company-identity>
          
          <!-- Plan Comptable -->
          <app-chart-of-accounts *ngIf="activeView() === 'chart-accounts'"></app-chart-of-accounts>
          
          <!-- Autres vues seront ajoutées ici -->
          <div *ngIf="activeView() !== 'dashboard' && activeView() !== 'identity' && activeView() !== 'chart-accounts'" class="coming-soon">
            <h2>{{ getViewTitle(activeView()) }}</h2>
            <p>Module en cours de développement...</p>
            <div class="progress-indicator">
              <div class="progress-bar" [style.width.%]="getModuleProgress(activeView())"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      background: #f8fafc;
    }

    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
      color: white;
      transition: width 0.3s ease;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid #475569;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 28px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(45deg, #10b981, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .sidebar-toggle {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: background 0.2s;
    }

    .sidebar-toggle:hover {
      background: rgba(255,255,255,0.1);
    }

    .nav-menu {
      flex: 1;
      padding: 20px 0;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: #cbd5e1;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .nav-item.active {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border-left-color: #10b981;
    }

    .nav-item.ai-assistant {
      position: relative;
    }

    .nav-icon {
      font-size: 20px;
      min-width: 20px;
    }

    .nav-text {
      font-weight: 500;
    }

    .badge {
      background: #ef4444;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: auto;
    }

    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid #475569;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: #3b82f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      font-size: 14px;
    }

    .user-role {
      font-size: 12px;
      color: #94a3b8;
    }

    .logout-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 18px;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .main-content {
      flex: 1;
      transition: margin-left 0.3s ease;
      overflow: hidden;
    }

    .main-content.expanded {
      margin-left: 0;
    }

    .content-area {
      height: 100%;
      overflow-y: auto;
    }

    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 40px;
    }

    .coming-soon h2 {
      font-size: 32px;
      color: #1e293b;
      margin-bottom: 16px;
    }

    .coming-soon p {
      font-size: 18px;
      color: #6b7280;
      margin-bottom: 32px;
    }

    .progress-indicator {
      width: 300px;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #3b82f6);
      transition: width 0.3s ease;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 70px;
      }
      
      .sidebar.collapsed {
        width: 0;
      }
    }
  `]
})
export class App {
  sidebarCollapsed = signal(false);
  activeView = signal('dashboard');

  toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  setActiveView(view: string): void {
    this.activeView.set(view);
  }

  getViewTitle(view: string): string {
    const titles: Record<string, string> = {
      'identity': 'Identité Entreprise',
      'chart-accounts': 'Plan Comptable',
      'tiers': 'Gestion Tiers',
      'entries': 'Saisie Écritures',
      'ai-assistant': 'Assistant IA',
      'journals': 'Journaux',
      'ledgers': 'Grands Livres',
      'balances': 'Balances',
      'reconciliations': 'Rapprochements',
      'statements': 'États Financiers',
      'declarations': 'Déclarations'
    };
    return titles[view] || view;
  }

  getModuleProgress(view: string): number {
    const progress: Record<string, number> = {
      'dashboard': 100,
      'identity': 100,
      'chart-accounts': 100,
      'tiers': 5,
      'entries': 8,
      'ai-assistant': 20,
      'journals': 5,
      'ledgers': 5,
      'balances': 5,
      'reconciliations': 5,
      'statements': 5,
      'declarations': 5
    };
    return progress[view] || 0;
  }
}
