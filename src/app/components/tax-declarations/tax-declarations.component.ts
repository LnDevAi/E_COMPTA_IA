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
        <button class="tab" [class.active]="active==='TVA'" (click)="active='TVA'">TVA</button>
        <button class="tab" [class.active]="active==='IS'" (click)="active='IS'">Impôt (IS)</button>
        <button class="tab" [class.active]="active==='CNPS'" (click)="active='CNPS'">CNPS</button>
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
          <button class="btn" (click)="save('TVA', tvaDue(), tva)">Enregistrer</button>
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
          <button class="btn" (click)="save('IS', isDue(), is)">Enregistrer</button>
        </div>
      </div>

      <div class="panel" *ngIf="active==='CNPS'">
        <h3>Déclaration CNPS</h3>
        <div class="grid">
          <label>Période (AAAA-MM)<input class="input" [(ngModel)]="cnps.period" placeholder="2025-07"/></label>
          <label>Année<input class="input" type="number" [(ngModel)]="cnps.year"/></label>
          <label>Masse salariale<input class="input" type="number" step="0.01" [(ngModel)]="cnps.masse"/></label>
          <label>Taux global (%)<input class="input" type="number" step="0.01" [(ngModel)]="cnps.taux"/></label>
        </div>
        <div class="row">
          <span>CNPS dû: <b>{{ cnpsDue() | number:'1.2-2' }}</b></span>
          <button class="btn" (click)="save('CNPS', cnpsDue(), cnps)">Enregistrer</button>
        </div>
      </div>

      <h3>Historique des déclarations</h3>
      <div class="toolbar">
        <select class="input" [(ngModel)]="filterType">
          <option value="">Toutes</option>
          <option value="TVA">TVA</option>
          <option value="IS">IS</option>
          <option value="CNPS">CNPS</option>
        </select>
        <button class="btn" (click)="exportCsv()">Export CSV</button>
        <input type="file" accept=".csv" (change)="onImport($event)"/>
      </div>
      <table class="table">
        <thead><tr><th>Type</th><th>Période</th><th>Année</th><th>Montant dû</th><th>Statut</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let r of records | typeFilter:filterType">
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
    .tab { padding:8px 12px; border:none; border-radius:6px; background:#e2e8f0; cursor:pointer; }
    .tab.active { background:#3182ce; color:#fff; }
    .panel { border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px; }
    .grid { display:grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap: 8px; }
    .toolbar { display:flex; gap:0.5rem; align-items:center; margin:8px 0; }
    .input { padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px; }
    .btn { padding:8px 10px; border:none; border-radius:6px; background:#3182ce; color:#fff; cursor:pointer; }
    .btn.danger { background:#e53e3e; }
    .table { width:100%; border-collapse:collapse; }
    .table th, .table td { border:1px solid #e2e8f0; padding:8px 10px; text-align:left; }
    .table th { background:#f7fafc; }
  `]
})
export class TaxDeclarationsComponent {
  active: DeclarationType = 'TVA';
  filterType = '' as '' | DeclarationType;

  tva = { period: '', year: new Date().getFullYear(), caHt: 0, tvaCollecte: 0, achatHt: 0, tvaDeductible: 0 };
  is = { year: new Date().getFullYear(), resultat: 0, taux: 25 };
  cnps = { period: '', year: new Date().getFullYear(), masse: 0, taux: 18 };

  records: DeclarationRecord[] = [];

  constructor(private ds: DeclarationsService) {
    this.ds.getAll().subscribe(r => this.records = r);
  }

  tvaDue() { return Math.max(0, (Number(this.tva.tvaCollecte)||0) - (Number(this.tva.tvaDeductible)||0)); }
  isDue() { return Math.max(0, (Number(this.is.resultat)||0) * ((Number(this.is.taux)||0)/100)); }
  cnpsDue() { return Math.max(0, (Number(this.cnps.masse)||0) * ((Number(this.cnps.taux)||0)/100)); }

  save(type: DeclarationType, amountDue: number, data: any) {
    const period = data.period || `${data.year}`;
    this.ds.add({ type, period, year: Number(data.year)||0, amountDue, status: 'BROUILLON', data });
  }
  update(id: string, patch: Partial<DeclarationRecord>) { this.ds.update(id, patch); }
  remove(id: string) { if (confirm('Supprimer ?')) this.ds.remove(id); }

  exportCsv() {
    const blob = this.ds.exportCsv(this.filterType||undefined);
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