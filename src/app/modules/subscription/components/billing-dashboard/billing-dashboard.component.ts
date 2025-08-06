import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

import { SubscriptionService } from '../../services/subscription.service';
import {
  Abonnement,
  UtilisationRessources,
  Facture,
  StatutAbonnement,
  StatutFacture,
  PeriodeFacturation
} from '../../models/subscription.model';

interface AnalyticsData {
  revenusTotal: number;
  revenusMois: number;
  revenusAnnuels: number;
  facturesEnAttente: number;
  facturesPayees: number;
  tauxPaiement: number;
  evolutionRevenu: { mois: string; montant: number }[];
  repartitionPlans: { plan: string; pourcentage: number; couleur: string }[];
  alertes: AlerteFacturation[];
}

interface AlerteFacturation {
  type: 'warning' | 'danger' | 'info';
  titre: string;
  message: string;
  action?: string;
  url?: string;
}

@Component({
  selector: 'app-billing-dashboard',
  templateUrl: './billing-dashboard.component.html',
  styleUrls: ['./billing-dashboard.component.scss']
})
export class BillingDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Données principales
  abonnementActuel: Abonnement | null = null;
  utilisationActuelle: UtilisationRessources | null = null;
  factures: Facture[] = [];
  
  // Analytics et statistiques
  analytics: AnalyticsData | null = null;
  statistiquesUtilisation: any = {};
  resumeAbonnement: any = null;

  // État de l'interface
  chargement = true;
  erreur: string | null = null;
  ongletActif: 'overview' | 'usage' | 'invoices' | 'analytics' = 'overview';

  // Périodes et filtres
  periodeSelectionnee: 'semaine' | 'mois' | 'trimestre' | 'annee' = 'mois';
  readonly periodesDisponibles = [
    { value: 'semaine', label: 'Cette semaine', icon: '📅' },
    { value: 'mois', label: 'Ce mois', icon: '📆' },
    { value: 'trimestre', label: 'Ce trimestre', icon: '🗓️' },
    { value: 'annee', label: 'Cette année', icon: '📊' }
  ];

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
    this.configurerActualisationAutomatique();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================

  private chargerDonnees(): void {
    this.chargement = true;
    this.erreur = null;

    combineLatest([
      this.subscriptionService.getAbonnementActuel(),
      this.subscriptionService.getUtilisationActuelle(),
      this.subscriptionService.getFactures(),
      this.subscriptionService.getStatistiquesUtilisation(),
      this.subscriptionService.getResumeAbonnement()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([abonnement, utilisation, factures, stats, resume]) => {
        this.abonnementActuel = abonnement;
        this.utilisationActuelle = utilisation;
        this.factures = factures.sort((a, b) => 
          new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
        );
        this.statistiquesUtilisation = stats;
        this.resumeAbonnement = resume;
        
        this.genererAnalytics();
        this.chargement = false;
        
        console.log('📊 Données de facturation chargées:', {
          abonnement,
          utilisation,
          factures: factures.length,
          stats
        });
      },
      error: (error) => {
        console.error('❌ Erreur chargement facturation:', error);
        this.erreur = 'Impossible de charger les données de facturation';
        this.chargement = false;
      }
    });
  }

  private configurerActualisationAutomatique(): void {
    // Actualisation toutes les 5 minutes
    interval(300000).pipe(
      takeUntil(this.destroy$),
      startWith(0),
      switchMap(() => this.subscriptionService.getUtilisationActuelle())
    ).subscribe(utilisation => {
      this.utilisationActuelle = utilisation;
    });
  }

  // =====================================================
  // GÉNÉRATION DES ANALYTICS
  // =====================================================

  private genererAnalytics(): void {
    if (!this.factures || this.factures.length === 0) {
      this.analytics = this.creerAnalyticsVides();
      return;
    }

    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    const debutAnnee = new Date(maintenant.getFullYear(), 0, 1);

    // Calculs des revenus
    const revenusTotal = this.factures
      .filter(f => f.statut === StatutFacture.PAYEE)
      .reduce((total, f) => total + f.montantTTC, 0);

    const revenusMois = this.factures
      .filter(f => f.statut === StatutFacture.PAYEE && new Date(f.datePaiement!) >= debutMois)
      .reduce((total, f) => total + f.montantTTC, 0);

    const revenusAnnuels = this.factures
      .filter(f => f.statut === StatutFacture.PAYEE && new Date(f.datePaiement!) >= debutAnnee)
      .reduce((total, f) => total + f.montantTTC, 0);

    // Statistiques des factures
    const facturesPayees = this.factures.filter(f => f.statut === StatutFacture.PAYEE).length;
    const facturesEnAttente = this.factures.filter(f => 
      f.statut === StatutFacture.ENVOYEE || f.statut === StatutFacture.EN_RETARD
    ).length;

    const tauxPaiement = this.factures.length > 0 ? 
      (facturesPayees / this.factures.length) * 100 : 0;

    // Évolution des revenus
    const evolutionRevenu = this.calculerEvolutionRevenu();

    // Répartition des plans
    const repartitionPlans = this.calculerRepartitionPlans();

    // Alertes
    const alertes = this.genererAlertes();

    this.analytics = {
      revenusTotal,
      revenusMois,
      revenusAnnuels,
      facturesEnAttente,
      facturesPayees,
      tauxPaiement,
      evolutionRevenu,
      repartitionPlans,
      alertes
    };
  }

  private creerAnalyticsVides(): AnalyticsData {
    return {
      revenusTotal: 0,
      revenusMois: 0,
      revenusAnnuels: 0,
      facturesEnAttente: 0,
      facturesPayees: 0,
      tauxPaiement: 0,
      evolutionRevenu: [],
      repartitionPlans: [],
      alertes: []
    };
  }

  private calculerEvolutionRevenu(): { mois: string; montant: number }[] {
    const derniersMois = [];
    const maintenant = new Date();

    // Derniers 6 mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const moisSuivant = new Date(maintenant.getFullYear(), maintenant.getMonth() - i + 1, 1);
      
      const revenus = this.factures
        .filter(f => 
          f.statut === StatutFacture.PAYEE &&
          new Date(f.datePaiement!) >= date &&
          new Date(f.datePaiement!) < moisSuivant
        )
        .reduce((total, f) => total + f.montantTTC, 0);

      derniersMois.push({
        mois: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        montant: revenus
      });
    }

    return derniersMois;
  }

  private calculerRepartitionPlans(): { plan: string; pourcentage: number; couleur: string }[] {
    if (!this.abonnementActuel) return [];

    const couleurs = ['#2D5530', '#F4A942', '#1B4332', '#10B981'];
    const plans = ['Starter', 'Professional', 'Enterprise', 'Multinational'];
    
    // Simulation de répartition (dans un vrai système, cela viendrait des analytics)
    return plans.map((plan, index) => ({
      plan,
      pourcentage: index === 1 ? 45 : index === 0 ? 30 : index === 2 ? 20 : 5, // Professional majoritaire
      couleur: couleurs[index]
    }));
  }

  private genererAlertes(): AlerteFacturation[] {
    const alertes: AlerteFacturation[] = [];

    // Vérifier les factures en retard
    const facturesEnRetard = this.factures.filter(f => 
      f.statut === StatutFacture.EN_RETARD || 
      (f.statut === StatutFacture.ENVOYEE && new Date(f.dateEcheance) < new Date())
    );

    if (facturesEnRetard.length > 0) {
      alertes.push({
        type: 'danger',
        titre: 'Factures en retard',
        message: `${facturesEnRetard.length} facture(s) en retard de paiement`,
        action: 'Voir les factures',
        url: '/subscription/invoices'
      });
    }

    // Vérifier les limites d'utilisation
    if (this.statistiquesUtilisation.ecritures?.pourcentage > 80) {
      alertes.push({
        type: 'warning',
        titre: 'Limite d\'écritures atteinte',
        message: `${this.statistiquesUtilisation.ecritures.pourcentage}% de votre quota mensuel utilisé`,
        action: 'Upgrade',
        url: '/subscription/plans'
      });
    }

    if (this.statistiquesUtilisation.stockage?.pourcentage > 90) {
      alertes.push({
        type: 'danger',
        titre: 'Espace de stockage saturé',
        message: `${this.statistiquesUtilisation.stockage.pourcentage}% de votre espace utilisé`,
        action: 'Upgrade',
        url: '/subscription/plans'
      });
    }

    // Vérifier l'abonnement
    if (this.resumeAbonnement?.essaiActif && this.resumeAbonnement.joursEssaiRestants <= 3) {
      alertes.push({
        type: 'warning',
        titre: 'Fin d\'essai proche',
        message: `Votre essai gratuit se termine dans ${this.resumeAbonnement.joursEssaiRestants} jour(s)`,
        action: 'Choisir un plan',
        url: '/subscription/plans'
      });
    }

    // Renouvellement automatique
    if (this.abonnementActuel?.prochaineFacturation) {
      const joursAvantRenouvellement = Math.ceil(
        (new Date(this.abonnementActuel.prochaineFacturation).getTime() - new Date().getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      
      if (joursAvantRenouvellement <= 7 && joursAvantRenouvellement > 0) {
        alertes.push({
          type: 'info',
          titre: 'Renouvellement automatique',
          message: `Votre abonnement sera renouvelé dans ${joursAvantRenouvellement} jour(s)`,
          action: 'Gérer',
          url: '/subscription/billing'
        });
      }
    }

    return alertes;
  }

  // =====================================================
  // ACTIONS UTILISATEUR
  // =====================================================

  changerOnglet(onglet: 'overview' | 'usage' | 'invoices' | 'analytics'): void {
    this.ongletActif = onglet;
  }

  changerPeriode(periode: 'semaine' | 'mois' | 'trimestre' | 'annee'): void {
    this.periodeSelectionnee = periode;
    this.genererAnalytics(); // Recalculer avec la nouvelle période
  }

  upgraderPlan(): void {
    this.router.navigate(['/subscription/plans']);
  }

  gererMethodesPaiement(): void {
    this.router.navigate(['/subscription/payment-methods']);
  }

  voirFactures(): void {
    this.router.navigate(['/subscription/invoices']);
  }

  telechargerFacture(facture: Facture): void {
    // Simulation du téléchargement
    console.log('📄 Téléchargement facture:', facture.numero);
    
    // Dans un vrai système, on appellerait l'API pour générer le PDF
    const link = document.createElement('a');
    link.href = `/api/invoices/${facture.id}/download`;
    link.download = `facture-${facture.numero}.pdf`;
    link.click();
  }

  payerFacture(facture: Facture): void {
    console.log('💳 Paiement facture:', facture.numero);
    this.router.navigate(['/subscription/payment'], { 
      queryParams: { invoice: facture.id } 
    });
  }

  simulerRenouvellement(): void {
    this.subscriptionService.simulerRenouvellement().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (succes) => {
        if (succes) {
          console.log('✅ Renouvellement simulé avec succès');
          this.chargerDonnees(); // Recharger les données
        }
      },
      error: (error) => {
        console.error('❌ Erreur simulation renouvellement:', error);
      }
    });
  }

  // =====================================================
  // HELPERS POUR LE TEMPLATE
  // =====================================================

  getIconeStatut(statut: StatutFacture): string {
    switch (statut) {
      case StatutFacture.PAYEE: return '✅';
      case StatutFacture.ENVOYEE: return '📤';
      case StatutFacture.EN_RETARD: return '⚠️';
      case StatutFacture.BROUILLON: return '📝';
      case StatutFacture.ANNULEE: return '❌';
      default: return '❓';
    }
  }

  getClasseStatut(statut: StatutFacture): string {
    switch (statut) {
      case StatutFacture.PAYEE: return 'status-success';
      case StatutFacture.ENVOYEE: return 'status-pending';
      case StatutFacture.EN_RETARD: return 'status-danger';
      case StatutFacture.BROUILLON: return 'status-draft';
      case StatutFacture.ANNULEE: return 'status-cancelled';
      default: return 'status-unknown';
    }
  }

  getLabelStatut(statut: StatutFacture): string {
    switch (statut) {
      case StatutFacture.PAYEE: return 'Payée';
      case StatutFacture.ENVOYEE: return 'Envoyée';
      case StatutFacture.EN_RETARD: return 'En retard';
      case StatutFacture.BROUILLON: return 'Brouillon';
      case StatutFacture.ANNULEE: return 'Annulée';
      default: return 'Inconnu';
    }
  }

  getIconeAbonnement(statut: StatutAbonnement): string {
    switch (statut) {
      case StatutAbonnement.ACTIF: return '🟢';
      case StatutAbonnement.EN_ESSAI: return '🔵';
      case StatutAbonnement.SUSPENDU: return '🟡';
      case StatutAbonnement.EXPIRE: return '🔴';
      case StatutAbonnement.ANNULE: return '⚫';
      default: return '❓';
    }
  }

  formatMontant(montant: number, devise: string = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise
    }).format(montant);
  }

  formatPourcentage(valeur: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(valeur / 100);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDateRelative(date: Date | string): string {
    const maintenant = new Date();
    const dateObj = new Date(date);
    const diffJours = Math.ceil((dateObj.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffJours === 0) return 'Aujourd\'hui';
    if (diffJours === 1) return 'Demain';
    if (diffJours === -1) return 'Hier';
    if (diffJours > 0) return `Dans ${diffJours} jour(s)`;
    return `Il y a ${Math.abs(diffJours)} jour(s)`;
  }

  getClassePourcentageUtilisation(pourcentage: number): string {
    if (pourcentage >= 90) return 'usage-critical';
    if (pourcentage >= 80) return 'usage-warning';
    if (pourcentage >= 60) return 'usage-medium';
    return 'usage-normal';
  }

  getClasseAlerte(type: string): string {
    return `alert alert-${type}`;
  }

  // =====================================================
  // MÉTHODES ANALYTIQUES
  // =====================================================

  calculerCroissanceRevenu(): number {
    if (!this.analytics?.evolutionRevenu || this.analytics.evolutionRevenu.length < 2) {
      return 0;
    }

    const revenus = this.analytics.evolutionRevenu;
    const dernierMois = revenus[revenus.length - 1].montant;
    const avantDernierMois = revenus[revenus.length - 2].montant;

    if (avantDernierMois === 0) return 0;
    return ((dernierMois - avantDernierMois) / avantDernierMois) * 100;
  }

  calculerRevenuMoyenParFacture(): number {
    if (!this.factures || this.factures.length === 0) return 0;
    
    const facturesPayees = this.factures.filter(f => f.statut === StatutFacture.PAYEE);
    if (facturesPayees.length === 0) return 0;
    
    const total = facturesPayees.reduce((sum, f) => sum + f.montantTTC, 0);
    return total / facturesPayees.length;
  }

  calculerDelaiMoyenPaiement(): number {
    const facturesPayees = this.factures.filter(f => 
      f.statut === StatutFacture.PAYEE && f.datePaiement
    );
    
    if (facturesPayees.length === 0) return 0;
    
    const delais = facturesPayees.map(f => {
      const dateEmission = new Date(f.dateEmission);
      const datePaiement = new Date(f.datePaiement!);
      return Math.ceil((datePaiement.getTime() - dateEmission.getTime()) / (1000 * 60 * 60 * 24));
    });
    
    return delais.reduce((sum, delai) => sum + delai, 0) / delais.length;
  }
}