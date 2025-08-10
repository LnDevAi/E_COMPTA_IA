import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  getPlan(): Observable<AccountPlanItem[]> {
    return this.http.get<AccountPlanItem[]>(this.planUrl);
  }
}