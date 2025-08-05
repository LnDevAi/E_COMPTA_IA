import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EntrepriseService } from '../services/entreprise.service';
import { 
  Entreprise, 
  PAYS_OHADA, 
  AUTRES_PAYS,
  FORMES_JURIDIQUES, 
  SECTEURS_ACTIVITE,
  TypeDocument,
  DocumentOfficiel,
  ValidationIA,
  StatutValidation
} from '../models/entreprise.model';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {
  
  // Étapes du processus
  etapeActuelle = 1;
  totalEtapes = 5;
  
  // Formulaires pour chaque étape
  formsEtapes: FormGroup[] = [];
  
  // Données
  entreprise: Entreprise;
  tousLesPays = [...PAYS_OHADA, ...AUTRES_PAYS];
  formesJuridiques = FORMES_JURIDIQUES;
  secteursActivite = SECTEURS_ACTIVITE;
  
  // États de l'interface
  chargementValidation = false;
  resultatsValidationIA: ValidationIA | null = null;
  documentsUploades: DocumentOfficiel[] = [];
  
  // Messages et alertes
  messageSucces = '';
  messageErreur = '';

  constructor(
    private fb: FormBuilder,
    private entrepriseService: EntrepriseService
  ) {
    this.entreprise = this.entrepriseService.creerNouvelleEntreprise();
  }

  ngOnInit(): void {
    this.initialiserFormulaires();
  }

  initialiserFormulaires(): void {
    // Étape 1: Informations de base
    this.formsEtapes[0] = this.fb.group({
      raisonSociale: ['', [Validators.required, Validators.minLength(3)]],
      sigle: [''],
      formeJuridique: ['', Validators.required],
      secteurActivite: ['', Validators.required],
      dateCreation: ['', Validators.required],
      capitalSocial: [0, [Validators.min(0)]]
    });

    // Étape 2: Localisation et système comptable
    this.formsEtapes[1] = this.fb.group({
      pays: ['', Validators.required],
      ville: ['', Validators.required],
      adresseComplete: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Étape 3: Informations légales et fiscales
    this.formsEtapes[2] = this.fb.group({
      numeroRegistreCommerce: [''],
      numeroIFU: ['', [Validators.pattern(/^\d{12}$/)]],
      numeroSocial: [''],
      numeroTVA: [''],
      regimeFiscalType: ['REEL_NORMAL', Validators.required]
    });

    // Étape 4: Coordonnées et contact
    this.formsEtapes[3] = this.fb.group({
      telephone: ['', [Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]],
      email: ['', [Validators.email]],
      siteWeb: ['', [Validators.pattern(/^https?:\/\/.+/)]]
    });

    // Étape 5: Exercice comptable
    this.formsEtapes[4] = this.fb.group({
      dateDebutExercice: ['', Validators.required],
      dateFinExercice: ['', Validators.required],
      monnaie: ['XOF', Validators.required],
      tauxTVA: [18, [Validators.required, Validators.min(0), Validators.max(50)]]
    });
  }

  // Navigation entre étapes
  etapeSuivante(): void {
    if (this.formsEtapes[this.etapeActuelle - 1].valid) {
      this.sauvegarderEtapeActuelle();
      
      if (this.etapeActuelle < this.totalEtapes) {
        this.etapeActuelle++;
        this.messageErreur = '';
      }
    } else {
      this.messageErreur = 'Veuillez compléter tous les champs obligatoires';
      this.marquerChampsCommeTouches(this.formsEtapes[this.etapeActuelle - 1]);
    }
  }

  etapePrecedente(): void {
    if (this.etapeActuelle > 1) {
      this.etapeActuelle--;
      this.messageErreur = '';
    }
  }

  allerAEtape(numeroEtape: number): void {
    if (numeroEtape <= this.etapeActuelle || this.peutAccederEtape(numeroEtape)) {
      this.etapeActuelle = numeroEtape;
    }
  }

  private peutAccederEtape(numeroEtape: number): boolean {
    // Vérifier si toutes les étapes précédentes sont complètes
    for (let i = 0; i < numeroEtape - 1; i++) {
      if (!this.formsEtapes[i].valid) {
        return false;
      }
    }
    return true;
  }

  // Sauvegarde des données de l'étape
  sauvegarderEtapeActuelle(): void {
    const formData = this.formsEtapes[this.etapeActuelle - 1].value;
    
    switch (this.etapeActuelle) {
      case 1:
        Object.assign(this.entreprise, formData);
        break;
      case 2:
        Object.assign(this.entreprise, formData);
        this.mettreAJourSystemeComptable();
        break;
      case 3:
        Object.assign(this.entreprise, formData);
        this.configurerRegimeFiscal();
        break;
      case 4:
        Object.assign(this.entreprise, formData);
        break;
      case 5:
        this.configurerExerciceComptable(formData);
        break;
    }
  }

  // Mise à jour automatique du système comptable selon le pays
  mettreAJourSystemeComptable(): void {
    if (this.entreprise.pays) {
      this.entreprise.systemeComptable = this.entrepriseService.getSystemeComptableParPays(this.entreprise.pays);
      
      // Mise à jour automatique de la monnaie
      const paysInfo = this.tousLesPays.find(p => p.code === this.entreprise.pays);
      if (paysInfo) {
        this.entreprise.monnaie = paysInfo.monnaie;
        this.formsEtapes[4].patchValue({ monnaie: paysInfo.monnaie });
        
        // Charger les spécificités fiscales du pays
        this.entreprise.specificitesFiscales = this.entrepriseService.getSpecificitesFiscalesParPays(this.entreprise.pays);
      }
    }
  }

  // Configuration du régime fiscal
  configurerRegimeFiscal(): void {
    const regimeType = this.formsEtapes[2].value.regimeFiscalType;
    
    this.entreprise.regimeFiscal = {
      type: regimeType,
      description: this.getDescriptionRegimeFiscal(regimeType),
      obligationsComptables: this.getObligationsComptables(regimeType)
    };
  }

  private getDescriptionRegimeFiscal(type: string): string {
    const descriptions: { [key: string]: string } = {
      'REEL_NORMAL': 'Régime réel normal - Comptabilité complète obligatoire',
      'REEL_SIMPLIFIE': 'Régime réel simplifié - Comptabilité allégée',
      'SYNTHETIQUE': 'Régime synthétique - Obligations réduites',
      'MICRO_ENTREPRISE': 'Micro-entreprise - Déclarations simplifiées'
    };
    return descriptions[type] || '';
  }

  private getObligationsComptables(type: string): string[] {
    const obligations: { [key: string]: string[] } = {
      'REEL_NORMAL': [
        'Tenue d\'une comptabilité complète',
        'États financiers annuels',
        'Déclarations TVA mensuelles',
        'Audit annuel obligatoire'
      ],
      'REEL_SIMPLIFIE': [
        'Comptabilité simplifiée',
        'Bilan et compte de résultat',
        'Déclarations TVA trimestrielles'
      ],
      'SYNTHETIQUE': [
        'Livre des recettes et dépenses',
        'Déclaration annuelle',
        'Justificatifs obligatoires'
      ],
      'MICRO_ENTREPRISE': [
        'Livre des recettes',
        'Déclaration simplifiée',
        'Seuils de CA limités'
      ]
    };
    return obligations[type] || [];
  }

  // Configuration exercice comptable
  configurerExerciceComptable(formData: any): void {
    const dateDebut = new Date(formData.dateDebutExercice);
    const dateFin = new Date(formData.dateFinExercice);
    
    this.entreprise.exerciceComptable = {
      dateDebut,
      dateFin,
      dureeEnMois: this.calculerDureeExercice(dateDebut, dateFin),
      statut: 'EN_PREPARATION'
    };
    
    this.entreprise.monnaie = formData.monnaie;
    this.entreprise.tauxTVA = formData.tauxTVA;
  }

  private calculerDureeExercice(debut: Date, fin: Date): number {
    const diffTime = fin.getTime() - debut.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.round(diffDays / 30.44); // Moyenne jours par mois
  }

  // Upload documents
  onFileSelected(event: any, typeDocument: TypeDocument): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploaderDocument(file, typeDocument);
    }
  }

  uploaderDocument(file: File, type: TypeDocument): void {
    this.entrepriseService.uploaderDocument(file, type).subscribe({
      next: (document) => {
        this.documentsUploades.push(document);
        this.entreprise.documentsOfficiels = [...this.documentsUploades];
        this.messageSucces = `Document ${document.nom} uploadé avec succès`;
        
        // Auto-remplissage si extraction réussie
        if (document.numeroDocument && document.statutValidation === StatutValidation.VALIDE) {
          this.remplirNumeroAutomatiquement(document);
        }
      },
      error: (error) => {
        this.messageErreur = 'Erreur lors de l\'upload du document';
      }
    });
  }

  private remplirNumeroAutomatiquement(document: DocumentOfficiel): void {
    if (document.type === TypeDocument.IFU) {
      this.formsEtapes[2].patchValue({ numeroIFU: document.numeroDocument });
    } else if (document.type === TypeDocument.REGISTRE_COMMERCE) {
      this.formsEtapes[2].patchValue({ numeroRegistreCommerce: document.numeroDocument });
    }
  }

  // Validation finale avec IA
  validerAvecIA(): void {
    this.sauvegarderEtapeActuelle();
    this.chargementValidation = true;
    
    this.entrepriseService.validerEntrepriseAvecIA(this.entreprise).subscribe({
      next: (validation) => {
        this.resultatsValidationIA = validation;
        this.chargementValidation = false;
        
        if (validation.score >= 80) {
          this.messageSucces = `Validation réussie ! Score: ${validation.score}/100`;
        } else {
          this.messageErreur = `Validation incomplète. Score: ${validation.score}/100. Veuillez corriger les points signalés.`;
        }
      },
      error: (error) => {
        this.chargementValidation = false;
        this.messageErreur = 'Erreur lors de la validation IA';
      }
    });
  }

  // Finalisation et sauvegarde
  finaliserOnboarding(): void {
    this.entrepriseService.sauvegarderEntreprise(this.entreprise).subscribe({
      next: (entrepriseSauvee) => {
        this.messageSucces = 'Entreprise créée avec succès ! Vous pouvez maintenant accéder à tous les modules.';
        // Redirection vers dashboard après 3 secondes
        setTimeout(() => {
          // Navigation vers dashboard
        }, 3000);
      },
      error: (error) => {
        this.messageErreur = 'Erreur lors de la sauvegarde';
      }
    });
  }

  // Utilitaires
  private marquerChampsCommeTouches(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  getClasseStatutValidation(statut: string): string {
    const classes: { [key: string]: string } = {
      'VALIDE': 'statut-valide',
      'EN_ATTENTE': 'statut-attente',
      'REJETE': 'statut-rejete',
      'VERIFICATION_MANUELLE': 'statut-verification'
    };
    return classes[statut] || '';
  }

  getPourcentageProgression(): number {
    return (this.etapeActuelle / this.totalEtapes) * 100;
  }

  // Types de documents pour template
  TypeDocument = TypeDocument;
  StatutValidation = StatutValidation;
}