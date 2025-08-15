import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError, combineLatest } from 'rxjs';
import { map, delay, switchMap, filter, catchError } from 'rxjs/operators';
import { 
  EcritureComptable,
  LigneEcriture,
  JournalComptable,
  TemplateEcriture,
  ValidationEcritureIA,
  DocumentJoint,
  StatistiquesSaisie,
  TypeEcriture,
  StatutEcriture,
  OrigineEcriture,
  TypeJournal,
  TypeControleEcriture,
  ResultatControle,
  TypeAnomalieEcriture,
  GraviteAnomalie,
  NiveauRisque,
  CategorieComptable,
  JOURNAUX_SYSCOHADA_DEFAUT,
  TEMPLATES_ECRITURES_DEFAUT,
  CONTROLES_DEFAUT,
  FORMATS_NUMEROTATION
} from '../models/ecriture.model';

@Injectable({
  providedIn: 'root'
})
export class EcritureService {

  private ecrituresSubject = new BehaviorSubject<EcritureComptable[]>([]);
  private journauxSubject = new BehaviorSubject<JournalComptable[]>([]);
  private templatesSubject = new BehaviorSubject<TemplateEcriture[]>([]);
  private statistiquesSubject = new BehaviorSubject<StatistiquesSaisie | null>(null);

  ecritures$ = this.ecrituresSubject.asObservable();
  journaux$ = this.journauxSubject.asObservable();
  templates$ = this.templatesSubject.asObservable();
  statistiques$ = this.statistiquesSubject.asObservable();

  private compteur = 1;
  private exerciceComptable = '2024';

  constructor() { 
    this.initialiserDonneesDemo();
  }

  // ==================== GESTION ÉCRITURES ====================

  // Créer une nouvelle écriture
  creerEcriture(ecriture: Partial<EcritureComptable>): Observable<EcritureComptable> {
    return new Observable(observer => {
      setTimeout(() => {
        const nouvelleEcriture: EcritureComptable = {
          id: `ecriture_${Date.now()}`,
          numero: this.genererNumeroEcriture(ecriture.journal!),
          date: ecriture.date || new Date(),
          dateEcheance: ecriture.dateEcheance,
          dateValeur: ecriture.dateValeur,
          journal: ecriture.journal!,
          typeEcriture: ecriture.typeEcriture || TypeEcriture.STANDARD,
          origineEcriture: ecriture.origineEcriture || OrigineEcriture.SAISIE_MANUELLE,
          libelle: ecriture.libelle || '',
          reference: ecriture.reference,
          numeropiece: ecriture.numeropiece,
          exerciceComptable: this.exerciceComptable,
          periode: this.formatPeriode(ecriture.date || new Date()),
          lignes: ecriture.lignes || [],
          totalDebit: 0,
          totalCredit: 0,
          equilibree: false,
          documentsJoints: ecriture.documentsJoints || [],
          statut: StatutEcriture.BROUILLON,
          conformiteSYSCOHADA: false,
          categorieComptable: this.determinerCategorieComptable(ecriture.lignes || []),
          provisoire: ecriture.provisoire || false,
          simulation: ecriture.simulation || false,
          lettrable: ecriture.lettrable || false,
          extourne: false,
          creePar: 'admin',
          dateCreation: new Date(),
          observations: []
        };

        // Calcul des totaux
        this.calculerTotaux(nouvelleEcriture);

        // Validation IA automatique
        this.validerEcritureAvecIA(nouvelleEcriture).subscribe(validation => {
          nouvelleEcriture.validationIA = validation;
          
          const ecrituresActuelles = this.ecrituresSubject.value;
          const nouvellesEcritures = [...ecrituresActuelles, nouvelleEcriture];
          
          this.ecrituresSubject.next(nouvellesEcritures);
          this.mettreAJourStatistiques(nouvellesEcritures);
          
          observer.next(nouvelleEcriture);
          observer.complete();
        });
      }, 800);
    });
  }

  // Modifier une écriture
  modifierEcriture(ecritureId: string, modifications: Partial<EcritureComptable>): Observable<EcritureComptable> {
    return new Observable(observer => {
      setTimeout(() => {
        const ecrituresActuelles = this.ecrituresSubject.value;
        const index = ecrituresActuelles.findIndex(e => e.id === ecritureId);
        
        if (index === -1) {
          observer.error('Écriture non trouvée');
          return;
        }

        const ecritureModifiee = {
          ...ecrituresActuelles[index],
          ...modifications,
          derniereModification: new Date(),
          modifiePar: 'admin'
        };

        // Recalcul des totaux si les lignes ont changé
        if (modifications.lignes) {
          this.calculerTotaux(ecritureModifiee);
        }

        // Re-validation IA
        this.validerEcritureAvecIA(ecritureModifiee).subscribe(validation => {
          ecritureModifiee.validationIA = validation;
          
          const nouvellesEcritures = [...ecrituresActuelles];
          nouvellesEcritures[index] = ecritureModifiee;
          
          this.ecrituresSubject.next(nouvellesEcritures);
          this.mettreAJourStatistiques(nouvellesEcritures);
          
          observer.next(ecritureModifiee);
          observer.complete();
        });
      }, 500);
    });
  }

  // Supprimer une écriture
  supprimerEcriture(ecritureId: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const ecrituresActuelles = this.ecrituresSubject.value;
        const ecriture = ecrituresActuelles.find(e => e.id === ecritureId);
        
        if (!ecriture) {
          observer.error('Écriture non trouvée');
          return;
        }

        // Vérifications avant suppression
        if (ecriture.statut === StatutEcriture.COMPTABILISEE) {
          observer.error('Impossible de supprimer une écriture comptabilisée');
          return;
        }

        const nouvellesEcritures = ecrituresActuelles.filter(e => e.id !== ecritureId);
        
        this.ecrituresSubject.next(nouvellesEcritures);
        this.mettreAJourStatistiques(nouvellesEcritures);
        
        observer.next(true);
        observer.complete();
      }, 300);
    });
  }

  // Valider une écriture
  validerEcriture(ecritureId: string): Observable<EcritureComptable> {
    return new Observable(observer => {
      setTimeout(() => {
        const ecrituresActuelles = this.ecrituresSubject.value;
        const index = ecrituresActuelles.findIndex(e => e.id === ecritureId);
        
        if (index === -1) {
          observer.error('Écriture non trouvée');
          return;
        }

        const ecriture = ecrituresActuelles[index];

        // Vérifications de validation
        if (!ecriture.equilibree) {
          observer.error('L\'écriture doit être équilibrée pour être validée');
          return;
        }

        if (ecriture.lignes.length === 0) {
          observer.error('L\'écriture doit contenir au moins une ligne');
          return;
        }

        // Mise à jour du statut
        ecriture.statut = StatutEcriture.VALIDEE;
        ecriture.validePar = 'admin';
        ecriture.dateValidation = new Date();

        const nouvellesEcritures = [...ecrituresActuelles];
        nouvellesEcritures[index] = ecriture;
        
        this.ecrituresSubject.next(nouvellesEcritures);
        
        observer.next(ecriture);
        observer.complete();
      }, 1000);
    });
  }

  // Comptabiliser une écriture
  comptabiliserEcriture(ecritureId: string): Observable<EcritureComptable> {
    return new Observable(observer => {
      setTimeout(() => {
        const ecrituresActuelles = this.ecrituresSubject.value;
        const index = ecrituresActuelles.findIndex(e => e.id === ecritureId);
        
        if (index === -1) {
          observer.error('Écriture non trouvée');
          return;
        }

        const ecriture = ecrituresActuelles[index];

        if (ecriture.statut !== StatutEcriture.VALIDEE) {
          observer.error('L\'écriture doit être validée avant comptabilisation');
          return;
        }

        // Mise à jour du statut
        ecriture.statut = StatutEcriture.COMPTABILISEE;

        const nouvellesEcritures = [...ecrituresActuelles];
        nouvellesEcritures[index] = ecriture;
        
        this.ecrituresSubject.next(nouvellesEcritures);
        this.mettreAJourStatistiques(nouvellesEcritures);
        
        observer.next(ecriture);
        observer.complete();
      }, 800);
    });
  }

  // ==================== LIGNES D'ÉCRITURE ====================

  // Ajouter une ligne à une écriture
  ajouterLigne(ecritureId: string, ligne: Partial<LigneEcriture>): Observable<LigneEcriture> {
    return new Observable(observer => {
      setTimeout(() => {
        const ecrituresActuelles = this.ecrituresSubject.value;
        const index = ecrituresActuelles.findIndex(e => e.id === ecritureId);
        
        if (index === -1) {
          observer.error('Écriture non trouvée');
          return;
        }

        const ecriture = ecrituresActuelles[index];
        
        if (ecriture.statut === StatutEcriture.COMPTABILISEE) {
          observer.error('Impossible de modifier une écriture comptabilisée');
          return;
        }

        const nouvelleLigne: LigneEcriture = {
          id: `ligne_${Date.now()}`,
          ecritureId: ecritureId,
          ordre: ecriture.lignes.length + 1,
          compteComptable: ligne.compteComptable || '',
          libelle: ligne.libelle || '',
          montantDebit: ligne.montantDebit || 0,
          montantCredit: ligne.montantCredit || 0,
          devise: ligne.devise || 'XOF',
          tiersId: ligne.tiersId,
          tiersNom: ligne.tiersNom,
          reference: ligne.reference,
          dateEcheance: ligne.dateEcheance,
          bloquee: false,
          provisoire: ligne.provisoire || false,
          dateCreation: new Date(),
          creePar: 'admin'
        };

        ecriture.lignes.push(nouvelleLigne);
        this.calculerTotaux(ecriture);

        // Re-validation
        this.validerEcritureAvecIA(ecriture).subscribe(validation => {
          ecriture.validationIA = validation;
          
          const nouvellesEcritures = [...ecrituresActuelles];
          nouvellesEcritures[index] = ecriture;
          
          this.ecrituresSubject.next(nouvellesEcritures);
          
          observer.next(nouvelleLigne);
          observer.complete();
        });
      }, 300);
    });
  }

  // Modifier une ligne d'écriture
  modifierLigne(ecritureId: string, ligneId: string, modifications: Partial<LigneEcriture>): Observable<LigneEcriture> {
    return new Observable(observer => {
      setTimeout(() => {
        const ecrituresActuelles = this.ecrituresSubject.value;
        const indexEcriture = ecrituresActuelles.findIndex(e => e.id === ecritureId);
        
        if (indexEcriture === -1) {
          observer.error('Écriture non trouvée');
          return;
        }

        const ecriture = ecrituresActuelles[indexEcriture];
        const indexLigne = ecriture.lignes.findIndex(l => l.id === ligneId);
        
        if (indexLigne === -1) {
          observer.error('Ligne non trouvée');
          return;
        }

        const ligneModifiee = {
          ...ecriture.lignes[indexLigne],
          ...modifications
        };

        ecriture.lignes[indexLigne] = ligneModifiee;
        this.calculerTotaux(ecriture);

        // Re-validation
        this.validerEcritureAvecIA(ecriture).subscribe(validation => {
          ecriture.validationIA = validation;
          
          const nouvellesEcritures = [...ecrituresActuelles];
          nouvellesEcritures[indexEcriture] = ecriture;
          
          this.ecrituresSubject.next(nouvellesEcritures);
          
          observer.next(ligneModifiee);
          observer.complete();
        });
      }, 300);
    });
  }

  // Supprimer une ligne d'écriture
  supprimerLigne(ecritureId: string, ligneId: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const ecrituresActuelles = this.ecrituresSubject.value;
        const indexEcriture = ecrituresActuelles.findIndex(e => e.id === ecritureId);
        
        if (indexEcriture === -1) {
          observer.error('Écriture non trouvée');
          return;
        }

        const ecriture = ecrituresActuelles[indexEcriture];
        ecriture.lignes = ecriture.lignes.filter(l => l.id !== ligneId);
        
        // Réorganiser les ordres
        ecriture.lignes.forEach((ligne, index) => {
          ligne.ordre = index + 1;
        });

        this.calculerTotaux(ecriture);

        const nouvellesEcritures = [...ecrituresActuelles];
        nouvellesEcritures[indexEcriture] = ecriture;
        
        this.ecrituresSubject.next(nouvellesEcritures);
        
        observer.next(true);
        observer.complete();
      }, 200);
    });
  }

  // ==================== TEMPLATES ====================

  // Créer écriture depuis template
  creerDepuisTemplate(templateId: string, variables: any = {}): Observable<EcritureComptable> {
    return new Observable(observer => {
      setTimeout(() => {
        const templates = this.templatesSubject.value;
        const template = templates.find(t => t.id === templateId);
        
        if (!template) {
          observer.error('Template non trouvé');
          return;
        }

        // Construction de l'écriture depuis le template
        const ecritureTemplate: Partial<EcritureComptable> = {
          libelle: this.appliquerVariables(template.modele.libelle, variables),
          typeEcriture: template.typeEcriture,
          origineEcriture: OrigineEcriture.TEMPLATE,
          journal: this.journauxSubject.value.find(j => j.code === template.journal)!,
          lignes: template.modele.lignesModeles.map((ligneModele, index) => {
            const ligne: Partial<LigneEcriture> = {
              ordre: index + 1,
              compteComptable: ligneModele.compteComptable,
              libelle: this.appliquerVariables(ligneModele.libelle, variables),
              montantDebit: ligneModele.sensComptable === 'DEBIT' ? 
                (ligneModele.montantFixe || this.calculerMontantFormule(ligneModele.montantFormule, variables) || 0) : 0,
              montantCredit: ligneModele.sensComptable === 'CREDIT' ? 
                (ligneModele.montantFixe || this.calculerMontantFormule(ligneModele.montantFormule, variables) || 0) : 0,
              devise: 'XOF'
            };
            return ligne as LigneEcriture;
          })
        };

        // Mise à jour des statistiques d'usage du template
        template.nombreUtilisations++;
        template.derniereUtilisation = new Date();

        // Créer l'écriture
        this.creerEcriture(ecritureTemplate).subscribe({
          next: (ecriture) => {
            observer.next(ecriture);
            observer.complete();
          },
          error: (erreur) => observer.error(erreur)
        });
      }, 500);
    });
  }

  // Sauvegarder comme template
  sauvegarderCommeTemplate(ecritureId: string, nomTemplate: string, description: string): Observable<TemplateEcriture> {
    return new Observable(observer => {
      setTimeout(() => {
        const ecrituresActuelles = this.ecrituresSubject.value;
        const ecriture = ecrituresActuelles.find(e => e.id === ecritureId);
        
        if (!ecriture) {
          observer.error('Écriture non trouvée');
          return;
        }

        const nouveauTemplate: TemplateEcriture = {
          id: `template_${Date.now()}`,
          nom: nomTemplate,
          description: description,
          typeEcriture: ecriture.typeEcriture,
          journal: ecriture.journal.code,
          modele: {
            libelle: ecriture.libelle,
            lignesModeles: ecriture.lignes.map(ligne => ({
              ordre: ligne.ordre,
              compteComptable: ligne.compteComptable,
              libelle: ligne.libelle,
              sensComptable: ligne.montantDebit > 0 ? 'DEBIT' : 'CREDIT',
              montantFixe: ligne.montantDebit > 0 ? ligne.montantDebit : ligne.montantCredit,
              obligatoire: true,
              modifiable: true,
              tiersRequis: !!ligne.tiersId
            }))
          },
          utilisationFrequente: false,
          partage: false,
          creePar: 'admin',
          dateCreation: new Date(),
          nombreUtilisations: 0,
          favoris: false
        };

        const templatesActuels = this.templatesSubject.value;
        const nouveauxTemplates = [...templatesActuels, nouveauTemplate];
        
        this.templatesSubject.next(nouveauxTemplates);
        
        observer.next(nouveauTemplate);
        observer.complete();
      }, 400);
    });
  }

  // ==================== VALIDATION IA ====================

  // Valider écriture avec IA
  validerEcritureAvecIA(ecriture: EcritureComptable): Observable<ValidationEcritureIA> {
    return new Observable(observer => {
      setTimeout(() => {
        const startTime = Date.now();
        const controles = [];
        const anomalies = [];
        const suggestions = [];
        let score = 0;

        // Contrôle 1: Équilibre
        const equilibre = Math.abs(ecriture.totalDebit - ecriture.totalCredit) < 0.01;
        if (equilibre) {
          controles.push({
            type: TypeControleEcriture.EQUILIBRE,
            resultat: ResultatControle.CONFORME,
            message: 'Écriture équilibrée',
            priorite: 'CRITIQUE' as const
          });
          score += 25;
        } else {
          controles.push({
            type: TypeControleEcriture.EQUILIBRE,
            resultat: ResultatControle.BLOQUANT,
            message: `Déséquilibre de ${Math.abs(ecriture.totalDebit - ecriture.totalCredit).toFixed(2)} XOF`,
            priorite: 'CRITIQUE' as const,
            actionCorrectrice: 'Ajuster les montants pour équilibrer l\'écriture'
          });
          anomalies.push({
            type: TypeAnomalieEcriture.DESEQUILIBRE,
            gravite: GraviteAnomalie.BLOQUANTE,
            description: 'L\'écriture n\'est pas équilibrée',
            lignesConcernees: [],
            valeurDetectee: Math.abs(ecriture.totalDebit - ecriture.totalCredit),
            valeurAttendue: 0,
            impactFinancier: Math.abs(ecriture.totalDebit - ecriture.totalCredit),
            solutionSuggeree: 'Vérifier et corriger les montants',
            dateDetection: new Date()
          });
        }

        // Contrôle 2: Existence des comptes
        const comptesInexistants = this.verifierExistenceComptes(ecriture.lignes);
        if (comptesInexistants.length === 0) {
          controles.push({
            type: TypeControleEcriture.COMPTES_EXISTANTS,
            resultat: ResultatControle.CONFORME,
            message: 'Tous les comptes existent',
            priorite: 'HAUTE' as const
          });
          score += 20;
        } else {
          controles.push({
            type: TypeControleEcriture.COMPTES_EXISTANTS,
            resultat: ResultatControle.NON_CONFORME,
            message: `${comptesInexistants.length} compte(s) inexistant(s)`,
            priorite: 'HAUTE' as const
          });
          comptesInexistants.forEach(compte => {
            anomalies.push({
              type: TypeAnomalieEcriture.COMPTE_INEXISTANT,
              gravite: GraviteAnomalie.MAJEURE,
              description: `Le compte ${compte} n'existe pas`,
              lignesConcernees: [],
              valeurDetectee: compte,
              solutionSuggeree: 'Créer le compte ou utiliser un compte existant',
              dateDetection: new Date()
            });
          });
        }

        // Contrôle 3: Cohérence des dates
        const datesCoherentes = this.verifierCoherenceDates(ecriture);
        if (datesCoherentes) {
          controles.push({
            type: TypeControleEcriture.DATES_COHERENTES,
            resultat: ResultatControle.CONFORME,
            message: 'Dates cohérentes',
            priorite: 'MOYENNE' as const
          });
          score += 15;
        } else {
          controles.push({
            type: TypeControleEcriture.DATES_COHERENTES,
            resultat: ResultatControle.ATTENTION,
            message: 'Vérifiez la cohérence des dates',
            priorite: 'MOYENNE' as const
          });
          score += 5;
        }

        // Contrôle 4: Montants positifs
        const montantsNegatifs = ecriture.lignes.filter(l => l.montantDebit < 0 || l.montantCredit < 0);
        if (montantsNegatifs.length === 0) {
          controles.push({
            type: TypeControleEcriture.MONTANTS_POSITIFS,
            resultat: ResultatControle.CONFORME,
            message: 'Tous les montants sont positifs',
            priorite: 'HAUTE' as const
          });
          score += 15;
        } else {
          controles.push({
            type: TypeControleEcriture.MONTANTS_POSITIFS,
            resultat: ResultatControle.NON_CONFORME,
            message: `${montantsNegatifs.length} montant(s) négatif(s)`,
            priorite: 'HAUTE' as const
          });
        }

        // Contrôle 5: Conformité SYSCOHADA
        const conformiteSYSCOHADA = this.verifierConformiteSYSCOHADA(ecriture);
        if (conformiteSYSCOHADA) {
          controles.push({
            type: TypeControleEcriture.CONFORMITE_SYSCOHADA,
            resultat: ResultatControle.CONFORME,
            message: 'Conforme SYSCOHADA AUDCIF',
            priorite: 'HAUTE' as const
          });
          score += 20;
          ecriture.conformiteSYSCOHADA = true;
        } else {
          controles.push({
            type: TypeControleEcriture.CONFORMITE_SYSCOHADA,
            resultat: ResultatControle.ATTENTION,
            message: 'Conformité SYSCOHADA à vérifier',
            priorite: 'HAUTE' as const
          });
          score += 10;
        }

        // Génération des suggestions
        suggestions.push(...this.genererSuggestionsAmelioration(ecriture, score));

        // Score final
        score = Math.min(100, score + 5); // Bonus de base

        // Détermination du niveau de risque
        const niveauRisque = this.determinerNiveauRisque(score, anomalies.length);

        const validation: ValidationEcritureIA = {
          score,
          controles,
          anomalies,
          suggestions,
          conformiteSYSCOHADA: ecriture.conformiteSYSCOHADA,
          niveauRisque,
          dateValidation: new Date(),
          tempsValidation: Date.now() - startTime
        };

        observer.next(validation);
        observer.complete();
      }, 600);
    });
  }

  // ==================== RECHERCHE ET FILTRAGE ====================

  // Rechercher des écritures
  rechercherEcritures(criteres: {
    query?: string;
    journal?: string;
    statut?: StatutEcriture;
    dateDebut?: Date;
    dateFin?: Date;
    montantMin?: number;
    montantMax?: number;
    reference?: string;
  }): Observable<EcritureComptable[]> {
    return this.ecritures$.pipe(
      map(ecritures => {
        let resultats = [...ecritures];

        if (criteres.query) {
          const query = criteres.query.toLowerCase();
          resultats = resultats.filter(e => 
            e.libelle.toLowerCase().includes(query) ||
            e.numero.toLowerCase().includes(query) ||
            e.reference?.toLowerCase().includes(query) ||
            e.lignes.some(l => l.libelle.toLowerCase().includes(query))
          );
        }

        if (criteres.journal) {
          resultats = resultats.filter(e => e.journal.code === criteres.journal);
        }

        if (criteres.statut) {
          resultats = resultats.filter(e => e.statut === criteres.statut);
        }

        if (criteres.dateDebut) {
          resultats = resultats.filter(e => e.date >= criteres.dateDebut!);
        }

        if (criteres.dateFin) {
          resultats = resultats.filter(e => e.date <= criteres.dateFin!);
        }

        if (criteres.montantMin !== undefined) {
          resultats = resultats.filter(e => e.totalDebit >= criteres.montantMin!);
        }

        if (criteres.montantMax !== undefined) {
          resultats = resultats.filter(e => e.totalDebit <= criteres.montantMax!);
        }

        if (criteres.reference) {
          resultats = resultats.filter(e => 
            e.reference?.toLowerCase().includes(criteres.reference!.toLowerCase())
          );
        }

        return resultats.sort((a, b) => b.date.getTime() - a.date.getTime());
      })
    );
  }

  // ==================== STATISTIQUES ====================

  // Obtenir statistiques de saisie
  getStatistiquesSaisie(periode?: string): Observable<StatistiquesSaisie> {
    return new Observable(observer => {
      setTimeout(() => {
        const ecritures = this.ecrituresSubject.value;
        const maintenant = new Date();
        const periodeAnalyse = periode || `${maintenant.getFullYear()}-${(maintenant.getMonth() + 1).toString().padStart(2, '0')}`;

        const ecrituresPeriode = ecritures.filter(e => 
          this.formatPeriode(e.date) === periodeAnalyse
        );

        const stats: StatistiquesSaisie = {
          periodeAnalyse,
          nombreEcritures: ecrituresPeriode.length,
          nombreLignes: ecrituresPeriode.reduce((sum, e) => sum + e.lignes.length, 0),
          montantTotalDebits: ecrituresPeriode.reduce((sum, e) => sum + e.totalDebit, 0),
          montantTotalCredits: ecrituresPeriode.reduce((sum, e) => sum + e.totalCredit, 0),
          repartitionParJournal: this.calculerRepartitionJournaux(ecrituresPeriode),
          repartitionParType: this.calculerRepartitionTypes(ecrituresPeriode),
          tempsRedactionMoyen: 5.2, // Simulé en minutes
          tauxErreurs: this.calculerTauxErreurs(ecrituresPeriode),
          performanceOperateur: this.calculerPerformanceOperateurs(ecrituresPeriode),
          tendances: this.calculerTendances(ecritures, periodeAnalyse)
        };

        this.statistiquesSubject.next(stats);
        observer.next(stats);
        observer.complete();
      }, 300);
    });
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private genererNumeroEcriture(journal: JournalComptable): string {
    const format = FORMATS_NUMEROTATION.AUTOMATIQUE;
    const maintenant = new Date();
    
    return format
      .replace('{JOURNAL}', journal.code)
      .replace('{YYYY}', maintenant.getFullYear().toString())
      .replace('{MM}', (maintenant.getMonth() + 1).toString().padStart(2, '0'))
      .replace('{DD}', maintenant.getDate().toString().padStart(2, '0'))
      .replace('{######}', this.compteur.toString().padStart(6, '0'))
      .replace('{###}', (this.compteur++).toString().padStart(3, '0'));
  }

  private formatPeriode(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  private calculerTotaux(ecriture: EcritureComptable): void {
    ecriture.totalDebit = ecriture.lignes.reduce((sum, ligne) => sum + ligne.montantDebit, 0);
    ecriture.totalCredit = ecriture.lignes.reduce((sum, ligne) => sum + ligne.montantCredit, 0);
    ecriture.equilibree = Math.abs(ecriture.totalDebit - ecriture.totalCredit) < 0.01;
  }

  private determinerCategorieComptable(lignes: LigneEcriture[]): CategorieComptable {
    if (lignes.length === 0) return CategorieComptable.CHARGES;
    
    const premierCompte = lignes[0].compteComptable;
    const classeCompte = premierCompte.charAt(0);
    
    switch (classeCompte) {
      case '1': return CategorieComptable.IMMOBILISATIONS;
      case '2': return CategorieComptable.IMMOBILISATIONS;
      case '3': return CategorieComptable.STOCKS;
      case '4': 
        if (premierCompte.startsWith('41')) return CategorieComptable.CREANCES;
        if (premierCompte.startsWith('40')) return CategorieComptable.DETTES;
        return CategorieComptable.DETTES;
      case '5': return CategorieComptable.TRESORERIE;
      case '6': return CategorieComptable.CHARGES;
      case '7': return CategorieComptable.PRODUITS;
      default: return CategorieComptable.CHARGES;
    }
  }

  private verifierExistenceComptes(lignes: LigneEcriture[]): string[] {
    // Simulation - dans un vrai système, on vérifierait contre le plan comptable
    const comptesInexistants = [];
    const comptesConnus = ['521', '411', '401', '601', '701', '445', '443', '661', '664', '421', '431'];
    
    for (const ligne of lignes) {
      if (!comptesConnus.includes(ligne.compteComptable) && ligne.compteComptable.length > 0) {
        if (!comptesInexistants.includes(ligne.compteComptable)) {
          comptesInexistants.push(ligne.compteComptable);
        }
      }
    }
    
    return comptesInexistants;
  }

  private verifierCoherenceDates(ecriture: EcritureComptable): boolean {
    const maintenant = new Date();
    const unAnAvant = new Date(maintenant.getFullYear() - 1, maintenant.getMonth(), maintenant.getDate());
    
    // Vérifier que la date n'est pas trop ancienne ou future
    if (ecriture.date < unAnAvant || ecriture.date > maintenant) {
      return false;
    }
    
    // Vérifier cohérence date d'échéance
    if (ecriture.dateEcheance && ecriture.dateEcheance < ecriture.date) {
      return false;
    }
    
    return true;
  }

  private verifierConformiteSYSCOHADA(ecriture: EcritureComptable): boolean {
    // Vérifications SYSCOHADA simplifiées
    
    // 1. Libellé requis
    if (!ecriture.libelle || ecriture.libelle.trim().length < 3) {
      return false;
    }
    
    // 2. Au moins 2 lignes
    if (ecriture.lignes.length < 2) {
      return false;
    }
    
    // 3. Comptes doivent respecter la numérotation SYSCOHADA
    for (const ligne of ecriture.lignes) {
      if (!/^[1-7]\d*$/.test(ligne.compteComptable)) {
        return false;
      }
    }
    
    // 4. Équilibre obligatoire
    if (!ecriture.equilibree) {
      return false;
    }
    
    return true;
  }

  private determinerNiveauRisque(score: number, nombreAnomalies: number): NiveauRisque {
    if (score >= 90 && nombreAnomalies === 0) return NiveauRisque.TRES_FAIBLE;
    if (score >= 80 && nombreAnomalies <= 1) return NiveauRisque.FAIBLE;
    if (score >= 60 && nombreAnomalies <= 3) return NiveauRisque.MOYEN;
    if (score >= 40 && nombreAnomalies <= 5) return NiveauRisque.ELEVE;
    return NiveauRisque.TRES_ELEVE;
  }

  private genererSuggestionsAmelioration(ecriture: EcritureComptable, score: number): any[] {
    const suggestions = [];
    
    if (score < 80) {
      suggestions.push({
        type: 'OPTIMISATION_SAISIE',
        titre: 'Améliorer la qualité de saisie',
        description: 'Compléter les informations manquantes pour optimiser la validation',
        beneficeAttendu: 'Réduction du temps de validation et des erreurs',
        faciliteImplementation: 'FACILE',
        impactEstime: 'MOYEN'
      });
    }
    
    if (ecriture.lignes.length >= 3 && !ecriture.reference) {
      suggestions.push({
        type: 'TEMPLATE_PERSONALISE',
        titre: 'Créer un template',
        description: 'Cette écriture pourrait être transformée en template réutilisable',
        beneficeAttendu: 'Gain de temps pour les saisies similaires',
        faciliteImplementation: 'TRES_FACILE',
        impactEstime: 'FORT'
      });
    }
    
    return suggestions;
  }

  private appliquerVariables(texte: string, variables: any): string {
    let resultat = texte;
    for (const [cle, valeur] of Object.entries(variables)) {
      resultat = resultat.replace(new RegExp(`{${cle}}`, 'g'), String(valeur));
    }
    return resultat;
  }

  private calculerMontantFormule(formule: string | undefined, variables: any): number {
    if (!formule) return 0;
    
    // Simulation simple de calcul de formule
    let resultat = formule;
    for (const [cle, valeur] of Object.entries(variables)) {
      resultat = resultat.replace(new RegExp(`{${cle}}`, 'g'), String(valeur));
    }
    
    try {
      // Dans un vrai système, utiliser un parser sécurisé
      return eval(resultat);
    } catch {
      return 0;
    }
  }

  private calculerRepartitionJournaux(ecritures: EcritureComptable[]): any[] {
    const repartition = new Map();
    const total = ecritures.reduce((sum, e) => sum + e.totalDebit, 0);
    
    ecritures.forEach(ecriture => {
      const journal = ecriture.journal.code;
      if (!repartition.has(journal)) {
        repartition.set(journal, { nombreEcritures: 0, montantTotal: 0 });
      }
      const stats = repartition.get(journal);
      stats.nombreEcritures++;
      stats.montantTotal += ecriture.totalDebit;
    });
    
    return Array.from(repartition.entries()).map(([journal, stats]) => ({
      journal,
      nombreEcritures: stats.nombreEcritures,
      montantTotal: stats.montantTotal,
      pourcentage: total > 0 ? (stats.montantTotal / total) * 100 : 0
    }));
  }

  private calculerRepartitionTypes(ecritures: EcritureComptable[]): any[] {
    const repartition = new Map();
    
    ecritures.forEach(ecriture => {
      const type = ecriture.typeEcriture;
      if (!repartition.has(type)) {
        repartition.set(type, 0);
      }
      repartition.set(type, repartition.get(type) + 1);
    });
    
    return Array.from(repartition.entries()).map(([type, nombre]) => ({
      typeEcriture: type,
      nombreEcritures: nombre,
      pourcentage: ecritures.length > 0 ? (nombre / ecritures.length) * 100 : 0
    }));
  }

  private calculerTauxErreurs(ecritures: EcritureComptable[]): number {
    const ecrituresAvecErreurs = ecritures.filter(e => 
      e.validationIA && e.validationIA.anomalies.length > 0
    );
    
    return ecritures.length > 0 ? (ecrituresAvecErreurs.length / ecritures.length) * 100 : 0;
  }

  private calculerPerformanceOperateurs(ecritures: EcritureComptable[]): any[] {
    // Simulation pour un seul opérateur
    return [{
      operateur: 'admin',
      nombreEcritures: ecritures.length,
      tempsRedactionMoyen: 5.2,
      tauxErreurs: this.calculerTauxErreurs(ecritures),
      scoreQualite: 85
    }];
  }

  private calculerTendances(ecritures: EcritureComptable[], periodeActuelle: string): any[] {
    // Simulation des tendances
    return [
      { periode: periodeActuelle, nombreEcritures: ecritures.length, evolution: 12, tendance: 'HAUSSE' }
    ];
  }

  private mettreAJourStatistiques(ecritures: EcritureComptable[]): void {
    this.getStatistiquesSaisie().subscribe();
  }

  private initialiserDonneesDemo(): void {
    // Initialisation des journaux
    const journaux: JournalComptable[] = JOURNAUX_SYSCOHADA_DEFAUT.map((j, index) => ({
      id: `journal_${index}`,
      code: j.code,
      libelle: j.libelle,
      type: j.type,
      couleur: j.couleur,
      nature: j.nature,
      actif: true
    }));
    this.journauxSubject.next(journaux);

    // Initialisation des templates
    const templates: TemplateEcriture[] = TEMPLATES_ECRITURES_DEFAUT.map((t, index) => ({
      id: `template_${index}`,
      nom: t.nom,
      description: `Template pour ${t.nom.toLowerCase()}`,
      typeEcriture: t.typeEcriture,
      journal: 'OD',
      modele: {
        libelle: t.nom,
        lignesModeles: t.lignes.map((ligne, idx) => ({
          ordre: idx + 1,
          compteComptable: ligne.compteComptable,
          libelle: ligne.libelle,
          sensComptable: ligne.sensComptable,
          obligatoire: true,
          modifiable: true,
          tiersRequis: ['411', '401'].includes(ligne.compteComptable)
        }))
      },
      utilisationFrequente: index < 3,
      partage: true,
      creePar: 'system',
      dateCreation: new Date(),
      nombreUtilisations: Math.floor(Math.random() * 50),
      favoris: index < 2
    }));
    this.templatesSubject.next(templates);

    // Création d'écritures de démonstration
    setTimeout(() => {
      this.creerEcrituresDemo(journaux);
    }, 1000);
  }

  private creerEcrituresDemo(journaux: JournalComptable[]): void {
    const ecrituresDemo = [
      {
        libelle: 'Achat fournitures bureau',
        journal: journaux.find(j => j.code === 'ACH')!,
        lignes: [
          { compteComptable: '601', libelle: 'Achats fournitures', montantDebit: 50000, montantCredit: 0, ordre: 1 },
          { compteComptable: '445', libelle: 'TVA récupérable', montantDebit: 9000, montantCredit: 0, ordre: 2 },
          { compteComptable: '401', libelle: 'Fournisseur ABC', montantDebit: 0, montantCredit: 59000, ordre: 3 }
        ]
      },
      {
        libelle: 'Vente marchandises',
        journal: journaux.find(j => j.code === 'VTE')!,
        lignes: [
          { compteComptable: '411', libelle: 'Client XYZ', montantDebit: 118000, montantCredit: 0, ordre: 1 },
          { compteComptable: '701', libelle: 'Ventes marchandises', montantDebit: 0, montantCredit: 100000, ordre: 2 },
          { compteComptable: '443', libelle: 'TVA collectée', montantDebit: 0, montantCredit: 18000, ordre: 3 }
        ]
      }
    ];

    ecrituresDemo.forEach((ecritureData, index) => {
      setTimeout(() => {
        const lignes: LigneEcriture[] = ecritureData.lignes.map(l => ({
          id: `ligne_demo_${index}_${l.ordre}`,
          ordre: l.ordre,
          compteComptable: l.compteComptable,
          libelle: l.libelle,
          montantDebit: l.montantDebit,
          montantCredit: l.montantCredit,
          devise: 'XOF',
          bloquee: false,
          provisoire: false,
          dateCreation: new Date(),
          creePar: 'system'
        }));

        this.creerEcriture({
          libelle: ecritureData.libelle,
          journal: ecritureData.journal,
          lignes: lignes
        }).subscribe();
      }, index * 500);
    });
  }
}