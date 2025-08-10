import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PLAN_COMPTABLE_SYSCOHADA_BASE } from '../modules/plan-comptable/models/plan-comptable.model';
import { PLAN_COMPTABLE_SYSCOHADA_COMPLET } from '../../assets/data/plan-syscohada-complet';
import { environment } from '../../environments/environment';

export interface AccountPlanItem {
  code: string;
  intitule: string;
  classe?: string;
  parent?: string | null;
  nature?: string; // Actif/Passif/Charge/Produit
  description?: string;
  locked?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChartOfAccountsService {
  private readonly planUrl = 'assets/data/plan-comptable.json';
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Source par défaut: plan complet TS (override), fallback: base interne, puis JSON assets
  getPlan(): Observable<AccountPlanItem[]> {
    return of(PLAN_COMPTABLE_SYSCOHADA_COMPLET as any).pipe(
      map((list: any[]) => this.mapToAccountPlan(list)),
      catchError(() => of(this.mapToAccountPlan(PLAN_COMPTABLE_SYSCOHADA_BASE as any)))
    );
  }

  // Backend endpoints
  loadFromBackend(): Observable<AccountPlanItem[]> {
    return this.http.get<{ items: AccountPlanItem[] }>(`${this.api}/api/plan`).pipe(map(r => r.items));
  }

  saveToBackend(items: AccountPlanItem[]): Observable<AccountPlanItem[]> {
    return this.http.put<{ items: AccountPlanItem[] }>(`${this.api}/api/plan`, { items }).pipe(map(r => r.items));
  }

  addSubAccountBackend(parentCode: string, code: string, intitule: string, description?: string): Observable<AccountPlanItem> {
    return this.http.post<{ ok: boolean; item: AccountPlanItem }>(`${this.api}/api/plan/subaccount`, { parentCode, code, intitule, description }).pipe(map(r => r.item));
  }

  deleteSubAccountBackend(code: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/api/plan/subaccount/${encodeURIComponent(code)}`);
  }

  importToBackend(file: File): Observable<{ accepted: AccountPlanItem[]; errors: string[] }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ accepted: AccountPlanItem[]; errors: string[] }>(`${this.api}/api/plan/import`, form);
  }

  exportCsvFromBackend(filtered = false, q = '', cls = ''): string {
    const url = new URL(`${this.api}/api/plan/export.csv`);
    if (filtered) url.searchParams.set('filtered', 'true');
    if (q) url.searchParams.set('query', q);
    if (cls) url.searchParams.set('class', cls);
    return url.toString();
  }
  exportXlsxFromBackend(filtered = false, q = '', cls = ''): string {
    const url = new URL(`${this.api}/api/plan/export.xlsx`);
    if (filtered) url.searchParams.set('filtered', 'true');
    if (q) url.searchParams.set('query', q);
    if (cls) url.searchParams.set('class', cls);
    return url.toString();
  }
  exportPdfFromBackend(filtered = false, q = '', cls = ''): string {
    const url = new URL(`${this.api}/api/plan/export.pdf`);
    if (filtered) url.searchParams.set('filtered', 'true');
    if (q) url.searchParams.set('query', q);
    if (cls) url.searchParams.set('class', cls);
    return url.toString();
  }

  getPlanFromAssets(): Observable<AccountPlanItem[]> {
    return this.http.get<AccountPlanItem[]>(this.planUrl);
  }

  private mapToAccountPlan(list: any[]): AccountPlanItem[] {
    return list.map(item => ({
      code: item.numero ?? item.code,
      intitule: item.intitule,
      classe: typeof item.classe === 'string' ? item.classe : String(item.classe),
      parent: item.parent ?? undefined,
      nature: item.nature ?? undefined,
      locked: true
    }));
  }
}