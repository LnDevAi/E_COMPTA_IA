import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, delay, switchMap } from 'rxjs/operators';
import { 
  CompteComptable, 
  PlanComptable,
  ValidationCompteIA,
  ControleCompteIA,
  SuggestionCompte,
  AnomalieCompte,
  ImportPlanComptable,
  StatistiquesPlan,
  ClasseComptable,
  TypeCompte,
  NatureSolde,
  CategorieAUDCIF,
  StatutCompte,
  StatutPlanComptable,
  FormatImport,
  StatutImport,
  TypeControle,
  TypeSuggestion,
  TypeAnomalie,
  PLAN_COMPTABLE_SYSCOHADA_BASE,
  REGLES_VALIDATION_SYSCOHADA,
  ParametresValidation,
  RegleAutomatisation
} from '../models/plan-comptable.model';

@Injectable({
  providedIn: 'root'
})
export class PlanComptableService {

  private planComptableSubject = new BehaviorSubject<PlanComptable | null>(null);
  private comptesSubject = new BehaviorSubject<CompteComptable[]>([]);
  private statistiquesSubject = new BehaviorSubject<StatistiquesPlan | null>(null);

  planComptable$ = this.planComptableSubject.asObservable();
  comptes$ = this.comptesSubject.asObservable();
  statistiques$ = this.statistiquesSubject.asObservable();

  constructor() { 
    this.initialiserPlanComptableDemo();
  }

  // ==================== GESTION PLAN COMPTABLE ====================

  // Créer un nouveau plan comptable
  creerPlanComptable(entrepriseId: string, systemeComptable: string, paysCode: string): Observable<PlanComptable> {
    return new Observable(observer => {
      setTimeout(() => {
        const planComptable: PlanComptable = {
          id: `plan_${Date.now()}`,
          nom: `Plan Comptable ${systemeComptable}`,
          version: '2024.1',
          dateApplication: new Date(),
          entrepriseId,
          systemeComptable,
          paysCode,
          exerciceComptable: '2024',
          comptes: [],
          nombreComptes: 0,
          nombreComptesCrees: 0,
          nombreComptesUtilises: 0,
          statut: StatutPlanComptable.EN_CREATION,
          pourcentageCompletion: 0,
          parametresValidation: this.getParametresValidationParDefaut(),
          reglesAutomatisation: [],
          dateCreation: new Date(),
          derniereModification: new Date(),
          creePar: 'admin',
          statistiques: this.calculerStatistiquesVides()
        };

        this.planComptableSubject.next(planComptable);
        observer.next(planComptable);
        observer.complete();
      }, 800);
    });
  }

  // Initialiser avec plan SYSCOHADA de base
  initialiserAvecPlanSYSCOHADA(planComptableId: string): Observable<{ comptesImportes: number; erreurs: string[] }> {
    return new Observable(observer => {
      setTimeout(() => {
        const comptesBase = PLAN_COMPTABLE_SYSCOHADA_BASE.map(compteBase => this.creerCompteDepuisBase(compteBase));
        
        this.comptesSubject.next(comptesBase);
        this.mettreAJourStatistiques(comptesBase);
        
        const planActuel = this.planComptableSubject.value;
        if (planActuel) {
          planActuel.comptes = comptesBase;
          planActuel.nombreComptes = comptesBase.length;
          planActuel.nombreComptesCrees = comptesBase.length;
          planActuel.pourcentageCompletion = 75; // Base SYSCOHADA = 75%
          planActuel.statut = StatutPlanComptable.EN_VALIDATION;
          planActuel.derniereModification = new Date();
          
          this.planComptableSubject.next(planActuel);
        }

        observer.next({
          comptesImportes: comptesBase.length,
          erreurs: []
        });
        observer.complete();
      }, 1500);
    });
  }

  // ==================== GESTION COMPTES ====================

  // Ajouter un compte
  ajouterCompte(compte: Partial<CompteComptable>): Observable<CompteComptable> {
    return new Observable(observer => {
      setTimeout(() => {
        const nouveauCompte: CompteComptable = {
          id: `compte_${Date.now()}`,
          numero: compte.numero || '',
          intitule: compte.intitule || '',
          description: compte.description,
          classe: compte.classe || ClasseComptable.CLASSE_1,
          typeCompte: compte.typeCompte || TypeCompte.BILAN,
          natureSolde: compte.natureSolde || NatureSolde.DEBITEUR,
          utilisationAnalytique: compte.utilisationAnalytique || false,
          lettrable: compte.lettrable || false,
          rapprochable: compte.rapprochable || false,
          saisieAutorisee: compte.saisieAutorisee !== false,
          ventilationObligatoire: compte.ventilationObligatoire || false,
          auxiliaireObligatoire: compte.auxiliaireObligatoire || false,
          pieceJustificativeObligatoire: compte.pieceJustificativeObligatoire || false,
          categorieAUDCIF: compte.categorieAUDCIF || CategorieAUDCIF.ACTIF_IMMOBILISE,
          ratiosAffectes: compte.ratiosAffectes || [],
          dateCreation: new Date(),
          derniereModification: new Date(),
          statut: StatutCompte.ACTIF,
          personnalise: true,
          soldeDebit: 0,
          soldeCredit: 0,
          mouvementDebit: 0,
          mouvementCredit: 0
        };

        // Validation IA automatique
        this.validerCompteAvecIA(nouveauCompte).subscribe(validation => {
          nouveauCompte.validationIA = validation;
          
          const comptesActuels = this.comptesSubject.value;
          const nouveauxComptes = [...comptesActuels, nouveauCompte];
          
          this.comptesSubject.next(nouveauxComptes);
          this.mettreAJourStatistiques(nouveauxComptes);
          this.mettreAJourPlanComptable(nouveauxComptes);
          
          observer.next(nouveauCompte);
          observer.complete();
        });
      }, 500);
    });
  }

  // Modifier un compte
  modifierCompte(compteId: string, modifications: Partial<CompteComptable>): Observable<CompteComptable> {
    return new Observable(observer => {
      setTimeout(() => {
        const comptesActuels = this.comptesSubject.value;
        const index = comptesActuels.findIndex(c => c.id === compteId);
        
        if (index === -1) {
          observer.error('Compte non trouvé');
          return;
        }

        const compteModifie = {
          ...comptesActuels[index],
          ...modifications,
          derniereModification: new Date()
        };

        // Re-validation IA
        this.validerCompteAvecIA(compteModifie).subscribe(validation => {
          compteModifie.validationIA = validation;
          
          const nouveauxComptes = [...comptesActuels];
          nouveauxComptes[index] = compteModifie;
          
          this.comptesSubject.next(nouveauxComptes);
          this.mettreAJourStatistiques(nouveauxComptes);
          this.mettreAJourPlanComptable(nouveauxComptes);
          
          observer.next(compteModifie);
          observer.complete();
        });
      }, 400);
    });
  }

  // Supprimer un compte
  supprimerCompte(compteId: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const comptesActuels = this.comptesSubject.value;
        const compte = comptesActuels.find(c => c.id === compteId);
        
        if (!compte) {
          observer.error('Compte non trouvé');
          return;
        }

        // Vérifications avant suppression
        if (compte.mouvementDebit || compte.mouvementCredit) {
          observer.error('Impossible de supprimer un compte ayant des mouvements');
          return;
        }

        if (!compte.personnalise) {
          observer.error('Impossible de supprimer un compte du plan standard');
          return;
        }

        const nouveauxComptes = comptesActuels.filter(c => c.id !== compteId);
        
        this.comptesSubject.next(nouveauxComptes);
        this.mettreAJourStatistiques(nouveauxComptes);
        this.mettreAJourPlanComptable(nouveauxComptes);
        
        observer.next(true);
        observer.complete();
      }, 300);
    });
  }

  // ==================== RECHERCHE ET FILTRAGE ====================

  // Rechercher des comptes
  rechercherComptes(criteres: {
    query?: string;
    classe?: ClasseComptable;
    typeCompte?: TypeCompte;
    actifSeulement?: boolean;
    personnalisesSeulement?: boolean;
  }): Observable<CompteComptable[]> {
    return this.comptes$.pipe(
      map(comptes => {
        let resultats = [...comptes];

        if (criteres.query) {
          const query = criteres.query.toLowerCase();
          resultats = resultats.filter(compte => 
            compte.numero.toLowerCase().includes(query) ||
            compte.intitule.toLowerCase().includes(query) ||
            compte.description?.toLowerCase().includes(query)
          );
        }

        if (criteres.classe) {
          resultats = resultats.filter(compte => compte.classe === criteres.classe);
        }

        if (criteres.typeCompte) {
          resultats = resultats.filter(compte => compte.typeCompte === criteres.typeCompte);
        }

        if (criteres.actifSeulement) {
          resultats = resultats.filter(compte => compte.statut === StatutCompte.ACTIF);
        }

        if (criteres.personnalisesSeulement) {
          resultats = resultats.filter(compte => compte.personnalise);
        }

        return resultats.sort((a, b) => a.numero.localeCompare(b.numero));
      })
    );
  }

  // Obtenir comptes par classe
  getComptesParClasse(classe: ClasseComptable): Observable<CompteComptable[]> {
    return this.comptes$.pipe(
      map(comptes => comptes.filter(compte => compte.classe === classe))
    );
  }

  // ==================== VALIDATION IA ====================

  // Valider un compte avec IA
  validerCompteAvecIA(compte: CompteComptable): Observable<ValidationCompteIA> {
    return new Observable(observer => {
      setTimeout(() => {
        const controles: ControleCompteIA[] = [];
        const suggestions: SuggestionCompte[] = [];
        const anomalies: AnomalieCompte[] = [];
        let score = 0;

        // Contrôle 1: Format du numéro
        if (this.validerFormatNumero(compte.numero)) {
          controles.push({
            type: TypeControle.NUMERO_VALIDE,
            resultat: 'CONFORME',
            message: 'Format du numéro conforme SYSCOHADA',
            priorite: 'HAUTE'
          });
          score += 25;
        } else {
          controles.push({
            type: TypeControle.NUMERO_VALIDE,
            resultat: 'NON_CONFORME',
            message: 'Format du numéro non conforme',
            priorite: 'HAUTE'
          });
          anomalies.push({
            type: TypeAnomalie.NUMERO_INVALIDE,
            gravite: 'CRITIQUE',
            description: 'Le numéro de compte ne respecte pas les règles SYSCOHADA',
            compteConcerne: compte.numero,
            actionCorrectrice: 'Corriger le format du numéro selon les règles SYSCOHADA',
            dateDetection: new Date()
          });
        }

        // Contrôle 2: Cohérence intitulé
        if (compte.intitule && compte.intitule.length >= 3) {
          controles.push({
            type: TypeControle.INTITULE_COHERENT,
            resultat: 'CONFORME',
            message: 'Intitulé présent et cohérent',
            priorite: 'MOYENNE'
          });
          score += 20;
        } else {
          controles.push({
            type: TypeControle.INTITULE_COHERENT,
            resultat: 'NON_CONFORME',
            message: 'Intitulé manquant ou trop court',
            priorite: 'HAUTE'
          });
          anomalies.push({
            type: TypeAnomalie.INTITULE_MANQUANT,
            gravite: 'IMPORTANTE',
            description: 'L\'intitulé du compte est manquant ou insuffisant',
            compteConcerne: compte.numero,
            actionCorrectrice: 'Saisir un intitulé descriptif d\'au moins 3 caractères',
            dateDetection: new Date()
          });
        }

        // Contrôle 3: Classification
        if (this.validerClassification(compte)) {
          controles.push({
            type: TypeControle.CLASSIFICATION_CORRECTE,
            resultat: 'CONFORME',
            message: 'Classification SYSCOHADA correcte',
            priorite: 'HAUTE'
          });
          score += 25;
        } else {
          controles.push({
            type: TypeControle.CLASSIFICATION_CORRECTE,
            resultat: 'ATTENTION',
            message: 'Classification à vérifier',
            priorite: 'MOYENNE'
          });
          score += 10;
        }

        // Contrôle 4: Propriétés cohérentes
        if (this.validerProprietesCoherentes(compte)) {
          controles.push({
            type: TypeControle.PROPRIETES_VALIDES,
            resultat: 'CONFORME',
            message: 'Propriétés du compte cohérentes',
            priorite: 'MOYENNE'
          });
          score += 20;
        } else {
          controles.push({
            type: TypeControle.PROPRIETES_VALIDES,
            resultat: 'ATTENTION',
            message: 'Certaines propriétés semblent incohérentes',
            priorite: 'MOYENNE'
          });
          score += 10;
        }

        // Suggestions intelligentes
        if (compte.numero.startsWith('41') && !compte.lettrable) {
          suggestions.push({
            type: TypeSuggestion.MODIFICATION_PROPRIETE,
            titre: 'Activation du lettrage recommandée',
            description: 'Les comptes clients (41) sont généralement lettrables',
            beneficeAttendu: 'Faciliter le suivi des règlements clients'
          });
        }

        if (compte.numero.startsWith('52') && !compte.rapprochable) {
          suggestions.push({
            type: TypeSuggestion.MODIFICATION_PROPRIETE,
            titre: 'Activation du rapprochement bancaire',
            description: 'Les comptes banques (52) doivent être rapprochables',
            beneficeAttendu: 'Permettre les rapprochements bancaires automatiques'
          });
        }

        // Score final
        score = Math.min(100, score + 10); // Bonus base

        const validation: ValidationCompteIA = {
          score,
          conformiteSYSCOHADA: score >= 80,
          controles,
          suggestions,
          anomalies,
          dateValidation: new Date()
        };

        observer.next(validation);
        observer.complete();
      }, 300);
    });
  }

  // ==================== IMPORT/EXPORT ====================

  // Importer un plan comptable
  importerPlanComptable(importData: Partial<ImportPlanComptable>): Observable<ImportPlanComptable> {
    return new Observable(observer => {
      const importJob: ImportPlanComptable = {
        id: `import_${Date.now()}`,
        fichier: importData.fichier!,
        format: importData.format || FormatImport.CSV,
        options: importData.options || {},
        statut: StatutImport.EN_COURS,
        validationPrealable: importData.validationPrealable || true,
        mappingColonnes: importData.mappingColonnes || [],
        importePar: 'user'
      };

      // Simulation traitement import
      setTimeout(() => {
        importJob.statut = StatutImport.TERMINE;
        importJob.comptesImportes = 45;
        importJob.comptesRejetes = 2;
        importJob.dateImport = new Date();
        importJob.erreurs = [
          {
            ligne: 12,
            colonne: 'numero',
            erreur: 'Format de numéro invalide',
            gravite: 'BLOQUANTE',
            suggestion: 'Utiliser le format SYSCOHADA (ex: 101000)'
          },
          {
            ligne: 28,
            colonne: 'intitule',
            erreur: 'Intitulé vide',
            gravite: 'BLOQUANTE',
            suggestion: 'Saisir un intitulé descriptif'
          }
        ];

        observer.next(importJob);
        observer.complete();
      }, 2000);
    });
  }

  // Exporter le plan comptable
  exporterPlanComptable(format: FormatImport): Observable<Blob> {
    return new Observable(observer => {
      setTimeout(() => {
        const comptes = this.comptesSubject.value;
        let contenu = '';

        switch (format) {
          case FormatImport.CSV:
            contenu = 'Numero;Intitule;Classe;Type;Nature Solde\n';
            comptes.forEach(compte => {
              contenu += `${compte.numero};${compte.intitule};${compte.classe};${compte.typeCompte};${compte.natureSolde}\n`;
            });
            break;
            
          case FormatImport.JSON:
            contenu = JSON.stringify(comptes, null, 2);
            break;
        }

        const blob = new Blob([contenu], { 
          type: format === FormatImport.CSV ? 'text/csv' : 'application/json' 
        });
        
        observer.next(blob);
        observer.complete();
      }, 500);
    });
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private creerCompteDepuisBase(compteBase: any): CompteComptable {
    return {
      id: `compte_${compteBase.numero}_${Date.now()}`,
      numero: compteBase.numero,
      intitule: compteBase.intitule,
      classe: compteBase.classe,
      typeCompte: this.determinerTypeCompte(compteBase.numero),
      natureSolde: this.determinerNatureSolde(compteBase.numero),
      utilisationAnalytique: false,
      lettrable: compteBase.numero.startsWith('4'),
      rapprochable: compteBase.numero.startsWith('52') || compteBase.numero.startsWith('53'),
      saisieAutorisee: true,
      ventilationObligatoire: false,
      auxiliaireObligatoire: compteBase.numero.startsWith('4'),
      pieceJustificativeObligatoire: false,
      categorieAUDCIF: this.determinerCategorieAUDCIF(compteBase.numero),
      ratiosAffectes: this.determinerRatiosAffectes(compteBase.numero),
      dateCreation: new Date(),
      derniereModification: new Date(),
      statut: StatutCompte.ACTIF,
      personnalise: false,
      soldeDebit: 0,
      soldeCredit: 0,
      mouvementDebit: 0,
      mouvementCredit: 0
    };
  }

  private determinerTypeCompte(numero: string): TypeCompte {
    const premiereClasse = numero.charAt(0);
    return ['1', '2', '3', '4', '5'].includes(premiereClasse) ? TypeCompte.BILAN : TypeCompte.GESTION;
  }

  private determinerNatureSolde(numero: string): NatureSolde {
    const premiereClasse = numero.charAt(0);
    return ['2', '3', '4', '6'].includes(premiereClasse) ? NatureSolde.DEBITEUR : NatureSolde.CREDITEUR;
  }

  private determinerCategorieAUDCIF(numero: string): CategorieAUDCIF {
    const premiereClasse = numero.charAt(0);
    switch (premiereClasse) {
      case '2': return CategorieAUDCIF.ACTIF_IMMOBILISE;
      case '3': return CategorieAUDCIF.ACTIF_CIRCULANT;
      case '5': return numero.startsWith('57') ? CategorieAUDCIF.TRESORERIE_ACTIF : CategorieAUDCIF.ACTIF_CIRCULANT;
      case '1': return CategorieAUDCIF.RESSOURCES_STABLES;
      case '4': return CategorieAUDCIF.PASSIF_CIRCULANT;
      case '6': return CategorieAUDCIF.CHARGES_EXPLOITATION;
      case '7': return CategorieAUDCIF.PRODUITS_EXPLOITATION;
      default: return CategorieAUDCIF.ACTIF_CIRCULANT;
    }
  }

  private determinerRatiosAffectes(numero: string): string[] {
    const ratios: string[] = [];
    const premiereClasse = numero.charAt(0);
    
    switch (premiereClasse) {
      case '2':
        ratios.push('LIQUIDITE_GENERALE', 'AUTONOMIE_FINANCIERE');
        break;
      case '4':
        ratios.push('LIQUIDITE_GENERALE', 'LIQUIDITE_REDUITE');
        break;
      case '5':
        ratios.push('LIQUIDITE_IMMEDIATE', 'TRESORERIE');
        break;
      case '6':
        ratios.push('RENTABILITE_EXPLOITATION', 'RENTABILITE_NETTE');
        break;
      case '7':
        ratios.push('RENTABILITE_EXPLOITATION', 'RENTABILITE_NETTE');
        break;
    }
    
    return ratios;
  }

  private validerFormatNumero(numero: string): boolean {
    const regles = REGLES_VALIDATION_SYSCOHADA.numeroCompte;
    return regles.formatAutorise.test(numero) && 
           numero.length >= regles.longueurMin && 
           numero.length <= regles.longueurMax &&
           regles.classesValides.includes(numero.charAt(0));
  }

  private validerClassification(compte: CompteComptable): boolean {
    const premiereClasse = compte.numero.charAt(0);
    const classeAttendue = `CLASSE_${premiereClasse}` as ClasseComptable;
    return compte.classe === classeAttendue;
  }

  private validerProprietesCoherentes(compte: CompteComptable): boolean {
    // Validation des propriétés selon le type de compte
    if (compte.numero.startsWith('4') && !compte.lettrable) {
      return false; // Comptes de tiers doivent être lettrables
    }
    
    if (compte.numero.startsWith('52') && !compte.rapprochable) {
      return false; // Comptes banques doivent être rapprochables
    }
    
    return true;
  }

  private getParametresValidationParDefaut(): ParametresValidation {
    return {
      validationAutomatique: true,
      seuilAlerteSolde: 1000000,
      controleCoherenceObligatoire: true,
      validationHierarchique: false,
      alerteCompteInexistant: true,
      blocageSaisieCompteInactif: true
    };
  }

  private calculerStatistiquesVides(): StatistiquesPlan {
    return {
      repartitionParClasse: {},
      comptesLettres: 0,
      comptesRapproches: 0,
      comptesAvecAuxiliaires: 0,
      moyenneMouvementsParCompte: 0,
      tauxUtilisationPlan: 0,
      conformiteSYSCOHADA: 0,
      scoreQualite: 0
    };
  }

  private mettreAJourStatistiques(comptes: CompteComptable[]): void {
    const stats: StatistiquesPlan = {
      repartitionParClasse: {},
      comptesLettres: comptes.filter(c => c.lettrable).length,
      comptesRapproches: comptes.filter(c => c.rapprochable).length,
      comptesAvecAuxiliaires: comptes.filter(c => c.auxiliaireObligatoire).length,
      moyenneMouvementsParCompte: comptes.reduce((sum, c) => sum + (c.mouvementDebit || 0) + (c.mouvementCredit || 0), 0) / comptes.length,
      tauxUtilisationPlan: (comptes.filter(c => c.mouvementDebit || c.mouvementCredit).length / comptes.length) * 100,
      conformiteSYSCOHADA: (comptes.filter(c => c.validationIA?.conformiteSYSCOHADA).length / comptes.length) * 100,
      scoreQualite: comptes.reduce((sum, c) => sum + (c.validationIA?.score || 0), 0) / comptes.length
    };

    // Répartition par classe
    Object.values(ClasseComptable).forEach(classe => {
      stats.repartitionParClasse[classe] = comptes.filter(c => c.classe === classe).length;
    });

    this.statistiquesSubject.next(stats);
  }

  private mettreAJourPlanComptable(comptes: CompteComptable[]): void {
    const planActuel = this.planComptableSubject.value;
    if (planActuel) {
      planActuel.comptes = comptes;
      planActuel.nombreComptes = comptes.length;
      planActuel.nombreComptesUtilises = comptes.filter(c => c.mouvementDebit || c.mouvementCredit).length;
      planActuel.derniereModification = new Date();
      
      // Calcul du pourcentage de complétion
      const comptesConformes = comptes.filter(c => c.validationIA?.conformiteSYSCOHADA).length;
      planActuel.pourcentageCompletion = Math.round((comptesConformes / comptes.length) * 100);
      
      this.planComptableSubject.next(planActuel);
    }
  }

  private initialiserPlanComptableDemo(): void {
    // Initialisation avec des données de démonstration
    setTimeout(() => {
      this.creerPlanComptable('demo_entreprise', 'SYSCOHADA_AUDCIF', 'CI').subscribe(plan => {
        this.initialiserAvecPlanSYSCOHADA(plan.id).subscribe();
      });
    }, 1000);
  }
}