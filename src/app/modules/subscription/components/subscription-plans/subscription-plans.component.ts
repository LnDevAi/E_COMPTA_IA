import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { SubscriptionService } from '../../services/subscription.service';
import { EntrepriseService } from '../../../entreprise/services/entreprise.service';
import {
  PlanAbonnement,
  TypePaiement,
  OperateurMobileMoney,
  PeriodeFacturation,
  TarifRegional,
  obtenirTarifPourRegion,
  calculerPrixAvecReduction
} from '../../models/subscription.model';

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss']
})
export class SubscriptionPlansComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() paysUtilisateur: string = 'France';
  @Input() devisePreferee: string = 'EUR';
  @Input() modeAffichage: 'selection' | 'comparaison' | 'upgrade' = 'selection';

  // Données des plans
  plansDisponibles: PlanAbonnement[] = [];
  planSelectionne: PlanAbonnement | null = null;
  tarifLocal: TarifRegional | null = null;
  
  // Configuration d'affichage
  periodeAffichage: PeriodeFacturation = PeriodeFacturation.MENSUEL;
  readonly periodesDisponibles = [
    { valeur: PeriodeFacturation.MENSUEL, label: 'Mensuel', icon: '📅' },
    { valeur: PeriodeFacturation.ANNUEL, label: 'Annuel', icon: '🗓️', badge: 'Économisez 17%' }
  ];

  // État du composant
  chargement = true;
  erreur: string | null = null;
  
  // Formulaire de paiement
  paiementForm!: FormGroup;
  etapeActuelle: 'plans' | 'paiement' | 'confirmation' = 'plans';
  
  // Méthodes de paiement
  methodesDisponibles: TypePaiement[] = [];
  operateursMobileMoney: OperateurMobileMoney[] = [];
  methodePaiementSelectionnee: TypePaiement | null = null;
  
  // Traitement paiement
  traitementPaiement = false;
  resultaPaiement: any = null;

  constructor(
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService,
    private entrepriseService: EntrepriseService,
    private router: Router
  ) {
    this.initialiserFormulaire();
  }

  ngOnInit(): void {
    this.chargerDonnees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initialiserFormulaire(): void {
    this.paiementForm = this.fb.group({
      // Informations générales
      periodeFacturation: [PeriodeFacturation.MENSUEL, Validators.required],
      codePromo: [''],
      
      // Méthode de paiement
      typePaiement: ['', Validators.required],
      
      // Carte de crédit
      numeroCarte: [''],
      dateExpiration: [''],
      cvv: [''],
      nomPorteur: [''],
      
      // Mobile Money
      operateurMM: [''],
      numeroTelephone: [''],
      nomTitulaireMM: [''],
      
      // Virement bancaire
      iban: [''],
      bic: [''],
      nomTitulaireVirement: [''],
      
      // PayPal
      emailPayPal: [''],
      
      // Conditions
      accepterConditions: [false, Validators.requiredTrue],
      accepterNewsletter: [false]
    });

    // Écouter les changements de méthode de paiement
    this.paiementForm.get('typePaiement')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.methodePaiementSelectionnee = type;
        this.mettreAJourValidateurs(type);
      });

    // Écouter les changements de période
    this.paiementForm.get('periodeFacturation')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(periode => {
        this.periodeAffichage = periode;
      });
  }

  private chargerDonnees(): void {
    this.chargement = true;
    
    combineLatest([
      this.subscriptionService.getPlansParPays(this.paysUtilisateur),
      this.subscriptionService.getMethodesPaiementParPays(this.paysUtilisateur),
      this.subscriptionService.getOperateursMobileMoneyParPays(this.paysUtilisateur)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([plans, methodes, operateurs]) => {
        this.plansDisponibles = plans;
        this.methodesDisponibles = methodes;
        this.operateursMobileMoney = operateurs;
        this.chargement = false;
        
        console.log('📦 Plans chargés:', plans);
        console.log('💳 Méthodes disponibles:', methodes);
        console.log('📱 Opérateurs MM:', operateurs);
      },
      error: (error) => {
        console.error('❌ Erreur chargement données:', error);
        this.erreur = 'Impossible de charger les plans d\'abonnement';
        this.chargement = false;
      }
    });
  }

  // =====================================================
  // SÉLECTION DE PLAN
  // =====================================================

  selectionnerPlan(plan: PlanAbonnement): void {
    this.planSelectionne = plan;
    this.tarifLocal = obtenirTarifPourRegion(plan, this.paysUtilisateur);
    
    console.log('🎯 Plan sélectionné:', plan.nom);
    console.log('💰 Tarif local:', this.tarifLocal);
    
    if (plan.prixMensuel === 0) {
      // Plan gratuit - création directe
      this.creerAbonnementGratuit(plan);
    } else {
      // Plan payant - aller à l'étape paiement
      this.etapeActuelle = 'paiement';
    }
  }

  private creerAbonnementGratuit(plan: PlanAbonnement): void {
    this.traitementPaiement = true;
    
    const methodePaiementFactice = {
      id: 'gratuit',
      type: TypePaiement.CARTE_CREDIT,
      nom: 'Plan Gratuit',
      actif: true,
      defaut: true,
      dateAjout: new Date()
    };

    this.subscriptionService.creerAbonnement(
      plan.id,
      methodePaiementFactice,
      this.periodeAffichage
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (abonnement) => {
        console.log('✅ Abonnement gratuit créé:', abonnement);
        this.etapeActuelle = 'confirmation';
        this.resultaPaiement = {
          succes: true,
          abonnement: abonnement,
          message: 'Votre abonnement gratuit a été activé avec succès!'
        };
        this.traitementPaiement = false;
      },
      error: (error) => {
        console.error('❌ Erreur création abonnement gratuit:', error);
        this.traitementPaiement = false;
      }
    });
  }

  // =====================================================
  // CALCULS DE PRIX
  // =====================================================

  obtenirPrixAffiche(plan: PlanAbonnement): number {
    const tarif = this.tarifLocal || obtenirTarifPourRegion(plan, this.paysUtilisateur);
    
    if (tarif) {
      return this.periodeAffichage === PeriodeFacturation.MENSUEL ? 
        tarif.prixMensuel : tarif.prixAnnuel;
    }
    
    return this.periodeAffichage === PeriodeFacturation.MENSUEL ? 
      plan.prixMensuel : plan.prixAnnuel;
  }

  obtenirDeviseAffichee(plan: PlanAbonnement): string {
    const tarif = obtenirTarifPourRegion(plan, this.paysUtilisateur);
    return tarif ? tarif.devise : plan.deviseBase;
  }

  calculerEconomieAnnuelle(plan: PlanAbonnement): number {
    const prixMensuel = this.obtenirPrixAffiche(plan);
    const prixAnnuel = this.obtenirPrixAffiche(plan);
    
    if (this.periodeAffichage === PeriodeFacturation.ANNUEL) {
      const prixMensuelEquivalent = prixMensuel * 12;
      return prixMensuelEquivalent - prixAnnuel;
    }
    
    return 0;
  }

  // =====================================================
  // TRAITEMENT PAIEMENT
  // =====================================================

  private mettreAJourValidateurs(typePaiement: TypePaiement): void {
    // Réinitialiser tous les validateurs
    const controles = ['numeroCarte', 'dateExpiration', 'cvv', 'nomPorteur',
                       'operateurMM', 'numeroTelephone', 'nomTitulaireMM',
                       'iban', 'bic', 'nomTitulaireVirement', 'emailPayPal'];
    
    controles.forEach(nom => {
      const controle = this.paiementForm.get(nom);
      if (controle) {
        controle.clearValidators();
        controle.updateValueAndValidity();
      }
    });

    // Ajouter les validateurs spécifiques
    switch (typePaiement) {
      case TypePaiement.CARTE_CREDIT:
        this.paiementForm.get('numeroCarte')?.setValidators([Validators.required]);
        this.paiementForm.get('dateExpiration')?.setValidators([Validators.required]);
        this.paiementForm.get('cvv')?.setValidators([Validators.required]);
        this.paiementForm.get('nomPorteur')?.setValidators([Validators.required]);
        break;
        
      case TypePaiement.MOBILE_MONEY:
        this.paiementForm.get('operateurMM')?.setValidators([Validators.required]);
        this.paiementForm.get('numeroTelephone')?.setValidators([Validators.required]);
        this.paiementForm.get('nomTitulaireMM')?.setValidators([Validators.required]);
        break;
        
      case TypePaiement.VIREMENT_BANCAIRE:
        this.paiementForm.get('iban')?.setValidators([Validators.required]);
        this.paiementForm.get('nomTitulaireVirement')?.setValidators([Validators.required]);
        break;
        
      case TypePaiement.PAYPAL:
        this.paiementForm.get('emailPayPal')?.setValidators([Validators.required, Validators.email]);
        break;
    }

    // Mettre à jour la validité
    controles.forEach(nom => {
      this.paiementForm.get(nom)?.updateValueAndValidity();
    });
  }

  traiterPaiement(): void {
    if (!this.planSelectionne || !this.paiementForm.valid) {
      console.log('❌ Formulaire invalide ou plan non sélectionné');
      return;
    }

    this.traitementPaiement = true;
    const formData = this.paiementForm.value;
    const montant = this.obtenirPrixAffiche(this.planSelectionne);
    const devise = this.obtenirDeviseAffichee(this.planSelectionne);

    console.log('💳 Traitement paiement:', {
      plan: this.planSelectionne.nom,
      montant: montant,
      devise: devise,
      methode: formData.typePaiement
    });

    // Traitement selon la méthode
    let paiementObservable;

    switch (formData.typePaiement) {
      case TypePaiement.CARTE_CREDIT:
        paiementObservable = this.subscriptionService.traiterPaiementCarte(
          montant,
          devise,
          {
            number: formData.numeroCarte,
            expiry: formData.dateExpiration,
            cvv: formData.cvv,
            name: formData.nomPorteur
          },
          `Abonnement ${this.planSelectionne.nom}`
        );
        break;
        
      case TypePaiement.MOBILE_MONEY:
        paiementObservable = this.subscriptionService.traiterPaiementMobileMoney(
          montant,
          devise,
          formData.operateurMM,
          formData.numeroTelephone,
          `Abonnement ${this.planSelectionne.nom}`
        );
        break;
        
      case TypePaiement.PAYPAL:
        paiementObservable = this.subscriptionService.traiterPaiementPayPal(
          montant,
          devise,
          `Abonnement ${this.planSelectionne.nom}`
        );
        break;
        
      case TypePaiement.VIREMENT_BANCAIRE:
        paiementObservable = this.subscriptionService.traiterPaiementVirement(
          montant,
          devise,
          {
            iban: formData.iban,
            bic: formData.bic,
            nom: formData.nomTitulaireVirement
          },
          `Abonnement ${this.planSelectionne.nom}`
        );
        break;
        
      default:
        this.traitementPaiement = false;
        return;
    }

    paiementObservable.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (resultatPaiement) => {
        console.log('✅ Paiement réussi:', resultatPaiement);
        this.creerAbonnementApresePaiement(resultatPaiement);
      },
      error: (error) => {
        console.error('❌ Erreur paiement:', error);
        this.resultaPaiement = {
          succes: false,
          erreur: error.message || 'Erreur lors du traitement du paiement'
        };
        this.etapeActuelle = 'confirmation';
        this.traitementPaiement = false;
      }
    });
  }

  private creerAbonnementApresePaiement(resultatPaiement: any): void {
    if (!this.planSelectionne) return;

    const methodePaiement = this.construireMethodePaiement(resultatPaiement);
    
    this.subscriptionService.creerAbonnement(
      this.planSelectionne.id,
      methodePaiement,
      this.paiementForm.value.periodeFacturation,
      this.paiementForm.value.codePromo
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (abonnement) => {
        console.log('✅ Abonnement créé:', abonnement);
        this.resultaPaiement = {
          succes: true,
          abonnement: abonnement,
          paiement: resultatPaiement,
          message: 'Votre abonnement a été activé avec succès!'
        };
        this.etapeActuelle = 'confirmation';
        this.traitementPaiement = false;
      },
      error: (error) => {
        console.error('❌ Erreur création abonnement:', error);
        this.resultaPaiement = {
          succes: false,
          erreur: 'Paiement réussi mais erreur lors de la création de l\'abonnement'
        };
        this.etapeActuelle = 'confirmation';
        this.traitementPaiement = false;
      }
    });
  }

  private construireMethodePaiement(resultatPaiement: any): any {
    const formData = this.paiementForm.value;
    
    const methodePaiement = {
      id: resultatPaiement.id || `pm_${Date.now()}`,
      type: formData.typePaiement,
      nom: this.obtenirNomMethodePaiement(formData.typePaiement),
      actif: true,
      defaut: true,
      dateAjout: new Date()
    };

    // Ajouter les détails spécifiques
    switch (formData.typePaiement) {
      case TypePaiement.CARTE_CREDIT:
        methodePaiement.detailsCarte = {
          dernierQuatreChiffres: formData.numeroCarte.slice(-4),
          marque: 'visa', // À déterminer selon le numéro
          typeCompte: 'credit',
          moisExpiration: parseInt(formData.dateExpiration.split('/')[0]),
          anneeExpiration: parseInt(formData.dateExpiration.split('/')[1]),
          nomPorteur: formData.nomPorteur,
          paysEmission: this.paysUtilisateur
        };
        break;
        
      case TypePaiement.MOBILE_MONEY:
        methodePaiement.detailsMobileMoney = {
          operateur: formData.operateurMM,
          numeroTelephone: formData.numeroTelephone,
          nomTitulaire: formData.nomTitulaireMM,
          pays: this.paysUtilisateur,
          limiteMensuelle: 1000000,
          limiteTransaction: 250000,
          niveauVerification: 'niveau_2'
        };
        break;
        
      case TypePaiement.PAYPAL:
        methodePaiement.detailsPayPal = {
          emailPayPal: formData.emailPayPal,
          nomCompte: formData.emailPayPal,
          typeCompte: 'professionnel',
          paysCompte: this.paysUtilisateur
        };
        break;
        
      case TypePaiement.VIREMENT_BANCAIRE:
        methodePaiement.detailsVirement = {
          iban: formData.iban,
          bic: formData.bic,
          nomTitulaire: formData.nomTitulaireVirement,
          delaiTraitement: 1
        };
        break;
    }

    return methodePaiement;
  }

  private obtenirNomMethodePaiement(type: TypePaiement): string {
    switch (type) {
      case TypePaiement.CARTE_CREDIT: return 'Carte de crédit';
      case TypePaiement.MOBILE_MONEY: return 'Mobile Money';
      case TypePaiement.PAYPAL: return 'PayPal';
      case TypePaiement.VIREMENT_BANCAIRE: return 'Virement bancaire';
      default: return 'Méthode de paiement';
    }
  }

  // =====================================================
  // ACTIONS UTILISATEUR
  // =====================================================

  retourPlans(): void {
    this.etapeActuelle = 'plans';
    this.planSelectionne = null;
    this.paiementForm.reset();
  }

  terminerProcessus(): void {
    if (this.resultaPaiement?.succes) {
      // Rediriger vers le dashboard ou la page d'accueil
      this.router.navigate(['/dashboard']);
    } else {
      // Retourner aux plans en cas d'erreur
      this.retourPlans();
    }
  }

  togglePeriode(): void {
    this.periodeAffichage = this.periodeAffichage === PeriodeFacturation.MENSUEL ? 
      PeriodeFacturation.ANNUEL : PeriodeFacturation.MENSUEL;
    
    this.paiementForm.patchValue({
      periodeFacturation: this.periodeAffichage
    });
  }

  // =====================================================
  // HELPERS POUR LE TEMPLATE
  // =====================================================

  estPlanPopulaire(plan: PlanAbonnement): boolean {
    return plan.populaire;
  }

  estPlanSelectionne(plan: PlanAbonnement): boolean {
    return this.planSelectionne?.id === plan.id;
  }

  obtenirClassePlan(plan: PlanAbonnement): string {
    let classes = ['plan-card'];
    
    if (this.estPlanPopulaire(plan)) {
      classes.push('plan-populaire');
    }
    
    if (this.estPlanSelectionne(plan)) {
      classes.push('plan-selectionne');
    }
    
    if (plan.prixMensuel === 0) {
      classes.push('plan-gratuit');
    }
    
    return classes.join(' ');
  }

  obtenirIconeMethodePaiement(type: TypePaiement): string {
    switch (type) {
      case TypePaiement.CARTE_CREDIT: return '💳';
      case TypePaiement.MOBILE_MONEY: return '📱';
      case TypePaiement.PAYPAL: return '💙';
      case TypePaiement.VIREMENT_BANCAIRE: return '🏦';
      default: return '💰';
    }
  }

  obtenirLabelOperateurMM(operateur: OperateurMobileMoney): string {
    switch (operateur) {
      case OperateurMobileMoney.ORANGE_MONEY: return 'Orange Money';
      case OperateurMobileMoney.MTN_MONEY: return 'MTN Money';
      case OperateurMobileMoney.MOOV_MONEY: return 'Moov Money';
      case OperateurMobileMoney.WAVE: return 'Wave';
      case OperateurMobileMoney.M_PESA: return 'M-Pesa';
      case OperateurMobileMoney.AIRTEL_MONEY: return 'Airtel Money';
      default: return operateur;
    }
  }

  formatMontant(montant: number, devise: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise
    }).format(montant);
  }

  // =====================================================
  // MÉTHODES DE VALIDATION
  // =====================================================

  estFormulairePaiementValide(): boolean {
    return this.paiementForm.valid && this.planSelectionne !== null;
  }

  obtenirMessageErreur(champNom: string): string {
    const champ = this.paiementForm.get(champNom);
    if (champ?.errors) {
      if (champ.errors['required']) {
        return 'Ce champ est requis';
      }
      if (champ.errors['email']) {
        return 'Email invalide';
      }
    }
    return '';
  }
}