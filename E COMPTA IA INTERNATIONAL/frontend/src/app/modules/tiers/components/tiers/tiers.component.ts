import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith, debounceTime } from 'rxjs/operators';
import { 
  Tiers,
  ScoringTiers,
  StatistiquesTiers,
  HistoriqueRelance,
  ContactTiers,
  TypeTiers,
  CategorieTiers,
  NatureTiers,
  StatutTiers,
  ClasseRisque,
  ModePaiement,
  NiveauRelance,
  SEUILS_SCORING,
  DELAIS_PAIEMENT_STANDARDS
} from '../../models/tiers.model';
import { TiersService } from '../../services/tiers.service';

@Component({
  selector: 'app-tiers',
  templateUrl: './tiers.component.html',
  styleUrls: ['./tiers.component.scss']
})
export class TiersComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Données principales
  tiers$: Observable<Tiers[]>;
  tiersAffiches$: Observable<Tiers[]>;
  statistiquesGlobales$: Observable<any>;
  relancesEnCours$: Observable<HistoriqueRelance[]>;

  // État de l'interface
  modeAffichage: 'liste' | 'cartes' | 'tableau' = 'cartes';
  ongletActif: 'tiers' | 'scoring' | 'relances' | 'statistiques' = 'tiers';
  
  // Formulaires
  formulaireRecherche: FormGroup;
  formulaireNouveauTiers: FormGroup;
  formulaireFilters: FormGroup;

  // Modales et état
  modalNouveauTiersOuvert = false;
  modalScoringOuvert = false;
  modalRelancesOuvert = false;
  modalStatistiquesOuvert = false;
  chargementEnCours = false;
  
  // Sélection et données
  tiersSelectionne: Tiers | null = null;
  scoringEnCours: ScoringTiers | null = null;
  relancesSelectionnees: HistoriqueRelance[] = [];
  
  // Données de référence
  typesTiers = Object.values(TypeTiers);
  categoriesTiers = Object.values(CategorieTiers);
  naturesTiers = Object.values(NatureTiers);
  statutsTiers = Object.values(StatutTiers);
  classesRisque = Object.values(ClasseRisque);
  modesPaiement = Object.values(ModePaiement);
  delaisPaiement = DELAIS_PAIEMENT_STANDARDS;
  seuilsScoring = SEUILS_SCORING;

  // Statistiques temps réel
  nombreTotal = 0;
  nombreClients = 0;
  nombreFournisseurs = 0;
  tiersArisque = 0;
  scoreGlobalMoyen = 0;

  constructor(
    private tiersService: TiersService,
    private formBuilder: FormBuilder
  ) {
    this.tiers$ = this.tiersService.tiers$;
    this.statistiquesGlobales$ = this.tiersService.statistiquesGlobales$;
    this.relancesEnCours$ = this.tiersService.relancesEnCours$;

    this.formulaireRecherche = this.formBuilder.group({
      query: [''],
      typeTiers: [''],
      statut: [''],
      classeRisque: [''],
      pays: [''],
      actifSeulement: [true]
    });

    this.formulaireFilters = this.formBuilder.group({
      scoreMin: [0],
      scoreMax: [1000],
      dateCreationDebut: [''],
      dateCreationFin: [''],
      montantCAMin: [0],
      montantCAMax: [10000000]
    });

    this.formulaireNouveauTiers = this.formBuilder.group({
      raisonSociale: ['', [Validators.required, Validators.minLength(2)]],
      nom: [''],
      prenom: [''],
      typeTiers: ['', Validators.required],
      categorieTiers: ['', Validators.required],
      natureTiers: ['', Validators.required],
      pays: ['CI', Validators.required],
      ville: ['', Validators.required],
      adresseComplete: ['', Validators.required],
      telephone: [''],
      mobile: [''],
      email: ['', [Validators.email]],
      siteWeb: [''],
      numeroIFU: [''],
      numeroTVA: [''],
      delaiPaiement: [30],
      modePaiementPrefere: [''],
      plafondCredit: [0],
      tauxRemise: [0],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.configurerFiltresTiers();
    this.configurerFormulaires();
    this.chargerStatistiques();
    this.initialiserRelancesAutomatiques();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== CONFIGURATION ====================

  private configurerFiltresTiers(): void {
    this.tiersAffiches$ = combineLatest([
      this.tiers$,
      this.formulaireRecherche.valueChanges.pipe(
        startWith(this.formulaireRecherche.value),
        debounceTime(300)
      ),
      this.formulaireFilters.valueChanges.pipe(
        startWith(this.formulaireFilters.value),
        debounceTime(500)
      )
    ]).pipe(
      map(([tiers, recherche, filtres]) => {
        let resultats = [...tiers];

        // Filtres de recherche
        if (recherche.query) {
          const query = recherche.query.toLowerCase();
          resultats = resultats.filter(t => 
            t.raisonSociale.toLowerCase().includes(query) ||
            t.code.toLowerCase().includes(query) ||
            t.email?.toLowerCase().includes(query) ||
            (t.nom && t.nom.toLowerCase().includes(query))
          );
        }

        if (recherche.typeTiers) {
          resultats = resultats.filter(t => t.typeTiers === recherche.typeTiers);
        }

        if (recherche.statut) {
          resultats = resultats.filter(t => t.statut === recherche.statut);
        }

        if (recherche.classeRisque) {
          resultats = resultats.filter(t => t.scoring?.classeRisque === recherche.classeRisque);
        }

        if (recherche.pays) {
          resultats = resultats.filter(t => t.pays === recherche.pays);
        }

        if (recherche.actifSeulement) {
          resultats = resultats.filter(t => t.statut === StatutTiers.ACTIF);
        }

        // Filtres avancés
        if (filtres.scoreMin > 0 || filtres.scoreMax < 1000) {
          resultats = resultats.filter(t => {
            const score = t.scoring?.scoreGlobal || 0;
            return score >= filtres.scoreMin && score <= filtres.scoreMax;
          });
        }

        if (filtres.dateCreationDebut) {
          const dateDebut = new Date(filtres.dateCreationDebut);
          resultats = resultats.filter(t => t.dateCreation >= dateDebut);
        }

        if (filtres.dateCreationFin) {
          const dateFin = new Date(filtres.dateCreationFin);
          resultats = resultats.filter(t => t.dateCreation <= dateFin);
        }

        // Tri par score décroissant par défaut
        return resultats.sort((a, b) => 
          (b.scoring?.scoreGlobal || 0) - (a.scoring?.scoreGlobal || 0)
        );
      })
    );
  }

  private configurerFormulaires(): void {
    // Auto-détection du compte comptable selon le type
    this.formulaireNouveauTiers.get('typeTiers')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        if (type) {
          // Logique d'auto-complétion selon le type
          if (type === TypeTiers.CLIENT || type === TypeTiers.PROSPECT) {
            this.formulaireNouveauTiers.patchValue({
              delaiPaiement: 30,
              modePaiementPrefere: ModePaiement.VIREMENT
            }, { emitEvent: false });
          } else if (type === TypeTiers.FOURNISSEUR) {
            this.formulaireNouveauTiers.patchValue({
              delaiPaiement: 45,
              modePaiementPrefere: ModePaiement.VIREMENT
            }, { emitEvent: false });
          }
        }
      });

    // Validation conditionnelle selon la nature
    this.formulaireNouveauTiers.get('natureTiers')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(nature => {
        const nomControl = this.formulaireNouveauTiers.get('nom');
        const prenomControl = this.formulaireNouveauTiers.get('prenom');
        
        if (nature === NatureTiers.PERSONNE_PHYSIQUE) {
          nomControl?.setValidators([Validators.required]);
          prenomControl?.setValidators([Validators.required]);
        } else {
          nomControl?.clearValidators();
          prenomControl?.clearValidators();
        }
        
        nomControl?.updateValueAndValidity();
        prenomControl?.updateValueAndValidity();
      });
  }

  private chargerStatistiques(): void {
    this.statistiquesGlobales$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        if (stats) {
          this.nombreTotal = stats.nombreTotal || 0;
          this.nombreClients = stats.nombreClients || 0;
          this.nombreFournisseurs = stats.nombreFournisseurs || 0;
          this.tiersArisque = stats.tiersArisque || 0;
          this.scoreGlobalMoyen = Math.round(stats.scoreGlobalMoyen || 0);
        }
      });
  }

  private initialiserRelancesAutomatiques(): void {
    // Génération automatique des relances toutes les heures (simulation)
    setInterval(() => {
      this.tiersService.genererRelancesAutomatiques().subscribe();
    }, 3600000); // 1 heure
  }

  // ==================== GESTION DES TIERS ====================

  ouvrirModalNouveauTiers(): void {
    this.modalNouveauTiersOuvert = true;
    this.formulaireNouveauTiers.reset({
      pays: 'CI',
      delaiPaiement: 30,
      plafondCredit: 0,
      tauxRemise: 0,
      actifSeulement: true
    });
  }

  fermerModalNouveauTiers(): void {
    this.modalNouveauTiersOuvert = false;
    this.formulaireNouveauTiers.reset();
  }

  creerTiers(): void {
    if (this.formulaireNouveauTiers.valid) {
      this.chargementEnCours = true;
      
      const donneesTiers = this.formulaireNouveauTiers.value;
      
      this.tiersService.creerTiers(donneesTiers)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (tiers) => {
            this.chargementEnCours = false;
            this.fermerModalNouveauTiers();
            this.tiersSelectionne = tiers;
            this.afficherMessage('Tiers créé avec succès', 'success');
          },
          error: (erreur) => {
            this.chargementEnCours = false;
            this.afficherMessage('Erreur lors de la création du tiers', 'error');
            console.error('Erreur:', erreur);
          }
        });
    }
  }

  selectionnerTiers(tiers: Tiers): void {
    this.tiersSelectionne = tiers;
    
    // Charger les statistiques détaillées du tiers
    if (tiers.id) {
      this.tiersService.getStatistiquesTiers(tiers.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(stats => {
          if (this.tiersSelectionne) {
            this.tiersSelectionne.statistiques = stats;
          }
        });
    }
  }

  modifierTiers(tiers: Tiers, modifications: Partial<Tiers>): void {
    this.chargementEnCours = true;
    
    this.tiersService.modifierTiers(tiers.id!, modifications)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tiersModifie) => {
          this.chargementEnCours = false;
          this.tiersSelectionne = tiersModifie;
          this.afficherMessage('Tiers modifié avec succès', 'success');
        },
        error: (erreur) => {
          this.chargementEnCours = false;
          this.afficherMessage('Erreur lors de la modification', 'error');
          console.error('Erreur:', erreur);
        }
      });
  }

  supprimerTiers(tiers: Tiers): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${tiers.raisonSociale} ?`)) {
      this.chargementEnCours = true;
      
      this.tiersService.supprimerTiers(tiers.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.chargementEnCours = false;
            this.tiersSelectionne = null;
            this.afficherMessage('Tiers supprimé avec succès', 'success');
          },
          error: (erreur) => {
            this.chargementEnCours = false;
            this.afficherMessage('Erreur lors de la suppression', 'error');
            console.error('Erreur:', erreur);
          }
        });
    }
  }

  // ==================== SCORING ET ÉVALUATION ====================

  ouvrirModalScoring(tiers: Tiers): void {
    this.tiersSelectionne = tiers;
    this.modalScoringOuvert = true;
    
    if (tiers.scoring) {
      this.scoringEnCours = tiers.scoring;
    } else {
      this.calculerScoring(tiers);
    }
  }

  fermerModalScoring(): void {
    this.modalScoringOuvert = false;
    this.scoringEnCours = null;
  }

  calculerScoring(tiers: Tiers): void {
    this.chargementEnCours = true;
    
    this.tiersService.calculerScoring(tiers)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (scoring) => {
          this.chargementEnCours = false;
          this.scoringEnCours = scoring;
          
          // Mettre à jour le tiers avec le nouveau scoring
          this.modifierTiers(tiers, { scoring });
        },
        error: (erreur) => {
          this.chargementEnCours = false;
          this.afficherMessage('Erreur lors du calcul du scoring', 'error');
          console.error('Erreur:', erreur);
        }
      });
  }

  recalculerTousLesScorings(): void {
    if (confirm('Cette opération peut prendre du temps. Continuer ?')) {
      this.chargementEnCours = true;
      
      this.tiersService.recalculerTousLesScorings()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (nombreRecalcules) => {
            this.chargementEnCours = false;
            this.afficherMessage(`${nombreRecalcules} scorings recalculés`, 'success');
          },
          error: (erreur) => {
            this.chargementEnCours = false;
            this.afficherMessage('Erreur lors du recalcul', 'error');
            console.error('Erreur:', erreur);
          }
        });
    }
  }

  // ==================== GESTION DES RELANCES ====================

  ouvrirModalRelances(): void {
    this.modalRelancesOuvert = true;
    this.genererRelancesAutomatiques();
  }

  fermerModalRelances(): void {
    this.modalRelancesOuvert = false;
    this.relancesSelectionnees = [];
  }

  genererRelancesAutomatiques(): void {
    this.chargementEnCours = true;
    
    this.tiersService.genererRelancesAutomatiques()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (relances) => {
          this.chargementEnCours = false;
          this.relancesSelectionnees = relances;
          this.afficherMessage(`${relances.length} relances générées`, 'info');
        },
        error: (erreur) => {
          this.chargementEnCours = false;
          this.afficherMessage('Erreur lors de la génération des relances', 'error');
          console.error('Erreur:', erreur);
        }
      });
  }

  envoyerRelance(relance: HistoriqueRelance): void {
    this.chargementEnCours = true;
    
    this.tiersService.envoyerRelance(relance)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (succes) => {
          this.chargementEnCours = false;
          if (succes) {
            this.afficherMessage('Relance envoyée avec succès', 'success');
            // Retirer de la liste des relances en cours
            this.relancesSelectionnees = this.relancesSelectionnees.filter(r => r.id !== relance.id);
          } else {
            this.afficherMessage('Échec de l\'envoi de la relance', 'error');
          }
        },
        error: (erreur) => {
          this.chargementEnCours = false;
          this.afficherMessage('Erreur lors de l\'envoi', 'error');
          console.error('Erreur:', erreur);
        }
      });
  }

  envoyerToutesLesRelances(): void {
    if (this.relancesSelectionnees.length === 0) return;
    
    if (confirm(`Envoyer ${this.relancesSelectionnees.length} relances ?`)) {
      this.chargementEnCours = true;
      let compteur = 0;
      let succes = 0;
      
      this.relancesSelectionnees.forEach(relance => {
        this.tiersService.envoyerRelance(relance)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (reussi) => {
              compteur++;
              if (reussi) succes++;
              
              if (compteur === this.relancesSelectionnees.length) {
                this.chargementEnCours = false;
                this.afficherMessage(`${succes}/${compteur} relances envoyées`, 'info');
                this.relancesSelectionnees = [];
              }
            },
            error: () => {
              compteur++;
              if (compteur === this.relancesSelectionnees.length) {
                this.chargementEnCours = false;
                this.afficherMessage(`${succes}/${compteur} relances envoyées`, 'warning');
              }
            }
          });
      });
    }
  }

  // ==================== AFFICHAGE ET NAVIGATION ====================

  changerModeAffichage(mode: 'liste' | 'cartes' | 'tableau'): void {
    this.modeAffichage = mode;
  }

  changerOnglet(onglet: 'tiers' | 'scoring' | 'relances' | 'statistiques'): void {
    this.ongletActif = onglet;
  }

  effacerFiltres(): void {
    this.formulaireRecherche.reset({
      query: '',
      typeTiers: '',
      statut: '',
      classeRisque: '',
      pays: '',
      actifSeulement: true
    });
    
    this.formulaireFilters.reset({
      scoreMin: 0,
      scoreMax: 1000,
      dateCreationDebut: '',
      dateCreationFin: '',
      montantCAMin: 0,
      montantCAMax: 10000000
    });
  }

  exporterTiers(format: 'CSV' | 'EXCEL' | 'PDF'): void {
    this.chargementEnCours = true;
    
    // Simulation export
    setTimeout(() => {
      this.chargementEnCours = false;
      this.afficherMessage(`Export ${format} généré avec succès`, 'success');
    }, 2000);
  }

  // ==================== UTILITAIRES ====================

  getLibelleTypeTiers(type: TypeTiers): string {
    const libelles = {
      [TypeTiers.CLIENT]: 'Client',
      [TypeTiers.FOURNISSEUR]: 'Fournisseur',
      [TypeTiers.CLIENT_FOURNISSEUR]: 'Client/Fournisseur',
      [TypeTiers.PROSPECT]: 'Prospect',
      [TypeTiers.PARTENAIRE]: 'Partenaire',
      [TypeTiers.SOUS_TRAITANT]: 'Sous-traitant'
    };
    return libelles[type] || type;
  }

  getCouleurClasseRisque(classe: ClasseRisque): string {
    return this.seuilsScoring[classe]?.couleur || '#666';
  }

  getLibelleClasseRisque(classe: ClasseRisque): string {
    const libelles = {
      [ClasseRisque.EXCELLENT]: 'Excellent',
      [ClasseRisque.BON]: 'Bon',
      [ClasseRisque.MOYEN]: 'Moyen',
      [ClasseRisque.RISQUE]: 'Risqué',
      [ClasseRisque.TRES_RISQUE]: 'Très risqué'
    };
    return libelles[classe] || classe;
  }

  getIconeStatut(statut: StatutTiers): string {
    const icones = {
      [StatutTiers.ACTIF]: 'check_circle',
      [StatutTiers.INACTIF]: 'pause_circle',
      [StatutTiers.SUSPENDU]: 'warning',
      [StatutTiers.BLOQUE]: 'block',
      [StatutTiers.ARCHIVE]: 'archive'
    };
    return icones[statut] || 'help';
  }

  getCouleurStatut(statut: StatutTiers): string {
    const couleurs = {
      [StatutTiers.ACTIF]: '#4CAF50',
      [StatutTiers.INACTIF]: '#9E9E9E',
      [StatutTiers.SUSPENDU]: '#FF9800',
      [StatutTiers.BLOQUE]: '#F44336',
      [StatutTiers.ARCHIVE]: '#607D8B'
    };
    return couleurs[statut] || '#666';
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

  formaterScore(score: number): string {
    return `${score}/1000`;
  }

  getLibelleNiveauRelance(niveau: NiveauRelance): string {
    const libelles = {
      [NiveauRelance.RELANCE_1]: '1ère relance',
      [NiveauRelance.RELANCE_2]: '2ème relance',
      [NiveauRelance.RELANCE_3]: '3ème relance',
      [NiveauRelance.MISE_EN_DEMEURE]: 'Mise en demeure',
      [NiveauRelance.CONTENTIEUX]: 'Contentieux'
    };
    return libelles[niveau] || niveau;
  }

  getCouleurNiveauRelance(niveau: NiveauRelance): string {
    const couleurs = {
      [NiveauRelance.RELANCE_1]: '#17a2b8',
      [NiveauRelance.RELANCE_2]: '#ffc107',
      [NiveauRelance.RELANCE_3]: '#fd7e14',
      [NiveauRelance.MISE_EN_DEMEURE]: '#dc3545',
      [NiveauRelance.CONTENTIEUX]: '#6f42c1'
    };
    return couleurs[niveau] || '#666';
  }

  calculerAnciennete(dateCreation: Date): string {
    const maintenant = new Date();
    const diffMs = maintenant.getTime() - dateCreation.getTime();
    const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffJours < 30) {
      return `${diffJours} jour(s)`;
    } else if (diffJours < 365) {
      const mois = Math.floor(diffJours / 30);
      return `${mois} mois`;
    } else {
      const annees = Math.floor(diffJours / 365);
      return `${annees} an(s)`;
    }
  }

  private afficherMessage(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    // Simulation d'affichage de message toast/snackbar
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Ici vous pourriez intégrer une vraie librairie de notifications
    // comme Angular Material Snackbar, ngx-toastr, etc.
  }

  // ==================== ACTIONS RAPIDES ====================

  activerRelancesAutomatiques(tiers: Tiers): void {
    const modifications = {
      parametresRelance: {
        ...tiers.parametresRelance,
        relanceAutomatique: true,
        delaiPremierRelance: 7,
        delaiDeuxiemeRelance: 15,
        delaiTroisiemeRelance: 30,
        delaiMiseEnDemeure: 60
      }
    };
    
    this.modifierTiers(tiers, modifications);
  }

  bloquerTiers(tiers: Tiers): void {
    if (confirm(`Bloquer le tiers ${tiers.raisonSociale} ?`)) {
      this.modifierTiers(tiers, { statut: StatutTiers.BLOQUE });
    }
  }

  archiverTiers(tiers: Tiers): void {
    if (confirm(`Archiver le tiers ${tiers.raisonSociale} ?`)) {
      this.modifierTiers(tiers, { statut: StatutTiers.ARCHIVE });
    }
  }

  augmenterPlafondCredit(tiers: Tiers): void {
    const nouveauPlafond = (tiers.plafondCredit || 0) * 1.2; // +20%
    this.modifierTiers(tiers, { plafondCredit: nouveauPlafond });
  }

  reduirePlafondCredit(tiers: Tiers): void {
    const nouveauPlafond = (tiers.plafondCredit || 0) * 0.8; // -20%
    this.modifierTiers(tiers, { plafondCredit: nouveauPlafond });
  }
}