import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Journal {
  code: string; // ACH, VEN, BNK, OD, SAL, CSH, etc.
  libelle: string; // Achats, Ventes, Banque, Opérations diverses, Salaires, Caisses
  type: 'ACHATS' | 'VENTES' | 'BANQUE' | 'OD' | 'SALAIRES' | 'CAISSES' | 'AUTRE';
}

export interface EcritureLigne {
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
}

export interface Ecriture {
  id: string;
  date: string; // ISO yyyy-mm-dd
  journalCode: string;
  piece?: string;
  reference?: string;
  lignes: EcritureLigne[];
  totalDebit: number;
  totalCredit: number;
}

@Injectable({ providedIn: 'root' })
export class JournalService {
  readonly api = environment.apiUrl;

  private readonly defaultJournaux: Journal[] = [
    { code: 'ACH', libelle: 'Achats', type: 'ACHATS' },
    { code: 'VEN', libelle: 'Ventes', type: 'VENTES' },
    { code: 'BNK', libelle: 'Banque', type: 'BANQUE' },
    { code: 'OD',  libelle: 'Opérations diverses', type: 'OD' },
    { code: 'SAL', libelle: 'Salaires', type: 'SALAIRES' },
    { code: 'CSH', libelle: 'Caisses', type: 'CAISSES' }
  ];

  private readonly journaux$ = new BehaviorSubject<Journal[]>([...this.defaultJournaux]);
  private readonly ecritures$ = new BehaviorSubject<Ecriture[]>([]);

  getJournaux() { return this.journaux$.asObservable(); }
  getEcritures() { return this.ecritures$.asObservable(); }

  addJournal(j: Journal) {
    const exists = this.journaux$.value.some(x => x.code === j.code);
    if (exists) throw new Error('Code journal déjà existant');
    this.journaux$.next([...this.journaux$.value, j]);
  }

  updateJournal(code: string, update: Partial<Pick<Journal, 'libelle'|'type'>>) {
    this.journaux$.next(this.journaux$.value.map(j => j.code === code ? { ...j, ...update, code: j.code } : j));
  }

  removeJournal(code: string) {
    this.journaux$.next(this.journaux$.value.filter(j => j.code !== code));
    // Option: supprimer les écritures liées
    this.ecritures$.next(this.ecritures$.value.filter(e => e.journalCode !== code));
  }

  addEcriture(e: Omit<Ecriture, 'id'|'totalDebit'|'totalCredit'>) {
    const totalDebit = e.lignes.reduce((s,l)=>s+(Number(l.debit)||0),0);
    const totalCredit = e.lignes.reduce((s,l)=>s+(Number(l.credit)||0),0);
    if (Math.round((totalDebit-totalCredit)*100) !== 0) throw new Error('Écriture non équilibrée');
    const id = `${e.journalCode}-${Date.now()}`;
    const saved: Ecriture = { ...e, id, totalDebit, totalCredit };
    this.ecritures$.next([...this.ecritures$.value, saved]);
  }

  addEcrituresBatch(entries: Array<Omit<Ecriture, 'totalDebit'|'totalCredit'>>) {
    const next: Ecriture[] = [...this.ecritures$.value];
    for (const e of entries) {
      const totalDebit = e.lignes.reduce((s,l)=>s+(Number(l.debit)||0),0);
      const totalCredit = e.lignes.reduce((s,l)=>s+(Number(l.credit)||0),0);
      if (Math.round((totalDebit-totalCredit)*100) !== 0) continue;
      next.push({ ...e, totalDebit, totalCredit });
    }
    this.ecritures$.next(next);
  }

  deleteEcriture(id: string) {
    this.ecritures$.next(this.ecritures$.value.filter(x => x.id !== id));
  }

  getEcriture(id: string): Ecriture | undefined {
    return this.ecritures$.value.find(x => x.id === id);
  }

  updateEcriture(updated: Ecriture) {
    const totalDebit = updated.lignes.reduce((s,l)=>s+(Number(l.debit)||0),0);
    const totalCredit = updated.lignes.reduce((s,l)=>s+(Number(l.credit)||0),0);
    if (Math.round((totalDebit-totalCredit)*100) !== 0) throw new Error('Écriture non équilibrée');
    updated.totalDebit = totalDebit; updated.totalCredit = totalCredit;
    this.ecritures$.next(this.ecritures$.value.map(e => e.id === updated.id ? { ...updated } : e));
  }

  // Exports
  exportJournauxCsv(): Blob {
    const header = 'code;libelle;type';
    const lines = this.journaux$.value.map(j => [j.code, this.csv(j.libelle), j.type].join(';'));
    return new Blob(["\uFEFF" + [header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  }

  exportEcrituresCsv(filterJournal?: string): Blob {
    const header = 'id;date;journal;piece;reference;compte;libelle;debit;credit';
    const rows: string[] = [];
    for (const e of this.ecritures$.value) {
      if (filterJournal && e.journalCode !== filterJournal) continue;
      for (const l of e.lignes) {
        rows.push([e.id, e.date, e.journalCode, e.piece||'', e.reference||'', l.compte, this.csv(l.libelle), l.debit, l.credit].join(';'));
      }
    }
    return new Blob(["\uFEFF" + [header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  }

  exportHtmlTableExcel(html: string): Blob { return new Blob([html], { type: 'application/vnd.ms-excel' }); }

  private csv(v: string) { return (v?.includes(';')||v?.includes('"')) ? '"'+v.replace(/"/g,'""')+'"' : v; }
}