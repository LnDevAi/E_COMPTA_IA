import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="welcome-section">
        <h1>🎉 Bienvenue sur E-COMPTA-IA</h1>
        <p class="subtitle">Plateforme Comptable SYSCOHADA avec Intelligence Artificielle</p>
      </div>

      <div class="status-grid">
        <div class="status-card success">
          <div class="status-icon">✅</div>
          <h3>Configuration Amplify</h3>
          <p>Fichiers de configuration créés et optimisés</p>
        </div>

        <div class="status-card success">
          <div class="status-icon">🔗</div>
          <h3>Schéma GraphQL</h3>
          <p>API backend complète avec modèles SYSCOHADA</p>
        </div>

        <div class="status-card success">
          <div class="status-icon">🏗️</div>
          <h3>Build Angular</h3>
          <p>Application prête pour le déploiement</p>
        </div>

        <div class="status-card warning">
          <div class="status-icon">🚀</div>
          <h3>Déploiement</h3>
          <p>Prêt à être déployé avec AWS Amplify</p>
        </div>
      </div>

      <div class="features-section">
        <h2>🌟 Fonctionnalités Principales</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h4>Comptabilité SYSCOHADA</h4>
            <p>Plan comptable complet conforme aux normes OHADA</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h4>Intelligence Artificielle</h4>
            <p>Assistant IA pour aide à la saisie et analyse</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🏦</div>
            <h4>Rapprochements Bancaires</h4>
            <p>Automatisation des rapprochements</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h4>États Financiers</h4>
            <p>Génération automatique des rapports</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">⚖️</div>
            <h4>Fiscal Burkina Faso</h4>
            <p>Intégration du code des impôts 2024-2025</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🎓</div>
            <h4>E-Learning</h4>
            <p>Formation comptabilité et SYSCOHADA</p>
          </div>
        </div>
      </div>

      <div class="next-steps-section">
        <h2>🚀 Prochaines Étapes</h2>
        <div class="steps-list">
          <div class="step">
            <span class="step-number">1</span>
            <div class="step-content">
              <h4>Installer Amplify CLI</h4>
                             <code>npm install -g &#64;aws-amplify/cli</code>
            </div>
          </div>

          <div class="step">
            <span class="step-number">2</span>
            <div class="step-content">
              <h4>Configurer AWS</h4>
              <code>amplify configure</code>
            </div>
          </div>

          <div class="step">
            <span class="step-number">3</span>
            <div class="step-content">
              <h4>Initialiser le projet</h4>
              <code>amplify init</code>
            </div>
          </div>

          <div class="step">
            <span class="step-number">4</span>
            <div class="step-content">
              <h4>Déployer</h4>
              <code>amplify publish</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .welcome-section h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #1976d2;
    }

    .subtitle {
      font-size: 1.2rem;
      color: #666;
      margin: 0;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .status-card {
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .status-card.success {
      background: linear-gradient(135deg, #e8f5e8, #f0f9f0);
      border-left: 4px solid #4caf50;
    }

    .status-card.warning {
      background: linear-gradient(135deg, #fff3e0, #fff8f0);
      border-left: 4px solid #ff9800;
    }

    .status-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .status-card h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .status-card p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .features-section,
    .next-steps-section {
      margin-bottom: 3rem;
    }

    .features-section h2,
    .next-steps-section h2 {
      text-align: center;
      color: #1976d2;
      margin-bottom: 2rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .feature-card {
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .feature-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .feature-card h4 {
      margin: 0 0 0.5rem 0;
      color: #1976d2;
    }

    .feature-card p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .steps-list {
      max-width: 600px;
      margin: 0 auto;
    }

    .step {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .step-number {
      background: #1976d2;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      margin-right: 1rem;
      flex-shrink: 0;
    }

    .step-content h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .step-content code {
      background: #e3f2fd;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      color: #1976d2;
    }

    @media (max-width: 768px) {
      .welcome-section h1 {
        font-size: 2rem;
      }

      .status-grid,
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent {
}