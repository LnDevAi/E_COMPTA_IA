import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalService, Ecriture } from '../../services/journal.service';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-financial-statements',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
		<div class="module-container">
			<h1>📈 États Financiers</h1>
			<div class="toolbar">
				<label>Du <input class="input" type="date" [(ngModel)]="from"/></label>
				<label>Au <input class="input" type="date" [(ngModel)]="to"/></label>
				<button class="btn" (click)="compute()">Calculer</button>
				<button class="btn" (click)="exportCsv()" [disabled]="!computed">Export CSV</button>
			</div>

			<div class="panel" *ngIf="computed">
				<h3>Compte de Résultat</h3>
				<table class="table">
					<tbody>
						<tr><td>Total Produits (classe 7)</td><td>{{ produits | number:'1.2-2' }}</td></tr>
						<tr><td>Total Charges (classe 6)</td><td>{{ charges | number:'1.2-2' }}</td></tr>
						<tr><th>Résultat Net</th><th>{{ resultat | number:'1.2-2' }}</th></tr>
					</tbody>
				</table>

				<h3>Bilan simplifié</h3>
				<table class="table">
					<thead><tr><th>Actif</th><th>Montant</th><th>Passif</th><th>Montant</th></tr></thead>
					<tbody>
						<tr><td>Immobilisations (classe 2)</td><td>{{ act_imm | number:'1.2-2' }}</td><td>Capitaux & Passifs LT (classe 1)</td><td>{{ pas_cap | number:'1.2-2' }}</td></tr>
						<tr><td>Stocks (classe 3)</td><td>{{ act_sto | number:'1.2-2' }}</td><td>Tiers (classe 4)</td><td>{{ pas_tiers | number:'1.2-2' }}</td></tr>
						<tr><td>Trésorerie (classe 5)</td><td>{{ act_tres | number:'1.2-2' }}</td><td>Résultat (CR)</td><td>{{ resultat | number:'1.2-2' }}</td></tr>
						<tr><th>Total Actif</th><th>{{ (act_imm+act_sto+act_tres) | number:'1.2-2' }}</th><th>Total Passif</th><th>{{ (pas_cap+pas_tiers+resultat) | number:'1.2-2' }}</th></tr>
					</tbody>
				</table>

				<h3>KPI</h3>
				<div class="help">Marge nette = Résultat / Produits</div>
				<ul>
					<li>Marge nette: <b>{{ (produits ? (resultat/produits*100) : 0) | number:'1.2-2' }}%</b></li>
					<li>Charges/Produits: <b>{{ (produits ? (charges/produits*100) : 0) | number:'1.2-2' }}%</b></li>
				</ul>
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
		.panel { border:1px solid #e2e8f0; border-radius:8px; padding:12px; }
		.help { color:#4a5568; margin:6px 0; }
	`]
})
export class FinancialStatementsComponent {
	from = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10);
	to = new Date().toISOString().slice(0,10);
	computed = false;
	produits = 0; charges = 0; resultat = 0;
	act_imm = 0; act_sto = 0; act_tres = 0; pas_cap = 0; pas_tiers = 0;
	mapping: any = null;

	constructor(private js: JournalService, private http: HttpClient) {
		this.http.get('/assets/specs/etats/mapping-ohada.json').subscribe(m => this.mapping = m);
	}

	compute() {
		const ecritures: Ecriture[] = (this.js as any).ecritures$?.value || [];
		const within = (d: string) => d >= this.from && d <= this.to;
		const sums = new Map<string, number>();
		for (const e of ecritures) {
			if (!within(e.date)) continue;
			for (const l of e.lignes) {
				const code = String(l.compte||''); if (!code) continue;
				const delta = (Number(l.debit)||0) - (Number(l.credit)||0);
				sums.set(code, (sums.get(code)||0) + delta);
			}
		}
		if (this.mapping) {
			const getByRange = (expr: string): string[] => {
				if (expr.includes('-')) { const [a,b] = expr.split('-'); return expandRange(a,b); }
				return [expr];
			};
			const expandRange = (a: string, b: string): string[] => {
				const res: string[] = []; const len = Math.max(a.length,b.length);
				const start = parseInt(a.padEnd(len,'0')); const end = parseInt(b.padEnd(len,'9'));
				for (const [code,] of sums) {
					const num = parseInt(code); if (!isNaN(num) && num>=start && num<=end) res.push(code);
				}
				return res;
			};
			const pick = (accExprs: string[], sense: 'debit'|'credit'|'credit-sign'|'debit-sign'): number => {
				let total = 0;
				const allCodes = accExprs.flatMap(getByRange);
				for (const code of new Set(allCodes)) {
					const v = sums.get(code)||0; // v>0 => débit net, v<0 => crédit net
					if (sense==='debit') total += Math.max(0, v);
					else if (sense==='credit') total += Math.max(0, -v);
					else if (sense==='debit-sign') total += v; else if (sense==='credit-sign') total += -v;
				}
				return total;
			};
			// Compte de résultat
			let prod = 0, chg = 0;
			for (const it of this.mapping.incomeStatement||[]) {
				const sense = it.polarity==='credit' ? 'credit' : 'debit';
				const val = pick(it.accounts||[], sense as any);
				if (it.polarity==='credit') prod += val; else chg += val;
			}
			this.produits = prod; this.charges = chg; this.resultat = prod - chg;
			// Bilan
			const aImm = pick(this.mapping.balanceSheet.assets[0].accounts, 'debit');
			const aSto = pick(this.mapping.balanceSheet.assets[1].accounts, 'debit');
			const aCli = pick(this.mapping.balanceSheet.assets[2].accounts, 'debit');
			const aTre = pick(this.mapping.balanceSheet.assets[3].accounts, 'debit');
			const pCap = pick(this.mapping.balanceSheet.liabilities[0].accounts, 'credit');
			const pDet = pick(this.mapping.balanceSheet.liabilities[1].accounts, 'credit');
			const pTre = pick(this.mapping.balanceSheet.liabilities[2].accounts, 'credit');
			this.act_imm = aImm; this.act_sto = aSto; this.act_tres = aTre; this.pas_cap = pCap; this.pas_tiers = pDet;
			this.computed = true; return;
		}
		// fallback ancien mode
		let prod = 0, chg = 0, c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
		for (const [code, val] of sums) {
			const cls = code[0];
			if (cls === '7') prod += Math.max(0, -val);
			else if (cls === '6') chg += Math.max(0, val);
			else if (cls === '1') c1 += Math.max(0, -val);
			else if (cls === '2') c2 += Math.max(0, val);
			else if (cls === '3') c3 += Math.max(0, val);
			else if (cls === '4') c4 += val;
			else if (cls === '5') c5 += Math.max(0, val);
		}
		this.produits = prod; this.charges = chg; this.resultat = prod - chg;
		this.act_imm = c2; this.act_sto = c3; this.act_tres = c5; this.pas_cap = c1; this.pas_tiers = Math.max(0, -c4);
		this.computed = true;
	}

	exportCsv() {
		const header = 'section;intitulé;montant';
		const lines = [
			['CR','Produits',this.produits],
			['CR','Charges',this.charges],
			['CR','Résultat',this.resultat],
			['BILAN','Immobilisations',this.act_imm],
			['BILAN','Stocks',this.act_sto],
			['BILAN','Trésorerie',this.act_tres],
			['BILAN','Capitaux/Passifs LT',this.pas_cap],
			['BILAN','Tiers (net)',this.pas_tiers]
		].map(r => r.join(';'));
		const blob = new Blob(["\uFEFF" + [header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'etats-financiers.csv'; a.click(); URL.revokeObjectURL(url);
	}
}