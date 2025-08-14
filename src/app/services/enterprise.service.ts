import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BankAccount { bankName: string; account: string; bic?: string }

export interface EnterpriseIdentity {
	name: string;
	legalForm: string;
	registrationNumber: string;
	socialNumber?: string;
	taxId: string; // NIF/IFU
	activity: string;
	capital?: number;
	country: string;
	city: string;
	address: string;
	email: string;
	phone: string;
	website?: string;
	fiscalRegime?: string;
	currency?: string;
	fiscalYearStartMonth?: number; // 1..12
	director?: string;
	bankName?: string; // legacy
	bankAccount?: string; // legacy
	banks?: BankAccount[];
	logoDataUrl?: string;
}

export interface PlatformSettings {
	// Fiscal platform
	fiscal: {
		apiBase?: string;
		clientId?: string;
		clientSecret?: string;
		token?: string;
		environment?: 'production'|'sandbox'|'';
	};
	// Social platform (CNSS)
	social: {
		apiBase?: string;
		clientId?: string;
		clientSecret?: string;
		token?: string;
		environment?: 'production'|'sandbox'|'';
	};
	// Application
	app: {
		country?: string;
		defaultJournal?: string;
		defaultCurrency?: string;
		locale?: string;
		accountingSystem?: string; // ex: SYSCOHADA, PCG
		chartOfAccounts?: string; // ex: SYSCOHADA, FR-PCG
	};
}

export type RoleName = 'ADMIN' | 'COMPTABLE' | 'LECTURE' | 'VALIDEUR' | 'PERSONNALISE';
export interface RoleRights {
	canView: boolean;
	canEditEntries: boolean;
	canManageUsers: boolean;
	canSubmitDeclarations: boolean;
	canConfigure: boolean;
	canImportExport: boolean;
}
export interface UserAccount {
	id: string;
	name: string;
	email: string;
	phone?: string;
	role: RoleName;
	rights: RoleRights;
	active: boolean;
}

export interface Director { id: string; name: string; role: string; email?: string; phone?: string }
export type TaxCategory = 'FISCAL'|'SOCIAL';
export type TaxPeriod = 'MENSUEL'|'TRIMESTRIEL'|'ANNUEL';
export interface TaxDefinition { id: string; name: string; category: TaxCategory; rate: number; period: TaxPeriod; dueDay?: number; journal?: string; account?: string }

@Injectable({ providedIn: 'root' })
export class EnterpriseService {
	private readonly keyId = 'ecompta_enterprise_identity_v1';
	private readonly keySettings = 'ecompta_enterprise_settings_v1';
	private readonly keyUsers = 'ecompta_enterprise_users_v1';
	private readonly keyDirectors = 'ecompta_enterprise_directors_v1';
	private readonly keyTaxes = 'ecompta_enterprise_taxes_v1';

	private identity$ = new BehaviorSubject<EnterpriseIdentity>(this.loadIdentity());
	private settings$ = new BehaviorSubject<PlatformSettings>(this.loadSettings());
	private users$ = new BehaviorSubject<UserAccount[]>(this.loadUsers());
	private directors$ = new BehaviorSubject<Director[]>(this.loadDirectors());
	private taxes$ = new BehaviorSubject<TaxDefinition[]>(this.loadTaxes());

	getIdentity() { return this.identity$.asObservable(); }
	getSettings() { return this.settings$.asObservable(); }
	getUsers() { return this.users$.asObservable(); }
	getDirectors() { return this.directors$.asObservable(); }
	getTaxes() { return this.taxes$.asObservable(); }

	updateIdentity(patch: Partial<EnterpriseIdentity>) {
		const next = { ...this.identity$.value, ...patch } as EnterpriseIdentity;
		this.identity$.next(next); this.persist(this.keyId, next);
	}
	updateSettings(patch: Partial<PlatformSettings>) {
		const cur = this.settings$.value;
		const next: PlatformSettings = {
			fiscal: { ...(cur.fiscal||{}), ...(patch.fiscal||{}) },
			social: { ...(cur.social||{}), ...(patch.social||{}) },
			app: { ...(cur.app||{}), ...(patch.app||{}) }
		};
		this.settings$.next(next); this.persist(this.keySettings, next);
	}

	addUser(user: Omit<UserAccount,'id'>) {
		const id = `U-${Date.now()}`;
		const next = [...this.users$.value, { ...user, id }];
		this.users$.next(next); this.persist(this.keyUsers, next);
	}
	updateUser(id: string, patch: Partial<UserAccount>) {
		const next = this.users$.value.map(u => u.id === id ? { ...u, ...patch } : u);
		this.users$.next(next); this.persist(this.keyUsers, next);
	}
	removeUser(id: string) {
		const next = this.users$.value.filter(u => u.id !== id);
		this.users$.next(next); this.persist(this.keyUsers, next);
	}

	addDirector(d: Omit<Director,'id'>) { const id = `D-${Date.now()}`; const next = [...this.directors$.value, { ...d, id }]; this.directors$.next(next); this.persist(this.keyDirectors, next); }
	updateDirector(id: string, patch: Partial<Director>) { const next = this.directors$.value.map(x => x.id===id?{...x,...patch}:x); this.directors$.next(next); this.persist(this.keyDirectors, next); }
	removeDirector(id: string) { const next = this.directors$.value.filter(x=>x.id!==id); this.directors$.next(next); this.persist(this.keyDirectors, next); }

	addTax(t: Omit<TaxDefinition,'id'>) { const id = `T-${Date.now()}`; const next = [...this.taxes$.value, { ...t, id }]; this.taxes$.next(next); this.persist(this.keyTaxes, next); }
	updateTax(id: string, patch: Partial<TaxDefinition>) { const next = this.taxes$.value.map(x=>x.id===id?{...x,...patch}:x); this.taxes$.next(next); this.persist(this.keyTaxes, next); }
	removeTax(id: string) { const next = this.taxes$.value.filter(x=>x.id!==id); this.taxes$.next(next); this.persist(this.keyTaxes, next); }

	roleTemplate(role: RoleName): RoleRights {
		switch (role) {
			case 'ADMIN': return { canView: true, canEditEntries: true, canManageUsers: true, canSubmitDeclarations: true, canConfigure: true, canImportExport: true };
			case 'COMPTABLE': return { canView: true, canEditEntries: true, canManageUsers: false, canSubmitDeclarations: true, canConfigure: false, canImportExport: true };
			case 'VALIDEUR': return { canView: true, canEditEntries: false, canManageUsers: false, canSubmitDeclarations: true, canConfigure: false, canImportExport: false };
			case 'LECTURE': return { canView: true, canEditEntries: false, canManageUsers: false, canSubmitDeclarations: false, canConfigure: false, canImportExport: false };
			default: return { canView: true, canEditEntries: false, canManageUsers: false, canSubmitDeclarations: false, canConfigure: false, canImportExport: false };
		}
	}

	private loadIdentity(): EnterpriseIdentity {
		try {
			const raw = localStorage.getItem(this.keyId); const base = raw ? JSON.parse(raw) : {};
			const banks: BankAccount[] = base.banks || (base.bankName || base.bankAccount ? [{ bankName: base.bankName||'', account: base.bankAccount||'' }] : []);
			return { name: '', legalForm: '', registrationNumber: '', taxId: '', activity: '', country: '', city: '', address: '', email: '', phone: '', ...base, banks } as EnterpriseIdentity;
		} catch {
			return { name: '', legalForm: '', registrationNumber: '', taxId: '', activity: '', country: '', city: '', address: '', email: '', phone: '' };
		}
	}
	private loadSettings(): PlatformSettings {
		try { const raw = localStorage.getItem(this.keySettings); return raw ? JSON.parse(raw) : { fiscal: {}, social: {}, app: { country: '', defaultJournal: 'OD', defaultCurrency: 'XOF', locale: 'fr-FR', accountingSystem: 'SYSCOHADA', chartOfAccounts: 'SYSCOHADA' } }; } catch { return { fiscal: {}, social: {}, app: { country: '', defaultJournal: 'OD', defaultCurrency: 'XOF', locale: 'fr-FR', accountingSystem: 'SYSCOHADA', chartOfAccounts: 'SYSCOHADA' } }; }
	}
	private loadUsers(): UserAccount[] {
		try { const raw = localStorage.getItem(this.keyUsers); return raw ? JSON.parse(raw) : []; } catch { return []; }
	}
	private loadDirectors(): Director[] { try { const raw = localStorage.getItem(this.keyDirectors); return raw ? JSON.parse(raw) : []; } catch { return []; } }
	private loadTaxes(): TaxDefinition[] { try { const raw = localStorage.getItem(this.keyTaxes); return raw ? JSON.parse(raw) : []; } catch { return []; } }

	private persist(key: string, value: any) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
}