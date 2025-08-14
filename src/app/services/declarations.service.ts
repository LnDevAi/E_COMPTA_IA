import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type DeclarationType = 'TVA' | 'IS' | 'CNPS';
export type DeclarationStatus = 'BROUILLON' | 'VALIDE' | 'PAYE';

export interface DeclarationRecord {
  id: string;
  type: DeclarationType;
  period: string; // ex: 2025-07 (TVA mensuelle) ou 2025-T1 (trimestrielle)
  year: number;
  data: Record<string, any>;
  amountDue: number;
  status: DeclarationStatus;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DeclarationsService {
  private readonly storageKey = 'ecompta_declarations_v1';
  private readonly records$ = new BehaviorSubject<DeclarationRecord[]>(this.load());

  getAll() { return this.records$.asObservable(); }

  add(rec: Omit<DeclarationRecord, 'id'|'createdAt'>) {
    const id = `${rec.type}-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const next = [...this.records$.value, { ...rec, id, createdAt }];
    this.records$.next(next); this.persist(next);
  }

  update(id: string, patch: Partial<DeclarationRecord>) {
    const next = this.records$.value.map(r => r.id === id ? { ...r, ...patch } : r);
    this.records$.next(next); this.persist(next);
  }

  remove(id: string) {
    const next = this.records$.value.filter(r => r.id !== id);
    this.records$.next(next); this.persist(next);
  }

  exportCsv(type?: DeclarationType): Blob {
    const header = ['id','type','period','year','amountDue','status','createdAt','data'];
    const rows = (type ? this.records$.value.filter(r => r.type === type) : this.records$.value)
      .map(r => [r.id, r.type, r.period, r.year, r.amountDue, r.status, r.createdAt, this.escape(JSON.stringify(r.data||{}))].join(';'));
    return new Blob(["\uFEFF" + [header.join(';'), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  }

  importCsv(text: string): { imported: number; errors: string[] } {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { imported: 0, errors: ['Fichier vide'] };
    const out: DeclarationRecord[] = [...this.records$.value];
    const errors: string[] = [];
    for (let i=1;i<lines.length;i++) {
      const cols = this.splitCsv(lines[i]);
      try {
        const [id,type,period,year,amountDue,status,createdAt,data] = cols;
        if (!type || !period) throw new Error('Colonnes manquantes');
        out.push({ id: id || `imp-${Date.now()}-${i}`, type: type as DeclarationType, period, year: Number(year)||0, amountDue: Number(amountDue)||0, status: (status as DeclarationStatus)||'BROUILLON', createdAt: createdAt || new Date().toISOString(), data: this.safeParse(data) });
      } catch (e: any) {
        errors.push(`Ligne ${i+1}: ${e?.message||e}`);
      }
    }
    this.records$.next(out); this.persist(out);
    return { imported: lines.length-1-errors.length, errors };
  }

  private persist(list: DeclarationRecord[]) {
    try { localStorage.setItem(this.storageKey, JSON.stringify(list)); } catch {}
  }
  private load(): DeclarationRecord[] {
    try { const raw = localStorage.getItem(this.storageKey); return raw ? JSON.parse(raw) : []; } catch { return []; }
  }
  private escape(v: string) { return v.includes(';') || v.includes('"') ? '"'+v.replace(/"/g,'""')+'"' : v; }
  private splitCsv(line: string): string[] {
    const res: string[] = []; let cur = ''; let inQ = false;
    for (let i=0;i<line.length;i++) {
      const c = line[i];
      if (c === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else { inQ = !inQ; } }
      else if (c === ';' && !inQ) { res.push(cur); cur=''; }
      else { cur += c; }
    }
    res.push(cur);
    return res;
  }
  private safeParse(j?: string) { try { return j ? JSON.parse(j) : {}; } catch { return {}; } }
}