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
      </div>

      <table class="table">
        <thead><tr><th>Code</th><th>Libellé</th><th>Type</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let j of journaux">
            <td>{{ j.code }}</td>
            <td>{{ j.libelle }}</td>
            <td>{{ j.type }}</td>
            <td>
              <button class="btn danger" (click)="removeJournal(j.code)">Supprimer</button>
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

  exportJournaux() {
    const blob = this.js.exportJournauxCsv();
    this.download(blob, 'journaux.csv');
  }
  exportEcritures() {
    const blob = this.js.exportEcrituresCsv(this.selectedJournal || undefined);
    this.download(blob, 'ecritures.csv');
  }

  private download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }
}