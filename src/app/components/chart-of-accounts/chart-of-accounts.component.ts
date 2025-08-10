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
          <label class="chk"><input type="checkbox" [(ngModel)]="exportFilteredOnly"/> N'exporter que le filtré</label>
          <button class="btn" (click)="exportCsv()">⬇️ CSV</button>
          <button class="btn" (click)="exportExcel()">⬇️ Excel</button>
          <button class="btn" (click)="exportPdf()">⬇️ PDF</button>
        </div>
      </div>

      <div class="toolbar">
        <div>
          <label><input type="checkbox" [(ngModel)]="groupByClass" /> Regrouper par classe</label>
        </div>
        <div class="importer">
          <input type="file" (change)="onImportFile($event)" accept=".json,.csv" />
          <button class="btn" [disabled]="!importPreview.length" (click)="applyImport()">Importer {{ importPreview.length }} comptes</button>
          <span *ngIf="importErrors.length" class="err">{{ importErrors.length }} erreurs</span>
        </div>
      </div>

      <div class="add-subaccount">
        <h3>➕ Ajouter un sous-compte</h3>
        <div class="row">
          <input class="input" placeholder="Code parent (ex: 401)" [(ngModel)]="parentCode" />
          <input class="input" placeholder="Nouveau code (ex: 4011)" [(ngModel)]="newCode" />
          <input class="input" placeholder="Intitulé" [(ngModel)]="newLabel" />
          <button class="btn" (click)="addSubAccount()">Ajouter</button>
        </div>
        <div *ngIf="addError" class="err">{{ addError }}</div>
        <div *ngIf="addSuccess" class="ok">{{ addSuccess }}</div>
      </div>

      <div *ngIf="groupByClass; else flatTable">
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

      <div *ngIf="importErrors.length" class="import-errors">
        <h4>Erreurs d'import</h4>
        <ul>
          <li *ngFor="let e of importErrors">{{ e }}</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .module-container { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .header-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .chk { color:#4a5568; font-size: 0.9rem; }
    .search { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; min-width: 260px; }
    .select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; }
    .btn { padding: 8px 12px; border: none; border-radius: 6px; background: #3182ce; color: #fff; cursor: pointer; }
    .btn:hover { background: #2b6cb0; }
    .toolbar { display:flex; justify-content: space-between; align-items:center; margin:8px 0; flex-wrap:wrap; gap: 0.5rem; }
    .importer { display:flex; align-items:center; gap:0.5rem; }
    .plan-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .plan-table th, .plan-table td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
    .plan-table th { background: #f7fafc; cursor: pointer; user-select: none; }
    .group-title { display:flex; justify-content: space-between; background:#f7fafc; padding:8px 12px; border:1px solid #e2e8f0; border-radius:6px; margin-top:12px; cursor:pointer; }
    .group-title .count { color:#4a5568; font-size: 0.9rem; }
    .group-block { margin-bottom: 8px; }
    .import-errors { margin-top: 12px; color:#e53e3e; }
    .add-subaccount { margin-top: 16px; padding: 12px; border: 1px dashed #e2e8f0; border-radius: 8px; }
    .add-subaccount .row { display:flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
    .add-subaccount .input { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; }
    .err { color:#e53e3e; font-size:0.9rem; }
    .ok { color:#38a169; font-size:0.9rem; }
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

  exportFilteredOnly = true;

  // Import state
  importPreview: AccountPlanItem[] = [];
  importErrors: string[] = [];

  // Add sub-account state
  parentCode = '';
  newCode = '';
  newLabel = '';
  addError = '';
  addSuccess = '';

  constructor(private coa: ChartOfAccountsService) {}

  ngOnInit(): void {
    this.plan$.subscribe(items => {
      this.allItems = items.map(i => ({
        ...i,
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

  // Exports
  private rowsToExport(): AccountPlanItem[] {
    return this.exportFilteredOnly
      ? (this.groupByClass ? Object.values(this.grouped).flat() : this.visibleItems)
      : this.sortItems(this.allItems);
  }

  exportCsv(): void {
    const rows = this.rowsToExport();
    const header = ['code','intitule','classe'];
    const lines = [header.join(';'), ...rows.map(r => [r.code, this.escapeCsv(r.intitule), r.classe].join(';'))];
    const blob = new Blob(["\uFEFF" + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, 'plan-comptable.csv');
  }

  exportExcel(): void {
    // Génère un tableau HTML compatible Excel et le sert en .xls
    const rows = this.rowsToExport();
    const html = `\n      <html><head><meta charset="UTF-8"></head><body>\n      <table border="1"><thead><tr><th>Code</th><th>Intitulé</th><th>Classe</th></tr></thead><tbody>\n      ${rows.map(r => `<tr><td>${this.escapeHtml(r.code)}</td><td>${this.escapeHtml(r.intitule)}</td><td>${this.escapeHtml(r.classe||'')}</td></tr>`).join('')}\n      </tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    this.downloadBlob(blob, 'plan-comptable.xls');
  }

  exportPdf(): void {
    // Ouvre une fenêtre d'impression avec le tableau; l'utilisateur peut enregistrer en PDF
    const rows = this.rowsToExport();
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><meta charset="UTF-8"><title>Plan comptable</title>
      <style>body{font-family:Arial,sans-serif} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:6px} th{background:#f7fafc}</style>
    </head><body>`);
    win.document.write('<h2>Plan comptable</h2>');
    win.document.write('<table><thead><tr><th>Code</th><th>Intitulé</th><th>Classe</th></tr></thead><tbody>');
    rows.forEach(r => win.document.write(`<tr><td>${this.escapeHtml(r.code)}</td><td>${this.escapeHtml(r.intitule)}</td><td>${this.escapeHtml(r.classe||'')}</td></tr>`));
    win.document.write('</tbody></table></body></html>');
    win.document.close();
    win.focus();
    win.print();
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escapeCsv(v: string): string {
    if (v.includes(';') || v.includes('"')) {
      return '"' + v.replace(/"/g, '""') + '"';
    }
    return v;
  }
  private escapeHtml(v?: string): string { return (v||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] as string)); }

  // Import
  onImportFile(event: Event): void {
    this.importPreview = [];
    this.importErrors = [];
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        let rows: AccountPlanItem[] = [];
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(text);
          rows = this.mapImported(data);
        } else {
          rows = this.parseCsv(text);
        }
        const { valid, errors, normalized } = this.validateImported(rows);
        this.importErrors = errors;
        this.importPreview = valid ? normalized : [];
      } catch (e: any) {
        this.importErrors = ['Fichier invalide: ' + (e?.message || e)];
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  mapImported(data: any): AccountPlanItem[] {
    // Supporte tableaux d'objets { code/intitule/classe } ou { numero/intitule/classe }
    if (!Array.isArray(data)) return [];
    return data.map((d: any) => ({
      code: String(d.code ?? d.numero ?? ''),
      intitule: String(d.intitule ?? ''),
      classe: this.normalizeClass(String(d.classe ?? ''))
    }));
  }

  parseCsv(text: string): AccountPlanItem[] {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    if (!lines.length) return [];
    const header = lines[0].split(/;|,|\t/).map(h => h.trim().toLowerCase());
    const idxCode = header.findIndex(h => ['code','numero'].includes(h));
    const idxInt = header.findIndex(h => ['intitule','intitulé','label','libelle','libellé'].includes(h));
    const idxCls = header.findIndex(h => ['classe','class'].includes(h));
    const out: AccountPlanItem[] = [];
    for (let i=1;i<lines.length;i++) {
      const cols = lines[i].split(/;|,|\t/);
      const code = (cols[idxCode]||'').trim();
      const intitule = (cols[idxInt]||'').trim();
      const classe = this.normalizeClass((cols[idxCls]||'').trim());
      if (code && intitule) out.push({ code, intitule, classe });
    }
    return out;
  }

  validateImported(rows: AccountPlanItem[]): { valid: boolean; errors: string[]; normalized: AccountPlanItem[] } {
    const errors: string[] = [];
    const existingCodes = new Set(this.allItems.map(i => i.code));
    const seen = new Set<string>();
    const normalized: AccountPlanItem[] = [];
    for (const r of rows) {
      if (!/^\d+$/.test(r.code)) { errors.push(`Code non numérique: ${r.code}`); continue; }
      const clsMatch = r.classe?.match(/Classe\s*(\d)/);
      const classDigit = clsMatch ? clsMatch[1] : r.code.charAt(0);
      if (r.code.charAt(0) !== classDigit) { errors.push(`Classe incohérente pour ${r.code} (${r.classe})`); continue; }
      if (existingCodes.has(r.code)) { errors.push(`Code déjà existant: ${r.code}`); continue; }
      if (seen.has(r.code)) { errors.push(`Doublon dans le fichier: ${r.code}`); continue; }
      seen.add(r.code);
      normalized.push({ code: r.code, intitule: r.intitule, classe: this.normalizeClass(r.classe) });
    }
    return { valid: errors.length===0, errors, normalized };
  }

  applyImport(): void {
    if (!this.importPreview.length) return;
    this.allItems = this.sortItems([...this.allItems, ...this.importPreview]);
    this.importPreview = [];
    this.applyFilters();
  }

  // Add sub-account
  addSubAccount(): void {
    this.addError = '';
    this.addSuccess = '';
    const parent = this.parentCode.trim();
    const code = this.newCode.trim();
    const label = this.newLabel.trim();
    if (!/^\d+$/.test(parent)) { this.addError = 'Code parent invalide'; return; }
    if (!/^\d+$/.test(code)) { this.addError = 'Nouveau code invalide'; return; }
    if (!code.startsWith(parent)) { this.addError = 'Le nouveau code doit commencer par le code parent'; return; }
    if (!label) { this.addError = 'Intitulé requis'; return; }
    if (this.allItems.some(i => i.code === code)) { this.addError = 'Ce code existe déjà'; return; }
    // classe du nouveau = classe du parent
    const parentItem = this.allItems.find(i => i.code === parent);
    const classe = parentItem ? parentItem.classe : this.normalizeClass('Classe ' + code.charAt(0));
    this.allItems = this.sortItems([...this.allItems, { code, intitule: label, classe }]);
    this.parentCode = this.newCode = this.newLabel = '';
    this.addSuccess = 'Sous-compte ajouté';
    this.applyFilters();
  }
}