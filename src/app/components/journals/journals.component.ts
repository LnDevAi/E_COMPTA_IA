import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-journals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>📓 Journaux</h1>
      <p>Liste et saisie des écritures par journal (achats, ventes, banque, opérations diverses).</p>
      <div class="placeholder">
        <p>Fonctionnalités à venir: filtres par période, import/export, validations.</p>
      </div>
    </div>
  `,
  styles: [`
    .module-container { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .placeholder { margin-top: 16px; padding: 16px; border: 2px dashed #e2e8f0; border-radius: 8px; color: #4a5568; }
  `]
})
export class JournalsComponent {}