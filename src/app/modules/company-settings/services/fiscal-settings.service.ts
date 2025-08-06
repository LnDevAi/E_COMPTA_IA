import { 
  ConfigurationFiscaleEntreprise, 
  ConfigurationTaxeFiscale, 
  CalculTaxeParams, 
  ResultatCalculTaxe,
  TypeTaxe,
  NatureTaxe,
  ModeCalculTaxe,
  StatistiquesFiscales,
  EcritureComptableTaxe,
  CONFIGURATION_FISCALE_BURKINA_FASO
} from '../models/fiscal-settings.model';

export class FiscalSettingsService {
  private static instance: FiscalSettingsService;
  private baseUrl = '/api/fiscal-settings';

  static getInstance(): FiscalSettingsService {
    if (!FiscalSettingsService.instance) {
      FiscalSettingsService.instance = new FiscalSettingsService();
    }
    return FiscalSettingsService.instance;
  }

  // Gestion de la configuration fiscale d'entreprise
  async getConfigurationFiscale(entrepriseId: string): Promise<ConfigurationFiscaleEntreprise> {
    try {
      const response = await fetch(`${this.baseUrl}/entreprises/${entrepriseId}/configuration`);
      if (!response.ok) throw new Error('Configuration fiscale non trouvée');
      return await response.json();
    } catch (error) {
      console.error('Erreur getConfigurationFiscale:', error);
      throw error;
    }
  }

  async createConfigurationFiscale(config: Omit<ConfigurationFiscaleEntreprise, 'id' | 'dateCreation' | 'dateMiseAJour'>): Promise<ConfigurationFiscaleEntreprise> {
    try {
      const response = await fetch(`${this.baseUrl}/entreprises/${config.entrepriseId}/configuration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Erreur lors de la création de la configuration');
      return await response.json();
    } catch (error) {
      console.error('Erreur createConfigurationFiscale:', error);
      throw error;
    }
  }

  async updateConfigurationFiscale(entrepriseId: string, config: Partial<ConfigurationFiscaleEntreprise>): Promise<ConfigurationFiscaleEntreprise> {
    try {
      const response = await fetch(`${this.baseUrl}/entreprises/${entrepriseId}/configuration`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return await response.json();
    } catch (error) {
      console.error('Erreur updateConfigurationFiscale:', error);
      throw error;
    }
  }

  // Gestion des taxes individuelles
  async getTaxesByEntreprise(entrepriseId: string): Promise<ConfigurationTaxeFiscale[]> {
    try {
      const response = await fetch(`${this.baseUrl}/entreprises/${entrepriseId}/taxes`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des taxes');
      return await response.json();
    } catch (error) {
      console.error('Erreur getTaxesByEntreprise:', error);
      throw error;
    }
  }

  async createTaxe(entrepriseId: string, taxe: Omit<ConfigurationTaxeFiscale, 'id' | 'dateCreation' | 'dateMiseAJour'>): Promise<ConfigurationTaxeFiscale> {
    try {
      const response = await fetch(`${this.baseUrl}/entreprises/${entrepriseId}/taxes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taxe,
          entrepriseId,
          dateCreation: new Date().toISOString(),
          dateMiseAJour: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la création de la taxe');
      return await response.json();
    } catch (error) {
      console.error('Erreur createTaxe:', error);
      throw error;
    }
  }

  async updateTaxe(taxeId: string, taxe: Partial<ConfigurationTaxeFiscale>): Promise<ConfigurationTaxeFiscale> {
    try {
      const response = await fetch(`${this.baseUrl}/taxes/${taxeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taxe,
          dateMiseAJour: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour de la taxe');
      return await response.json();
    } catch (error) {
      console.error('Erreur updateTaxe:', error);
      throw error;
    }
  }

  async deleteTaxe(taxeId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/taxes/${taxeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression de la taxe');
      return true;
    } catch (error) {
      console.error('Erreur deleteTaxe:', error);
      throw error;
    }
  }

  // Calcul des taxes
  async calculerTaxe(params: CalculTaxeParams): Promise<ResultatCalculTaxe> {
    try {
      const response = await fetch(`${this.baseUrl}/calcul-taxe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error('Erreur lors du calcul de la taxe');
      return await response.json();
    } catch (error) {
      console.error('Erreur calculerTaxe:', error);
      // Calcul côté client en fallback
      return this.calculerTaxeLocal(params);
    }
  }

  // Calcul local des taxes (fallback)
  calculerTaxeLocal(params: CalculTaxeParams): ResultatCalculTaxe {
    const { montantBase, configurationTaxe } = params;
    let montantTaxe = 0;
    let tauxApplique = 0;
    const detailsCalcul: any[] = [];
    const ecrituresComptables: EcritureComptableTaxe[] = [];

    try {
      // Vérifier le seuil d'application
      if (configurationTaxe.seuilApplication && montantBase < configurationTaxe.seuilApplication) {
        return {
          montantBase,
          montantTaxe: 0,
          tauxApplique: 0,
          detailsCalcul: [{
            etape: 'Vérification seuil',
            description: `Montant ${montantBase} inférieur au seuil ${configurationTaxe.seuilApplication}`,
            calcul: `${montantBase} < ${configurationTaxe.seuilApplication}`,
            montant: 0
          }],
          ecrituresComptables: []
        };
      }

      // Calcul selon le mode
      switch (configurationTaxe.modeCalcul) {
        case ModeCalculTaxe.POURCENTAGE:
          if (configurationTaxe.taux !== undefined) {
            tauxApplique = configurationTaxe.taux;
            montantTaxe = (montantBase * configurationTaxe.taux) / 100;
            
            detailsCalcul.push({
              etape: 'Calcul pourcentage',
              description: `Application du taux ${configurationTaxe.taux}%`,
              calcul: `${montantBase} × ${configurationTaxe.taux}% = ${montantTaxe}`,
              montant: montantTaxe
            });
          }
          break;

        case ModeCalculTaxe.MONTANT_FIXE:
          if (configurationTaxe.montantFixe !== undefined) {
            montantTaxe = configurationTaxe.montantFixe;
            tauxApplique = (montantTaxe / montantBase) * 100;
            
            detailsCalcul.push({
              etape: 'Montant fixe',
              description: `Application du montant fixe`,
              calcul: `Montant fixe = ${montantTaxe}`,
              montant: montantTaxe
            });
          }
          break;

        case ModeCalculTaxe.BAREME:
          if (configurationTaxe.bareme && configurationTaxe.bareme.length > 0) {
            const resultBareme = this.calculerTaxeBareme(montantBase, configurationTaxe.bareme);
            montantTaxe = resultBareme.montantTotal;
            tauxApplique = resultBareme.tauxMoyen;
            detailsCalcul.push(...resultBareme.details);
          }
          break;

        default:
          throw new Error(`Mode de calcul non supporté: ${configurationTaxe.modeCalcul}`);
      }

      // Générer les écritures comptables
      ecrituresComptables.push(...this.genererEcrituresComptables(
        configurationTaxe,
        montantBase,
        montantTaxe
      ));

      return {
        montantBase,
        montantTaxe: Math.round(montantTaxe * 100) / 100, // Arrondi à 2 décimales
        tauxApplique: Math.round(tauxApplique * 100) / 100,
        detailsCalcul,
        ecrituresComptables
      };

    } catch (error) {
      console.error('Erreur dans calculerTaxeLocal:', error);
      throw error;
    }
  }

  // Calcul avec barème progressif
  private calculerTaxeBareme(montantBase: number, bareme: any[]): {
    montantTotal: number;
    tauxMoyen: number;
    details: any[];
  } {
    let montantTotal = 0;
    const details: any[] = [];
    const baremeOrdonne = bareme.sort((a, b) => a.ordre - b.ordre);

    for (const tranche of baremeOrdonne) {
      const montantTranche = Math.min(
        Math.max(0, montantBase - tranche.trancheDe),
        tranche.trancheA - tranche.trancheDe
      );

      if (montantTranche > 0) {
        const taxeTranche = (montantTranche * tranche.taux) / 100;
        montantTotal += taxeTranche;

        details.push({
          etape: `Tranche ${tranche.ordre}`,
          description: `De ${tranche.trancheDe} à ${tranche.trancheA} - Taux ${tranche.taux}%`,
          calcul: `${montantTranche} × ${tranche.taux}% = ${taxeTranche}`,
          montant: taxeTranche
        });
      }
    }

    const tauxMoyen = montantBase > 0 ? (montantTotal / montantBase) * 100 : 0;

    return {
      montantTotal,
      tauxMoyen,
      details
    };
  }

  // Génération des écritures comptables
  private genererEcrituresComptables(
    taxe: ConfigurationTaxeFiscale,
    montantBase: number,
    montantTaxe: number
  ): EcritureComptableTaxe[] {
    const ecritures: EcritureComptableTaxe[] = [];

    switch (taxe.natureTaxe) {
      case NatureTaxe.COLLECTEE:
        // TVA collectée : Débit Client / Crédit TVA collectée
        if (taxe.compteCollecte) {
          ecritures.push({
            compteCredit: taxe.compteCollecte,
            libelle: `${taxe.libelle} - ${montantTaxe}`,
            montant: montantTaxe,
            sensOperation: 'CREDIT'
          });
        }
        break;

      case NatureTaxe.DEDUCTIBLE:
        // TVA déductible : Débit TVA déductible / Crédit Fournisseur
        if (taxe.compteDeduction) {
          ecritures.push({
            compteDebit: taxe.compteDeduction,
            libelle: `${taxe.libelle} - ${montantTaxe}`,
            montant: montantTaxe,
            sensOperation: 'DEBIT'
          });
        }
        break;

      case NatureTaxe.A_PAYER:
        // Taxe à payer : Débit Charge / Crédit Dette fiscale
        if (taxe.compteCharge) {
          ecritures.push({
            compteDebit: taxe.compteCharge,
            libelle: `${taxe.libelle} - Charge`,
            montant: montantTaxe,
            sensOperation: 'DEBIT'
          });
        }
        if (taxe.compteDette) {
          ecritures.push({
            compteCredit: taxe.compteDette,
            libelle: `${taxe.libelle} - Dette`,
            montant: montantTaxe,
            sensOperation: 'CREDIT'
          });
        }
        break;

      case NatureTaxe.RETENUE:
        // Retenue : Crédit Dette fiscale (retenue sur salaire)
        if (taxe.compteDette) {
          ecritures.push({
            compteCredit: taxe.compteDette,
            libelle: `${taxe.libelle} - Retenue`,
            montant: montantTaxe,
            sensOperation: 'CREDIT'
          });
        }
        break;

      case NatureTaxe.COTISATION:
        // Cotisation sociale : Débit Charge / Crédit Dette sociale
        if (taxe.compteCharge) {
          ecritures.push({
            compteDebit: taxe.compteCharge,
            libelle: `${taxe.libelle} - Cotisation`,
            montant: montantTaxe,
            sensOperation: 'DEBIT'
          });
        }
        if (taxe.compteDette) {
          ecritures.push({
            compteCredit: taxe.compteDette,
            libelle: `${taxe.libelle} - Dette`,
            montant: montantTaxe,
            sensOperation: 'CREDIT'
          });
        }
        break;
    }

    return ecritures;
  }

  // Calculer toutes les taxes applicables pour une opération
  async calculerTaxesOperation(
    entrepriseId: string,
    montantBase: number,
    typeOperation: string,
    journal: string,
    dateOperation: string
  ): Promise<{
    montantHT: number;
    montantTTC: number;
    taxes: ResultatCalculTaxe[];
    totalTaxes: number;
    ecrituresComptables: EcritureComptableTaxe[];
  }> {
    try {
      const taxes = await this.getTaxesByEntreprise(entrepriseId);
      const taxesApplicables = taxes.filter(taxe => 
        taxe.actif && 
        (taxe.journauxConcernes.length === 0 || taxe.journauxConcernes.includes(journal)) &&
        taxe.calculAutoматique
      );

      const resultats: ResultatCalculTaxe[] = [];
      let totalTaxes = 0;
      const toutesEcritures: EcritureComptableTaxe[] = [];

      for (const taxe of taxesApplicables) {
        const resultat = await this.calculerTaxe({
          montantBase,
          typeTaxe: taxe.typeTaxe,
          configurationTaxe: taxe,
          dateOperation
        });

        resultats.push(resultat);
        totalTaxes += resultat.montantTaxe;
        toutesEcritures.push(...resultat.ecrituresComptables);
      }

      return {
        montantHT: montantBase,
        montantTTC: montantBase + totalTaxes,
        taxes: resultats,
        totalTaxes,
        ecrituresComptables: toutesEcritures
      };

    } catch (error) {
      console.error('Erreur calculerTaxesOperation:', error);
      throw error;
    }
  }

  // Statistiques fiscales
  async getStatistiquesFiscales(entrepriseId: string, periode: string): Promise<StatistiquesFiscales> {
    try {
      const response = await fetch(`${this.baseUrl}/entreprises/${entrepriseId}/statistiques?periode=${periode}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
      return await response.json();
    } catch (error) {
      console.error('Erreur getStatistiquesFiscales:', error);
      throw error;
    }
  }

  // Configuration prédéfinie par pays
  async getConfigurationPredefinitie(pays: string): Promise<Partial<ConfigurationTaxeFiscale>[]> {
    switch (pays.toUpperCase()) {
      case 'BF':
        return CONFIGURATION_FISCALE_BURKINA_FASO;
      case 'CI':
        return this.getConfigurationCoteIvoire();
      case 'SN':
        return this.getConfigurationSenegal();
      default:
        return CONFIGURATION_FISCALE_BURKINA_FASO; // Par défaut
    }
  }

  private getConfigurationCoteIvoire(): Partial<ConfigurationTaxeFiscale>[] {
    return [
      {
        typeTaxe: TypeTaxe.TVA,
        natureTaxe: NatureTaxe.COLLECTEE,
        libelle: 'TVA Collectée (18%)',
        taux: 18,
        compteCollecte: '4432'
      },
      // Ajouter les autres taxes spécifiques à la Côte d'Ivoire
    ];
  }

  private getConfigurationSenegal(): Partial<ConfigurationTaxeFiscale>[] {
    return [
      {
        typeTaxe: TypeTaxe.TVA,
        natureTaxe: NatureTaxe.COLLECTEE,
        libelle: 'TVA Collectée (18%)',
        taux: 18,
        compteCollecte: '4432'
      },
      // Ajouter les autres taxes spécifiques au Sénégal
    ];
  }

  // Initialiser la configuration fiscale pour une nouvelle entreprise
  async initialiserConfigurationEntreprise(
    entrepriseId: string,
    pays: string,
    regimeFiscal: string
  ): Promise<ConfigurationFiscaleEntreprise> {
    try {
      const taxesPredefinies = await this.getConfigurationPredefinitie(pays);
      
      const configurationComplete: Omit<ConfigurationFiscaleEntreprise, 'id' | 'dateCreation' | 'dateMiseAJour'> = {
        entrepriseId,
        nomEntreprise: '', // À compléter
        pays,
        regimeFiscal: regimeFiscal as any,
        dateCreationFiscale: new Date().toISOString(),
        taxes: taxesPredefinies.map((taxe, index) => ({
          ...taxe,
          id: `tax_${index + 1}`,
          entrepriseId,
          dateCreation: new Date().toISOString(),
          dateMiseAJour: new Date().toISOString(),
          creeParUserId: 'system'
        })) as ConfigurationTaxeFiscale[],
        arrondissement: 'STANDARD' as any,
        deviseParDefaut: 'XOF',
        precisonDecimale: 2,
        controlesCohérence: [],
        alertesActivees: true,
        seuilsAlertes: [],
        automatisationEcritures: true,
        version: '1.0',
        statut: 'ACTIF' as any
      };

      return await this.createConfigurationFiscale(configurationComplete);
    } catch (error) {
      console.error('Erreur initialiserConfigurationEntreprise:', error);
      throw error;
    }
  }

  // Validation de la configuration
  validateConfigurationTaxe(taxe: Partial<ConfigurationTaxeFiscale>): string[] {
    const erreurs: string[] = [];

    if (!taxe.libelle || taxe.libelle.trim().length === 0) {
      erreurs.push('Le libellé de la taxe est obligatoire');
    }

    if (!taxe.typeTaxe) {
      erreurs.push('Le type de taxe est obligatoire');
    }

    if (!taxe.natureTaxe) {
      erreurs.push('La nature de la taxe est obligatoire');
    }

    if (!taxe.modeCalcul) {
      erreurs.push('Le mode de calcul est obligatoire');
    }

    if (taxe.modeCalcul === ModeCalculTaxe.POURCENTAGE && (taxe.taux === undefined || taxe.taux < 0)) {
      erreurs.push('Le taux doit être défini et positif pour le mode pourcentage');
    }

    if (taxe.modeCalcul === ModeCalculTaxe.MONTANT_FIXE && (taxe.montantFixe === undefined || taxe.montantFixe <= 0)) {
      erreurs.push('Le montant fixe doit être défini et positif');
    }

    if (taxe.modeCalcul === ModeCalculTaxe.BAREME && (!taxe.bareme || taxe.bareme.length === 0)) {
      erreurs.push('Le barème doit être défini pour le mode barème');
    }

    // Validation des comptes comptables selon la nature
    switch (taxe.natureTaxe) {
      case NatureTaxe.COLLECTEE:
        if (!taxe.compteCollecte) {
          erreurs.push('Le compte de collecte est obligatoire pour une taxe collectée');
        }
        break;
      case NatureTaxe.DEDUCTIBLE:
        if (!taxe.compteDeduction) {
          erreurs.push('Le compte de déduction est obligatoire pour une taxe déductible');
        }
        break;
      case NatureTaxe.A_PAYER:
      case NatureTaxe.COTISATION:
        if (!taxe.compteDette) {
          erreurs.push('Le compte de dette est obligatoire pour une taxe à payer');
        }
        break;
    }

    return erreurs;
  }

  // Export de la configuration
  async exporterConfiguration(entrepriseId: string, format: 'json' | 'excel'): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/entreprises/${entrepriseId}/export?format=${format}`);
      if (!response.ok) throw new Error('Erreur lors de l\'export');
      return await response.blob();
    } catch (error) {
      console.error('Erreur exporterConfiguration:', error);
      throw error;
    }
  }

  // Import de configuration
  async importerConfiguration(entrepriseId: string, file: File): Promise<ConfigurationFiscaleEntreprise> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/entreprises/${entrepriseId}/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erreur lors de l\'import');
      return await response.json();
    } catch (error) {
      console.error('Erreur importerConfiguration:', error);
      throw error;
    }
  }
}