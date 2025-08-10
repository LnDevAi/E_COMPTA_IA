import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  color: string;
}

interface Module {
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'development' | 'planned';
  progress: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <h1>Bienvenue sur E-COMPTA-IA 🎉</h1>
        <p>Plateforme comptable intelligente conforme au référentiel SYSCOHADA AUDCIF</p>
        <div class="quick-actions">
          <button class="quick-btn primary" (click)="showFeature('new-entry')">
            ➕ Nouvelle Écriture
          </button>
          <button class="quick-btn secondary" (click)="showFeature('reconcile')">
            🏦 Rapprochement Rapide
          </button>
          <button class="quick-btn accent" (click)="showFeature('report')">
            📊 Générer Rapport
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-section">
        <h2>📈 Tableau de Bord</h2>
        <div class="stats-grid">
          <div 
            *ngFor="let stat of stats" 
            class="stat-card"
            [style.border-left-color]="stat.color"
            (click)="showStatDetails(stat)"
          >
            <div class="stat-header">
              <span class="stat-icon">{{ stat.icon }}</span>
              <span class="stat-trend" [class]="stat.trend">
                {{ stat.trend === 'up' ? '↗️' : stat.trend === 'down' ? '↘️' : '➡️' }}
                {{ stat.trendValue }}
              </span>
            </div>
            <h3>{{ stat.title }}</h3>
            <p class="stat-value">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <!-- Modules Section -->
      <div class="modules-section">
        <h2>🔧 Modules Disponibles</h2>
        <div class="modules-grid">
          <div 
            *ngFor="let module of modules" 
            class="module-card"
            [class]="module.status"
            (click)="accessModule(module)"
          >
            <div class="module-header">
              <span class="module-icon">{{ module.icon }}</span>
              <span class="module-status" [class]="module.status">
                {{ getStatusLabel(module.status) }}
              </span>
            </div>
            <h3>{{ module.name }}</h3>
            <p>{{ module.description }}</p>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                [style.width.%]="module.progress"
                [style.background-color]="getProgressColor(module.status)"
              ></div>
            </div>
            <span class="progress-text">{{ module.progress }}% terminé</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <h2>📋 Activité Récente</h2>
        <div class="activity-list">
          <div *ngFor="let activity of recentActivities" class="activity-item" (click)="showActivityDetails(activity)">
            <span class="activity-icon">{{ activity.icon }}</span>
            <div class="activity-content">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Assistant Preview -->
      <div class="ai-section">
        <h2>🤖 Assistant IA - Aperçu</h2>
        <div class="ai-card">
          <div class="ai-avatar">🧠</div>
          <div class="ai-content">
            <h3>Assistant Comptable Intelligent</h3>
            <p>Votre IA personnelle pour l'analyse comptable, la détection d'anomalies, et les recommandations d'optimisation.</p>
            <button class="ai-btn" (click)="showFeature('ai-chat')">💬 Démarrer une conversation</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.6s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .welcome-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      padding: 2rem;
      margin-bottom: 2rem;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .welcome-section h1 {
      color: #2d3748;
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
    }

    .welcome-section p {
      color: #718096;
      margin: 0 0 1.5rem 0;
      font-size: 1.1rem;
    }

    .quick-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .quick-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }

    .quick-btn.primary {
      background: linear-gradient(135deg, #4299e1, #3182ce);
      color: white;
    }

    .quick-btn.secondary {
      background: linear-gradient(135deg, #38a169, #2f855a);
      color: white;
    }

    .quick-btn.accent {
      background: linear-gradient(135deg, #ed8936, #dd6b20);
      color: white;
    }

    .quick-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .stats-section, .modules-section, .activity-section, .ai-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .stats-section h2, .modules-section h2, .activity-section h2, .ai-section h2 {
      color: #2d3748;
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      border-left: 4px solid;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-trend {
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 15px;
    }

    .stat-trend.up {
      background: #c6f6d5;
      color: #2f855a;
    }

    .stat-trend.down {
      background: #fed7d7;
      color: #e53e3e;
    }

    .stat-trend.stable {
      background: #e2e8f0;
      color: #4a5568;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #2d3748;
      margin: 0;
    }

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .module-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      border: 2px solid transparent;
    }

    .module-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    }

    .module-card.active {
      border-color: #38a169;
    }

    .module-card.development {
      border-color: #ed8936;
    }

    .module-card.planned {
      border-color: #718096;
    }

    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .module-icon {
      font-size: 2rem;
    }

    .module-status {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .module-status.active {
      background: #c6f6d5;
      color: #2f855a;
    }

    .module-status.development {
      background: #fbd38d;
      color: #c05621;
    }

    .module-status.planned {
      background: #e2e8f0;
      color: #4a5568;
    }

    .progress-bar {
      background: #e2e8f0;
      border-radius: 10px;
      height: 8px;
      margin: 1rem 0 0.5rem 0;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.9rem;
      color: #718096;
    }

    .activity-list {
      space-y: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 1rem;
    }

    .activity-item:hover {
      background: #edf2f7;
      transform: translateX(5px);
    }

    .activity-icon {
      font-size: 1.5rem;
      background: white;
      padding: 0.5rem;
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .activity-content h4 {
      margin: 0 0 0.25rem 0;
      color: #2d3748;
    }

    .activity-content p {
      margin: 0 0 0.25rem 0;
      color: #718096;
      font-size: 0.9rem;
    }

    .activity-time {
      font-size: 0.8rem;
      color: #a0aec0;
    }

    .ai-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 15px;
    }

    .ai-avatar {
      font-size: 3rem;
      background: rgba(255, 255, 255, 0.2);
      padding: 1rem;
      border-radius: 50%;
    }

    .ai-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }

    .ai-content p {
      margin: 0 0 1rem 0;
      opacity: 0.9;
    }

    .ai-btn {
      background: white;
      color: #667eea;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .ai-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
      .welcome-section h1 {
        font-size: 2rem;
      }

      .quick-actions {
        flex-direction: column;
      }

      .ai-card {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class DashboardComponent {
  stats: StatCard[] = [
    {
      title: 'Écritures du Mois',
      value: '1,247',
      icon: '📝',
      trend: 'up',
      trendValue: '+12%',
      color: '#4299e1'
    },
    {
      title: 'Rapprochements',
      value: '23/25',
      icon: '🏦',
      trend: 'up',
      trendValue: '+2',
      color: '#38a169'
    },
    {
      title: 'Chiffre d\'Affaires',
      value: '2.4M CFA',
      icon: '💰',
      trend: 'up',
      trendValue: '+8.5%',
      color: '#ed8936'
    },
    {
      title: 'Trésorerie',
      value: '856K CFA',
      icon: '🔒',
      trend: 'stable',
      trendValue: '0.2%',
      color: '#9f7aea'
    }
  ];

  modules: Module[] = [
    {
      name: 'Rapprochements Bancaires',
      description: 'Automatisation des rapprochements avec détection intelligente des correspondances',
      icon: '🏦',
      status: 'active',
      progress: 95
    },
    {
      name: 'États Financiers',
      description: 'Génération automatique des états conformes SYSCOHADA AUDCIF',
      icon: '📊',
      status: 'active',
      progress: 90
    },
    {
      name: 'Déclarations Fiscales',
      description: 'Préparation et télédéclaration des obligations fiscales',
      icon: '📋',
      status: 'development',
      progress: 75
    },
    {
      name: 'Assistant IA',
      description: 'Intelligence artificielle pour l\'analyse et les recommandations',
      icon: '🤖',
      status: 'development',
      progress: 60
    },
    {
      name: 'Balance N-1 & RAN',
      description: 'Gestion des reports à nouveau et balances d\'ouverture',
      icon: '⚖️',
      status: 'active',
      progress: 100
    },
    {
      name: 'E-Learning',
      description: 'Formation interactive aux normes SYSCOHADA',
      icon: '🎓',
      status: 'planned',
      progress: 30
    }
  ];

  recentActivities = [
    {
      icon: '✅',
      title: 'Rapprochement terminé',
      description: 'Compte Banque BCEAO - 156 opérations rapprochées',
      time: 'Il y a 2 heures'
    },
    {
      icon: '📊',
      title: 'Bilan généré',
      description: 'États financiers T4 2024 - Exporté en PDF',
      time: 'Il y a 4 heures'
    },
    {
      icon: '🤖',
      title: 'Anomalie détectée',
      description: 'IA: Écart inhabituel sur compte 411000',
      time: 'Il y a 6 heures'
    },
    {
      icon: '📝',
      title: 'Nouvelle écriture',
      description: 'Facture FACT-2024-001 saisie automatiquement',
      time: 'Hier'
    }
  ];

  showFeature(feature: string) {
    const featureMessages: { [key: string]: string } = {
      'new-entry': '📝 Module Saisie d\'Écritures\n\n• Saisie rapide avec modèles\n• Validation automatique SYSCOHADA\n• Détection d\'anomalies IA\n• Import depuis Excel/CSV',
      'reconcile': '🏦 Rapprochement Bancaire Intelligent\n\n• Correspondance automatique\n• Algorithmes de matching avancés\n• Gestion des suspens\n• Validation en un clic',
      'report': '📊 Générateur de Rapports\n\n• États SYSCOHADA AUDCIF\n• Analyses financières\n• Graphiques interactifs\n• Export multi-formats',
      'ai-chat': '🤖 Assistant IA Comptable\n\n💬 "Bonjour ! Je suis votre assistant IA.\n\nJe peux vous aider avec :\n• Analyse des états financiers\n• Détection d\'anomalies\n• Recommandations d\'optimisation\n• Questions sur les normes SYSCOHADA\n\nQue puis-je faire pour vous ?"'
    };

    alert(featureMessages[feature] || 'Fonctionnalité en cours de développement...');
  }

  showStatDetails(stat: StatCard) {
    const details = `📊 Détails: ${stat.title}\n\n` +
                   `Valeur actuelle: ${stat.value}\n` +
                   `Évolution: ${stat.trendValue}\n` +
                   `Statut: ${stat.trend === 'up' ? '📈 En hausse' : stat.trend === 'down' ? '📉 En baisse' : '➡️ Stable'}\n\n` +
                   `✅ Données en temps réel\n` +
                   `🔄 Mise à jour automatique`;
    alert(details);
  }

  accessModule(module: Module) {
    const moduleDetails = `🔧 ${module.name}\n\n` +
                         `${module.description}\n\n` +
                         `Statut: ${this.getStatusLabel(module.status)}\n` +
                         `Progression: ${module.progress}%\n\n` +
                         `${module.status === 'active' ? '✅ Module disponible' : 
                           module.status === 'development' ? '🚧 En développement' : 
                           '📋 Planifié'}\n\n` +
                         `Cliquez pour accéder...`;
    alert(moduleDetails);
  }

  showActivityDetails(activity: any) {
    const details = `📋 ${activity.title}\n\n` +
                   `${activity.description}\n\n` +
                   `⏰ ${activity.time}\n\n` +
                   `Cliquez pour plus de détails...`;
    alert(details);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actif',
      'development': 'En développement',
      'planned': 'Planifié'
    };
    return labels[status] || status;
  }

  getProgressColor(status: string): string {
    const colors: { [key: string]: string } = {
      'active': '#38a169',
      'development': '#ed8936',
      'planned': '#718096'
    };
    return colors[status] || '#718096';
  }
}