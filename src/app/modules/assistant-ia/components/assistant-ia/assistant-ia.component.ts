import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { 
  AssistantIA,
  TraitementDocument,
  DocumentSource,
  ResultatOCR,
  AnalyseSemantique,
  EcritureGeneree,
  ValidationHumaine,
  StatistiquesAssistant,
  SessionApprentissage,
  TypeAssistant,
  StatutAssistant,
  TypeDocument,
  StatutTraitement,
  StatutValidation,
  TYPES_DOCUMENTS_SUPPORTES,
  FORMATS_IMAGES_ACCEPTES,
  SEUILS_CONFIANCE_DEFAUT
} from '../../models/assistant-ia.model';
import { AssistantIAService } from '../../services/assistant-ia.service';

@Component({
  selector: 'app-assistant-ia',
  templateUrl: './assistant-ia.component.html',
  styleUrls: ['./assistant-ia.component.scss']
})
export class AssistantIAComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Observables principaux
  assistants$: Observable<AssistantIA[]>;
  traitementsEnCours$: Observable<TraitementDocument[]>;
  documentsTraites$: Observable<TraitementDocument[]>;
  statistiques$: Observable<StatistiquesAssistant | null>;
  sessionsApprentissage$: Observable<SessionApprentissage[]>;

  // État de l'interface
  ongletActif: 'traitement' | 'resultats' | 'apprentissage' | 'statistiques' | 'configuration' = 'traitement';
  modeAffichage: 'simple' | 'avance' | 'expert' = 'simple';
  
  // État du traitement
  traitementEnCours = false;
  documentEnCours: TraitementDocument | null = null;
  etapeTraitement: 'upload' | 'ocr' | 'analyse' | 'generation' | 'validation' | 'termine' = 'upload';
  progresTraitement = 0;

  // Documents et drag & drop
  documentsEnAttente: File[] = [];
  dragActive = false;
  formatAcceptes = FORMATS_IMAGES_ACCEPTES;
  tailleMaxMo = 10;

  // Résultats et sélection
  documentSelectionne: TraitementDocument | null = null;
  zoneOCRSelectionnee: any = null;
  ligneEcritureSelectionnee: any = null;
  
  // Validation et feedback
  modeValidation: 'automatique' | 'manuel' = 'manuel';
  validationEnCours = false;
  feedbackUtilisateur: any = {};

  // Configuration et paramètres
  assistantPrincipal: AssistantIA | null = null;
  parametresAssistant: any = {};
  seuilConfiance = SEUILS_CONFIANCE_DEFAUT.OCR_MIN;
  apprentissageActif = true;

  // Statistiques et métriques
  statistiquesTempsReel: any = {
    documentsTraites: 0,
    tauxReussite: 0,
    tempsMoyen: 0,
    economieTemps: 0
  };

  // Apprentissage
  sessionApprentissageActive: SessionApprentissage | null = null;
  donneesApprentissage: any[] = [];
  performanceEvolution: any[] = [];

  // Messages et notifications
  messages: any[] = [];
  notificationsActives = true;

  // Données de référence
  typesDocuments = Object.values(TypeDocument);
  statutsTraitement = Object.values(StatutTraitement);
  statutsAssistant = Object.values(StatutAssistant);

  constructor(private assistantIAService: AssistantIAService) {
    this.assistants$ = this.assistantIAService.assistants$;
    this.traitementsEnCours$ = this.assistantIAService.traitementsEnCours$;
    this.documentsTraites$ = this.assistantIAService.documentsTraites$;
    this.statistiques$ = this.assistantIAService.statistiques$;
    this.sessionsApprentissage$ = this.assistantIAService.sessionsApprentissage$;
  }

  ngOnInit(): void {
    this.initialiserAssistant();
    this.configurerObservables();
    this.chargerStatistiques();
    this.configurerNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALISATION ====================

  private initialiserAssistant(): void {
    this.assistantIAService.initialiserAssistant()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assistant) => {
          this.assistantPrincipal = assistant;
          this.parametresAssistant = assistant.parametres;
          this.afficherMessage('Assistant IA initialisé avec succès', 'success');
        },
        error: (erreur) => {
          this.afficherMessage('Erreur lors de l\'initialisation de l\'assistant', 'error');
          console.error('Erreur initialisation:', erreur);
        }
      });
  }

  private configurerObservables(): void {
    // Surveiller les traitements en cours
    this.traitementsEnCours$
      .pipe(takeUntil(this.destroy$))
      .subscribe(traitements => {
        if (traitements.length > 0) {
          this.documentEnCours = traitements[0];
          this.mettreAJourProgresTraitement();
        }
      });

    // Surveiller les documents traités
    this.documentsTraites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(documents => {
        this.mettreAJourStatistiquesTempsReel(documents);
      });

    // Surveiller les sessions d'apprentissage
    this.sessionsApprentissage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(sessions => {
        const sessionActive = sessions.find(s => s.statut === 'EN_COURS');
        if (sessionActive) {
          this.sessionApprentissageActive = sessionActive;
        }
      });
  }

  private chargerStatistiques(): void {
    this.assistantIAService.getStatistiques()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        if (stats) {
          this.statistiquesTempsReel = {
            documentsTraites: stats.nombreDocumentsTraites,
            tauxReussite: stats.tauxReussiteOCR,
            tempsMoyen: stats.tempsTraitementMoyen / 1000, // Convertir en secondes
            economieTemps: stats.economieTemps
          };
        }
      });
  }

  private configurerNotifications(): void {
    // Configuration des notifications temps réel
    this.notificationsActives = true;
  }

  // ==================== GESTION DOCUMENTS ====================

  // Drag & Drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.ajouterFichiers(files);
  }

  // Sélection de fichiers
  onFileSelect(event: any): void {
    const files = Array.from(event.target.files || []);
    this.ajouterFichiers(files);
  }

  private ajouterFichiers(files: File[]): void {
    const fichiersValides = files.filter(file => this.validerFichier(file));
    
    if (fichiersValides.length > 0) {
      this.documentsEnAttente.push(...fichiersValides);
      this.afficherMessage(`${fichiersValides.length} fichier(s) ajouté(s)`, 'success');
      
      // Traitement automatique si mode simple
      if (this.modeAffichage === 'simple' && fichiersValides.length === 1) {
        this.traiterDocument(fichiersValides[0]);
      }
    }

    const fichiersRejetes = files.length - fichiersValides.length;
    if (fichiersRejetes > 0) {
      this.afficherMessage(`${fichiersRejetes} fichier(s) rejeté(s) (format ou taille non supporté)`, 'warning');
    }
  }

  private validerFichier(file: File): boolean {
    // Vérifier le format
    if (!this.formatAcceptes.includes(file.type)) {
      return false;
    }

    // Vérifier la taille (en Mo)
    const tailleMo = file.size / (1024 * 1024);
    if (tailleMo > this.tailleMaxMo) {
      return false;
    }

    return true;
  }

  // Traitement des documents
  traiterDocument(file: File): void {
    this.traitementEnCours = true;
    this.etapeTraitement = 'upload';
    this.progresTraitement = 0;

    this.assistantIAService.traiterDocument(file, {
      modeValidation: this.modeValidation,
      seuilConfiance: this.seuilConfiance
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.traitementEnCours = false;
        this.etapeTraitement = 'termine';
        this.progresTraitement = 100;
      })
    )
    .subscribe({
      next: (traitement) => {
        this.documentEnCours = traitement;
        this.documentSelectionne = traitement;
        this.afficherMessage('Document traité avec succès', 'success');
        
        // Passer à l'onglet résultats
        this.ongletActif = 'resultats';
        
        // Déclencher apprentissage si activé
        if (this.apprentissageActif && traitement.scoreConfiance >= 80) {
          this.declencherApprentissage(traitement);
        }
      },
      error: (erreur) => {
        this.afficherMessage('Erreur lors du traitement du document', 'error');
        console.error('Erreur traitement:', erreur);
      }
    });
  }

  traiterTousLesDocuments(): void {
    if (this.documentsEnAttente.length === 0) {
      this.afficherMessage('Aucun document en attente', 'info');
      return;
    }

    this.afficherMessage(`Traitement de ${this.documentsEnAttente.length} document(s) en cours...`, 'info');

    // Traiter les documents séquentiellement
    this.traiterDocumentsSequentiellement(this.documentsEnAttente, 0);
  }

  private traiterDocumentsSequentiellement(documents: File[], index: number): void {
    if (index >= documents.length) {
      this.afficherMessage('Tous les documents ont été traités', 'success');
      this.documentsEnAttente = [];
      return;
    }

    const document = documents[index];
    this.traiterDocument(document);

    // Attendre la fin du traitement avant de continuer
    setTimeout(() => {
      this.traiterDocumentsSequentiellement(documents, index + 1);
    }, 3000);
  }

  supprimerDocumentEnAttente(index: number): void {
    this.documentsEnAttente.splice(index, 1);
  }

  // ==================== VISUALISATION RÉSULTATS ====================

  selectionnerDocument(document: TraitementDocument): void {
    this.documentSelectionne = document;
    this.zoneOCRSelectionnee = null;
    this.ligneEcritureSelectionnee = null;
  }

  selectionnerZoneOCR(zone: any): void {
    this.zoneOCRSelectionnee = zone;
  }

  selectionnerLigneEcriture(ligne: any): void {
    this.ligneEcritureSelectionnee = ligne;
  }

  // Affichage des détails
  afficherDetailsOCR(): boolean {
    return this.documentSelectionne !== null && this.modeAffichage !== 'simple';
  }

  afficherDetailsAnalyse(): boolean {
    return this.documentSelectionne !== null && this.modeAffichage === 'expert';
  }

  afficherDetailsGeneration(): boolean {
    return this.documentSelectionne !== null && !!this.documentSelectionne.ecritureGeneree;
  }

  // ==================== VALIDATION ET FEEDBACK ====================

  ouvrirValidation(document: TraitementDocument): void {
    this.documentSelectionne = document;
    this.validationEnCours = true;
    this.feedbackUtilisateur = {
      document: document,
      modifications: [],
      commentaires: '',
      scoreQualite: 4
    };
  }

  validerDocument(): void {
    if (!this.documentSelectionne) return;

    this.assistantIAService.validerAvecHumain(
      this.documentSelectionne.id!,
      this.feedbackUtilisateur
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (validation) => {
        this.afficherMessage('Document validé avec succès', 'success');
        this.validationEnCours = false;
        
        // Déclencher apprentissage avec les données de validation
        if (this.apprentissageActif) {
          this.envoyerFeedbackApprentissage(validation);
        }
      },
      error: (erreur) => {
        this.afficherMessage('Erreur lors de la validation', 'error');
        console.error('Erreur validation:', erreur);
      }
    });
  }

  rejeterDocument(): void {
    if (!this.documentSelectionne) return;

    this.feedbackUtilisateur.statut = StatutValidation.REJETEE;
    this.validerDocument();
  }

  ajouterModification(champ: string, ancienneValeur: any, nouvelleValeur: any): void {
    this.feedbackUtilisateur.modifications.push({
      champ,
      valeurOriginale: ancienneValeur,
      nouvelleValeur: nouvelleValeur,
      justification: 'Correction manuelle',
      impact: 'MINEUR'
    });
  }

  // ==================== APPRENTISSAGE ====================

  declencherApprentissage(document: TraitementDocument): void {
    this.assistantIAService.declencherApprentissage(document)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (session) => {
          this.sessionApprentissageActive = session;
          this.afficherMessage('Session d\'apprentissage démarrée', 'info');
        },
        error: (erreur) => {
          console.error('Erreur apprentissage:', erreur);
        }
      });
  }

  envoyerFeedbackApprentissage(validation: ValidationHumaine): void {
    const feedback = {
      type: validation.statut === StatutValidation.VALIDEE ? 'VALIDATION_POSITIVE' : 'VALIDATION_NEGATIVE',
      donnees: validation,
      contexte: this.documentSelectionne?.analyseSemantique
    };

    this.assistantIAService.apprentissageTempsReel(feedback)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.afficherMessage('Feedback intégré dans l\'apprentissage', 'success');
        },
        error: (erreur) => {
          console.error('Erreur feedback:', erreur);
        }
      });
  }

  optimiserPerformances(): void {
    this.assistantIAService.optimiserPerformances()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (optimisations) => {
          this.afficherMessage('Performances optimisées', 'success');
          console.log('Optimisations:', optimisations);
        },
        error: (erreur) => {
          this.afficherMessage('Erreur lors de l\'optimisation', 'error');
          console.error('Erreur optimisation:', erreur);
        }
      });
  }

  // ==================== CONFIGURATION ====================

  changerModeValidation(mode: 'automatique' | 'manuel'): void {
    this.modeValidation = mode;
    this.sauvegarderConfiguration();
  }

  changerSeuilConfiance(seuil: number): void {
    this.seuilConfiance = seuil;
    this.sauvegarderConfiguration();
  }

  toggleApprentissage(): void {
    this.apprentissageActif = !this.apprentissageActif;
    this.sauvegarderConfiguration();
  }

  private sauvegarderConfiguration(): void {
    const config = {
      modeValidation: this.modeValidation,
      seuilConfiance: this.seuilConfiance,
      apprentissageActif: this.apprentissageActif
    };

    this.assistantIAService.configurerAssistant(config)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.afficherMessage('Configuration sauvegardée', 'success');
        },
        error: (erreur) => {
          this.afficherMessage('Erreur lors de la sauvegarde', 'error');
          console.error('Erreur config:', erreur);
        }
      });
  }

  // ==================== INTERFACE UTILISATEUR ====================

  changerOnglet(onglet: 'traitement' | 'resultats' | 'apprentissage' | 'statistiques' | 'configuration'): void {
    this.ongletActif = onglet;
  }

  changerModeAffichage(mode: 'simple' | 'avance' | 'expert'): void {
    this.modeAffichage = mode;
  }

  private mettreAJourProgresTraitement(): void {
    if (!this.documentEnCours) return;

    switch (this.documentEnCours.statut) {
      case StatutTraitement.EN_ATTENTE:
        this.etapeTraitement = 'upload';
        this.progresTraitement = 10;
        break;
      case StatutTraitement.OCR_EN_COURS:
        this.etapeTraitement = 'ocr';
        this.progresTraitement = 30;
        break;
      case StatutTraitement.ANALYSE_EN_COURS:
        this.etapeTraitement = 'analyse';
        this.progresTraitement = 50;
        break;
      case StatutTraitement.GENERATION_EN_COURS:
        this.etapeTraitement = 'generation';
        this.progresTraitement = 70;
        break;
      case StatutTraitement.ATTENTE_VALIDATION:
        this.etapeTraitement = 'validation';
        this.progresTraitement = 90;
        break;
      case StatutTraitement.TERMINE:
        this.etapeTraitement = 'termine';
        this.progresTraitement = 100;
        break;
    }
  }

  private mettreAJourStatistiquesTempsReel(documents: TraitementDocument[]): void {
    if (documents.length > 0) {
      const documentsReussis = documents.filter(d => d.scoreConfiance >= 80);
      const tempsTotal = documents.reduce((sum, d) => sum + d.tempsTraitement, 0);

      this.statistiquesTempsReel = {
        documentsTraites: documents.length,
        tauxReussite: (documentsReussis.length / documents.length) * 100,
        tempsMoyen: tempsTotal / documents.length / 1000, // En secondes
        economieTemps: documents.length * 0.5 // 30 minutes par document
      };
    }
  }

  // ==================== UTILITAIRES ====================

  getLibelleStatut(statut: StatutTraitement): string {
    const libelles = {
      [StatutTraitement.EN_ATTENTE]: 'En attente',
      [StatutTraitement.OCR_EN_COURS]: 'OCR en cours',
      [StatutTraitement.ANALYSE_EN_COURS]: 'Analyse en cours',
      [StatutTraitement.GENERATION_EN_COURS]: 'Génération en cours',
      [StatutTraitement.ATTENTE_VALIDATION]: 'Attente validation',
      [StatutTraitement.VALIDE]: 'Validé',
      [StatutTraitement.REJETE]: 'Rejeté',
      [StatutTraitement.ERREUR]: 'Erreur',
      [StatutTraitement.TERMINE]: 'Terminé'
    };
    return libelles[statut] || statut;
  }

  getCouleurStatut(statut: StatutTraitement): string {
    const couleurs = {
      [StatutTraitement.EN_ATTENTE]: '#9E9E9E',
      [StatutTraitement.OCR_EN_COURS]: '#2196F3',
      [StatutTraitement.ANALYSE_EN_COURS]: '#FF9800',
      [StatutTraitement.GENERATION_EN_COURS]: '#9C27B0',
      [StatutTraitement.ATTENTE_VALIDATION]: '#FF5722',
      [StatutTraitement.VALIDE]: '#4CAF50',
      [StatutTraitement.REJETE]: '#F44336',
      [StatutTraitement.ERREUR]: '#F44336',
      [StatutTraitement.TERMINE]: '#4CAF50'
    };
    return couleurs[statut] || '#666';
  }

  getCouleurConfiance(confiance: number): string {
    if (confiance >= 90) return '#4CAF50';
    if (confiance >= 80) return '#8BC34A';
    if (confiance >= 70) return '#FF9800';
    if (confiance >= 60) return '#FF5722';
    return '#F44336';
  }

  formaterTaille(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formaterDuree(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  }

  formaterPourcentage(valeur: number): string {
    return `${Math.round(valeur)}%`;
  }

  exporterResultats(): void {
    if (!this.documentSelectionne) return;

    const resultats = {
      document: this.documentSelectionne.documentOriginal.nom,
      ocr: this.documentSelectionne.resultatOCR,
      analyse: this.documentSelectionne.analyseSemantique,
      ecriture: this.documentSelectionne.ecritureGeneree,
      validation: this.documentSelectionne.validationHumaine
    };

    const dataStr = JSON.stringify(resultats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `assistant-ia-resultats-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  private afficherMessage(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.messages.push({
      id: Date.now(),
      texte: message,
      type: type,
      date: new Date()
    });

    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
      this.messages = this.messages.filter(m => m.id !== this.messages[this.messages.length - 1]?.id);
    }, 5000);

    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  supprimerMessage(messageId: number): void {
    this.messages = this.messages.filter(m => m.id !== messageId);
  }

  // Getters pour l'interface
  get peutTraiter(): boolean {
    return this.documentsEnAttente.length > 0 && !this.traitementEnCours;
  }

  get assistantPret(): boolean {
    return this.assistantPrincipal?.statut === StatutAssistant.PRET;
  }

  get nombreDocumentsTraites(): number {
    return this.statistiquesTempsReel.documentsTraites;
  }

  get tauxReussiteGlobal(): number {
    return this.statistiquesTempsReel.tauxReussite;
  }

  get economieTempsGlobale(): number {
    return this.statistiquesTempsReel.economieTemps;
  }
}