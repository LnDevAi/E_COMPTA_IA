import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalService, Journal, Ecriture } from '../../services/journal.service';
// Pipe simple pour filtrer par journal (standalone)
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'filterJournal', standalone: true })
export class FilterJournalPipe implements PipeTransform {
  transform(list: Ecriture[], journal?: string): Ecriture[] {
    if (!journal) return list;
    return list.filter(e => e.journalCode === journal);
  }
}

@Component({
  selector: 'app-journals',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterJournalPipe],
  template: `
    <div class="module-container">
      <h1>📓 Journaux</h1>
      <div class="toolbar">
        <input class="input" placeholder="Code (ex: SAL)" [(ngModel)]="newCode"/>
        <input class="input" placeholder="Libellé" [(ngModel)]="newLabel"/>
        <select class="input" [(ngModel)]="newType">
          <option value="ACHATS">Achats</option>
          <option value="VENTES">Ventes</option>
          <option value="BANQUE">Banque</option>
          <option value="OD">Opérations diverses</option>
          <option value="SALAIRES">Salaires</option>
          <option value="CAISSES">Caisses</option>
          <option value="MONNAIE_ELECTRONIQUE">Monnaie électronique</option>
          <option value="AUTRE">Autre</option>
        </select>
        <button class="btn" (click)="addJournal()">Ajouter</button>
        <button class="btn" (click)="exportJournaux()">Export CSV Journaux</button>
        <button class="btn" (click)="exportJournauxExcel()">Export Excel</button>
        <button class="btn" (click)="exportJournauxPdf()">Export PDF</button>
        <button class="btn" (click)="generateDemoData()">Générer données démo</button>
      </div>
      <div *ngIf="err" class="err">{{ err }}</div>
      <div *ngIf="ok" class="ok">{{ ok }}</div>

      <table class="table">
        <thead><tr><th>Code</th><th>Libellé</th><th>Type</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let j of journaux">
            <td>{{ j.code }}</td>
            <td>
              <ng-container *ngIf="editing === j.code; else viewLabel">
                <input class="input" [(ngModel)]="editLabel"/>
              </ng-container>
              <ng-template #viewLabel>{{ j.libelle }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="editing === j.code; else viewType">
                <select class="input" [(ngModel)]="editType">
                  <option value="ACHATS">Achats</option>
                  <option value="VENTES">Ventes</option>
                  <option value="BANQUE">Banque</option>
                  <option value="OD">Opérations diverses</option>
                  <option value="SALAIRES">Salaires</option>
                  <option value="CAISSES">Caisses</option>
                  <option value="MONNAIE_ELECTRONIQUE">Monnaie électronique</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </ng-container>
              <ng-template #viewType>{{ j.type }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="editing === j.code; else actionsView">
                <button class="btn" (click)="saveEdit(j.code)">Enregistrer</button>
                <button class="btn" (click)="cancelEdit()">Annuler</button>
              </ng-container>
              <ng-template #actionsView>
                <button class="btn" (click)="startEdit(j)">Modifier</button>
                <button class="btn danger" (click)="removeJournal(j.code)">Supprimer</button>
              </ng-template>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Écritures par journal</h2>
      <div class="toolbar">
        <select class="input" [(ngModel)]="selectedJournal">
          <option value="">Tous</option>
          <option *ngFor="let j of journaux" [value]="j.code">{{ j.code }} - {{ j.libelle }}</option>
        </select>
        <button class="btn" (click)="exportEcritures()">Export CSV Écritures</button>
        <button class="btn" (click)="exportEcrituresExcel()">Export Excel</button>
        <button class="btn" (click)="exportEcrituresPdf()">Export PDF</button>
      </div>

      <table class="table">
        <thead><tr><th>ID</th><th>Date</th><th>Journal</th><th>Pièce</th><th>Réf</th><th>Total Débit</th><th>Total Crédit</th></tr></thead>
        <tbody>
          <tr *ngFor="let e of ecritures | filterJournal:selectedJournal">
            <td>{{ e.id }}</td>
            <td>{{ e.date }}</td>
            <td>{{ e.journalCode }}</td>
            <td>{{ e.piece }}</td>
            <td>{{ e.reference }}</td>
            <td>{{ e.totalDebit }}</td>
            <td>{{ e.totalCredit }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .module-container { background:#fff; border-radius:12px; padding:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
    .toolbar { display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:8px; }
    .input { padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px; }
    .btn { padding:8px 10px; border:none; border-radius:6px; background:#3182ce; color:#fff; cursor:pointer; }
    .btn.danger { background:#e53e3e; }
    .table { width:100%; border-collapse:collapse; }
    .table th, .table td { border:1px solid #e2e8f0; padding:8px 10px; text-align:left; }
    .table th { background:#f7fafc; }
    .err { color:#e53e3e; margin-bottom:8px; }
    .ok { color:#38a169; margin-bottom:8px; }
  `]
})
export class JournalsComponent {
  journaux: Journal[] = [];
  ecritures: Ecriture[] = [];

  newCode = '';
  newLabel = '';
  newType: Journal['type'] = 'AUTRE';
  selectedJournal = '';

  editing: string | null = null;
  editLabel = '';
  editType: Journal['type'] = 'AUTRE';
  err = '';
  ok = '';

  constructor(private js: JournalService) {
    this.js.getJournaux().subscribe(j => this.journaux = j);
    this.js.getEcritures().subscribe(e => this.ecritures = e);
  }

  addJournal() {
    this.err = this.ok = '';
    const code = (this.newCode||'').trim().toUpperCase();
    const label = (this.newLabel||'').trim();
    const type = this.newType;
    if (!code || !label) { this.err = 'Code et Libellé requis'; return; }
    if (!/^[A-Z0-9_-]{2,10}$/.test(code)) { this.err = 'Code invalide (2-10 caractères alphanumériques)'; return; }
    try {
      this.js.addJournal({ code, libelle: label, type });
      this.newCode = this.newLabel = '';
      this.ok = 'Journal ajouté';
    } catch (e: any) {
      this.err = e?.message || 'Erreur lors de l\'ajout';
    }
  }
  removeJournal(code: string) {
    if (confirm(`Supprimer le journal ${code} ?`)) this.js.removeJournal(code);
  }

  startEdit(j: Journal) {
    this.editing = j.code;
    this.editLabel = j.libelle;
    this.editType = j.type;
  }
  saveEdit(code: string) {
    if (!this.editing) return;
    this.js.updateJournal(code, { libelle: this.editLabel, type: this.editType });
    this.ok = 'Journal mis à jour';
    this.cancelEdit();
  }
  cancelEdit() {
    this.editing = null;
    this.editLabel = '';
    this.editType = 'AUTRE';
  }

  exportJournaux() {
    const blob = this.js.exportJournauxCsv();
    this.download(blob, 'journaux.csv');
  }
  exportJournauxExcel() {
    const html = `
      <html><head><meta charset="UTF-8"></head><body>
      <table border="1"><thead><tr><th>Code</th><th>Libellé</th><th>Type</th></tr></thead><tbody>
      ${this.journaux.map(j => `<tr><td>${j.code}</td><td>${escapeHtml(j.libelle)}</td><td>${j.type}</td></tr>`).join('')}
      </tbody></table></body></html>`;
    const blob = this.js.exportHtmlTableExcel(html);
    this.download(blob, 'journaux.xls');
  }
  exportJournauxPdf() {
    const win = window.open('', '_blank'); if (!win) return;
    win.document.write('<html><head><meta charset="UTF-8"><title>Journaux</title></head><body>');
    win.document.write('<h2>Journaux</h2><table border=1><thead><tr><th>Code</th><th>Libellé</th><th>Type</th></tr></thead><tbody>');
    for (const j of this.journaux) win.document.write(`<tr><td>${j.code}</td><td>${escapeHtml(j.libelle)}</td><td>${j.type}</td></tr>`);
    win.document.write('</tbody></table></body></html>');
    win.document.close(); win.print();
  }

  exportEcritures() {
    const blob = this.js.exportEcrituresCsv(this.selectedJournal || undefined);
    this.download(blob, 'ecritures.csv');
  }
  exportEcrituresExcel() {
    const rows = this.ecritures.filter(e => !this.selectedJournal || e.journalCode === this.selectedJournal);
    const html = `
      <html><head><meta charset="UTF-8"></head><body>
      <table border="1"><thead><tr><th>ID</th><th>Date</th><th>Journal</th><th>Pièce</th><th>Réf</th><th>Total Débit</th><th>Total Crédit</th></tr></thead><tbody>
      ${rows.map(e => `<tr><td>${e.id}</td><td>${e.date}</td><td>${e.journalCode}</td><td>${escapeHtml(e.piece||'')}</td><td>${escapeHtml(e.reference||'')}</td><td>${e.totalDebit}</td><td>${e.totalCredit}</td></tr>`).join('')}
      </tbody></table></body></html>`;
    const blob = this.js.exportHtmlTableExcel(html);
    this.download(blob, 'ecritures.xls');
  }
  exportEcrituresPdf() {
    const rows = this.ecritures.filter(e => !this.selectedJournal || e.journalCode === this.selectedJournal);
    const win = window.open('', '_blank'); if (!win) return;
    win.document.write('<html><head><meta charset="UTF-8"><title>Écritures</title></head><body>');
    win.document.write('<h2>Écritures</h2><table border=1><thead><tr><th>ID</th><th>Date</th><th>Journal</th><th>Pièce</th><th>Réf</th><th>Total Débit</th><th>Total Crédit</th></tr></thead><tbody>');
    for (const e of rows) win.document.write(`<tr><td>${e.id}</td><td>${e.date}</td><td>${e.journalCode}</td><td>${escapeHtml(e.piece||'')}</td><td>${escapeHtml(e.reference||'')}</td><td>${e.totalDebit}</td><td>${e.totalCredit}</td></tr>`);
    win.document.write('</tbody></table></body></html>');
    win.document.close(); win.print();
  }

  generateDemoData() {
    this.err = this.ok = '';
    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0,10);
    const addDays = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate()-n);
    const entries: Array<Omit<Ecriture,'id'|'totalDebit'|'totalCredit'>> = [];

    // Vente: 701/4457 contre 411, puis règlement 512
    const d1 = addDays(30);
    entries.push({
      date: iso(d1), journalCode: 'VEN', piece: 'FAC-001', reference: 'Vente produits',
      lignes: [
        { compte: '411', libelle: 'Client X', debit: 118000, credit: 0 },
        { compte: '701', libelle: 'Vente', debit: 0, credit: 100000 },
        { compte: '4457', libelle: 'TVA collectée', debit: 0, credit: 18000 }
      ]
    });
    const d2 = addDays(25);
    entries.push({
      date: iso(d2), journalCode: 'BNK', piece: 'REC-001', reference: 'Règlement client X',
      lignes: [
        { compte: '512', libelle: 'Banque', debit: 118000, credit: 0 },
        { compte: '411', libelle: 'Client X', debit: 0, credit: 118000 }
      ]
    });

    // Achat: 607/44566 contre 401, puis paiement 512
    const d3 = addDays(20);
    entries.push({
      date: iso(d3), journalCode: 'ACH', piece: 'ACH-001', reference: 'Achat marchandises',
      lignes: [
        { compte: '607', libelle: 'Achats', debit: 50000, credit: 0 },
        { compte: '44566', libelle: 'TVA déductible', debit: 9000, credit: 0 },
        { compte: '401', libelle: 'Fournisseur Y', debit: 0, credit: 59000 }
      ]
    });
    const d4 = addDays(15);
    entries.push({
      date: iso(d4), journalCode: 'BNK', piece: 'PAI-001', reference: 'Paiement fournisseur Y',
      lignes: [
        { compte: '401', libelle: 'Fournisseur Y', debit: 59000, credit: 0 },
        { compte: '512', libelle: 'Banque', debit: 0, credit: 59000 }
      ]
    });

    // Salaires
    const d5 = addDays(10);
    entries.push({
      date: iso(d5), journalCode: 'SAL', piece: 'PAY-001', reference: 'Salaire mois',
      lignes: [
        { compte: '641', libelle: 'Charges salaires', debit: 80000, credit: 0 },
        { compte: '421', libelle: 'Rémunérations dues', debit: 0, credit: 80000 }
      ]
    });
    const d6 = addDays(7);
    entries.push({
      date: iso(d6), journalCode: 'BNK', piece: 'VIR-001', reference: 'Virement salaires',
      lignes: [
        { compte: '421', libelle: 'Rémunérations dues', debit: 80000, credit: 0 },
        { compte: '512', libelle: 'Banque', debit: 0, credit: 80000 }
      ]
    });

    // OD: amortissement simple
    const d7 = addDays(5);
    entries.push({
      date: iso(d7), journalCode: 'OD', piece: 'AMO-001', reference: 'Dotations amortissements',
      lignes: [
        { compte: '6811', libelle: 'Dotations', debit: 10000, credit: 0 },
        { compte: '281', libelle: 'Amortissements', debit: 0, credit: 10000 }
      ]
    });

    try {
      for (const e of entries) this.js.addEcriture(e);
      this.ok = 'Données de démonstration générées';
    } catch (e: any) {
      this.err = e?.message || 'Erreur lors de la génération';
    }
  }

  private download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }
}

function escapeHtml(v: string) { return v.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] as string)); }