import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartOfAccountsService } from '../../services/chart-of-accounts.service';
import { JournalService, EcritureLigne } from '../../services/journal.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-container">
      <h1>🤖 Assistant IA</h1>

      <div class="toolbar">
        <input type="file" multiple accept="image/*" (change)="onFiles($event)" />
        <select class="input" [(ngModel)]="language">
          <option value="fra">Français</option>
          <option value="eng">Anglais</option>
          <option value="eng+fra">Anglais + Français</option>
        </select>
        <button class="btn" [disabled]="!files.length || ocrRunning" (click)="runOcr()">Lancer l'OCR</button>
        <span *ngIf="ocrRunning">OCR en cours... {{ (progress*100) | number:'1.0-0' }}%</span>
      </div>

      <div class="row">
        <textarea class="text" rows="8" [(ngModel)]="extracted" placeholder="Texte extrait ou collez votre texte ici..."></textarea>
      </div>

      <div class="row">
        <input class="input" [(ngModel)]="hint" placeholder="Indication (ex: facture achat, facture vente, salaire, virement banque)" />
        <button class="btn" (click)="proposeEntries()">Proposer des écritures</button>
      </div>

      <div *ngIf="proposal.length">
        <h3>Proposition d'écritures</h3>
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
          <input class="input" type="date" [(ngModel)]="date" />
          <input class="input" placeholder="Pièce" [(ngModel)]="piece" />
          <input class="input" placeholder="Référence" [(ngModel)]="reference" />
        </div>

        <table class="table">
          <thead><tr><th>Compte</th><th>Libellé</th><th>Débit</th><th>Crédit</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let l of proposal; let i = index">
              <td><input class="input" [(ngModel)]="l.compte" placeholder="ex: 401" /></td>
              <td><input class="input" [(ngModel)]="l.libelle" /></td>
              <td><input class="input" type="number" step="0.01" [(ngModel)]="l.debit" (input)="recalc()" /></td>
              <td><input class="input" type="number" step="0.01" [(ngModel)]="l.credit" (input)="recalc()" /></td>
              <td><button class="btn danger" (click)="proposal.splice(i,1); recalc();">✖</button></td>
            </tr>
          </tbody>
          <tfoot>
            <tr><th colspan="2">Totaux</th><th>{{ totalDebit | number:'1.2-2' }}</th><th>{{ totalCredit | number:'1.2-2' }}</th><th></th></tr>
            <tr><th colspan="2">Balance (doit être 0)</th><th colspan="2">{{ (totalDebit - totalCredit) | number:'1.2-2' }}</th><th></th></tr>
          </tfoot>
        </table>
        <div class="toolbar">
          <button class="btn" (click)="addLine()">Ajouter ligne</button>
          <button class="btn" [disabled]="!proposal.length" (click)="save()">Enregistrer dans Écritures</button>
        </div>
      </div>

      <div *ngIf="error" class="err">{{ error }}</div>
      <div *ngIf="ok" class="ok">{{ ok }}</div>
    </div>
  `,
  styles: [`
    .module-container { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .toolbar { display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center; margin: 8px 0; }
    .row { margin: 8px 0; }
    .input { padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px; }
    .btn { padding:8px 10px; border:none; border-radius:6px; background:#3182ce; color:#fff; cursor:pointer; }
    .btn.danger { background:#e53e3e; }
    .text { width:100%; min-height: 160px; padding: 10px; border:1px solid #e2e8f0; border-radius: 6px; font-family: ui-monospace, monospace; }
    .table { width:100%; border-collapse:collapse; }
    .table th, .table td { border:1px solid #e2e8f0; padding:8px 10px; text-align:left; }
    .table th { background:#f7fafc; }
    .err { color:#e53e3e; margin-top:8px; }
    .ok { color:#38a169; margin-top:8px; }
  `]
})
export class AiAssistantComponent {
  files: File[] = [];
  language = 'fra';
  ocrRunning = false;
  progress = 0;
  extracted = '';
  hint = '';

  journalCode = 'OD';
  date = (new Date()).toISOString().slice(0,10);
  piece = '';
  reference = '';

  proposal: EcritureLigne[] = [];
  totalDebit = 0;
  totalCredit = 0;

  error = '';
  ok = '';

  constructor(private coa: ChartOfAccountsService, private js: JournalService) {}

  onFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    this.files = input.files ? Array.from(input.files) : [];
  }

  async runOcr() {
    this.error = this.ok = '';
    if (!this.files.length) return;
    this.ocrRunning = true;
    this.progress = 0;
    try {
      const Tesseract = await import('tesseract.js');
      let all = '';
      for (const f of this.files) {
        const { data } = await Tesseract.recognize(f, this.language, { logger: m => { if (m.status === 'recognizing text' && m.progress != null) this.progress = m.progress; } });
        all += (data.text || '') + '\n';
      }
      this.extracted = all.trim();
    } catch (e: any) {
      this.error = 'OCR: ' + (e?.message || e);
    } finally {
      this.ocrRunning = false;
    }
  }

  proposeEntries() {
    this.error = this.ok = '';
    const text = (this.extracted + '\n' + this.hint).toLowerCase();
    const lines: EcritureLigne[] = [];

    const amountRegex = /(\d+[\s.,]?\d{0,3}(?:[\s.,]\d{3})*(?:[\s.,]\d{2})?)/g;
    const amounts: number[] = [];
    for (const m of (text.match(amountRegex) || [])) {
      const num = Number(String(m).replace(/\s/g,'').replace(/\./g,'').replace(/,/g,'.'));
      if (!isNaN(num) && isFinite(num)) amounts.push(Math.abs(num));
    }

    const isPurchase = /achat|fournisseur|facture achat/.test(text);
    const isSale = /vente|client|facture vente/.test(text);
    const isSalary = /salaire|paie|bulletin/.test(text);
    const isBank = /virement|banque|releve/.test(text);

    const top = amounts.sort((a,b)=>b-a)[0] || 0;

    if (isPurchase) this.journalCode = 'ACH';
    else if (isSale) this.journalCode = 'VEN';
    else if (isSalary) this.journalCode = 'SAL';
    else if (isBank) this.journalCode = 'BNK';

    if (isPurchase && top) {
      const achat = this.findAccount(['achat','marchandise']) || '';
      const tiers = this.findAccount(['fournisseur']) || '401';
      lines.push({ compte: achat, libelle: 'Achat', debit: top, credit: 0 });
      // TVA: proposer un libellé, laisser le compte vide pour que l'utilisateur choisisse
      if (/tva/.test(text)) lines.push({ compte: '', libelle: 'TVA déductible', debit: Math.round(top*0.18*100)/100, credit: 0 });
      lines.push({ compte: tiers, libelle: 'Fournisseur', debit: 0, credit: top + (/(tva|taxe)/.test(text) ? Math.round(top*0.18*100)/100 : 0) });
    } else if (isSale && top) {
      const produit = this.findAccount(['vente','produit']) || '';
      const client = this.findAccount(['client']) || '411';
      lines.push({ compte: client, libelle: 'Client', debit: top + (/(tva|taxe)/.test(text) ? Math.round(top*0.18*100)/100 : 0), credit: 0 });
      if (/tva/.test(text)) lines.push({ compte: '', libelle: 'TVA collectée', debit: 0, credit: Math.round(top*0.18*100)/100 });
      lines.push({ compte: produit, libelle: 'Vente', debit: 0, credit: top });
    } else if (isSalary && top) {
      const charge = this.findAccount(['remunerations','salaires','charges']) || '641';
      const personnel = this.findAccount(['personnel','remunerations dues']) || '421';
      lines.push({ compte: charge, libelle: 'Rémunérations du personnel', debit: top, credit: 0 });
      // Proposer des retenues sociales si détectées
      const social = /cnps|cnss|cotis/.test(text) ? Math.round(top*0.25*100)/100 : 0;
      const net = Math.max(0, top - social);
      if (social) lines.push({ compte: '', libelle: 'Charges sociales', debit: 0, credit: social });
      lines.push({ compte: personnel, libelle: 'Personnel - Rémunérations dues', debit: 0, credit: net });
    } else if (isBank && top) {
      const banque = this.findAccount(['banque']) || '512';
      const tiers = this.findAccount(['fournisseur','client']) || '';
      const isOutgoing = /reglement|paiement|fournisseur/.test(text);
      if (isOutgoing) {
        lines.push({ compte: tiers || '401', libelle: 'Fournisseur', debit: top, credit: 0 });
        lines.push({ compte: banque, libelle: 'Banque', debit: 0, credit: top });
      } else {
        lines.push({ compte: banque, libelle: 'Banque', debit: top, credit: 0 });
        lines.push({ compte: tiers || '411', libelle: 'Client', debit: 0, credit: top });
      }
    }

    if (!lines.length) {
      // fallback minimal
      const val = amounts[0] || 0;
      lines.push({ compte: '', libelle: 'Ligne 1', debit: val, credit: 0 });
      lines.push({ compte: '', libelle: 'Ligne 2', debit: 0, credit: val });
    }

    this.proposal = lines;
    this.recalc();
  }

  findAccount(keywords: string[]): string | null {
    let hit: string | null = null;
    this.coa.getPlan().subscribe(list => {
      const lower = list.map(i => ({ code: i.code, label: i.intitule.toLowerCase() }));
      const score = (s: string) => keywords.reduce((acc,k)=>acc + (s.includes(k)?1:0), 0);
      const best = lower.map(i => ({ code: i.code, sc: score(i.label) }))
                        .filter(x => x.sc > 0)
                        .sort((a,b)=>b.sc - a.sc)[0];
      hit = best ? best.code : null;
    }).unsubscribe();
    return hit;
  }

  addLine() { this.proposal.push({ compte: '', libelle: '', debit: 0, credit: 0 }); }
  recalc() {
    this.totalDebit = this.proposal.reduce((s,l)=>s+(Number(l.debit)||0),0);
    this.totalCredit = this.proposal.reduce((s,l)=>s+(Number(l.credit)||0),0);
  }

  save() {
    this.error = this.ok = '';
    try {
      this.js.addEcriture({ date: this.date, journalCode: this.journalCode, piece: this.piece, reference: this.reference, lignes: this.proposal });
      this.ok = 'Écriture enregistrée';
      this.proposal = []; this.recalc();
    } catch (e: any) {
      this.error = e?.message || 'Erreur';
    }
  }
}