import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartOfAccountsService, AccountPlanItem } from '../../services/chart-of-accounts.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chart-of-accounts',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, AsyncPipe, FormsModule],
  template: `
    <div class="module-container">
      <div class="header-row">
        <h1>🧾 Plan Comptable</h1>
        <div class="actions">
          <input [(ngModel)]="query" (ngModelChange)="applyFilters()" class="search" type="text" placeholder="Rechercher (code, intitulé)..." />
          <select [(ngModel)]="selectedClass" (change)="applyFilters()" class="select">
            <option value="">Toutes les classes</option>
            <option *ngFor="let c of classOptions" [value]="c">{{ c }}</option>
          </select>
          <button class="btn" (click)="exportCsv()">⬇️ Export CSV</button>
        </div>
      </div>

      <div *ngIf="groupByClass; else flatTable">
        <div class="group-header">
          <label><input type="checkbox" [(ngModel)]="groupByClass" /> Regrouper par classe</label>
        </div>
        <div *ngFor="let group of groupedKeys()" class="group-block">
          <div class="group-title" (click)="toggleGroup(group)">
            <span>{{ group }}</span>
            <span class="count">{{ grouped[group]?.length }} comptes</span>
            <span class="toggle">{{ collapsedGroups[group] ? '➕' : '➖' }}</span>
          </div>
          <div *ngIf="!collapsedGroups[group]">
            <table class="plan-table">
              <thead>
                <tr>
                  <th (click)="sortBy('code')">Code {{ sortKey==='code' ? (sortDir==='asc'?'▲':'▼') : '' }}</th>
                  <th (click)="sortBy('intitule')">Intitulé {{ sortKey==='intitule' ? (sortDir==='asc'?'▲':'▼') : '' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of grouped[group]">
                  <td>{{ a.code }}</td>
                  <td>{{ a.intitule }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ng-template #flatTable>
        <div class="group-header">
          <label><input type="checkbox" [(ngModel)]="groupByClass" /> Regrouper par classe</label>
        </div>
        <table class="plan-table">
          <thead>
            <tr>
              <th (click)="sortBy('code')">Code {{ sortKey==='code' ? (sortDir==='asc'?'▲':'▼') : '' }}</th>
              <th (click)="sortBy('intitule')">Intitulé {{ sortKey==='intitule' ? (sortDir==='asc'?'▲':'▼') : '' }}</th>
              <th (click)="sortBy('classe')">Classe {{ sortKey==='classe' ? (sortDir==='asc'?'▲':'▼') : '' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of visibleItems">
              <td>{{ a.code }}</td>
              <td>{{ a.intitule }}</td>
              <td>{{ a.classe }}</td>
            </tr>
          </tbody>
        </table>
      </ng-template>
    </div>
  `,
  styles: [`
    .module-container { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .header-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .search { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; min-width: 260px; }
    .select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; }
    .btn { padding: 8px 12px; border: none; border-radius: 6px; background: #3182ce; color: #fff; cursor: pointer; }
    .btn:hover { background: #2b6cb0; }
    .plan-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .plan-table th, .plan-table td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
    .plan-table th { background: #f7fafc; cursor: pointer; user-select: none; }
    .group-header { margin: 8px 0; }
    .group-title { display:flex; justify-content: space-between; background:#f7fafc; padding:8px 12px; border:1px solid #e2e8f0; border-radius:6px; margin-top:12px; cursor:pointer; }
    .group-title .count { color:#4a5568; font-size: 0.9rem; }
    .group-block { margin-bottom: 8px; }
  `]
})
export class ChartOfAccountsComponent implements OnInit {
  plan$: Observable<AccountPlanItem[]> = this.coa.getPlan();
  allItems: AccountPlanItem[] = [];
  visibleItems: AccountPlanItem[] = [];
  classOptions: string[] = [];

  // UI state
  query = '';
  selectedClass = '';
  sortKey: 'code' | 'intitule' | 'classe' = 'code';
  sortDir: 'asc' | 'desc' = 'asc';
  groupByClass = true;
  grouped: Record<string, AccountPlanItem[]> = {};
  collapsedGroups: Record<string, boolean> = {};

  constructor(private coa: ChartOfAccountsService) {}

  ngOnInit(): void {
    this.plan$.subscribe(items => {
      this.allItems = items.map(i => ({
        ...i,
        // normaliser la classe en forme "Classe X"
        classe: this.normalizeClass(i.classe)
      }));
      this.classOptions = Array.from(new Set(this.allItems.map(i => i.classe))).sort();
      this.applyFilters();
    });
  }

  normalizeClass(c?: string): string {
    if (!c) return 'Classe ?';
    const m = (c + '').match(/(\d)/);
    return m ? `Classe ${m[1]}` : c;
    }

  applyFilters(): void {
    const q = this.query.trim().toLowerCase();
    let items = this.allItems.filter(i =>
      (!q || i.code.toLowerCase().includes(q) || i.intitule.toLowerCase().includes(q)) &&
      (!this.selectedClass || i.classe === this.selectedClass)
    );
    items = this.sortItems(items);

    this.visibleItems = items;
    if (this.groupByClass) {
      this.grouped = items.reduce((acc, cur) => {
        const key = cur.classe;
        (acc[key] = acc[key] || []).push(cur);
        return acc;
      }, {} as Record<string, AccountPlanItem[]>);
      // trier à l'intérieur de chaque groupe
      Object.keys(this.grouped).forEach(k => this.grouped[k] = this.sortItems(this.grouped[k]));
    } else {
      this.grouped = {};
    }
  }

  sortItems(items: AccountPlanItem[]): AccountPlanItem[] {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const key = this.sortKey;
    return [...items].sort((a, b) => {
      const va = (a as any)[key] ?? '';
      const vb = (b as any)[key] ?? '';
      return (''+va).localeCompare(''+vb, 'fr', { numeric: true }) * dir;
    });
  }

  sortBy(key: 'code' | 'intitule' | 'classe'): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.applyFilters();
  }

  groupedKeys(): string[] {
    return Object.keys(this.grouped).sort((a,b) => a.localeCompare(b, 'fr', { numeric: true }));
  }

  toggleGroup(group: string): void {
    this.collapsedGroups[group] = !this.collapsedGroups[group];
  }

  exportCsv(): void {
    const rows = (this.groupByClass ? Object.values(this.grouped).flat() : this.visibleItems);
    const header = ['code','intitule','classe'];
    const lines = [header.join(';'), ...rows.map(r => [r.code, this.escapeCsv(r.intitule), r.classe].join(';'))];
    const blob = new Blob(["\uFEFF" + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plan-comptable.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  private escapeCsv(v: string): string {
    if (v.includes(';') || v.includes('"')) {
      return '"' + v.replace(/"/g, '""') + '"';
    }
    return v;
  }
}