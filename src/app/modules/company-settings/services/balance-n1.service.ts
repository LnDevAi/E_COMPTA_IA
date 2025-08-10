import { 
  BalanceN1,
  LigneBalanceN1,
  ReportNouveau,
  EcritureReportNouveau,
  ResultatImportBalance,
  MethodeCreationBalance,
  StatutBalance,
  TypeCompteBalance,
  TypeCompteRAN,
  AnomalieBalance,
  TypeAnomalieBalance,
  NiveauAnomalieBalance,
  TotauxControleBalance,
  ConfigurationBalanceEntreprise,
  CLASSES_COMPTES_BILAN,
  CLASSES_COMPTES_GESTION
} from '../models/balance-n1.model';

export class BalanceN1Service {
  private static instance: BalanceN1Service;
  private baseUrl = '/api/balance-n1';

  static getInstance(): BalanceN1Service {
    if (!BalanceN1Service.instance) {
      BalanceN1Service.instance = new BalanceN1Service();
    }
    return BalanceN1Service.instance;
  }

  // Gestion des balances N-1
  async getBalancesByEntreprise(entrepriseId: string): Promise<BalanceN1[]> {
    try {
      const response = await fetch(`${this.baseUrl}/entreprises/${entrepriseId}/balances`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des balances');
      return await response.json();
    } catch (error) {
      console.error('Erreur getBalancesByEntreprise:', error);
      throw error;
    }
  }

  async getBalanceById(balanceId: string): Promise<BalanceN1> {
    try {
      const response = await fetch(`${this.baseUrl}/balances/${balanceId}`);
      if (!response.ok) throw new Error('Balance non trouvée');
      return await response.json();
    } catch (error) {
      console.error('Erreur getBalanceById:', error);
      throw error;
    }
  }

  async createBalance(entrepriseId: string, exerciceN1: string, exerciceActuel: string): Promise<BalanceN1> {
    try {
      const balanceData = {
        entrepriseId,
        exerciceN1,
        exerciceActuel,
        methodeCreation: MethodeCreationBalance.SAISIE_MANUELLE,
        statut: StatutBalance.BROUILLON,
        valide: false,
        lignesBalance: [],
        totauxControle: this.initializerTotauxControle(),
        anomalies: [],
        dateCreation: new Date().toISOString(),
        dateMiseAJour: new Date().toISOString()
      };

      const response = await fetch(`${this.baseUrl}/entreprises/${entrepriseId}/balances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(balanceData),
      });

      if (!response.ok) throw new Error('Erreur lors de la création de la balance');
      return await response.json();
    } catch (error) {
      console.error('Erreur createBalance:', error);
      throw error;
    }
  }

  // Upload de fichier balance
  async uploadBalanceFile(
    entrepriseId: string,
    exerciceN1: string,
    exerciceActuel: string,
    file: File,
    mappingColonnes: any
  ): Promise<ResultatImportBalance> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entrepriseId', entrepriseId);
      formData.append('exerciceN1', exerciceN1);
      formData.append('exerciceActuel', exerciceActuel);
      formData.append('mappingColonnes', JSON.stringify(mappingColonnes));

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erreur lors de l\'upload du fichier');
      return await response.json();
    } catch (error) {
      console.error('Erreur uploadBalanceFile:', error);
      // Fallback : traitement côté client
      return await this.parseFileLocal(file, entrepriseId, exerciceN1, exerciceActuel, mappingColonnes);
    }
  }

  // Parsing local du fichier (fallback)
  private async parseFileLocal(
    file: File,
    entrepriseId: string,
    exerciceN1: string,
    exerciceActuel: string,
    mappingColonnes: any
  ): Promise<ResultatImportBalance> {
    const startTime = Date.now();
    
    try {
      let lignesBalance: LigneBalanceN1[] = [];
      let erreursRencontrees: string[] = [];
      let lignesTraitees = 0;
      let lignesImportees = 0;

      if (file.type.includes('csv')) {
        const content = await file.text();
        const lines = content.split('\n');
        
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            lignesTraitees++;
            try {
              const colonnes = line.split(',');
              const ligneParsee = this.parseLineCSV(colonnes, mappingColonnes, i + 1);
              if (ligneParsee) {
                lignesBalance.push(ligneParsee);
                lignesImportees++;
              }
            } catch (error) {
              erreursRencontrees.push(`Ligne ${i + 1}: ${error}`);
            }
          }
        }
      } else {
        // Pour Excel, on simulerait avec une librairie comme xlsx
        erreursRencontrees.push('Format Excel non supporté en mode local');
      }

      // Créer la balance
      const balance: BalanceN1 = {
        id: `balance_${Date.now()}`,
        entrepriseId,
        exerciceN1,
        exerciceActuel,
        methodeCreation: MethodeCreationBalance.UPLOAD_FICHIER,
        statut: StatutBalance.COMPLETE,
        valide: false,
        lignesBalance,
        totauxControle: this.calculerTotauxControle(lignesBalance),
        anomalies: this.detecterAnomalies(lignesBalance),
        dateCreation: new Date().toISOString(),
        dateMiseAJour: new Date().toISOString(),
        creeParUserId: 'current_user',
        fichierOriginal: {
          nomFichier: file.name,
          tailleFichier: file.size,
          typeFile: file.type.includes('csv') ? 'csv' : 'xlsx',
          dateUpload: new Date().toISOString(),
          cheminFichier: '',
          ligneEntete: 1,
          premiereLineeDonnees: 2,
          mappingColonnes,
          lignesLues: lignesTraitees,
          lignesValides: lignesImportees,
          lignesErreur: erreursRencontrees.length,
          erreursDetectees: erreursRencontrees
        }
      };

      // Générer automatiquement le report à nouveau
      const reportNouveau = this.genererReportNouveauAutomatique(balance);
      balance.reportNouveau = reportNouveau;

      const tempsTraitement = (Date.now() - startTime) / 1000;

      return {
        succes: erreursRencontrees.length === 0,
        balanceId: balance.id,
        lignesTraitees,
        lignesImportees,
        lignesIgnorees: lignesTraitees - lignesImportees,
        erreursRencontrees,
        anomalies: balance.anomalies,
        reportNouveauGenere: !!reportNouveau,
        reportNouveauId: reportNouveau?.id,
        tempsTraitement,
        recommandations: this.genererRecommandations(balance)
      };

    } catch (error) {
      console.error('Erreur parseFileLocal:', error);
      return {
        succes: false,
        lignesTraitees: 0,
        lignesImportees: 0,
        lignesIgnorees: 0,
        erreursRencontrees: [`Erreur générale: ${error}`],
        anomalies: [],
        reportNouveauGenere: false,
        tempsTraitement: (Date.now() - startTime) / 1000,
        recommandations: []
      };
    }
  }

  private parseLineCSV(colonnes: string[], mapping: any, numeroLigne: number): LigneBalanceN1 | null {
    try {
      const numeroCompte = colonnes[mapping.numeroCompte]?.trim();
      const intituleCompte = colonnes[mapping.intituleCompte]?.trim();

      if (!numeroCompte || !intituleCompte) {
        throw new Error('Numéro de compte et intitulé obligatoires');
      }

      // Validation du numéro de compte
      if (!/^[1-8][0-9]{5,7}$/.test(numeroCompte)) {
        throw new Error('Format de numéro de compte invalide');
      }

      const ligne: LigneBalanceN1 = {
        id: `ligne_${numeroLigne}_${Date.now()}`,
        balanceId: '',
        numeroCompte,
        intituleCompte,
        classeCompte: numeroCompte.charAt(0),
        soldeDebitOuverture: this.parseNumber(colonnes[mapping.soldeDebitOuverture]),
        soldeCreditOuverture: this.parseNumber(colonnes[mapping.soldeCreditOuverture]),
        mouvementDebit: this.parseNumber(colonnes[mapping.mouvementDebit]),
        mouvementCredit: this.parseNumber(colonnes[mapping.mouvementCredit]),
        soldeDebitFinal: this.parseNumber(colonnes[mapping.soldeDebitFinal]),
        soldeCreditFinal: this.parseNumber(colonnes[mapping.soldeCreditFinal]),
        typeCompte: this.determinerTypeCompte(numeroCompte),
        actif: true,
        ordre: numeroLigne,
        controleOk: true,
        dateCreation: new Date().toISOString(),
        dateMiseAJour: new Date().toISOString()
      };

      // Vérification de cohérence
      if (!this.verifierCoherenceCalcul(ligne)) {
        ligne.controleOk = false;
        ligne.messageErreur = 'Incohérence dans les calculs de soldes';
      }

      return ligne;
    } catch (error) {
      throw new Error(`Erreur parsing ligne: ${error}`);
    }
  }

  private parseNumber(value: string): number {
    if (!value || value.trim() === '') return 0;
    const parsed = parseFloat(value.replace(/[,\s]/g, ''));
    return isNaN(parsed) ? 0 : Math.abs(parsed); // Toujours en valeur absolue
  }

  // Génération automatique du Report à Nouveau
  async genererReportNouveau(balanceId: string): Promise<ReportNouveau> {
    try {
      const response = await fetch(`${this.baseUrl}/balances/${balanceId}/report-nouveau`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur lors de la génération du RAN');
      return await response.json();
    } catch (error) {
      console.error('Erreur genererReportNouveau:', error);
      // Fallback : génération locale
      const balance = await this.getBalanceById(balanceId);
      return this.genererReportNouveauAutomatique(balance);
    }
  }

  // Génération automatique locale du Report à Nouveau
  private genererReportNouveauAutomatique(balance: BalanceN1): ReportNouveau {
    const ecrituresRAN: EcritureReportNouveau[] = [];
    let totalDebit = 0;
    let totalCredit = 0;
    let ordre = 1;

    // Traiter chaque ligne de la balance
    for (const ligne of balance.lignesBalance) {
      // Seuls les comptes de bilan (classes 1-5) sont reportés
      if (CLASSES_COMPTES_BILAN.includes(ligne.classeCompte)) {
        const soldeDebitFinal = ligne.soldeDebitFinal || 0;
        const soldeCreditFinal = ligne.soldeCreditFinal || 0;

        // Créer l'écriture RAN si le compte a un solde
        if (soldeDebitFinal > 0 || soldeCreditFinal > 0) {
          const ecriture: EcritureReportNouveau = {
            id: `ran_${ligne.id}`,
            reportNouveauId: '',
            numeroCompte: ligne.numeroCompte,
            intituleCompte: ligne.intituleCompte,
            montantDebit: soldeDebitFinal,
            montantCredit: soldeCreditFinal,
            libelle: `Report à nouveau ${balance.exerciceN1} - ${ligne.intituleCompte}`,
            classeCompte: ligne.classeCompte,
            typeCompte: this.determinerTypeCompteRAN(ligne.numeroCompte),
            soldeOrigineFinal: Math.max(soldeDebitFinal, soldeCreditFinal),
            sensOrigineFinal: soldeDebitFinal > 0 ? 'DEBIT' : 'CREDIT',
            ordre: ordre++,
            actif: true
          };

          ecrituresRAN.push(ecriture);
          totalDebit += soldeDebitFinal;
          totalCredit += soldeCreditFinal;
        }
      }
    }

    // Calculer le résultat N-1 et l'ajouter si nécessaire
    const resultatN1 = this.calculerResultatN1(balance);
    if (resultatN1 !== 0) {
      const ecritureResultat: EcritureReportNouveau = {
        id: `ran_resultat_${Date.now()}`,
        reportNouveauId: '',
        numeroCompte: '110000', // Compte de résultat reporté
        intituleCompte: 'Résultat reporté',
        montantDebit: resultatN1 < 0 ? Math.abs(resultatN1) : 0,
        montantCredit: resultatN1 > 0 ? resultatN1 : 0,
        libelle: `Report résultat ${balance.exerciceN1}`,
        classeCompte: '1',
        typeCompte: TypeCompteRAN.RESULTAT_REPORTE,
        soldeOrigineFinal: Math.abs(resultatN1),
        sensOrigineFinal: resultatN1 > 0 ? 'CREDIT' : 'DEBIT',
        ordre: ordre++,
        actif: true
      };

      ecrituresRAN.push(ecritureResultat);
      if (resultatN1 < 0) {
        totalDebit += Math.abs(resultatN1);
      } else {
        totalCredit += resultatN1;
      }
    }

    const reportNouveau: ReportNouveau = {
      id: `ran_${balance.id}`,
      balanceId: balance.id,
      entrepriseId: balance.entrepriseId,
      exerciceOrigine: balance.exerciceN1,
      exerciceDestination: balance.exerciceActuel,
      dateGeneration: new Date().toISOString(),
      genereParUserId: 'current_user',
      methodeGeneration: 'AUTO_BALANCE_N1' as any,
      ecrituresRAN,
      totalDebit,
      totalCredit,
      equilibre: Math.abs(totalDebit - totalCredit) < 0.01, // Tolérance de 1 centime
      statut: 'GENERE' as any,
      journalRAN: 'RAN',
      valide: false,
      commentaires: `Report à nouveau généré automatiquement depuis la balance ${balance.exerciceN1}`
    };

    return reportNouveau;
  }

  // Calcul du résultat N-1 (comptes de gestion)
  private calculerResultatN1(balance: BalanceN1): number {
    let totalProduits = 0;
    let totalCharges = 0;

    for (const ligne of balance.lignesBalance) {
      if (ligne.classeCompte === '6') { // Charges
        totalCharges += (ligne.soldeDebitFinal || 0) - (ligne.soldeCreditFinal || 0);
      } else if (ligne.classeCompte === '7') { // Produits
        totalProduits += (ligne.soldeCreditFinal || 0) - (ligne.soldeDebitFinal || 0);
      }
    }

    return totalProduits - totalCharges; // Résultat = Produits - Charges
  }

  // Utilitaires de calcul et validation
  private calculerTotauxControle(lignes: LigneBalanceN1[]): TotauxControleBalance {
    let totalSoldeDebitOuverture = 0;
    let totalSoldeCreditOuverture = 0;
    let totalMouvementDebit = 0;
    let totalMouvementCredit = 0;
    let totalSoldeDebitFinal = 0;
    let totalSoldeCreditFinal = 0;

    let nombreComptesActifs = 0;
    let nombreComptesPassifs = 0;
    let nombreComptesCharges = 0;
    let nombreComptesProduits = 0;

    for (const ligne of lignes) {
      totalSoldeDebitOuverture += ligne.soldeDebitOuverture;
      totalSoldeCreditOuverture += ligne.soldeCreditOuverture;
      totalMouvementDebit += ligne.mouvementDebit;
      totalMouvementCredit += ligne.mouvementCredit;
      totalSoldeDebitFinal += ligne.soldeDebitFinal;
      totalSoldeCreditFinal += ligne.soldeCreditFinal;

      // Classification des comptes
      switch (ligne.typeCompte) {
        case TypeCompteBalance.ACTIF:
          nombreComptesActifs++;
          break;
        case TypeCompteBalance.PASSIF:
          nombreComptesPassifs++;
          break;
        case TypeCompteBalance.CHARGE:
          nombreComptesCharges++;
          break;
        case TypeCompteBalance.PRODUIT:
          nombreComptesProduits++;
          break;
      }
    }

    return {
      totalSoldeDebitOuverture,
      totalSoldeCreditOuverture,
      totalMouvementDebit,
      totalMouvementCredit,
      totalSoldeDebitFinal,
      totalSoldeCreditFinal,
      equilibreOuverture: Math.abs(totalSoldeDebitOuverture - totalSoldeCreditOuverture) < 0.01,
      equilibreMouvements: Math.abs(totalMouvementDebit - totalMouvementCredit) < 0.01,
      equilibreFinal: Math.abs(totalSoldeDebitFinal - totalSoldeCreditFinal) < 0.01,
      equilibreGeneral: Math.abs(totalSoldeDebitFinal - totalSoldeCreditFinal) < 0.01,
      coherenceCalcul: true, // À calculer plus finement
      nombreComptes: lignes.length,
      nombreComptesActifs,
      nombreComptesPassifs,
      nombreComptesCharges,
      nombreComptesProduits
    };
  }

  private verifierCoherenceCalcul(ligne: LigneBalanceN1): boolean {
    // Vérification : Solde ouverture + Mouvements = Solde final
    const soldeOuvertureNet = ligne.soldeDebitOuverture - ligne.soldeCreditOuverture;
    const mouvementNet = ligne.mouvementDebit - ligne.mouvementCredit;
    const soldeFinalNet = ligne.soldeDebitFinal - ligne.soldeCreditFinal;
    
    const calculFinal = soldeOuvertureNet + mouvementNet;
    
    return Math.abs(calculFinal - soldeFinalNet) < 0.01; // Tolérance 1 centime
  }

  private detecterAnomalies(lignes: LigneBalanceN1[]): AnomalieBalance[] {
    const anomalies: AnomalieBalance[] = [];

    // Vérifier les doublons de comptes
    const comptesVus = new Set<string>();
    for (const ligne of lignes) {
      if (comptesVus.has(ligne.numeroCompte)) {
        anomalies.push({
          id: `anom_${Date.now()}_${ligne.id}`,
          balanceId: '',
          ligneId: ligne.id,
          typeAnomalie: TypeAnomalieBalance.DOUBLON_COMPTE,
          niveau: NiveauAnomalieBalance.ERREUR,
          titre: 'Compte en doublon',
          description: `Le compte ${ligne.numeroCompte} apparaît plusieurs fois`,
          resolue: false,
          dateDetection: new Date().toISOString()
        });
      }
      comptesVus.add(ligne.numeroCompte);

      // Vérifier la cohérence des calculs
      if (!this.verifierCoherenceCalcul(ligne)) {
        anomalies.push({
          id: `anom_${Date.now()}_${ligne.id}`,
          balanceId: '',
          ligneId: ligne.id,
          typeAnomalie: TypeAnomalieBalance.COHERENCE_CALCUL,
          niveau: NiveauAnomalieBalance.ERREUR,
          titre: 'Incohérence de calcul',
          description: `Les soldes ne correspondent pas aux mouvements pour le compte ${ligne.numeroCompte}`,
          resolue: false,
          dateDetection: new Date().toISOString()
        });
      }

      // Vérifier les montants aberrants
      const montants = [
        ligne.soldeDebitOuverture,
        ligne.soldeCreditOuverture,
        ligne.mouvementDebit,
        ligne.mouvementCredit,
        ligne.soldeDebitFinal,
        ligne.soldeCreditFinal
      ];

      if (montants.some(m => m > 999999999999)) { // Plus de 1000 milliards
        anomalies.push({
          id: `anom_${Date.now()}_${ligne.id}`,
          balanceId: '',
          ligneId: ligne.id,
          typeAnomalie: TypeAnomalieBalance.MONTANT_ABERRANT,
          niveau: NiveauAnomalieBalance.AVERTISSEMENT,
          titre: 'Montant très élevé',
          description: `Montant potentiellement aberrant pour le compte ${ligne.numeroCompte}`,
          resolue: false,
          dateDetection: new Date().toISOString()
        });
      }
    }

    return anomalies;
  }

  private determinerTypeCompte(numeroCompte: string): TypeCompteBalance {
    const classe = numeroCompte.charAt(0);
    
    switch (classe) {
      case '1':
      case '2':
      case '3':
        return TypeCompteBalance.ACTIF;
      case '4':
      case '5':
        return numeroCompte.startsWith('5') ? TypeCompteBalance.ACTIF : TypeCompteBalance.PASSIF;
      case '6':
        return TypeCompteBalance.CHARGE;
      case '7':
        return TypeCompteBalance.PRODUIT;
      case '8':
        return TypeCompteBalance.RESULTAT;
      default:
        return TypeCompteBalance.AUTRE;
    }
  }

  private determinerTypeCompteRAN(numeroCompte: string): TypeCompteRAN {
    const classe = numeroCompte.charAt(0);
    
    if (['1', '2', '3'].includes(classe)) {
      return TypeCompteRAN.BILAN_ACTIF;
    } else if (['4', '5'].includes(classe)) {
      return numeroCompte.startsWith('5') ? TypeCompteRAN.BILAN_ACTIF : TypeCompteRAN.BILAN_PASSIF;
    } else {
      return TypeCompteRAN.RESULTAT_REPORTE;
    }
  }

  private initializerTotauxControle(): TotauxControleBalance {
    return {
      totalSoldeDebitOuverture: 0,
      totalSoldeCreditOuverture: 0,
      totalMouvementDebit: 0,
      totalMouvementCredit: 0,
      totalSoldeDebitFinal: 0,
      totalSoldeCreditFinal: 0,
      equilibreOuverture: true,
      equilibreMouvements: true,
      equilibreFinal: true,
      equilibreGeneral: true,
      coherenceCalcul: true,
      nombreComptes: 0,
      nombreComptesActifs: 0,
      nombreComptesPassifs: 0,
      nombreComptesCharges: 0,
      nombreComptesProduits: 0
    };
  }

  private genererRecommandations(balance: BalanceN1): string[] {
    const recommandations: string[] = [];

    if (balance.anomalies.length > 0) {
      recommandations.push('Corrigez les anomalies détectées avant validation');
    }

    if (!balance.totauxControle.equilibreGeneral) {
      recommandations.push('Vérifiez l\'équilibre général de la balance');
    }

    if (balance.lignesBalance.length === 0) {
      recommandations.push('La balance ne contient aucune ligne de compte');
    }

    const comptesResultat = balance.lignesBalance.filter(l => 
      l.classeCompte === '6' || l.classeCompte === '7'
    );
    
    if (comptesResultat.length === 0) {
      recommandations.push('Aucun compte de gestion détecté - vérifiez la complétude');
    }

    return recommandations;
  }

  // Validation et finalisation
  async validerBalance(balanceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/balances/${balanceId}/valider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur lors de la validation');
      return true;
    } catch (error) {
      console.error('Erreur validerBalance:', error);
      throw error;
    }
  }

  async comptabiliserReportNouveau(reportNouveauId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/report-nouveau/${reportNouveauId}/comptabiliser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur lors de la comptabilisation');
      return true;
    } catch (error) {
      console.error('Erreur comptabiliserReportNouveau:', error);
      throw error;
    }
  }

  // Téléchargement du template
  async telechargerTemplate(): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/template/download`);
      if (!response.ok) throw new Error('Erreur lors du téléchargement du template');
      return await response.blob();
    } catch (error) {
      console.error('Erreur telechargerTemplate:', error);
      throw error;
    }
  }

  // Génération d'un template Excel
  generateTemplateExcel(): Blob {
    // Simulation de génération d'un fichier Excel
    const csvContent = [
      'N° Compte,Intitulé du Compte,Solde Débit Ouverture,Solde Crédit Ouverture,Mouvement Débit,Mouvement Crédit,Solde Débit Final,Solde Crédit Final',
      '101000,Capital social,0,1000000,0,0,0,1000000',
      '401100,Fournisseurs,0,500000,200000,300000,0,600000',
      '411100,Clients,800000,0,400000,300000,900000,0',
      '601100,Achats de marchandises,300000,0,500000,0,800000,0',
      '701100,Ventes de marchandises,0,1200000,0,800000,0,2000000'
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }

  // Export de la balance
  async exporterBalance(balanceId: string, format: 'excel' | 'pdf' | 'csv'): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/balances/${balanceId}/export?format=${format}`);
      if (!response.ok) throw new Error('Erreur lors de l\'export');
      return await response.blob();
    } catch (error) {
      console.error('Erreur exporterBalance:', error);
      throw error;
    }
  }
}