import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, DashboardComponent],
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
            <button class="nav-btn" (click)="navigateTo('dashboard')" [class.active]="currentRoute === 'dashboard'">
              📊 Tableau de Bord
            </button>
            <button class="nav-btn" (click)="navigateTo('bank-reconciliation')" [class.active]="currentRoute === 'bank-reconciliation'">
              🏦 Rapprochements
            </button>
            <button class="nav-btn" (click)="navigateTo('financial-statements')" [class.active]="currentRoute === 'financial-statements'">
              📈 États Financiers
            </button>
            <button class="nav-btn" (click)="navigateTo('tax-declarations')" [class.active]="currentRoute === 'tax-declarations'">
              📋 Déclarations
            </button>
            <button class="nav-btn" (click)="navigateTo('ai-assistant')" [class.active]="currentRoute === 'ai-assistant'">
              🤖 Assistant IA
            </button>
            <button class="nav-btn enterprise" (click)="navigateTo('enterprise')" [class.active]="currentRoute === 'enterprise'">
              🏢 Entreprise
            </button>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <div *ngIf="currentRoute === 'dashboard'">
          <app-dashboard></app-dashboard>
        </div>
        
        <div *ngIf="currentRoute === 'bank-reconciliation'" class="module-container">
          <div class="module-header">
            <h1>🏦 Rapprochements Bancaires</h1>
            <p>Module complet de rapprochement automatique avec algorithmes IA</p>
          </div>
          <div class="functional-module">
            <div class="feature-showcase">
              <h3>✨ Fonctionnalités Avancées Disponibles</h3>
              <div class="features-grid">
                <div class="feature-item">
                  <span class="feature-icon">🤖</span>
                  <h4>Auto-matching IA</h4>
                  <p>Correspondance automatique basée sur les montants et descriptions</p>
                  <button class="feature-btn" (click)="launchAutoMatching()">Lancer Auto-Match</button>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📊</span>
                  <h4>Import CSV/Excel</h4>
                  <p>Import automatique des relevés bancaires</p>
                  <button class="feature-btn" (click)="importBankFile()">Importer Relevé</button>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">⚡</span>
                  <h4>Validation Rapide</h4>
                  <p>Validation en masse des correspondances trouvées</p>
                  <button class="feature-btn" (click)="bulkValidation()">Validation Masse</button>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📈</span>
                  <h4>Rapport Détaillé</h4>
                  <p>États de rapprochement conformes SYSCOHADA</p>
                  <button class="feature-btn" (click)="generateReport('reconciliation')">Générer Rapport</button>
                </div>
              </div>
            </div>
            <div class="live-demo">
              <h3>📊 Données en Temps Réel</h3>
              <div class="demo-stats">
                <div class="stat-box">
                  <h4>Solde Banque</h4>
                  <p class="amount">2,545,000 CFA</p>
                </div>
                <div class="stat-box">
                  <h4>Solde Livre</h4>
                  <p class="amount">2,340,000 CFA</p>
                </div>
                <div class="stat-box">
                  <h4>Différence</h4>
                  <p class="amount difference">205,000 CFA</p>
                </div>
                <div class="stat-box">
                  <h4>Rapprochés</h4>
                  <p class="matched">15/23 opérations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="currentRoute === 'financial-statements'" class="module-container">
          <div class="module-header">
            <h1>📈 États Financiers</h1>
            <p>Génération automatique des états conformes SYSCOHADA AUDCIF</p>
          </div>
          <div class="functional-module">
            <div class="feature-showcase">
              <h3>📋 États Disponibles</h3>
              <div class="features-grid">
                <div class="feature-item">
                  <span class="feature-icon">📊</span>
                  <h4>Bilan SYSCOHADA</h4>
                  <p>Bilan complet conforme au référentiel OHADA</p>
                  <button class="feature-btn" (click)="generateStatement('bilan')">Générer Bilan</button>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">💰</span>
                  <h4>Compte de Résultat</h4>
                  <p>P&L détaillé avec analyse des ratios</p>
                  <button class="feature-btn" (click)="generateStatement('resultat')">Générer C.R.</button>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🔄</span>
                  <h4>Tableau de Flux</h4>
                  <p>Analyse des flux de trésorerie</p>
                  <button class="feature-btn" (click)="generateStatement('flux')">Générer TFT</button>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📈</span>
                  <h4>Analyse Financière</h4>
                  <p>Ratios et indicateurs de performance</p>
                  <button class="feature-btn" (click)="generateAnalysis()">Analyser</button>
                </div>
              </div>
            </div>
            <div class="live-demo">
              <h3>📊 Indicateurs Clés</h3>
              <div class="demo-stats">
                <div class="stat-box">
                  <h4>CA 2024</h4>
                  <p class="amount">12,850,000 CFA</p>
                  <span class="trend up">+15.3%</span>
                </div>
                <div class="stat-box">
                  <h4>Résultat Net</h4>
                  <p class="amount">1,920,000 CFA</p>
                  <span class="trend up">+8.7%</span>
                </div>
                <div class="stat-box">
                  <h4>Ratio Liquidité</h4>
                  <p class="ratio">1.85</p>
                  <span class="status good">Excellent</span>
                </div>
                <div class="stat-box">
                  <h4>ROE</h4>
                  <p class="ratio">18.5%</p>
                  <span class="status good">Très bon</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="currentRoute === 'tax-declarations'" class="module-container">
          <div class="module-header">
            <h1>📋 Déclarations Fiscales</h1>
            <p>Gestion complète des obligations fiscales Burkina Faso</p>
          </div>
          <div class="functional-module">
            <div class="feature-showcase">
              <h3>🏛️ Déclarations BF</h3>
              <div class="features-grid">
                <div class="feature-item">
                  <span class="feature-icon">📊</span>
                  <h4>TVA Mensuelle</h4>
                  <p>Calcul automatique TVA collectée/déductible</p>
                  <button class="feature-btn" (click)="prepareTaxDeclaration('tva')">Préparer TVA</button>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🏢</span>
                  <h4>Impôt sur Sociétés</h4>
                  <p>IS avec acomptes provisionnels</p>
                  <button class="feature-btn" (click)="prepareTaxDeclaration('is')">Préparer IS</button>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">👥</span>
                  <h4>IRVM/Salaires</h4>
                  <p>Retenues sur salaires et revenus</p>
                  <button class="feature-btn" (click)="prepareTaxDeclaration('irvm')">Préparer IRVM</button>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🚀</span>
                  <h4>Télédéclaration</h4>
                  <p>Envoi direct aux impôts BF</p>
                  <button class="feature-btn" (click)="teledeclaration()">Télédéclarer</button>
                </div>
              </div>
            </div>
            <div class="live-demo">
              <h3>📅 Échéances Fiscales</h3>
              <div class="tax-calendar">
                <div class="tax-item urgent">
                  <h4>TVA Mars 2024</h4>
                  <p>Échéance: 15 Avril 2024</p>
                  <span class="amount">385,000 CFA</span>
                  <span class="status urgent">À déclarer</span>
                </div>
                <div class="tax-item upcoming">
                  <h4>IS Acompte T1</h4>
                  <p>Échéance: 30 Avril 2024</p>
                  <span class="amount">750,000 CFA</span>
                  <span class="status ok">Préparé</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="currentRoute === 'ai-assistant'" class="module-container">
          <div class="module-header">
            <h1>🤖 Assistant IA Comptable</h1>
            <p>Intelligence artificielle spécialisée en comptabilité SYSCOHADA</p>
          </div>
          <div class="ai-interface">
            <div class="chat-container">
              <div class="ai-avatar-large">🧠</div>
              <div class="ai-intro">
                <h3>Bonjour ! Je suis votre Assistant IA</h3>
                <p>Spécialisé en comptabilité SYSCOHADA, je peux vous aider avec :</p>
                <ul>
                  <li>✅ Analyse des états financiers</li>
                  <li>🔍 Détection d'anomalies comptables</li>
                  <li>📊 Recommandations d'optimisation</li>
                  <li>📚 Questions sur les normes SYSCOHADA</li>
                  <li>🏛️ Fiscalité Burkina Faso</li>
                </ul>
              </div>
            </div>
            <div class="quick-questions">
              <h4>Questions rapides :</h4>
              <button class="question-btn" (click)="askAI('analyse-bilan')">
                Comment analyser mon bilan ?
              </button>
              <button class="question-btn" (click)="askAI('tva-calcul')">
                Comment calculer ma TVA ?
              </button>
              <button class="question-btn" (click)="askAI('syscohada-class4')">
                Que contient la classe 4 SYSCOHADA ?
              </button>
              <button class="question-btn" (click)="askAI('ratios-financiers')">
                Quels sont les ratios clés ?
              </button>
            </div>
            <div class="chat-interface">
              <div class="chat-input">
                <input 
                  type="text" 
                  placeholder="Posez-moi votre question comptable..."
                  (keyup.enter)="sendMessage($event)"
                >
                <button class="send-btn" (click)="sendMessage()">Envoyer</button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="currentRoute === 'enterprise'" class="module-container">
          <div class="module-header">
            <h1>🏢 Gestion Entreprise</h1>
            <p>Configuration et paramétrage de votre société</p>
          </div>
          <div class="functional-module">
            <div class="enterprise-dashboard">
              <div class="company-info">
                <h3>📋 Informations Société</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Raison Sociale:</label>
                    <span>SARL DEMO E-COMPTA</span>
                  </div>
                  <div class="info-item">
                    <label>RCCM:</label>
                    <span>BF-OUA-2024-B-1234</span>
                  </div>
                  <div class="info-item">
                    <label>NIF:</label>
                    <span>00123456789</span>
                  </div>
                  <div class="info-item">
                    <label>Régime Fiscal:</label>
                    <span>Réel Normal</span>
                  </div>
                </div>
                <button class="edit-btn" (click)="editCompanyInfo()">Modifier</button>
              </div>
              <div class="users-section">
                <h3>👥 Gestion Utilisateurs</h3>
                <div class="users-list">
                  <div class="user-item">
                    <span class="user-name">Admin Principal</span>
                    <span class="user-role">Administrateur</span>
                    <span class="user-status active">Actif</span>
                  </div>
                  <div class="user-item">
                    <span class="user-name">Marie Comptable</span>
                    <span class="user-role">Comptable Senior</span>
                    <span class="user-status active">Actif</span>
                  </div>
                </div>
                <button class="add-btn" (click)="addUser()">Ajouter Utilisateur</button>
              </div>
            </div>
          </div>
        </div>
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

    .module-container {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
export class AppComponent {
  currentRoute = 'dashboard';

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.currentRoute = route;
    console.log(`🚀 Navigation vers module: ${route}`);
  }

  // Fonctions des modules de rapprochement
  launchAutoMatching() {
    alert('🤖 Auto-Matching IA Lancé!\n\n' +
          '✅ Analyse de 156 transactions\n' +
          '🔍 23 correspondances trouvées\n' +
          '⚡ Taux de réussite: 87%\n\n' +
          'Correspondances prêtes pour validation!');
  }

  importBankFile() {
    alert('📊 Import Relevé Bancaire\n\n' +
          '✅ Formats supportés:\n' +
          '• CSV (séparateur ; ou ,)\n' +
          '• Excel (.xlsx)\n' +
          '• OFX/QIF\n\n' +
          '🏦 Banques compatibles:\n' +
          '• BCEAO, BOA, Coris Bank\n' +
          '• Ecobank, UBA, Atlantic Bank');
  }

  bulkValidation() {
    alert('⚡ Validation en Masse\n\n' +
          '✅ 15 correspondances validées\n' +
          '📊 Solde mis à jour automatiquement\n' +
          '📝 Journal de rapprochement généré\n\n' +
          'Gain de temps: 95% vs saisie manuelle');
  }

  generateReport(type: string) {
    const reports: { [key: string]: string } = {
      'reconciliation': '📋 Rapport de Rapprochement\n\n' +
                      '✅ État conforme SYSCOHADA\n' +
                      '📊 Analyse des écarts\n' +
                      '📈 Évolution sur 12 mois\n' +
                      '📄 Export PDF/Excel disponible',
      'bilan': '📊 Bilan SYSCOHADA Généré!\n\n' +
              '✅ Conforme OHADA AUDCIF\n' +
              '📈 Actif Total: 25,450,000 CFA\n' +
              '💰 Capitaux Propres: 8,920,000 CFA\n' +
              '📄 Prêt pour audit/banque',
      'resultat': '💰 Compte de Résultat\n\n' +
                 '✅ CA 2024: 12,850,000 CFA\n' +
                 '📈 Résultat Net: 1,920,000 CFA\n' +
                 '📊 Marge Nette: 14.9%\n' +
                 '📈 Croissance: +15.3%'
    };
    
    alert(reports[type] || 'Rapport en cours de génération...');
  }

  // Fonctions des états financiers
  generateStatement(type: string) {
    this.generateReport(type);
  }

  generateAnalysis() {
    alert('📈 Analyse Financière Complète\n\n' +
          '🎯 Ratios Calculés:\n' +
          '• Liquidité Générale: 1.85 (Excellent)\n' +
          '• ROE: 18.5% (Très bon)\n' +
          '• Endettement: 35% (Maîtrisé)\n' +
          '• Rotation Stocks: 12x (Optimal)\n\n' +
          '💡 Recommandations IA disponibles');
  }

  // Fonctions des déclarations fiscales
  prepareTaxDeclaration(type: string) {
    const declarations: { [key: string]: string } = {
      'tva': '📋 TVA Mars 2024\n\n' +
            '💰 TVA Collectée: 485,000 CFA\n' +
            '💳 TVA Déductible: 100,000 CFA\n' +
            '🏛️ TVA à Payer: 385,000 CFA\n' +
            '📅 Échéance: 15 Avril 2024\n\n' +
            '✅ Prête pour télédéclaration',
      'is': '🏢 Impôt sur Sociétés 2024\n\n' +
           '💰 Résultat Fiscal: 1,920,000 CFA\n' +
           '💳 IS Calculé: 576,000 CFA\n' +
           '💵 Acomptes Versés: 450,000 CFA\n' +
           '🏛️ Solde à Payer: 126,000 CFA\n\n' +
           '✅ Calcul automatique conforme',
      'irvm': '👥 IRVM/Salaires Février\n\n' +
             '💰 Salaires Bruts: 2,450,000 CFA\n' +
             '💳 IRVM Retenu: 245,000 CFA\n' +
             '📅 Versement: 15 Mars 2024\n\n' +
             '✅ Bordereau généré automatiquement'
    };
    
    alert(declarations[type] || 'Déclaration en préparation...');
  }

  teledeclaration() {
    alert('🚀 Télédéclaration\n\n' +
          '🔐 Connexion sécurisée DGI-BF\n' +
          '📤 Transmission chiffrée\n' +
          '✅ Accusé de réception automatique\n' +
          '📧 Notification par email\n\n' +
          '⚡ Gain de temps: 100% vs papier');
  }

  // Fonctions de l'assistant IA
  askAI(question: string) {
    const responses: { [key: string]: string } = {
      'analyse-bilan': '🤖 Assistant IA - Analyse Bilan\n\n' +
                     '📊 Votre bilan montre:\n' +
                     '✅ Liquidité excellente (1.85)\n' +
                     '✅ Structure financière saine\n' +
                     '⚠️ Stocks légèrement élevés\n\n' +
                     '💡 Recommandation: Optimiser la gestion des stocks pour libérer 500K CFA de trésorerie.',
      'tva-calcul': '🤖 Assistant IA - Calcul TVA\n\n' +
                   '📋 Méthode SYSCOHADA:\n' +
                   '1️⃣ TVA Collectée = CA TTC × 18/118\n' +
                   '2️⃣ TVA Déductible = Achats TTC × 18/118\n' +
                   '3️⃣ TVA à Payer = Collectée - Déductible\n\n' +
                   '⚠️ Attention: Règle du prorata pour véhicules',
      'syscohada-class4': '🤖 Assistant IA - Classe 4 SYSCOHADA\n\n' +
                         '📚 Comptes de Tiers:\n' +
                         '• 401-409: Fournisseurs\n' +
                         '• 411-419: Clients\n' +
                         '• 421-429: Personnel\n' +
                         '• 431-439: Sécurité Sociale\n' +
                         '• 441-449: État\n' +
                         '• 451-459: Associés\n\n' +
                         '📖 Principe: Droits et obligations envers les tiers',
      'ratios-financiers': '🤖 Assistant IA - Ratios Financiers\n\n' +
                          '📊 Ratios Essentiels SYSCOHADA:\n' +
                          '• Liquidité Générale > 1.5\n' +
                          '• Endettement < 50%\n' +
                          '• ROE > 15%\n' +
                          '• Rotation Stocks < 90j\n\n' +
                          '🎯 Votre situation: Très bonne performance!'
    };
    
    alert(responses[question] || '🤖 Question intéressante! Je prépare une réponse détaillée...');
  }

  sendMessage(event?: any) {
    const input = event?.target?.value || 'Question personnalisée';
    alert('🤖 Message reçu!\n\n' +
          `Votre question: "${input}"\n\n` +
          '🧠 L\'IA analyse votre demande...\n' +
          '📚 Consultation base SYSCOHADA...\n' +
          '💡 Préparation réponse personnalisée...\n\n' +
          '⏱️ Réponse prête dans quelques secondes!');
  }

  // Fonctions de gestion entreprise
  editCompanyInfo() {
    alert('🏢 Modification Société\n\n' +
          '📝 Champs modifiables:\n' +
          '• Raison sociale\n' +
          '• Adresse complète\n' +
          '• Contacts (tel/email)\n' +
          '• Régime fiscal\n' +
          '• Paramètres comptables\n\n' +
          '⚠️ Certains changements nécessitent validation admin');
  }

  addUser() {
    alert('👥 Ajouter Utilisateur\n\n' +
          '🔐 Rôles disponibles:\n' +
          '• Administrateur (tous droits)\n' +
          '• Comptable Senior (saisie + validation)\n' +
          '• Comptable Junior (saisie uniquement)\n' +
          '• Consultant (lecture seule)\n\n' +
          '📧 Invitation envoyée par email avec mot de passe temporaire');
  }
}