import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';

import { ELearningService } from '../../services/elearning.service';
import { SubscriptionService } from '../../../subscription/services/subscription.service';
import {
  CoursComptabilite,
  ProgressionEtudiant,
  Certificat,
  Badge,
  NiveauAccesElearning,
  CategorieComptable,
  StatutProgression,
  ExercicePratique,
  NiveauDifficulte
} from '../../models/elearning.model';
import { FORMATION_ADMINISTRATEURS_2018, EXERCICES_FORMATION_2018, CONFIGURATION_FORMATION_2018 } from '../../data/formation-administrateurs-2018.data';

@Component({
  selector: 'app-learning-platform',
  templateUrl: './learning-platform.component.html',
  styleUrls: ['./learning-platform.component.scss']
})
export class LearningPlatformComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  
  // État de l'interface
  vueActive = 'dashboard'; // dashboard, catalogue, mes-cours, certificats, statistiques
  chargementEnCours = false;
  erreur: string | null = null;
  
  // Formulaires
  rechercheForm: FormGroup;
  filtresForm: FormGroup;
  
  // Données
  coursDisponibles: CoursComptabilite[] = [];
  mesProgressions: ProgressionEtudiant[] = [];
  mesCertificats: Certificat[] = [];
  mesBadges: Badge[] = [];
  statistiquesEtudiant: any = null;
  niveauAbonnement: NiveauAccesElearning = NiveauAccesElearning.GRATUIT;
  
  // Filtres et recherche
  private rechercheSubject = new BehaviorSubject<string>('');
  resultatsRecherche: CoursComptabilite[] = [];
  suggestionsRecherche: string[] = [];
  categoriesDisponibles = Object.values(CategorieComptable);
  
  // Pagination
  pageActuelle = 1;
  elementsParPage = 6;
  totalElements = 0;
  
  // Sélections et actions
  coursSelectionne: CoursComptabilite | null = null;
  modalInscriptionOuverte = false;
  modalCertificatOuverte = false;
  certificatSelectionne: Certificat | null = null;
  
  // Configuration interface
  readonly IMAGES_CATEGORIES = {
    [CategorieComptable.SYSCOHADA]: '/assets/images/syscohada-icon.svg',
    [CategorieComptable.COMPTABILITE_GENERALE]: '/assets/images/comptabilite-icon.svg',
    [CategorieComptable.ANALYSE_FINANCIERE]: '/assets/images/analyse-icon.svg',
    [CategorieComptable.FISCALITE]: '/assets/images/fiscalite-icon.svg',
    [CategorieComptable.AUDIT]: '/assets/images/audit-icon.svg'
  };

  // Nouvelles propriétés pour la formation 2018
  formationTerrain2018: CoursComptabilite = FORMATION_ADMINISTRATEURS_2018;
  exercicesBonus: ExercicePratique[] = EXERCICES_FORMATION_2018;
  modeFormationExpert = false;
  progressionDetaillee: any = {};

  // Analytics spécifiques à la formation terrain
  analyticsFormation = {
    tempsParModule: new Map<string, number>(),
    difficultesRencontrees: new Map<string, number>(),
    exercicesReussis: new Set<string>(),
    notesMoyennes: new Map<string, number>()
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private elearningService: ELearningService,
    private subscriptionService: SubscriptionService
  ) {
    this.initFormsAndSearches();
  }

  ngOnInit(): void {
    this.chargerDonneesInitiales();
    this.configurerRecherche();
    this.ecouterChangementsRoute();
    
    this.initialiserFormationTerrain();
    this.configurerTrackingAvance();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initFormsAndSearches(): void {
    this.rechercheForm = this.fb.group({
      terme: ['']
    });

    this.filtresForm = this.fb.group({
      categorie: [''],
      niveau: [''],
      gratuitSeulement: [false],
      avecCertificat: [false]
    });
  }

  private chargerDonneesInitiales(): void {
    this.chargementEnCours = true;
    this.erreur = null;

    // Charger toutes les données en parallèle
    combineLatest([
      this.elearningService.getCoursDisponibles(),
      this.elearningService.getToutesProgressions(),
      this.elearningService.getCertificatsEtudiant(),
      this.elearningService.getBadgesEtudiant(),
      this.elearningService.getStatistiquesEtudiant(),
      this.subscriptionService.getAbonnementActuel()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([cours, progressions, certificats, badges, stats, abonnement]) => {
        this.coursDisponibles = cours;
        this.mesProgressions = progressions;
        this.mesCertificats = certificats;
        this.mesBadges = badges;
        this.statistiquesEtudiant = stats;
        this.niveauAbonnement = this.mapAbonnementToNiveau(abonnement?.plan?.id);
        
        this.totalElements = cours.length;
        this.chargementEnCours = false;
        
        console.log('📚 Données e-learning chargées:', {
          cours: cours.length,
          progressions: progressions.length,
          certificats: certificats.length,
          badges: badges.length
        });
      },
      error: (error) => {
        console.error('❌ Erreur chargement e-learning:', error);
        this.erreur = 'Erreur lors du chargement des données d\'apprentissage';
        this.chargementEnCours = false;
      }
    });
  }

  private configurerRecherche(): void {
    // Recherche avec debounce
    this.rechercheForm.get('terme')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(terme => {
      this.rechercheSubject.next(terme || '');
    });

    // Recherche intelligente
    this.rechercheSubject.pipe(
      switchMap(terme => 
        terme ? this.elearningService.rechercheIntelligente(terme) :
        this.elearningService.getCoursDisponibles().pipe(map(cours => ({ cours, suggestions: [] })))
      ),
      takeUntil(this.destroy$)
    ).subscribe(resultat => {
      this.resultatsRecherche = resultat.cours || resultat;
      this.suggestionsRecherche = resultat.suggestions || [];
      this.totalElements = this.resultatsRecherche.length;
      this.pageActuelle = 1;
    });

    // Filtres
    this.filtresForm.valueChanges.pipe(
      debounceTime(200),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.appliquerFiltres();
    });
  }

  private ecouterChangementsRoute(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['vue']) {
        this.vueActive = params['vue'];
      }
      if (params['cours']) {
        this.ouvrirDetailsCours(params['cours']);
      }
    });
  }

  // =====================================================
  // GESTION DES VUES
  // =====================================================

  changerVue(nouvelleVue: string): void {
    this.vueActive = nouvelleVue;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { vue: nouvelleVue },
      queryParamsHandling: 'merge'
    });
  }

  // =====================================================
  // RECHERCHE ET FILTRAGE
  // =====================================================

  private appliquerFiltres(): void {
    const filtres = this.filtresForm.value;
    let coursFiltrés = this.resultatsRecherche.length > 0 ? 
      this.resultatsRecherche : this.coursDisponibles;

    if (filtres.categorie) {
      coursFiltrés = coursFiltrés.filter(c => c.categorie === filtres.categorie);
    }

    if (filtres.niveau) {
      coursFiltrés = coursFiltrés.filter(c => c.niveau === filtres.niveau);
    }

    if (filtres.gratuitSeulement) {
      coursFiltrés = coursFiltrés.filter(c => c.gratuit);
    }

    if (filtres.avecCertificat) {
      coursFiltrés = coursFiltrés.filter(c => c.certification.disponible);
    }

    this.resultatsRecherche = coursFiltrés;
    this.totalElements = coursFiltrés.length;
    this.pageActuelle = 1;
  }

  utiliserSuggestion(suggestion: string): void {
    this.rechercheForm.patchValue({ terme: suggestion });
  }

  viderRecherche(): void {
    this.rechercheForm.patchValue({ terme: '' });
    this.filtresForm.reset();
  }

  // =====================================================
  // GESTION DES COURS
  // =====================================================

  ouvrirDetailsCours(coursId: string): void {
    const cours = this.coursDisponibles.find(c => c.id === coursId);
    if (cours) {
      this.coursSelectionne = cours;
      this.modalInscriptionOuverte = true;
    }
  }

  inscrireAuCours(cours: CoursComptabilite): void {
    if (this.estDejaInscrit(cours.id)) {
      this.router.navigate(['/elearning/cours', cours.id]);
      return;
    }

    this.chargementEnCours = true;
    
    this.elearningService.inscrireAuCours(cours.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (progression) => {
        console.log('✅ Inscription réussie:', progression);
        this.mesProgressions.push(progression);
        this.modalInscriptionOuverte = false;
        this.chargementEnCours = false;
        
        // Rediriger vers le cours
        this.router.navigate(['/elearning/cours', cours.id]);
      },
      error: (error) => {
        console.error('❌ Erreur inscription:', error);
        this.erreur = error.message || 'Erreur lors de l\'inscription';
        this.chargementEnCours = false;
      }
    });
  }

  reprendreCours(coursId: string): void {
    this.router.navigate(['/elearning/cours', coursId]);
  }

  estDejaInscrit(coursId: string): boolean {
    return this.mesProgressions.some(p => p.coursId === coursId);
  }

  getProgressionCours(coursId: string): ProgressionEtudiant | null {
    return this.mesProgressions.find(p => p.coursId === coursId) || null;
  }

  // =====================================================
  // GESTION DES CERTIFICATS
  // =====================================================

  voirCertificat(certificat: Certificat): void {
    this.certificatSelectionne = certificat;
    this.modalCertificatOuverte = true;
  }

  telechargerCertificat(certificat: Certificat, format: string = 'PDF'): void {
    console.log('📄 Téléchargement certificat:', certificat.numeroUnique, format);
    
    // Simulation du téléchargement
    const lien = document.createElement('a');
    lien.href = `/api/certificats/${certificat.id}/download?format=${format}`;
    lien.download = `certificat-${certificat.numeroUnique}.${format.toLowerCase()}`;
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
  }

  partagerCertificat(certificat: Certificat, plateforme: string): void {
    const url = `${window.location.origin}${certificat.urlPublique}`;
    const texte = `Je viens d'obtenir le certificat "${certificat.titreCours}" avec la mention ${certificat.mention} !`;
    
    switch (plateforme) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texte)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texte)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      default:
        navigator.clipboard.writeText(url);
        console.log('📋 Lien copié dans le presse-papier');
    }
  }

  // =====================================================
  // PAGINATION
  // =====================================================

  changerPage(nouvellePage: number): void {
    this.pageActuelle = nouvellePage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get coursAffiches(): CoursComptabilite[] {
    const debut = (this.pageActuelle - 1) * this.elementsParPage;
    const fin = debut + this.elementsParPage;
    const coursSource = this.resultatsRecherche.length > 0 ? 
      this.resultatsRecherche : this.coursDisponibles;
    return coursSource.slice(debut, fin);
  }

  get nombrePages(): number {
    return Math.ceil(this.totalElements / this.elementsParPage);
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  private mapAbonnementToNiveau(planId?: string): NiveauAccesElearning {
    switch (planId) {
      case 'starter': return NiveauAccesElearning.STARTER;
      case 'professional': return NiveauAccesElearning.PROFESSIONAL;
      case 'enterprise': return NiveauAccesElearning.ENTERPRISE;
      case 'multinational': return NiveauAccesElearning.MULTINATIONAL;
      default: return NiveauAccesElearning.GRATUIT;
    }
  }

  getBadgeStatut(statut: StatutProgression): { classe: string; texte: string } {
    switch (statut) {
      case StatutProgression.NON_COMMENCE:
        return { classe: 'badge-secondary', texte: 'Non commencé' };
      case StatutProgression.EN_COURS:
        return { classe: 'badge-warning', texte: 'En cours' };
      case StatutProgression.COMPLETE:
        return { classe: 'badge-success', texte: 'Terminé' };
      case StatutProgression.CERTIFIE:
        return { classe: 'badge-primary', texte: 'Certifié' };
      default:
        return { classe: 'badge-light', texte: 'Inconnu' };
    }
  }

  getImageCategorie(categorie: CategorieComptable): string {
    return this.IMAGES_CATEGORIES[categorie] || '/assets/images/default-course.svg';
  }

  formaterDuree(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const heures = Math.floor(minutes / 60);
    const minutesRestantes = minutes % 60;
    return minutesRestantes > 0 ? `${heures}h ${minutesRestantes}min` : `${heures}h`;
  }

  formaterNote(note: number): string {
    return `${note.toFixed(1)}/20`;
  }

  getCouleursProgression(pourcentage: number): { couleur: string; texte: string } {
    if (pourcentage === 0) return { couleur: '#E5E7EB', texte: '#6B7280' };
    if (pourcentage < 25) return { couleur: '#FEF3C7', texte: '#92400E' };
    if (pourcentage < 50) return { couleur: '#FCD34D', texte: '#92400E' };
    if (pourcentage < 75) return { couleur: '#60A5FA', texte: '#1E40AF' };
    if (pourcentage < 100) return { couleur: '#34D399', texte: '#065F46' };
    return { couleur: '#10B981', texte: '#065F46' };
  }

  // =====================================================
  // ACTIONS MODALES
  // =====================================================

  fermerModaleInscription(): void {
    this.modalInscriptionOuverte = false;
    this.coursSelectionne = null;
  }

  fermerModaleCertificat(): void {
    this.modalCertificatOuverte = false;
    this.certificatSelectionne = null;
  }

  // =====================================================
  // ANALYTICS ET INTERACTIONS
  // =====================================================

  trackCoursClick(cours: CoursComptabilite, action: string): void {
    console.log('📊 Analytics:', {
      action,
      coursId: cours.id,
      coursTitle: cours.titre,
      niveau: cours.niveau,
      timestamp: new Date()
    });
  }

  voirRecommandationsIA(): void {
    this.router.navigate(['/elearning/recommandations']);
  }

  configurerNotifications(): void {
    this.router.navigate(['/elearning/notifications']);
  }

  exporterDonnees(): void {
    console.log('📤 Export des données d\'apprentissage...');
    
    const donnees = {
      progressions: this.mesProgressions,
      certificats: this.mesCertificats,
      badges: this.mesBadges,
      statistiques: this.statistiquesEtudiant,
      dateExport: new Date()
    };

    const blob = new Blob([JSON.stringify(donnees, null, 2)], {
      type: 'application/json'
    });
    
    const lien = document.createElement('a');
    lien.href = URL.createObjectURL(blob);
    lien.download = `elearning-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
  }

  /**
   * Initialise la formation terrain 2018 avec ses spécificités
   */
  private initialiserFormationTerrain(): void {
    // Intégrer la formation 2018 dans le catalogue existant
    this.coursDisponibles = [
      ...this.coursDisponibles,
      this.formationTerrain2018
    ];

    // Configuration spéciale pour la formation terrain
    if (CONFIGURATION_FORMATION_2018.integration.assistantIA) {
      this.activerAssistantFormationTerrain();
    }

    // Charger la progression existante
    this.chargerProgressionFormationTerrain();
  }

  /**
   * Active l'assistant IA spécialisé pour la formation terrain
   */
  private activerAssistantFormationTerrain(): void {
    // Assuming this.assistantIA and this.trackingService are defined elsewhere or will be added.
    // For now, we'll just log the activation.
    console.log('Assistant IA pour la formation terrain 2018 activé.');
  }

  /**
   * Configure le tracking avancé pour analyser l'apprentissage
   */
  private configurerTrackingAvance(): void {
    // Assuming this.trackingService is defined elsewhere or will be added.
    // For now, we'll just log the activation.
    console.log('Tracking avancé pour la formation terrain 2018 activé.');

    // Observer les difficultés spécifiques
    // this.trackingService.observerDifficultes().subscribe(difficulte => {
    //   this.analyticsFormation.difficultesRencontrees.set(
    //     difficulte.concept,
    //     (this.analyticsFormation.difficultesRencontrees.get(difficulte.concept) || 0) + 1
    //   );
      
    //   // Proposer de l'aide basée sur l'expérience 2018
    //   this.proposerAideContextuelle(difficulte);
    // });
  }

  /**
   * Propose une aide contextuelle basée sur l'expérience de formation 2018
   */
  private proposerAideContextuelle(difficulte: any): void {
    const aidesTerrain = {
      'plan_comptable': {
        message: 'Astuce de terrain 2018 : Mémorisez d\'abord les 8 classes principales, puis détaillez progressivement.',
        exerciceRecommande: 'ex_memorisation_classes',
        analogiePratique: 'Pensez aux classes comme aux rayons d\'un supermarché : chaque produit a sa place logique.'
      },
      'ecritures_tva': {
        message: 'Méthode éprouvée 2018 : Toujours calculer HT d\'abord, puis ajouter TVA, puis vérifier le TTC.',
        exerciceRecommande: 'ex_calcul_tva_progressif',
        analogiePratique: 'La TVA c\'est comme la taxe au restaurant : on l\'ajoute au prix du plat.'
      },
      'equilibre_debit_credit': {
        message: 'Règle d\'or enseignée en 2018 : "Tout ce qui entre quelque part doit sortir ailleurs"',
        exerciceRecommande: 'ex_equilibre_basique',
        analogiePratique: 'Comme l\'eau dans des vases communicants : l\'équilibre est automatique.'
      }
    };

    const aide = aidesTerrain[difficulte.concept];
    if (aide) {
      // this.afficherAideContextuelle(aide); // Assuming afficherAideContextuelle is defined
    }
  }

  /**
   * Démarre une session de formation basée sur l'expérience 2018
   */
  demarrerFormationTerrain(): void {
    this.modeFormationExpert = true;
    // Assuming this.coursActuel and this.moduleActuel are defined elsewhere or will be added.
    // this.coursActuel = this.formationTerrain2018;
    // this.moduleActuel = this.formationTerrain2018.modules[0];
    
    // Message d'accueil personnalisé
    // this.afficherMessageAccueil(); // Assuming afficherMessageAccueil is defined
    
    // Démarrer le tracking spécialisé
    // this.demarrerTrackingTerrain(); // Assuming demarrerTrackingTerrain is defined
  }

  /**
   * Affiche un message d'accueil personnalisé pour la formation terrain
   */
  private afficherMessageAccueil(): void {
    // Assuming this.snackBar is defined elsewhere or will be added.
    // this.snackBar.open(message, 'Commencer', { 
    //   duration: 0,
    //   panelClass: ['formation-terrain-snackbar']
    // });
  }

  /**
   * Démarre le tracking spécialisé pour la formation terrain
   */
  private demarrerTrackingTerrain(): void {
    // Assuming this.trackingService is defined elsewhere or will be added.
    // const startTime = Date.now();
    
    // this.analyticsFormation.tempsParModule.set('debut_formation', startTime);
    
    // // Enregistrer le démarrage dans l'historique
    // this.trackingService.enregistrerEvenement({
    //   type: 'formation_terrain_demarree',
    //   cours: this.formationTerrain2018.id,
    //   timestamp: startTime,
    //   metadata: {
    //     source: 'Formation Administrateurs 2018',
    //     version: '1.0',
    //     modeExpert: true
    //   }
    // });
  }

  /**
   * Génère un exercice personnalisé basé sur la méthode 2018
   */
  genererExercicePersonnalise(niveau: string, concept: string): ExercicePratique {
    const templatesTerrain = {
      'facile_achats': {
        contexte: 'Société commerciale à Ouagadougou',
        operation: 'Achat de marchandises avec TVA 18%',
        montantBase: this.genererMontantRealiste(),
        piegesClassiques: ['Oubli TVA déductible', 'Mauvais compte']
      },
      'intermediaire_paie': {
        contexte: 'PME avec 5 salariés',
        operation: 'Calcul et comptabilisation paie mensuelle',
        montantBase: this.genererSalaireRealiste(),
        piegesClassiques: ['Charges patronales oubliées', 'Mauvais taux CNPS']
      },
      'avance_consolidation': {
        contexte: 'Groupe d\'entreprises OHADA',
        operation: 'Écritures de consolidation inter-sociétés',
        montantBase: this.genererMontantGroupe(),
        piegesClassiques: ['Éliminations incomplètes', 'Change non pris en compte']
      }
    };

    const template = templatesTerrain[`${niveau}_${concept}`];
    if (!template) {
      return this.exercicesBonus[0]; // Fallback
    }

    return {
      id: `exercice_terrain_${Date.now()}`,
      titre: `Exercice Terrain : ${template.operation}`,
      description: `Cas inspiré de la formation 2018 - ${template.contexte}`,
      difficulte: niveau as NiveauDifficulte,
      dureeEstimee: this.calculerDureeEstimee(niveau),
      moduleRattache: this.moduleActuel?.id || '',
      
      enonce: this.genererEnonceContextuel(template),
      solution: this.genererSolutionDetaillee(template),
      pointsCles: this.extrairePointsCles(template),
      
      metadata: {
        source: 'Formation Terrain 2018',
        validePar: 'Expert-Comptable',
        niveauFiabilite: 'Premium',
        utiliseEnFormation: true
      }
    };
  }

  /**
   * Génère des montants réalistes selon le contexte OHADA
   */
  private genererMontantRealiste(): number {
    // Montants typiques dans la zone OHADA (en XOF)
    const montantsTypes = [
      250000, 500000, 750000, 1000000, 1500000, 2000000, 2500000, 3000000
    ];
    
    return montantsTypes[Math.floor(Math.random() * montantsTypes.length)];
  }

  /**
   * Active le mode gamification spécial formation terrain
   */
  activerGamificationTerrain(): void {
    if (!CONFIGURATION_FORMATION_2018.gamification.pointsParExercice) return;

    // Assuming this.gamification is defined elsewhere or will be added.
    // this.gamification = {
    //   ...this.gamification,
    //   badgesSpeciaux: [
    //     {
    //       id: 'heritage_2018',
    //       nom: 'Héritier de la Formation 2018',
    //       description: 'A complété la formation terrain avec succès',
    //       icone: '🏆',
    //       conditionsObtention: ['formation_terrain_terminee', 'note_moyenne_sup_15']
    //     },
    //     {
    //       id: 'expert_syscohada_terrain',
    //       nom: 'Expert SYSCOHADA Terrain',
    //       description: 'Maîtrise parfaite des concepts enseignés en 2018',
    //       icone: '🎓',
    //       conditionsObtention: ['tous_exercices_reussis', 'note_moyenne_sup_18']
    //     },
    //     {
    //       id: 'formateur_potentiel',
    //       nom: 'Formateur Potentiel',
    //       description: 'Capable de transmettre les connaissances acquises',
    //       icone: '👨‍🏫',
    //       conditionsObtention: ['aide_autres_apprenants', 'exercices_bonus_completes']
    //     }
    //   ],
      
    //   defisSpeciaux: [
    //     {
    //       id: 'defi_156_apprenants',
    //       nom: 'Défi des 156 Apprenants',
    //       description: 'Rejoindre les 156 apprenants qui ont réussi en 2018',
    //       objectif: 'Compléter tous les modules avec une note ≥ 15/20',
    //       recompense: 500,
    //       dateExpiration: new Date('2024-12-31')
    //     }
    //   ]
    // };
  }

  /**
   * Analyse les performances selon les critères de la formation 2018
   */
  analyserPerformancesTerrain(): any {
    const analyses = {
      conformiteMethode2018: this.evaluerConformiteMethode(),
      progressionComparative: this.comparerAvecCohorte2018(),
      recommandationsPersonnalisees: this.genererRecommandationsTerrain(),
      potentielFormateur: this.evaluerPotentielFormateur()
    };

    return analyses;
  }

  /**
   * Évalue si l'apprenant suit bien la méthode enseignée en 2018
   */
  private evaluerConformiteMethode(): any {
    const criteresMethode2018 = {
      progression_sequentielle: this.verifierProgressionSequentielle(),
      maitrise_fondamentaux: this.verifierMaitriseFondamentaux(),
      application_pratique: this.verifierApplicationPratique(),
      retention_concepts: this.verifierRetentionConcepts()
    };

    const score = Object.values(criteresMethode2018).reduce((acc, val) => acc + (val ? 1 : 0), 0);
    
    return {
      score: (score / 4) * 100,
      details: criteresMethode2018,
      recommandations: this.genererRecommandationsConformite(criteresMethode2018)
    };
  }

  /**
   * Compare les performances avec la cohorte 2018
   */
  private comparerAvecCohorte2018(): any {
    const statsCohorte2018 = {
      noteMoyenne: 16.2,
      tauxReussite: 89.1,
      tempsApprentissageMoyen: 118, // heures
      difficultesPrincipales: ['TVA', 'Écritures de fin d\'exercice', 'Consolidation']
    };

    const performanceActuelle = this.calculerPerformanceActuelle();

    return {
      positionDansCohorte: this.calculerPositionCohorte(performanceActuelle, statsCohorte2018),
      comparaisons: {
        note: {
          actuelle: performanceActuelle.noteMoyenne,
          cohorte2018: statsCohorte2018.noteMoyenne,
          ecart: performanceActuelle.noteMoyenne - statsCohorte2018.noteMoyenne
        },
        temps: {
          actuel: performanceActuelle.tempsTotal,
          cohorte2018: statsCohorte2018.tempsApprentissageMoyen,
          efficacite: (statsCohorte2018.tempsApprentissageMoyen / performanceActuelle.tempsTotal) * 100
        }
      },
      encouragements: this.genererEncouragements(performanceActuelle, statsCohorte2018)
    };
  }

  /**
   * Génère des recommandations personnalisées basées sur l'expérience 2018
   */
  private genererRecommandationsTerrain(): string[] {
    const recommandations: string[] = [];
    
    // Analyser les patterns de difficulté
    const difficultesPrincipales = this.identifierDifficultesPrincipales();
    
    difficultesPrincipales.forEach(difficulte => {
      const conseil = this.obtenirConseilTerrain2018(difficulte);
      if (conseil) {
        recommandations.push(conseil);
      }
    });

    // Ajouter des recommandations générales basées sur l'expérience
    recommandations.push(...this.recommandationsGeneralesTerrain());

    return recommandations;
  }

  /**
   * Obtient un conseil spécifique basé sur l'expérience 2018
   */
  private obtenirConseilTerrain2018(difficulte: string): string | null {
    const conseilsTerrain = {
      'memorisation_comptes': 'Astuce 2018 : Créez des associations mentales avec des objets du quotidien pour retenir les numéros de comptes.',
      'calculs_tva': 'Méthode éprouvée : Utilisez toujours la règle des 3 étapes - HT, TVA, TTC dans cet ordre.',
      'equilibre_ecritures': 'Technique terrain : Dessinez une balance mentale et visualisez l\'équilibre avant de saisir.',
      'organisation_travail': 'Conseil pratique 2018 : Traitez tous les achats, puis toutes les ventes, puis les règlements.',
      'gestion_temps': 'Expérience vécue : 25 minutes de travail intensif + 5 minutes de pause = efficacité maximale.'
    };

    return conseilsTerrain[difficulte] || null;
  }

  /**
   * Recommandations générales issues de l'expérience terrain 2018
   */
  private recommandationsGeneralesTerrain(): string[] {
    return [
      '📚 Révisez quotidiennement 15 minutes plutôt que 2h une fois par semaine',
      '🎯 Pratiquez sur des vrais cas d\'entreprise de votre secteur d\'activité', 
      '👥 Échangez avec d\'autres apprenants pour valider votre compréhension',
      '🔄 Refaites les exercices ratés jusqu\'à les maîtriser parfaitement',
      '📝 Tenez un carnet de notes manuscrit pour les points importants',
      '⚡ Utilisez l\'assistant IA pour clarifier les concepts flous immédiatement'
    ];
  }

  // ... rest of existing methods ...
}