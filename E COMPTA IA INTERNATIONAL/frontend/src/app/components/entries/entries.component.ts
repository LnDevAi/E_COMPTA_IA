import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalService, Ecriture, EcritureLigne, EntryTemplate } from '../../services/journal.service';
import { ChartOfAccountsService } from '../../services/chart-of-accounts.service';
import { TiersService, ThirdParty } from '../../services/tiers.service';
import { AiService } from '../../services/ai.service';

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
            <option value="MNE">MNE - Monnaie électronique</option>
          </select>
        </label>
        <input class="input" type="date" [(ngModel)]="date"/>
        <input class="input" placeholder="Pièce" [(ngModel)]="piece"/>
        <input class="input" placeholder="Référence" [(ngModel)]="reference"/>

        <select class="input" [(ngModel)]="selectedTemplateId" (change)="applySelectedTemplate()">
          <option value="">— Modèle ({{ templatesForJournal.length }}) —</option>
          <option *ngFor="let t of templatesForJournal" [value]="t.id">{{ t.name }}</option>
        </select>
        <button class="btn" (click)="openTemplateEditor()">Gérer les modèles</button>

        <button class="btn" (click)="addLine()">Ajouter ligne</button>
        <button class="btn" (click)="saveEntry()">Enregistrer</button>
        <button class="btn" (click)="openAiPaste()">IA: coller texte OCR</button>
      </div>

      <!-- Template editor modal -->
      <div class="modal" *ngIf="templateEditorOpen">
        <div class="modal-body">
          <h3>Modèles — {{ journalCode }}</h3>
          <div class="modal-grid">
            <div class="column">
              <h4>Liste</h4>
              <ul class="tpl-list">
                <li *ngFor="let t of templatesForJournal" [class.active]="t.id===editingTemplateId" (click)="selectTemplateForEdit(t)">{{ t.name }}</li>
              </ul>
              <div class="row">
                <input class="input" placeholder="Nom du modèle" [(ngModel)]="templateName"/>
                <button class="btn" (click)="createOrUpdateTemplate()">{{ editingTemplateId ? 'Mettre à jour' : 'Créer' }}</button>
                <button class="btn danger" [disabled]="!editingTemplateId" (click)="deleteTemplate()">Supprimer</button>
              </div>
            </div>
            <div class="column">
              <h4>Contenu du modèle</h4>
              <table class="table">
                <thead><tr><th>Compte</th><th>Libellé</th><th>Débit</th><th>Crédit</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let l of templateLines; let i = index">
                    <td><input class="input" [(ngModel)]="l.compte"/></td>
                    <td><input class="input" [(ngModel)]="l.libelle"/></td>
                    <td><input class="input" type="number" step="0.01" [(ngModel)]="l.debit"/></td>
                    <td><input class="input" type="number" step="0.01" [(ngModel)]="l.credit"/></td>
                    <td><button class="btn danger" (click)="templateLines.splice(i,1)">✖</button></td>
                  </tr>
                </tbody>
              </table>
              <button class="btn" (click)="templateLines.push({ compte:'', libelle:'', debit:0, credit:0 })">Ajouter ligne</button>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn" (click)="templateEditorOpen=false">Fermer</button>
          </div>
        </div>
      </div>

      <!-- AI Paste modal -->
      <div class="modal" *ngIf="aiModalOpen">
        <div class="modal-body">
          <h3>Assistant IA — Coller le texte OCR</h3>
          <textarea class="input" style="width:100%;height:180px" [(ngModel)]="aiText"></textarea>
          <div class="modal-actions">
            <button class="btn" (click)="applyAi()">Proposer</button>
            <button class="btn" (click)="aiModalOpen=false">Fermer</button>
          </div>
          <div *ngIf="aiErr" class="err">{{ aiErr }}</div>
        </div>
      </div>

      <table class="table">
        <thead><tr><th>Compte</th><th>Tiers</th><th>Libellé</th><th>Débit</th><th>Crédit</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let l of lignes; let i = index">
            <td class="autocomplete-cell">
              <input class="input" [(ngModel)]="l.compte" (input)="onCompteInput(l)" (keydown)="onCompteKey($event, l)"/>
              <ul class="autocomplete" *ngIf="l._suggest && l._suggest.length">
                <li *ngFor="let s of l._suggest; let si = index" [class.active]="si===l._active" (mousedown)="pickSuggest(l, si)">
                  <span class="code">{{ s.code }}</span>
                  <span class="label">{{ s.intitule }}</span>
                </li>
              </ul>
            </td>
            <td class="autocomplete-cell">
              <input class="input" [(ngModel)]="l._tiersQuery" (input)="onTiersInput(l)" (keydown)="onTiersKey($event, l)" placeholder="Code/nom tiers"/>
              <ul class="autocomplete" *ngIf="l._tiersSuggest && l._tiersSuggest.length">
                <li *ngFor="let t of l._tiersSuggest; let ti = index" [class.active]="ti===l._tiersActive" (mousedown)="pickTiers(l, ti)">
                  <span class="code">{{ t.code }}</span>
                  <span class="label">{{ t.name }}</span>
                </li>
              </ul>
            </td>
            <td><input class="input" [(ngModel)]="l.libelle"/></td>
            <td><input class="input" type="number" step="0.01" [(ngModel)]="l.debit" (input)="recalc()"/></td>
            <td><input class="input" type="number" step="0.01" [(ngModel)]="l.credit" (input)="recalc()"/></td>
            <td><button class="btn danger" (click)="removeLine(i)">✖</button></td>
          </tr>
        </tbody>
        <tfoot>
          <tr><th colspan="3">Totaux</th><th>{{ totalDebit | number:'1.2-2' }}</th><th>{{ totalCredit | number:'1.2-2' }}</th><th></th></tr>
          <tr><th colspan="3">Balance (doit être 0)</th><th colspan="2">{{ (totalDebit - totalCredit) | number:'1.2-2' }}</th><th></th></tr>
        </tfoot>
      </table>
      <datalist id="cpt">
        <option *ngFor="let c of comptes" [value]="c.code">{{ c.code }} - {{ c.intitule }}</option>
      </datalist>

      <div *ngIf="error" class="err">{{ error }}</div>
      <div *ngIf="ok" class="ok">{{ ok }}</div>

      <h2>Écritures enregistrées</h2>
      <table class="table">
        <thead><tr><th>ID</th><th>Date</th><th>Journal</th><th>Pièce</th><th>Réf</th><th>Débit</th><th>Crédit</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let e of ecritures">
            <td>{{ e.id }}</td>
            <td>{{ e.date }}</td>
            <td>{{ e.journalCode }}</td>
            <td>{{ e.piece }}</td>
            <td>{{ e.reference }}</td>
            <td>{{ e.totalDebit }}</td>
            <td>{{ e.totalCredit }}</td>
            <td>
              <button class="btn" (click)="edit(e)">Modifier</button>
              <button class="btn danger" (click)="del(e.id)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
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
    .autocomplete-cell { position: relative; }
    .autocomplete { position:absolute; z-index: 10; background:#fff; border:1px solid #e2e8f0; border-radius:6px; margin-top:2px; max-height:200px; overflow:auto; width: 360px; box-shadow:0 6px 12px rgba(0,0,0,0.08); }
    .autocomplete li { display:flex; gap:8px; padding:6px 8px; cursor:pointer; }
    .autocomplete li.active, .autocomplete li:hover { background:#f1f5f9; }
    .autocomplete .code { font-weight: 600; min-width: 80px; }
    .autocomplete .label { color:#334155; }
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; }
    .modal-body { background:#fff; border-radius:12px; padding:16px; width: min(100%, 960px); max-height: 90vh; overflow:auto; }
    .modal-grid { display:grid; grid-template-columns: 300px 1fr; gap: 16px; }
    .tpl-list { list-style:none; padding:0; margin:0; border:1px solid #e2e8f0; border-radius:6px; max-height:380px; overflow:auto; }
    .tpl-list li { padding:8px 12px; border-bottom:1px solid #edf2f7; cursor:pointer; }
    .tpl-list li.active, .tpl-list li:hover { background:#f1f5f9; }
    .modal-actions { display:flex; justify-content:flex-end; margin-top:12px; }
  `]
})
export class EntriesComponent {
  journalCode = 'OD';
  date = (new Date()).toISOString().slice(0,10);
  piece = '';
  reference = '';
  selectedTemplateId = '';
  templateEditorOpen = false;
  templateName = '';
  editingTemplateId: string | null = null;
  templateLines: EcritureLigne[] = [];

  lignes: any[] = [];
  tiers: ThirdParty[] = [];
  totalDebit = 0;
  totalCredit = 0;
  error = '';
  ok = '';

  comptes: { code: string; intitule: string }[] = [];
  ecritures: Ecriture[] = [];
  templates: EntryTemplate[] = [];
  editingId: string | null = null;

  aiModalOpen = false;
  aiText = '';
  aiErr = '';

  constructor(private js: JournalService, private coa: ChartOfAccountsService, private tiersSvc: TiersService, private ai: AiService) {
    this.coa.getPlan().subscribe(p => this.comptes = p.map(i => ({ code: i.code, intitule: i.intitule })));
    this.js.getEcritures().subscribe(list => this.ecritures = list);
    this.js.getTemplates().subscribe(ts => { this.templates = ts; this.refreshTemplatesForJournal(); });
    this.tiersSvc.getAll().subscribe(list => this.tiers = list);
  }

  private computeLibelleFromCode(code: string): string {
    if (!code) return '';
    const map = new Map(this.comptes.map(c => [c.code, c.intitule] as [string,string]));
    const child = map.get(code);
    if (!child) return '';
    // Trouver le parent le plus proche existant
    let parentCode: string | null = null;
    for (let l = code.length - 1; l >= 1; l--) {
      const p = code.substring(0, l);
      if (map.has(p)) { parentCode = p; break; }
    }
    if (!parentCode) return child;
    const parentLabel = map.get(parentCode) || '';
    if (!parentLabel) return child;
    // Si l'enfant contient déjà le libellé parent, éviter la répétition
    const childLower = child.toLowerCase();
    const parentLower = parentLabel.toLowerCase();
    if (childLower.includes(parentLower)) return child;
    return `${parentLabel} ${child}`.trim();
  }

  get templatesForJournal(): EntryTemplate[] {
    return this.templates.filter(t => t.journalCode === this.journalCode);
  }
  refreshTemplatesForJournal() {
    if (this.selectedTemplateId && !this.templatesForJournal.some(t => t.id === this.selectedTemplateId)) {
      this.selectedTemplateId = '';
    }
  }

  applySelectedTemplate() {
    const tpl = this.templates.find(t => t.id === this.selectedTemplateId);
    if (!tpl) return;
    this.journalCode = tpl.journalCode;
    this.lignes = tpl.lignes.map(l => ({ ...l }));
    this.recalc();
  }

  openTemplateEditor() {
    this.templateEditorOpen = true;
    this.templateName = '';
    this.editingTemplateId = null;
    this.templateLines = [ { compte:'', libelle:'', debit:0, credit:0 } ];
  }
  selectTemplateForEdit(t: EntryTemplate) {
    this.editingTemplateId = t.id;
    this.templateName = t.name;
    this.templateLines = t.lignes.map(l => ({ ...l }));
  }
  createOrUpdateTemplate() {
    const name = (this.templateName||'').trim();
    if (!name) { this.error = 'Nom de modèle requis'; return; }
    if (this.editingTemplateId) {
      this.js.updateTemplate(this.editingTemplateId, name, this.templateLines);
      this.ok = 'Modèle mis à jour';
    } else {
      const tpl = this.js.createTemplate(this.journalCode, name, this.templateLines);
      this.editingTemplateId = tpl.id;
      this.ok = 'Modèle créé';
    }
  }
  deleteTemplate() {
    if (!this.editingTemplateId) return;
    if (!confirm('Supprimer ce modèle ?')) return;
    this.js.deleteTemplate(this.editingTemplateId);
    this.editingTemplateId = null; this.templateName = ''; this.templateLines = [ { compte:'', libelle:'', debit:0, credit:0 } ];
  }

  addLine() { this.lignes.push({ compte: '', libelle: '', debit: 0, credit: 0, _suggest: [], _active: 0, _tiersQuery: '', _tiersSuggest: [], _tiersActive: 0 }); }
  removeLine(i: number) { this.lignes.splice(i,1); this.recalc(); }
  recalc() {
    this.totalDebit = this.lignes.reduce((s,l)=>s+(Number(l.debit)||0),0);
    this.totalCredit = this.lignes.reduce((s,l)=>s+(Number(l.credit)||0),0);
  }

  saveEntry() {
    this.error = this.ok = '';
    try {
      if (this.editingId) {
        const updated: Ecriture = { id: this.editingId, date: this.date, journalCode: this.journalCode, piece: this.piece, reference: this.reference, lignes: this.lignes.map(l => ({ ...l })), totalDebit: 0, totalCredit: 0 };
        this.js.updateEcriture(updated);
        this.ok = 'Écriture mise à jour';
      } else {
        const lignes: EcritureLigne[] = this.lignes.map(l => ({ compte: l.compte, libelle: l.libelle, debit: Number(l.debit)||0, credit: Number(l.credit)||0, ...(l.tiersId?{ tiersId: l.tiersId, tiersName: l.tiersName }: {}) } as any));
        this.js.addEcriture({ date: this.date, journalCode: this.journalCode, piece: this.piece, reference: this.reference, lignes });
        this.ok = 'Écriture enregistrée';
      }
      this.lignes = [ { compte: '', libelle: '', debit: 0, credit: 0 } ];
      this.recalc();
      this.editingId = null;
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

  onCompteInput(l: any) {
    const q = (l.compte||'').toLowerCase().trim();
    if (!q) { l._suggest = []; l._active = 0; return; }
    const max = 20;
    const res: { code:string; intitule:string }[] = [];
    for (const c of this.comptes) {
      if (c.code.toLowerCase().includes(q) || c.intitule.toLowerCase().includes(q)) {
        res.push(c);
        if (res.length >= max) break;
      }
    }
    l._suggest = res;
    l._active = 0;
  }
  onCompteKey(evt: KeyboardEvent, l: any) {
    if (!l._suggest?.length) return;
    if (evt.key === 'ArrowDown') { evt.preventDefault(); l._active = Math.min((l._active||0)+1, l._suggest.length-1); }
    else if (evt.key === 'ArrowUp') { evt.preventDefault(); l._active = Math.max((l._active||0)-1, 0); }
    else if (evt.key === 'Enter') { evt.preventDefault(); this.pickSuggest(l, l._active||0); }
    else if (evt.key === 'Escape') { l._suggest = []; }
  }
  pickSuggest(l: any, idx: number) {
    const s = l._suggest?.[idx]; if (!s) return;
    l.compte = s.code;
    if (!l.libelle) l.libelle = this.computeLibelleFromCode(s.code) || s.intitule;
    l._suggest = [];
  }

  onTiersInput(l: any) {
    const q = (l._tiersQuery||'').toLowerCase(); if (!q) { l._tiersSuggest = []; l._tiersActive = 0; return; }
    l._tiersSuggest = this.tiers.filter(t => t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)).slice(0, 8);
    l._tiersActive = 0;
  }
  onTiersKey(ev: KeyboardEvent, l: any) {
    if (!l._tiersSuggest?.length) return;
    const max = l._tiersSuggest.length - 1;
    if (ev.key === 'ArrowDown') { l._tiersActive = Math.min(max, (l._tiersActive||0)+1); ev.preventDefault(); }
    else if (ev.key === 'ArrowUp') { l._tiersActive = Math.max(0, (l._tiersActive||0)-1); ev.preventDefault(); }
    else if (ev.key === 'Enter') { this.pickTiers(l, l._tiersActive||0); ev.preventDefault(); }
  }
  pickTiers(l: any, idx: number) {
    const t = l._tiersSuggest[idx]; if (!t) return;
    l.tiersId = t.id; l.tiersName = t.name; l._tiersQuery = `${t.code} - ${t.name}`;
    l._tiersSuggest = []; l._tiersActive = 0;
  }

  onCompteChange(l: EcritureLigne) {
    const lbl = this.computeLibelleFromCode(l.compte);
    if (lbl && !l.libelle) l.libelle = lbl;
  }
  edit(e: Ecriture) {
    this.editingId = e.id;
    this.journalCode = e.journalCode;
    this.date = e.date;
    this.piece = e.piece || '';
    this.reference = e.reference || '';
    this.lignes = e.lignes.map(x => ({ ...x }));
    this.recalc();
  }
  del(id: string) {
    if (confirm('Supprimer cette écriture ?')) this.js.deleteEcriture(id);
  }

  openAiPaste() { this.aiErr=''; this.aiText=''; this.aiModalOpen = true; }
  applyAi() {
    this.aiErr='';
    const t = (this.aiText||'').trim();
    if (!t) { this.aiErr = 'Veuillez coller le texte OCR.'; return; }
    this.ai.parseText({ text: t }).subscribe({
      next: (res: any) => {
        const best = (res?.suggestions||[]).sort((a:any,b:any)=> (b.confidence||0)-(a.confidence||0))[0];
        if (!best) { this.aiErr = 'Aucune suggestion.'; return; }
        this.journalCode = best.journalCode || this.journalCode;
        this.piece = best.piece || this.piece;
        this.date = best.date || this.date;
        this.lignes = (best.lines||[]).map((l:any)=>({ compte:l.compte, libelle:l.libelle, debit:l.debit||0, credit:l.credit||0 }));
        this.recalc();
        this.aiModalOpen = false;
      },
      error: (e:any) => { this.aiErr = 'Erreur IA'; }
    });
  }
}