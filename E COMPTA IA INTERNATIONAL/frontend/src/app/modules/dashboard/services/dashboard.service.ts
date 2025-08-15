import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, interval, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import {
  KPI,
  RatioAUDCIF,
  GraphiqueData,
  Alerte,
  TypeKPI,
  CategorieRatio,
  Evolution,
  RATIOS_AUDCIF_OBLIGATOIRES,
  KPIS_SYSCOHADA,
  TypeGraphique,
  NiveauAlerte,
  TypeAlerte,
  Periode,
  SeuilAlerte,
  InterpretationRatio
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  private kpisSubject = new BehaviorSubject<KPI[]>([]);
  private ratiosSubject = new BehaviorSubject<RatioAUDCIF[]>([]);
  private alertesSubject = new BehaviorSubject<Alerte[]>([]);
  private graphiquesSubject = new BehaviorSubject<GraphiqueData[]>([]);
  
  // Observables publics
  public kpis$ = this.kpisSubject.asObservable();
  public ratios$ = this.ratiosSubject.asObservable();
  public alertes$ = this.alertesSubject.asObservable();
  public graphiques$ = this.graphiquesSubject.asObservable();
  
  // Données comptables simulées (dans un vrai projet, viendraient de l'API)
  private donneesComptables = {
    chiffreAffaires: 24500000,
    chiffreAffairesPrecedent: 21800000,
    resultatNet: 2100000,
    resultatNetPrecedent: 1850000,
    tresorerie: 12500000,
    tresoreriePrecedente: 10800000,
    creancesClients: 8500000,
    creancesClientsPrecedentes: 9200000,
    dettesFournisseurs: 6200000,
    dettesFournisseursPrecedentes: 5700000,
    stocks: 4200000,
    stocksPrecedents: 3800000,
    capitauxPropres: 18500000,
    capitauxPropresPrecedents: 16400000,
    totalActif: 35000000,
    totalActifPrecedent: 32000000,
    totalDettes: 16500000,
    totalDettesPrecedent: 15600000,
    actifCirculant: 15700000,
    dettesCourtTerme: 8200000,
    coutMarchandisesVendues: 15000000
  };
  
  constructor() {
    this.initialiserDonnees();
    this.demarrerMiseAJourTempsReel();
  }
  
  private initialiserDonnees(): void {
    this.calculerKPIs();
    this.calculerRatiosAUDCIF();
    this.genererGraphiques();
    this.detecterAlertes();
  }
  
  // Démarrage mise à jour temps réel (toutes les 30 secondes)
  private demarrerMiseAJourTempsReel(): void {
    interval(30000).pipe(
      startWith(0)
    ).subscribe(() => {
      this.simlerMiseAJourDonnees();
      this.calculerKPIs();
      this.calculerRatiosAUDCIF();
      this.genererGraphiques();
      this.detecterAlertes();
    });
  }
  
  // Simulation de variation des données (±2% aléatoire)
  private simlerMiseAJourDonnees(): void {
    const variationMax = 0.02; // 2%
    
    Object.keys(this.donneesComptables).forEach(key => {
      const valeurActuelle = (this.donneesComptables as any)[key];
      const variation = (Math.random() - 0.5) * 2 * variationMax;
      (this.donneesComptables as any)[key] = Math.round(valeurActuelle * (1 + variation));
    });
  }
  
  // Calcul des KPIs avec évolution
  private calculerKPIs(): void {
    const periodeActuelle: Periode = {
      dateDebut: new Date(2024, 0, 1),
      dateFin: new Date(2024, 11, 31),
      libelle: 'Année 2024',
      type: 'ANNUEL'
    };
    
    const kpis: KPI[] = [
      this.creerKPI(
        'ca_ttc',
        'Chiffre d\'Affaires TTC',
        this.donneesComptables.chiffreAffaires,
        this.donneesComptables.chiffreAffairesPrecedent,
        'FCFA',
        'trending_up',
        '#4caf50',
        TypeKPI.CHIFFRE_AFFAIRES,
        periodeActuelle
      ),
      this.creerKPI(
        'resultat_net',
        'Résultat Net',
        this.donneesComptables.resultatNet,
        this.donneesComptables.resultatNetPrecedent,
        'FCFA',
        'account_balance',
        '#2196f3',
        TypeKPI.RESULTAT_NET,
        periodeActuelle
      ),
      this.creerKPI(
        'tresorerie',
        'Trésorerie',
        this.donneesComptables.tresorerie,
        this.donneesComptables.tresoreriePrecedente,
        'FCFA',
        'savings',
        '#9c27b0',
        TypeKPI.TRESORERIE,
        periodeActuelle,
        { min: 5000000, critique: 2000000 }
      ),
      this.creerKPI(
        'creances_clients',
        'Créances Clients',
        this.donneesComptables.creancesClients,
        this.donneesComptables.creancesClientsPrecedentes,
        'FCFA',
        'account_balance_wallet',
        '#ff9800',
        TypeKPI.CREANCES_CLIENTS,
        periodeActuelle
      ),
      this.creerKPI(
        'dettes_fournisseurs',
        'Dettes Fournisseurs',
        this.donneesComptables.dettesFournisseurs,
        this.donneesComptables.dettesFournisseursPrecedentes,
        'FCFA',
        'payment',
        '#f44336',
        TypeKPI.DETTES_FOURNISSEURS,
        periodeActuelle
      ),
      this.creerKPI(
        'capitaux_propres',
        'Capitaux Propres',
        this.donneesComptables.capitauxPropres,
        this.donneesComptables.capitauxPropresPrecedents,
        'FCFA',
        'business_center',
        '#607d8b',
        TypeKPI.CAPITAUX_PROPRES,
        periodeActuelle
      )
    ];
    
    this.kpisSubject.next(kpis);
  }
  
  private creerKPI(
    id: string,
    titre: string,
    valeurActuelle: number,
    valeurPrecedente: number,
    unite: string,
    icone: string,
    couleur: string,
    type: TypeKPI,
    periode: Periode,
    seuils?: { min?: number; max?: number; critique?: number }
  ): KPI {
    
    const evolution = this.calculerEvolution(valeurActuelle, valeurPrecedente);
    const alerteSeuil = seuils ? this.evaluerSeuils(valeurActuelle, seuils) : undefined;
    
    return {
      id,
      titre,
      valeur: valeurActuelle,
      valeurFormatee: this.formaterDevise(valeurActuelle),
      unite,
      evolution,
      icone,
      couleur,
      type,
      periode,
      alerteSeuil
    };
  }
  
  private calculerEvolution(valeurActuelle: number, valeurPrecedente: number): Evolution {
    const pourcentage = ((valeurActuelle - valeurPrecedente) / valeurPrecedente) * 100;
    const tendance = pourcentage > 1 ? 'HAUSSE' : pourcentage < -1 ? 'BAISSE' : 'STABLE';
    
    return {
      pourcentage: Math.round(pourcentage * 10) / 10,
      tendance,
      periodeComparaison: 'Année précédente',
      valeurPrecedente,
      estPositive: pourcentage >= 0
    };
  }
  
  private evaluerSeuils(valeur: number, seuils: any): SeuilAlerte {
    if (seuils.critique && valeur <= seuils.critique) {
      return {
        statut: 'CRITIQUE',
        message: 'Valeur critique atteinte',
        critique: seuils.critique
      };
    } else if (seuils.min && valeur <= seuils.min) {
      return {
        statut: 'ATTENTION',
        message: 'Valeur en dessous du seuil recommandé',
        min: seuils.min
      };
    } else {
      return { statut: 'BON' };
    }
  }
  
  // Calcul des ratios AUDCIF
  private calculerRatiosAUDCIF(): void {
    const ratios: RatioAUDCIF[] = [];
    
    // R01 - Ratio de Liquidité Générale
    const liquiditeGenerale = this.donneesComptables.actifCirculant / this.donneesComptables.dettesCourtTerme;
    ratios.push(this.creerRatioAUDCIF(
      'R01',
      'Ratio de Liquidité Générale',
      'Actif Circulant / Dettes à Court Terme',
      liquiditeGenerale,
      'ratio',
      CategorieRatio.LIQUIDITE,
      { excellent: 2, bon: 1.5, moyen: 1.2, faible: 1, critique: 0.8 }
    ));
    
    // R02 - Ratio de Liquidité Réduite
    const liquiditeReduite = (this.donneesComptables.actifCirculant - this.donneesComptables.stocks) / this.donneesComptables.dettesCourtTerme;
    ratios.push(this.creerRatioAUDCIF(
      'R02',
      'Ratio de Liquidité Réduite',
      '(Actif Circulant - Stocks) / Dettes à Court Terme',
      liquiditeReduite,
      'ratio',
      CategorieRatio.LIQUIDITE,
      { excellent: 1.5, bon: 1.2, moyen: 1, faible: 0.8, critique: 0.6 }
    ));
    
    // R03 - Ratio d'Endettement
    const endettement = this.donneesComptables.totalDettes / this.donneesComptables.totalActif;
    ratios.push(this.creerRatioAUDCIF(
      'R03',
      'Ratio d\'Endettement',
      'Total Dettes / Total Actif',
      endettement,
      '%',
      CategorieRatio.ENDETTEMENT,
      { excellent: 0.3, bon: 0.5, moyen: 0.7, faible: 0.85, critique: 1 }
    ));
    
    // R04 - Ratio d'Autonomie Financière
    const autonomieFinanciere = this.donneesComptables.capitauxPropres / this.donneesComptables.totalActif;
    ratios.push(this.creerRatioAUDCIF(
      'R04',
      'Ratio d\'Autonomie Financière',
      'Capitaux Propres / Total Actif',
      autonomieFinanciere,
      '%',
      CategorieRatio.STRUCTURE_FINANCIERE,
      { excellent: 0.7, bon: 0.5, moyen: 0.3, faible: 0.15, critique: 0 }
    ));
    
    // R05 - Rentabilité Nette
    const rentabiliteNette = this.donneesComptables.resultatNet / this.donneesComptables.chiffreAffaires;
    ratios.push(this.creerRatioAUDCIF(
      'R05',
      'Rentabilité Nette',
      'Résultat Net / Chiffre d\'Affaires',
      rentabiliteNette,
      '%',
      CategorieRatio.RENTABILITE,
      { excellent: 0.15, bon: 0.1, moyen: 0.05, faible: 0.02, critique: 0 }
    ));
    
    // R06 - Rentabilité des Capitaux Propres
    const rentabiliteCapitaux = this.donneesComptables.resultatNet / this.donneesComptables.capitauxPropres;
    ratios.push(this.creerRatioAUDCIF(
      'R06',
      'Rentabilité des Capitaux Propres',
      'Résultat Net / Capitaux Propres',
      rentabiliteCapitaux,
      '%',
      CategorieRatio.RENTABILITE,
      { excellent: 0.2, bon: 0.15, moyen: 0.1, faible: 0.05, critique: 0 }
    ));
    
    // R07 - Rotation des Stocks
    const rotationStocks = this.donneesComptables.coutMarchandisesVendues / this.donneesComptables.stocks;
    ratios.push(this.creerRatioAUDCIF(
      'R07',
      'Rotation des Stocks',
      'Coût des Marchandises Vendues / Stock Moyen',
      rotationStocks,
      'ratio',
      CategorieRatio.ACTIVITE,
      { excellent: 12, bon: 8, moyen: 6, faible: 4, critique: 2 }
    ));
    
    // R08 - Délai de Recouvrement Clients
    const delaiRecouvrement = (this.donneesComptables.creancesClients / this.donneesComptables.chiffreAffaires) * 365;
    ratios.push(this.creerRatioAUDCIF(
      'R08',
      'Délai de Recouvrement Clients',
      '(Créances Clients / CA TTC) × 365',
      delaiRecouvrement,
      'jours',
      CategorieRatio.ACTIVITE,
      { excellent: 30, bon: 45, moyen: 60, faible: 90, critique: 120 }
    ));
    
    this.ratiosSubject.next(ratios);
  }
  
  private creerRatioAUDCIF(
    code: string,
    nom: string,
    formule: string,
    valeur: number,
    unite: '%' | 'ratio' | 'jours',
    categorie: CategorieRatio,
    seuils: any
  ): RatioAUDCIF {
    
    const interpretation = this.interpreterRatio(valeur, seuils, categorie);
    const valeurFormatee = unite === '%' ? `${(valeur * 100).toFixed(1)}%` : 
                          unite === 'jours' ? `${Math.round(valeur)} jours` :
                          valeur.toFixed(2);
    
    return {
      code,
      nom,
      formule,
      valeur,
      valeurFormatee,
      unite,
      interpretation,
      categorie,
      conformiteAUDCIF: true,
      seuilsRecommandes: seuils
    };
  }
  
  private interpreterRatio(valeur: number, seuils: any, categorie: CategorieRatio): InterpretationRatio {
    let niveau: 'EXCELLENT' | 'BON' | 'MOYEN' | 'FAIBLE' | 'CRITIQUE';
    let message: string;
    let conseils: string[] = [];
    let impact: string;
    
    // Déterminer le niveau selon les seuils
    if (categorie === CategorieRatio.ENDETTEMENT) {
      // Pour l'endettement, plus c'est bas, mieux c'est
      if (valeur <= seuils.excellent) niveau = 'EXCELLENT';
      else if (valeur <= seuils.bon) niveau = 'BON';
      else if (valeur <= seuils.moyen) niveau = 'MOYEN';
      else if (valeur <= seuils.faible) niveau = 'FAIBLE';
      else niveau = 'CRITIQUE';
    } else if (categorie === CategorieRatio.ACTIVITE && valeur > 100) {
      // Pour les délais (jours), plus c'est bas, mieux c'est
      if (valeur <= seuils.excellent) niveau = 'EXCELLENT';
      else if (valeur <= seuils.bon) niveau = 'BON';
      else if (valeur <= seuils.moyen) niveau = 'MOYEN';
      else if (valeur <= seuils.faible) niveau = 'FAIBLE';
      else niveau = 'CRITIQUE';
    } else {
      // Pour les autres ratios, plus c'est haut, mieux c'est
      if (valeur >= seuils.excellent) niveau = 'EXCELLENT';
      else if (valeur >= seuils.bon) niveau = 'BON';
      else if (valeur >= seuils.moyen) niveau = 'MOYEN';
      else if (valeur >= seuils.faible) niveau = 'FAIBLE';
      else niveau = 'CRITIQUE';
    }
    
    // Messages et conseils selon le niveau
    switch (niveau) {
      case 'EXCELLENT':
        message = 'Performance excellente selon les standards AUDCIF';
        conseils = ['Maintenir cette performance', 'Analyser les facteurs de succès'];
        impact = 'Situation financière très solide';
        break;
      case 'BON':
        message = 'Performance satisfaisante';
        conseils = ['Identifier les axes d\'amélioration', 'Surveiller l\'évolution'];
        impact = 'Situation financière saine';
        break;
      case 'MOYEN':
        message = 'Performance dans la moyenne';
        conseils = ['Mettre en place des actions correctives', 'Analyser les causes'];
        impact = 'Vigilance requise';
        break;
      case 'FAIBLE':
        message = 'Performance en dessous des standards';
        conseils = ['Actions correctives urgentes', 'Revoir la stratégie financière'];
        impact = 'Risques à surveiller';
        break;
      case 'CRITIQUE':
        message = 'Situation critique nécessitant une action immédiate';
        conseils = ['Plan de redressement immédiat', 'Consultation expert comptable'];
        impact = 'Risques financiers élevés';
        break;
    }
    
    return { niveau, message, conseils, impact };
  }
  
  // Génération des graphiques
  private genererGraphiques(): void {
    const graphiques: GraphiqueData[] = [
      this.creerGraphiqueEvolutionCA(),
      this.creerGraphiqueRepartitionActif(),
      this.creerGraphiqueEvolutionRatios()
    ];
    
    this.graphiquesSubject.next(graphiques);
  }
  
  private creerGraphiqueEvolutionCA(): GraphiqueData {
    const donnees = [
      { x: 'Jan', y: 1800000 },
      { x: 'Fév', y: 1950000 },
      { x: 'Mar', y: 2100000 },
      { x: 'Avr', y: 1980000 },
      { x: 'Mai', y: 2200000 },
      { x: 'Jun', y: 2350000 },
      { x: 'Jul', y: 2150000 },
      { x: 'Aoû', y: 2400000 },
      { x: 'Sep', y: 2100000 },
      { x: 'Oct', y: 2250000 },
      { x: 'Nov', y: 2300000 },
      { x: 'Déc', y: 2400000 }
    ];
    
    return {
      id: 'evolution_ca',
      titre: 'Évolution du Chiffre d\'Affaires',
      type: TypeGraphique.LIGNE,
      donnees,
      periode: {
        dateDebut: new Date(2024, 0, 1),
        dateFin: new Date(2024, 11, 31),
        libelle: '2024',
        type: 'ANNUEL'
      },
      options: {
        couleurs: ['#4caf50'],
        legende: true,
        grille: true,
        animation: true,
        responsive: true,
        hauteur: 300,
        formatage: {
          devise: 'FCFA',
          separateurMilliers: ' ',
          decimales: 0
        }
      }
    };
  }
  
  private creerGraphiqueRepartitionActif(): GraphiqueData {
    const donnees = [
      { x: 'Actif Immobilisé', y: 19300000, couleur: '#2196f3' },
      { x: 'Stocks', y: 4200000, couleur: '#ff9800' },
      { x: 'Créances', y: 8500000, couleur: '#4caf50' },
      { x: 'Trésorerie', y: 3000000, couleur: '#9c27b0' }
    ];
    
    return {
      id: 'repartition_actif',
      titre: 'Répartition de l\'Actif',
      type: TypeGraphique.CAMEMBERT,
      donnees,
      periode: {
        dateDebut: new Date(2024, 11, 31),
        dateFin: new Date(2024, 11, 31),
        libelle: 'Décembre 2024',
        type: 'MENSUEL'
      },
      options: {
        couleurs: ['#2196f3', '#ff9800', '#4caf50', '#9c27b0'],
        legende: true,
        grille: false,
        animation: true,
        responsive: true,
        hauteur: 300,
        formatage: {
          devise: 'FCFA',
          separateurMilliers: ' ',
          decimales: 0
        }
      }
    };
  }
  
  private creerGraphiqueEvolutionRatios(): GraphiqueData {
    const donnees = [
      { x: 'Liquidité Générale', y: 1.91 },
      { x: 'Liquidité Réduite', y: 1.40 },
      { x: 'Autonomie Financière', y: 0.53 },
      { x: 'Rentabilité Nette', y: 0.086 },
      { x: 'ROE', y: 0.114 }
    ];
    
    return {
      id: 'ratios_audcif',
      titre: 'Ratios Financiers AUDCIF',
      type: TypeGraphique.BARRE,
      donnees,
      periode: {
        dateDebut: new Date(2024, 11, 31),
        dateFin: new Date(2024, 11, 31),
        libelle: 'Décembre 2024',
        type: 'MENSUEL'
      },
      options: {
        couleurs: ['#1976d2'],
        legende: false,
        grille: true,
        animation: true,
        responsive: true,
        hauteur: 300,
        formatage: {
          devise: '',
          separateurMilliers: '',
          decimales: 2
        }
      }
    };
  }
  
  // Détection d'alertes automatiques
  private detecterAlertes(): void {
    const alertes: Alerte[] = [];
    const kpis = this.kpisSubject.value;
    const ratios = this.ratiosSubject.value;
    
    // Alertes sur KPIs
    kpis.forEach(kpi => {
      if (kpi.alerteSeuil?.statut === 'CRITIQUE') {
        alertes.push({
          id: `alerte_kpi_${kpi.id}`,
          type: TypeAlerte.KPI_SEUIL,
          niveau: NiveauAlerte.CRITIQUE,
          titre: `${kpi.titre} critique`,
          message: `${kpi.titre} est descendu en dessous du seuil critique`,
          kpiConcerne: kpi.id,
          valeurActuelle: kpi.valeur,
          valeurSeuil: kpi.alerteSeuil.critique || 0,
          dateCreation: new Date(),
          statut: 'NOUVELLE',
          actions: [
            {
              id: 'voir_details',
              libelle: 'Voir détails',
              action: () => console.log('Navigation vers détails KPI'),
              icone: 'info',
              priorite: 1
            }
          ]
        });
      }
    });
    
    // Alertes sur ratios
    ratios.forEach(ratio => {
      if (ratio.interpretation.niveau === 'CRITIQUE') {
        alertes.push({
          id: `alerte_ratio_${ratio.code}`,
          type: TypeAlerte.RATIO_CRITIQUE,
          niveau: NiveauAlerte.CRITIQUE,
          titre: `Ratio ${ratio.nom} critique`,
          message: ratio.interpretation.message,
          ratioConcerne: ratio.code,
          valeurActuelle: ratio.valeur,
          valeurSeuil: ratio.seuilsRecommandes.critique,
          dateCreation: new Date(),
          statut: 'NOUVELLE',
          actions: [
            {
              id: 'voir_conseils',
              libelle: 'Voir conseils',
              action: () => console.log('Afficher conseils'),
              icone: 'lightbulb',
              priorite: 1
            }
          ]
        });
      }
    });
    
    this.alertesSubject.next(alertes);
  }
  
  // Utilitaires
  private formaterDevise(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant).replace('XOF', 'FCFA');
  }
  
  // Méthodes publiques pour les composants
  public rafraichirDonnees(): Observable<any> {
    this.initialiserDonnees();
    return combineLatest([
      this.kpis$,
      this.ratios$,
      this.alertes$,
      this.graphiques$
    ]);
  }
  
  public getKPIParId(id: string): Observable<KPI | undefined> {
    return this.kpis$.pipe(
      map(kpis => kpis.find(kpi => kpi.id === id))
    );
  }
  
  public getRatioParCode(code: string): Observable<RatioAUDCIF | undefined> {
    return this.ratios$.pipe(
      map(ratios => ratios.find(ratio => ratio.code === code))
    );
  }
  
  public getAlertesParNiveau(niveau: NiveauAlerte): Observable<Alerte[]> {
    return this.alertes$.pipe(
      map(alertes => alertes.filter(alerte => alerte.niveau === niveau))
    );
  }
}