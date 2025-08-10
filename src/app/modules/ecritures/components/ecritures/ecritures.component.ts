import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith, debounceTime } from 'rxjs/operators';
import { 
  EcritureComptable,
  LigneEcriture,
  JournalComptable,
  TemplateEcriture,
  ValidationEcritureIA,
  StatistiquesSaisie,
  DocumentJoint,
  TypeEcriture,
  StatutEcriture,
  OrigineEcriture,
  TypeJournal,
  NiveauRisque,
  JOURNAUX_SYSCOHADA_DEFAUT
} from '../../models/ecriture.model';
import { EcritureService } from '../../services/ecriture.service';

@Component({
  selector: 'app-ecritures',
  templateUrl: './ecritures.component.html',
  styleUrls: ['./ecritures.component.scss']
})
export class EcrituresComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Données principales
  ecritures$: Observable<EcritureComptable[]>;
  ecrituresAffichees$: Observable<EcritureComptable[]>;
  journaux$: Observable<JournalComptable[]>;
  templates$: Observable<TemplateEcriture[]>;
  statistiques$: Observable<StatistiquesSaisie | null>;

  // État de l'interface
  modeAffichage: 'liste' | 'saisie' | 'template' | 'brouillons' = 'liste';
  ongletActif: 'ecritures' | 'templates' | 'statistiques' | 'validation' = 'ecritures';
  
  // Formulaires
  formulaireRecherche: FormGroup;
  formulaireEcriture: FormGroup;
  formulaireLigne: FormGroup;
  formulaireTemplate: FormGroup;

  // Modales et état
  modalNouvelleEcritureOuvert = false;
  modalTemplateOuvert = false;
  modalValidationOuvert = false;
  modalDocumentsOuvert = false;
  chargementEnCours = false;
  saisieGuideeActive = true;
  
  // Sélection et données
  ecritureSelectionnee: EcritureComptable | null = null;
  ligneSelectionnee: LigneEcriture | null = null;
  templateSelectionne: TemplateEcriture | null = null;
  validationEnCours: ValidationEcritureIA | null = null;
  documentsJoints: DocumentJoint[] = [];
  
  // Données de référence
  typesEcriture = Object.values(TypeEcriture);
  statutsEcriture = Object.values(StatutEcriture);
  originesEcriture = Object.values(OrigineEcriture);
  typesJournal = Object.values(TypeJournal);
  
  // Configuration saisie guidée
  etapeSaisie: 'journal' | 'entete' | 'lignes' | 'controles' | 'validation' = 'journal';
  progresEtapes = {
    journal: 20,
    entete: 40,
    lignes: 60,
    controles: 80,
    validation: 100
  };

  // Statistiques temps réel
  nombreEcritures = 0;
  nombreBrouillons = 0;
  nombreValidees = 0;
  montantTotal = 0;
  tauxErreurs = 0;

  // Contrôles et suggestions
  erreursEnCours: any[] = [];
  suggestionsDisponibles: any[] = [];
  assistantActif = false;

  // Templates et raccourcis
  templatesFavoris: TemplateEcriture[] = [];
  raccourcisClavier = {
    'Ctrl+N': 'Nouvelle écriture',
    'Ctrl+S': 'Sauvegarder',
    'Ctrl+V': 'Valider',
    'Ctrl+T': 'Template',
    'F1': 'Aide'
  };

  constructor(
    private ecritureService: EcritureService,
    private formBuilder: FormBuilder
  ) {
    this.ecritures$ = this.ecritureService.ecritures$;
    this.journaux$ = this.ecritureService.journaux$;
    this.templates$ = this.ecritureService.templates$;
    this.statistiques$ = this.ecritureService.statistiques$;

    this.formulaireRecherche = this.formBuilder.group({
      query: [''],
      journal: [''],
      statut: [''],
      dateDebut: [''],
      dateFin: [''],
      montantMin: [0],
      montantMax: [10000000],
      reference: ['']
    });

    this.formulaireEcriture = this.formBuilder.group({
      libelle: ['', [Validators.required, Validators.minLength(3)]],
      date: [new Date(), Validators.required],
      dateEcheance: [''],
      dateValeur: [''],
      journal: ['', Validators.required],
      typeEcriture: [TypeEcriture.STANDARD, Validators.required],
      reference: [''],
      numeropiece: [''],
      notes: [''],
      lignes: this.formBuilder.array([])
    });

    this.formulaireLigne = this.formBuilder.group({
      compteComptable: ['', Validators.required],
      libelle: ['', [Validators.required, Validators.minLength(2)]],
      montantDebit: [0, [Validators.min(0)]],
      montantCredit: [0, [Validators.min(0)]],
      tiersId: [''],
      tiersNom: [''],
      reference: [''],
      dateEcheance: [''],
      notes: ['']
    });

    this.formulaireTemplate = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      partage: [false],
      favoris: [false]
    });
  }

  ngOnInit(): void {
    this.configurerFiltresEcritures();
    this.configurerFormulaires();
    this.chargerStatistiques();
    this.chargerTemplatesFavoris();
    this.initialiserAssistant();
    this.configurerRaccourcisClavier();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== CONFIGURATION ====================

  private configurerFiltresEcritures(): void {
    this.ecrituresAffichees$ = combineLatest([
      this.ecritures$,
      this.formulaireRecherche.valueChanges.pipe(
        startWith(this.formulaireRecherche.value),
        debounceTime(300)
      )
    ]).pipe(
      map(([ecritures, filtres]) => {
        let resultats = [...ecritures];

        // Filtres de recherche
        if (filtres.query) {
          const query = filtres.query.toLowerCase();
          resultats = resultats.filter(e => 
            e.libelle.toLowerCase().includes(query) ||
            e.numero.toLowerCase().includes(query) ||
            e.reference?.toLowerCase().includes(query)
          );
        }

        if (filtres.journal) {
          resultats = resultats.filter(e => e.journal.code === filtres.journal);
        }

        if (filtres.statut) {
          resultats = resultats.filter(e => e.statut === filtres.statut);
        }

        if (filtres.dateDebut) {
          const dateDebut = new Date(filtres.dateDebut);
          resultats = resultats.filter(e => e.date >= dateDebut);
        }

        if (filtres.dateFin) {
          const dateFin = new Date(filtres.dateFin);
          resultats = resultats.filter(e => e.date <= dateFin);
        }

        if (filtres.montantMin > 0) {
          resultats = resultats.filter(e => e.totalDebit >= filtres.montantMin);
        }

        if (filtres.montantMax < 10000000) {
          resultats = resultats.filter(e => e.totalDebit <= filtres.montantMax);
        }

        if (filtres.reference) {
          resultats = resultats.filter(e => 
            e.reference?.toLowerCase().includes(filtres.reference.toLowerCase())
          );
        }

        return resultats.sort((a, b) => b.date.getTime() - a.date.getTime());
      })
    );
  }

  private configurerFormulaires(): void {
    // Auto-validation en temps réel
    this.formulaireEcriture.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500)
      )
      .subscribe(() => {
        if (this.ecritureSelectionnee && this.saisieGuideeActive) {
          this.validerEcritureTempsReel();
        }
      });

    // Validation des lignes en temps réel
    this.formulaireLigne.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300)
      )
      .subscribe(() => {
        this.validerLigneTempsReel();
      });

    // Auto-complétion libellé selon le compte
    this.formulaireLigne.get('compteComptable')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(compte => {
        if (compte && !this.formulaireLigne.get('libelle')?.value) {
          const libelleSuggere = this.suggererLibelleParCompte(compte);
          if (libelleSuggere) {
            this.formulaireLigne.patchValue({ libelle: libelleSuggere }, { emitEvent: false });
          }
        }
      });
  }

  private chargerStatistiques(): void {
    this.statistiques$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        if (stats) {
          this.nombreEcritures = stats.nombreEcritures;
          this.montantTotal = stats.montantTotalDebits;
          this.tauxErreurs = stats.tauxErreurs;
        }
      });

    this.ecritures$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ecritures => {
        this.nombreBrouillons = ecritures.filter(e => e.statut === StatutEcriture.BROUILLON).length;
        this.nombreValidees = ecritures.filter(e => e.statut === StatutEcriture.VALIDEE).length;
      });
  }

  private chargerTemplatesFavoris(): void {
    this.templates$
      .pipe(takeUntil(this.destroy$))
      .subscribe(templates => {
        this.templatesFavoris = templates.filter(t => t.favoris || t.utilisationFrequente);
      });
  }

  private initialiserAssistant(): void {
    // Configuration de l'assistant IA
    this.assistantActif = true;
  }

  private configurerRaccourcisClavier(): void {
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            this.ouvrirSaisieGuidee();
            break;
          case 's':
            event.preventDefault();
            this.sauvegarderEcriture();
            break;
          case 'v':
            event.preventDefault();
            this.validerEcritureSelectionnee();
            break;
          case 't':
            event.preventDefault();
            this.ouvrirModalTemplate();
            break;
        }
      } else if (event.key === 'F1') {
        event.preventDefault();
        this.afficherAide();
      }
    });
  }

  // ==================== SAISIE GUIDÉE ====================

  ouvrirSaisieGuidee(): void {
    this.modeAffichage = 'saisie';
    this.etapeSaisie = 'journal';
    this.ecritureSelectionnee = null;
    this.reinitialiserFormulaires();
    this.saisieGuideeActive = true;
  }

  etapeSuivante(): void {
    switch (this.etapeSaisie) {
      case 'journal':
        if (this.formulaireEcriture.get('journal')?.valid) {
          this.etapeSaisie = 'entete';
        }
        break;
      case 'entete':
        if (this.formulaireEcriture.get('libelle')?.valid) {
          this.etapeSaisie = 'lignes';
          this.initialiserPremiereLigne();
        }
        break;
      case 'lignes':
        if (this.getLignesFormArray().length >= 2 && this.verifierEquilibre()) {
          this.etapeSaisie = 'controles';
          this.executerControles();
        }
        break;
      case 'controles':
        if (this.erreursEnCours.length === 0) {
          this.etapeSaisie = 'validation';
          this.finaliserEcriture();
        }
        break;
    }
  }

  etapePrecedente(): void {
    switch (this.etapeSaisie) {
      case 'entete':
        this.etapeSaisie = 'journal';
        break;
      case 'lignes':
        this.etapeSaisie = 'entete';
        break;
      case 'controles':
        this.etapeSaisie = 'lignes';
        break;
      case 'validation':
        this.etapeSaisie = 'controles';
        break;
    }
  }

  private initialiserPremiereLigne(): void {
    this.ajouterLigneFormulaire();
  }

  // ==================== GESTION ÉCRITURES ====================

  creerEcriture(): void {
    if (this.formulaireEcriture.valid) {
      this.chargementEnCours = true;
      
      const donneesEcriture = this.formulaireEcriture.value;
      donneesEcriture.lignes = this.getLignesFormArray().value;
      
      this.ecritureService.creerEcriture(donneesEcriture)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (ecriture) => {
            this.chargementEnCours = false;
            this.ecritureSelectionnee = ecriture;
            this.afficherMessage('Écriture créée avec succès', 'success');
            this.modeAffichage = 'liste';
          },
          error: (erreur) => {
            this.chargementEnCours = false;
            this.afficherMessage('Erreur lors de la création', 'error');
            console.error('Erreur:', erreur);
          }
        });
    }
  }

  selectionnerEcriture(ecriture: EcritureComptable): void {
    this.ecritureSelectionnee = ecriture;
    this.chargerEcritureDansFormulaire(ecriture);
    
    // Validation automatique
    this.ecritureService.validerEcritureAvecIA(ecriture)
      .pipe(takeUntil(this.destroy$))
      .subscribe(validation => {
        this.validationEnCours = validation;
        this.erreursEnCours = validation.anomalies;
        this.suggestionsDisponibles = validation.suggestions;
      });
  }

  modifierEcriture(): void {
    if (this.ecritureSelectionnee && this.formulaireEcriture.valid) {
      this.chargementEnCours = true;
      
      const modifications = this.formulaireEcriture.value;
      modifications.lignes = this.getLignesFormArray().value;
      
      this.ecritureService.modifierEcriture(this.ecritureSelectionnee.id!, modifications)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (ecriture) => {
            this.chargementEnCours = false;
            this.ecritureSelectionnee = ecriture;
            this.afficherMessage('Écriture modifiée avec succès', 'success');
          },
          error: (erreur) => {
            this.chargementEnCours = false;
            this.afficherMessage('Erreur lors de la modification', 'error');
            console.error('Erreur:', erreur);
          }
        });
    }
  }

  supprimerEcriture(ecriture: EcritureComptable): void {
    if (confirm(`Supprimer l'écriture ${ecriture.numero} ?`)) {
      this.chargementEnCours = true;
      
      this.ecritureService.supprimerEcriture(ecriture.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.chargementEnCours = false;
            this.ecritureSelectionnee = null;
            this.afficherMessage('Écriture supprimée', 'success');
          },
          error: (erreur) => {
            this.chargementEnCours = false;
            this.afficherMessage('Erreur lors de la suppression', 'error');
            console.error('Erreur:', erreur);
          }
        });
    }
  }

  dupliquerEcriture(ecriture: EcritureComptable): void {
    const ecritureDupliquee = {
      ...ecriture,
      libelle: `Copie de ${ecriture.libelle}`,
      date: new Date(),
      origineEcriture: OrigineEcriture.DUPLICATION,
      lignes: ecriture.lignes.map(ligne => ({
        ...ligne,
        id: undefined,
        ecritureId: undefined
      }))
    };

    this.ecritureService.creerEcriture(ecritureDupliquee)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (nouvelleEcriture) => {
          this.selectionnerEcriture(nouvelleEcriture);
          this.afficherMessage('Écriture dupliquée', 'success');
        },
        error: (erreur) => {
          this.afficherMessage('Erreur lors de la duplication', 'error');
          console.error('Erreur:', erreur);
        }
      });
  }

  // ==================== GESTION LIGNES ====================

  getLignesFormArray(): FormArray {
    return this.formulaireEcriture.get('lignes') as FormArray;
  }

  ajouterLigneFormulaire(): void {
    const nouvelleLigne = this.formBuilder.group({
      compteComptable: ['', Validators.required],
      libelle: ['', [Validators.required, Validators.minLength(2)]],
      montantDebit: [0, [Validators.min(0)]],
      montantCredit: [0, [Validators.min(0)]],
      tiersId: [''],
      tiersNom: [''],
      reference: [''],
      dateEcheance: ['']
    });

    this.getLignesFormArray().push(nouvelleLigne);
  }

  supprimerLigneFormulaire(index: number): void {
    if (this.getLignesFormArray().length > 1) {
      this.getLignesFormArray().removeAt(index);
    }
  }

  equilibrerEcriture(): void {
    const lignes = this.getLignesFormArray();
    const totalDebit = lignes.controls.reduce((sum, ligne) => 
      sum + (ligne.get('montantDebit')?.value || 0), 0);
    const totalCredit = lignes.controls.reduce((sum, ligne) => 
      sum + (ligne.get('montantCredit')?.value || 0), 0);

    const ecart = totalDebit - totalCredit;
    
    if (ecart !== 0) {
      // Ajouter une ligne d'équilibrage
      this.ajouterLigneFormulaire();
      const derniereLigne = lignes.at(lignes.length - 1);
      
      if (ecart > 0) {
        // Plus de débits, ajouter un crédit
        derniereLigne.patchValue({
          libelle: 'Équilibrage automatique',
          montantCredit: ecart,
          montantDebit: 0
        });
      } else {
        // Plus de crédits, ajouter un débit
        derniereLigne.patchValue({
          libelle: 'Équilibrage automatique',
          montantDebit: Math.abs(ecart),
          montantCredit: 0
        });
      }
    }
  }

  private verifierEquilibre(): boolean {
    const lignes = this.getLignesFormArray();
    const totalDebit = lignes.controls.reduce((sum, ligne) => 
      sum + (ligne.get('montantDebit')?.value || 0), 0);
    const totalCredit = lignes.controls.reduce((sum, ligne) => 
      sum + (ligne.get('montantCredit')?.value || 0), 0);

    return Math.abs(totalDebit - totalCredit) < 0.01;
  }

  // ==================== TEMPLATES ====================

  ouvrirModalTemplate(): void {
    this.modalTemplateOuvert = true;
  }

  fermerModalTemplate(): void {
    this.modalTemplateOuvert = false;
    this.templateSelectionne = null;
  }

  utiliserTemplate(template: TemplateEcriture): void {
    const variables = this.demanderVariablesTemplate(template);
    
    this.ecritureService.creerDepuisTemplate(template.id, variables)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ecriture) => {
          this.selectionnerEcriture(ecriture);
          this.chargerEcritureDansFormulaire(ecriture);
          this.modeAffichage = 'saisie';
          this.fermerModalTemplate();
          this.afficherMessage(`Écriture créée depuis le template "${template.nom}"`, 'success');
        },
        error: (erreur) => {
          this.afficherMessage('Erreur lors de l\'utilisation du template', 'error');
          console.error('Erreur:', erreur);
        }
      });
  }

  sauvegarderCommeTemplate(): void {
    if (this.ecritureSelectionnee && this.formulaireTemplate.valid) {
      const donneesTemplate = this.formulaireTemplate.value;
      
      this.ecritureService.sauvegarderCommeTemplate(
        this.ecritureSelectionnee.id!,
        donneesTemplate.nom,
        donneesTemplate.description
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (template) => {
          this.afficherMessage('Template créé avec succès', 'success');
          this.formulaireTemplate.reset();
        },
        error: (erreur) => {
          this.afficherMessage('Erreur lors de la création du template', 'error');
          console.error('Erreur:', erreur);
        }
      });
    }
  }

  private demanderVariablesTemplate(template: TemplateEcriture): any {
    // Simulation - dans un vrai système, ouvrir une modale
    return {
      montant: 100000,
      tva: 18000,
      fournisseur: 'FOURNISSEUR ABC'
    };
  }

  // ==================== VALIDATION ====================

  validerEcritureSelectionnee(): void {
    if (this.ecritureSelectionnee) {
      this.chargementEnCours = true;
      
      this.ecritureService.validerEcriture(this.ecritureSelectionnee.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (ecriture) => {
            this.chargementEnCours = false;
            this.ecritureSelectionnee = ecriture;
            this.afficherMessage('Écriture validée', 'success');
          },
          error: (erreur) => {
            this.chargementEnCours = false;
            this.afficherMessage('Erreur lors de la validation', 'error');
            console.error('Erreur:', erreur);
          }
        });
    }
  }

  comptabiliserEcriture(ecriture: EcritureComptable): void {
    if (confirm(`Comptabiliser l'écriture ${ecriture.numero} ? Cette action est irréversible.`)) {
      this.chargementEnCours = true;
      
      this.ecritureService.comptabiliserEcriture(ecriture.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (ecritureComptabilisee) => {
            this.chargementEnCours = false;
            this.ecritureSelectionnee = ecritureComptabilisee;
            this.afficherMessage('Écriture comptabilisée', 'success');
          },
          error: (erreur) => {
            this.chargementEnCours = false;
            this.afficherMessage('Erreur lors de la comptabilisation', 'error');
            console.error('Erreur:', erreur);
          }
        });
    }
  }

  private validerEcritureTempsReel(): void {
    if (this.ecritureSelectionnee) {
      // Construire l'écriture depuis le formulaire
      const ecritureTempo = {
        ...this.ecritureSelectionnee,
        ...this.formulaireEcriture.value,
        lignes: this.getLignesFormArray().value
      };

      this.ecritureService.validerEcritureAvecIA(ecritureTempo)
        .pipe(takeUntil(this.destroy$))
        .subscribe(validation => {
          this.validationEnCours = validation;
          this.erreursEnCours = validation.anomalies;
          this.suggestionsDisponibles = validation.suggestions;
        });
    }
  }

  private validerLigneTempsReel(): void {
    const ligne = this.formulaireLigne.value;
    
    // Validation simple de la ligne
    const erreurs = [];
    
    if (ligne.montantDebit > 0 && ligne.montantCredit > 0) {
      erreurs.push('Une ligne ne peut avoir à la fois un montant débit ET crédit');
    }
    
    if (ligne.montantDebit === 0 && ligne.montantCredit === 0) {
      erreurs.push('Une ligne doit avoir soit un montant débit, soit un montant crédit');
    }
    
    // Affichage des erreurs (simulation)
    if (erreurs.length > 0) {
      console.warn('Erreurs ligne:', erreurs);
    }
  }

  private executerControles(): void {
    this.chargementEnCours = true;
    
    // Simuler des contrôles
    setTimeout(() => {
      this.chargementEnCours = false;
      this.erreursEnCours = [];
      
      // Vérifier équilibre
      if (!this.verifierEquilibre()) {
        this.erreursEnCours.push({
          type: 'EQUILIBRE',
          message: 'L\'écriture n\'est pas équilibrée',
          gravite: 'BLOQUANTE'
        });
      }
      
      // Vérifier comptes
      const lignes = this.getLignesFormArray().value;
      lignes.forEach((ligne: any, index: number) => {
        if (!ligne.compteComptable) {
          this.erreursEnCours.push({
            type: 'COMPTE_MANQUANT',
            message: `Ligne ${index + 1}: Compte comptable requis`,
            gravite: 'BLOQUANTE'
          });
        }
      });
    }, 1000);
  }

  private finaliserEcriture(): void {
    this.creerEcriture();
  }

  // ==================== UTILITAIRES ====================

  changerModeAffichage(mode: 'liste' | 'saisie' | 'template' | 'brouillons'): void {
    this.modeAffichage = mode;
    
    if (mode === 'brouillons') {
      // Filtrer les brouillons
      this.formulaireRecherche.patchValue({ statut: StatutEcriture.BROUILLON });
    } else if (mode === 'liste') {
      this.formulaireRecherche.patchValue({ statut: '' });
    }
  }

  changerOnglet(onglet: 'ecritures' | 'templates' | 'statistiques' | 'validation'): void {
    this.ongletActif = onglet;
  }

  effacerFiltres(): void {
    this.formulaireRecherche.reset({
      query: '',
      journal: '',
      statut: '',
      dateDebut: '',
      dateFin: '',
      montantMin: 0,
      montantMax: 10000000,
      reference: ''
    });
  }

  private reinitialiserFormulaires(): void {
    this.formulaireEcriture.reset({
      date: new Date(),
      typeEcriture: TypeEcriture.STANDARD
    });
    
    // Réinitialiser le FormArray des lignes
    const lignesArray = this.getLignesFormArray();
    while (lignesArray.length > 0) {
      lignesArray.removeAt(0);
    }
    
    this.formulaireLigne.reset();
    this.erreursEnCours = [];
    this.suggestionsDisponibles = [];
  }

  private chargerEcritureDansFormulaire(ecriture: EcritureComptable): void {
    this.formulaireEcriture.patchValue({
      libelle: ecriture.libelle,
      date: ecriture.date,
      dateEcheance: ecriture.dateEcheance,
      dateValeur: ecriture.dateValeur,
      journal: ecriture.journal.code,
      typeEcriture: ecriture.typeEcriture,
      reference: ecriture.reference,
      numeropiece: ecriture.numeropiece,
      notes: ecriture.notes
    });

    // Charger les lignes
    const lignesArray = this.getLignesFormArray();
    while (lignesArray.length > 0) {
      lignesArray.removeAt(0);
    }

    ecriture.lignes.forEach(ligne => {
      const ligneForm = this.formBuilder.group({
        compteComptable: [ligne.compteComptable, Validators.required],
        libelle: [ligne.libelle, Validators.required],
        montantDebit: [ligne.montantDebit],
        montantCredit: [ligne.montantCredit],
        tiersId: [ligne.tiersId],
        tiersNom: [ligne.tiersNom],
        reference: [ligne.reference],
        dateEcheance: [ligne.dateEcheance]
      });
      lignesArray.push(ligneForm);
    });
  }

  private suggererLibelleParCompte(compte: string): string {
    const suggestions: { [key: string]: string } = {
      '411': 'Client',
      '401': 'Fournisseur',
      '521': 'Banque',
      '531': 'Caisse',
      '601': 'Achats',
      '701': 'Ventes',
      '445': 'TVA récupérable',
      '443': 'TVA collectée',
      '661': 'Salaires',
      '664': 'Charges sociales'
    };

    return suggestions[compte] || '';
  }

  private sauvegarderEcriture(): void {
    if (this.ecritureSelectionnee) {
      this.modifierEcriture();
    } else {
      this.creerEcriture();
    }
  }

  private afficherAide(): void {
    alert('Aide non implémentée dans cette démonstration');
  }

  // ==================== GETTERS ET HELPERS ====================

  getLibelleStatut(statut: StatutEcriture): string {
    const libelles = {
      [StatutEcriture.BROUILLON]: 'Brouillon',
      [StatutEcriture.EN_ATTENTE]: 'En attente',
      [StatutEcriture.EN_VALIDATION]: 'En validation',
      [StatutEcriture.VALIDEE]: 'Validée',
      [StatutEcriture.COMPTABILISEE]: 'Comptabilisée',
      [StatutEcriture.REJETE]: 'Rejetée',
      [StatutEcriture.ARCHIVE]: 'Archivée',
      [StatutEcriture.EXTOURNEE]: 'Extournée'
    };
    return libelles[statut] || statut;
  }

  getCouleurStatut(statut: StatutEcriture): string {
    const couleurs = {
      [StatutEcriture.BROUILLON]: '#9E9E9E',
      [StatutEcriture.EN_ATTENTE]: '#FF9800',
      [StatutEcriture.EN_VALIDATION]: '#2196F3',
      [StatutEcriture.VALIDEE]: '#4CAF50',
      [StatutEcriture.COMPTABILISEE]: '#1B5E20',
      [StatutEcriture.REJETE]: '#F44336',
      [StatutEcriture.ARCHIVE]: '#607D8B',
      [StatutEcriture.EXTOURNEE]: '#9C27B0'
    };
    return couleurs[statut] || '#666';
  }

  getCouleurNiveauRisque(niveau: NiveauRisque): string {
    const couleurs = {
      [NiveauRisque.TRES_FAIBLE]: '#4CAF50',
      [NiveauRisque.FAIBLE]: '#8BC34A',
      [NiveauRisque.MOYEN]: '#FF9800',
      [NiveauRisque.ELEVE]: '#FF5722',
      [NiveauRisque.TRES_ELEVE]: '#F44336'
    };
    return couleurs[niveau] || '#666';
  }

  formaterMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(montant);
  }

  formaterDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  calculerProgresEtape(): number {
    return this.progresEtapes[this.etapeSaisie] || 0;
  }

  getTotalDebit(): number {
    return this.getLignesFormArray().controls.reduce((sum, ligne) => 
      sum + (ligne.get('montantDebit')?.value || 0), 0);
  }

  getTotalCredit(): number {
    return this.getLignesFormArray().controls.reduce((sum, ligne) => 
      sum + (ligne.get('montantCredit')?.value || 0), 0);
  }

  getEcart(): number {
    return Math.abs(this.getTotalDebit() - this.getTotalCredit());
  }

  isEquilibree(): boolean {
    return this.getEcart() < 0.01;
  }

  peutValider(): boolean {
    return this.getLignesFormArray().length >= 2 && 
           this.isEquilibree() && 
           this.erreursEnCours.length === 0;
  }

  private afficherMessage(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    // Simulation d'affichage de message
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}