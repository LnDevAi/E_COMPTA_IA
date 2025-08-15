import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalService, Ecriture } from '../../services/journal.service';

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

	constructor(private js: JournalService) {}

	compute() {
		const ecritures: Ecriture[] = (this.js as any).ecritures$?.value || [];
		const within = (d: string) => d >= this.from && d <= this.to;
		let prod = 0, chg = 0, c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
		const sums = new Map<string, number>();
		for (const e of ecritures) {
			if (!within(e.date)) continue;
			for (const l of e.lignes) {
				const code = String(l.compte||''); if (!code) continue;
				const delta = (Number(l.debit)||0) - (Number(l.credit)||0);
				const cls = code[0];
				if (cls === '7') prod += -delta; // produits: crédits - débits
				else if (cls === '6') chg += delta; // charges: débits - crédits
				else if (cls === '1') c1 += -delta; // passif/CP (crédit = +)
				else if (cls === '2') c2 += delta; // actif immobilisé
				else if (cls === '3') c3 += delta; // stocks
				else if (cls === '4') c4 += delta; // tiers (net)
				else if (cls === '5') c5 += delta; // trésorerie (banque/caisse)
				const prev = sums.get(code)||0; sums.set(code, prev+delta);
			}
		}
		this.produits = prod; this.charges = chg; this.resultat = prod - chg;
		this.act_imm = c2; this.act_sto = c3; this.act_tres = c5;
		this.pas_cap = c1; this.pas_tiers = -c4; // tiers côté passif net
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