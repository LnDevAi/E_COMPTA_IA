import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ChartOfAccountsService, AccountPlanItem } from '../../services/chart-of-accounts.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chart-of-accounts',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, AsyncPipe],
  template: `
    <div class="module-container">
      <h1>🧾 Plan Comptable</h1>
      <p>Chargé depuis <code>assets/data/plan-comptable.json</code>.</p>

      <div *ngIf="plan$ | async as plan; else loading">
        <table class="plan-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Intitulé</th>
              <th>Classe</th>
              <th>Parent</th>
              <th>Nature</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of plan">
              <td>{{ a.code }}</td>
              <td>{{ a.intitule }}</td>
              <td>{{ a.classe || '-' }}</td>
              <td>{{ a.parent || '-' }}</td>
              <td>{{ a.nature || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #loading>
        <div class="placeholder">Chargement du plan comptable…</div>
      </ng-template>
    </div>
  `,
  styles: [`
    .module-container { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .plan-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .plan-table th, .plan-table td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    .plan-table th { background: #f7fafc; }
    .placeholder { margin-top: 16px; padding: 16px; border: 2px dashed #e2e8f0; border-radius: 8px; color: #4a5568; }
  `]
})
export class ChartOfAccountsComponent {
  plan$: Observable<AccountPlanItem[]> = this.coa.getPlan();
  constructor(private coa: ChartOfAccountsService) {}
}