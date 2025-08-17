import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalService, Ecriture } from '../../services/journal.service';
import { ChartOfAccountsService } from '../../services/chart-of-accounts.service';

interface BalanceRow {
	compte: string;
	intitule: string;
	prevDebit: number; prevCredit: number;
	movDebit: number; movCredit: number;
	endDebit: number; endCredit: number;
}

@Component({
	selector: 'app-balance',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
		<div class="module-container">
			<h1>🧮 Balance</h1>
			<div class="toolbar">
				<label>Du <input class="input" type="date" [(ngModel)]="from"/></label>
				<label>Au <input class="input" type="date" [(ngModel)]="to"/></label>
				<label>Format
					<select class="input" [(ngModel)]="format">
						<option value="6">6 colonnes (SA, Mouvements, Soldes)</option>
						<option value="4">4 colonnes (Mouvements, Soldes)</option>
						<option value="2">2 colonnes (Soldes)</option>
					</select>
				</label>
				<button class="btn" (click)="compute()">Calculer</button>
				<button class="btn" (click)="exportCsv()">Export CSV</button>
				<button class="btn" (click)="exportExcel()">Export Excel</button>
				<button class="btn" (click)="exportPdf()" [disabled]="!rows.length">Export PDF</button>
				<input type="file" accept=".csv" (change)="onImportOpeningBalances($event)"/>
			</div>

			<table class="table" *ngIf="rows.length">
				<thead>
					<tr>
						<th>Compte</th><th>Intitulé</th>
						<th *ngIf="format==='6'">SA Débit</th>
						<th *ngIf="format==='6'">SA Crédit</th>
						<th *ngIf="format!=='2'">Mvts Débit</th>
						<th *ngIf="format!=='2'">Mvts Crédit</th>
						<th>Solde Débit</th>
						<th>Solde Crédit</th>
					</tr>
				</thead>
				<tbody>
					<tr *ngFor="let r of rows">
						<td>{{ r.compte }}</td>
						<td>{{ r.intitule }}</td>
						<td *ngIf="format==='6'">{{ r.prevDebit | number:'1.2-2' }}</td>
						<td *ngIf="format==='6'">{{ r.prevCredit | number:'1.2-2' }}</td>
						<td *ngIf="format!=='2'">{{ r.movDebit | number:'1.2-2' }}</td>
						<td *ngIf="format!=='2'">{{ r.movCredit | number:'1.2-2' }}</td>
						<td>{{ r.endDebit | number:'1.2-2' }}</td>
						<td>{{ r.endCredit | number:'1.2-2' }}</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<th colspan="2">Totaux</th>
						<th *ngIf="format==='6'">{{ total.prevDebit | number:'1.2-2' }}</th>
						<th *ngIf="format==='6'">{{ total.prevCredit | number:'1.2-2' }}</th>
						<th *ngIf="format!=='2'">{{ total.movDebit | number:'1.2-2' }}</th>
						<th *ngIf="format!=='2'">{{ total.movCredit | number:'1.2-2' }}</th>
						<th>{{ total.endDebit | number:'1.2-2' }}</th>
						<th>{{ total.endCredit | number:'1.2-2' }}</th>
					</tr>
				</tfoot>
			</table>
		</div>
	`,
	styles: [`
		.module-container { background:#fff; border-radius:12px; padding:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
		.toolbar { display:flex; gap:0.5rem; align-items:center; margin-bottom:8px; }
		.input { padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px; }
		.btn { padding:8px 10px; border:none; border-radius:6px; background:#3182ce; color:#fff; cursor:pointer; }
		.table { width:100%; border-collapse:collapse; }
		.table th, .table td { border:1px solid #e2e8f0; padding:8px 10px; text-align:left; }
	`]
})
export class BalanceComponent {
	from = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10);
	to = new Date().toISOString().slice(0,10);
	format: '6'|'4'|'2' = '6';
	rows: BalanceRow[] = [];
	total = { prevDebit:0, prevCredit:0, movDebit:0, movCredit:0, endDebit:0, endCredit:0 } as any;
	private libelles = new Map<string,string>();

	constructor(private js: JournalService, private coa: ChartOfAccountsService) {
		this.coa.getPlan().subscribe(p => {
			for (const i of p) this.libelles.set(i.code, i.intitule);
		});
	}

	private labelFor(code: string): string { return this.libelles.get(code) || code; }

	compute() {
		const ecritures: Ecriture[] = (this.js as any).ecritures$?.value || [];
		const map = new Map<string, BalanceRow>();
		const fromD = this.from;
		const toD = this.to;
		const before = (d: string) => d < fromD;
		const within = (d: string) => d >= fromD && d <= toD;

		for (const e of ecritures) {
			for (const l of e.lignes) {
				const key = l.compte || '';
				if (!key) continue;
				if (!map.has(key)) map.set(key, { compte: key, intitule: this.labelFor(key), prevDebit:0, prevCredit:0, movDebit:0, movCredit:0, endDebit:0, endCredit:0 });
				const row = map.get(key)!;
				if (before(e.date)) { row.prevDebit += Number(l.debit)||0; row.prevCredit += Number(l.credit)||0; }
				if (within(e.date)) { row.movDebit += Number(l.debit)||0; row.movCredit += Number(l.credit)||0; }
			}
		}
		this.rows = Array.from(map.values()).map(r => {
			const prevBal = (r.prevDebit - r.prevCredit);
			const movBal = (r.movDebit - r.movCredit);
			const endBal = prevBal + movBal;
			const endDebit = endBal > 0 ? endBal : 0;
			const endCredit = endBal < 0 ? -endBal : 0;
			return { ...r, endDebit, endCredit };
		}).sort((a,b)=>a.compte.localeCompare(b.compte));

		// Totaux
		const sum = { prevDebit:0, prevCredit:0, movDebit:0, movCredit:0, endDebit:0, endCredit:0 } as any;
		for (const r of this.rows) {
			sum.prevDebit += r.prevDebit; sum.prevCredit += r.prevCredit;
			sum.movDebit += r.movDebit; sum.movCredit += r.movCredit;
			sum.endDebit += r.endDebit; sum.endCredit += r.endCredit;
		}
		this.total = sum;
	}

	exportCsv() {
		const cols = ['compte','intitule'];
		if (this.format==='6') cols.push('sa_debit','sa_credit');
		if (this.format!=='2') cols.push('mvt_debit','mvt_credit');
		cols.push('solde_debit','solde_credit');
		const header = cols.join(';');
		const lines = this.rows.map(r => [r.compte, this.csv(r.intitule), ...(this.format==='6'?[r.prevDebit,r.prevCredit]:[]), ...(this.format!=='2'?[r.movDebit,r.movCredit]:[]), r.endDebit, r.endCredit].join(';'));
		this.downloadBlob(new Blob(["\uFEFF" + [header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' }), 'balance.csv');
	}
	exportExcel() {
		const headers = ['Compte','Intitulé'];
		if (this.format==='6') headers.push('SA Débit','SA Crédit');
		if (this.format!=='2') headers.push('Mvt Débit','Mvt Crédit');
		headers.push('Solde Débit','Solde Crédit');
		const rows = this.rows.map(r => `<tr><td>${r.compte}</td><td>${this.escapeHtml(r.intitule)}</td>${this.format==='6'?`<td>${r.prevDebit}</td><td>${r.prevCredit}</td>`:''}${this.format!=='2'?`<td>${r.movDebit}</td><td>${r.movCredit}</td>`:''}<td>${r.endDebit}</td><td>${r.endCredit}</td></tr>`).join('');
		const html = `<table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
		this.downloadBlob(new Blob([html], { type: 'application/vnd.ms-excel' }), 'balance.xls');
	}
	onImportOpeningBalances(e: Event) {
		const input = e.target as HTMLInputElement; const f = input.files?.[0]; if (!f) return;
		const r = new FileReader(); r.onload = ()=>{
			const text = String(r.result||'');
			const lines = text.split(/\r?\n/).filter(l=>l.trim());
			const entries: Ecriture[] = [] as any;
			const today = this.from || new Date().toISOString().slice(0,10);
			const lignes: any[] = [];
			for (let i=1;i<lines.length;i++) {
				const [compte, debitStr, creditStr] = lines[i].split(';');
				const debit = Number(debitStr||0); const credit = Number(creditStr||0);
				if (!compte) continue;
				lignes.push({ compte, libelle: 'Solde antérieur', debit, credit });
			}
			if (lignes.length) {
				(this.js as any).addEcriture({ date: today, journalCode: 'OD', piece: 'OPEN', reference: 'Soldes antérieurs', lignes });
				this.compute();
			}
			input.value = '';
		}; r.readAsText(f, 'utf-8');
	}

	private csv(v: string) { return (v?.includes(';')||v?.includes('"')) ? '"'+v.replace(/"/g,'""')+'"' : v; }
	private downloadBlob(b: Blob, name: string) { const url = URL.createObjectURL(b); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }
	private escapeHtml(s: string) { return (s||'').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c] as string)); }

	async exportPdf() {
		const { default: jsPDF } = await import('jspdf');
		const autoTable = (await import('jspdf-autotable')).default as any;
		const doc = new jsPDF({ orientation: 'l', unit: 'pt', format: 'a4' });
		const margin = 24; let y = margin;
		doc.setFontSize(14); doc.text(`Balance (${this.format} colonnes) — ${this.from} → ${this.to}`, margin, y); y += 16;
		const head: string[] = ['Compte','Intitulé'];
		if (this.format==='6') { head.push('SA Débit','SA Crédit'); }
		if (this.format!=='2') { head.push('Mvt Débit','Mvt Crédit'); }
		head.push('Solde Débit','Solde Crédit');
		const body = this.rows.map(r => {
			const arr: any[] = [r.compte, r.intitule];
			if (this.format==='6') { arr.push(r.prevDebit.toFixed(2), r.prevCredit.toFixed(2)); }
			if (this.format!=='2') { arr.push(r.movDebit.toFixed(2), r.movCredit.toFixed(2)); }
			arr.push(r.endDebit.toFixed(2), r.endCredit.toFixed(2));
			return arr;
		});
		autoTable(doc, { startY: y, head: [head], body, styles: { fontSize: 9 }, margin: { left: margin, right: margin } });
		// Totaux
		const y2 = (doc as any).lastAutoTable.finalY + 10;
		doc.setFontSize(11);
		doc.text(`Totaux: ${this.format==='6'?`SA D ${this.total.prevDebit.toFixed(2)} / SA C ${this.total.prevCredit.toFixed(2)} — `:''}${this.format!=='2'?`Mvts D ${this.total.movDebit.toFixed(2)} / Mvts C ${this.total.movCredit.toFixed(2)} — `:''}Solde D ${this.total.endDebit.toFixed(2)} / Solde C ${this.total.endCredit.toFixed(2)}`, margin, y2);
		doc.save('balance.pdf');
	}
}