import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financial-statements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>📈 États Financiers</h1>
      <p>Module en cours d’intégration. Cette page servira les états financiers (bilan, compte de résultat, etc.).</p>
      <div class="placeholder">
        <p>Fonctionnalités à venir: génération d'états, filtres périodes, export PDF.</p>
      </div>
    </div>
  `,
  styles: [`
    .module-container { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .placeholder { margin-top: 16px; padding: 16px; border: 2px dashed #e2e8f0; border-radius: 8px; color: #4a5568; }
  `]
})
export class FinancialStatementsComponent {}