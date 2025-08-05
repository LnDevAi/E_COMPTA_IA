import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { 
  EntrepriseService 
} from '../../services/entreprise.service';
import { 
  Entreprise, 
  PaysMondial,
  CONTINENTS,
  SYSTEMES_COMPTABLES_PRINCIPAUX
} from '../../models/entreprise.model';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Étapes du processus d'onboarding
  etapeActuelle = 1;
  readonly NOMBRE_ETAPES = 5;
  
  // Forms pour chaque étape
  etape1Form!: FormGroup; // Informations générales
  etape2Form!: FormGroup; // Localisation et système
  etape3Form!: FormGroup; // Paramètres fiscaux
  etape4Form!: FormGroup; // Paramètres sociaux
  etape5Form!: FormGroup; // Validation finale
  
  // Données de référence
  tousLesPays: PaysMondial[] = [];
  paysFiltres: PaysMondial[] = [];
  continents = CONTINENTS;
  systemesComptables = SYSTEMES_COMPTABLES_PRINCIPAUX;
  
  // État de l'application
  chargement = false;
  validationIA: any = null;
  paysSelectionne: PaysMondial | null = null;
  
  // Statistiques pour affichage
  statistiquesMondiales: any = {};

  constructor(
    private fb: FormBuilder,
    private entrepriseService: EntrepriseService,
    private router: Router
  ) {
    this.initialiserForms();
  }

  ngOnInit(): void {
    this.chargerDonnees();
    this.configurerEcouteurs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initialiserForms(): void {
    // Étape 1: Informations générales
    this.etape1Form = this.fb.group({
      raisonSociale: ['', [Validators.required, Validators.minLength(2)]],
      formeJuridique: ['', Validators.required],
      numeroIdentification: ['', Validators.required],
      dateCreation: ['', Validators.required],
      secteurActivite: ['', Validators.required]
    });

    // Étape 2: Localisation et système comptable
    this.etape2Form = this.fb.group({
      continent: ['', Validators.required],
      pays: ['', Validators.required],
      ville: ['', Validators.required],
      codePostal: [''],
      adresseLigne1: ['', Validators.required],
      adresseLigne2: ['']
    });

    // Étape 3: Contact et paramètres
    this.etape3Form = this.fb.group({
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      siteWeb: [''],
      personneContact: ['', Validators.required],
      fonctionContact: ['', Validators.required]
    });

    // Étape 4: Paramètres avancés
    this.etape4Form = this.fb.group({
      exerciceDebut: ['', Validators.required],
      exerciceFin: ['', Validators.required],
      regimeFiscal: ['', Validators.required],
      centreImpots: ['']
    });

    // Étape 5: Validation finale
    this.etape5Form = this.fb.group({
      acceptationCGU: [false, Validators.requiredTrue],
      consentementDonnees: [false, Validators.requiredTrue],
      newsletterInfo: [false]
    });
  }

  private chargerDonnees(): void {
    this.chargement = true;
    
    // Charger tous les pays
    this.tousLesPays = this.entrepriseService.getTousLesPays();
    this.paysFiltres = this.tousLesPays;
    
    // Charger les statistiques mondiales
    this.statistiquesMondiales = this.entrepriseService.getStatistiquesMondiales();
    
    this.chargement = false;
  }

  private configurerEcouteurs(): void {
    // Écouter les changements de continent pour filtrer les pays
    this.etape2Form.get('continent')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(continent => {
        this.filtrerPaysByContinent(continent);
      });

    // Écouter les changements de pays pour charger les spécificités
    this.etape2Form.get('pays')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(nomPays => {
        this.chargerSpecificitesPays(nomPays);
      });
  }

  // =====================================================
  // GESTION DES PAYS ET FILTRES
  // =====================================================

  private filtrerPaysByContinent(continent: string): void {
    if (!continent) {
      this.paysFiltres = this.tousLesPays;
      return;
    }
    
    this.paysFiltres = this.entrepriseService.getPaysByContinent(continent);
    
    // Réinitialiser la sélection du pays si changement de continent
    this.etape2Form.get('pays')?.setValue('');
    this.paysSelectionne = null;
  }

  private chargerSpecificitesPays(nomPays: string): void {
    if (!nomPays) {
      this.paysSelectionne = null;
      return;
    }

    this.paysSelectionne = this.entrepriseService.getPaysByNom(nomPays) || null;
    
    if (this.paysSelectionne) {
      console.log('🌍 Pays sélectionné:', this.paysSelectionne);
      
      // Charger automatiquement les spécificités fiscales et sociales
      this.chargerSpecificitesFiscales();
      this.chargerSpecificitesSociales();
    }
  }

  private chargerSpecificitesFiscales(): void {
    if (!this.paysSelectionne) return;
    
    const specificites = this.entrepriseService.getSpecificitesFiscalesParPays(this.paysSelectionne.nom);
    console.log('💰 Spécificités fiscales:', specificites);
  }

  private chargerSpecificitesSociales(): void {
    if (!this.paysSelectionne) return;
    
    const specificites = this.entrepriseService.getSpecificitesSocialesParPays(this.paysSelectionne.nom);
    console.log('👥 Spécificités sociales:', specificites);
  }

  // =====================================================
  // RECHERCHE ET AUTOCOMPLETE
  // =====================================================

  rechercherPays(terme: string): void {
    if (!terme || terme.length < 2) {
      this.paysFiltres = this.tousLesPays;
      return;
    }
    
    this.paysFiltres = this.entrepriseService.rechercherPays(terme);
  }

  // =====================================================
  // NAVIGATION ENTRE ÉTAPES
  // =====================================================

  peutAvancer(): boolean {
    switch (this.etapeActuelle) {
      case 1: return this.etape1Form.valid;
      case 2: return this.etape2Form.valid;
      case 3: return this.etape3Form.valid;
      case 4: return this.etape4Form.valid;
      case 5: return this.etape5Form.valid;
      default: return false;
    }
  }

  etapeSuivante(): void {
    if (this.peutAvancer() && this.etapeActuelle < this.NOMBRE_ETAPES) {
      this.etapeActuelle++;
      
      // Actions spécifiques selon l'étape
      if (this.etapeActuelle === 5) {
        this.lancerValidationIA();
      }
    }
  }

  etapePrecedente(): void {
    if (this.etapeActuelle > 1) {
      this.etapeActuelle--;
    }
  }

  allerAEtape(etape: number): void {
    if (etape >= 1 && etape <= this.NOMBRE_ETAPES) {
      this.etapeActuelle = etape;
    }
  }

  // =====================================================
  // VALIDATION IA
  // =====================================================

  private lancerValidationIA(): void {
    const entreprise = this.construireEntreprise();
    this.chargement = true;
    this.validationIA = null;

    this.entrepriseService.validerEntrepriseAvecIA(entreprise)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (validation) => {
          this.validationIA = validation;
          this.chargement = false;
          console.log('✅ Validation IA:', validation);
        },
        error: (error) => {
          console.error('❌ Erreur validation IA:', error);
          this.chargement = false;
        }
      });
  }

  relancerValidationIA(): void {
    this.lancerValidationIA();
  }

  // =====================================================
  // CONSTRUCTION ET SAUVEGARDE
  // =====================================================

  private construireEntreprise(): Partial<Entreprise> {
    const etape1 = this.etape1Form.value;
    const etape2 = this.etape2Form.value;
    const etape3 = this.etape3Form.value;
    const etape4 = this.etape4Form.value;

    return {
      // Informations générales
      raisonSociale: etape1.raisonSociale,
      formeJuridique: etape1.formeJuridique,
      numeroIdentification: etape1.numeroIdentification,
      dateCreation: new Date(etape1.dateCreation),
      
      // Adresse
      adresse: {
        pays: etape2.pays,
        continent: etape2.continent,
        region: this.paysSelectionne?.region || '',
        ville: etape2.ville,
        codePostal: etape2.codePostal,
        adresseLigne1: etape2.adresseLigne1,
        adresseLigne2: etape2.adresseLigne2
      },
      
      // Contact
      contact: {
        telephone: etape3.telephone,
        email: etape3.email,
        siteWeb: etape3.siteWeb,
        personneContact: etape3.personneContact,
        fonctionContact: etape3.fonctionContact
      },
      
      // Système comptable (automatique selon pays)
      systemeComptable: this.paysSelectionne ? 
        this.entrepriseService.getSystemeComptableParPays(this.paysSelectionne.nom) : undefined,
      
      // Exercice comptable
      exerciceComptable: {
        dateDebut: new Date(etape4.exerciceDebut),
        dateFin: new Date(etape4.exerciceFin),
        dureeEnMois: this.calculerDureeExercice(etape4.exerciceDebut, etape4.exerciceFin),
        premiereAnnee: true
      },
      
      // Régime fiscal
      regimeFiscal: {
        regime: etape4.regimeFiscal,
        centreImpots: etape4.centreImpots
      },
      
      // Spécificités automatiques selon pays
      specificitesFiscales: this.paysSelectionne ? 
        this.entrepriseService.getSpecificitesFiscalesParPays(this.paysSelectionne.nom) : undefined,
      specificitesSociales: this.paysSelectionne ? 
        this.entrepriseService.getSpecificitesSocialesParPays(this.paysSelectionne.nom) : undefined,
      
      // Métadonnées
      dateCreationProfil: new Date(),
      derniereModification: new Date()
    };
  }

  private calculerDureeExercice(debut: string, fin: string): number {
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);
    const diffMs = dateFin.getTime() - dateDebut.getTime();
    const diffMois = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    return Math.max(1, Math.min(18, diffMois)); // Entre 1 et 18 mois
  }

  // =====================================================
  // FINALISATION
  // =====================================================

  finaliserCreation(): void {
    if (!this.etape5Form.valid || !this.validationIA) {
      return;
    }

    const entreprise = this.construireEntreprise() as Entreprise;
    
    // Ajouter les informations de validation
    entreprise.validationIA = {
      scoreConformite: this.validationIA.scoreConformite,
      pointsVerifies: this.validationIA.pointsVerifies,
      recommandations: this.validationIA.recommandations,
      alertes: this.validationIA.alertes,
      dernierControle: new Date()
    };

    // Documents et statut
    entreprise.documentsOfficiel = [];
    entreprise.statut = entreprise.validationIA.scoreConformite > 80 ? 'ACTIF' : 'EN_CREATION';

    this.chargement = true;

    this.entrepriseService.sauvegarderEntreprise(entreprise)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (succes) => {
          if (succes) {
            console.log('🎉 Entreprise créée avec succès!');
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          console.error('❌ Erreur lors de la sauvegarde:', error);
          this.chargement = false;
        }
      });
  }

  // =====================================================
  // UTILITAIRES POUR LE TEMPLATE
  // =====================================================

  getProgressPourcentage(): number {
    return (this.etapeActuelle / this.NOMBRE_ETAPES) * 100;
  }

  getIconeEtape(etape: number): string {
    if (etape < this.etapeActuelle) return '✅';
    if (etape === this.etapeActuelle) return '📝';
    return '⏳';
  }

  getClasseScoreValidation(): string {
    if (!this.validationIA) return '';
    
    const score = this.validationIA.scoreConformite;
    if (score >= 90) return 'score-excellent';
    if (score >= 75) return 'score-bon';
    if (score >= 60) return 'score-moyen';
    return 'score-faible';
  }

  // =====================================================
  // HELPERS POUR LES FORMULAIRES
  // =====================================================

  get formesJuridiques(): string[] {
    if (!this.paysSelectionne) {
      return ['SARL', 'SA', 'SAS', 'SASU', 'EI', 'EURL', 'GIE'];
    }
    
    // Formes juridiques selon le pays
    if (this.paysSelectionne.region === 'OHADA') {
      return ['SARL', 'SA', 'SAS', 'GIE', 'SNC', 'Société Civile', 'Entreprise Individuelle'];
    }
    
    // Formes par défaut pour autres pays
    return ['Corporation', 'LLC', 'Partnership', 'Sole Proprietorship', 'LTD', 'GmbH', 'SARL'];
  }

  get secteursActivite(): string[] {
    return [
      'Agriculture, sylviculture et pêche',
      'Industries extractives',
      'Industrie manufacturière',
      'Production et distribution électricité, gaz, vapeur',
      'Production et distribution d\'eau',
      'Construction',
      'Commerce de gros et de détail',
      'Transport et entreposage',
      'Hébergement et restauration',
      'Information et communication',
      'Activités financières et d\'assurance',
      'Activités immobilières',
      'Activités spécialisées, scientifiques et techniques',
      'Activités de services administratifs et de soutien',
      'Administration publique',
      'Enseignement',
      'Santé humaine et action sociale',
      'Arts, spectacles et activités récréatives',
      'Autres activités de services',
      'Activités des ménages en tant qu\'employeurs'
    ];
  }

  get regimesFiscaux(): string[] {
    if (!this.paysSelectionne) {
      return ['Régime Normal', 'Régime Simplifié'];
    }
    
    if (this.paysSelectionne.region === 'OHADA') {
      return ['Régime Normal', 'Régime Simplifié de Trésorerie', 'Régime Minimal de Trésorerie'];
    }
    
    return ['Standard Rate', 'Small Business', 'Micro Enterprise', 'Professional'];
  }

  // =====================================================
  // ACTIONS UTILISATEUR
  // =====================================================

  retourAccueil(): void {
    this.router.navigate(['/']);
  }

  ouvrirAide(): void {
    // Ouvrir la documentation d'aide selon l'étape
    console.log('📚 Ouverture aide pour étape:', this.etapeActuelle);
  }

  exporterConfiguration(): void {
    if (this.validationIA) {
      const config = {
        entreprise: this.construireEntreprise(),
        validation: this.validationIA,
        dateExport: new Date()
      };
      
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `configuration-${this.etape1Form.value.raisonSociale || 'entreprise'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}