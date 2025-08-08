import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

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
          <span class="status">🟢 Déployé sur AWS Amplify</span>
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

    .nav-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      background: linear-gradient(135deg, #3182ce, #2c5282);
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

    .status {
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
    }
  `]
})
export class AppComponent {
  currentRoute = 'dashboard';

  navigateTo(route: string) {
    this.currentRoute = route;
    // Simulation de la navigation - sera remplacé par le router Angular
    console.log(`Navigation vers: ${route}`);
    
    // Message de feedback pour l'utilisateur
    const routeNames: { [key: string]: string } = {
      'dashboard': 'Tableau de Bord',
      'bank-reconciliation': 'Rapprochements Bancaires',
      'financial-statements': 'États Financiers',
      'tax-declarations': 'Déclarations Fiscales',
      'ai-assistant': 'Assistant IA'
    };

    const message = `🚀 Navigation vers: ${routeNames[route]}\n\n` +
                   `✅ Module E-COMPTA-IA en cours de développement\n` +
                   `📱 Interface responsive et moderne\n` +
                   `🔗 Intégration complète prévue`;
    
    alert(message);
  }
}