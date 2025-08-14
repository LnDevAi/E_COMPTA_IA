import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type DeclarationCategory = 'FISCAL' | 'SOCIAL' | 'AUTRES';
export type DeclarationType = 'TVA' | 'IS' | 'CNSS' | 'AUTRE' | 'IUTS' | 'BIC';
export type DeclarationStatus = 'BROUILLON' | 'VALIDE' | 'PAYE';

export interface DeclarationRecord {
  id: string;
  category: DeclarationCategory;
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

  add(rec: Omit<DeclarationRecord, 'id'|'createdAt'|'category'> & { category?: DeclarationCategory }) {
    const id = `${rec.type}-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const category = rec.category || this.categoryForType(rec.type);
    const next = [...this.records$.value, { ...rec, id, createdAt, category }];
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

  exportCsv(type?: DeclarationType, category?: DeclarationCategory): Blob {
    const header = ['id','category','type','period','year','amountDue','status','createdAt','data'];
    const rows = this.records$.value
      .filter(r => !type || r.type === type)
      .filter(r => !category || r.category === category)
      .map(r => [r.id, r.category, r.type, r.period, r.year, r.amountDue, r.status, r.createdAt, this.escape(JSON.stringify(r.data||{}))].join(';'));
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
        const [id,category,type,period,year,amountDue,status,createdAt,data] = cols;
        const fixedType = (type === 'CNPS') ? 'CNSS' : (type as DeclarationType);
        const fixedCategory = (category as DeclarationCategory) || this.categoryForType(fixedType);
        if (!fixedType || !period) throw new Error('Colonnes manquantes');
        out.push({ id: id || `imp-${Date.now()}-${i}`, category: fixedCategory, type: fixedType, period, year: Number(year)||0, amountDue: Number(amountDue)||0, status: (status as DeclarationStatus)||'BROUILLON', createdAt: createdAt || new Date().toISOString(), data: this.safeParse(data) });
      } catch (e: any) {
        errors.push(`Ligne ${i+1}: ${e?.message||e}`);
      }
    }
    this.records$.next(out); this.persist(out);
    return { imported: lines.length-1-errors.length, errors };
  }

  private categoryForType(type: DeclarationType | string): DeclarationCategory {
    const t = String(type).toUpperCase();
    if (t === 'TVA' || t === 'IS' || t === 'IUTS' || t === 'BIC') return 'FISCAL';
    if (t === 'CNSS' || t === 'CNPS') return 'SOCIAL';
    return 'AUTRES';
  }

  private persist(list: DeclarationRecord[]) {
    try { localStorage.setItem(this.storageKey, JSON.stringify(list)); } catch {}
  }
  private load(): DeclarationRecord[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      const arr = raw ? JSON.parse(raw) : [];
      // Migration: mapper CNPS->CNSS et ajouter category
      return (arr as any[]).map((r: any) => {
        const type = (r.type === 'CNPS') ? 'CNSS' : (r.type || 'AUTRE');
        const category = r.category || this.categoryForType(type);
        return { category, ...r, type } as DeclarationRecord;
      });
    } catch {
      return [];
    }
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