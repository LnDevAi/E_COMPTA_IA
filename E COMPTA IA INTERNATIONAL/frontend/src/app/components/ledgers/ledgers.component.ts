import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalService, Ecriture } from '../../services/journal.service';

interface LedgerLine { date: string; journal: string; piece?: string; reference?: string; libelle: string; debit: number; credit: number; balance: number }

@Component({
	selector: 'app-ledgers',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
		<div class="module-container">
			<h1>📚 Grands Livres</h1>
			<div class="toolbar">
				<label>Compte<input class="input" [(ngModel)]="compte" placeholder="Ex: 601, 445, 512"/></label>
				<label>Du <input class="input" type="date" [(ngModel)]="from"/></label>
				<label>Au <input class="input" type="date" [(ngModel)]="to"/></label>
				<button class="btn" (click)="compute()">Afficher</button>
				<button class="btn" (click)="exportCsv()" [disabled]="!lines.length">Export CSV</button>
				<button class="btn" (click)="exportPdf()" [disabled]="!lines.length">Export PDF</button>
			</div>

			<div class="panel" *ngIf="lines.length">
				<div class="row">Solde initial: <b>{{ opening | number:'1.2-2' }}</b> — Solde courant: <b>{{ current | number:'1.2-2' }}</b></div>
				<table class="table">
					<thead><tr><th>Date</th><th>Journal</th><th>Pièce</th><th>Réf</th><th>Libellé</th><th>Débit</th><th>Crédit</th><th>Solde</th></tr></thead>
					<tbody>
						<tr *ngFor="let l of lines">
							<td>{{ l.date }}</td><td>{{ l.journal }}</td><td>{{ l.piece }}</td><td>{{ l.reference }}</td>
							<td>{{ l.libelle }}</td><td>{{ l.debit | number:'1.2-2' }}</td><td>{{ l.credit | number:'1.2-2' }}</td><td>{{ l.balance | number:'1.2-2' }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	`,
	styles: [`
		.module-container { background:#fff; border-radius:12px; padding:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
		.toolbar { display:flex; gap:0.5rem; align-items:center; margin-bottom:8px; }
		.input { padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px; }
		.btn { padding:8px 10px; border:none; border-radius:6px; background:#3182ce; color:#fff; cursor:pointer; }
		.table { width:100%; border-collapse:collapse; }
		.table th, .table td { border:1px solid #e2e8f0; padding:8px 10px; text-align:left; }
		.panel { border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-top:8px; }
	`]
})
export class LedgersComponent {
	compte = '';
	from = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10);
	to = new Date().toISOString().slice(0,10);
	lines: LedgerLine[] = [];
	opening = 0;
	current = 0;

	constructor(private js: JournalService) {}

	compute() {
		const ecritures: Ecriture[] = (this.js as any).ecritures$?.value || [];
		const from = this.from; const to = this.to; const cpt = (this.compte||'').trim();
		let opening = 0; const rows: LedgerLine[] = [];
		for (const e of ecritures) {
			for (const l of e.lignes) {
				if (cpt && l.compte !== cpt) continue;
				if (e.date < from) { opening += (Number(l.debit)||0) - (Number(l.credit)||0); continue; }
				if (e.date > to) continue;
				rows.push({ date: e.date, journal: e.journalCode, piece: e.piece, reference: e.reference, libelle: l.libelle, debit: Number(l.debit)||0, credit: Number(l.credit)||0, balance: 0 });
			}
		}
		rows.sort((a,b)=>a.date.localeCompare(b.date));
		let run = opening; for (const r of rows) { run += (r.debit - r.credit); r.balance = run; }
		this.opening = opening; this.current = run; this.lines = rows;
	}

	exportCsv() {
		const header = 'date;journal;piece;reference;libelle;debit;credit;solde';
		const rows = this.lines.map(l => [l.date,l.journal,l.piece||'',l.reference||'',this.csv(l.libelle),l.debit,l.credit,l.balance].join(';'));
		const blob = new Blob(["\uFEFF" + [header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'grand-livre.csv'; a.click(); URL.revokeObjectURL(url);
	}
	private csv(v: string) { return (v?.includes(';')||v?.includes('"')) ? '"'+v.replace(/"/g,'""')+'"' : v; }

	async exportPdf() {
		const { default: jsPDF } = await import('jspdf');
		const autoTable = (await import('jspdf-autotable')).default as any;
		const doc = new jsPDF({ orientation: 'l', unit: 'pt', format: 'a4' });
		const margin = 32; let y = margin;
		doc.setFontSize(14); doc.text(`Grand Livre — Compte ${this.compte || 'Tous'} ( ${this.from} → ${this.to} )`, margin, y); y += 16;
		autoTable(doc, {
			startY: y,
			head: [['Date','Journal','Pièce','Réf','Libellé','Débit','Crédit','Solde']],
			body: this.lines.map(l => [l.date,l.journal,l.piece||'',l.reference||'',l.libelle,(l.debit||0).toFixed(2),(l.credit||0).toFixed(2),(l.balance||0).toFixed(2)]),
			styles: { fontSize: 9 },
			margin: { left: margin, right: margin }
		});
		doc.save('grand-livre.pdf');
	}
}