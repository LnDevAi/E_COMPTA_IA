import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <header>
        <h1>Bienvenue dans votre projet Angular</h1>
        <p>Ce projet est maintenant prêt pour le développement!</p>
      </header>
      
      <main>
        <section class="welcome-section">
          <h2>Prochaines étapes</h2>
          <ul>
            <li>Installer les dépendances avec <code>npm install</code></li>
            <li>Lancer le serveur de développement avec <code>npm start</code></li>
            <li>Commencer à développer vos fonctionnalités</li>
          </ul>
        </section>
        
        <section class="info-section">
          <h3>Informations du projet</h3>
          <p>Titre: {{ title }}</p>
          <p>Version: {{ version }}</p>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      text-align: center;
      margin-bottom: 40px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    h1 {
      color: #2c3e50;
      margin-bottom: 10px;
    }
    
    .welcome-section, .info-section {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    ul {
      margin-left: 20px;
    }
    
    li {
      margin-bottom: 10px;
    }
    
    code {
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
  `]
})
export class AppComponent {
  title = 'Angular Project';
  version = '1.0.0';
}