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
  StatutProgression
} from '../../models/elearning.model';

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
}