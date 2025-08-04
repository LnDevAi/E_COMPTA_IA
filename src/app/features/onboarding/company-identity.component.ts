import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Country {
  code: string;
  name: string;
  flag: string;
  accountingSystem: string;
  currency: string;
  languages: string[];
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  recommended?: boolean;
}

@Component({
  selector: 'app-company-identity',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="onboarding-container">
      <!-- Progress Steps -->
      <div class="progress-header">
        <div class="steps-indicator">
          <div class="step" [class.active]="currentStep() === 1" [class.completed]="currentStep() > 1">
            <div class="step-number">1</div>
            <span>Pays & Système</span>
          </div>
          <div class="step" [class.active]="currentStep() === 2" [class.completed]="currentStep() > 2">
            <div class="step-number">2</div>
            <span>Informations Légales</span>
          </div>
          <div class="step" [class.active]="currentStep() === 3" [class.completed]="currentStep() > 3">
            <div class="step-number">3</div>
            <span>Documents Officiels</span>
          </div>
          <div class="step" [class.active]="currentStep() === 4" [class.completed]="currentStep() > 4">
            <div class="step-number">4</div>
            <span>Abonnement</span>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="progressPercentage()"></div>
        </div>
      </div>

      <!-- Step 1: Pays & Système Comptable -->
      <div class="step-content" *ngIf="currentStep() === 1">
        <div class="step-header">
          <h2>🌍 Choisissez votre pays d'activité</h2>
          <p>Sélectionnez votre pays pour adapter E COMPTA IA à la réglementation locale</p>
        </div>

        <div class="countries-grid">
          <div *ngFor="let country of countries" 
               class="country-card" 
               [class.selected]="selectedCountry()?.code === country.code"
               (click)="selectCountry(country)">
            <div class="country-flag">{{ country.flag }}</div>
            <div class="country-info">
              <h3>{{ country.name }}</h3>
              <div class="accounting-system">
                <strong>Système:</strong> {{ country.accountingSystem }}
              </div>
              <div class="currency">
                <strong>Devise:</strong> {{ country.currency }}
              </div>
              <div class="languages">
                <strong>Langues:</strong> {{ country.languages.join(', ') }}
              </div>
            </div>
            <div class="selection-indicator" *ngIf="selectedCountry()?.code === country.code">
              ✓
            </div>
          </div>
        </div>

        <div class="accounting-preview" *ngIf="selectedCountry()">
          <h3>📋 Système Comptable: {{ selectedCountry()?.accountingSystem }}</h3>
          <div class="system-features">
            <div class="feature" *ngIf="selectedCountry()?.accountingSystem === 'SYSCOHADA AUDCIF'">
              <i>✅</i> Plan comptable conforme AUDCIF
            </div>
            <div class="feature" *ngIf="selectedCountry()?.accountingSystem === 'SYSCOHADA AUDCIF'">
              <i>✅</i> États financiers OHADA
            </div>
            <div class="feature" *ngIf="selectedCountry()?.accountingSystem === 'SYSCOHADA AUDCIF'">
              <i>✅</i> Déclarations fiscales locales
            </div>
            <div class="feature" *ngIf="selectedCountry()?.accountingSystem !== 'SYSCOHADA AUDCIF'">
              <i>⚠️</i> Système en cours d'intégration
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn-primary" 
                  [disabled]="!selectedCountry()" 
                  (click)="nextStep()">
            Continuer
          </button>
        </div>
      </div>

      <!-- Step 2: Informations Légales -->
      <div class="step-content" *ngIf="currentStep() === 2">
        <div class="step-header">
          <h2>🏢 Informations de votre entreprise</h2>
          <p>Renseignez les informations légales de votre entreprise</p>
        </div>

        <form [formGroup]="companyForm" class="company-form">
          <div class="form-row">
            <div class="form-group">
              <label>Raison sociale *</label>
              <input type="text" 
                     formControlName="companyName" 
                     placeholder="Ex: SARL EXAMPLE COMPANY"
                     class="form-input">
              <div class="error" *ngIf="companyForm.get('companyName')?.errors?.['required'] && companyForm.get('companyName')?.touched">
                La raison sociale est obligatoire
              </div>
            </div>

            <div class="form-group">
              <label>Forme juridique *</label>
              <select formControlName="legalForm" class="form-select">
                <option value="">Sélectionnez...</option>
                <option value="SARL">SARL</option>
                <option value="SA">SA</option>
                <option value="SAS">SAS</option>
                <option value="EURL">EURL</option>
                <option value="EI">Entreprise Individuelle</option>
                <option value="GIE">GIE</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Capital social</label>
              <input type="number" 
                     formControlName="capital" 
                     placeholder="0"
                     class="form-input">
              <span class="currency-suffix">{{ selectedCountry()?.currency }}</span>
            </div>

            <div class="form-group">
              <label>Secteur d'activité *</label>
              <select formControlName="sector" class="form-select">
                <option value="">Sélectionnez...</option>
                <option value="COMMERCE">Commerce</option>
                <option value="INDUSTRIE">Industrie</option>
                <option value="SERVICES">Services</option>
                <option value="AGRICULTURE">Agriculture</option>
                <option value="BTP">BTP</option>
                <option value="TRANSPORT">Transport</option>
                <option value="AUTRES">Autres</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Adresse du siège social *</label>
            <textarea formControlName="address" 
                      placeholder="Adresse complète du siège social"
                      class="form-textarea"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Téléphone</label>
              <input type="tel" 
                     formControlName="phone" 
                     placeholder="+225 XX XX XX XX"
                     class="form-input">
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input type="email" 
                     formControlName="email" 
                     placeholder="contact@entreprise.com"
                     class="form-input">
            </div>
          </div>
        </form>

        <div class="step-actions">
          <button class="btn-secondary" (click)="previousStep()">
            Retour
          </button>
          <button class="btn-primary" 
                  [disabled]="!companyForm.valid" 
                  (click)="nextStep()">
            Continuer
          </button>
        </div>
      </div>

      <!-- Step 3: Documents Officiels -->
      <div class="step-content" *ngIf="currentStep() === 3">
        <div class="step-header">
          <h2>📄 Documents officiels</h2>
          <p>Importez vos documents officiels pour validation automatique</p>
        </div>

        <div class="documents-section">
          <div class="document-upload" *ngFor="let doc of requiredDocuments">
            <div class="document-header">
              <i [class]="doc.icon"></i>
              <div class="document-info">
                <h4>{{ doc.name }}</h4>
                <p>{{ doc.description }}</p>
              </div>
              <div class="document-status" [class]="doc.status">
                {{ getStatusText(doc.status) }}
              </div>
            </div>

            <div class="upload-area" 
                 [class.dragover]="dragover"
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event, doc.id)">
              <i class="upload-icon">📁</i>
              <p>Glissez-déposez votre fichier ici ou</p>
              <button class="btn-upload" (click)="selectFile(doc.id)">
                Parcourir
              </button>
              <input type="file" 
                     [id]="'file-' + doc.id"
                     (change)="onFileSelected($event, doc.id)"
                     accept=".pdf,.jpg,.jpeg,.png"
                     style="display: none;">
            </div>

            <div class="validation-result" *ngIf="doc.validationResult">
              <div class="validation-item" 
                   [class.valid]="doc.validationResult.valid"
                   [class.invalid]="!doc.validationResult.valid">
                <i>{{ doc.validationResult.valid ? '✅' : '❌' }}</i>
                {{ doc.validationResult.message }}
              </div>
            </div>
          </div>
        </div>

        <div class="ai-validation-info">
          <h3>🤖 Validation IA automatique</h3>
          <p>Notre IA vérifie automatiquement :</p>
          <ul>
            <li>Cohérence des informations avec les données saisies</li>
            <li>Validité des numéros officiels</li>
            <li>Conformité des documents</li>
            <li>Synchronisation avec les bases officielles</li>
          </ul>
        </div>

        <div class="step-actions">
          <button class="btn-secondary" (click)="previousStep()">
            Retour
          </button>
          <button class="btn-primary" 
                  [disabled]="!allDocumentsValid()" 
                  (click)="nextStep()">
            Continuer
          </button>
        </div>
      </div>

      <!-- Step 4: Choix Abonnement -->
      <div class="step-content" *ngIf="currentStep() === 4">
        <div class="step-header">
          <h2>💎 Choisissez votre abonnement</h2>
          <p>Sélectionnez l'offre qui correspond à vos besoins</p>
        </div>

        <div class="plans-grid">
          <div *ngFor="let plan of subscriptionPlans" 
               class="plan-card" 
               [class.selected]="selectedPlan()?.id === plan.id"
               [class.recommended]="plan.recommended"
               (click)="selectPlan(plan)">
            
            <div class="plan-badge" *ngIf="plan.recommended">
              ⭐ RECOMMANDÉ
            </div>

            <div class="plan-header">
              <h3>{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="price">{{ plan.price | number:'1.0-0' }}</span>
                <span class="currency">{{ plan.currency }}</span>
                <span class="period">/mois</span>
              </div>
            </div>

            <div class="plan-features">
              <div class="feature" *ngFor="let feature of plan.features">
                <i>✓</i> {{ feature }}
              </div>
            </div>

            <div class="selection-indicator" *ngIf="selectedPlan()?.id === plan.id">
              ✓ SÉLECTIONNÉ
            </div>
          </div>
        </div>

        <div class="payment-info" *ngIf="selectedPlan()">
          <h3>💳 Informations de paiement</h3>
          <p>Vous serez redirigé vers notre partenaire de paiement sécurisé</p>
          <div class="security-badges">
            <span class="badge">🔒 SSL</span>
            <span class="badge">💳 Visa/MasterCard</span>
            <span class="badge">📱 Mobile Money</span>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn-secondary" (click)="previousStep()">
            Retour
          </button>
          <button class="btn-primary" 
                  [disabled]="!selectedPlan()" 
                  (click)="completeOnboarding()">
            Finaliser l'inscription
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f8fafc;
      min-height: 100vh;
    }

    .progress-header {
      margin-bottom: 40px;
    }

    .steps-indicator {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
      position: relative;
    }

    .step::after {
      content: '';
      position: absolute;
      top: 20px;
      left: 50%;
      width: 100%;
      height: 2px;
      background: #e5e7eb;
      z-index: -1;
    }

    .step:last-child::after {
      display: none;
    }

    .step.completed::after {
      background: #10b981;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e5e7eb;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      transition: all 0.3s;
    }

    .step.active .step-number {
      background: #3b82f6;
      color: white;
    }

    .step.completed .step-number {
      background: #10b981;
      color: white;
    }

    .step span {
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }

    .step.active span {
      color: #3b82f6;
      font-weight: 600;
    }

    .progress-bar {
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #3b82f6);
      transition: width 0.3s ease;
    }

    .step-content {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .step-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .step-header h2 {
      font-size: 28px;
      color: #1e293b;
      margin-bottom: 12px;
    }

    .step-header p {
      font-size: 16px;
      color: #6b7280;
    }

    .countries-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .country-card {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
    }

    .country-card:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
    }

    .country-card.selected {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .country-flag {
      font-size: 48px;
      text-align: center;
      margin-bottom: 16px;
    }

    .country-info h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 12px;
      text-align: center;
    }

    .country-info div {
      font-size: 14px;
      margin-bottom: 8px;
      color: #6b7280;
    }

    .selection-indicator {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #10b981;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .accounting-preview {
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .accounting-preview h3 {
      color: #1e293b;
      margin-bottom: 16px;
    }

    .system-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 12px;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .company-form {
      margin-bottom: 30px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      position: relative;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }

    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .currency-suffix {
      position: absolute;
      right: 12px;
      top: 36px;
      color: #6b7280;
      font-size: 14px;
    }

    .error {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    .documents-section {
      margin-bottom: 30px;
    }

    .document-upload {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .document-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .document-header i {
      font-size: 24px;
    }

    .document-info h4 {
      margin: 0 0 4px 0;
      color: #1e293b;
    }

    .document-info p {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
    }

    .document-status {
      margin-left: auto;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .document-status.pending {
      background: #fef3c7;
      color: #d97706;
    }

    .document-status.valid {
      background: #dcfce7;
      color: #16a34a;
    }

    .document-status.invalid {
      background: #fee2e2;
      color: #dc2626;
    }

    .upload-area {
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      transition: all 0.3s;
    }

    .upload-area:hover, .upload-area.dragover {
      border-color: #3b82f6;
      background: #f8fafc;
    }

    .upload-icon {
      font-size: 48px;
      margin-bottom: 12px;
      display: block;
    }

    .btn-upload {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 8px;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 30px;
    }

    .plan-card {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
    }

    .plan-card.recommended {
      border-color: #f59e0b;
      transform: scale(1.05);
    }

    .plan-card.selected {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .plan-badge {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: #f59e0b;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .plan-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .plan-header h3 {
      font-size: 20px;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .plan-price {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
    }

    .price {
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
    }

    .currency, .period {
      color: #6b7280;
    }

    .plan-features {
      margin-bottom: 20px;
    }

    .plan-features .feature {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .plan-features i {
      color: #10b981;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 40px;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-primary:disabled {
      background: #d1d5db;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .countries-grid, .plans-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CompanyIdentityComponent {
  currentStep = signal(1);
  selectedCountry = signal<Country | null>(null);
  selectedPlan = signal<SubscriptionPlan | null>(null);
  dragover = signal(false);

  companyForm: FormGroup;

  countries: Country[] = [
    {
      code: 'CI',
      name: 'Côte d\'Ivoire',
      flag: '🇨🇮',
      accountingSystem: 'SYSCOHADA AUDCIF',
      currency: 'FCFA',
      languages: ['Français']
    },
    {
      code: 'SN',
      name: 'Sénégal',
      flag: '🇸🇳',
      accountingSystem: 'SYSCOHADA AUDCIF',
      currency: 'FCFA',
      languages: ['Français']
    },
    {
      code: 'BF',
      name: 'Burkina Faso',
      flag: '🇧🇫',
      accountingSystem: 'SYSCOHADA AUDCIF',
      currency: 'FCFA',
      languages: ['Français']
    },
    {
      code: 'ML',
      name: 'Mali',
      flag: '🇲🇱',
      accountingSystem: 'SYSCOHADA AUDCIF',
      currency: 'FCFA',
      languages: ['Français']
    },
    {
      code: 'FR',
      name: 'France',
      flag: '🇫🇷',
      accountingSystem: 'PCG (En cours)',
      currency: 'EUR',
      languages: ['Français']
    },
    {
      code: 'US',
      name: 'États-Unis',
      flag: '🇺🇸',
      accountingSystem: 'GAAP (En cours)',
      currency: 'USD',
      languages: ['Anglais']
    }
  ];

  requiredDocuments = [
    {
      id: 'rccm',
      name: 'Registre du Commerce',
      description: 'Extrait du registre du commerce et du crédit mobilier',
      icon: '📋',
      status: 'pending',
      validationResult: null
    },
    {
      id: 'ifu',
      name: 'Numéro IFU',
      description: 'Identifiant fiscal unique',
      icon: '🏛️',
      status: 'pending',
      validationResult: null
    },
    {
      id: 'cnps',
      name: 'Numéro CNPS',
      description: 'Numéro de sécurité sociale',
      icon: '👥',
      status: 'pending',
      validationResult: null
    }
  ];

  subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 25000,
      currency: 'FCFA',
      features: [
        'Jusqu\'à 100 écritures/mois',
        'Dashboard basique',
        'Plan comptable AUDCIF',
        'Support email'
      ]
    },
    {
      id: 'professional',
      name: 'Professionnel',
      price: 45000,
      currency: 'FCFA',
      recommended: true,
      features: [
        'Écritures illimitées',
        'Assistant IA complet',
        'États financiers automatiques',
        'Multi-utilisateurs (5)',
        'Support prioritaire',
        'Rapprochements bancaires'
      ]
    },
    {
      id: 'enterprise',
      name: 'Entreprise',
      price: 85000,
      currency: 'FCFA',
      features: [
        'Tout du Professionnel',
        'Multi-entités',
        'API personnalisée',
        'Formation dédiée',
        'Support téléphonique',
        'Sauvegarde avancée'
      ]
    }
  ];

  constructor(private fb: FormBuilder) {
    this.companyForm = this.fb.group({
      companyName: ['', Validators.required],
      legalForm: ['', Validators.required],
      capital: [0],
      sector: ['', Validators.required],
      address: ['', Validators.required],
      phone: [''],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  progressPercentage = computed(() => {
    return (this.currentStep() - 1) * 33.33;
  });

  selectCountry(country: Country): void {
    this.selectedCountry.set(country);
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan.set(plan);
  }

  nextStep(): void {
    if (this.currentStep() < 4) {
      this.currentStep.update(step => step + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(false);
  }

  onDrop(event: DragEvent, docId: string): void {
    event.preventDefault();
    this.dragover.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0], docId);
    }
  }

  selectFile(docId: string): void {
    const input = document.getElementById(`file-${docId}`) as HTMLInputElement;
    input?.click();
  }

  onFileSelected(event: any, docId: string): void {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file, docId);
    }
  }

  processFile(file: File, docId: string): void {
    // Simulation de l'upload et validation IA
    const doc = this.requiredDocuments.find(d => d.id === docId);
    if (doc) {
      doc.status = 'validating';
      
      // Simulation validation IA
      setTimeout(() => {
        doc.status = 'valid';
        doc.validationResult = {
          valid: true,
          message: `${file.name} validé avec succès`
        };
      }, 2000);
    }
  }

  getStatusText(status: string): string {
    const statusTexts: Record<string, string> = {
      'pending': 'En attente',
      'validating': 'Validation...',
      'valid': 'Validé',
      'invalid': 'Invalide'
    };
    return statusTexts[status] || status;
  }

  allDocumentsValid(): boolean {
    return this.requiredDocuments.every(doc => doc.status === 'valid');
  }

  completeOnboarding(): void {
    console.log('Onboarding completed!', {
      country: this.selectedCountry(),
      company: this.companyForm.value,
      plan: this.selectedPlan()
    });
    
    // Redirection vers le dashboard
    alert('Inscription terminée ! Redirection vers votre tableau de bord...');
  }
}