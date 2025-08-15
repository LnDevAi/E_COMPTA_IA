import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeclarationsService, DeclarationRecord, DeclarationType } from '../../services/declarations.service';
import { TypeFilterPipe } from './type-filter.pipe';
import { JournalService, EcritureLigne } from '../../services/journal.service';
import { EnterpriseService, PlatformSettings, EnterpriseIdentity } from '../../services/enterprise.service';

@Component({
  selector: 'app-tax-declarations',
  standalone: true,
  imports: [CommonModule, FormsModule, TypeFilterPipe],
  template: `
    <div class="module-container">
      <h1>📋 Déclarations</h1>

      <div class="help" *ngIf="selectedCountryCode && selectedCountryName">
        Pays: <b>{{ selectedCountryName }}</b> ({{ selectedCountryCode }}) — Devise: <b>{{ selectedCurrency }}</b>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="cat==='FISCAL'" (click)="cat='FISCAL'">Fiscales</button>
        <button class="tab" [class.active]="cat==='SOCIAL'" (click)="cat='SOCIAL'">Sociales</button>
        <button class="tab" [class.active]="cat==='AUTRES'" (click)="cat='AUTRES'">Autres</button>
      </div>

      <div *ngIf="cat==='FISCAL'">
        
        <div class="subtabs">
          <button class="tab" [class.active]="active==='TVA'" (click)="active='TVA'">TVA</button>
          <button class="tab" [class.active]="active==='IS'" (click)="active='IS'">IS</button>
          <button class="tab" [class.active]="active==='IUTS'" (click)="active='IUTS'">IUTS</button>
          <button class="tab" [class.active]="active==='BIC'" (click)="active='BIC'">BIC</button>
        </div>
        <div class="panel" *ngIf="active==='TVA'">
          <h3>Déclaration TVA</h3>
          <div class="help" *ngIf="taxInfo?.vat">
            Taux standard: <b>{{ taxInfo.vat.standardRate }}%</b>
            &nbsp;|&nbsp; Délais: <b>{{ taxInfo.vat.paymentDeadline }}</b>
          </div>
          <div class="grid">
            <label>Période (AAAA-MM)<input class="input" [(ngModel)]="tva.period" placeholder="2025-07"/></label>
            <label>Année<input class="input" type="number" [(ngModel)]="tva.year"/></label>
            <label>CA HT ventes<input class="input" type="number" step="0.01" [(ngModel)]="tva.caHt"/></label>
            <label>TVA collectée<input class="input" type="number" step="0.01" [(ngModel)]="tva.tvaCollecte"/></label>
            <label>Achat HT<input class="input" type="number" step="0.01" [(ngModel)]="tva.achatHt"/></label>
            <label>TVA déductible<input class="input" type="number" step="0.01" [(ngModel)]="tva.tvaDeductible"/></label>
            <label>Journal<input class="input" [(ngModel)]="tva.journal" placeholder="VEN/ACH/BNK"/></label>
            <label>Compte TVA collectée<input class="input" [(ngModel)]="tva.acctCollecte" placeholder="445"/></label>
            <label>Compte TVA déductible<input class="input" [(ngModel)]="tva.acctDeductible" placeholder="345"/></label>
          </div>
          <div class="row">
            <span>TVA à payer: <b>{{ tvaDue() | number:'1.2-2' }}</b></span>
            <button class="btn" (click)="save('TVA', tvaDue(), tva, 'FISCAL')">Enregistrer</button>
            <button class="btn" (click)="genEcritureTVA()">Générer écriture</button>
          </div>
        </div>
        <div class="panel" *ngIf="active==='IS'">
          <h3>Déclaration IS</h3>
          <div class="help" *ngIf="taxInfo?.corporateIncomeTax">
            Taux par défaut: <b>{{ taxInfo.corporateIncomeTax.rate }}%</b>
            &nbsp;|&nbsp; Échéance: <b>{{ taxInfo.corporateIncomeTax.paymentDeadline }}</b>
          </div>
          <div class="grid">
            <label>Année<input class="input" type="number" [(ngModel)]="is.year"/></label>
            <label>Résultat fiscal<input class="input" type="number" step="0.01" [(ngModel)]="is.resultat"/></label>
            <label>Taux (%)<input class="input" type="number" step="0.01" [(ngModel)]="is.taux"/></label>
            <label>Journal<input class="input" [(ngModel)]="is.journal" placeholder="OD/BNK"/></label>
            <label>Compte Impôt<input class="input" [(ngModel)]="is.acct" placeholder="444"/></label>
          </div>
          <div class="row">
            <span>IS dû: <b>{{ isDue() | number:'1.2-2' }}</b></span>
            <button class="btn" (click)="save('IS', isDue(), is, 'FISCAL')">Enregistrer</button>
            <button class="btn" (click)="genEcritureIS()">Générer écriture</button>
          </div>
        </div>
        <div class="panel" *ngIf="active==='IUTS'">
          <h3>IUTS</h3>
          <div class="grid">
            <label>Période<input class="input" [(ngModel)]="iuts.period"/></label>
            <label>Année<input class="input" type="number" [(ngModel)]="iuts.year"/></label>
            <label>Base imposable<input class="input" type="number" step="0.01" [(ngModel)]="iuts.base"/></label>
            <label>Taux (%)<input class="input" type="number" step="0.01" [(ngModel)]="iuts.taux"/></label>
            <label>Journal<input class="input" [(ngModel)]="iuts.journal" placeholder="OD/BNK"/></label>
            <label>Compte IUTS<input class="input" [(ngModel)]="iuts.acct" placeholder="442"/></label>
          </div>
          <div class="row">
            <span>IUTS dû: <b>{{ iutsDue() | number:'1.2-2' }}</b></span>
            <button class="btn" (click)="save('AUTRE', iutsDue(), iuts, 'FISCAL')">Enregistrer</button>
            <button class="btn" (click)="genEcritureIUTS()">Générer écriture</button>
          </div>
        </div>
        <div class="panel" *ngIf="active==='BIC'">
          <h3>BIC</h3>
          <div class="grid">
            <label>Période<input class="input" [(ngModel)]="bic.period"/></label>
            <label>Année<input class="input" type="number" [(ngModel)]="bic.year"/></label>
            <label>Base<input class="input" type="number" step="0.01" [(ngModel)]="bic.base"/></label>
            <label>Taux (%)<input class="input" type="number" step="0.01" [(ngModel)]="bic.taux"/></label>
            <label>Journal<input class="input" [(ngModel)]="bic.journal" placeholder="OD/BNK"/></label>
            <label>Compte BIC<input class="input" [(ngModel)]="bic.acct" placeholder="444"/></label>
          </div>
          <div class="row">
            <span>BIC dû: <b>{{ bicDue() | number:'1.2-2' }}</b></span>
            <button class="btn" (click)="save('AUTRE', bicDue(), bic, 'FISCAL')">Enregistrer</button>
            <button class="btn" (click)="genEcritureBIC()">Générer écriture</button>
          </div>
        </div>
      </div>

      <div *ngIf="cat==='SOCIAL'">
        
        <div class="panel">
          <h3>Déclaration CNSS</h3>
          <div class="help" *ngIf="taxInfo?.socialContributions">
            Taux employeur: <b>{{ taxInfo.socialContributions.employer?.rate }}%</b>
            &nbsp;|&nbsp; Taux salarié: <b>{{ taxInfo.socialContributions.employee?.rate }}%</b>
          </div>
          <div class="grid">
            <label>Période (AAAA-MM)<input class="input" [(ngModel)]="cnss.period" placeholder="2025-07"/></label>
            <label>Année<input class="input" type="number" [(ngModel)]="cnss.year"/></label>
            <label>Masse salariale<input class="input" type="number" step="0.01" [(ngModel)]="cnss.masse"/></label>
            <label>Taux employeur (%)<input class="input" type="number" step="0.01" [(ngModel)]="cnss.tauxEmp"/></label>
            <label>Taux salarié (%)<input class="input" type="number" step="0.01" [(ngModel)]="cnss.tauxSal"/></label>
            <label>Journal<input class="input" [(ngModel)]="cnss.journal" placeholder="SAL/BNK"/></label>
            <label>Compte charge employeur<input class="input" [(ngModel)]="cnss.acctChargeEmp" placeholder="645"/></label>
            <label>Compte retenue salarié<input class="input" [(ngModel)]="cnss.acctRetenueSal" placeholder="421"/></label>
            <label>Compte CNSS<input class="input" [(ngModel)]="cnss.acctCnss" placeholder="43"/></label>
          </div>
          <div class="row">
            <span>CNSS employeur: <b>{{ cnssEmpDue() | number:'1.2-2' }}</b> &nbsp; CNSS salarié: <b>{{ cnssSalDue() | number:'1.2-2' }}</b></span>
            <button class="btn" (click)="save('CNSS', cnssEmpDue()+cnssSalDue(), cnss, 'SOCIAL')">Enregistrer</button>
            <button class="btn" (click)="genEcritureCNSS()">Générer écriture</button>
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
            <button class="btn" (click)="save('AUTRE', (autre.amountDue||0), autre, 'AUTRES')">Enregistrer</button>
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

  tva = { period: '', year: new Date().getFullYear(), caHt: 0, tvaCollecte: 0, achatHt: 0, tvaDeductible: 0, journal: 'OD', acctCollecte: '445', acctDeductible: '345', contrepartie: '512' } as any;
  is = { year: new Date().getFullYear(), resultat: 0, taux: 25, journal: 'OD', acct: '444', contrepartie: '512' } as any;
  iuts = { period: '', year: new Date().getFullYear(), base: 0, taux: 1, journal: 'OD', acct: '442', contrepartie: '512' } as any;
  bic = { period: '', year: new Date().getFullYear(), base: 0, taux: 25, journal: 'OD', acct: '444', contrepartie: '512' } as any;
  cnss = { period: '', year: new Date().getFullYear(), masse: 0, tauxEmp: 16, tauxSal: 5, journal: 'SAL', acctChargeEmp: '645', acctRetenueSal: '421', acctCnss: '43' } as any;
  autre = { type: '', period: '', year: new Date().getFullYear(), amountDue: 0 } as any;

  records: DeclarationRecord[] = [];

  selectedCountryCode = '';
  selectedCountryName = '';
  selectedCurrency = '';
  taxInfo: any = null;
  private taxesDataset: any[] = [];

  constructor(private ds: DeclarationsService, private js: JournalService, private es: EnterpriseService) {
    this.ds.getAll().subscribe(r => this.records = r);

    // Suivre les paramètres d'entreprise pour récupérer le pays
    this.es.getSettings().subscribe((s: PlatformSettings) => {
      const code = (s?.app?.country||'').trim();
      if (code) { this.selectedCountryCode = code.toUpperCase(); this.tryApplyTaxDefaults(); }
    });
    this.es.getIdentity().subscribe((id: EnterpriseIdentity) => {
      if (!this.selectedCountryCode) {
        const val = (id?.country||'').trim();
        if (val && val.length === 2) { this.selectedCountryCode = val.toUpperCase(); this.tryApplyTaxDefaults(); }
      }
    });

    // Charger le dataset taxes depuis assets
    (async ()=>{
      try {
        let json: any = await fetch('assets/data/taxes-by-country-json.json').then(r=>r.ok?r.json():null);
        if (!json || !Array.isArray(json.countriesTaxes)) {
          json = await fetch('assets/data/countries-taxes.json').then(r=>r.ok?r.json():null);
        }
        if (json && Array.isArray(json.countriesTaxes)) {
          this.taxesDataset = json.countriesTaxes;
          this.tryApplyTaxDefaults();
        }
      } catch {}
    })();
  }

  private tryApplyTaxDefaults() {
    if (!this.selectedCountryCode || !this.taxesDataset?.length) return;
    const found = this.taxesDataset.find((c:any)=> String(c.code).toUpperCase() === this.selectedCountryCode);
    if (!found) return;
    this.selectedCountryName = found.name || '';
    this.selectedCurrency = found.currency || '';
    this.taxInfo = found.taxes || null;

    if (this.taxInfo?.corporateIncomeTax?.rate != null) {
      this.is.taux = Number(this.taxInfo.corporateIncomeTax.rate);
      this.bic.taux = Number(this.taxInfo.corporateIncomeTax.rate);
    }
    if (this.taxInfo?.socialContributions?.employer?.rate != null) {
      this.cnss.tauxEmp = Number(this.taxInfo.socialContributions.employer.rate);
    }
    if (this.taxInfo?.socialContributions?.employee?.rate != null) {
      this.cnss.tauxSal = Number(this.taxInfo.socialContributions.employee.rate);
    }
  }

  tvaDue() { return Math.max(0, (Number(this.tva.tvaCollecte)||0) - (Number(this.tva.tvaDeductible)||0)); }
  isDue() { return Math.max(0, (Number(this.is.resultat)||0) * ((Number(this.is.taux)||0)/100)); }
  iutsDue() { return Math.max(0, (Number(this.iuts.base)||0) * ((Number(this.iuts.taux)||0)/100)); }
  bicDue() { return Math.max(0, (Number(this.bic.base)||0) * ((Number(this.bic.taux)||0)/100)); }
  cnssEmpDue() { return Math.max(0, (Number(this.cnss.masse)||0) * ((Number(this.cnss.tauxEmp)||0)/100)); }
  cnssSalDue() { return Math.max(0, (Number(this.cnss.masse)||0) * ((Number(this.cnss.tauxSal)||0)/100)); }

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

  private addSimpleEntry(journal: string, label: string, debitAcct: string, creditAcct: string, amount: number) {
    const lignes: EcritureLigne[] = [
      { compte: debitAcct, libelle: label, debit: amount, credit: 0 },
      { compte: creditAcct, libelle: label, debit: 0, credit: amount }
    ];
    const today = new Date().toISOString().slice(0,10);
    this.js.addEcriture({ date: today, journalCode: journal || 'OD', piece: 'DECL', reference: label, lignes });
  }

  genEcritureTVA() {
    const due = this.tvaDue(); if (due <= 0) return;
    const label = `TVA période ${this.tva.period || this.tva.year}`;
    // Crédit compte TVA collectée (ou compte TVA), Débit contrepartie (banque ou 447) pour paiement
    this.addSimpleEntry(this.tva.journal, label, this.tva.contrepartie, this.tva.acctCollecte, due);
  }

  genEcritureIS() {
    const due = this.isDue(); if (due <= 0) return;
    const label = `IS ${this.is.year}`;
    this.addSimpleEntry(this.is.journal, label, this.is.contrepartie, this.is.acct, due);
  }

  genEcritureIUTS() {
    const due = this.iutsDue(); if (due <= 0) return;
    const label = `IUTS ${this.iuts.period || this.iuts.year}`;
    this.addSimpleEntry(this.iuts.journal, label, this.iuts.contrepartie, this.iuts.acct, due);
  }

  genEcritureBIC() {
    const due = this.bicDue(); if (due <= 0) return;
    const label = `BIC ${this.bic.period || this.bic.year}`;
    this.addSimpleEntry(this.bic.journal, label, this.bic.contrepartie, this.bic.acct, due);
  }

  genEcritureCNSS() {
    const dueEmp = this.cnssEmpDue();
    const dueSal = this.cnssSalDue();
    const total = dueEmp + dueSal; if (total <= 0) return;
    const label = `CNSS ${this.cnss.period || this.cnss.year}`;
    const lignes: EcritureLigne[] = [];
    if (dueEmp > 0) lignes.push({ compte: this.cnss.acctChargeEmp, libelle: label + ' part employeur', debit: dueEmp, credit: 0 });
    if (dueSal > 0) lignes.push({ compte: this.cnss.acctRetenueSal, libelle: label + ' part salarié', debit: dueSal, credit: 0 });
    lignes.push({ compte: this.cnss.acctCnss, libelle: label, debit: 0, credit: total });
    const today = new Date().toISOString().slice(0,10);
    this.js.addEcriture({ date: today, journalCode: this.cnss.journal || 'SAL', piece: 'DECL', reference: label, lignes });
  }
}