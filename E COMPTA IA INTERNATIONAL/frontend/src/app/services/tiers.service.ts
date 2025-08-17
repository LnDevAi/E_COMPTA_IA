import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type ThirdPartyType = 'CLIENT'|'FOURNISSEUR'|'AUTRE';

export interface ThirdParty {
	id: string;
	code: string;
	name: string;
	type: ThirdPartyType;
	email?: string;
	phone?: string;
	address?: string;
	defaultAccount?: string;
}

@Injectable({ providedIn: 'root' })
export class TiersService {
	private readonly tiers$ = new BehaviorSubject<ThirdParty[]>([]);
	private readonly api = environment.apiUrl;

	constructor(private http: HttpClient) { this.refresh(); }

	getAll() { return this.tiers$.asObservable(); }
	getValue() { return this.tiers$.value; }

	refresh() {
		this.http.get<{items: ThirdParty[]}>(`${this.api}/api/tiers`).subscribe({ next: r => this.tiers$.next(r.items||[]) });
	}

	getNextCode(type: ThirdPartyType): string {
		const pref = type==='CLIENT'?'CLT':type==='FOURNISSEUR'?'FRS':'AUT';
		const nums = this.tiers$.value.filter(t=>t.type===type && t.code.startsWith(pref+'-')).map(t=>parseInt(t.code.slice(4),10)).filter(n=>!isNaN(n));
		const n = nums.length? Math.max(...nums)+1 : 1; return `${pref}-${String(n).padStart(4,'0')}`;
	}
	isCodeTaken(code: string, excludeId?: string): boolean { return this.tiers$.value.some(t => t.code.toUpperCase() === code.toUpperCase() && t.id !== excludeId); }

	create(t: Omit<ThirdParty, 'id'>) {
		return this.http.post<ThirdParty>(`${this.api}/api/tiers`, t).subscribe({ next: ()=> this.refresh() });
	}
	update(id: string, patch: Partial<ThirdParty>) {
		return this.http.put<ThirdParty>(`${this.api}/api/tiers/${encodeURIComponent(id)}`, patch).subscribe({ next: ()=> this.refresh() });
	}
	remove(id: string) {
		return this.http.delete<void>(`${this.api}/api/tiers/${encodeURIComponent(id)}`).subscribe({ next: ()=> this.refresh() });
	}

	exportCsv(): Blob {
		const header = 'id;code;name;type;email;phone;address;defaultAccount';
		const rows = this.tiers$.value.map(t => [t.id, t.code, this.csv(t.name), t.type, t.email||'', t.phone||'', this.csv(t.address||''), t.defaultAccount||''].join(';'));
		return new Blob(["\uFEFF" + [header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
	}
	importCsv(text: string) {
		// Import local côté client: envoie en create() pour chaque ligne valide
		const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0); if (lines.length<=1) return;
		for (let i=1;i<lines.length;i++) {
			const cols = this.parseCsvLine(lines[i]);
			const [idRaw, codeRaw, name, typeRaw, email, phone, address, defaultAccount] = cols;
			const type = (String(typeRaw||'AUTRE').toUpperCase() as ThirdPartyType);
			const payload: any = { code: (codeRaw||'').trim(), name: name?.replace(/^"|"$/g,''), type, email, phone, address: address?.replace(/^"|"$/g,''), defaultAccount };
			this.create(payload);
		}
	}

	private csv(v: string) { return (v?.includes(';')||v?.includes('"')) ? '"'+v.replace(/"/g,'""')+'"' : v; }
	private parseCsvLine(line: string): string[] { const res: string[] = []; let cur=''; let inside=false; for (let i=0;i<line.length;i++){ const ch=line[i]; if (ch==='"'){inside=!inside; cur+=ch;} else if (ch===';' && !inside){res.push(cur); cur='';} else {cur+=ch;} } res.push(cur); return res; }
}