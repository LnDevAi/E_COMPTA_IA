import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface EnterpriseIdentity {
	name: string;
	legalForm: string;
	registrationNumber: string;
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
	bankName?: string;
	bankAccount?: string;
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
		defaultJournal?: string;
		defaultCurrency?: string;
		locale?: string;
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
	role: RoleName;
	rights: RoleRights;
	active: boolean;
}

@Injectable({ providedIn: 'root' })
export class EnterpriseService {
	private readonly keyId = 'ecompta_enterprise_identity_v1';
	private readonly keySettings = 'ecompta_enterprise_settings_v1';
	private readonly keyUsers = 'ecompta_enterprise_users_v1';

	private identity$ = new BehaviorSubject<EnterpriseIdentity>(this.loadIdentity());
	private settings$ = new BehaviorSubject<PlatformSettings>(this.loadSettings());
	private users$ = new BehaviorSubject<UserAccount[]>(this.loadUsers());

	getIdentity() { return this.identity$.asObservable(); }
	getSettings() { return this.settings$.asObservable(); }
	getUsers() { return this.users$.asObservable(); }

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
		try { const raw = localStorage.getItem(this.keyId); return raw ? JSON.parse(raw) : {
			name: '', legalForm: '', registrationNumber: '', taxId: '', activity: '', country: '', city: '', address: '', email: '', phone: ''
		}; } catch { return { name: '', legalForm: '', registrationNumber: '', taxId: '', activity: '', country: '', city: '', address: '', email: '', phone: '' }; }
	}
	private loadSettings(): PlatformSettings {
		try { const raw = localStorage.getItem(this.keySettings); return raw ? JSON.parse(raw) : { fiscal: {}, social: {}, app: { defaultJournal: 'OD', defaultCurrency: 'XOF', locale: 'fr-FR' } }; } catch { return { fiscal: {}, social: {}, app: { defaultJournal: 'OD', defaultCurrency: 'XOF', locale: 'fr-FR' } }; }
	}
	private loadUsers(): UserAccount[] {
		try { const raw = localStorage.getItem(this.keyUsers); return raw ? JSON.parse(raw) : []; } catch { return []; }
	}
	private persist(key: string, value: any) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
}