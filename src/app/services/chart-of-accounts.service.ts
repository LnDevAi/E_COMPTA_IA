import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PLAN_COMPTABLE_SYSCOHADA_BASE } from '../modules/plan-comptable/models/plan-comptable.model';
import { PLAN_COMPTABLE_SYSCOHADA_COMPLET } from '../../assets/data/plan-syscohada-complet';

export interface AccountPlanItem {
  code: string;
  intitule: string;
  classe?: string;
  parent?: string | null;
  nature?: string; // Actif/Passif/Charge/Produit
}

@Injectable({ providedIn: 'root' })
export class ChartOfAccountsService {
  private readonly planUrl = 'assets/data/plan-comptable.json';

  constructor(private http: HttpClient) {}

  // Source par défaut: plan complet TS (override), fallback: base interne, puis JSON assets
  getPlan(): Observable<AccountPlanItem[]> {
    return of(PLAN_COMPTABLE_SYSCOHADA_COMPLET as any).pipe(
      map((list: any[]) => this.mapToAccountPlan(list)),
      catchError(() => of(this.mapToAccountPlan(PLAN_COMPTABLE_SYSCOHADA_BASE as any)))
    );
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
      nature: item.nature ?? undefined
    }));
  }
}