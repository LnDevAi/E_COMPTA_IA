import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <h1>E-COMPTA-IA</h1>
          </div>
          <nav class="nav-section">
            <span class="status">🟢 Prêt pour Amplify</span>
          </nav>
        </div>
      </header>

      <main class="app-main">
        <router-outlet></router-outlet>
      </main>

      <footer class="app-footer">
        <p>© 2024 E-COMPTA-IA - Plateforme Comptable SYSCOHADA avec IA</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: #1976d2;
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-section h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .nav-section {
      display: flex;
      align-items: center;
    }

    .status {
      background: rgba(255,255,255,0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .app-main {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      width: 100%;
    }

    .app-footer {
      background: #f5f5f5;
      padding: 1rem;
      text-align: center;
      color: #666;
    }

    .app-footer p {
      margin: 0;
      font-size: 0.9rem;
    }
  `]
})
export class AppComponent {
  title = 'E-COMPTA-IA';
}