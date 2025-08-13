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
          <option value="AUTRE">Autre</option>
        </select>
        <button class="btn" (click)="addJournal()">Ajouter</button>
        <button class="btn" (click)="exportJournaux()">Export CSV Journaux</button>
        <button class="btn" (click)="exportJournauxExcel()">Export Excel</button>
        <button class="btn" (click)="exportJournauxPdf()">Export PDF</button>
      </div>

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

  constructor(private js: JournalService) {
    this.js.getJournaux().subscribe(j => this.journaux = j);
    this.js.getEcritures().subscribe(e => this.ecritures = e);
  }

  addJournal() {
    if (!this.newCode || !this.newLabel) return;
    this.js.addJournal({ code: this.newCode.toUpperCase(), libelle: this.newLabel, type: this.newType });
    this.newCode = this.newLabel = '';
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

  private download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }
}

function escapeHtml(v: string) { return v.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] as string)); }