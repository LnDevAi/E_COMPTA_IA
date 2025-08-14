import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartOfAccountsService } from '../../services/chart-of-accounts.service';
import { JournalService, EcritureLigne } from '../../services/journal.service';

interface ExtractedItem { label: string; amount: number; qty?: number; unit?: string; }
interface ExtractedTotals { ht?: number; tva?: number; ttc?: number; }
interface ExtractedMeta {
  issuer?: string;
  recipient?: string;
  subject?: string;
  docType?: 'FACTURE'|'RECU'|'DEVIS'|'BULLETIN'|'RELEVE'|'AUTO'|string;
  invoiceNumber?: string;
  date?: string;
  dueDate?: string;
  currency?: string;
  items: ExtractedItem[];
  totals: ExtractedTotals;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-container">
      <h1>🤖 Assistant IA</h1>

      <div class="toolbar">
        <input type="file" multiple accept="image/*,.pdf,.txt,.csv,.json" (change)="onFiles($event)" />
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
        <input class="input" [(ngModel)]="hint" placeholder="Indication (ex: facture prestation client, facture achat, virement banque)" />
      </div>

      <div class="row settings">
        <label>Votre entreprise<input class="input small" [(ngModel)]="yourCompany" (change)="saveSettings()" placeholder="Nom de votre entreprise"/></label>
        <label>Type d'opération
          <select class="input" [(ngModel)]="operationType" (change)="saveSettings()">
            <option value="DETECT">Détection automatique</option>
            <option value="VENTE_PRESTATIONS">Vente — Prestations</option>
            <option value="VENTE_MARCHANDISES">Vente — Marchandises</option>
            <option value="ACHAT_PRESTATIONS">Achat — Prestations</option>
            <option value="ACHAT_MARCHANDISES">Achat — Marchandises</option>
            <option value="PAIE_SALAIRE">Paie — Salaire</option>
            <option value="BANQUE_PAIEMENT">Banque — Paiement</option>
            <option value="BANQUE_ENCAISSEMENT">Banque — Encaissement</option>
          </select>
        </label>
        <label>TVA (%)<input class="input small" type="number" [(ngModel)]="tvaRate" (change)="saveSettings()"/></label>
        <label>TVA collectée<input class="input small" [(ngModel)]="acctTvaCollecte" (change)="saveSettings()"/></label>
        <label>TVA déductible<input class="input small" [(ngModel)]="acctTvaDeductible" (change)="saveSettings()"/></label>
        <label>Vente prestations<input class="input small" [(ngModel)]="acctVentePrestations" (change)="saveSettings()"/></label>
        <label>Vente marchandises<input class="input small" [(ngModel)]="acctVenteMarchandises" (change)="saveSettings()"/></label>
        <label>Achat prestations<input class="input small" [(ngModel)]="acctAchatPrestations" (change)="saveSettings()"/></label>
        <label>Achat marchandises<input class="input small" [(ngModel)]="acctAchatMarchandises" (change)="saveSettings()"/></label>
      </div>

      <div class="meta-block">
        <h3>Données détectées</h3>
        <div class="meta-grid">
          <label>Émetteur<input class="input" [(ngModel)]="meta.issuer"/></label>
          <label>Destinataire<input class="input" [(ngModel)]="meta.recipient"/></label>
          <label>Objet<input class="input" [(ngModel)]="meta.subject"/></label>
          <label>Type<input class="input" [(ngModel)]="meta.docType"/></label>
          <label>Numéro<input class="input" [(ngModel)]="meta.invoiceNumber"/></label>
          <label>Date<input class="input" type="date" [(ngModel)]="meta.date"/></label>
          <label>Échéance<input class="input" type="date" [(ngModel)]="meta.dueDate"/></label>
          <label>Devise<input class="input small" [(ngModel)]="meta.currency" placeholder="XOF/EUR/FCFA"/></label>
        </div>
        <div class="meta-grid">
          <label>Total HT<input class="input" type="number" step="0.01" [(ngModel)]="meta.totals.ht"/></label>
          <label>TVA<input class="input" type="number" step="0.01" [(ngModel)]="meta.totals.tva"/></label>
          <label>Total TTC<input class="input" type="number" step="0.01" [(ngModel)]="meta.totals.ttc"/></label>
        </div>
        <h4>Lignes détectées</h4>
        <table class="table">
          <thead><tr><th>Désignation</th><th>Montant</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let it of meta.items; let i = index">
              <td><input class="input" [(ngModel)]="it.label"/></td>
              <td><input class="input" type="number" step="0.01" [(ngModel)]="(meta.items[i].amount)"/></td>
              <td><button class="btn danger" (click)="meta.items.splice(i,1)">✖</button></td>
            </tr>
          </tbody>
        </table>
        <button class="btn" (click)="meta.items.push({ label: '', amount: 0 })">Ajouter ligne</button>
      </div>

      <div class="row">
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
              <td><input class="input" [(ngModel)]="l.compte" placeholder="ex: 706" /></td>
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
    .settings { display:flex; gap:0.5rem; flex-wrap: wrap; align-items:center; }
    .input { padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px; }
    .input.small { width: 180px; }
    .btn { padding:8px 10px; border:none; border-radius:6px; background:#3182ce; color:#fff; cursor:pointer; }
    .btn.danger { background:#e53e3e; }
    .text { width:100%; min-height: 160px; padding: 10px; border:1px solid #e2e8f0; border-radius: 6px; font-family: ui-monospace, monospace; }
    .table { width:100%; border-collapse:collapse; }
    .table th, .table td { border:1px solid #e2e8f0; padding:8px 10px; text-align:left; }
    .table th { background:#f7fafc; }
    .meta-block { border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin: 8px 0; }
    .meta-grid { display:grid; grid-template-columns: repeat(4, minmax(180px, 1fr)); gap: 8px; margin-bottom: 8px; }
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

  operationType: 'DETECT' | 'VENTE_PRESTATIONS' | 'VENTE_MARCHANDISES' | 'ACHAT_PRESTATIONS' | 'ACHAT_MARCHANDISES' | 'PAIE_SALAIRE' | 'BANQUE_PAIEMENT' | 'BANQUE_ENCAISSEMENT' = 'DETECT';
  tvaRate = 18;
  acctTvaCollecte = '445';
  acctTvaDeductible = '345';
  acctVentePrestations = '706';
  acctVenteMarchandises = '701';
  acctAchatPrestations = '611';
  acctAchatMarchandises = '601';

  yourCompany = '';
  meta: ExtractedMeta = { items: [], totals: {} };

  constructor(private coa: ChartOfAccountsService, private js: JournalService) {
    this.loadSettings();
  }

  loadSettings() {
    try {
      const raw = localStorage.getItem('assistant_settings_v1');
      if (raw) Object.assign(this, JSON.parse(raw));
    } catch {}
  }
  saveSettings() {
    try { localStorage.setItem('assistant_settings_v1', JSON.stringify({
      yourCompany: this.yourCompany,
      operationType: this.operationType,
      tvaRate: this.tvaRate,
      acctTvaCollecte: this.acctTvaCollecte,
      acctTvaDeductible: this.acctTvaDeductible,
      acctVentePrestations: this.acctVentePrestations,
      acctVenteMarchandises: this.acctVenteMarchandises,
      acctAchatPrestations: this.acctAchatPrestations,
      acctAchatMarchandises: this.acctAchatMarchandises
    })); } catch {}
  }

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
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
      let all = '';
      for (const f of this.files) {
        const name = (f.name||'').toLowerCase();
        if (name.endsWith('.pdf')) {
          const buffer = await f.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
          for (let p=1; p<=pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const content = await page.getTextContent();
            const text = content.items.map((it:any)=>it.str).join(' ');
            all += text + '\n';
          }
        } else if (name.endsWith('.txt') || name.endsWith('.csv') || name.endsWith('.json')) {
          const text = await f.text();
          all += text + '\n';
        } else {
          const { data } = await Tesseract.recognize(f, this.language, { logger: m => { if (m.status === 'recognizing text' && m.progress != null) this.progress = m.progress; } });
          all += (data.text || '') + '\n';
        }
      }
      this.extracted = all.trim();
      this.analyzeText();
    } catch (e: any) {
      this.error = 'OCR: ' + (e?.message || e);
    } finally {
      this.ocrRunning = false;
    }
  }

  analyzeText() {
    const t = (this.extracted||'').replace(/\u00A0/g,' ').trim();
    const lower = t.toLowerCase();
    const meta: ExtractedMeta = { items: [], totals: {} };

    // Doc type
    if (/facture/.test(lower)) meta.docType = 'FACTURE';
    else if (/recu|reçu/.test(lower)) meta.docType = 'RECU';
    else if (/devis/.test(lower)) meta.docType = 'DEVIS';
    else if (/bulletin/.test(lower)) meta.docType = 'BULLETIN';
    else if (/releve|relevé/.test(lower)) meta.docType = 'RELEVE';
    else meta.docType = 'AUTO';

    // Invoice number
    const numMatch = t.match(/\b(N°|No|Num(é|e)ro)\s*[:#\-]?\s*([A-Za-z0-9\-\/]{3,})/i);
    if (numMatch) meta.invoiceNumber = numMatch[3];

    // Dates (yyyy-mm-dd or dd/mm/yyyy)
    const dateIso = t.match(/\b(20\d{2})[-\/.](\d{1,2})[-\/.](\d{1,2})\b/);
    const dateFr = t.match(/\b(\d{1,2})[\/.](\d{1,2})[\/.](20\d{2})\b/);
    if (dateIso) meta.date = `${dateIso[1]}-${dateIso[2].padStart(2,'0')}-${dateIso[3].padStart(2,'0')}`;
    else if (dateFr) meta.date = `${dateFr[3]}-${dateFr[2].padStart(2,'0')}-${dateFr[1].padStart(2,'0')}`;

    // Currency
    if (/XOF|FCFA|CFA/i.test(t)) meta.currency = 'XOF';
    else if (/EUR|€/.test(t)) meta.currency = 'EUR';
    else if (/USD|\$/.test(t)) meta.currency = 'USD';

    // Parties: crude heuristics
    const issuerMatch = t.match(/(Fournisseur|Émetteur|Emetteur|Vendeur|Prestataire)\s*[:\-]?\s*(.+)/i);
    const recipientMatch = t.match(/(Client|Destinataire|Acheteur|Bénéficiaire)\s*[:\-]?\s*(.+)/i);
    if (issuerMatch) meta.issuer = issuerMatch[2].split('\n')[0].trim();
    if (recipientMatch) meta.recipient = recipientMatch[2].split('\n')[0].trim();
    // Fallbacks using headers
    if (!meta.issuer) meta.issuer = (t.split('\n')[0]||'').trim();

    // Subject / Objet
    const obj = t.match(/(Objet|Description|Prestation)\s*[:\-]?\s*(.+)/i);
    if (obj) meta.subject = obj[2].split('\n')[0].trim();

    // Totals
    const num = (s:string)=> Number(s.replace(/\s/g,'').replace(/\./g,'').replace(/,/g,'.'));
    const totalTtc = t.match(/(Total\s*TTC|TTC)\s*[:\-]?\s*([0-9\s.,]+)/i);
    const totalHt = t.match(/(Total\s*HT|Montant\s*HT)\s*[:\-]?\s*([0-9\s.,]+)/i);
    const tva = t.match(/(TVA|Taxe)\s*[:\-]?\s*([0-9\s.,]+)/i);
    if (totalTtc) meta.totals.ttc = num(totalTtc[2]);
    if (totalHt) meta.totals.ht = num(totalHt[2]);
    if (tva) meta.totals.tva = num(tva[2]);

    // Line items: detect rows "label .... amount"
    const lines = t.split(/\n+/).map(l=>l.trim()).filter(Boolean);
    for (const line of lines) {
      const m = line.match(/(.{6,}?)\s+([0-9][0-9\s.,]{2,})$/);
      if (m) {
        const label = m[1].trim();
        const amount = num(m[2]);
        if (!isNaN(amount) && amount>0) meta.items.push({ label, amount });
      }
    }

    // If no items but subject and ht present, create one item
    if (!meta.items.length && meta.subject && meta.totals.ht) meta.items.push({ label: meta.subject, amount: meta.totals.ht });

    this.meta = meta;
  }

  proposeEntries() {
    this.error = this.ok = '';
    const text = (this.extracted + '\n' + this.hint).toLowerCase();
    const lines: EcritureLigne[] = [];

    const amountRegex = /(\d+[\s.,]?\d{0,3}(?:[\s.,]\d{3})*(?:[\s.,]\d{2})?)/g;
    const foundAmounts: number[] = [];
    for (const m of (text.match(amountRegex) || [])) {
      const num = Number(String(m).replace(/\s/g,'').replace(/\./g,'').replace(/,/g,'.'));
      if (!isNaN(num) && isFinite(num)) foundAmounts.push(Math.abs(num));
    }

    // Base amounts prefer meta totals
    let base = this.meta.totals.ht || 0;
    let tva = this.meta.totals.tva || 0;
    if (!base && this.meta.items.length) base = this.meta.items.reduce((s,it)=>s+(it.amount||0),0);
    if (!base && foundAmounts.length) base = foundAmounts.sort((a,b)=>b-a)[0] || 0;
    if (!tva && /(tva|taxe)/.test(text)) tva = Math.round(base * (this.tvaRate/100) * 100) / 100;

    // Detection with company name
    const hasWord = (w:RegExp) => w.test(text);
    const isService = /prestation|service|honoraire/.test(text) || (this.meta.subject||'').toLowerCase().match(/prestation|service|honoraire/);
    const isSaleHint = /facture\s*(client|vente)|client|ventes?/.test(text);
    const isPurchaseHint = /facture\s*(fournisseur|achat)|fournisseur|achats?/.test(text);
    let type = this.operationType;
    if (type === 'DETECT') {
      if (this.yourCompany) {
        const lowerIssuer = (this.meta.issuer||'').toLowerCase();
        const lowerRecipient = (this.meta.recipient||'').toLowerCase();
        const me = this.yourCompany.toLowerCase();
        if (lowerRecipient.includes(me) && !lowerIssuer.includes(me)) type = isService ? 'ACHAT_PRESTATIONS' : 'ACHAT_MARCHANDISES';
        else if (lowerIssuer.includes(me) && !lowerRecipient.includes(me)) type = isService ? 'VENTE_PRESTATIONS' : 'VENTE_MARCHANDISES';
      }
      if (type === 'DETECT') {
        if (isSaleHint) type = isService ? 'VENTE_PRESTATIONS' : 'VENTE_MARCHANDISES';
        else if (isPurchaseHint) type = isService ? 'ACHAT_PRESTATIONS' : 'ACHAT_MARCHANDISES';
      }
      if (type === 'DETECT') type = 'VENTE_PRESTATIONS';
    }

    // Journal suggéré
    if (type.startsWith('VENTE')) this.journalCode = 'VEN';
    else if (type.startsWith('ACHAT')) this.journalCode = 'ACH';
    else if (type.startsWith('BANQUE')) this.journalCode = 'BNK';
    else if (type === 'PAIE_SALAIRE') this.journalCode = 'SAL';

    // Libellé de base
    const baseLabel = this.meta.subject || (this.meta.items[0]?.label) || (this.meta.docType || 'Pièce');

    // Génération des lignes
    if (type === 'VENTE_PRESTATIONS' && base) {
      lines.push({ compte: '411', libelle: 'Clients', debit: base + tva, credit: 0 });
      if (tva) lines.push({ compte: this.acctTvaCollecte, libelle: 'TVA collectée', debit: 0, credit: tva });
      lines.push({ compte: this.acctVentePrestations, libelle: baseLabel, debit: 0, credit: base });
    } else if (type === 'VENTE_MARCHANDISES' && base) {
      lines.push({ compte: '411', libelle: 'Clients', debit: base + tva, credit: 0 });
      if (tva) lines.push({ compte: this.acctTvaCollecte, libelle: 'TVA collectée', debit: 0, credit: tva });
      lines.push({ compte: this.acctVenteMarchandises, libelle: baseLabel, debit: 0, credit: base });
    } else if (type === 'ACHAT_PRESTATIONS' && base) {
      lines.push({ compte: this.acctAchatPrestations, libelle: baseLabel, debit: base, credit: 0 });
      if (tva) lines.push({ compte: this.acctTvaDeductible, libelle: 'TVA déductible', debit: tva, credit: 0 });
      lines.push({ compte: '401', libelle: 'Fournisseurs', debit: 0, credit: base + tva });
    } else if (type === 'ACHAT_MARCHANDISES' && base) {
      lines.push({ compte: this.acctAchatMarchandises, libelle: baseLabel, debit: base, credit: 0 });
      if (tva) lines.push({ compte: this.acctTvaDeductible, libelle: 'TVA déductible', debit: tva, credit: 0 });
      lines.push({ compte: '401', libelle: 'Fournisseurs', debit: 0, credit: base + tva });
    } else if (type === 'PAIE_SALAIRE' && base) {
      const social = /cnps|cnss|cotis/.test(text) ? Math.round(base*0.25*100)/100 : 0;
      const net = Math.max(0, base - social);
      lines.push({ compte: '641', libelle: 'Rémunérations du personnel', debit: base, credit: 0 });
      if (social) lines.push({ compte: '43', libelle: 'Organismes sociaux', debit: 0, credit: social });
      lines.push({ compte: '421', libelle: 'Personnel - Rémunérations dues', debit: 0, credit: net });
    }

    if (!lines.length && base) {
      lines.push({ compte: '', libelle: baseLabel, debit: base, credit: 0 });
      lines.push({ compte: '', libelle: baseLabel, debit: 0, credit: base });
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