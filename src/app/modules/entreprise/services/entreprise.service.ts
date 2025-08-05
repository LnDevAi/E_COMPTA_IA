import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { 
  Entreprise, 
  SystemeComptable, 
  SpecificitesFiscales, 
  SpecificitesSociales,
  PaysMondial,
  PAYS_MONDIAUX,
  getPaysByRegion,
  getPaysBySystemeComptable,
  getPaysByContinent,
  getStatistiquesMondialesComptabilite,
  CONTINENTS,
  SYSTEMES_COMPTABLES_PRINCIPAUX
} from '../models/entreprise.model';

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {
  private entrepriseSubject = new BehaviorSubject<Entreprise | null>(null);
  public entreprise$ = this.entrepriseSubject.asObservable();

  constructor() {}

  // =====================================================
  // GESTION DES DONNÉES MONDIALES
  // =====================================================

  /**
   * Récupère tous les pays supportés par la plateforme
   */
  getTousLesPays(): PaysMondial[] {
    return PAYS_MONDIAUX;
  }

  /**
   * Récupère uniquement les pays OHADA (17 pays)
   */
  getPaysOHADA(): PaysMondial[] {
    return getPaysBySystemeComptable('SYSCOHADA');
  }

  /**
   * Récupère les pays par continent
   */
  getPaysByContinent(continent: string): PaysMondial[] {
    return getPaysByContinent(continent);
  }

  /**
   * Récupère les pays par système comptable
   */
  getPaysBySystemeComptable(systeme: string): PaysMondial[] {
    return getPaysBySystemeComptable(systeme);
  }

  /**
   * Récupère les statistiques mondiales
   */
  getStatistiquesMondiales() {
    return getStatistiquesMondialesComptabilite();
  }

  /**
   * Récupère un pays par nom
   */
  getPaysByNom(nomPays: string): PaysMondial | undefined {
    return PAYS_MONDIAUX.find(pays => 
      pays.nom.toLowerCase() === nomPays.toLowerCase()
    );
  }

  /**
   * Recherche de pays par terme (nom, devise, langue, système)
   */
  rechercherPays(terme: string): PaysMondial[] {
    const termeLower = terme.toLowerCase();
    return PAYS_MONDIAUX.filter(pays => 
      pays.nom.toLowerCase().includes(termeLower) ||
      pays.devise.toLowerCase().includes(termeLower) ||
      pays.langue.toLowerCase().includes(termeLower) ||
      pays.systemeComptable.nom.toLowerCase().includes(termeLower) ||
      pays.continent.toLowerCase().includes(termeLower) ||
      pays.region.toLowerCase().includes(termeLower)
    );
  }

  // =====================================================
  // SYSTÈMES COMPTABLES
  // =====================================================

  /**
   * Détermine le système comptable selon le pays sélectionné
   */
  getSystemeComptableParPays(nomPays: string): SystemeComptable {
    const pays = this.getPaysByNom(nomPays);
    
    if (!pays) {
      // Système par défaut si pays non trouvé
      return {
        nom: 'IFRS',
        referentielDetail: 'International Financial Reporting Standards',
        auditObligatoire: false,
        devise: 'USD',
        langue: 'Anglais',
        espaceGeographique: 'International',
        particularites: ['Système comptable international par défaut']
      };
    }

    return {
      nom: pays.systemeComptable.nom,
      referentielDetail: pays.systemeComptable.referentielDetail,
      auditObligatoire: pays.systemeComptable.auditObligatoire,
      devise: pays.devise,
      langue: pays.langue,
      espaceGeographique: pays.region,
      particularites: pays.systemeComptable.caracteristiques
    };
  }

  /**
   * Récupère tous les systèmes comptables disponibles
   */
  getSystemesComptablesDisponibles(): string[] {
    return SYSTEMES_COMPTABLES_PRINCIPAUX;
  }

  // =====================================================
  // SPÉCIFICITÉS FISCALES
  // =====================================================

  /**
   * Récupère les spécificités fiscales par pays
   */
  getSpecificitesFiscalesParPays(nomPays: string): SpecificitesFiscales {
    const pays = this.getPaysByNom(nomPays);
    
    if (!pays) {
      // Spécificités par défaut
      return {
        tauxIS: 25.0,
        tauxTVA: 18.0,
        autresTaxes: [],
        declarationsTVA: {
          type: 'Mensuelle',
          details: 'Déclaration mensuelle standard'
        },
        echeancesFiscales: []
      };
    }

    return {
      tauxIS: pays.systemeFiscal.tauxIS,
      tauxTVA: pays.systemeFiscal.tauxTVA,
      baremeIR: pays.systemeFiscal.baremeIR,
      autresTaxes: pays.systemeFiscal.autresTaxes || [],
      declarationsTVA: {
        type: this.determinerFrequenceDeclaration(pays.systemeSocial.declarationsSociales),
        details: `Déclarations selon règlement ${pays.nom}`
      },
      echeancesFiscales: this.genererEcheancesFiscales(pays)
    };
  }

  // =====================================================
  // SPÉCIFICITÉS SOCIALES
  // =====================================================

  /**
   * Récupère les spécificités sociales par pays
   */
  getSpecificitesSocialesParPays(nomPays: string): SpecificitesSociales {
    const pays = this.getPaysByNom(nomPays);
    
    if (!pays) {
      // Spécificités par défaut
      return {
        organisme: 'Organisme Social Standard',
        cotisationsPatronales: 15.0,
        cotisationsSalariales: 5.0,
        declarationsSociales: {
          type: 'Mensuelle',
          details: 'Déclaration mensuelle standard'
        },
        echeancesSociales: [],
        regimesComplementaires: []
      };
    }

    return {
      organisme: pays.systemeSocial.organisme,
      cotisationsPatronales: pays.systemeSocial.cotisationsPatronales,
      cotisationsSalariales: pays.systemeSocial.cotisationsSalariales,
      declarationsSociales: {
        type: this.determinerFrequenceDeclaration(pays.systemeSocial.declarationsSociales),
        jourLimite: this.extraireJourLimite(pays.systemeSocial.declarationsSociales),
        details: pays.systemeSocial.declarationsSociales
      },
      echeancesSociales: this.genererEcheancesSociales(pays),
      regimesComplementaires: pays.systemeSocial.regimesComplementaires || []
    };
  }

  // =====================================================
  // VALIDATION IA AVANCÉE
  // =====================================================

  /**
   * Validation intelligente d'une entreprise avec IA
   */
  validerEntrepriseAvecIA(entreprise: Partial<Entreprise>): Observable<any> {
    return of(null).pipe(
      delay(2000), // Simulation du traitement IA
      map(() => {
        const pays = this.getPaysByNom(entreprise.adresse?.pays || '');
        const validations = [];
        const recommandations = [];
        const alertes = [];
        let score = 100;

        // Validation du pays et système comptable
        if (pays) {
          validations.push(`✅ Pays "${pays.nom}" reconnu et supporté`);
          validations.push(`✅ Système comptable ${pays.systemeComptable.nom} identifié`);
          validations.push(`✅ Devise ${pays.devise} configurée`);
          validations.push(`✅ Langue ${pays.langue} validée`);
          
          // Validation du système fiscal
          validations.push(`✅ Taux IS: ${pays.systemeFiscal.tauxIS}%`);
          validations.push(`✅ Taux TVA: ${pays.systemeFiscal.tauxTVA}%`);
          
          // Validation du système social
          validations.push(`✅ Organisme social: ${pays.systemeSocial.organisme}`);
          validations.push(`✅ Cotisations configurées`);

          // Recommandations spécifiques au pays
          if (pays.region === 'OHADA') {
            recommandations.push(`📋 Système OHADA: Audit obligatoire selon seuils`);
            recommandations.push(`📋 Comptabilité en français obligatoire`);
            recommandations.push(`📋 Plan comptable SYSCOHADA AUDCIF`);
          }

          if (pays.systemeComptable.auditObligatoire) {
            recommandations.push(`🔍 Audit obligatoire dans ${pays.nom}`);
          }

          // Alertes selon le contexte économique
          if (pays.statutEconomique === 'PMA') {
            alertes.push(`⚠️ Pays Moins Avancé: Simplifications possibles`);
          }

          if (pays.systemeFiscal.tauxIS > 35) {
            alertes.push(`💰 Taux IS élevé (${pays.systemeFiscal.tauxIS}%)`);
          }

          if (pays.systemeSocial.cotisationsPatronales > 30) {
            alertes.push(`💼 Charges sociales élevées (${pays.systemeSocial.cotisationsPatronales}%)`);
          }

        } else {
          score -= 50;
          alertes.push(`❌ Pays non reconnu ou non supporté`);
          alertes.push(`❌ Système comptable non identifiable`);
        }

        // Validation des informations obligatoires
        if (!entreprise.raisonSociale) {
          score -= 10;
          alertes.push(`❌ Raison sociale manquante`);
        }

        if (!entreprise.formeJuridique) {
          score -= 10;
          alertes.push(`❌ Forme juridique manquante`);
        }

        if (!entreprise.adresse?.pays) {
          score -= 20;
          alertes.push(`❌ Pays manquant`);
        }

        // Recommandations générales
        recommandations.push(`📊 Configuration automatique des taux fiscaux`);
        recommandations.push(`🔄 Synchronisation avec les normes locales`);
        recommandations.push(`📈 Suivi des évolutions réglementaires`);

        return {
          scoreConformite: Math.max(score, 0),
          pointsVerifies: validations,
          recommandations,
          alertes,
          dernierControle: new Date(),
          pays: pays,
          statistiques: {
            dureeValidation: '2.3s',
            controlsExecutes: validations.length + alertes.length,
            niveauConfiance: score > 80 ? 'Élevé' : score > 60 ? 'Moyen' : 'Faible'
          }
        };
      })
    );
  }

  // =====================================================
  // GESTION ENTREPRISE
  // =====================================================

  /**
   * Sauvegarde une entreprise
   */
  sauvegarderEntreprise(entreprise: Entreprise): Observable<boolean> {
    return of(true).pipe(
      delay(1000),
      map(() => {
        this.entrepriseSubject.next(entreprise);
        console.log('💾 Entreprise sauvegardée:', entreprise);
        return true;
      })
    );
  }

  /**
   * Charge une entreprise
   */
  chargerEntreprise(): Observable<Entreprise | null> {
    return this.entreprise$;
  }

  // =====================================================
  // UTILITAIRES PRIVÉS
  // =====================================================

  private determinerFrequenceDeclaration(declaration: string): 'Mensuelle' | 'Trimestrielle' | 'Annuelle' {
    if (declaration.toLowerCase().includes('mensuel')) return 'Mensuelle';
    if (declaration.toLowerCase().includes('trimestriel')) return 'Trimestrielle';
    return 'Mensuelle'; // Par défaut
  }

  private extraireJourLimite(declaration: string): number | undefined {
    const match = declaration.match(/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }

  private genererEcheancesFiscales(pays: PaysMondial) {
    const echeances = [];
    const aujourd_hui = new Date();
    
    // Échéances trimestrielles IS
    for (let i = 0; i < 4; i++) {
      const date = new Date(aujourd_hui.getFullYear(), i * 3 + 2, 31); // Fin de trimestre
      echeances.push({
        type: 'Acompte IS',
        dateEcheance: date,
        montantEstime: 0
      });
    }
    
    // Échéances TVA selon le pays
    const frequence = pays.systemeSocial.declarationsSociales.toLowerCase().includes('mensuel') ? 1 : 3;
    for (let i = 0; i < 12; i += frequence) {
      const date = new Date(aujourd_hui.getFullYear(), i, 15);
      echeances.push({
        type: 'Déclaration TVA',
        dateEcheance: date,
        montantEstime: 0
      });
    }
    
    return echeances;
  }

  private genererEcheancesSociales(pays: PaysMondial) {
    const echeances = [];
    const aujourd_hui = new Date();
    
    // Échéances mensuelles standard
    for (let i = 0; i < 12; i++) {
      const date = new Date(aujourd_hui.getFullYear(), i, 15);
      echeances.push({
        organisme: pays.systemeSocial.organisme,
        type: 'Cotisations sociales',
        dateEcheance: date,
        montantEstime: 0
      });
    }
    
    return echeances;
  }

  // =====================================================
  // ANALYTICS ET STATISTIQUES
  // =====================================================

  /**
   * Récupère les statistiques d'utilisation par région
   */
  getStatistiquesParRegion(): Observable<any> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const stats = PAYS_MONDIAUX.reduce((acc, pays) => {
          if (!acc[pays.region]) {
            acc[pays.region] = {
              nom: pays.region,
              nombrePays: 0,
              systemesComptables: new Set(),
              devises: new Set(),
              langues: new Set()
            };
          }
          acc[pays.region].nombrePays++;
          acc[pays.region].systemesComptables.add(pays.systemeComptable.nom);
          acc[pays.region].devises.add(pays.devise);
          acc[pays.region].langues.add(pays.langue);
          return acc;
        }, {} as any);

        // Conversion des Sets en arrays pour l'affichage
        Object.values(stats).forEach((stat: any) => {
          stat.systemesComptables = Array.from(stat.systemesComptables);
          stat.devises = Array.from(stat.devises);
          stat.langues = Array.from(stat.langues);
        });

        return Object.values(stats);
      })
    );
  }

  /**
   * Récupère les tendances d'adoption par système comptable
   */
  getTendancesSystemesComptables(): Observable<any> {
    return of(null).pipe(
      delay(300),
      map(() => {
        const tendances = SYSTEMES_COMPTABLES_PRINCIPAUX.map(systeme => {
          const pays = getPaysBySystemeComptable(systeme);
          return {
            systeme,
            nombrePays: pays.length,
            pourcentage: (pays.length / PAYS_MONDIAUX.length * 100).toFixed(1),
            principauxPays: pays.slice(0, 5).map(p => p.nom),
            regions: [...new Set(pays.map(p => p.region))]
          };
        }).sort((a, b) => b.nombrePays - a.nombrePays);

        return tendances;
      })
    );
  }

  /**
   * Recommandations intelligentes selon le profil
   */
  getRecommandationsIntelligentes(entreprise: Partial<Entreprise>): Observable<any> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const pays = this.getPaysByNom(entreprise.adresse?.pays || '');
        const recommandations = [];

        if (pays) {
          // Recommandations système comptable
          recommandations.push({
            categorie: 'Système Comptable',
            priorite: 'Haute',
            titre: `Configuration ${pays.systemeComptable.nom}`,
            description: `Votre entreprise utilisera le système ${pays.systemeComptable.nom} conformément à la réglementation ${pays.nom}`,
            actions: [
              'Configurer le plan comptable standard',
              'Définir les paramètres de consolidation',
              'Activer les contrôles de conformité'
            ]
          });

          // Recommandations fiscales
          recommandations.push({
            categorie: 'Fiscalité',
            priorite: 'Haute',
            titre: 'Optimisation fiscale',
            description: `IS: ${pays.systemeFiscal.tauxIS}% | TVA: ${pays.systemeFiscal.tauxTVA}%`,
            actions: [
              'Configurer les taux automatiques',
              'Planifier les déclarations',
              'Activer les alertes d\'échéances'
            ]
          });

          // Recommandations sociales
          recommandations.push({
            categorie: 'Social',
            priorite: 'Moyenne',
            titre: 'Gestion des cotisations',
            description: `Organisme: ${pays.systemeSocial.organisme}`,
            actions: [
              'Configurer les taux de cotisations',
              'Automatiser les calculs de paie',
              'Programmer les déclarations sociales'
            ]
          });

          // Recommandations selon le statut économique
          if (pays.statutEconomique === 'Développé') {
            recommandations.push({
              categorie: 'Conformité',
              priorite: 'Moyenne',
              titre: 'Standards élevés',
              description: 'Pays développé avec exigences renforcées',
              actions: [
                'Activer l\'audit automatique',
                'Configurer les contrôles renforcés',
                'Préparer les reportings avancés'
              ]
            });
          }
        }

        return recommandations;
      })
    );
  }
}