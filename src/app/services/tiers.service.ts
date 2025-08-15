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

	private prefixFor(type: ThirdPartyType): string { return type==='CLIENT' ? 'CLT' : type==='FOURNISSEUR' ? 'FRS' : 'AUT'; }
	private nextNumberFor(type: ThirdPartyType): number {
		const pref = this.prefixFor(type) + '-';
		const nums = this.tiers$.value
			.filter(t => t.type===type && t.code.startsWith(pref))
			.map(t => parseInt(t.code.slice(pref.length), 10))
			.filter(n => !isNaN(n));
		return nums.length ? Math.max(...nums) + 1 : 1;
	}
	getNextCode(type: ThirdPartyType): string {
		const n = this.nextNumberFor(type);
		return `${this.prefixFor(type)}-${String(n).padStart(4,'0')}`;
	}
	private isCodeTaken(code: string, excludeId?: string): boolean {
		return this.tiers$.value.some(t => t.code.toUpperCase() === code.toUpperCase() && t.id !== excludeId);
	}

	create(t: Omit<ThirdParty, 'id'>) {
		const base: Omit<ThirdParty,'id'> = { ...t };
		let code = (base.code||'').trim();
		if (!code) code = this.getNextCode(base.type);
		if (this.isCodeTaken(code)) throw new Error('Code tiers déjà utilisé');
		const id = `TIER-${Date.now()}`;
		const next = [...this.tiers$.value, { ...base, code, id }];
		this.tiers$.next(next); this.persist(next);
	}
	update(id: string, patch: Partial<ThirdParty>) {
		const cur = this.tiers$.value.find(x => x.id === id); if (!cur) return;
		const code = (patch.code ?? cur.code).trim();
		if (!code) throw new Error('Code requis');
		if (this.isCodeTaken(code, id)) throw new Error('Code tiers déjà utilisé');
		const merged = { ...cur, ...patch, code };
		const next = this.tiers$.value.map(x => x.id === id ? merged : x);
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
			const [idRaw, codeRaw, name, typeRaw, email, phone, address, defaultAccount] = cols;
			const type = (String(typeRaw||'AUTRE').toUpperCase() as ThirdPartyType);
			let code = (codeRaw||'').trim();
			if (!code) code = this.getNextCode(type);
			if (out.some(t=>t.code.toUpperCase()===code.toUpperCase()) || this.isCodeTaken(code)) continue; // skip duplicates
			const id = idRaw || `TIER-${Date.now()}-${i}`;
			out.push({ id, code, name: name?.replace(/^"|"$/g,''), type, email, phone, address: address?.replace(/^"|"$/g,''), defaultAccount });
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