import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeclarationsService, DeclarationRecord, DeclarationType } from '../../services/declarations.service';
import { TypeFilterPipe } from './type-filter.pipe';

@Component({
  selector: 'app-tax-declarations',
  standalone: true,
  imports: [CommonModule, FormsModule, TypeFilterPipe],
  template: `
    <div class="module-container">
      <h1>📋 Déclarations</h1>

      <div class="tabs">
        <button class="tab" [class.active]="cat==='FISCAL'" (click)="cat='FISCAL'">Fiscales</button>
        <button class="tab" [class.active]="cat==='SOCIAL'" (click)="cat='SOCIAL'">Sociales</button>
        <button class="tab" [class.active]="cat==='AUTRES'" (click)="cat='AUTRES'">Autres</button>
      </div>

      <div *ngIf="cat==='FISCAL'">
        <div class="help">Réf. Burkina: <a target="_blank" href="https://dgi.bf/calendrier-fiscal/">Calendrier fiscal DGI</a></div>
        <div class="subtabs">
          <button class="tab" [class.active]="active==='TVA'" (click)="active='TVA'">TVA</button>
          <button class="tab" [class.active]="active==='IS'" (click)="active='IS'">IS</button>
        </div>
        <div class="panel" *ngIf="active==='TVA'">
          <h3>Déclaration TVA</h3>
          <div class="grid">
            <label>Période (AAAA-MM)<input class="input" [(ngModel)]="tva.period" placeholder="2025-07"/></label>
            <label>Année<input class="input" type="number" [(ngModel)]="tva.year"/></label>
            <label>CA HT ventes<input class="input" type="number" step="0.01" [(ngModel)]="tva.caHt"/></label>
            <label>TVA collectée<input class="input" type="number" step="0.01" [(ngModel)]="tva.tvaCollecte"/></label>
            <label>Achat HT<input class="input" type="number" step="0.01" [(ngModel)]="tva.achatHt"/></label>
            <label>TVA déductible<input class="input" type="number" step="0.01" [(ngModel)]="tva.tvaDeductible"/></label>
          </div>
          <div class="row">
            <span>TVA à payer: <b>{{ tvaDue() | number:'1.2-2' }}</b></span>
            <button class="btn" (click)="save('TVA', tvaDue(), tva, 'FISCAL')">Enregistrer</button>
          </div>
        </div>
        <div class="panel" *ngIf="active==='IS'">
          <h3>Déclaration IS</h3>
          <div class="grid">
            <label>Année<input class="input" type="number" [(ngModel)]="is.year"/></label>
            <label>Résultat fiscal<input class="input" type="number" step="0.01" [(ngModel)]="is.resultat"/></label>
            <label>Taux (%)<input class="input" type="number" step="0.01" [(ngModel)]="is.taux"/></label>
          </div>
          <div class="row">
            <span>IS dû: <b>{{ isDue() | number:'1.2-2' }}</b></span>
            <button class="btn" (click)="save('IS', isDue(), is, 'FISCAL')">Enregistrer</button>
          </div>
        </div>
      </div>

      <div *ngIf="cat==='SOCIAL'">
        <div class="help">Réf. Burkina (CNSS): <a target="_blank" href="https://businessprocedures.bf/media/D%C3%A9cret-2021-0337%20portant%20r%C3%A9gime%20de%20s%C3%A9curit%C3%A9%20sociale%20au%20Burkina%20Faso.pdf">Décret CNSS</a></div>
        <div class="panel">
          <h3>Déclaration CNSS</h3>
          <div class="grid">
            <label>Période (AAAA-MM)<input class="input" [(ngModel)]="cnss.period" placeholder="2025-07"/></label>
            <label>Année<input class="input" type="number" [(ngModel)]="cnss.year"/></label>
            <label>Masse salariale<input class="input" type="number" step="0.01" [(ngModel)]="cnss.masse"/></label>
            <label>Taux global (%)<input class="input" type="number" step="0.01" [(ngModel)]="cnss.taux"/></label>
          </div>
          <div class="row">
            <span>CNSS dû: <b>{{ cnssDue() | number:'1.2-2' }}</b></span>
            <button class="btn" (click)="save('CNSS', cnssDue(), cnss, 'SOCIAL')">Enregistrer</button>
          </div>
        </div>
      </div>

      <div *ngIf="cat==='AUTRES'">
        <div class="panel">
          <h3>Autres déclarations</h3>
          <div class="grid">
            <label>Type<input class="input" [(ngModel)]="autre.type" placeholder="Ex: IUTS, BIC, etc."/></label>
            <label>Période<input class="input" [(ngModel)]="autre.period" placeholder="2025-07 ou 2025-T1"/></label>
            <label>Année<input class="input" type="number" [(ngModel)]="autre.year"/></label>
            <label>Montant dû<input class="input" type="number" step="0.01" [(ngModel)]="autre.amountDue"/></label>
          </div>
          <div class="row">
            <button class=\"btn\" (click)=\"save('AUTRE', (autre.amountDue||0), autre, 'AUTRES')\">Enregistrer</button>
          </div>
        </div>
      </div>

      <h3>Historique des déclarations</h3>
      <div class="toolbar">
        <select class="input" [(ngModel)]="filterType">
          <option value="">Toutes</option>
          <option value="TVA">TVA</option>
          <option value="IS">IS</option>
          <option value="CNSS">CNSS</option>
          <option value="AUTRE">Autres</option>
        </select>
        <select class="input" [(ngModel)]="filterCat">
          <option value="">Toutes catégories</option>
          <option value="FISCAL">Fiscales</option>
          <option value="SOCIAL">Sociales</option>
          <option value="AUTRES">Autres</option>
        </select>
        <button class="btn" (click)="exportCsv()">Export CSV</button>
        <input type="file" accept=".csv" (change)="onImport($event)"/>
      </div>
      <table class="table">
        <thead><tr><th>Catégorie</th><th>Type</th><th>Période</th><th>Année</th><th>Montant dû</th><th>Statut</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let r of records | typeFilter:filterType">
            <td>{{ r.category }}</td>
            <td>{{ r.type }}</td>
            <td>{{ r.period }}</td>
            <td>{{ r.year }}</td>
            <td>{{ r.amountDue | number:'1.2-2' }}</td>
            <td>
              <select class="input" [(ngModel)]="r.status" (change)="update(r.id, { status: r.status })">
                <option value="BROUILLON">Brouillon</option>
                <option value="VALIDE">Validé</option>
                <option value="PAYE">Payé</option>
              </select>
            </td>
            <td>
              <button class="btn danger" (click)="remove(r.id)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .module-container { background:#fff; border-radius:12px; padding:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
    .tabs { display:flex; gap:6px; margin-bottom:8px; }
    .subtabs { display:flex; gap:6px; margin:8px 0; }
    .tab { padding:8px 12px; border:none; border-radius:6px; background:#e2e8f0; cursor:pointer; }
    .tab.active { background:#3182ce; color:#fff; }
    .panel { border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px; }
    .grid { display:grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap: 8px; }
    .toolbar { display:flex; gap:0.5rem; align-items:center; margin:8px 0; }
    .help { margin: 6px 0; color:#4a5568; }
    .input { padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px; }
    .btn { padding:8px 10px; border:none; border-radius:6px; background:#3182ce; color:#fff; cursor:pointer; }
    .btn.danger { background:#e53e3e; }
    .table { width:100%; border-collapse:collapse; }
    .table th, .table td { border:1px solid #e2e8f0; padding:8px 10px; text-align:left; }
    .table th { background:#f7fafc; }
  `]
})
export class TaxDeclarationsComponent {
  cat: 'FISCAL'|'SOCIAL'|'AUTRES' = 'FISCAL';
  active: DeclarationType = 'TVA';
  filterType = '' as '' | DeclarationType;
  filterCat = '' as '' | 'FISCAL'|'SOCIAL'|'AUTRES';

  tva = { period: '', year: new Date().getFullYear(), caHt: 0, tvaCollecte: 0, achatHt: 0, tvaDeductible: 0 };
  is = { year: new Date().getFullYear(), resultat: 0, taux: 25 };
  cnss = { period: '', year: new Date().getFullYear(), masse: 0, taux: 18 };
  autre = { type: '', period: '', year: new Date().getFullYear(), amountDue: 0 } as any;

  records: DeclarationRecord[] = [];

  constructor(private ds: DeclarationsService) {
    this.ds.getAll().subscribe(r => this.records = r);
  }

  tvaDue() { return Math.max(0, (Number(this.tva.tvaCollecte)||0) - (Number(this.tva.tvaDeductible)||0)); }
  isDue() { return Math.max(0, (Number(this.is.resultat)||0) * ((Number(this.is.taux)||0)/100)); }
  cnssDue() { return Math.max(0, (Number(this.cnss.masse)||0) * ((Number(this.cnss.taux)||0)/100)); }

  save(type: DeclarationType, amountDue: number, data: any, category?: 'FISCAL'|'SOCIAL'|'AUTRES') {
    const period = data.period || `${data.year}`;
    this.ds.add({ type, period, year: Number(data.year)||0, amountDue, status: 'BROUILLON', data, category: category || undefined });
  }
  update(id: string, patch: Partial<DeclarationRecord>) { this.ds.update(id, patch); }
  remove(id: string) { if (confirm('Supprimer ?')) this.ds.remove(id); }

  exportCsv() {
    const blob = this.ds.exportCsv(this.filterType||undefined, this.filterCat||undefined);
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'declarations.csv'; a.click(); URL.revokeObjectURL(url);
  }
  onImport(e: Event) {
    const input = e.target as HTMLInputElement; const f = input.files?.[0]; if (!f) return;
    const reader = new FileReader(); reader.onload = ()=>{
      const text = String(reader.result||'');
      this.ds.importCsv(text);
      input.value = '';
    }; reader.readAsText(f, 'utf-8');
  }
}