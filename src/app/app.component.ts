import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BankReconciliationComponent } from './components/bank-reconciliation/bank-reconciliation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="logo">
            <h1>🧮 E-COMPTA-IA</h1>
            <span class="subtitle">Plateforme Comptable SYSCOHADA + IA</span>
          </div>
          <nav class="nav">
            <a class="nav-btn" href="#/dashboard" routerLink="/dashboard" routerLinkActive="active">📊 Tableau de Bord</a>
            <a class="nav-btn" href="#/bank-reconciliation" routerLink="/bank-reconciliation" routerLinkActive="active">🏦 Rapprochements</a>
            <a class="nav-btn" href="#/financial-statements" routerLink="/financial-statements" routerLinkActive="active">📈 États Financiers</a>
            <a class="nav-btn" href="#/journals" routerLink="/journals" routerLinkActive="active">📓 Journaux</a>
            <a class="nav-btn" href="#/ledgers" routerLink="/ledgers" routerLinkActive="active">📚 Grands livres</a>
            <a class="nav-btn" href="#/chart-of-accounts" routerLink="/chart-of-accounts" routerLinkActive="active">🧾 Plan comptable</a>
            <a class="nav-btn" href="#/tax-declarations" routerLink="/tax-declarations" routerLinkActive="active">📋 Déclarations</a>
            <a class="nav-btn enterprise" href="#/enterprise" routerLink="/enterprise" routerLinkActive="active">🏢 Entreprise</a>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <p>&copy; 2025 E-COMPTA-IA | SYSCOHADA AUDCIF | Version 1.0.0 | 
          <span class="status">🟢 Modules Production Actifs</span>
        </p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem;
    }

    .logo h1 {
      margin: 0;
      color: #2d3748;
      font-size: 1.8rem;
      font-weight: bold;
    }

    .subtitle {
      color: #718096;
      font-size: 0.9rem;
      font-weight: normal;
    }

    .nav {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .nav-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 25px;
      background: linear-gradient(135deg, #4299e1, #3182ce);
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .nav-btn.enterprise {
      background: linear-gradient(135deg, #9f7aea, #805ad5);
    }

    .nav-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .nav-btn.active {
      background: linear-gradient(135deg, #38a169, #2f855a);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .module-placeholder {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      padding: 3rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      text-align: center;
      border: 2px dashed #e2e8f0;
    }

    .module-placeholder h2 {
      color: #4a5568;
      margin: 0 0 1rem 0;
      font-size: 2rem;
    }

    .module-placeholder p {
      color: #718096;
      font-size: 1.1rem;
      margin: 0;
    }

    .module-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .module-header h1 {
      color: #2d3748;
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
    }

    .module-header p {
      color: #718096;
      font-size: 1.2rem;
      margin: 0;
    }

    .functional-module {
      display: grid;
      gap: 2rem;
    }

    .feature-showcase h3 {
      color: #2d3748;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .feature-item {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
    }

    .feature-item:hover {
      border-color: #4299e1;
      transform: translateY(-3px);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 1rem;
    }

    .feature-item h4 {
      color: #2d3748;
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
    }

    .feature-item p {
      color: #718096;
      margin: 0 0 1rem 0;
      font-size: 0.95rem;
    }

    .feature-btn {
      background: linear-gradient(135deg, #4299e1, #3182ce);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
    }

    .feature-btn:hover {
      background: linear-gradient(135deg, #3182ce, #2c5282);
      transform: translateY(-2px);
    }

    .live-demo {
      background: #f7fafc;
      border-radius: 12px;
      padding: 2rem;
    }

    .live-demo h3 {
      color: #2d3748;
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
    }

    .demo-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .stat-box {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .stat-box h4 {
      color: #718096;
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .amount {
      font-size: 1.8rem;
      font-weight: bold;
      color: #2d3748;
      margin: 0;
    }

    .amount.difference {
      color: #e53e3e;
    }

    .matched {
      font-size: 1.5rem;
      font-weight: bold;
      color: #38a169;
      margin: 0;
    }

    .ratio {
      font-size: 1.8rem;
      font-weight: bold;
      color: #4299e1;
      margin: 0;
    }

    .trend {
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 15px;
      margin-top: 0.5rem;
      display: inline-block;
    }

    .trend.up {
      background: #c6f6d5;
      color: #2f855a;
    }

    .status {
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 15px;
      margin-top: 0.5rem;
      display: inline-block;
    }

    .status.good {
      background: #c6f6d5;
      color: #2f855a;
    }

    .status.urgent {
      background: #fed7d7;
      color: #e53e3e;
    }

    .status.ok {
      background: #bee3f8;
      color: #3182ce;
    }

    .tax-calendar {
      display: grid;
      gap: 1rem;
    }

    .tax-item {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .tax-item.urgent {
      border-left: 4px solid #e53e3e;
    }

    .tax-item.upcoming {
      border-left: 4px solid #4299e1;
    }

    .ai-interface {
      display: grid;
      gap: 2rem;
    }

    .chat-container {
      display: flex;
      align-items: center;
      gap: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 15px;
    }

    .ai-avatar-large {
      font-size: 4rem;
      background: rgba(255, 255, 255, 0.2);
      padding: 1.5rem;
      border-radius: 50%;
    }

    .ai-intro h3 {
      margin: 0 0 1rem 0;
      font-size: 1.8rem;
    }

    .ai-intro ul {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }

    .ai-intro li {
      margin: 0.5rem 0;
    }

    .quick-questions {
      background: #f7fafc;
      border-radius: 12px;
      padding: 1.5rem;
    }

    .quick-questions h4 {
      color: #2d3748;
      margin: 0 0 1rem 0;
    }

    .question-btn {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 25px;
      padding: 0.75rem 1.5rem;
      margin: 0.5rem 0.5rem 0.5rem 0;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .question-btn:hover {
      border-color: #4299e1;
      background: #f0f8ff;
    }

    .chat-interface {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .chat-input {
      display: flex;
      gap: 1rem;
    }

    .chat-input input {
      flex: 1;
      padding: 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 25px;
      font-size: 1rem;
    }

    .send-btn {
      background: linear-gradient(135deg, #4299e1, #3182ce);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
    }

    .enterprise-dashboard {
      display: grid;
      gap: 2rem;
    }

    .company-info, .users-section {
      background: #f7fafc;
      border-radius: 12px;
      padding: 2rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      background: white;
      border-radius: 8px;
    }

    .info-item label {
      font-weight: 600;
      color: #718096;
    }

    .info-item span {
      color: #2d3748;
    }

    .users-list {
      margin: 1rem 0;
    }

    .user-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }

    .user-status.active {
      background: #c6f6d5;
      color: #2f855a;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
    }

    .edit-btn, .add-btn {
      background: linear-gradient(135deg, #4299e1, #3182ce);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .edit-btn:hover, .add-btn:hover {
      background: linear-gradient(135deg, #3182ce, #2c5282);
      transform: translateY(-2px);
    }

    .footer {
      background: rgba(0, 0, 0, 0.8);
      color: white;
      text-align: center;
      padding: 1rem;
      margin-top: auto;
    }

    .footer p {
      margin: 0;
      font-size: 0.9rem;
    }

    .footer .status {
      color: #68d391;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .nav {
        justify-content: center;
      }

      .nav-btn {
        padding: 0.6rem 1rem;
        font-size: 0.8rem;
      }

      .main-content {
        padding: 1rem;
      }

      .module-header h1 {
        font-size: 2rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .demo-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .chat-container {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class AppComponent {}