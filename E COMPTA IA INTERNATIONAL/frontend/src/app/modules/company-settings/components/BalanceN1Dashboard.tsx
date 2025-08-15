'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DownloadIcon,
  ArrowRightIcon,
  CalculatorIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

import { 
  BalanceN1,
  LigneBalanceN1,
  ReportNouveau,
  EcritureReportNouveau,
  ResultatImportBalance,
  StatutBalance,
  TypeCompteBalance,
  AnomalieBalance,
  NiveauAnomalieBalance,
  TEMPLATE_BALANCE_STANDARD
} from '../models/balance-n1.model';

export default function BalanceN1Dashboard() {
  const [balances, setBalances] = useState<BalanceN1[]>([]);
  const [selectedBalance, setSelectedBalance] = useState<BalanceN1 | null>(null);
  const [reportNouveau, setReportNouveau] = useState<ReportNouveau | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSaisieModal, setShowSaisieModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paramètres d'upload
  const [exerciceN1, setExerciceN1] = useState('2023');
  const [exerciceActuel, setExerciceActuel] = useState('2024');
  const [mappingColonnes, setMappingColonnes] = useState({
    numeroCompte: 0,
    intituleCompte: 1,
    soldeDebitOuverture: 2,
    soldeCreditOuverture: 3,
    mouvementDebit: 4,
    mouvementCredit: 5,
    soldeDebitFinal: 6,
    soldeCreditFinal: 7
  });

  useEffect(() => {
    // Simulation des données
    const balanceSimulee: BalanceN1 = {
      id: 'balance_2023',
      entrepriseId: 'entreprise_1',
      exerciceN1: '2023',
      exerciceActuel: '2024',
      dateCreation: '2024-01-15T10:00:00',
      dateMiseAJour: '2024-01-15T10:30:00',
      methodeCreation: 'UPLOAD_FICHIER' as any,
      statut: StatutBalance.VALIDEE,
      valide: true,
      dateValidation: '2024-01-15T11:00:00',
      validateurUserId: 'user_1',
      lignesBalance: [
        {
          id: 'ligne_1',
          balanceId: 'balance_2023',
          numeroCompte: '101000',
          intituleCompte: 'Capital social',
          classeCompte: '1',
          soldeDebitOuverture: 0,
          soldeCreditOuverture: 1000000,
          mouvementDebit: 0,
          mouvementCredit: 0,
          soldeDebitFinal: 0,
          soldeCreditFinal: 1000000,
          typeCompte: TypeCompteBalance.PASSIF,
          actif: true,
          ordre: 1,
          controleOk: true,
          dateCreation: '2024-01-15T10:00:00',
          dateMiseAJour: '2024-01-15T10:00:00'
        },
        {
          id: 'ligne_2',
          balanceId: 'balance_2023',
          numeroCompte: '411100',
          intituleCompte: 'Clients',
          classeCompte: '4',
          soldeDebitOuverture: 500000,
          soldeCreditOuverture: 0,
          mouvementDebit: 800000,
          mouvementCredit: 600000,
          soldeDebitFinal: 700000,
          soldeCreditFinal: 0,
          typeCompte: TypeCompteBalance.ACTIF,
          actif: true,
          ordre: 2,
          controleOk: true,
          dateCreation: '2024-01-15T10:00:00',
          dateMiseAJour: '2024-01-15T10:00:00'
        },
        {
          id: 'ligne_3',
          balanceId: 'balance_2023',
          numeroCompte: '401100',
          intituleCompte: 'Fournisseurs',
          classeCompte: '4',
          soldeDebitOuverture: 0,
          soldeCreditOuverture: 300000,
          mouvementDebit: 250000,
          mouvementCredit: 150000,
          soldeDebitFinal: 0,
          soldeCreditFinal: 200000,
          typeCompte: TypeCompteBalance.PASSIF,
          actif: true,
          ordre: 3,
          controleOk: true,
          dateCreation: '2024-01-15T10:00:00',
          dateMiseAJour: '2024-01-15T10:00:00'
        },
        {
          id: 'ligne_4',
          balanceId: 'balance_2023',
          numeroCompte: '601100',
          intituleCompte: 'Achats de marchandises',
          classeCompte: '6',
          soldeDebitOuverture: 0,
          soldeCreditOuverture: 0,
          mouvementDebit: 2500000,
          mouvementCredit: 0,
          soldeDebitFinal: 2500000,
          soldeCreditFinal: 0,
          typeCompte: TypeCompteBalance.CHARGE,
          actif: true,
          ordre: 4,
          controleOk: true,
          dateCreation: '2024-01-15T10:00:00',
          dateMiseAJour: '2024-01-15T10:00:00'
        },
        {
          id: 'ligne_5',
          balanceId: 'balance_2023',
          numeroCompte: '701100',
          intituleCompte: 'Ventes de marchandises',
          classeCompte: '7',
          soldeDebitOuverture: 0,
          soldeCreditOuverture: 0,
          mouvementDebit: 0,
          mouvementCredit: 3200000,
          soldeDebitFinal: 0,
          soldeCreditFinal: 3200000,
          typeCompte: TypeCompteBalance.PRODUIT,
          actif: true,
          ordre: 5,
          controleOk: true,
          dateCreation: '2024-01-15T10:00:00',
          dateMiseAJour: '2024-01-15T10:00:00'
        }
      ],
      totauxControle: {
        totalSoldeDebitOuverture: 500000,
        totalSoldeCreditOuverture: 1300000,
        totalMouvementDebit: 3550000,
        totalMouvementCredit: 750000,
        totalSoldeDebitFinal: 3200000,
        totalSoldeCreditFinal: 4400000,
        equilibreOuverture: false,
        equilibreMouvements: false,
        equilibreFinal: false,
        equilibreGeneral: true,
        coherenceCalcul: true,
        nombreComptes: 5,
        nombreComptesActifs: 1,
        nombreComptesPassifs: 2,
        nombreComptesCharges: 1,
        nombreComptesProduits: 1
      },
      anomalies: [],
      creeParUserId: 'user_1',
      commentaires: 'Balance N-1 importée depuis fichier Excel',
      fichierOriginal: {
        nomFichier: 'balance_2023.xlsx',
        tailleFichier: 25600,
        typeFile: 'xlsx',
        dateUpload: '2024-01-15T10:00:00',
        cheminFichier: '/uploads/balance_2023.xlsx',
        ligneEntete: 1,
        premiereLineeDonnees: 2,
        mappingColonnes,
        lignesLues: 5,
        lignesValides: 5,
        lignesErreur: 0,
        erreursDetectees: []
      }
    };

    // Report à nouveau simulé
    const reportNouveauSimule: ReportNouveau = {
      id: 'ran_2023',
      balanceId: 'balance_2023',
      entrepriseId: 'entreprise_1',
      exerciceOrigine: '2023',
      exerciceDestination: '2024',
      dateGeneration: '2024-01-15T11:00:00',
      genereParUserId: 'user_1',
      methodeGeneration: 'AUTO_BALANCE_N1' as any,
      ecrituresRAN: [
        {
          id: 'ran_1',
          reportNouveauId: 'ran_2023',
          numeroCompte: '101000',
          intituleCompte: 'Capital social',
          montantDebit: 0,
          montantCredit: 1000000,
          libelle: 'Report à nouveau 2023 - Capital social',
          classeCompte: '1',
          typeCompte: 'BILAN_PASSIF' as any,
          soldeOrigineFinal: 1000000,
          sensOrigineFinal: 'CREDIT',
          ordre: 1,
          actif: true
        },
        {
          id: 'ran_2',
          reportNouveauId: 'ran_2023',
          numeroCompte: '411100',
          intituleCompte: 'Clients',
          montantDebit: 700000,
          montantCredit: 0,
          libelle: 'Report à nouveau 2023 - Clients',
          classeCompte: '4',
          typeCompte: 'BILAN_ACTIF' as any,
          soldeOrigineFinal: 700000,
          sensOrigineFinal: 'DEBIT',
          ordre: 2,
          actif: true
        },
        {
          id: 'ran_3',
          reportNouveauId: 'ran_2023',
          numeroCompte: '401100',
          intituleCompte: 'Fournisseurs',
          montantDebit: 0,
          montantCredit: 200000,
          libelle: 'Report à nouveau 2023 - Fournisseurs',
          classeCompte: '4',
          typeCompte: 'BILAN_PASSIF' as any,
          soldeOrigineFinal: 200000,
          sensOrigineFinal: 'CREDIT',
          ordre: 3,
          actif: true
        },
        {
          id: 'ran_4',
          reportNouveauId: 'ran_2023',
          numeroCompte: '110000',
          intituleCompte: 'Résultat reporté',
          montantDebit: 0,
          montantCredit: 700000,
          libelle: 'Report résultat 2023',
          classeCompte: '1',
          typeCompte: 'RESULTAT_REPORTE' as any,
          soldeOrigineFinal: 700000,
          sensOrigineFinal: 'CREDIT',
          ordre: 4,
          actif: true
        }
      ],
      totalDebit: 700000,
      totalCredit: 1900000,
      equilibre: false,
      statut: 'GENERE' as any,
      journalRAN: 'RAN',
      valide: true,
      dateValidation: '2024-01-15T11:30:00',
      validateurUserId: 'user_1',
      commentaires: 'Report à nouveau généré automatiquement'
    };

    balanceSimulee.reportNouveau = reportNouveauSimule;
    setBalances([balanceSimulee]);
    setSelectedBalance(balanceSimulee);
    setReportNouveau(reportNouveauSimule);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrors([]);

    try {
      // Simulation du processus d'upload
      const intervals = [20, 40, 60, 80, 95, 100];
      for (const progress of intervals) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(progress);
      }

      // Simulation du résultat
      const resultat: ResultatImportBalance = {
        succes: true,
        balanceId: `balance_${Date.now()}`,
        lignesTraitees: 45,
        lignesImportees: 43,
        lignesIgnorees: 2,
        erreursRencontrees: [
          'Ligne 15: Numéro de compte invalide',
          'Ligne 32: Montant manquant'
        ],
        anomalies: [],
        reportNouveauGenere: true,
        reportNouveauId: `ran_${Date.now()}`,
        tempsTraitement: 2.5,
        recommandations: [
          'Vérifiez les lignes en erreur',
          'Validez le report à nouveau généré'
        ]
      };

      if (resultat.succes) {
        // Ajouter la nouvelle balance
        // setBalances(prev => [...prev, nouvelleBalance]);
        setShowUploadModal(false);
      } else {
        setErrors(resultat.erreursRencontrees);
      }

    } catch (error) {
      setErrors([`Erreur lors de l'upload: ${error}`]);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadTemplate = () => {
    // Génération du template CSV
    const csvContent = TEMPLATE_BALANCE_STANDARD.exempleData
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_balance_6_colonnes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleGenererReportNouveau = async (balanceId: string) => {
    try {
      // Simulation de la génération
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mise à jour du report à nouveau
      if (selectedBalance?.reportNouveau) {
        setReportNouveau(selectedBalance.reportNouveau);
      }
    } catch (error) {
      setErrors([`Erreur lors de la génération: ${error}`]);
    }
  };

  const formatDevise = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  const getStatutColor = (statut: StatutBalance) => {
    switch (statut) {
      case StatutBalance.VALIDEE: return 'text-green-600 bg-green-50 border-green-200';
      case StatutBalance.COMPLETE: return 'text-blue-600 bg-blue-50 border-blue-200';
      case StatutBalance.EN_COURS: return 'text-orange-600 bg-orange-50 border-orange-200';
      case StatutBalance.BROUILLON: return 'text-gray-600 bg-gray-50 border-gray-200';
      case StatutBalance.ERREUR: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAnomalieColor = (niveau: NiveauAnomalieBalance) => {
    switch (niveau) {
      case NiveauAnomalieBalance.CRITIQUE: return 'text-red-600 bg-red-50';
      case NiveauAnomalieBalance.ERREUR: return 'text-red-600 bg-red-50';
      case NiveauAnomalieBalance.AVERTISSEMENT: return 'text-orange-600 bg-orange-50';
      case NiveauAnomalieBalance.INFO: return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Balance N-1 & Report à Nouveau</h1>
          <p className="text-gray-600 mt-1">
            Gestion de la balance de l'exercice précédent et génération automatique du report à nouveau
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleDownloadTemplate}
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <DownloadIcon className="h-4 w-4" />
            <span>Template Excel</span>
          </Button>
          <Button 
            onClick={() => setShowSaisieModal(true)}
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Saisie manuelle</span>
          </Button>
          <Button 
            onClick={() => setShowUploadModal(true)} 
            className="flex items-center space-x-2"
          >
            <CloudArrowUpIcon className="h-4 w-4" />
            <span>Upload Balance</span>
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balances N-1</p>
                <p className="text-2xl font-bold text-blue-600">{balances.length}</p>
                <p className="text-xs text-gray-500 mt-1">Créées</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Validées</p>
                <p className="text-2xl font-bold text-green-600">
                  {balances.filter(b => b.valide).length}
                </p>
                <p className="text-xs text-green-600 mt-1">Prêtes</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reports RAN</p>
                <p className="text-2xl font-bold text-purple-600">
                  {balances.filter(b => b.reportNouveau).length}
                </p>
                <p className="text-xs text-purple-600 mt-1">Générés</p>
              </div>
              <ArrowRightIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anomalies</p>
                <p className="text-2xl font-bold text-orange-600">
                  {balances.reduce((sum, b) => sum + b.anomalies.length, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">À résoudre</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Erreurs */}
      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <ul className="list-disc pl-4">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload en cours */}
      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <ArrowPathIcon className="h-6 w-6 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Upload et traitement en cours...</p>
                  <Progress value={uploadProgress} className="mt-2" />
                </div>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onglets principaux */}
      <Tabs defaultValue="balances" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="balances">Balances N-1</TabsTrigger>
          <TabsTrigger value="report-nouveau">Report à Nouveau</TabsTrigger>
          <TabsTrigger value="guide">Guide d'utilisation</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-4">
          {balances.map((balance) => (
            <Card key={balance.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>Balance {balance.exerciceN1}</span>
                    <Badge className={`text-xs ${getStatutColor(balance.statut)}`}>
                      {balance.statut}
                    </Badge>
                    {balance.valide && (
                      <Badge className="text-xs text-green-600 bg-green-50 border-green-200">
                        Validée
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Voir détails
                    </Button>
                    <Button variant="outline" size="sm">
                      <DownloadIcon className="h-4 w-4 mr-1" />
                      Exporter
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Informations générales */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">📋 Informations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exercice N-1:</span>
                        <span className="font-medium">{balance.exerciceN1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exercice actuel:</span>
                        <span className="font-medium">{balance.exerciceActuel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Méthode:</span>
                        <span className="font-medium capitalize">
                          {balance.methodeCreation.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comptes:</span>
                        <span className="font-medium">{balance.lignesBalance.length}</span>
                      </div>
                      {balance.fichierOriginal && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fichier:</span>
                          <span className="font-medium text-xs">{balance.fichierOriginal.nomFichier}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Totaux de contrôle */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">💰 Totaux de Contrôle</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Soldes débit final:</span>
                        <span className="font-medium text-blue-600">
                          {formatDevise(balance.totauxControle.totalSoldeDebitFinal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Soldes crédit final:</span>
                        <span className="font-medium text-green-600">
                          {formatDevise(balance.totauxControle.totalSoldeCreditFinal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Équilibre:</span>
                        <span className={`font-medium ${balance.totauxControle.equilibreGeneral ? 'text-green-600' : 'text-red-600'}`}>
                          {balance.totauxControle.equilibreGeneral ? '✓ OK' : '✗ KO'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cohérence:</span>
                        <span className={`font-medium ${balance.totauxControle.coherenceCalcul ? 'text-green-600' : 'text-red-600'}`}>
                          {balance.totauxControle.coherenceCalcul ? '✓ OK' : '✗ KO'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Report à nouveau */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">🔄 Report à Nouveau</h4>
                    {balance.reportNouveau ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Statut:</span>
                          <Badge className="text-xs text-green-600 bg-green-50 border-green-200">
                            {balance.reportNouveau.statut}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Écritures:</span>
                          <span className="font-medium">{balance.reportNouveau.ecrituresRAN.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total débit:</span>
                          <span className="font-medium text-blue-600">
                            {formatDevise(balance.reportNouveau.totalDebit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total crédit:</span>
                          <span className="font-medium text-green-600">
                            {formatDevise(balance.reportNouveau.totalCredit)}
                          </span>
                        </div>
                        <div className="pt-2">
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleGenererReportNouveau(balance.id)}
                          >
                            <ArrowRightIcon className="h-4 w-4 mr-1" />
                            Voir RAN
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm mb-3">Pas encore généré</p>
                        <Button 
                          size="sm" 
                          onClick={() => handleGenererReportNouveau(balance.id)}
                          className="w-full"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          Générer RAN
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Anomalies */}
                {balance.anomalies.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mr-2" />
                      Anomalies détectées ({balance.anomalies.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {balance.anomalies.map((anomalie) => (
                        <div key={anomalie.id} className={`p-3 rounded-lg border ${getAnomalieColor(anomalie.niveau)}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{anomalie.titre}</span>
                            <Badge className="text-xs">
                              {anomalie.niveau}
                            </Badge>
                          </div>
                          <p className="text-xs opacity-90">{anomalie.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {balances.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune balance N-1</h3>
                  <p className="text-gray-600 mb-6">
                    Commencez par uploader ou saisir votre balance de l'exercice précédent
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => setShowUploadModal(true)}>
                      <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                      Upload fichier
                    </Button>
                    <Button variant="outline" onClick={() => setShowSaisieModal(true)}>
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Saisie manuelle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="report-nouveau" className="space-y-4">
          {reportNouveau ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowRightIcon className="h-5 w-5" />
                  <span>Report à Nouveau {reportNouveau.exerciceOrigine} → {reportNouveau.exerciceDestination}</span>
                  <Badge className="text-xs text-green-600 bg-green-50 border-green-200">
                    {reportNouveau.statut}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Résumé RAN */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Débit</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatDevise(reportNouveau.totalDebit)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Crédit</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatDevise(reportNouveau.totalCredit)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Écritures</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {reportNouveau.ecrituresRAN.length}
                    </p>
                  </div>
                </div>

                {/* Écritures RAN */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">📝 Écritures de Report à Nouveau</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Compte
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Intitulé
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Débit
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Crédit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportNouveau.ecrituresRAN.map((ecriture) => (
                          <tr key={ecriture.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-sm">{ecriture.numeroCompte}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900">{ecriture.intituleCompte}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`text-sm ${ecriture.montantDebit > 0 ? 'font-medium text-blue-600' : 'text-gray-400'}`}>
                                {ecriture.montantDebit > 0 ? formatDevise(ecriture.montantDebit) : '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`text-sm ${ecriture.montantCredit > 0 ? 'font-medium text-green-600' : 'text-gray-400'}`}>
                                {ecriture.montantCredit > 0 ? formatDevise(ecriture.montantCredit) : '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline" className="text-xs">
                                {ecriture.typeCompte.replace('_', ' ')}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={2} className="px-6 py-4 text-right font-medium text-gray-900">
                            TOTAUX:
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-blue-600">
                            {formatDevise(reportNouveau.totalDebit)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-green-600">
                            {formatDevise(reportNouveau.totalCredit)}
                          </td>
                          <td className="px-6 py-4">
                            {reportNouveau.equilibre ? (
                              <Badge className="text-xs text-green-600 bg-green-50 border-green-200">
                                Équilibré
                              </Badge>
                            ) : (
                              <Badge className="text-xs text-red-600 bg-red-50 border-red-200">
                                Déséquilibré
                              </Badge>
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="outline">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                  <Button variant="outline">
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Comptabiliser
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <ArrowRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun Report à Nouveau</h3>
                  <p className="text-gray-600 mb-6">
                    Le report à nouveau sera généré automatiquement après l'upload de votre balance N-1
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <InformationCircleIcon className="h-5 w-5" />
                <span>Guide d'utilisation - Balance N-1 & Report à Nouveau</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">🎯 Objectif</h4>
                  <p className="text-gray-600 text-sm">
                    La balance N-1 permet d'importer les soldes de l'exercice précédent et de générer automatiquement 
                    les écritures de report à nouveau pour l'exercice en cours.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">📊 Structure de la Balance 6 Colonnes</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Colonne</th>
                          <th className="px-4 py-2 text-left">Libellé</th>
                          <th className="px-4 py-2 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 font-mono">1</td>
                          <td className="px-4 py-2">Solde Débit Ouverture</td>
                          <td className="px-4 py-2">Soldes débiteurs au début de l'exercice N-1</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono">2</td>
                          <td className="px-4 py-2">Solde Crédit Ouverture</td>
                          <td className="px-4 py-2">Soldes créditeurs au début de l'exercice N-1</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono">3</td>
                          <td className="px-4 py-2">Mouvement Débit</td>
                          <td className="px-4 py-2">Total des mouvements débiteurs de l'exercice N-1</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono">4</td>
                          <td className="px-4 py-2">Mouvement Crédit</td>
                          <td className="px-4 py-2">Total des mouvements créditeurs de l'exercice N-1</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono">5</td>
                          <td className="px-4 py-2 font-bold text-blue-600">Solde Débit Final</td>
                          <td className="px-4 py-2 font-bold">Soldes débiteurs à la fin de l'exercice N-1 🎯</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono">6</td>
                          <td className="px-4 py-2 font-bold text-green-600">Solde Crédit Final</td>
                          <td className="px-4 py-2 font-bold">Soldes créditeurs à la fin de l'exercice N-1 🎯</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Important :</strong> Les colonnes 5 et 6 (soldes finaux) sont utilisées pour générer automatiquement 
                      le report à nouveau. Seuls les comptes de bilan (classes 1 à 5) sont reportés.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">🔄 Génération Automatique du Report à Nouveau</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Extraction des soldes finaux</p>
                        <p className="text-xs text-gray-600">
                          Le système prend automatiquement les colonnes 5 et 6 de votre balance
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Filtrage des comptes de bilan</p>
                        <p className="text-xs text-gray-600">
                          Seuls les comptes des classes 1, 2, 3, 4, 5 sont reportés (pas les charges/produits)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Calcul du résultat N-1</p>
                        <p className="text-xs text-gray-600">
                          Résultat = Produits (classe 7) - Charges (classe 6), ajouté au compte 110000
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Génération des écritures RAN</p>
                        <p className="text-xs text-gray-600">
                          Écritures d'ouverture prêtes à être comptabilisées dans l'exercice N
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">✅ Contrôles Automatiques</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-sm mb-2">🔍 Contrôles de Cohérence</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Équilibre des colonnes débit/crédit</li>
                        <li>• Cohérence des calculs de soldes</li>
                        <li>• Validation des numéros de compte</li>
                        <li>• Détection des doublons</li>
                      </ul>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-sm mb-2">⚠️ Détection d'Anomalies</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Montants aberrants</li>
                        <li>• Comptes inexistants</li>
                        <li>• Classes incohérentes</li>
                        <li>• Soldes négatifs anormaux</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">📝 Étapes Recommandées</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <span className="font-bold text-blue-600">1.</span>
                      <span className="text-sm">Téléchargez le template Excel</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <span className="font-bold text-blue-600">2.</span>
                      <span className="text-sm">Remplissez avec vos données de balance N-1</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <span className="font-bold text-blue-600">3.</span>
                      <span className="text-sm">Uploadez le fichier (Excel ou CSV)</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <span className="font-bold text-blue-600">4.</span>
                      <span className="text-sm">Vérifiez les contrôles et corrigez les anomalies</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <span className="font-bold text-blue-600">5.</span>
                      <span className="text-sm">Validez la balance N-1</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-green-50 rounded">
                      <span className="font-bold text-green-600">6.</span>
                      <span className="text-sm font-medium">Le report à nouveau est généré automatiquement !</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal d'upload (simplifié pour l'exemple) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Upload Balance N-1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fichier Balance (Excel/CSV)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exercice N-1
                    </label>
                    <Input
                      value={exerciceN1}
                      onChange={(e) => setExerciceN1(e.target.value)}
                      placeholder="2023"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exercice Actuel
                    </label>
                    <Input
                      value={exerciceActuel}
                      onChange={(e) => setExerciceActuel(e.target.value)}
                      placeholder="2024"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                  Annuler
                </Button>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  Choisir fichier
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}