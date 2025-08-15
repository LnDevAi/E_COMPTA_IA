import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
	private readonly key = 'ecompta_tiers_v1';
	private readonly tiers$ = new BehaviorSubject<ThirdParty[]>(this.load());

	getAll() { return this.tiers$.asObservable(); }
	getValue() { return this.tiers$.value; }

	create(t: Omit<ThirdParty, 'id'>) {
		const id = `TIER-${Date.now()}`;
		const next = [...this.tiers$.value, { ...t, id }];
		this.tiers$.next(next); this.persist(next);
	}
	update(id: string, patch: Partial<ThirdParty>) {
		const next = this.tiers$.value.map(x => x.id === id ? { ...x, ...patch } : x);
		this.tiers$.next(next); this.persist(next);
	}
	remove(id: string) {
		const next = this.tiers$.value.filter(x => x.id !== id);
		this.tiers$.next(next); this.persist(next);
	}

	exportCsv(): Blob {
		const header = 'id;code;name;type;email;phone;address;defaultAccount';
		const rows = this.tiers$.value.map(t => [t.id, t.code, this.csv(t.name), t.type, t.email||'', t.phone||'', this.csv(t.address||''), t.defaultAccount||''].join(';'));
		return new Blob(["\uFEFF" + [header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
	}
	importCsv(text: string) {
		const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0);
		if (lines.length <= 1) return;
		const out: ThirdParty[] = [];
		for (let i=1; i<lines.length; i++) {
			const cols = this.parseCsvLine(lines[i]);
			const [id, code, name, type, email, phone, address, defaultAccount] = cols;
			if (!code || !name) continue;
			out.push({ id: id||`TIER-${Date.now()}-${i}`, code, name: name.replace(/^"|"$/g,''), type: (type as ThirdPartyType)||'AUTRE', email, phone, address: address?.replace(/^"|"$/g,''), defaultAccount });
		}
		this.tiers$.next(out); this.persist(out);
	}

	private load(): ThirdParty[] {
		try { const raw = localStorage.getItem(this.key); return raw ? JSON.parse(raw) : []; } catch { return []; }
	}
	private persist(list: ThirdParty[]) { try { localStorage.setItem(this.key, JSON.stringify(list)); } catch {} }
	private csv(v: string) { return (v?.includes(';')||v?.includes('"')) ? '"'+v.replace(/"/g,'""')+'"' : v; }
	private parseCsvLine(line: string): string[] {
		const res: string[] = []; let cur = ''; let inside = false;
		for (let i=0;i<line.length;i++) {
			const ch = line[i];
			if (ch === '"') { inside = !inside; cur += ch; }
			else if (ch === ';' && !inside) { res.push(cur); cur = ''; }
			else { cur += ch; }
		}
		res.push(cur);
		return res;
	}
}