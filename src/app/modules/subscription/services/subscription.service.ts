import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, interval } from 'rxjs';
import { delay, map, catchError, switchMap, filter, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import {
  Abonnement,
  PlanAbonnement,
  MethodePaiement,
  UtilisationRessources,
  Facture,
  TentativePaiement,
  StatutAbonnement,
  TypePaiement,
  OperateurMobileMoney,
  StatutFacture,
  PeriodeFacturation,
  PLANS_ABONNEMENT,
  OPERATEURS_MOBILE_MONEY_PAR_PAYS,
  CONFIGURATION_MOBILE_MONEY,
  obtenirTarifPourRegion,
  calculerPrixAvecReduction,
  verifierLimiteRessource,
  calculerPourcentageUtilisation
} from '../models/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private abonnementActuelSubject = new BehaviorSubject<Abonnement | null>(null);
  public abonnementActuel$ = this.abonnementActuelSubject.asObservable();

  private utilisationSubject = new BehaviorSubject<UtilisationRessources | null>(null);
  public utilisation$ = this.utilisationSubject.asObservable();

  private facturesSubject = new BehaviorSubject<Facture[]>([]);
  public factures$ = this.facturesSubject.asObservable();

  // Configuration des API de paiement
  private readonly STRIPE_PUBLIC_KEY = 'pk_test_your_stripe_key_here';
  private readonly PAYPAL_CLIENT_ID = 'your_paypal_client_id_here';
  private readonly API_BASE_URL = 'https://api.e-compta-ia.com';

  constructor(private http: HttpClient) {
    this.initialiserSurveillanceUtilisation();
  }

  // =====================================================
  // GESTION DES PLANS
  // =====================================================

  /**
   * Récupère tous les plans disponibles
   */
  getPlansDisponibles(): Observable<PlanAbonnement[]> {
    return of(PLANS_ABONNEMENT).pipe(
      delay(300),
      map(plans => plans.filter(plan => plan.visibilite))
    );
  }

  /**
   * Récupère un plan par ID
   */
  getPlanParId(planId: string): Observable<PlanAbonnement | null> {
    return of(PLANS_ABONNEMENT.find(plan => plan.id === planId) || null).pipe(
      delay(100)
    );
  }

  /**
   * Récupère les plans adaptés pour un pays spécifique
   */
  getPlansParPays(pays: string): Observable<PlanAbonnement[]> {
    return this.getPlansDisponibles().pipe(
      map(plans => 
        plans.map(plan => ({
          ...plan,
          tarifLocal: obtenirTarifPourRegion(plan, pays)
        }))
      )
    );
  }

  // =====================================================
  // GESTION DES ABONNEMENTS
  // =====================================================

  /**
   * Récupère l'abonnement actuel
   */
  getAbonnementActuel(): Observable<Abonnement | null> {
    return this.abonnementActuel$;
  }

  /**
   * Créer un nouvel abonnement
   */
  creerAbonnement(
    planId: string, 
    methodePaiement: MethodePaiement,
    periodeFacturation: PeriodeFacturation = PeriodeFacturation.MENSUEL,
    codePromo?: string
  ): Observable<Abonnement> {
    return this.getPlanParId(planId).pipe(
      switchMap(plan => {
        if (!plan) {
          return throwError(() => new Error('Plan non trouvé'));
        }

        const nouvelAbonnement: Abonnement = {
          id: this.genererIdAbonnement(),
          userId: 'current_user_id', // À récupérer du contexte utilisateur
          entrepriseId: 'current_entreprise_id',
          planId: plan.id,
          plan: plan,
          statut: StatutAbonnement.EN_ESSAI,
          dateDebut: new Date(),
          dateFin: this.calculerDateFin(new Date(), periodeFacturation),
          dateRenouvellement: this.calculerDateRenouvellement(new Date(), periodeFacturation),
          periodeFacturation: periodeFacturation,
          methodePaiement: methodePaiement,
          montantHT: this.calculerMontantHT(plan, periodeFacturation),
          montantTTC: this.calculerMontantTTC(plan, periodeFacturation),
          devise: plan.deviseBase,
          taux: 1,
          essaiGratuit: plan.essaiGratuitJours > 0,
          dateFinEssai: plan.essaiGratuitJours > 0 ? 
            new Date(Date.now() + plan.essaiGratuitJours * 24 * 60 * 60 * 1000) : undefined,
          utilisationActuelle: this.initialiserUtilisation(),
          limitesActuelles: plan.limites,
          prochaineFacturation: this.calculerProchaineFacturation(new Date(), periodeFacturation, plan.essaiGratuitJours),
          factures: [],
          historique: [{
            id: this.genererIdHistorique(),
            date: new Date(),
            action: 'CREATION' as any,
            details: `Création de l'abonnement ${plan.nom}`,
            utilisateurId: 'current_user_id'
          }],
          dateCreation: new Date(),
          derniereModification: new Date(),
          codePromo: codePromo
        };

        return this.sauvegarderAbonnement(nouvelAbonnement);
      })
    );
  }

  /**
   * Modifier le plan d'abonnement
   */
  modifierPlan(nouveauPlanId: string): Observable<Abonnement> {
    const abonnementActuel = this.abonnementActuelSubject.value;
    if (!abonnementActuel) {
      return throwError(() => new Error('Aucun abonnement actuel'));
    }

    return this.getPlanParId(nouveauPlanId).pipe(
      switchMap(nouveauPlan => {
        if (!nouveauPlan) {
          return throwError(() => new Error('Nouveau plan non trouvé'));
        }

        const abonnementModifie: Abonnement = {
          ...abonnementActuel,
          planId: nouveauPlan.id,
          plan: nouveauPlan,
          limitesActuelles: nouveauPlan.limites,
          montantHT: this.calculerMontantHT(nouveauPlan, abonnementActuel.periodeFacturation),
          montantTTC: this.calculerMontantTTC(nouveauPlan, abonnementActuel.periodeFacturation),
          derniereModification: new Date(),
          historique: [
            ...abonnementActuel.historique,
            {
              id: this.genererIdHistorique(),
              date: new Date(),
              action: 'MODIFICATION_PLAN' as any,
              ancienneValeur: abonnementActuel.plan.nom,
              nouvelleValeur: nouveauPlan.nom,
              details: `Changement de plan de ${abonnementActuel.plan.nom} vers ${nouveauPlan.nom}`,
              utilisateurId: 'current_user_id'
            }
          ]
        };

        return this.sauvegarderAbonnement(abonnementModifie);
      })
    );
  }

  /**
   * Suspendre un abonnement
   */
  suspendreAbonnement(raison: string): Observable<Abonnement> {
    const abonnementActuel = this.abonnementActuelSubject.value;
    if (!abonnementActuel) {
      return throwError(() => new Error('Aucun abonnement actuel'));
    }

    const abonnementSuspendu: Abonnement = {
      ...abonnementActuel,
      statut: StatutAbonnement.SUSPENDU,
      derniereModification: new Date(),
      historique: [
        ...abonnementActuel.historique,
        {
          id: this.genererIdHistorique(),
          date: new Date(),
          action: 'SUSPENSION' as any,
          details: `Suspension de l'abonnement: ${raison}`,
          utilisateurId: 'current_user_id'
        }
      ]
    };

    return this.sauvegarderAbonnement(abonnementSuspendu);
  }

  /**
   * Annuler un abonnement
   */
  annulerAbonnement(raison: string): Observable<boolean> {
    const abonnementActuel = this.abonnementActuelSubject.value;
    if (!abonnementActuel) {
      return throwError(() => new Error('Aucun abonnement actuel'));
    }

    const abonnementAnnule: Abonnement = {
      ...abonnementActuel,
      statut: StatutAbonnement.ANNULE,
      derniereModification: new Date(),
      historique: [
        ...abonnementActuel.historique,
        {
          id: this.genererIdHistorique(),
          date: new Date(),
          action: 'ANNULATION' as any,
          details: `Annulation de l'abonnement: ${raison}`,
          utilisateurId: 'current_user_id'
        }
      ]
    };

    return this.sauvegarderAbonnement(abonnementAnnule).pipe(
      map(() => true)
    );
  }

  // =====================================================
  // GESTION DES PAIEMENTS
  // =====================================================

  /**
   * Traiter un paiement par carte de crédit (Stripe)
   */
  traiterPaiementCarte(
    montant: number,
    devise: string,
    detailsCarte: any,
    description: string
  ): Observable<any> {
    console.log('🔥 Traitement paiement Stripe:', { montant, devise, description });

    // Simulation de l'intégration Stripe
    return of(null).pipe(
      delay(2000), // Simulation délai réseau
      map(() => {
        // Simulation du succès/échec
        const succes = Math.random() > 0.1; // 90% de succès

        if (succes) {
          return {
            id: `pi_${Date.now()}`,
            statut: 'succeeded',
            montant: montant,
            devise: devise,
            frais: montant * 0.029 + 30, // Frais Stripe: 2.9% + 30 centimes
            referencePaiement: `stripe_${Date.now()}`,
            methode: 'card',
            dernierQuatreChiffres: detailsCarte.number?.slice(-4) || '****'
          };
        } else {
          throw new Error('Paiement refusé par la banque');
        }
      }),
      catchError(error => {
        console.error('❌ Erreur paiement Stripe:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Traiter un paiement PayPal
   */
  traiterPaiementPayPal(
    montant: number,
    devise: string,
    description: string
  ): Observable<any> {
    console.log('💙 Traitement paiement PayPal:', { montant, devise, description });

    return of(null).pipe(
      delay(1500),
      map(() => {
        const succes = Math.random() > 0.05; // 95% de succès

        if (succes) {
          return {
            id: `PAYID-${Date.now()}`,
            statut: 'COMPLETED',
            montant: montant,
            devise: devise,
            frais: montant * 0.035, // Frais PayPal: 3.5%
            referencePaiement: `paypal_${Date.now()}`,
            methode: 'paypal',
            emailPayPal: 'user@example.com'
          };
        } else {
          throw new Error('Paiement PayPal échoué');
        }
      })
    );
  }

  /**
   * Traiter un paiement Mobile Money
   */
  traiterPaiementMobileMoney(
    montant: number,
    devise: string,
    operateur: OperateurMobileMoney,
    numeroTelephone: string,
    description: string
  ): Observable<any> {
    console.log('📱 Traitement paiement Mobile Money:', { 
      montant, devise, operateur, numeroTelephone, description 
    });

    const config = CONFIGURATION_MOBILE_MONEY[operateur];
    if (!config) {
      return throwError(() => new Error('Opérateur Mobile Money non supporté'));
    }

    // Vérification des limites
    if (montant > config.limiteTransaction) {
      return throwError(() => new Error(`Montant supérieur à la limite de transaction (${config.limiteTransaction})`));
    }

    return of(null).pipe(
      delay(3000), // Délai plus long pour Mobile Money
      map(() => {
        const succes = Math.random() > 0.15; // 85% de succès

        if (succes) {
          const frais = montant * config.fraisTransaction;
          return {
            id: `mm_${operateur}_${Date.now()}`,
            statut: 'completed',
            montant: montant,
            devise: devise,
            frais: frais,
            referencePaiement: `${operateur}_${Date.now()}`,
            methode: 'mobile_money',
            operateur: operateur,
            numeroTelephone: numeroTelephone,
            messageConfirmation: `Paiement de ${montant} ${devise} effectué via ${operateur}`
          };
        } else {
          throw new Error('Paiement Mobile Money échoué - Vérifiez votre solde ou réessayez');
        }
      })
    );
  }

  /**
   * Traiter un paiement par virement bancaire
   */
  traiterPaiementVirement(
    montant: number,
    devise: string,
    detailsVirement: any,
    description: string
  ): Observable<any> {
    console.log('🏦 Traitement paiement virement:', { montant, devise, description });

    return of(null).pipe(
      delay(1000),
      map(() => ({
        id: `vir_${Date.now()}`,
        statut: 'pending',
        montant: montant,
        devise: devise,
        frais: 0, // Pas de frais pour virement
        referencePaiement: `VIR-${Date.now()}`,
        methode: 'virement',
        delaiTraitement: 1, // 1 jour ouvré
        iban: detailsVirement.iban,
        instructions: `Effectuer un virement de ${montant} ${devise} vers le compte IBAN: ${detailsVirement.iban} avec la référence ${`VIR-${Date.now()}`}`
      }))
    );
  }

  // =====================================================
  // GESTION DES MÉTHODES DE PAIEMENT
  // =====================================================

  /**
   * Ajouter une méthode de paiement
   */
  ajouterMethodePaiement(methodePaiement: Partial<MethodePaiement>): Observable<MethodePaiement> {
    const nouvelleMethode: MethodePaiement = {
      id: this.genererIdMethodePaiement(),
      type: methodePaiement.type!,
      nom: methodePaiement.nom!,
      actif: true,
      defaut: false,
      dateAjout: new Date(),
      ...methodePaiement
    };

    // Simulation de sauvegarde
    return of(nouvelleMethode).pipe(delay(500));
  }

  /**
   * Récupérer les méthodes de paiement disponibles pour un pays
   */
  getMethodesPaiementParPays(pays: string): Observable<TypePaiement[]> {
    const operateursMM = OPERATEURS_MOBILE_MONEY_PAR_PAYS[pays] || [];
    const methodesDisponibles: TypePaiement[] = [
      TypePaiement.CARTE_CREDIT,
      TypePaiement.VIREMENT_BANCAIRE
    ];

    // Ajouter Mobile Money si disponible
    if (operateursMM.length > 0) {
      methodesDisponibles.push(TypePaiement.MOBILE_MONEY);
    }

    // Ajouter PayPal pour certains pays
    if (['France', 'Allemagne', 'Royaume-Uni', 'États-Unis', 'Canada'].includes(pays)) {
      methodesDisponibles.push(TypePaiement.PAYPAL);
    }

    return of(methodesDisponibles).pipe(delay(200));
  }

  /**
   * Récupérer les opérateurs Mobile Money pour un pays
   */
  getOperateursMobileMoneyParPays(pays: string): Observable<OperateurMobileMoney[]> {
    return of(OPERATEURS_MOBILE_MONEY_PAR_PAYS[pays] || []).pipe(delay(100));
  }

  // =====================================================
  // GESTION DE L'UTILISATION ET DES LIMITES
  // =====================================================

  /**
   * Récupérer l'utilisation actuelle des ressources
   */
  getUtilisationActuelle(): Observable<UtilisationRessources> {
    return this.utilisation$.pipe(
      filter(utilisation => utilisation !== null),
      map(utilisation => utilisation!)
    );
  }

  /**
   * Vérifier si une action est autorisée selon les limites
   */
  verifierLimiteAction(typeAction: string, quantite: number = 1): Observable<boolean> {
    const abonnement = this.abonnementActuelSubject.value;
    const utilisation = this.utilisationSubject.value;

    if (!abonnement || !utilisation) {
      return of(false);
    }

    const limites = abonnement.limitesActuelles;

    switch (typeAction) {
      case 'ecriture':
        return of(verifierLimiteRessource(
          utilisation.ecrituresCeMois + quantite, 
          limites.nombreEcritures
        ));
      case 'document':
        return of(verifierLimiteRessource(
          utilisation.documentsUploadeCeMois + quantite, 
          limites.nombreDocuments
        ));
      case 'requete_ia':
        return of(verifierLimiteRessource(
          utilisation.requetesIACeMois + quantite, 
          limites.requetesIA
        ));
      case 'entreprise':
        return of(verifierLimiteRessource(
          utilisation.entreprisesUtilisees + quantite, 
          limites.nombreEntreprises
        ));
      default:
        return of(true);
    }
  }

  /**
   * Enregistrer l'utilisation d'une ressource
   */
  enregistrerUtilisation(typeRessource: string, quantite: number): Observable<boolean> {
    const utilisationActuelle = this.utilisationSubject.value;
    if (!utilisationActuelle) {
      return of(false);
    }

    const nouvelleUtilisation = { ...utilisationActuelle };

    switch (typeRessource) {
      case 'ecriture':
        nouvelleUtilisation.ecrituresCeMois += quantite;
        break;
      case 'document':
        nouvelleUtilisation.documentsUploadeCeMois += quantite;
        break;
      case 'requete_ia':
        nouvelleUtilisation.requetesIACeMois += quantite;
        break;
      case 'api_call':
        nouvelleUtilisation.appelsAPICeMois += quantite;
        break;
    }

    // Ajouter à l'historique
    nouvelleUtilisation.historiqueUtilisation.push({
      date: new Date(),
      ressource: typeRessource,
      quantite: quantite
    });

    this.utilisationSubject.next(nouvelleUtilisation);
    return of(true);
  }

  /**
   * Calculer le pourcentage d'utilisation par ressource
   */
  getStatistiquesUtilisation(): Observable<any> {
    const abonnement = this.abonnementActuelSubject.value;
    const utilisation = this.utilisationSubject.value;

    if (!abonnement || !utilisation) {
      return of({});
    }

    const limites = abonnement.limitesActuelles;

    return of({
      ecritures: {
        utilise: utilisation.ecrituresCeMois,
        limite: limites.nombreEcritures,
        pourcentage: calculerPourcentageUtilisation(utilisation.ecrituresCeMois, limites.nombreEcritures)
      },
      documents: {
        utilise: utilisation.documentsUploadeCeMois,
        limite: limites.nombreDocuments,
        pourcentage: calculerPourcentageUtilisation(utilisation.documentsUploadeCeMois, limites.nombreDocuments)
      },
      requetesIA: {
        utilise: utilisation.requetesIACeMois,
        limite: limites.requetesIA,
        pourcentage: calculerPourcentageUtilisation(utilisation.requetesIACeMois, limites.requetesIA)
      },
      stockage: {
        utilise: utilisation.espaceUtilise,
        limite: limites.espaceStockage,
        pourcentage: calculerPourcentageUtilisation(utilisation.espaceUtilise, limites.espaceStockage)
      }
    });
  }

  // =====================================================
  // GESTION DES FACTURES
  // =====================================================

  /**
   * Récupérer toutes les factures
   */
  getFactures(): Observable<Facture[]> {
    return this.factures$;
  }

  /**
   * Générer une nouvelle facture
   */
  genererFacture(abonnement: Abonnement): Observable<Facture> {
    const nouvelleFacture: Facture = {
      id: this.genererIdFacture(),
      numero: this.genererNumeroFacture(),
      abonnementId: abonnement.id,
      entrepriseId: abonnement.entrepriseId,
      dateEmission: new Date(),
      dateEcheance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 jours
      periode: abonnement.periodeFacturation,
      montantHT: abonnement.montantHT,
      montantTVA: abonnement.montantTTC - abonnement.montantHT,
      montantTTC: abonnement.montantTTC,
      devise: abonnement.devise,
      lignes: [{
        description: `Abonnement ${abonnement.plan.nom} - ${abonnement.periodeFacturation}`,
        quantite: 1,
        prixUnitaireHT: abonnement.montantHT,
        montantHT: abonnement.montantHT,
        tauxTVA: 20, // À adapter selon le pays
        montantTVA: abonnement.montantTTC - abonnement.montantHT,
        montantTTC: abonnement.montantTTC,
        periode: `${new Date().getMonth() + 1}/${new Date().getFullYear()}`
      }],
      statut: StatutFacture.ENVOYEE,
      methodePaiement: abonnement.methodePaiement,
      tentativesPaiement: [],
      dateCreation: new Date()
    };

    // Ajouter la facture à la liste
    const facturesActuelles = this.facturesSubject.value;
    this.facturesSubject.next([...facturesActuelles, nouvelleFacture]);

    return of(nouvelleFacture).pipe(delay(300));
  }

  // =====================================================
  // UTILITAIRES PRIVÉS
  // =====================================================

  private sauvegarderAbonnement(abonnement: Abonnement): Observable<Abonnement> {
    return of(abonnement).pipe(
      delay(500),
      map(() => {
        this.abonnementActuelSubject.next(abonnement);
        console.log('💾 Abonnement sauvegardé:', abonnement);
        return abonnement;
      })
    );
  }

  private initialiserSurveillanceUtilisation(): void {
    // Simuler la surveillance de l'utilisation en temps réel
    interval(60000).subscribe(() => {
      this.mettreAJourUtilisationSimulee();
    });

    // Initialiser avec des données de base
    this.utilisationSubject.next(this.initialiserUtilisation());
  }

  private initialiserUtilisation(): UtilisationRessources {
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);

    return {
      periodeDebut: debutMois,
      periodeFin: finMois,
      entreprisesUtilisees: 1,
      utilisateursActifs: 1,
      ecrituresCeMois: Math.floor(Math.random() * 30),
      comptesUtilises: 45,
      espaceUtilise: 0.5,
      documentsUploadeCeMois: Math.floor(Math.random() * 15),
      requetesIACeMois: Math.floor(Math.random() * 25),
      analysesLanceesCeMois: Math.floor(Math.random() * 5),
      appelsAPICeMois: Math.floor(Math.random() * 100),
      integrationsActives: 0,
      exportsCeMois: Math.floor(Math.random() * 10),
      rapportsGeneresCeMois: Math.floor(Math.random() * 8),
      historiqueUtilisation: []
    };
  }

  private mettreAJourUtilisationSimulee(): void {
    const utilisationActuelle = this.utilisationSubject.value;
    if (!utilisationActuelle) return;

    // Simulation d'activité légère
    if (Math.random() > 0.7) {
      const ressources = ['ecriture', 'document', 'requete_ia', 'api_call'];
      const ressource = ressources[Math.floor(Math.random() * ressources.length)];
      this.enregistrerUtilisation(ressource, 1).subscribe();
    }
  }

  private calculerDateFin(dateDebut: Date, periode: PeriodeFacturation): Date {
    const date = new Date(dateDebut);
    switch (periode) {
      case PeriodeFacturation.MENSUEL:
        date.setMonth(date.getMonth() + 1);
        break;
      case PeriodeFacturation.TRIMESTRIEL:
        date.setMonth(date.getMonth() + 3);
        break;
      case PeriodeFacturation.SEMESTRIEL:
        date.setMonth(date.getMonth() + 6);
        break;
      case PeriodeFacturation.ANNUEL:
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  }

  private calculerDateRenouvellement(dateDebut: Date, periode: PeriodeFacturation): Date {
    return this.calculerDateFin(dateDebut, periode);
  }

  private calculerProchaineFacturation(dateDebut: Date, periode: PeriodeFacturation, essaiJours: number): Date {
    const date = new Date(dateDebut);
    if (essaiJours > 0) {
      date.setDate(date.getDate() + essaiJours);
    }
    return date;
  }

  private calculerMontantHT(plan: PlanAbonnement, periode: PeriodeFacturation): number {
    switch (periode) {
      case PeriodeFacturation.MENSUEL:
        return plan.prixMensuel;
      case PeriodeFacturation.TRIMESTRIEL:
        return plan.prixMensuel * 3;
      case PeriodeFacturation.SEMESTRIEL:
        return plan.prixMensuel * 6;
      case PeriodeFacturation.ANNUEL:
        return plan.prixAnnuel;
      default:
        return plan.prixMensuel;
    }
  }

  private calculerMontantTTC(plan: PlanAbonnement, periode: PeriodeFacturation): number {
    const montantHT = this.calculerMontantHT(plan, periode);
    return montantHT * 1.20; // TVA 20% par défaut
  }

  private genererIdAbonnement(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private genererIdMethodePaiement(): string {
    return `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private genererIdFacture(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private genererIdHistorique(): string {
    return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private genererNumeroFacture(): string {
    const date = new Date();
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const numero = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `ECOMPTA-${annee}${mois}-${numero}`;
  }

  // =====================================================
  // MÉTHODES PUBLIQUES UTILITAIRES
  // =====================================================

  /**
   * Simuler le renouvellement automatique
   */
  simulerRenouvellement(): Observable<boolean> {
    const abonnement = this.abonnementActuelSubject.value;
    if (!abonnement) {
      return of(false);
    }

    console.log('🔄 Simulation renouvellement automatique...');
    
    return this.genererFacture(abonnement).pipe(
      switchMap(facture => {
        // Simuler le paiement automatique
        return this.traiterPaiementAutomatique(facture);
      }),
      map(() => {
        // Mettre à jour les dates d'abonnement
        const abonnementRenouvele = {
          ...abonnement,
          dateDebut: abonnement.dateFin,
          dateFin: this.calculerDateFin(abonnement.dateFin, abonnement.periodeFacturation),
          dateRenouvellement: this.calculerDateRenouvellement(abonnement.dateFin, abonnement.periodeFacturation),
          prochaineFacturation: this.calculerDateFin(abonnement.dateFin, abonnement.periodeFacturation),
          derniereModification: new Date()
        };

        this.abonnementActuelSubject.next(abonnementRenouvele);
        return true;
      })
    );
  }

  private traiterPaiementAutomatique(facture: Facture): Observable<any> {
    // Simuler le paiement selon la méthode
    switch (facture.methodePaiement.type) {
      case TypePaiement.CARTE_CREDIT:
        return this.traiterPaiementCarte(
          facture.montantTTC,
          facture.devise,
          facture.methodePaiement.detailsCarte,
          `Renouvellement automatique - Facture ${facture.numero}`
        );
      case TypePaiement.MOBILE_MONEY:
        const detailsMM = facture.methodePaiement.detailsMobileMoney!;
        return this.traiterPaiementMobileMoney(
          facture.montantTTC,
          facture.devise,
          detailsMM.operateur,
          detailsMM.numeroTelephone,
          `Renouvellement automatique - Facture ${facture.numero}`
        );
      default:
        return of({ statut: 'pending' });
    }
  }

  /**
   * Obtenir le résumé de l'abonnement pour le dashboard
   */
  getResumeAbonnement(): Observable<any> {
    const abonnement = this.abonnementActuelSubject.value;
    const utilisation = this.utilisationSubject.value;

    if (!abonnement || !utilisation) {
      return of(null);
    }

    return of({
      plan: abonnement.plan.nom,
      statut: abonnement.statut,
      prochaineFacturation: abonnement.prochaineFacturation,
      montantProchain: abonnement.montantTTC,
      devise: abonnement.devise,
      essaiActif: abonnement.essaiGratuit && new Date() < (abonnement.dateFinEssai || new Date()),
      joursEssaiRestants: abonnement.dateFinEssai ? 
        Math.max(0, Math.ceil((abonnement.dateFinEssai.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0,
      alertesLimites: this.detecterAlertesLimites(abonnement, utilisation)
    });
  }

  private detecterAlertesLimites(abonnement: Abonnement, utilisation: UtilisationRessources): string[] {
    const alertes: string[] = [];
    const limites = abonnement.limitesActuelles;

    if (limites.nombreEcritures > 0) {
      const pourcentageEcritures = calculerPourcentageUtilisation(utilisation.ecrituresCeMois, limites.nombreEcritures);
      if (pourcentageEcritures > 80) {
        alertes.push(`Écritures: ${pourcentageEcritures}% utilisées (${utilisation.ecrituresCeMois}/${limites.nombreEcritures})`);
      }
    }

    if (limites.requetesIA > 0) {
      const pourcentageIA = calculerPourcentageUtilisation(utilisation.requetesIACeMois, limites.requetesIA);
      if (pourcentageIA > 80) {
        alertes.push(`Requêtes IA: ${pourcentageIA}% utilisées (${utilisation.requetesIACeMois}/${limites.requetesIA})`);
      }
    }

    if (limites.espaceStockage > 0) {
      const pourcentageStockage = calculerPourcentageUtilisation(utilisation.espaceUtilise, limites.espaceStockage);
      if (pourcentageStockage > 80) {
        alertes.push(`Stockage: ${pourcentageStockage}% utilisé (${utilisation.espaceUtilise}/${limites.espaceStockage} GB)`);
      }
    }

    return alertes;
  }
}