import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PLAN_COMPTABLE_SYSCOHADA_BASE } from '../modules/plan-comptable/models/plan-comptable.model';

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

  // Source par défaut: JSON dans assets (modifiable sans rebuild)
  getPlan(): Observable<AccountPlanItem[]> {
    return this.getPlanFromAssets();
  }

  // Fallback éventuel: lecture JSON (non utilisé actuellement)
  getPlanFromAssets(): Observable<AccountPlanItem[]> {
    return this.http.get<AccountPlanItem[]>(this.planUrl);
  }
}