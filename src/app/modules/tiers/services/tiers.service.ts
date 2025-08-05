import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError, combineLatest } from 'rxjs';
import { map, delay, switchMap, filter } from 'rxjs/operators';
import { 
  Tiers,
  ScoringTiers,
  ValidationTiersIA,
  StatistiquesTiers,
  HistoriquePaiement,
  HistoriqueRelance,
  ContactTiers,
  DocumentTiers,
  TypeTiers,
  StatutTiers,
  ClasseRisque,
  StatutPaiement,
  NiveauRelance,
  ModePaiement,
  TypeControleTiers,
  TypeAnomalieTiers,
  TypeSuggestionTiers,
  SEUILS_SCORING,
  CRITERES_SCORING_DEFAUT,
  MODELES_RELANCE_DEFAUT,
  DELAIS_PAIEMENT_STANDARDS
} from '../models/tiers.model';

@Injectable({
  providedIn: 'root'
})
export class TiersService {

  private tiersSubject = new BehaviorSubject<Tiers[]>([]);
  private statistiquesGlobalesSubject = new BehaviorSubject<any>(null);
  private relancesEnCoursSubject = new BehaviorSubject<HistoriqueRelance[]>([]);

  tiers$ = this.tiersSubject.asObservable();
  statistiquesGlobales$ = this.statistiquesGlobalesSubject.asObservable();
  relancesEnCours$ = this.relancesEnCoursSubject.asObservable();

  constructor() { 
    this.initialiserDonneesDemo();
  }

  // ==================== GESTION TIERS ====================

  // Créer un nouveau tiers
  creerTiers(tiers: Partial<Tiers>): Observable<Tiers> {
    return new Observable(observer => {
      setTimeout(() => {
        const nouveauTiers: Tiers = {
          id: `tiers_${Date.now()}`,
          code: this.genererCodeTiers(tiers.typeTiers!),
          raisonSociale: tiers.raisonSociale || '',
          nom: tiers.nom,
          prenom: tiers.prenom,
          typeTiers: tiers.typeTiers!,
          categorieTiers: tiers.categorieTiers!,
          natureTiers: tiers.natureTiers!,
          pays: tiers.pays || 'CI',
          ville: tiers.ville || '',
          adresseComplete: tiers.adresseComplete || '',
          telephone: tiers.telephone,
          email: tiers.email,
          compteComptable: this.determinerCompteComptable(tiers.typeTiers!),
          dateCreation: new Date(),
          derniereModification: new Date(),
          creePar: 'admin',
          statut: StatutTiers.ACTIF,
          contacts: [],
          documents: [],
          observations: []
        };

        // Validation IA automatique
        this.validerTiersAvecIA(nouveauTiers).subscribe(validation => {
          nouveauTiers.validationIA = validation;
          
          // Calcul scoring initial
          this.calculerScoring(nouveauTiers).subscribe(scoring => {
            nouveauTiers.scoring = scoring;
            
            const tiersActuels = this.tiersSubject.value;
            const nouveauxTiers = [...tiersActuels, nouveauTiers];
            
            this.tiersSubject.next(nouveauxTiers);
            this.mettreAJourStatistiquesGlobales(nouveauxTiers);
            
            observer.next(nouveauTiers);
            observer.complete();
          });
        });
      }, 800);
    });
  }

  // Modifier un tiers
  modifierTiers(tiersId: string, modifications: Partial<Tiers>): Observable<Tiers> {
    return new Observable(observer => {
      setTimeout(() => {
        const tiersActuels = this.tiersSubject.value;
        const index = tiersActuels.findIndex(t => t.id === tiersId);
        
        if (index === -1) {
          observer.error('Tiers non trouvé');
          return;
        }

        const tiersModifie = {
          ...tiersActuels[index],
          ...modifications,
          derniereModification: new Date()
        };

        // Re-validation IA
        this.validerTiersAvecIA(tiersModifie).subscribe(validation => {
          tiersModifie.validationIA = validation;
          
          // Recalcul scoring si nécessaire
          if (this.doitRecalculerScoring(modifications)) {
            this.calculerScoring(tiersModifie).subscribe(scoring => {
              tiersModifie.scoring = scoring;
              this.finaliserModification(tiersActuels, index, tiersModifie, observer);
            });
          } else {
            this.finaliserModification(tiersActuels, index, tiersModifie, observer);
          }
        });
      }, 500);
    });
  }

  // Supprimer un tiers
  supprimerTiers(tiersId: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const tiersActuels = this.tiersSubject.value;
        const tiers = tiersActuels.find(t => t.id === tiersId);
        
        if (!tiers) {
          observer.error('Tiers non trouvé');
          return;
        }

        // Vérifications avant suppression
        if (tiers.statistiques && tiers.statistiques.montantEnCours > 0) {
          observer.error('Impossible de supprimer un tiers avec des montants en cours');
          return;
        }

        const nouveauxTiers = tiersActuels.filter(t => t.id !== tiersId);
        
        this.tiersSubject.next(nouveauxTiers);
        this.mettreAJourStatistiquesGlobales(nouveauxTiers);
        
        observer.next(true);
        observer.complete();
      }, 300);
    });
  }

  // ==================== RECHERCHE ET FILTRAGE ====================

  // Rechercher des tiers
  rechercherTiers(criteres: {
    query?: string;
    typeTiers?: TypeTiers;
    statut?: StatutTiers;
    classeRisque?: ClasseRisque;
    pays?: string;
    actifSeulement?: boolean;
  }): Observable<Tiers[]> {
    return this.tiers$.pipe(
      map(tiers => {
        let resultats = [...tiers];

        if (criteres.query) {
          const query = criteres.query.toLowerCase();
          resultats = resultats.filter(t => 
            t.raisonSociale.toLowerCase().includes(query) ||
            t.code.toLowerCase().includes(query) ||
            t.email?.toLowerCase().includes(query) ||
            (t.nom && t.nom.toLowerCase().includes(query)) ||
            (t.prenom && t.prenom.toLowerCase().includes(query))
          );
        }

        if (criteres.typeTiers) {
          resultats = resultats.filter(t => t.typeTiers === criteres.typeTiers);
        }

        if (criteres.statut) {
          resultats = resultats.filter(t => t.statut === criteres.statut);
        }

        if (criteres.classeRisque) {
          resultats = resultats.filter(t => t.scoring?.classeRisque === criteres.classeRisque);
        }

        if (criteres.pays) {
          resultats = resultats.filter(t => t.pays === criteres.pays);
        }

        if (criteres.actifSeulement) {
          resultats = resultats.filter(t => t.statut === StatutTiers.ACTIF);
        }

        return resultats.sort((a, b) => a.raisonSociale.localeCompare(b.raisonSociale));
      })
    );
  }

  // Obtenir tiers par type
  getTiersParType(type: TypeTiers): Observable<Tiers[]> {
    return this.tiers$.pipe(
      map(tiers => tiers.filter(t => t.typeTiers === type))
    );
  }

  // Obtenir tiers à risque
  getTiersArisque(): Observable<Tiers[]> {
    return this.tiers$.pipe(
      map(tiers => tiers.filter(t => 
        t.scoring?.classeRisque === ClasseRisque.RISQUE || 
        t.scoring?.classeRisque === ClasseRisque.TRES_RISQUE
      ))
    );
  }

  // ==================== SCORING ET ÉVALUATION ====================

  // Calculer le scoring d'un tiers
  calculerScoring(tiers: Tiers): Observable<ScoringTiers> {
    return new Observable(observer => {
      setTimeout(() => {
        const scoring: ScoringTiers = {
          scoreGlobal: 0,
          scorePaiement: this.calculerScorePaiement(tiers),
          scoreStabilite: this.calculerScoreStabilite(tiers),
          scoreVolume: this.calculerScoreVolume(tiers),
          scoreRentabilite: this.calculerScoreRentabilite(tiers),
          indicateurs: [],
          evolution: [],
          classeRisque: ClasseRisque.MOYEN,
          probabiliteDefaut: 0,
          recommandations: [],
          dateCalcul: new Date(),
          prochainRecalcul: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 jours
        };

        // Calcul score global pondéré
        scoring.scoreGlobal = Math.round(
          (scoring.scorePaiement * 0.4) +
          (scoring.scoreStabilite * 0.25) +
          (scoring.scoreVolume * 0.20) +
          (scoring.scoreRentabilite * 0.15)
        ) * 10; // Sur 1000

        // Détermination classe de risque
        scoring.classeRisque = this.determinerClasseRisque(scoring.scoreGlobal);
        scoring.probabiliteDefaut = this.calculerProbabiliteDefaut(scoring.scoreGlobal);

        // Génération des indicateurs détaillés
        scoring.indicateurs = this.genererIndicateursScoring(tiers, scoring);

        // Génération des recommandations
        scoring.recommandations = this.genererRecommandationsScoring(tiers, scoring);

        observer.next(scoring);
        observer.complete();
      }, 400);
    });
  }

  // Recalculer tous les scorings
  recalculerTousLesScorings(): Observable<number> {
    return new Observable(observer => {
      const tiers = this.tiersSubject.value;
      let compteur = 0;
      
      const recalculerProchain = () => {
        if (compteur >= tiers.length) {
          observer.next(compteur);
          observer.complete();
          return;
        }

        this.calculerScoring(tiers[compteur]).subscribe(scoring => {
          tiers[compteur].scoring = scoring;
          compteur++;
          setTimeout(recalculerProchain, 100); // Délai entre calculs
        });
      };

      recalculerProchain();
    });
  }

  // ==================== GESTION DES RELANCES ====================

  // Générer relances automatiques
  genererRelancesAutomatiques(): Observable<HistoriqueRelance[]> {
    return new Observable(observer => {
      setTimeout(() => {
        const relances: HistoriqueRelance[] = [];
        const tiers = this.tiersSubject.value;

        tiers.forEach(t => {
          if (t.parametresRelance?.relanceAutomatique && t.historiquePaiements) {
            const factures = t.historiquePaiements.filter(p => 
              p.statut === StatutPaiement.EN_RETARD || p.statut === StatutPaiement.IMPAYE
            );

            factures.forEach(facture => {
              const relance = this.determinerNiveauRelance(facture, t.historiqueRelances || []);
              if (relance) {
                relances.push(relance);
              }
            });
          }
        });

        this.relancesEnCoursSubject.next(relances);
        observer.next(relances);
        observer.complete();
      }, 1000);
    });
  }

  // Envoyer une relance
  envoyerRelance(relance: HistoriqueRelance): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        // Simulation envoi
        relance.statutEnvoi = Math.random() > 0.1 ? 'ENVOYE' : 'ECHEC';
        relance.dateEnvoi = new Date();

        // Ajouter à l'historique du tiers
        const tiers = this.tiersSubject.value;
        const tiersIndex = tiers.findIndex(t => 
          t.historiquePaiements?.some(p => p.factureId === relance.factureId)
        );

        if (tiersIndex !== -1) {
          if (!tiers[tiersIndex].historiqueRelances) {
            tiers[tiersIndex].historiqueRelances = [];
          }
          tiers[tiersIndex].historiqueRelances!.push(relance);
        }

        observer.next(relance.statutEnvoi === 'ENVOYE');
        observer.complete();
      }, 500);
    });
  }

  // ==================== VALIDATION IA ====================

  // Valider un tiers avec IA
  validerTiersAvecIA(tiers: Tiers): Observable<ValidationTiersIA> {
    return new Observable(observer => {
      setTimeout(() => {
        const controles = [];
        const anomalies = [];
        const suggestions = [];
        let score = 0;

        // Contrôle 1: Informations obligatoires
        const champsObligatoires = ['raisonSociale', 'typeTiers', 'pays', 'compteComptable'];
        const champsManquants = champsObligatoires.filter(champ => !tiers[champ as keyof Tiers]);
        
        if (champsManquants.length === 0) {
          controles.push({
            type: TypeControleTiers.INFORMATIONS_OBLIGATOIRES,
            resultat: 'CONFORME' as const,
            message: 'Toutes les informations obligatoires sont présentes',
            priorite: 'HAUTE' as const
          });
          score += 25;
        } else {
          controles.push({
            type: TypeControleTiers.INFORMATIONS_OBLIGATOIRES,
            resultat: 'NON_CONFORME' as const,
            message: `Champs manquants: ${champsManquants.join(', ')}`,
            priorite: 'HAUTE' as const
          });
          anomalies.push({
            type: TypeAnomalieTiers.DONNEE_MANQUANTE,
            gravite: 'CRITIQUE' as const,
            description: 'Des informations obligatoires sont manquantes',
            champConcerne: champsManquants.join(', '),
            actionCorrectrice: 'Compléter les champs obligatoires',
            dateDetection: new Date()
          });
        }

        // Contrôle 2: Validation email
        if (tiers.email) {
          const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tiers.email);
          if (emailValide) {
            controles.push({
              type: TypeControleTiers.VALIDATION_EMAIL,
              resultat: 'CONFORME' as const,
              message: 'Format email valide',
              priorite: 'MOYENNE' as const
            });
            score += 15;
          } else {
            controles.push({
              type: TypeControleTiers.VALIDATION_EMAIL,
              resultat: 'NON_CONFORME' as const,
              message: 'Format email invalide',
              priorite: 'MOYENNE' as const
            });
            anomalies.push({
              type: TypeAnomalieTiers.FORMAT_INVALIDE,
              gravite: 'IMPORTANTE' as const,
              description: 'Le format de l\'email est incorrect',
              champConcerne: 'email',
              valeurActuelle: tiers.email,
              actionCorrectrice: 'Corriger le format de l\'email',
              dateDetection: new Date()
            });
          }
        }

        // Contrôle 3: Validation téléphone
        if (tiers.telephone) {
          const telephoneValide = /^[\+]?[0-9\s\-\(\)]{8,}$/.test(tiers.telephone);
          if (telephoneValide) {
            controles.push({
              type: TypeControleTiers.VALIDATION_TELEPHONE,
              resultat: 'CONFORME' as const,
              message: 'Format téléphone valide',
              priorite: 'MOYENNE' as const
            });
            score += 10;
          } else {
            anomalies.push({
              type: TypeAnomalieTiers.FORMAT_INVALIDE,
              gravite: 'MINEURE' as const,
              description: 'Le format du téléphone semble incorrect',
              champConcerne: 'telephone',
              valeurActuelle: tiers.telephone,
              actionCorrectrice: 'Vérifier le format du numéro de téléphone',
              dateDetection: new Date()
            });
          }
        }

        // Contrôle 4: Détection doublons
        const tiersExistants = this.tiersSubject.value;
        const doublonsPotentiels = tiersExistants.filter(t => 
          t.id !== tiers.id && (
            t.raisonSociale.toLowerCase() === tiers.raisonSociale.toLowerCase() ||
            (t.email && tiers.email && t.email.toLowerCase() === tiers.email.toLowerCase()) ||
            (t.numeroIFU && tiers.numeroIFU && t.numeroIFU === tiers.numeroIFU)
          )
        );

        if (doublonsPotentiels.length === 0) {
          controles.push({
            type: TypeControleTiers.DOUBLONS,
            resultat: 'CONFORME' as const,
            message: 'Aucun doublon détecté',
            priorite: 'HAUTE' as const
          });
          score += 20;
        } else {
          controles.push({
            type: TypeControleTiers.DOUBLONS,
            resultat: 'ATTENTION' as const,
            message: `${doublonsPotentiels.length} doublon(s) potentiel(s) détecté(s)`,
            priorite: 'HAUTE' as const
          });
          score += 5;
        }

        // Contrôle 5: Cohérence des données
        const incoherences = this.detecterIncoherencesDonnees(tiers);
        if (incoherences.length === 0) {
          controles.push({
            type: TypeControleTiers.COHERENCE_DONNEES,
            resultat: 'CONFORME' as const,
            message: 'Données cohérentes',
            priorite: 'MOYENNE' as const
          });
          score += 15;
        } else {
          score += 5;
          incoherences.forEach(incoherence => {
            anomalies.push({
              type: TypeAnomalieTiers.INCOHERENCE,
              gravite: 'IMPORTANTE' as const,
              description: incoherence,
              champConcerne: 'multiple',
              actionCorrectrice: 'Vérifier la cohérence des données saisies',
              dateDetection: new Date()
            });
          });
        }

        // Génération des suggestions
        suggestions.push(...this.genererSuggestionsTiers(tiers, score));

        // Score final avec bonus
        score = Math.min(100, score + 15); // Bonus base

        const validation: ValidationTiersIA = {
          score,
          controles,
          anomalies,
          suggestions,
          conformite: score >= 80,
          dateValidation: new Date()
        };

        observer.next(validation);
        observer.complete();
      }, 600);
    });
  }

  // ==================== STATISTIQUES ====================

  // Obtenir statistiques d'un tiers
  getStatistiquesTiers(tiersId: string): Observable<StatistiquesTiers> {
    return new Observable(observer => {
      setTimeout(() => {
        const tiers = this.tiersSubject.value.find(t => t.id === tiersId);
        if (!tiers) {
          observer.error('Tiers non trouvé');
          return;
        }

        const stats = this.calculerStatistiquesTiers(tiers);
        observer.next(stats);
        observer.complete();
      }, 300);
    });
  }

  // Obtenir statistiques globales
  getStatistiquesGlobales(): Observable<any> {
    return this.statistiquesGlobales$;
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private genererCodeTiers(type: TypeTiers): string {
    const prefixes = {
      [TypeTiers.CLIENT]: 'C',
      [TypeTiers.FOURNISSEUR]: 'F',
      [TypeTiers.CLIENT_FOURNISSEUR]: 'CF',
      [TypeTiers.PROSPECT]: 'P',
      [TypeTiers.PARTENAIRE]: 'PA',
      [TypeTiers.SOUS_TRAITANT]: 'ST'
    };
    
    const prefix = prefixes[type];
    const numero = String(Date.now()).slice(-6);
    return `${prefix}${numero}`;
  }

  private determinerCompteComptable(type: TypeTiers): string {
    const comptes = {
      [TypeTiers.CLIENT]: '411000',
      [TypeTiers.FOURNISSEUR]: '401000',
      [TypeTiers.CLIENT_FOURNISSEUR]: '411000',
      [TypeTiers.PROSPECT]: '411000',
      [TypeTiers.PARTENAIRE]: '467000',
      [TypeTiers.SOUS_TRAITANT]: '401000'
    };
    
    return comptes[type];
  }

  private calculerScorePaiement(tiers: Tiers): number {
    if (!tiers.historiquePaiements || tiers.historiquePaiements.length === 0) {
      return 50; // Score neutre sans historique
    }

    const paiements = tiers.historiquePaiements;
    const paiementsEnRetard = paiements.filter(p => p.retard && p.retard > 0);
    const tauxPonctualite = ((paiements.length - paiementsEnRetard.length) / paiements.length) * 100;
    
    const retardMoyen = paiementsEnRetard.length > 0 
      ? paiementsEnRetard.reduce((sum, p) => sum + (p.retard || 0), 0) / paiementsEnRetard.length
      : 0;

    let score = tauxPonctualite;
    if (retardMoyen > 30) score -= 20;
    else if (retardMoyen > 15) score -= 10;
    else if (retardMoyen > 7) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  private calculerScoreStabilite(tiers: Tiers): number {
    const anciennete = tiers.dateCreation 
      ? (Date.now() - tiers.dateCreation.getTime()) / (365 * 24 * 60 * 60 * 1000)
      : 0;

    let score = 30; // Score de base
    
    if (anciennete > 5) score += 40;
    else if (anciennete > 2) score += 25;
    else if (anciennete > 1) score += 15;
    else if (anciennete > 0.5) score += 10;

    // Bonus pour régularité
    if (tiers.statistiques?.frequenceCommandes && tiers.statistiques.frequenceCommandes > 10) {
      score += 20;
    } else if (tiers.statistiques?.frequenceCommandes && tiers.statistiques.frequenceCommandes > 5) {
      score += 10;
    }

    // Malus pour inactivité
    if (tiers.statistiques?.derniereTransaction) {
      const joursInactivite = (Date.now() - tiers.statistiques.derniereTransaction.getTime()) / (24 * 60 * 60 * 1000);
      if (joursInactivite > 180) score -= 20;
      else if (joursInactivite > 90) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculerScoreVolume(tiers: Tiers): number {
    if (!tiers.statistiques) return 30;

    const ca = tiers.statistiques.chiffreAffairesAnnuel || 0;
    const nombreFactures = tiers.statistiques.nombreFactures || 0;

    let score = 0;
    
    // Score basé sur CA
    if (ca > 10000000) score += 50; // 10M+
    else if (ca > 5000000) score += 40; // 5-10M
    else if (ca > 1000000) score += 30; // 1-5M
    else if (ca > 500000) score += 20; // 500K-1M
    else if (ca > 100000) score += 10; // 100-500K
    else score += 5;

    // Score basé sur fréquence
    if (nombreFactures > 100) score += 30;
    else if (nombreFactures > 50) score += 20;
    else if (nombreFactures > 20) score += 15;
    else if (nombreFactures > 10) score += 10;
    else if (nombreFactures > 5) score += 5;

    // Bonus évolution positive
    if (tiers.statistiques.evolutionCA > 20) score += 20;
    else if (tiers.statistiques.evolutionCA > 10) score += 10;
    else if (tiers.statistiques.evolutionCA > 0) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private calculerScoreRentabilite(tiers: Tiers): number {
    // Score simulé basé sur des critères de rentabilité
    let score = 50; // Score de base

    if (tiers.tauxRemise) {
      if (tiers.tauxRemise < 5) score += 20;
      else if (tiers.tauxRemise < 10) score += 10;
      else if (tiers.tauxRemise > 20) score -= 10;
    }

    if (tiers.statistiques?.panierMoyen) {
      if (tiers.statistiques.panierMoyen > 100000) score += 20;
      else if (tiers.statistiques.panierMoyen > 50000) score += 10;
      else if (tiers.statistiques.panierMoyen < 10000) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private determinerClasseRisque(scoreGlobal: number): ClasseRisque {
    if (scoreGlobal >= SEUILS_SCORING.EXCELLENT.min) return ClasseRisque.EXCELLENT;
    if (scoreGlobal >= SEUILS_SCORING.BON.min) return ClasseRisque.BON;
    if (scoreGlobal >= SEUILS_SCORING.MOYEN.min) return ClasseRisque.MOYEN;
    if (scoreGlobal >= SEUILS_SCORING.RISQUE.min) return ClasseRisque.RISQUE;
    return ClasseRisque.TRES_RISQUE;
  }

  private calculerProbabiliteDefaut(scoreGlobal: number): number {
    // Formule simplifiée de probabilité de défaut
    return Math.max(0, Math.min(100, 100 - (scoreGlobal / 10)));
  }

  private genererIndicateursScoring(tiers: Tiers, scoring: ScoringTiers): any[] {
    return CRITERES_SCORING_DEFAUT.map(critere => ({
      nom: critere.nom,
      valeur: this.getValeurIndicateur(critere.nom, tiers, scoring),
      poids: critere.poids,
      evolution: 'STABLE' as const,
      commentaire: critere.description
    }));
  }

  private getValeurIndicateur(nom: string, tiers: Tiers, scoring: ScoringTiers): number {
    switch (nom) {
      case 'Ponctualité paiements': return scoring.scorePaiement;
      case 'Volume d\'affaires': return scoring.scoreVolume;
      case 'Ancienneté relation': return scoring.scoreStabilite;
      case 'Stabilité financière': return scoring.scoreStabilite;
      case 'Rentabilité': return scoring.scoreRentabilite;
      case 'Litiges': return 85; // Simulé
      default: return 50;
    }
  }

  private genererRecommandationsScoring(tiers: Tiers, scoring: ScoringTiers): any[] {
    const recommandations = [];

    if (scoring.scorePaiement < 70) {
      recommandations.push({
        type: 'PAIEMENT',
        priorite: 'HAUTE',
        titre: 'Améliorer le suivi des paiements',
        description: 'Le score de paiement est faible',
        actionRecommandee: 'Mettre en place des relances automatiques',
        impactAttendu: 'Réduction des retards de paiement de 30%'
      });
    }

    if (scoring.scoreVolume < 50) {
      recommandations.push({
        type: 'COMMERCIAL',
        priorite: 'MOYENNE',
        titre: 'Développer le volume d\'affaires',
        description: 'Potentiel de croissance identifié',
        actionRecommandee: 'Proposer des offres commerciales attractives',
        impactAttendu: 'Augmentation du CA de 20%'
      });
    }

    return recommandations;
  }

  private determinerNiveauRelance(facture: HistoriquePaiement, historique: HistoriqueRelance[]): HistoriqueRelance | null {
    if (!facture.dateEcheance) return null;

    const joursRetard = Math.floor((Date.now() - facture.dateEcheance.getTime()) / (24 * 60 * 60 * 1000));
    const relancesFacture = historique.filter(r => r.factureId === facture.factureId);

    let niveau: NiveauRelance;
    
    if (joursRetard >= 60 && !relancesFacture.some(r => r.niveau === NiveauRelance.MISE_EN_DEMEURE)) {
      niveau = NiveauRelance.MISE_EN_DEMEURE;
    } else if (joursRetard >= 30 && !relancesFacture.some(r => r.niveau === NiveauRelance.RELANCE_3)) {
      niveau = NiveauRelance.RELANCE_3;
    } else if (joursRetard >= 15 && !relancesFacture.some(r => r.niveau === NiveauRelance.RELANCE_2)) {
      niveau = NiveauRelance.RELANCE_2;
    } else if (joursRetard >= 7 && !relancesFacture.some(r => r.niveau === NiveauRelance.RELANCE_1)) {
      niveau = NiveauRelance.RELANCE_1;
    } else {
      return null;
    }

    return {
      id: `relance_${Date.now()}`,
      factureId: facture.factureId,
      niveau,
      dateEnvoi: new Date(),
      modeEnvoi: 'EMAIL',
      destinataire: '', // À remplir
      objet: MODELES_RELANCE_DEFAUT[niveau].objet.replace('{numeroFacture}', facture.numeroFacture),
      contenu: MODELES_RELANCE_DEFAUT[niveau].contenu,
      statutEnvoi: 'EN_ATTENTE',
      montantConcerne: facture.montantFacture - facture.montantPaye,
      operateur: 'system'
    };
  }

  private detecterIncoherencesDonnees(tiers: Tiers): string[] {
    const incoherences = [];

    // Vérification cohérence type/compte
    if (tiers.typeTiers === TypeTiers.CLIENT && !tiers.compteComptable.startsWith('41')) {
      incoherences.push('Compte comptable incohérent avec le type client');
    }
    
    if (tiers.typeTiers === TypeTiers.FOURNISSEUR && !tiers.compteComptable.startsWith('40')) {
      incoherences.push('Compte comptable incohérent avec le type fournisseur');
    }

    // Vérification délai de paiement
    if (tiers.delaiPaiement && tiers.delaiPaiement < 0) {
      incoherences.push('Délai de paiement négatif');
    }

    return incoherences;
  }

  private genererSuggestionsTiers(tiers: Tiers, score: number): any[] {
    const suggestions = [];

    if (score < 80) {
      suggestions.push({
        type: TypeSuggestionTiers.AMELIORATION_RECOUVREMENT,
        titre: 'Améliorer la qualité des données',
        description: 'Compléter les informations manquantes pour optimiser le scoring',
        beneficeAttendu: 'Meilleur suivi et réduction des risques',
        faciliteImplementation: 'FACILE',
        impactEstime: 'MOYEN'
      });
    }

    if (!tiers.parametresRelance?.relanceAutomatique) {
      suggestions.push({
        type: TypeSuggestionTiers.AUTOMATISATION,
        titre: 'Activer les relances automatiques',
        description: 'Automatiser le processus de relance pour ce tiers',
        beneficeAttendu: 'Réduction des délais de paiement',
        faciliteImplementation: 'FACILE',
        impactEstime: 'FORT'
      });
    }

    return suggestions;
  }

  private calculerStatistiquesTiers(tiers: Tiers): StatistiquesTiers {
    // Calculs simulés basés sur l'historique
    const historique = tiers.historiquePaiements || [];
    
    return {
      chiffreAffairesTotal: historique.reduce((sum, p) => sum + p.montantFacture, 0),
      chiffreAffairesAnnuel: historique
        .filter(p => p.dateFacture.getFullYear() === new Date().getFullYear())
        .reduce((sum, p) => sum + p.montantFacture, 0),
      nombreFactures: historique.length,
      panierMoyen: historique.length > 0 
        ? historique.reduce((sum, p) => sum + p.montantFacture, 0) / historique.length 
        : 0,
      delaiMoyenPaiement: historique
        .filter(p => p.delaiPaiement)
        .reduce((sum, p) => sum + (p.delaiPaiement || 0), 0) / Math.max(1, historique.filter(p => p.delaiPaiement).length),
      tauxRetard: historique.length > 0 
        ? (historique.filter(p => p.retard && p.retard > 0).length / historique.length) * 100 
        : 0,
      montantEnCours: historique
        .filter(p => p.statut === StatutPaiement.EN_ATTENTE || p.statut === StatutPaiement.EN_RETARD)
        .reduce((sum, p) => sum + (p.montantFacture - p.montantPaye), 0),
      montantEchu: historique
        .filter(p => p.statut === StatutPaiement.EN_RETARD || p.statut === StatutPaiement.IMPAYE)
        .reduce((sum, p) => sum + (p.montantFacture - p.montantPaye), 0),
      derniereTransaction: historique.length > 0 
        ? new Date(Math.max(...historique.map(p => p.dateFacture.getTime())))
        : tiers.dateCreation,
      frequenceCommandes: historique.length,
      evolutionCA: Math.random() * 40 - 10, // Simulé
      evolutionVolume: Math.random() * 30 - 5, // Simulé
      tendance: 'STABILITE',
      dateCalcul: new Date(),
      periodeAnalyse: 'Derniers 12 mois'
    };
  }

  private doitRecalculerScoring(modifications: Partial<Tiers>): boolean {
    const champsImpactants = ['delaiPaiement', 'plafondCredit', 'statut', 'parametresRelance'];
    return champsImpactants.some(champ => champ in modifications);
  }

  private finaliserModification(tiersActuels: Tiers[], index: number, tiersModifie: Tiers, observer: any): void {
    const nouveauxTiers = [...tiersActuels];
    nouveauxTiers[index] = tiersModifie;
    
    this.tiersSubject.next(nouveauxTiers);
    this.mettreAJourStatistiquesGlobales(nouveauxTiers);
    
    observer.next(tiersModifie);
    observer.complete();
  }

  private mettreAJourStatistiquesGlobales(tiers: Tiers[]): void {
    const stats = {
      nombreTotal: tiers.length,
      nombreClients: tiers.filter(t => t.typeTiers === TypeTiers.CLIENT).length,
      nombreFournisseurs: tiers.filter(t => t.typeTiers === TypeTiers.FOURNISSEUR).length,
      nombreProspects: tiers.filter(t => t.typeTiers === TypeTiers.PROSPECT).length,
      tiersArisque: tiers.filter(t => 
        t.scoring?.classeRisque === ClasseRisque.RISQUE || 
        t.scoring?.classeRisque === ClasseRisque.TRES_RISQUE
      ).length,
      scoreGlobalMoyen: tiers.reduce((sum, t) => sum + (t.scoring?.scoreGlobal || 0), 0) / Math.max(1, tiers.length),
      derniereMiseAJour: new Date()
    };

    this.statistiquesGlobalesSubject.next(stats);
  }

  private initialiserDonneesDemo(): void {
    // Initialisation avec des données de démonstration
    setTimeout(() => {
      const tiersDemo = this.creerTiersDemo();
      this.tiersSubject.next(tiersDemo);
      this.mettreAJourStatistiquesGlobales(tiersDemo);
    }, 1000);
  }

  private creerTiersDemo(): Tiers[] {
    // Génération de tiers de démonstration avec données réalistes
    return [
      {
        id: 'tiers_demo_1',
        code: 'C001',
        raisonSociale: 'SARL KOUASSI DISTRIBUTION',
        typeTiers: TypeTiers.CLIENT,
        categorieTiers: 'ENTREPRISE' as any,
        natureTiers: 'PERSONNE_MORALE' as any,
        pays: 'CI',
        ville: 'Abidjan',
        adresseComplete: 'Cocody, Rue des Jardins',
        telephone: '+225 27 22 44 55 66',
        email: 'contact@kouassi-distrib.ci',
        compteComptable: '411001',
        dateCreation: new Date(2022, 0, 15),
        derniereModification: new Date(),
        creePar: 'admin',
        statut: StatutTiers.ACTIF,
        contacts: [],
        documents: [],
        observations: []
      },
      {
        id: 'tiers_demo_2',
        code: 'F001',
        raisonSociale: 'FOURNISSEUR GENERAL SARL',
        typeTiers: TypeTiers.FOURNISSEUR,
        categorieTiers: 'ENTREPRISE' as any,
        natureTiers: 'PERSONNE_MORALE' as any,
        pays: 'CI',
        ville: 'Abidjan',
        adresseComplete: 'Zone Industrielle de Yopougon',
        telephone: '+225 27 23 45 67 89',
        email: 'commandes@fournisseur-general.ci',
        compteComptable: '401001',
        dateCreation: new Date(2021, 5, 10),
        derniereModification: new Date(),
        creePar: 'admin',
        statut: StatutTiers.ACTIF,
        contacts: [],
        documents: [],
        observations: []
      }
    ];
  }
}