import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OfficialIntegrationsService {
	private readonly api = environment.apiUrl;

	constructor(private http: HttpClient) {}

	// Connexions aux portails officiels (stubs)
	connectFiscalPortal(token?: string): Observable<{ ok: boolean }> {
		return of({ ok: false }); // TODO: implémenter l’OAuth/clé API
	}
	connectSocialPortal(token?: string): Observable<{ ok: boolean }> {
		return of({ ok: false });
	}

	// Dépôt de déclaration (stubs)
	submitFiscalDeclaration(payload: any): Observable<{ ok: boolean; remoteId?: string }> {
		return of({ ok: false }); // this.http.post(`${this.api}/integrations/fiscal/submit`, payload)
	}
	submitSocialDeclaration(payload: any): Observable<{ ok: boolean; remoteId?: string }> {
		return of({ ok: false });
	}
}