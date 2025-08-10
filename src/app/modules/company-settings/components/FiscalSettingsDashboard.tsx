'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  SettingsIcon,
  PlusIcon,
  CalculatorIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  DownloadIcon,
  UploadIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

import { 
  ConfigurationFiscaleEntreprise,
  ConfigurationTaxeFiscale,
  TypeTaxe,
  NatureTaxe,
  ModeCalculTaxe,
  PeriodeExigibilite,
  CONFIGURATION_FISCALE_BURKINA_FASO
} from '../models/fiscal-settings.model';

interface CompteComptable {
  numero: string;
  libelle: string;
  classe: string;
}

export default function FiscalSettingsDashboard() {
  const [configuration, setConfiguration] = useState<ConfigurationFiscaleEntreprise | null>(null);
  const [taxes, setTaxes] = useState<ConfigurationTaxeFiscale[]>([]);
  const [selectedTaxe, setSelectedTaxe] = useState<ConfigurationTaxeFiscale | null>(null);
  const [showAddTaxe, setShowAddTaxe] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Comptes comptables de base
  const comptesComptables: CompteComptable[] = [
    // TVA
    { numero: '4432', libelle: 'TVA Collectée', classe: '4' },
    { numero: '4451', libelle: 'TVA Déductible', classe: '4' },
    { numero: '4455', libelle: 'TVA à Décaisser', classe: '4' },
    
    // Charges sociales
    { numero: '4311', libelle: 'CNSS', classe: '4' },
    { numero: '4312', libelle: 'Caisse de Retraite', classe: '4' },
    { numero: '4313', libelle: 'Mutuelle', classe: '4' },
    
    // Taxes diverses
    { numero: '4421', libelle: 'Taxes sur Salaires à Payer', classe: '4' },
    { numero: '4422', libelle: 'Droits d\'Enregistrement', classe: '4' },
    { numero: '4423', libelle: 'Taxe d\'Apprentissage', classe: '4' },
    
    // Charges
    { numero: '6311', libelle: 'Taxes sur Salaires', classe: '6' },
    { numero: '6611', libelle: 'Charges Sociales', classe: '6' },
    { numero: '6313', libelle: 'Taxes Diverses', classe: '6' }
  ];

  useEffect(() => {
    // Simulation des données
    const configSimulee: ConfigurationFiscaleEntreprise = {
      id: 'config_1',
      entrepriseId: 'entreprise_1',
      nomEntreprise: 'SARL EXEMPLE BF',
      pays: 'BF',
      regimeFiscal: 'NORMAL',
      numeroContribuable: '01234567890123',
      rccm: 'BF-OUA-2024-B-12345',
      dateCreationFiscale: '2024-01-01',
      taxes: [],
      arrondissement: 'STANDARD',
      deviseParDefaut: 'XOF',
      precisonDecimale: 2,
      controlesCohérence: [],
      alertesActivees: true,
      seuilsAlertes: [],
      automatisationEcritures: true,
      dateCreation: '2024-01-01',
      dateMiseAJour: '2024-12-09',
      version: '1.0',
      statut: 'ACTIF'
    };

    const taxesSimulees: ConfigurationTaxeFiscale[] = [
      {
        id: 'tax_1',
        entrepriseId: 'entreprise_1',
        typeTaxe: TypeTaxe.TVA,
        natureTaxe: NatureTaxe.COLLECTEE,
        libelle: 'TVA Collectée (18%)',
        description: 'Taxe sur la Valeur Ajoutée collectée sur les ventes',
        actif: true,
        obligatoire: true,
        modeCalcul: ModeCalculTaxe.POURCENTAGE,
        taux: 18,
        compteCollecte: '4432',
        periodeExigibilite: PeriodeExigibilite.MENSUEL,
        dateEcheance: '15',
        codeOfficiel: 'TVA_COLL',
        dateApplication: '2024-01-01',
        calculAutoматique: true,
        controleCoherence: true,
        modulesConcernes: ['VENTES', 'PRESTATIONS'],
        journauxConcernes: ['VTE'],
        dateCreation: '2024-01-01',
        dateMiseAJour: '2024-01-01',
        creeParUserId: 'user_1'
      },
      {
        id: 'tax_2',
        entrepriseId: 'entreprise_1',
        typeTaxe: TypeTaxe.TVA,
        natureTaxe: NatureTaxe.DEDUCTIBLE,
        libelle: 'TVA Déductible (18%)',
        description: 'Taxe sur la Valeur Ajoutée déductible sur les achats',
        actif: true,
        obligatoire: true,
        modeCalcul: ModeCalculTaxe.POURCENTAGE,
        taux: 18,
        compteDeduction: '4451',
        periodeExigibilite: PeriodeExigibilite.MENSUEL,
        codeOfficiel: 'TVA_DED',
        dateApplication: '2024-01-01',
        calculAutoматique: true,
        controleCoherence: true,
        modulesConcernes: ['ACHATS', 'IMMOBILISATIONS'],
        journauxConcernes: ['ACH'],
        dateCreation: '2024-01-01',
        dateMiseAJour: '2024-01-01',
        creeParUserId: 'user_1'
      },
      {
        id: 'tax_3',
        entrepriseId: 'entreprise_1',
        typeTaxe: TypeTaxe.TAP,
        natureTaxe: NatureTaxe.A_PAYER,
        libelle: 'Taxe d\'Apprentissage Professionnel (2%)',
        description: 'TAP sur masse salariale',
        actif: true,
        obligatoire: true,
        modeCalcul: ModeCalculTaxe.POURCENTAGE,
        taux: 2,
        compteDette: '4423',
        compteCharge: '6311',
        periodeExigibilite: PeriodeExigibilite.MENSUEL,
        codeOfficiel: 'TAP',
        dateApplication: '2024-01-01',
        calculAutoматique: true,
        controleCoherence: true,
        modulesConcernes: ['PAIE'],
        journauxConcernes: ['PAIE'],
        dateCreation: '2024-01-01',
        dateMiseAJour: '2024-01-01',
        creeParUserId: 'user_1'
      },
      {
        id: 'tax_4',
        entrepriseId: 'entreprise_1',
        typeTaxe: TypeTaxe.CNSS_EMPLOYEUR,
        natureTaxe: NatureTaxe.COTISATION,
        libelle: 'CNSS Employeur (16%)',
        description: 'Cotisation sociale employeur',
        actif: true,
        obligatoire: true,
        modeCalcul: ModeCalculTaxe.POURCENTAGE,
        taux: 16,
        compteDette: '4311',
        compteCharge: '6611',
        periodeExigibilite: PeriodeExigibilite.MENSUEL,
        codeOfficiel: 'CNSS_EMP',
        dateApplication: '2024-01-01',
        calculAutoматique: true,
        controleCoherence: true,
        modulesConcernes: ['PAIE'],
        journauxConcernes: ['PAIE'],
        dateCreation: '2024-01-01',
        dateMiseAJour: '2024-01-01',
        creeParUserId: 'user_1'
      },
      {
        id: 'tax_5',
        entrepriseId: 'entreprise_1',
        typeTaxe: TypeTaxe.CNSS_EMPLOYE,
        natureTaxe: NatureTaxe.RETENUE,
        libelle: 'CNSS Employé (5.5%)',
        description: 'Cotisation sociale employé',
        actif: true,
        obligatoire: true,
        modeCalcul: ModeCalculTaxe.POURCENTAGE,
        taux: 5.5,
        compteDette: '4311',
        periodeExigibilite: PeriodeExigibilite.MENSUEL,
        codeOfficiel: 'CNSS_EMP',
        dateApplication: '2024-01-01',
        calculAutoматique: true,
        controleCoherence: true,
        modulesConcernes: ['PAIE'],
        journauxConcernes: ['PAIE'],
        dateCreation: '2024-01-01',
        dateMiseAJour: '2024-01-01',
        creeParUserId: 'user_1'
      }
    ];

    setConfiguration(configSimulee);
    setTaxes(taxesSimulees);
  }, []);

  const filteredTaxes = taxes.filter(taxe => {
    const matchesSearch = searchTerm === '' || 
      taxe.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taxe.typeTaxe.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || taxe.typeTaxe === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: TypeTaxe) => {
    switch (type) {
      case TypeTaxe.TVA: return 'text-blue-600 bg-blue-50 border-blue-200';
      case TypeTaxe.TAP: return 'text-green-600 bg-green-50 border-green-200';
      case TypeTaxe.CNSS_EMPLOYEUR: 
      case TypeTaxe.CNSS_EMPLOYE: return 'text-purple-600 bg-purple-50 border-purple-200';
      case TypeTaxe.IRPP: return 'text-orange-600 bg-orange-50 border-orange-200';
      case TypeTaxe.IS: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getNatureIcon = (nature: NatureTaxe) => {
    switch (nature) {
      case NatureTaxe.COLLECTEE: return <DocumentTextIcon className="h-4 w-4 text-green-600" />;
      case NatureTaxe.DEDUCTIBLE: return <CalculatorIcon className="h-4 w-4 text-blue-600" />;
      case NatureTaxe.A_PAYER: return <BanknotesIcon className="h-4 w-4 text-orange-600" />;
      case NatureTaxe.RETENUE: return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      case NatureTaxe.COTISATION: return <CheckCircleIcon className="h-4 w-4 text-purple-600" />;
      default: return <DocumentTextIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleAddConfigurationPredefinitie = async () => {
    try {
      setLoading(true);
      const configsPredefinies = CONFIGURATION_FISCALE_BURKINA_FASO;
      
      // Simuler l'ajout des configurations prédéfinies
      const nouvellesTaxes = configsPredefinies.map((config, index) => ({
        ...config,
        id: `pred_${index + 1}`,
        entrepriseId: 'entreprise_1',
        dateCreation: new Date().toISOString(),
        dateMiseAJour: new Date().toISOString(),
        creeParUserId: 'user_1'
      })) as ConfigurationTaxeFiscale[];

      setTaxes(prev => [...prev, ...nouvellesTaxes.filter(nt => 
        !prev.some(t => t.typeTaxe === nt.typeTaxe && t.natureTaxe === nt.natureTaxe)
      )]);
      
    } catch (error) {
      console.error('Erreur ajout configuration:', error);
      setErrors(['Erreur lors de l\'ajout de la configuration prédéfinie']);
    } finally {
      setLoading(false);
    }
  };

  const calculerMontantTaxe = (montantBase: number, taxe: ConfigurationTaxeFiscale): number => {
    if (taxe.modeCalcul === ModeCalculTaxe.POURCENTAGE && taxe.taux) {
      return (montantBase * taxe.taux) / 100;
    }
    if (taxe.modeCalcul === ModeCalculTaxe.MONTANT_FIXE && taxe.montantFixe) {
      return taxe.montantFixe;
    }
    return 0;
  };

  const formaterDevise = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  const taxesActives = taxes.filter(t => t.actif);
  const taxesObligatoires = taxes.filter(t => t.obligatoire);
  const taxesAutomatiques = taxes.filter(t => t.calculAutoматique);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuration Fiscale</h1>
          <p className="text-gray-600 mt-1">
            Paramétrage des taxes et leurs comptes comptables
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleAddConfigurationPredefinitie}
            variant="outline" 
            className="flex items-center space-x-2"
            disabled={loading}
          >
            <DownloadIcon className="h-4 w-4" />
            <span>Configuration BF</span>
          </Button>
          <Button onClick={() => setShowAddTaxe(true)} className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Ajouter taxe</span>
          </Button>
        </div>
      </div>

      {/* Configuration Entreprise */}
      {configuration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>Informations Fiscales - {configuration.nomEntreprise}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{configuration.pays}</Badge>
                  <span className="text-sm text-gray-600">Burkina Faso</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Régime Fiscal
                </label>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">
                    {configuration.regimeFiscal}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Contribuable
                </label>
                <span className="text-sm text-gray-900 font-mono">
                  {configuration.numeroContribuable}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total taxes</p>
                <p className="text-2xl font-bold text-blue-600">{taxes.length}</p>
                <p className="text-xs text-gray-500 mt-1">Configurées</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxes actives</p>
                <p className="text-2xl font-bold text-green-600">{taxesActives.length}</p>
                <p className="text-xs text-green-600 mt-1">En cours</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Obligatoires</p>
                <p className="text-2xl font-bold text-orange-600">{taxesObligatoires.length}</p>
                <p className="text-xs text-gray-500 mt-1">Réglementaires</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Automatiques</p>
                <p className="text-2xl font-bold text-purple-600">{taxesAutomatiques.length}</p>
                <p className="text-xs text-purple-600 mt-1">Calcul auto</p>
              </div>
              <CalculatorIcon className="h-8 w-8 text-purple-600" />
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

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <Input
                placeholder="Nom de la taxe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de taxe
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value={TypeTaxe.TVA}>TVA</SelectItem>
                  <SelectItem value={TypeTaxe.TAP}>TAP</SelectItem>
                  <SelectItem value={TypeTaxe.CNSS_EMPLOYEUR}>CNSS Employeur</SelectItem>
                  <SelectItem value={TypeTaxe.CNSS_EMPLOYE}>CNSS Employé</SelectItem>
                  <SelectItem value={TypeTaxe.IRPP}>IRPP</SelectItem>
                  <SelectItem value={TypeTaxe.IS}>IS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Exporter configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des taxes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BanknotesIcon className="h-5 w-5" />
            <span>Taxes Configurées</span>
            <Badge variant="outline">{filteredTaxes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTaxes.map((taxe) => (
              <div key={taxe.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getNatureIcon(taxe.natureTaxe)}
                      <div>
                        <h3 className="font-medium text-gray-900">{taxe.libelle}</h3>
                        <p className="text-sm text-gray-600">{taxe.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={`text-xs ${getTypeColor(taxe.typeTaxe)}`}>
                          {taxe.typeTaxe}
                        </Badge>
                        {taxe.actif && (
                          <Badge className="text-xs text-green-600 bg-green-50 border-green-200">
                            Actif
                          </Badge>
                        )}
                        {taxe.obligatoire && (
                          <Badge className="text-xs text-orange-600 bg-orange-50 border-orange-200">
                            Obligatoire
                          </Badge>
                        )}
                        {taxe.calculAutoматique && (
                          <Badge className="text-xs text-purple-600 bg-purple-50 border-purple-200">
                            Auto
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Taux:</span>
                        <p className="mt-1 text-lg font-bold text-blue-600">
                          {taxe.taux ? `${taxe.taux}%` : 
                           taxe.montantFixe ? formaterDevise(taxe.montantFixe) : 
                           'Variable'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Nature:</span>
                        <p className="mt-1 capitalize">{taxe.natureTaxe.toLowerCase()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Périodicité:</span>
                        <p className="mt-1 capitalize">{taxe.periodeExigibilite.toLowerCase()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Échéance:</span>
                        <p className="mt-1">
                          {taxe.dateEcheance ? `Le ${taxe.dateEcheance}` : 'Non définie'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Comptes comptables:</span>
                        <div className="mt-1 space-y-1">
                          {taxe.compteCollecte && (
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">Collecte</Badge>
                              <span className="font-mono">{taxe.compteCollecte}</span>
                            </div>
                          )}
                          {taxe.compteDeduction && (
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">Déduction</Badge>
                              <span className="font-mono">{taxe.compteDeduction}</span>
                            </div>
                          )}
                          {taxe.compteDette && (
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">Dette</Badge>
                              <span className="font-mono">{taxe.compteDette}</span>
                            </div>
                          )}
                          {taxe.compteCharge && (
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">Charge</Badge>
                              <span className="font-mono">{taxe.compteCharge}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Modules concernés:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {taxe.modulesConcernes.map((module, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">Journaux:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {taxe.journauxConcernes.map((journal, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {journal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Simulation de calcul */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Simulation:</span>
                      <div className="mt-1 grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-gray-600">Base 100,000 F:</span>
                          <span className="ml-2 font-bold text-blue-600">
                            {formaterDevise(calculerMontantTaxe(100000, taxe))}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Base 500,000 F:</span>
                          <span className="ml-2 font-bold text-blue-600">
                            {formaterDevise(calculerMontantTaxe(500000, taxe))}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Base 1,000,000 F:</span>
                          <span className="ml-2 font-bold text-blue-600">
                            {formaterDevise(calculerMontantTaxe(1000000, taxe))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm" className="flex items-center space-x-1">
                      <EyeIcon className="h-4 w-4" />
                      <span>Détails</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1">
                      <PencilIcon className="h-4 w-4" />
                      <span>Modifier</span>
                    </Button>
                    {!taxe.obligatoire && (
                      <Button variant="destructive" size="sm" className="flex items-center space-x-1">
                        <TrashIcon className="h-4 w-4" />
                        <span>Suppr.</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredTaxes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BanknotesIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune taxe trouvée pour les critères sélectionnés</p>
                <Button 
                  onClick={() => setShowAddTaxe(true)} 
                  className="mt-4"
                >
                  Ajouter votre première taxe
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Aide et informations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-600" />
            <span>Aide - Configuration des Taxes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">🎯 Comptes Comptables Principaux</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-mono">4432</span>
                  <span>TVA Collectée</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">4451</span>
                  <span>TVA Déductible</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">4311</span>
                  <span>CNSS</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">4421</span>
                  <span>Taxes sur Salaires</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">6311</span>
                  <span>Charges Fiscales</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">⚙️ Calcul Automatique</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✅ <strong>Actif:</strong> Le calcul se fait automatiquement lors des écritures</p>
                <p>📊 <strong>Modules:</strong> Définit où la taxe s'applique</p>
                <p>📝 <strong>Journaux:</strong> Restreint l'application à certains journaux</p>
                <p>🔄 <strong>Périodicité:</strong> Fréquence de déclaration obligatoire</p>
                <p>📅 <strong>Échéance:</strong> Date limite de paiement mensuel</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}