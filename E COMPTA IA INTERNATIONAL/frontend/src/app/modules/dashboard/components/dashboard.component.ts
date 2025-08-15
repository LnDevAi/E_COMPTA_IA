import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService } from '../services/dashboard.service';
import {
  KPI,
  RatioAUDCIF,
  GraphiqueData,
  Alerte,
  CategorieRatio,
  NiveauAlerte,
  TypeGraphique
} from '../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  // Observables pour les données
  kpis$: Observable<KPI[]>;
  ratios$: Observable<RatioAUDCIF[]>;
  alertes$: Observable<Alerte[]>;
  graphiques$: Observable<GraphiqueData[]>;
  
  // Données locales pour affichage
  kpis: KPI[] = [];
  ratios: RatioAUDCIF[] = [];
  alertes: Alerte[] = [];
  graphiques: GraphiqueData[] = [];
  
  // Filtres et organisation
  ratiosParCategorie: Map<CategorieRatio, RatioAUDCIF[]> = new Map();
  alertesParNiveau: Map<NiveauAlerte, Alerte[]> = new Map();
  
  // États de l'interface
  chargementEnCours = true;
  erreurChargement = false;
  modeAffichage: 'COMPLET' | 'COMPACT' | 'WIDGETS' = 'COMPLET';
  
  // Configuration temps réel
  derniereMiseAJour: Date = new Date();
  intervalleMAJ = 30; // secondes
  timerMAJ?: number;
  
  // Sélections et interactions
  kpiSelectionne?: KPI;
  ratioSelectionne?: RatioAUDCIF;
  graphiqueSelectionne?: GraphiqueData;
  
  // Destruction du composant
  private destroy$ = new Subject<void>();
  
  // Types exposés pour le template
  CategorieRatio = CategorieRatio;
  NiveauAlerte = NiveauAlerte;
  TypeGraphique = TypeGraphique;
  
  constructor(private dashboardService: DashboardService) {
    this.kpis$ = this.dashboardService.kpis$;
    this.ratios$ = this.dashboardService.ratios$;
    this.alertes$ = this.dashboardService.alertes$;
    this.graphiques$ = this.dashboardService.graphiques$;
  }
  
  ngOnInit(): void {
    this.initialiserDashboard();
    this.demarrerMiseAJourTempsReel();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.timerMAJ) {
      clearInterval(this.timerMAJ);
    }
  }
  
  private initialiserDashboard(): void {
    this.chargementEnCours = true;
    
    // Chargement des KPIs
    this.kpis$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (kpis) => {
        this.kpis = kpis;
        this.chargementEnCours = false;
        this.derniereMiseAJour = new Date();
      },
      error: (error) => {
        console.error('Erreur chargement KPIs:', error);
        this.erreurChargement = true;
        this.chargementEnCours = false;
      }
    });
    
    // Chargement des ratios AUDCIF
    this.ratios$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (ratios) => {
        this.ratios = ratios;
        this.organiserRatiosParCategorie();
      },
      error: (error) => {
        console.error('Erreur chargement ratios:', error);
      }
    });
    
    // Chargement des alertes
    this.alertes$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (alertes) => {
        this.alertes = alertes;
        this.organiserAlertesParNiveau();
      },
      error: (error) => {
        console.error('Erreur chargement alertes:', error);
      }
    });
    
    // Chargement des graphiques
    this.graphiques$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (graphiques) => {
        this.graphiques = graphiques;
      },
      error: (error) => {
        console.error('Erreur chargement graphiques:', error);
      }
    });
  }
  
  private organiserRatiosParCategorie(): void {
    this.ratiosParCategorie.clear();
    
    this.ratios.forEach(ratio => {
      if (!this.ratiosParCategorie.has(ratio.categorie)) {
        this.ratiosParCategorie.set(ratio.categorie, []);
      }
      this.ratiosParCategorie.get(ratio.categorie)!.push(ratio);
    });
  }
  
  private organiserAlertesParNiveau(): void {
    this.alertesParNiveau.clear();
    
    this.alertes.forEach(alerte => {
      if (!this.alertesParNiveau.has(alerte.niveau)) {
        this.alertesParNiveau.set(alerte.niveau, []);
      }
      this.alertesParNiveau.get(alerte.niveau)!.push(alerte);
    });
  }
  
  private demarrerMiseAJourTempsReel(): void {
    this.timerMAJ = window.setInterval(() => {
      this.rafraichirDonnees();
    }, this.intervalleMAJ * 1000);
  }
  
  // Actions utilisateur
  rafraichirDonnees(): void {
    this.dashboardService.rafraichirDonnees().subscribe({
      next: () => {
        this.derniereMiseAJour = new Date();
      },
      error: (error) => {
        console.error('Erreur rafraîchissement:', error);
      }
    });
  }
  
  selectionnerKPI(kpi: KPI): void {
    this.kpiSelectionne = this.kpiSelectionne?.id === kpi.id ? undefined : kpi;
  }
  
  selectionnerRatio(ratio: RatioAUDCIF): void {
    this.ratioSelectionne = this.ratioSelectionne?.code === ratio.code ? undefined : ratio;
  }
  
  selectionnerGraphique(graphique: GraphiqueData): void {
    this.graphiqueSelectionne = this.graphiqueSelectionne?.id === graphique.id ? undefined : graphique;
  }
  
  fermerSelection(): void {
    this.kpiSelectionne = undefined;
    this.ratioSelectionne = undefined;
    this.graphiqueSelectionne = undefined;
  }
  
  changerModeAffichage(mode: 'COMPLET' | 'COMPACT' | 'WIDGETS'): void {
    this.modeAffichage = mode;
  }
  
  executerActionAlerte(alerte: Alerte, actionId: string): void {
    const action = alerte.actions.find(a => a.id === actionId);
    if (action) {
      action.action();
    }
  }
  
  marquerAlerteCommeVue(alerte: Alerte): void {
    alerte.statut = 'VUE';
  }
  
  // Méthodes utilitaires pour le template
  getClasseEvolution(evolution: any): string {
    if (evolution.estPositive) {
      return evolution.tendance === 'HAUSSE' ? 'evolution-positive' : 'evolution-stable';
    } else {
      return 'evolution-negative';
    }
  }
  
  getIconeEvolution(evolution: any): string {
    switch (evolution.tendance) {
      case 'HAUSSE': return 'trending_up';
      case 'BAISSE': return 'trending_down';
      case 'STABLE': return 'trending_flat';
      default: return 'remove';
    }
  }
  
  getClasseAlerteSeuil(alerteSeuil: any): string {
    switch (alerteSeuil?.statut) {
      case 'BON': return 'seuil-bon';
      case 'ATTENTION': return 'seuil-attention';
      case 'CRITIQUE': return 'seuil-critique';
      default: return '';
    }
  }
  
  getClasseRatio(interpretation: any): string {
    switch (interpretation.niveau) {
      case 'EXCELLENT': return 'ratio-excellent';
      case 'BON': return 'ratio-bon';
      case 'MOYEN': return 'ratio-moyen';
      case 'FAIBLE': return 'ratio-faible';
      case 'CRITIQUE': return 'ratio-critique';
      default: return '';
    }
  }
  
  getClasseAlerte(niveau: NiveauAlerte): string {
    switch (niveau) {
      case NiveauAlerte.INFO: return 'alerte-info';
      case NiveauAlerte.ATTENTION: return 'alerte-attention';
      case NiveauAlerte.CRITIQUE: return 'alerte-critique';
      case NiveauAlerte.URGENCE: return 'alerte-urgence';
      default: return '';
    }
  }
  
  getIconeCategorie(categorie: CategorieRatio): string {
    switch (categorie) {
      case CategorieRatio.LIQUIDITE: return 'water_drop';
      case CategorieRatio.RENTABILITE: return 'trending_up';
      case CategorieRatio.ENDETTEMENT: return 'account_balance';
      case CategorieRatio.ACTIVITE: return 'autorenew';
      case CategorieRatio.STRUCTURE_FINANCIERE: return 'business_center';
      default: return 'analytics';
    }
  }
  
  getNombreAlertes(niveau?: NiveauAlerte): number {
    if (niveau) {
      return this.alertesParNiveau.get(niveau)?.length || 0;
    }
    return this.alertes.length;
  }
  
  getTempsDepuisMAJ(): string {
    const maintenant = new Date();
    const diffMs = maintenant.getTime() - this.derniereMiseAJour.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
      return `${diffSec}s`;
    } else if (diffSec < 3600) {
      return `${Math.floor(diffSec / 60)}min`;
    } else {
      return `${Math.floor(diffSec / 3600)}h`;
    }
  }
  
  // Gestion d'erreurs
  gererErreurChargement(): void {
    this.erreurChargement = false;
    this.initialiserDashboard();
  }
  
  // Export des données
  exporterKPIs(): void {
    const donneesExport = this.kpis.map(kpi => ({
      titre: kpi.titre,
      valeur: kpi.valeurFormatee,
      evolution: `${kpi.evolution.pourcentage}%`,
      periode: kpi.periode.libelle
    }));
    
    this.telechargerJSON(donneesExport, 'kpis-dashboard.json');
  }
  
  exporterRatios(): void {
    const donneesExport = this.ratios.map(ratio => ({
      code: ratio.code,
      nom: ratio.nom,
      valeur: ratio.valeurFormatee,
      interpretation: ratio.interpretation.niveau,
      categorie: ratio.categorie
    }));
    
    this.telechargerJSON(donneesExport, 'ratios-audcif.json');
  }
  
  private telechargerJSON(data: any, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
  
  // Impression
  imprimerDashboard(): void {
    window.print();
  }
}