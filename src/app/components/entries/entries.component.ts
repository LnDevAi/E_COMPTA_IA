import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalService, Ecriture, EcritureLigne } from '../../services/journal.service';

@Component({
  selector: 'app-entries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-container">
      <h1>🧾 Écritures</h1>

      <div class="toolbar">
        <label>Journal
          <select class="input" [(ngModel)]="journalCode">
            <option value="ACH">ACH - Achats</option>
            <option value="VEN">VEN - Ventes</option>
            <option value="BNK">BNK - Banque</option>
            <option value="OD">OD - Opérations diverses</option>
            <option value="SAL">SAL - Salaires</option>
            <option value="CSH">CSH - Caisses</option>
          </select>
        </label>
        <input class="input" type="date" [(ngModel)]="date"/>
        <input class="input" placeholder="Pièce" [(ngModel)]="piece"/>
        <input class="input" placeholder="Référence" [(ngModel)]="reference"/>
        <button class="btn" (click)="addLine()">Ajouter ligne</button>
        <button class="btn" (click)="saveEntry()">Enregistrer</button>
        <button class="btn" (click)="exportCsv()">Export CSV</button>
      </div>

      <table class="table">
        <thead><tr><th>Compte</th><th>Libellé</th><th>Débit</th><th>Crédit</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let l of lignes; let i = index">
            <td><input class="input" [(ngModel)]="l.compte"/></td>
            <td><input class="input" [(ngModel)]="l.libelle"/></td>
            <td><input class="input" type="number" step="0.01" [(ngModel)]="l.debit" (input)="recalc()"/></td>
            <td><input class="input" type="number" step="0.01" [(ngModel)]="l.credit" (input)="recalc()"/></td>
            <td><button class="btn danger" (click)="removeLine(i)">✖</button></td>
          </tr>
        </tbody>
        <tfoot>
          <tr><th colspan="2">Totaux</th><th>{{ totalDebit | number:'1.2-2' }}</th><th>{{ totalCredit | number:'1.2-2' }}</th><th></th></tr>
          <tr><th colspan="2">Balance (doit être 0)</th><th colspan="2">{{ (totalDebit - totalCredit) | number:'1.2-2' }}</th><th></th></tr>
        </tfoot>
      </table>

      <div *ngIf="error" class="err">{{ error }}</div>
      <div *ngIf="ok" class="ok">{{ ok }}</div>
    </div>
  `,
  styles: [`
    .module-container { background:#fff; border-radius:12px; padding:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
    .toolbar { display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:8px; align-items:center; }
    .input { padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px; }
    .btn { padding:8px 10px; border:none; border-radius:6px; background:#3182ce; color:#fff; cursor:pointer; }
    .btn.danger { background:#e53e3e; }
    .table { width:100%; border-collapse:collapse; }
    .table th, .table td { border:1px solid #e2e8f0; padding:8px 10px; text-align:left; }
    .table th { background:#f7fafc; }
    .err { color:#e53e3e; margin-top:8px; }
    .ok { color:#38a169; margin-top:8px; }
  `]
})
export class EntriesComponent {
  journalCode = 'OD';
  date = (new Date()).toISOString().slice(0,10);
  piece = '';
  reference = '';
  lignes: EcritureLigne[] = [ { compte: '', libelle: '', debit: 0, credit: 0 } ];
  totalDebit = 0;
  totalCredit = 0;
  error = '';
  ok = '';

  constructor(private js: JournalService) {}

  addLine() { this.lignes.push({ compte: '', libelle: '', debit: 0, credit: 0 }); }
  removeLine(i: number) { this.lignes.splice(i,1); this.recalc(); }
  recalc() {
    this.totalDebit = this.lignes.reduce((s,l)=>s+(Number(l.debit)||0),0);
    this.totalCredit = this.lignes.reduce((s,l)=>s+(Number(l.credit)||0),0);
  }

  saveEntry() {
    this.error = this.ok = '';
    try {
      this.js.addEcriture({ date: this.date, journalCode: this.journalCode, piece: this.piece, reference: this.reference, lignes: this.lignes });
      this.ok = 'Écriture enregistrée';
      this.lignes = [ { compte: '', libelle: '', debit: 0, credit: 0 } ];
      this.recalc();
    } catch (e: any) {
      this.error = e?.message || 'Erreur';
    }
  }

  exportCsv() {
    const blob = this.js.exportEcrituresCsv();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ecritures.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}