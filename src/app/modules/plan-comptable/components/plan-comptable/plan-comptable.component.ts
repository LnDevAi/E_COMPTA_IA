import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';
import { 
  CompteComptable, 
  PlanComptable,
  StatistiquesPlan,
  ClasseComptable,
  TypeCompte,
  NatureSolde,
  StatutCompte,
  FormatImport,
  ValidationCompteIA,
  ImportPlanComptable
} from '../../models/plan-comptable.model';
import { PlanComptableService } from '../../services/plan-comptable.service';

@Component({
  selector: 'app-plan-comptable',
  templateUrl: './plan-comptable.component.html',
  styleUrls: ['./plan-comptable.component.scss']
})
export class PlanComptableComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Données principales
  planComptable$: Observable<PlanComptable | null>;
  comptes$: Observable<CompteComptable[]>;
  statistiques$: Observable<StatistiquesPlan | null>;
  comptesAffiches$: Observable<CompteComptable[]>;

  // État de l'interface
  modeAffichage: 'liste' | 'hierarchique' | 'classes' = 'liste';
  ongletActif: 'comptes' | 'statistiques' | 'parametres' | 'import' = 'comptes';
  
  // Formulaires
  formulaireRecherche: FormGroup;
  formulaireNouveauCompte: FormGroup;
  formulaireImport: FormGroup;

  // Modales et état
  modalNouveauCompteOuvert = false;
  modalImportOuvert = false;
  modalStatistiquesOuvert = false;
  chargementEnCours = false;
  
  // Sélection et filtres
  compteSelectionne: CompteComptable | null = null;
  classeSelectionnee: ClasseComptable | null = null;
  
  // Données de référence
  classesComptables = Object.values(ClasseComptable);
  typesCompte = Object.values(TypeCompte);
  naturesSolde = Object.values(NatureSolde);
  statutsCompte = Object.values(StatutCompte);
  formatsImport = Object.values(FormatImport);

  // Import
  importEnCours: ImportPlanComptable | null = null;
  fichierImport: File | null = null;

  constructor(
    private planComptableService: PlanComptableService,
    private formBuilder: FormBuilder
  ) {
    this.planComptable$ = this.planComptableService.planComptable$;
    this.comptes$ = this.planComptableService.comptes$;
    this.statistiques$ = this.planComptableService.statistiques$;

    this.formulaireRecherche = this.formBuilder.group({
      query: [''],
      classe: [''],
      typeCompte: [''],
      actifSeulement: [true],
      personnalisesSeulement: [false]
    });

    this.formulaireNouveauCompte = this.formBuilder.group({
      numero: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]],
      intitule: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      classe: ['', Validators.required],
      typeCompte: ['', Validators.required],
      natureSolde: ['', Validators.required],
      lettrable: [false],
      rapprochable: [false],
      auxiliaireObligatoire: [false],
      utilisationAnalytique: [false]
    });

    this.formulaireImport = this.formBuilder.group({
      format: [FormatImport.CSV, Validators.required],
      validationPrealable: [true],
      creerComptesManquants: [true],
      mettreAJourExistants: [false],
      separateur: [';'],
      encodage: ['UTF-8']
    });
  }

  ngOnInit(): void {
    this.configurerFiltresComptes();
    this.configurerFormulaires();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== CONFIGURATION ====================

  private configurerFiltresComptes(): void {
    this.comptesAffiches$ = combineLatest([
      this.comptes$,
      this.formulaireRecherche.valueChanges.pipe(startWith(this.formulaireRecherche.value))
    ]).pipe(
      map(([comptes, filtres]) => {
        let resultats = [...comptes];

        // Appliquer les filtres
        if (filtres.query) {
          const query = filtres.query.toLowerCase();
          resultats = resultats.filter(compte => 
            compte.numero.toLowerCase().includes(query) ||
            compte.intitule.toLowerCase().includes(query)
          );
        }

        if (filtres.classe) {
          resultats = resultats.filter(compte => compte.classe === filtres.classe);
        }

        if (filtres.typeCompte) {
          resultats = resultats.filter(compte => compte.typeCompte === filtres.typeCompte);
        }

        if (filtres.actifSeulement) {
          resultats = resultats.filter(compte => compte.statut === StatutCompte.ACTIF);
        }

        if (filtres.personnalisesSeulement) {
          resultats = resultats.filter(compte => compte.personnalise);
        }

        // Tri par numéro
        return resultats.sort((a, b) => a.numero.localeCompare(b.numero));
      })
    );
  }

  private configurerFormulaires(): void {
    // Auto-détection du type et nature selon le numéro
    this.formulaireNouveauCompte.get('numero')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(numero => {
        if (numero && numero.length > 0) {
          const premiereClasse = numero.charAt(0);
          
          // Auto-sélection de la classe
          const classe = `CLASSE_${premiereClasse}` as ClasseComptable;
          if (Object.values(ClasseComptable).includes(classe)) {
            this.formulaireNouveauCompte.patchValue({ classe }, { emitEvent: false });
            
            // Auto-sélection du type
            const typeCompte = ['1', '2', '3', '4', '5'].includes(premiereClasse) 
              ? TypeCompte.BILAN 
              : TypeCompte.GESTION;
            this.formulaireNouveauCompte.patchValue({ typeCompte }, { emitEvent: false });
            
            // Auto-sélection de la nature
            const natureSolde = ['2', '3', '4', '6'].includes(premiereClasse) 
              ? NatureSolde.DEBITEUR 
              : NatureSolde.CREDITEUR;
            this.formulaireNouveauCompte.patchValue({ natureSolde }, { emitEvent: false });

            // Suggestions de propriétés
            if (numero.startsWith('41')) {
              this.formulaireNouveauCompte.patchValue({ 
                lettrable: true, 
                auxiliaireObligatoire: true 
              }, { emitEvent: false });
            }
            
            if (numero.startsWith('52') || numero.startsWith('53')) {
              this.formulaireNouveauCompte.patchValue({ 
                rapprochable: true 
              }, { emitEvent: false });
            }
          }
        }
      });
  }

  // ==================== GESTION DES COMPTES ====================

  ouvrirModalNouveauCompte(): void {
    this.modalNouveauCompteOuvert = true;
    this.formulaireNouveauCompte.reset();
  }

  fermerModalNouveauCompte(): void {
    this.modalNouveauCompteOuvert = false;
    this.formulaireNouveauCompte.reset();
  }

  creerCompte(): void {
    if (this.formulaireNouveauCompte.valid) {
      this.chargementEnCours = true;
      
      const donnneesCompte = this.formulaireNouveauCompte.value;
      
      this.planComptableService.ajouterCompte(donnneesCompte)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (compte) => {
            this.chargementEnCours = false;
            this.fermerModalNouveauCompte();
            this.compteSelectionne = compte;
            // Message de succès
            console.log('Compte créé avec succès:', compte);
          },
          error: (erreur) => {
            this.chargementEnCours = false;
            console.error('Erreur lors de la création du compte:', erreur);
          }
        });
    }
  }

  selectionnerCompte(compte: CompteComptable): void {
    this.compteSelectionne = compte;
  }

  modifierCompte(compte: CompteComptable, modifications: Partial<CompteComptable>): void {
    this.chargementEnCours = true;
    
    this.planComptableService.modifierCompte(compte.id!, modifications)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (compteModifie) => {
          this.chargementEnCours = false;
          this.compteSelectionne = compteModifie;
          console.log('Compte modifié avec succès:', compteModifie);
        },
        error: (erreur) => {
          this.chargementEnCours = false;
          console.error('Erreur lors de la modification:', erreur);
        }
      });
  }

  supprimerCompte(compte: CompteComptable): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le compte ${compte.numero} - ${compte.intitule} ?`)) {
      this.chargementEnCours = true;
      
      this.planComptableService.supprimerCompte(compte.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.chargementEnCours = false;
            this.compteSelectionne = null;
            console.log('Compte supprimé avec succès');
          },
          error: (erreur) => {
            this.chargementEnCours = false;
            console.error('Erreur lors de la suppression:', erreur);
          }
        });
    }
  }

  // ==================== AFFICHAGE ET NAVIGATION ====================

  changerModeAffichage(mode: 'liste' | 'hierarchique' | 'classes'): void {
    this.modeAffichage = mode;
  }

  changerOnglet(onglet: 'comptes' | 'statistiques' | 'parametres' | 'import'): void {
    this.ongletActif = onglet;
  }

  filtrerParClasse(classe: ClasseComptable | null): void {
    this.classeSelectionnee = classe;
    this.formulaireRecherche.patchValue({ classe: classe || '' });
  }

  effacerFiltres(): void {
    this.formulaireRecherche.reset({
      query: '',
      classe: '',
      typeCompte: '',
      actifSeulement: true,
      personnalisesSeulement: false
    });
    this.classeSelectionnee = null;
  }

  // ==================== IMPORT/EXPORT ====================

  ouvrirModalImport(): void {
    this.modalImportOuvert = true;
    this.formulaireImport.reset({
      format: FormatImport.CSV,
      validationPrealable: true,
      creerComptesManquants: true,
      mettreAJourExistants: false,
      separateur: ';',
      encodage: 'UTF-8'
    });
  }

  fermerModalImport(): void {
    this.modalImportOuvert = false;
    this.fichierImport = null;
    this.importEnCours = null;
  }

  selectionnerFichierImport(event: any): void {
    const fichier = event.target.files[0];
    if (fichier) {
      this.fichierImport = fichier;
    }
  }

  importerPlanComptable(): void {
    if (this.fichierImport && this.formulaireImport.valid) {
      this.chargementEnCours = true;
      
      const donneesImport = {
        fichier: this.fichierImport,
        format: this.formulaireImport.value.format,
        options: {
          validationPrealable: this.formulaireImport.value.validationPrealable,
          creerComptesManquants: this.formulaireImport.value.creerComptesManquants,
          mettreAJourExistants: this.formulaireImport.value.mettreAJourExistants,
          separateur: this.formulaireImport.value.separateur,
          encodage: this.formulaireImport.value.encodage
        },
        validationPrealable: this.formulaireImport.value.validationPrealable,
        mappingColonnes: []
      };

      this.planComptableService.importerPlanComptable(donneesImport)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (importJob) => {
            this.chargementEnCours = false;
            this.importEnCours = importJob;
            console.log('Import terminé:', importJob);
          },
          error: (erreur) => {
            this.chargementEnCours = false;
            console.error('Erreur lors de l\'import:', erreur);
          }
        });
    }
  }

  exporterPlanComptable(format: FormatImport): void {
    this.chargementEnCours = true;
    
    this.planComptableService.exporterPlanComptable(format)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.chargementEnCours = false;
          
          // Téléchargement du fichier
          const url = window.URL.createObjectURL(blob);
          const lien = document.createElement('a');
          lien.href = url;
          lien.download = `plan-comptable.${format.toLowerCase()}`;
          lien.click();
          window.URL.revokeObjectURL(url);
          
          console.log('Export réussi');
        },
        error: (erreur) => {
          this.chargementEnCours = false;
          console.error('Erreur lors de l\'export:', erreur);
        }
      });
  }

  initialiserAvecSYSCOHADA(): void {
    if (confirm('Cette action va initialiser le plan comptable avec la base SYSCOHADA. Continuer ?')) {
      this.chargementEnCours = true;
      
      this.planComptableService.initialiserAvecPlanSYSCOHADA('current')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (resultat) => {
            this.chargementEnCours = false;
            console.log('Initialisation SYSCOHADA réussie:', resultat);
          },
          error: (erreur) => {
            this.chargementEnCours = false;
            console.error('Erreur lors de l\'initialisation:', erreur);
          }
        });
    }
  }

  // ==================== UTILITAIRES ====================

  getLibelleClasse(classe: ClasseComptable): string {
    const libelles = {
      [ClasseComptable.CLASSE_1]: 'Classe 1 - Ressources durables',
      [ClasseComptable.CLASSE_2]: 'Classe 2 - Actif immobilisé',
      [ClasseComptable.CLASSE_3]: 'Classe 3 - Stocks',
      [ClasseComptable.CLASSE_4]: 'Classe 4 - Tiers',
      [ClasseComptable.CLASSE_5]: 'Classe 5 - Trésorerie',
      [ClasseComptable.CLASSE_6]: 'Classe 6 - Charges',
      [ClasseComptable.CLASSE_7]: 'Classe 7 - Produits',
      [ClasseComptable.CLASSE_8]: 'Classe 8 - Comptes spéciaux',
      [ClasseComptable.CLASSE_9]: 'Classe 9 - Analytique'
    };
    return libelles[classe] || classe;
  }

  getCouleurClasse(classe: ClasseComptable): string {
    const couleurs = {
      [ClasseComptable.CLASSE_1]: '#4CAF50',
      [ClasseComptable.CLASSE_2]: '#2196F3',
      [ClasseComptable.CLASSE_3]: '#FF9800',
      [ClasseComptable.CLASSE_4]: '#9C27B0',
      [ClasseComptable.CLASSE_5]: '#00BCD4',
      [ClasseComptable.CLASSE_6]: '#F44336',
      [ClasseComptable.CLASSE_7]: '#8BC34A',
      [ClasseComptable.CLASSE_8]: '#607D8B',
      [ClasseComptable.CLASSE_9]: '#795548'
    };
    return couleurs[classe] || '#666';
  }

  getIconeValidation(validation: ValidationCompteIA | undefined): string {
    if (!validation) return 'help';
    if (validation.conformiteSYSCOHADA) return 'check_circle';
    if (validation.score >= 60) return 'warning';
    return 'error';
  }

  getCouleurValidation(validation: ValidationCompteIA | undefined): string {
    if (!validation) return '#999';
    if (validation.conformiteSYSCOHADA) return '#4CAF50';
    if (validation.score >= 60) return '#FF9800';
    return '#F44336';
  }

  formaterMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(montant);
  }

  formaterPourcentage(valeur: number): string {
    return `${Math.round(valeur)}%`;
  }
}