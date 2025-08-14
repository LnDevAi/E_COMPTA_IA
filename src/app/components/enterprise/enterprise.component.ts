import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnterpriseService, EnterpriseIdentity, PlatformSettings, UserAccount, RoleName } from '../../services/enterprise.service';

@Component({
  selector: 'app-enterprise',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-container">
      <h1>🏢 Entreprise</h1>

      <div class="tabs">
        <button class="tab" [class.active]="tab==='IDENT'" (click)="tab='IDENT'">Identification</button>
        <button class="tab" [class.active]="tab==='PLAT'" (click)="tab='PLAT'">Paramétrages plateformes</button>
        <button class="tab" [class.active]="tab==='USERS'" (click)="tab='USERS'">Utilisateurs & droits</button>
      </div>

      <div class="panel" *ngIf="tab==='IDENT'">
        <h3>Informations légales</h3>
        <div class="grid">
          <label>Dénomination<input class="input" [(ngModel)]="identity.name" (change)="saveIdentity()"/></label>
          <label>Forme juridique<input class="input" [(ngModel)]="identity.legalForm" (change)="saveIdentity()"/></label>
          <label>RCCM/Registre<input class="input" [(ngModel)]="identity.registrationNumber" (change)="saveIdentity()"/></label>
          <label>NIF/IFU<input class="input" [(ngModel)]="identity.taxId" (change)="saveIdentity()"/></label>
          <label>Activité<input class="input" [(ngModel)]="identity.activity" (change)="saveIdentity()"/></label>
          <label>Capital<input class="input" type="number" step="0.01" [(ngModel)]="identity.capital" (change)="saveIdentity()"/></label>
          <label>Pays<input class="input" [(ngModel)]="identity.country" (change)="saveIdentity()"/></label>
          <label>Ville<input class="input" [(ngModel)]="identity.city" (change)="saveIdentity()"/></label>
          <label>Adresse<input class="input" [(ngModel)]="identity.address" (change)="saveIdentity()"/></label>
          <label>Email<input class="input" [(ngModel)]="identity.email" (change)="saveIdentity()"/></label>
          <label>Téléphone<input class="input" [(ngModel)]="identity.phone" (change)="saveIdentity()"/></label>
          <label>Site web<input class="input" [(ngModel)]="identity.website" (change)="saveIdentity()"/></label>
          <label>Régime fiscal<input class="input" [(ngModel)]="identity.fiscalRegime" (change)="saveIdentity()"/></label>
          <label>Devise<input class="input" [(ngModel)]="identity.currency" (change)="saveIdentity()"/></label>
          <label>Début exercice (mois 1..12)<input class="input" type="number" min="1" max="12" [(ngModel)]="identity.fiscalYearStartMonth" (change)="saveIdentity()"/></label>
          <label>Dirigeant<input class="input" [(ngModel)]="identity.director" (change)="saveIdentity()"/></label>
          <label>Banque<input class="input" [(ngModel)]="identity.bankName" (change)="saveIdentity()"/></label>
          <label>Compte bancaire<input class="input" [(ngModel)]="identity.bankAccount" (change)="saveIdentity()"/></label>
        </div>
      </div>

      <div class="panel" *ngIf="tab==='PLAT'">
        <h3>Paramétrages plateformes</h3>
        <h4>Portail fiscal</h4>
        <div class="grid">
          <label>API Base<input class="input" [(ngModel)]="settings.fiscal.apiBase" (change)="saveSettings()"/></label>
          <label>Client ID<input class="input" [(ngModel)]="settings.fiscal.clientId" (change)="saveSettings()"/></label>
          <label>Client Secret<input class="input" [(ngModel)]="settings.fiscal.clientSecret" (change)="saveSettings()"/></label>
          <label>Token<input class="input" [(ngModel)]="settings.fiscal.token" (change)="saveSettings()"/></label>
          <label>Environnement
            <select class="input" [(ngModel)]="settings.fiscal.environment" (change)="saveSettings()">
              <option value="">—</option>
              <option value="sandbox">Sandbox</option>
              <option value="production">Production</option>
            </select>
          </label>
        </div>
        <h4>Portail social (CNSS)</h4>
        <div class="grid">
          <label>API Base<input class="input" [(ngModel)]="settings.social.apiBase" (change)="saveSettings()"/></label>
          <label>Client ID<input class="input" [(ngModel)]="settings.social.clientId" (change)="saveSettings()"/></label>
          <label>Client Secret<input class="input" [(ngModel)]="settings.social.clientSecret" (change)="saveSettings()"/></label>
          <label>Token<input class="input" [(ngModel)]="settings.social.token" (change)="saveSettings()"/></label>
          <label>Environnement
            <select class="input" [(ngModel)]="settings.social.environment" (change)="saveSettings()">
              <option value="">—</option>
              <option value="sandbox">Sandbox</option>
              <option value="production">Production</option>
            </select>
          </label>
        </div>
        <h4>Application</h4>
        <div class="grid">
          <label>Journal par défaut<input class="input" [(ngModel)]="settings.app.defaultJournal" (change)="saveSettings()"/></label>
          <label>Devise par défaut<input class="input" [(ngModel)]="settings.app.defaultCurrency" (change)="saveSettings()"/></label>
          <label>Langue/Locale<input class="input" [(ngModel)]="settings.app.locale" (change)="saveSettings()"/></label>
        </div>
      </div>

      <div class="panel" *ngIf="tab==='USERS'">
        <h3>Utilisateurs</h3>
        <div class="toolbar">
          <input class="input" placeholder="Nom" [(ngModel)]="newUser.name"/>
          <input class="input" placeholder="Email" [(ngModel)]="newUser.email"/>
          <select class="input" [(ngModel)]="newUser.role" (change)="applyRoleTemplate()">
            <option value="ADMIN">Admin</option>
            <option value="COMPTABLE">Comptable</option>
            <option value="VALIDEUR">Valideur</option>
            <option value="LECTURE">Lecture</option>
            <option value="PERSONNALISE">Personnalisé</option>
          </select>
          <button class="btn" (click)="addUser()">Ajouter</button>
        </div>
        <div class="grid perms">
          <label><input type="checkbox" [(ngModel)]="newUser.rights.canView"/> Lecture</label>
          <label><input type="checkbox" [(ngModel)]="newUser.rights.canEditEntries"/> Écrire des écritures</label>
          <label><input type="checkbox" [(ngModel)]="newUser.rights.canSubmitDeclarations"/> Soumettre déclarations</label>
          <label><input type="checkbox" [(ngModel)]="newUser.rights.canImportExport"/> Import/Export</label>
          <label><input type="checkbox" [(ngModel)]="newUser.rights.canManageUsers"/> Gérer utilisateurs</label>
          <label><input type="checkbox" [(ngModel)]="newUser.rights.canConfigure"/> Configurer</label>
        </div>

        <table class="table">
          <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Actif</th><th>Droits</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>
                <select class="input" [(ngModel)]="u.role" (change)="updateUser(u, { role: u.role, rights: templateFor(u.role) })">
                  <option value="ADMIN">Admin</option>
                  <option value="COMPTABLE">Comptable</option>
                  <option value="VALIDEUR">Valideur</option>
                  <option value="LECTURE">Lecture</option>
                  <option value="PERSONNALISE">Personnalisé</option>
                </select>
              </td>
              <td><input type="checkbox" [(ngModel)]="u.active" (change)="updateUser(u, { active: u.active })"/></td>
              <td>
                <small>
                  {{ u.rights.canView ? 'L' : '-' }}
                  {{ u.rights.canEditEntries ? 'E' : '-' }}
                  {{ u.rights.canSubmitDeclarations ? 'S' : '-' }}
                  {{ u.rights.canImportExport ? 'X' : '-' }}
                  {{ u.rights.canManageUsers ? 'U' : '-' }}
                  {{ u.rights.canConfigure ? 'C' : '-' }}
                </small>
              </td>
              <td><button class="btn danger" (click)="removeUser(u)">Supprimer</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .module-container { background:#fff; border-radius:12px; padding:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
    .tabs { display:flex; gap:6px; margin-bottom:8px; }
    .tab { padding:8px 12px; border:none; border-radius:6px; background:#e2e8f0; cursor:pointer; }
    .tab.active { background:#3182ce; color:#fff; }
    .panel { border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px; }
    .grid { display:grid; grid-template-columns: repeat(3, minmax(220px, 1fr)); gap: 8px; }
    .grid.perms { grid-template-columns: repeat(6, minmax(160px, 1fr)); }
    .toolbar { display:flex; gap:0.5rem; align-items:center; margin:8px 0; }
    .input { padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px; }
    .btn { padding:8px 10px; border:none; border-radius:6px; background:#3182ce; color:#fff; cursor:pointer; }
    .btn.danger { background:#e53e3e; }
    .table { width:100%; border-collapse:collapse; }
    .table th, .table td { border:1px solid #e2e8f0; padding:8px 10px; text-align:left; }
    .table th { background:#f7fafc; }
  `]
})
export class EnterpriseComponent {
  tab: 'IDENT'|'PLAT'|'USERS' = 'IDENT';

  identity: EnterpriseIdentity = { name: '', legalForm: '', registrationNumber: '', taxId: '', activity: '', country: '', city: '', address: '', email: '', phone: '' };
  settings: PlatformSettings = { fiscal: {}, social: {}, app: { defaultJournal: 'OD', defaultCurrency: 'XOF', locale: 'fr-FR' } };
  users: UserAccount[] = [];

  newUser: any = { name: '', email: '', role: 'COMPTABLE', rights: { canView: true, canEditEntries: true, canManageUsers: false, canSubmitDeclarations: true, canConfigure: false, canImportExport: true }, active: true };

  constructor(private es: EnterpriseService) {
    this.es.getIdentity().subscribe(v => this.identity = v);
    this.es.getSettings().subscribe(v => this.settings = v);
    this.es.getUsers().subscribe(v => this.users = v);
  }

  saveIdentity() { this.es.updateIdentity(this.identity); }
  saveSettings() { this.es.updateSettings(this.settings); }

  templateFor(role: RoleName) { return this.es.roleTemplate(role); }
  applyRoleTemplate() {
    if (this.newUser.role !== 'PERSONNALISE') this.newUser.rights = this.templateFor(this.newUser.role);
  }
  addUser() {
    if (!this.newUser.name || !this.newUser.email) return;
    this.es.addUser({ name: this.newUser.name, email: this.newUser.email, role: this.newUser.role, rights: this.newUser.rights, active: true });
    this.newUser.name = this.newUser.email = ''; this.newUser.role = 'COMPTABLE'; this.applyRoleTemplate();
  }
  updateUser(u: UserAccount, patch: Partial<UserAccount>) { this.es.updateUser(u.id, patch); }
  removeUser(u: UserAccount) { if (confirm('Supprimer cet utilisateur ?')) this.es.removeUser(u.id); }
}