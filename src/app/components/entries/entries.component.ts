import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entries',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>🧾 Écritures</h1>
      <p>Module en cours d’intégration. Saisie, lettrage, modèles d’écritures viendront ici.</p>
    </div>
  `,
  styles: [`
    .module-container { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  `]
})
export class EntriesComponent {}