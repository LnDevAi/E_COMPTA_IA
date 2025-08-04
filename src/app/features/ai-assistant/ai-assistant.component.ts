import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Document {
  id: string;
  name: string;
  type: 'FACTURE' | 'RECU' | 'RELEVE' | 'AUTRE';
  size: number;
  uploadDate: Date;
  status: 'PROCESSING' | 'PROCESSED' | 'ERROR';
  ocrData?: OCRData;
  generatedEntry?: GeneratedEntry;
}

interface OCRData {
  supplier?: string;
  client?: string;
  date?: Date;
  reference?: string;
  totalHT?: number;
  totalTTC?: number;
  tva?: number;
  items?: OCRItem[];
  confidence: number;
}

interface OCRItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface GeneratedEntry {
  id: string;
  journalCode: string;
  date: Date;
  reference: string;
  description: string;
  lines: GeneratedLine[];
  confidence: number;
  suggestions: string[];
  validationStatus: 'PENDING' | 'VALIDATED' | 'REJECTED';
}

interface GeneratedLine {
  accountCode: string;
  accountLabel: string;
  debit: number;
  credit: number;
  description: string;
  confidence: number;
}

interface AIChat {
  id: string;
  question: string;
  answer: string;
  type: 'QUESTION' | 'GENERATION' | 'VALIDATION' | 'CONSEIL';
  timestamp: Date;
  helpful?: boolean;
}

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  type: 'MANDATORY' | 'WARNING' | 'INFO';
  category: 'SYSCOHADA' | 'AUDCIF' | 'FISCALE';
  active: boolean;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="ai-container">
      <!-- Header avec statistiques -->
      <div class="ai-header">
        <div class="header-left">
          <h1 class="page-title">
            <i class="title-icon">🤖</i>
            Assistant IA Comptable
          </h1>
          <div class="ai-stats">
            <div class="stat-item">
              <span class="stat-value">{{ processedDocsCount() }}</span>
              <span class="stat-label">Documents traités</span>
            </div>
            <div class="stat-item success">
              <span class="stat-value">{{ generatedEntriesCount() }}</span>
              <span class="stat-label">Écritures générées</span>
            </div>
            <div class="stat-item info">
              <span class="stat-value">{{ averageConfidence() }}%</span>
              <span class="stat-label">Précision moyenne</span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button class="btn-secondary" (click)="showRulesModal = true">
            <i>⚙️</i> Règles
          </button>
          <button class="btn-secondary" (click)="showHistoryModal = true">
            <i>📊</i> Historique
          </button>
          <button class="btn-primary" (click)="activeTab.set('ocr')">
            <i>📄</i> Nouveau Document
          </button>
        </div>
      </div>

      <!-- Navigation par onglets -->
      <div class="main-content">
        <div class="content-tabs">
          <button class="tab-btn" 
                  [class.active]="activeTab() === 'chat'"
                  (click)="setActiveTab('chat')">
            <i>💬</i> Chat IA
          </button>
          <button class="tab-btn" 
                  [class.active]="activeTab() === 'ocr'"
                  (click)="setActiveTab('ocr')">
            <i>📄</i> OCR Documents
          </button>
          <button class="tab-btn" 
                  [class.active]="activeTab() === 'generation'"
                  (click)="setActiveTab('generation')">
            <i>✨</i> Génération
          </button>
          <button class="tab-btn" 
                  [class.active]="activeTab() === 'validation'"
                  (click)="setActiveTab('validation')">
            <i>✅</i> Validation
          </button>
        </div>

        <!-- Chat IA -->
        <div class="tab-content" *ngIf="activeTab() === 'chat'">
          <div class="chat-container">
            <div class="chat-messages">
              <div class="welcome-message" *ngIf="chatHistory().length === 0">
                <div class="ai-avatar">🤖</div>
                <div class="message-content">
                  <h3>Bonjour ! Je suis votre assistant IA comptable.</h3>
                  <p>Je peux vous aider avec :</p>
                  <ul>
                    <li>🔍 Questions sur SYSCOHADA et AUDCIF</li>
                    <li>📊 Génération d'écritures comptables</li>
                    <li>✅ Validation de vos saisies</li>
                    <li>💡 Conseils et bonnes pratiques</li>
                  </ul>
                  <div class="quick-actions">
                    <button class="quick-btn" (click)="askQuickQuestion('Comment comptabiliser une vente avec TVA ?')">
                      Vente avec TVA
                    </button>
                    <button class="quick-btn" (click)="askQuickQuestion('Quelles sont les règles AUDCIF pour les immobilisations ?')">
                      Règles AUDCIF
                    </button>
                    <button class="quick-btn" (click)="askQuickQuestion('Comment faire un rapprochement bancaire ?')">
                      Rapprochement
                    </button>
                  </div>
                </div>
              </div>

              <div *ngFor="let chat of chatHistory()" class="chat-message">
                <div class="message user-message">
                  <div class="message-avatar">👤</div>
                  <div class="message-content">
                    <div class="message-text">{{ chat.question }}</div>
                    <div class="message-time">{{ formatTime(chat.timestamp) }}</div>
                  </div>
                </div>

                <div class="message ai-message">
                  <div class="message-avatar">🤖</div>
                  <div class="message-content">
                    <div class="message-text" [innerHTML]="chat.answer"></div>
                    <div class="message-actions">
                      <span class="message-type">{{ getChatTypeLabel(chat.type) }}</span>
                      <div class="rating-buttons">
                        <button class="rating-btn" 
                                [class.active]="chat.helpful === true"
                                (click)="rateAnswer(chat.id, true)">
                          👍
                        </button>
                        <button class="rating-btn" 
                                [class.active]="chat.helpful === false"
                                (click)="rateAnswer(chat.id, false)">
                          👎
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="chat-input-container">
              <form [formGroup]="chatForm" (ngSubmit)="sendMessage()" class="chat-form">
                <div class="input-group">
                  <input type="text" 
                         formControlName="message" 
                         placeholder="Posez votre question comptable..."
                         class="chat-input">
                  <button type="submit" 
                          class="send-btn" 
                          [disabled]="!chatForm.valid || isProcessing()">
                    <i *ngIf="!isProcessing()">🚀</i>
                    <i *ngIf="isProcessing()" class="spinner">⏳</i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- OCR Documents -->
        <div class="tab-content" *ngIf="activeTab() === 'ocr'">
          <div class="ocr-section">
            <div class="upload-area">
              <div class="upload-zone" 
                   [class.dragover]="dragover()"
                   (dragover)="onDragOver($event)"
                   (dragleave)="onDragLeave($event)"
                   (drop)="onDrop($event)">
                <div class="upload-icon">📄</div>
                <h3>Glissez vos documents ici</h3>
                <p>Factures, reçus, relevés bancaires...</p>
                <p class="upload-formats">Formats: PDF, JPG, PNG (max 10MB)</p>
                <input type="file" 
                       #fileInput 
                       (change)="onFileSelected($event)"
                       accept=".pdf,.jpg,.jpeg,.png"
                       multiple
                       style="display: none;">
                <button class="btn-primary" (click)="fileInput.click()">
                  <i>📁</i> Choisir des fichiers
                </button>
              </div>
            </div>

            <div class="documents-list" *ngIf="documents().length > 0">
              <h3>Documents en traitement</h3>
              <div class="documents-grid">
                <div *ngFor="let doc of documents()" 
                     class="document-card"
                     [class.processing]="doc.status === 'PROCESSING'"
                     [class.processed]="doc.status === 'PROCESSED'"
                     [class.error]="doc.status === 'ERROR'">
                  
                  <div class="doc-header">
                    <div class="doc-icon">
                      <i *ngIf="doc.type === 'FACTURE'">🧾</i>
                      <i *ngIf="doc.type === 'RECU'">🧾</i>
                      <i *ngIf="doc.type === 'RELEVE'">🏦</i>
                      <i *ngIf="doc.type === 'AUTRE'">📄</i>
                    </div>
                    <div class="doc-info">
                      <div class="doc-name">{{ doc.name }}</div>
                      <div class="doc-meta">{{ formatFileSize(doc.size) }} • {{ formatDate(doc.uploadDate) }}</div>
                    </div>
                    <div class="doc-status">
                      <span class="status-badge" [class]="doc.status.toLowerCase()">
                        {{ getStatusLabel(doc.status) }}
                      </span>
                    </div>
                  </div>

                  <div class="doc-content" *ngIf="doc.status === 'PROCESSED' && doc.ocrData">
                    <div class="ocr-results">
                      <div class="confidence-bar">
                        <span class="confidence-label">Précision: {{ doc.ocrData.confidence }}%</span>
                        <div class="progress-bar">
                          <div class="progress-fill" 
                               [style.width.%]="doc.ocrData.confidence"
                               [class.high]="doc.ocrData.confidence >= 80"
                               [class.medium]="doc.ocrData.confidence >= 60 && doc.ocrData.confidence < 80"
                               [class.low]="doc.ocrData.confidence < 60">
                          </div>
                        </div>
                      </div>

                      <div class="extracted-data">
                        <div class="data-row" *ngIf="doc.ocrData.supplier">
                          <span class="data-label">Fournisseur:</span>
                          <span class="data-value">{{ doc.ocrData.supplier }}</span>
                        </div>
                        <div class="data-row" *ngIf="doc.ocrData.date">
                          <span class="data-label">Date:</span>
                          <span class="data-value">{{ formatDate(doc.ocrData.date) }}</span>
                        </div>
                        <div class="data-row" *ngIf="doc.ocrData.reference">
                          <span class="data-label">Référence:</span>
                          <span class="data-value">{{ doc.ocrData.reference }}</span>
                        </div>
                        <div class="data-row" *ngIf="doc.ocrData.totalTTC">
                          <span class="data-label">Total TTC:</span>
                          <span class="data-value amount">{{ formatCurrency(doc.ocrData.totalTTC) }}</span>
                        </div>
                      </div>

                      <div class="doc-actions">
                        <button class="btn-secondary" (click)="viewOCRDetails(doc)">
                          <i>👁️</i> Détails
                        </button>
                        <button class="btn-primary" (click)="generateEntryFromOCR(doc)">
                          <i>✨</i> Générer écriture
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="doc-content" *ngIf="doc.status === 'PROCESSING'">
                    <div class="processing-indicator">
                      <div class="spinner-large">⏳</div>
                      <p>Analyse en cours...</p>
                    </div>
                  </div>

                  <div class="doc-content" *ngIf="doc.status === 'ERROR'">
                    <div class="error-indicator">
                      <div class="error-icon">❌</div>
                      <p>Erreur lors du traitement</p>
                      <button class="btn-secondary" (click)="retryOCR(doc)">
                        <i>🔄</i> Réessayer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Génération d'écritures -->
        <div class="tab-content" *ngIf="activeTab() === 'generation'">
          <div class="generation-section">
            <div class="generation-methods">
              <h3>Méthodes de génération</h3>
              <div class="methods-grid">
                <div class="method-card" (click)="startTextGeneration()">
                  <div class="method-icon">💬</div>
                  <h4>Description textuelle</h4>
                  <p>Décrivez votre opération en français et l'IA génère l'écriture</p>
                </div>
                
                <div class="method-card" (click)="startTemplateGeneration()">
                  <div class="method-icon">📋</div>
                  <h4>À partir d'un modèle</h4>
                  <p>Sélectionnez un modèle et l'IA l'adapte à votre situation</p>
                </div>
                
                <div class="method-card" (click)="startSmartGeneration()">
                  <div class="method-icon">🧠</div>
                  <h4>Génération intelligente</h4>
                  <p>L'IA analyse vos habitudes et propose des écritures personnalisées</p>
                </div>
              </div>
            </div>

            <div class="generation-form" *ngIf="showGenerationForm()">
              <form [formGroup]="generationForm" class="form-container">
                <div class="form-group">
                  <label>Décrivez votre opération comptable</label>
                  <textarea formControlName="description" 
                            class="form-textarea"
                            placeholder="Ex: Vente de marchandises à crédit pour 1 000 000 FCFA HT avec TVA 18% au client SARL DISTRIBUTION"
                            rows="4"></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Type d'opération</label>
                    <select formControlName="operationType" class="form-select">
                      <option value="">Détecter automatiquement</option>
                      <option value="VENTE">Vente</option>
                      <option value="ACHAT">Achat</option>
                      <option value="PAIEMENT">Paiement</option>
                      <option value="ENCAISSEMENT">Encaissement</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Journal suggéré</label>
                    <select formControlName="journalCode" class="form-select">
                      <option value="">Auto-détection</option>
                      <option value="VE">Ventes</option>
                      <option value="AC">Achats</option>
                      <option value="BQ">Banque</option>
                      <option value="CA">Caisse</option>
                      <option value="OD">Opérations Diverses</option>
                    </select>
                  </div>
                </div>

                <div class="generation-actions">
                  <button type="button" class="btn-secondary" (click)="cancelGeneration()">
                    Annuler
                  </button>
                  <button type="button" 
                          class="btn-primary" 
                          (click)="generateEntry()"
                          [disabled]="!generationForm.valid || isGenerating()">
                    <i *ngIf="!isGenerating()">✨</i>
                    <i *ngIf="isGenerating()" class="spinner">⏳</i>
                    Générer l'écriture
                  </button>
                </div>
              </form>
            </div>

            <div class="generated-entries" *ngIf="generatedEntries().length > 0">
              <h3>Écritures générées</h3>
              <div class="entries-list">
                <div *ngFor="let entry of generatedEntries()" 
                     class="generated-entry-card">
                  
                  <div class="entry-header">
                    <div class="entry-info">
                      <h4>{{ entry.description }}</h4>
                      <div class="entry-meta">
                        {{ entry.journalCode }} • {{ formatDate(entry.date) }} • {{ entry.reference }}
                      </div>
                    </div>
                    <div class="confidence-indicator">
                      <span class="confidence-score" 
                            [class.high]="entry.confidence >= 80"
                            [class.medium]="entry.confidence >= 60"
                            [class.low]="entry.confidence < 60">
                        {{ entry.confidence }}%
                      </span>
                    </div>
                  </div>

                  <div class="entry-lines">
                    <div class="lines-header">
                      <span>Compte</span>
                      <span>Libellé</span>
                      <span>Débit</span>
                      <span>Crédit</span>
                    </div>
                    <div *ngFor="let line of entry.lines" class="entry-line">
                      <span class="account-code">{{ line.accountCode }}</span>
                      <span class="account-label">{{ line.accountLabel }}</span>
                      <span class="amount debit">{{ line.debit > 0 ? formatCurrency(line.debit) : '' }}</span>
                      <span class="amount credit">{{ line.credit > 0 ? formatCurrency(line.credit) : '' }}</span>
                    </div>
                  </div>

                  <div class="suggestions" *ngIf="entry.suggestions.length > 0">
                    <h5>💡 Suggestions d'amélioration</h5>
                    <ul>
                      <li *ngFor="let suggestion of entry.suggestions">{{ suggestion }}</li>
                    </ul>
                  </div>

                  <div class="entry-actions">
                    <button class="btn-secondary" (click)="editGeneratedEntry(entry)">
                      <i>✏️</i> Modifier
                    </button>
                    <button class="btn-secondary" (click)="regenerateEntry(entry)">
                      <i>🔄</i> Régénérer
                    </button>
                    <button class="btn-primary" (click)="acceptGeneratedEntry(entry)">
                      <i>✅</i> Accepter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Validation SYSCOHADA -->
        <div class="tab-content" *ngIf="activeTab() === 'validation'">
          <div class="validation-section">
            <div class="validation-controls">
              <div class="controls-header">
                <h3>Validation SYSCOHADA AUDCIF</h3>
                <button class="btn-primary" (click)="runFullValidation()">
                  <i>🔍</i> Lancer validation complète
                </button>
              </div>

              <div class="validation-filters">
                <select [(ngModel)]="validationFilter" class="filter-select">
                  <option value="ALL">Toutes les règles</option>
                  <option value="SYSCOHADA">SYSCOHADA uniquement</option>
                  <option value="AUDCIF">AUDCIF uniquement</option>
                  <option value="FISCALE">Règles fiscales</option>
                </select>
                
                <select [(ngModel)]="severityFilter" class="filter-select">
                  <option value="ALL">Tous les niveaux</option>
                  <option value="MANDATORY">Obligatoires</option>
                  <option value="WARNING">Avertissements</option>
                  <option value="INFO">Informations</option>
                </select>
              </div>
            </div>

            <div class="validation-results">
              <div class="validation-summary">
                <div class="summary-card error">
                  <div class="summary-number">{{ getValidationCount('ERROR') }}</div>
                  <div class="summary-label">Erreurs critiques</div>
                </div>
                <div class="summary-card warning">
                  <div class="summary-number">{{ getValidationCount('WARNING') }}</div>
                  <div class="summary-label">Avertissements</div>
                </div>
                <div class="summary-card info">
                  <div class="summary-number">{{ getValidationCount('INFO') }}</div>
                  <div class="summary-label">Informations</div>
                </div>
                <div class="summary-card success">
                  <div class="summary-number">{{ getValidationScore() }}%</div>
                  <div class="summary-label">Score conformité</div>
                </div>
              </div>

              <div class="validation-rules">
                <div *ngFor="let rule of getFilteredValidationRules()" 
                     class="validation-rule"
                     [class]="rule.type.toLowerCase()">
                  
                  <div class="rule-header">
                    <div class="rule-icon">
                      <i *ngIf="rule.type === 'MANDATORY'">❌</i>
                      <i *ngIf="rule.type === 'WARNING'">⚠️</i>
                      <i *ngIf="rule.type === 'INFO'">ℹ️</i>
                    </div>
                    <div class="rule-info">
                      <h4>{{ rule.name }}</h4>
                      <p>{{ rule.description }}</p>
                    </div>
                    <div class="rule-category">
                      <span class="category-badge" [class]="rule.category.toLowerCase()">
                        {{ rule.category }}
                      </span>
                    </div>
                  </div>

                  <div class="rule-actions">
                    <button class="btn-secondary" (click)="explainRule(rule)">
                      <i>💡</i> Expliquer
                    </button>
                    <button class="btn-secondary" (click)="fixRule(rule)">
                      <i>🔧</i> Corriger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal des règles de validation -->
    <div class="modal-overlay" *ngIf="showRulesModal" (click)="showRulesModal = false">
      <div class="modal-content large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>⚙️ Configuration des règles de validation</h3>
          <button class="modal-close" (click)="showRulesModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="rules-config">
            <div *ngFor="let rule of validationRules" class="rule-config">
              <div class="rule-toggle">
                <input type="checkbox" 
                       [id]="'rule-' + rule.id"
                       [(ngModel)]="rule.active">
                <label [for]="'rule-' + rule.id">{{ rule.name }}</label>
              </div>
              <div class="rule-description">{{ rule.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal historique -->
    <div class="modal-overlay" *ngIf="showHistoryModal" (click)="showHistoryModal = false">
      <div class="modal-content large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>📊 Historique des traitements IA</h3>
          <button class="modal-close" (click)="showHistoryModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="history-stats">
            <div class="stat-card">
              <div class="stat-number">{{ getTotalProcessedDocs() }}</div>
              <div class="stat-label">Documents traités</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ getTotalGeneratedEntries() }}</div>
              <div class="stat-label">Écritures générées</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ getAverageProcessingTime() }}s</div>
              <div class="stat-label">Temps moyen</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-container {
      padding: 24px;
      background: #f8fafc;
      min-height: 100vh;
    }

    .ai-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
    }

    .title-icon {
      font-size: 32px;
    }

    .ai-stats {
      display: flex;
      gap: 24px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 8px;
      min-width: 120px;
    }

    .stat-item.success {
      background: #dcfce7;
      color: #16a34a;
    }

    .stat-item.info {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
    }

    .stat-label {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn-primary, .btn-secondary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
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
      background: #9ca3af;
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

    .main-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .content-tabs {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 24px;
      border: none;
      background: none;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab-btn.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
      background: #f8fafc;
    }

    .tab-content {
      padding: 24px;
    }

    /* Chat styles */
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 600px;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .welcome-message {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .ai-avatar {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #dbeafe;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .message-content h3 {
      margin: 0 0 8px 0;
      color: #1e293b;
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .quick-btn {
      padding: 8px 12px;
      background: #e0e7ff;
      color: #3730a3;
      border: none;
      border-radius: 16px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .quick-btn:hover {
      background: #c7d2fe;
    }

    .chat-message {
      margin-bottom: 24px;
    }

    .message {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
    }

    .user-message {
      justify-content: flex-end;
    }

    .user-message .message-content {
      background: #3b82f6;
      color: white;
      border-radius: 18px 18px 4px 18px;
      padding: 12px 16px;
      max-width: 70%;
    }

    .ai-message .message-content {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 18px 18px 18px 4px;
      padding: 12px 16px;
      max-width: 80%;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-message .message-avatar {
      background: #3b82f6;
      color: white;
    }

    .ai-message .message-avatar {
      background: #dbeafe;
    }

    .message-time {
      font-size: 12px;
      color: rgba(255,255,255,0.7);
      margin-top: 4px;
    }

    .ai-message .message-time {
      color: #6b7280;
    }

    .message-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
    }

    .message-type {
      font-size: 12px;
      color: #6b7280;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .rating-buttons {
      display: flex;
      gap: 4px;
    }

    .rating-btn {
      padding: 4px 8px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .rating-btn:hover {
      background: #f1f5f9;
    }

    .rating-btn.active {
      background: #dbeafe;
    }

    .chat-input-container {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
    }

    .chat-form {
      display: flex;
    }

    .input-group {
      display: flex;
      width: 100%;
      gap: 8px;
    }

    .chat-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 24px;
      font-size: 16px;
    }

    .chat-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .send-btn {
      padding: 12px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .send-btn:hover:not(:disabled) {
      background: #2563eb;
    }

    .send-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* OCR styles */
    .upload-area {
      margin-bottom: 32px;
    }

    .upload-zone {
      border: 2px dashed #d1d5db;
      border-radius: 12px;
      padding: 48px 24px;
      text-align: center;
      transition: all 0.2s;
      background: #fafafa;
    }

    .upload-zone.dragover {
      border-color: #3b82f6;
      background: #f0f9ff;
    }

    .upload-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .upload-zone h3 {
      margin: 0 0 8px 0;
      color: #1e293b;
    }

    .upload-formats {
      color: #6b7280;
      font-size: 14px;
      margin: 8px 0 16px 0;
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .document-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s;
      background: white;
    }

    .document-card.processing {
      border-color: #f59e0b;
      background: #fffbeb;
    }

    .document-card.processed {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .document-card.error {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .doc-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .doc-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      border-radius: 8px;
    }

    .doc-info {
      flex: 1;
    }

    .doc-name {
      font-weight: 600;
      color: #1e293b;
    }

    .doc-meta {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.processing {
      background: #fef3c7;
      color: #d97706;
    }

    .status-badge.processed {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-badge.error {
      background: #fecaca;
      color: #dc2626;
    }

    .confidence-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .confidence-label {
      font-size: 14px;
      font-weight: 500;
      min-width: 100px;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .progress-fill.high {
      background: #10b981;
    }

    .progress-fill.medium {
      background: #f59e0b;
    }

    .progress-fill.low {
      background: #ef4444;
    }

    .extracted-data {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .data-row {
      display: flex;
      justify-content: space-between;
    }

    .data-label {
      font-weight: 500;
      color: #6b7280;
    }

    .data-value {
      color: #1e293b;
    }

    .data-value.amount {
      font-weight: 600;
      color: #059669;
    }

    .doc-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .processing-indicator, .error-indicator {
      text-align: center;
      padding: 20px;
    }

    .spinner-large {
      font-size: 32px;
      animation: spin 1s linear infinite;
      margin-bottom: 12px;
    }

    .error-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    /* Generation styles */
    .generation-methods {
      margin-bottom: 32px;
    }

    .methods-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-top: 16px;
    }

    .method-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .method-card:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .method-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .method-card h4 {
      margin: 0 0 8px 0;
      color: #1e293b;
    }

    .method-card p {
      color: #6b7280;
      margin: 0;
    }

    .generation-form {
      background: #f8fafc;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 32px;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-weight: 500;
      color: #374151;
    }

    .form-textarea, .form-select {
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
    }

    .form-textarea:focus, .form-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .generation-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .generated-entry-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      background: white;
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .entry-info h4 {
      margin: 0 0 4px 0;
      color: #1e293b;
    }

    .entry-meta {
      font-size: 14px;
      color: #6b7280;
    }

    .confidence-indicator {
      text-align: right;
    }

    .confidence-score {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .confidence-score.high {
      background: #dcfce7;
      color: #16a34a;
    }

    .confidence-score.medium {
      background: #fef3c7;
      color: #d97706;
    }

    .confidence-score.low {
      background: #fecaca;
      color: #dc2626;
    }

    .entry-lines {
      margin-bottom: 16px;
    }

    .lines-header {
      display: grid;
      grid-template-columns: 100px 2fr 120px 120px;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }

    .entry-line {
      display: grid;
      grid-template-columns: 100px 2fr 120px 120px;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .account-code {
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }

    .amount {
      text-align: right;
      font-weight: 600;
    }

    .amount.debit {
      color: #dc2626;
    }

    .amount.credit {
      color: #059669;
    }

    .suggestions {
      background: #f0f9ff;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .suggestions h5 {
      margin: 0 0 8px 0;
      color: #0c4a6e;
    }

    .suggestions ul {
      margin: 0;
      padding-left: 16px;
    }

    .suggestions li {
      color: #1e40af;
      margin-bottom: 4px;
    }

    .entry-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    /* Validation styles */
    .validation-controls {
      margin-bottom: 32px;
    }

    .controls-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .validation-filters {
      display: flex;
      gap: 16px;
    }

    .filter-select {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
    }

    .validation-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .summary-card {
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }

    .summary-card.error {
      background: #fef2f2;
      color: #dc2626;
    }

    .summary-card.warning {
      background: #fef3c7;
      color: #d97706;
    }

    .summary-card.info {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .summary-card.success {
      background: #dcfce7;
      color: #16a34a;
    }

    .summary-number {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .summary-label {
      font-size: 14px;
      opacity: 0.8;
    }

    .validation-rule {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .validation-rule.mandatory {
      border-left: 4px solid #dc2626;
      background: #fef2f2;
    }

    .validation-rule.warning {
      border-left: 4px solid #d97706;
      background: #fef3c7;
    }

    .validation-rule.info {
      border-left: 4px solid #1d4ed8;
      background: #dbeafe;
    }

    .rule-header {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .rule-icon {
      font-size: 20px;
    }

    .rule-info h4 {
      margin: 0 0 4px 0;
      color: #1e293b;
    }

    .rule-info p {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
    }

    .category-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .category-badge.syscohada {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .category-badge.audcif {
      background: #dcfce7;
      color: #16a34a;
    }

    .category-badge.fiscale {
      background: #fef3c7;
      color: #d97706;
    }

    .rule-actions {
      display: flex;
      gap: 8px;
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content.large {
      max-width: 900px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      color: #1e293b;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 4px;
    }

    .modal-body {
      padding: 24px;
    }

    .rule-config {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .rule-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .rule-toggle input[type="checkbox"] {
      width: 16px;
      height: 16px;
    }

    .rule-toggle label {
      font-weight: 500;
      cursor: pointer;
    }

    .rule-description {
      font-size: 14px;
      color: #6b7280;
      margin-left: 24px;
    }

    .history-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      text-align: center;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .ai-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header-left {
        flex-direction: column;
        gap: 16px;
      }

      .ai-stats {
        justify-content: space-around;
      }

      .header-actions {
        justify-content: center;
      }

      .methods-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .validation-summary {
        grid-template-columns: repeat(2, 1fr);
      }

      .lines-header, .entry-line {
        grid-template-columns: 1fr;
        gap: 4px;
      }

      .rule-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class AIAssistantComponent {
  // Signals pour l'état du composant
  activeTab = signal<'chat' | 'ocr' | 'generation' | 'validation'>('chat');
  dragover = signal(false);
  isProcessing = signal(false);
  isGenerating = signal(false);
  showRulesModal = signal(false);
  showHistoryModal = signal(false);
  showGenerationForm = signal(false);
  
  // Filtres de validation
  validationFilter = signal('ALL');
  severityFilter = signal('ALL');

  // Forms
  chatForm: FormGroup;
  generationForm: FormGroup;

  // Données de chat
  chatHistory = signal<AIChat[]>([]);

  // Documents OCR
  documents = signal<Document[]>([]);

  // Écritures générées
  generatedEntries = signal<GeneratedEntry[]>([]);

  // Règles de validation
  validationRules: ValidationRule[] = [
    {
      id: '1',
      name: 'Équilibre Débit/Crédit',
      description: 'Toute écriture doit être équilibrée (total débit = total crédit)',
      type: 'MANDATORY',
      category: 'SYSCOHADA',
      active: true
    },
    {
      id: '2',
      name: 'Comptes AUDCIF valides',
      description: 'Les comptes utilisés doivent exister dans le plan comptable AUDCIF',
      type: 'MANDATORY',
      category: 'AUDCIF',
      active: true
    },
    {
      id: '3',
      name: 'TVA cohérente',
      description: 'Le taux de TVA doit correspondre à la réglementation en vigueur',
      type: 'WARNING',
      category: 'FISCALE',
      active: true
    },
    {
      id: '4',
      name: 'Pièces justificatives',
      description: 'Chaque écriture doit avoir une référence de pièce justificative',
      type: 'WARNING',
      category: 'SYSCOHADA',
      active: true
    },
    {
      id: '5',
      name: 'Dates cohérentes',
      description: 'Les dates d\'écriture doivent être cohérentes avec l\'exercice comptable',
      type: 'INFO',
      category: 'AUDCIF',
      active: true
    }
  ];

  constructor(private fb: FormBuilder) {
    this.chatForm = this.fb.group({
      message: ['', Validators.required]
    });

    this.generationForm = this.fb.group({
      description: ['', Validators.required],
      operationType: [''],
      journalCode: ['']
    });

    // Simuler quelques documents traités
    this.documents.set([
      {
        id: '1',
        name: 'Facture_SARL_001.pdf',
        type: 'FACTURE',
        size: 245760,
        uploadDate: new Date('2024-01-20'),
        status: 'PROCESSED',
        ocrData: {
          supplier: 'SARL DISTRIBUTION PLUS',
          date: new Date('2024-01-20'),
          reference: 'FACT-2024-001',
          totalHT: 2500000,
          totalTTC: 2950000,
          tva: 450000,
          confidence: 92,
          items: [
            { description: 'Marchandises diverses', quantity: 1, unitPrice: 2500000, totalPrice: 2500000 }
          ]
        }
      },
      {
        id: '2',
        name: 'Recu_paiement_002.jpg',
        type: 'RECU',
        size: 156432,
        uploadDate: new Date('2024-01-21'),
        status: 'PROCESSING'
      }
    ]);
  }

  // Computed properties
  processedDocsCount = computed(() => 
    this.documents().filter(d => d.status === 'PROCESSED').length
  );

  generatedEntriesCount = computed(() => 
    this.generatedEntries().length
  );

  averageConfidence = computed(() => {
    const processed = this.documents().filter(d => d.status === 'PROCESSED' && d.ocrData);
    if (processed.length === 0) return 0;
    const total = processed.reduce((sum, d) => sum + (d.ocrData?.confidence || 0), 0);
    return Math.round(total / processed.length);
  });

  // Méthodes de navigation
  setActiveTab(tab: 'chat' | 'ocr' | 'generation' | 'validation'): void {
    this.activeTab.set(tab);
  }

  // Méthodes de chat
  sendMessage(): void {
    if (!this.chatForm.valid || this.isProcessing()) return;

    const message = this.chatForm.get('message')?.value;
    this.isProcessing.set(true);

    // Simuler la réponse de l'IA
    setTimeout(() => {
      const response = this.generateAIResponse(message);
      
      const newChat: AIChat = {
        id: Date.now().toString(),
        question: message,
        answer: response.answer,
        type: response.type,
        timestamp: new Date()
      };

      this.chatHistory.update(history => [...history, newChat]);
      this.chatForm.reset();
      this.isProcessing.set(false);
    }, 1500);
  }

  askQuickQuestion(question: string): void {
    this.chatForm.patchValue({ message: question });
    this.sendMessage();
  }

  generateAIResponse(question: string): { answer: string, type: AIChat['type'] } {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('vente') && lowerQuestion.includes('tva')) {
      return {
        answer: `<strong>Comptabilisation d'une vente avec TVA :</strong><br><br>
        Pour une vente de 1 000 000 FCFA HT avec TVA 18% :<br><br>
        <strong>Journal : VE (Ventes)</strong><br>
        • Débit 411000 - Clients : 1 180 000 FCFA<br>
        • Crédit 701000 - Ventes de marchandises : 1 000 000 FCFA<br>
        • Crédit 445700 - TVA collectée : 180 000 FCFA<br><br>
        <em>Principe SYSCOHADA : La TVA collectée est un passif envers l'État.</em>`,
        type: 'CONSEIL'
      };
    }
    
    if (lowerQuestion.includes('audcif') || lowerQuestion.includes('immobilisation')) {
      return {
        answer: `<strong>Règles AUDCIF pour les immobilisations :</strong><br><br>
        1. <strong>Seuil de comptabilisation :</strong> 500 000 FCFA minimum<br>
        2. <strong>Durée d'amortissement :</strong><br>
        • Constructions : 20-50 ans<br>
        • Matériel et outillage : 5-10 ans<br>
        • Matériel de transport : 4-5 ans<br>
        • Matériel informatique : 3-5 ans<br><br>
        3. <strong>Méthode :</strong> Amortissement linéaire obligatoire<br>
        4. <strong>Comptes :</strong> Classe 2 pour les immobilisations, Classe 28 pour les amortissements`,
        type: 'CONSEIL'
      };
    }
    
    if (lowerQuestion.includes('rapprochement')) {
      return {
        answer: `<strong>Procédure de rapprochement bancaire :</strong><br><br>
        1. <strong>Collecte des documents :</strong><br>
        • Relevé bancaire de la période<br>
        • Journal de banque comptable<br><br>
        2. <strong>Pointage :</strong><br>
        • Identifier les opérations communes<br>
        • Lister les écarts temporaires<br><br>
        3. <strong>Justification des écarts :</strong><br>
        • Chèques émis non encaissés<br>
        • Virements reçus non comptabilisés<br>
        • Frais bancaires<br><br>
        4. <strong>Régularisation :</strong> Passer les écritures d'ajustement nécessaires`,
        type: 'CONSEIL'
      };
    }

    return {
      answer: `Je comprends votre question sur "${question}". En tant qu'assistant IA comptable spécialisé SYSCOHADA AUDCIF, je peux vous aider avec :<br><br>
      • Questions sur les normes comptables<br>
      • Génération d'écritures automatiques<br>
      • Validation de conformité<br>
      • Conseils pratiques<br><br>
      Pouvez-vous préciser votre demande pour que je puisse vous donner une réponse plus détaillée ?`,
      type: 'QUESTION'
    };
  }

  rateAnswer(chatId: string, helpful: boolean): void {
    this.chatHistory.update(history => 
      history.map(chat => 
        chat.id === chatId ? { ...chat, helpful } : chat
      )
    );
  }

  // Méthodes OCR
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files));
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files));
    }
  }

  processFiles(files: File[]): void {
    files.forEach(file => {
      const document: Document = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: this.detectDocumentType(file.name),
        size: file.size,
        uploadDate: new Date(),
        status: 'PROCESSING'
      };

      this.documents.update(docs => [...docs, document]);

      // Simuler le traitement OCR
      setTimeout(() => {
        this.simulateOCRProcessing(document.id);
      }, 2000 + Math.random() * 3000);
    });
  }

  detectDocumentType(filename: string): Document['type'] {
    const lower = filename.toLowerCase();
    if (lower.includes('facture') || lower.includes('invoice')) return 'FACTURE';
    if (lower.includes('recu') || lower.includes('receipt')) return 'RECU';
    if (lower.includes('releve') || lower.includes('statement')) return 'RELEVE';
    return 'AUTRE';
  }

  simulateOCRProcessing(documentId: string): void {
    this.documents.update(docs => 
      docs.map(doc => {
        if (doc.id === documentId) {
          // Simuler succès ou échec
          const success = Math.random() > 0.1; // 90% de succès
          
          if (success) {
            return {
              ...doc,
              status: 'PROCESSED',
              ocrData: {
                supplier: 'ENTREPRISE EXEMPLE SARL',
                date: new Date(),
                reference: 'REF-' + Math.floor(Math.random() * 1000),
                totalHT: Math.floor(Math.random() * 5000000),
                totalTTC: Math.floor(Math.random() * 6000000),
                tva: Math.floor(Math.random() * 1000000),
                confidence: 70 + Math.floor(Math.random() * 30),
                items: [
                  {
                    description: 'Article exemple',
                    quantity: 1,
                    unitPrice: Math.floor(Math.random() * 1000000),
                    totalPrice: Math.floor(Math.random() * 1000000)
                  }
                ]
              }
            };
          } else {
            return { ...doc, status: 'ERROR' };
          }
        }
        return doc;
      })
    );
  }

  viewOCRDetails(document: Document): void {
    console.log('Viewing OCR details for:', document);
    // Ici on pourrait ouvrir une modal avec les détails complets
  }

  generateEntryFromOCR(document: Document): void {
    if (!document.ocrData) return;

    const generatedEntry: GeneratedEntry = {
      id: Date.now().toString(),
      journalCode: 'AC',
      date: document.ocrData.date || new Date(),
      reference: document.ocrData.reference || '',
      description: `Achat ${document.ocrData.supplier}`,
      confidence: document.ocrData.confidence,
      validationStatus: 'PENDING',
      suggestions: [
        'Vérifier le taux de TVA appliqué',
        'Confirmer le compte fournisseur',
        'Valider la date d\'opération'
      ],
      lines: [
        {
          accountCode: '601000',
          accountLabel: 'Achats de marchandises',
          debit: document.ocrData.totalHT || 0,
          credit: 0,
          description: 'Achat marchandises',
          confidence: 85
        },
        {
          accountCode: '445200',
          accountLabel: 'TVA déductible',
          debit: document.ocrData.tva || 0,
          credit: 0,
          description: 'TVA 18%',
          confidence: 90
        },
        {
          accountCode: '401000',
          accountLabel: 'Fournisseurs',
          debit: 0,
          credit: document.ocrData.totalTTC || 0,
          description: document.ocrData.supplier || 'Fournisseur',
          confidence: 80
        }
      ]
    };

    this.generatedEntries.update(entries => [...entries, generatedEntry]);
    this.setActiveTab('generation');
  }

  retryOCR(document: Document): void {
    this.documents.update(docs => 
      docs.map(doc => 
        doc.id === document.id ? { ...doc, status: 'PROCESSING' } : doc
      )
    );

    setTimeout(() => {
      this.simulateOCRProcessing(document.id);
    }, 1000);
  }

  // Méthodes de génération
  startTextGeneration(): void {
    this.showGenerationForm.set(true);
  }

  startTemplateGeneration(): void {
    alert('Génération à partir de modèles - Fonctionnalité en développement');
  }

  startSmartGeneration(): void {
    alert('Génération intelligente - Fonctionnalité en développement');
  }

  generateEntry(): void {
    if (!this.generationForm.valid || this.isGenerating()) return;

    this.isGenerating.set(true);
    const formValue = this.generationForm.value;

    // Simuler la génération par IA
    setTimeout(() => {
      const generatedEntry: GeneratedEntry = {
        id: Date.now().toString(),
        journalCode: formValue.journalCode || 'OD',
        date: new Date(),
        reference: 'AI-' + Date.now(),
        description: formValue.description,
        confidence: 75 + Math.floor(Math.random() * 20),
        validationStatus: 'PENDING',
        suggestions: [
          'Vérifier les comptes suggérés',
          'Confirmer les montants',
          'Valider la conformité AUDCIF'
        ],
        lines: this.generateEntryLines(formValue.description, formValue.operationType)
      };

      this.generatedEntries.update(entries => [...entries, generatedEntry]);
      this.generationForm.reset();
      this.showGenerationForm.set(false);
      this.isGenerating.set(false);
    }, 2000);
  }

  generateEntryLines(description: string, operationType: string): GeneratedLine[] {
    // Logique simplifiée de génération basée sur le type d'opération
    const lines: GeneratedLine[] = [];

    if (operationType === 'VENTE' || description.toLowerCase().includes('vente')) {
      lines.push(
        {
          accountCode: '411000',
          accountLabel: 'Clients',
          debit: 1180000,
          credit: 0,
          description: 'Vente marchandises',
          confidence: 85
        },
        {
          accountCode: '701000',
          accountLabel: 'Ventes de marchandises',
          debit: 0,
          credit: 1000000,
          description: 'Vente marchandises',
          confidence: 90
        },
        {
          accountCode: '445700',
          accountLabel: 'TVA collectée',
          debit: 0,
          credit: 180000,
          description: 'TVA 18%',
          confidence: 95
        }
      );
    } else {
      // Écriture générique
      lines.push(
        {
          accountCode: '512000',
          accountLabel: 'Banque',
          debit: 500000,
          credit: 0,
          description: 'Opération diverse',
          confidence: 70
        },
        {
          accountCode: '758000',
          accountLabel: 'Produits divers',
          debit: 0,
          credit: 500000,
          description: 'Opération diverse',
          confidence: 70
        }
      );
    }

    return lines;
  }

  cancelGeneration(): void {
    this.showGenerationForm.set(false);
    this.generationForm.reset();
  }

  editGeneratedEntry(entry: GeneratedEntry): void {
    console.log('Editing entry:', entry);
    // Ici on pourrait ouvrir un formulaire d'édition
  }

  regenerateEntry(entry: GeneratedEntry): void {
    console.log('Regenerating entry:', entry);
    // Ici on relancerait la génération
  }

  acceptGeneratedEntry(entry: GeneratedEntry): void {
    alert(`Écriture "${entry.description}" acceptée et ajoutée au journal ${entry.journalCode} !`);
    this.generatedEntries.update(entries => 
      entries.filter(e => e.id !== entry.id)
    );
  }

  // Méthodes de validation
  runFullValidation(): void {
    alert('Validation complète SYSCOHADA AUDCIF lancée - Analyse en cours...');
  }

  getFilteredValidationRules(): ValidationRule[] {
    let filtered = this.validationRules;

    if (this.validationFilter() !== 'ALL') {
      filtered = filtered.filter(rule => rule.category === this.validationFilter());
    }

    if (this.severityFilter() !== 'ALL') {
      filtered = filtered.filter(rule => rule.type === this.severityFilter());
    }

    return filtered.filter(rule => rule.active);
  }

  getValidationCount(type: string): number {
    const filtered = this.getFilteredValidationRules();
    return filtered.filter(rule => rule.type === type).length;
  }

  getValidationScore(): number {
    const total = this.validationRules.length;
    const passed = this.validationRules.filter(rule => rule.type !== 'MANDATORY').length;
    return Math.round((passed / total) * 100);
  }

  explainRule(rule: ValidationRule): void {
    alert(`Explication de la règle "${rule.name}":\n\n${rule.description}\n\nCatégorie: ${rule.category}`);
  }

  fixRule(rule: ValidationRule): void {
    alert(`Correction automatique pour "${rule.name}" - Fonctionnalité en développement`);
  }

  // Méthodes utilitaires
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PROCESSING': 'En cours',
      'PROCESSED': 'Traité',
      'ERROR': 'Erreur'
    };
    return labels[status] || status;
  }

  getChatTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'QUESTION': 'Question',
      'GENERATION': 'Génération',
      'VALIDATION': 'Validation',
      'CONSEIL': 'Conseil'
    };
    return labels[type] || type;
  }

  // Méthodes pour les modals
  getTotalProcessedDocs(): number {
    return this.documents().filter(d => d.status === 'PROCESSED').length;
  }

  getTotalGeneratedEntries(): number {
    return this.generatedEntries().length;
  }

  getAverageProcessingTime(): number {
    return 2.5; // Simulé
  }
}