import { Injectable } from '@angular/core';
import { BehaviorSubject, tap, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Journal {
  code: string;
  libelle: string;
  type: 'ACHATS' | 'VENTES' | 'BANQUE' | 'OD' | 'SALAIRES' | 'CAISSES' | 'MONNAIE_ELECTRONIQUE' | 'AUTRE';
}

export interface EcritureLigne { compte: string; libelle: string; debit: number; credit: number; tiersId?: string; tiersName?: string; }
export interface Ecriture {
  id: string; date: string; journalCode: string; piece?: string; reference?: string;
  lignes: EcritureLigne[]; totalDebit: number; totalCredit: number;
}
export interface EntryTemplate { id: string; journalCode: string; name: string; lignes: EcritureLigne[]; }

@Injectable({ providedIn: 'root' })
export class JournalService {
  readonly api = environment.apiUrl;

  private readonly journaux$ = new BehaviorSubject<Journal[]>([]);
  private readonly ecritures$ = new BehaviorSubject<Ecriture[]>([]);
  private readonly templates$ = new BehaviorSubject<EntryTemplate[]>(this.loadTemplates());

  constructor(private http: HttpClient) {
    this.refreshJournaux(); this.refreshEcritures();
  }

  // Observables
  getJournaux() { return this.journaux$.asObservable(); }
  getEcritures() { return this.ecritures$.asObservable(); }
  getTemplates() { return this.templates$.asObservable(); }

  // Backend calls
  refreshJournaux() {
    this.http.get<{items: Journal[]}>(`${this.api}/api/journaux`).subscribe({ next: r => this.journaux$.next(r.items||[]) });
  }
  createJournal(j: Journal) {
    return this.http.post<Journal>(`${this.api}/api/journaux`, j).pipe(tap(()=>this.refreshJournaux())).subscribe();
  }
  updateJournal(code: string, patch: Partial<Pick<Journal,'libelle'|'type'>>) {
    return this.http.put<Journal>(`${this.api}/api/journaux/${encodeURIComponent(code)}`, patch).pipe(tap(()=>this.refreshJournaux())).subscribe();
  }
  removeJournal(code: string) {
    return this.http.delete<void>(`${this.api}/api/journaux/${encodeURIComponent(code)}`).pipe(tap(()=>this.refreshJournaux())).subscribe();
  }

  refreshEcritures() {
    this.http.get<{items: Ecriture[]}>(`${this.api}/api/ecritures`).subscribe({ next: r => this.ecritures$.next(r.items||[]) });
  }
  addEcriture(e: Omit<Ecriture,'id'|'totalDebit'|'totalCredit'>) {
    return this.http.post<Ecriture>(`${this.api}/api/ecritures`, e).pipe(tap(()=>this.refreshEcritures())).subscribe();
  }
  addEcrituresBatch(entries: Array<Omit<Ecriture,'totalDebit'|'totalCredit'>>) {
    // Pas d'endpoint batch pour l'instant: on envoie une par une
    for (const e of entries) this.http.post(`${this.api}/api/ecritures`, e).subscribe({ next: ()=>this.refreshEcritures() });
  }
  deleteEcriture(id: string) {
    return this.http.delete<void>(`${this.api}/api/ecritures/${encodeURIComponent(id)}`).pipe(tap(()=>this.refreshEcritures())).subscribe();
  }
  getEcriture(id: string) { return this.ecritures$.value.find(x => x.id === id); }
  updateEcriture(updated: Ecriture) {
    // Simplification: re-post en supprimant puis ajoutant (pas d'endpoint PUT pour l'instant)
    this.deleteEcriture(updated.id);
    const { id, totalDebit, totalCredit, ...payload } = updated as any;
    this.addEcriture(payload);
  }

  // Templates (localStorage)
  createTemplate(journalCode: string, name: string, lignes: EcritureLigne[]): EntryTemplate {
    const id = `${journalCode}-${Date.now()}`;
    const tpl: EntryTemplate = { id, journalCode, name, lignes: lignes.map(l => ({ ...l })) };
    const next = [...this.templates$.value, tpl];
    this.templates$.next(next); this.persistTemplates(next);
    return tpl;
  }
  updateTemplate(id: string, name: string, lignes: EcritureLigne[]): void {
    const next = this.templates$.value.map(t => t.id === id ? { ...t, name, lignes: lignes.map(l => ({ ...l })) } : t);
    this.templates$.next(next); this.persistTemplates(next);
  }
  deleteTemplate(id: string): void {
    const next = this.templates$.value.filter(t => t.id !== id);
    this.templates$.next(next); this.persistTemplates(next);
  }
  private loadTemplates(): EntryTemplate[] { try { const raw = localStorage.getItem('ecompta_templates_v1'); return raw? JSON.parse(raw) : []; } catch { return []; } }
  private persistTemplates(list: EntryTemplate[]): void { try { localStorage.setItem('ecompta_templates_v1', JSON.stringify(list)); } catch {} }

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
      for (const l of e.lignes) rows.push([e.id, e.date, e.journalCode, e.piece||'', e.reference||'', l.compte, this.csv(l.libelle), l.debit, l.credit].join(';'));
    }
    return new Blob(["\uFEFF" + [header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  }
  exportHtmlTableExcel(html: string): Blob { return new Blob([html], { type: 'application/vnd.ms-excel' }); }
  private csv(v: string) { return (v?.includes(';')||v?.includes('"')) ? '"'+v.replace(/"/g,'""')+'"' : v; }
}