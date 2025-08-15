import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiersService, ThirdParty } from '../../services/tiers.service';

@Component({
	selector: 'app-tiers',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
		<div class="module-container">
			<h1>👥 Tiers</h1>
			<div class="toolbar">
				<input class="input" placeholder="Rechercher..." [(ngModel)]="q"/>
				<button class="btn" (click)="startAdd()">Nouveau</button>
				<button class="btn" (click)="exportCsv()">Export CSV</button>
				<input type="file" accept=".csv" (change)="onImport($event)"/>
			</div>

			<div *ngIf="editing" class="panel">
				<h3>{{ editing.id ? 'Modifier' : 'Créer' }} un tiers</h3>
				<div class="grid">
					<label>Code<input class="input" [(ngModel)]="editing.code"/></label>
					<label>Nom<input class="input" [(ngModel)]="editing.name"/></label>
					<label>Type
						<select class="input" [(ngModel)]="editing.type">
							<option value="CLIENT">Client</option>
							<option value="FOURNISSEUR">Fournisseur</option>
							<option value="AUTRE">Autre</option>
						</select>
					</label>
					<label>Email<input class="input" [(ngModel)]="editing.email"/></label>
					<label>Téléphone<input class="input" [(ngModel)]="editing.phone"/></label>
					<label>Adresse<input class="input" [(ngModel)]="editing.address"/></label>
					<label>Compte par défaut<input class="input" [(ngModel)]="editing.defaultAccount" placeholder="ex: 411, 401"/></label>
				</div>
				<div class="row">
					<button class="btn" (click)="save()">Enregistrer</button>
					<button class="btn" (click)="cancel()">Annuler</button>
				</div>
			</div>

			<table class="table">
				<thead><tr><th>Code</th><th>Nom</th><th>Type</th><th>Compte défaut</th><th>Email</th><th>Téléphone</th><th>Actions</th></tr></thead>
				<tbody>
					<tr *ngFor="let t of filtered; index as i">
						<td>{{ t.code }}</td>
						<td>{{ t.name }}</td>
						<td>{{ t.type }}</td>
						<td>{{ t.defaultAccount }}</td>
						<td>{{ t.email }}</td>
						<td>{{ t.phone }}</td>
						<td>
							<button class="btn" (click)="startEdit(t)">Modifier</button>
							<button class="btn danger" (click)="del(t.id)">Supprimer</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	`,
	styles: [`
		.module-container { background:#fff; border-radius:12px; padding:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
		.toolbar { display:flex; gap:0.5rem; align-items:center; margin-bottom:8px; }
		.input { padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px; }
		.btn { padding:8px 10px; border:none; border-radius:6px; background:#3182ce; color:#fff; cursor:pointer; }
		.btn.danger { background:#e53e3e; }
		.table { width:100%; border-collapse:collapse; }
		.table th, .table td { border:1px solid #e2e8f0; padding:8px 10px; text-align:left; }
		.grid { display:grid; grid-template-columns: repeat(3, minmax(200px,1fr)); gap:8px; }
		.panel { border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px; }
	`]
})
export class TiersComponent {
	q = '';
	list: ThirdParty[] = [];
	editing: any = null;

	constructor(private svc: TiersService) {
		this.svc.getAll().subscribe(l => this.list = l);
	}

	get filtered(): ThirdParty[] {
		const q = this.q.trim().toLowerCase();
		if (!q) return this.list;
		return this.list.filter(t => t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || (t.email||'').toLowerCase().includes(q));
	}

	startAdd() { this.editing = { code: '', name: '', type: 'AUTRE', email: '', phone: '', address: '', defaultAccount: '' }; }
	startEdit(t: ThirdParty) { this.editing = { ...t }; }
	save() {
		if (!this.editing) return;
		if (this.editing.id) this.svc.update(this.editing.id, this.editing);
		else this.svc.create(this.editing);
		this.editing = null;
	}
	cancel() { this.editing = null; }
	del(id: string) { if (confirm('Supprimer ?')) this.svc.remove(id); }

	exportCsv() { const b = this.svc.exportCsv(); const url = URL.createObjectURL(b); const a = document.createElement('a'); a.href = url; a.download = 'tiers.csv'; a.click(); URL.revokeObjectURL(url); }
	onImport(e: Event) { const input = e.target as HTMLInputElement; const f = input.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ()=>{ this.svc.importCsv(String(r.result||'')); input.value=''; }; r.readAsText(f, 'utf-8'); }
}