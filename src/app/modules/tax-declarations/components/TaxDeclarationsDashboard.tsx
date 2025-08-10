'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DocumentTextIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ArrowUpTrayIcon,
  PrinterIcon,
  EyeIcon,
  CalculatorIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface TaxDeclaration {
  id: string;
  type: string;
  country: string;
  period: {
    year: number;
    month?: number;
    quarter?: number;
  };
  dueDate: string;
  status: 'draft' | 'pending' | 'submitted' | 'accepted' | 'rejected';
  taxAmount: number;
  penalties?: number;
  submittedDate?: string;
  lastModified: string;
  reference?: string;
}

interface CountryTaxInfo {
  code: string;
  name: string;
  currency: string;
  fiscalYearEnd: string;
  mainTaxes: Array<{
    type: string;
    rate: string;
    description: string;
  }>;
  dueDates: Array<{
    type: string;
    frequency: string;
    dueDay: number;
  }>;
  requirements: string[];
}

export default function TaxDeclarationsDashboard() {
  const [selectedCountry, setSelectedCountry] = useState<string>('CI');
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const ohadaCountries: CountryTaxInfo[] = [
    {
      code: 'BF',
      name: 'Burkina Faso',
      currency: 'XOF',
      fiscalYearEnd: '31/12',
      mainTaxes: [
        { type: 'IBIC', rate: '27.5%', description: 'Impôt sur les Bénéfices Industriels et Commerciaux' },
        { type: 'TVA', rate: '18%', description: 'Taxe sur la Valeur Ajoutée' },
        { type: 'ITS', rate: '30%', description: 'Impôt sur les Traitements et Salaires' }
      ],
      dueDates: [
        { type: 'IBIC', frequency: 'Annuelle', dueDay: 31 },
        { type: 'TVA', frequency: 'Mensuelle', dueDay: 15 },
        { type: 'ITS', frequency: 'Mensuelle', dueDay: 15 }
      ],
      requirements: ['Bilan comptable', 'Compte de résultat', 'Journal comptable', 'Grand livre']
    },
    {
      code: 'CI',
      name: 'Côte d\'Ivoire',
      currency: 'XOF',
      fiscalYearEnd: '31/12',
      mainTaxes: [
        { type: 'BIC', rate: '25%', description: 'Impôt sur les Bénéfices Industriels et Commerciaux' },
        { type: 'TVA', rate: '18%', description: 'Taxe sur la Valeur Ajoutée' },
        { type: 'IGR', rate: '35%', description: 'Impôt Général sur le Revenu' }
      ],
      dueDates: [
        { type: 'BIC', frequency: 'Annuelle', dueDay: 30 },
        { type: 'TVA', frequency: 'Mensuelle', dueDay: 15 },
        { type: 'IGR', frequency: 'Mensuelle', dueDay: 15 }
      ],
      requirements: ['États financiers OHADA', 'Liasse fiscale', 'Déclaration TVA']
    },
    {
      code: 'SN',
      name: 'Sénégal',
      currency: 'XOF',
      fiscalYearEnd: '31/12',
      mainTaxes: [
        { type: 'IS', rate: '30%', description: 'Impôt sur les Sociétés' },
        { type: 'TVA', rate: '18%', description: 'Taxe sur la Valeur Ajoutée' },
        { type: 'IRPP', rate: '40%', description: 'Impôt sur le Revenu des Personnes Physiques' }
      ],
      dueDates: [
        { type: 'IS', frequency: 'Annuelle', dueDay: 30 },
        { type: 'TVA', frequency: 'Mensuelle', dueDay: 15 },
        { type: 'IRPP', frequency: 'Mensuelle', dueDay: 15 }
      ],
      requirements: ['Bilan fiscal', 'Compte de résultat fiscal', 'Tableau de flux']
    },
    {
      code: 'CM',
      name: 'Cameroun',
      currency: 'XAF',
      fiscalYearEnd: '31/12',
      mainTaxes: [
        { type: 'IS', rate: '30%', description: 'Impôt sur les Sociétés' },
        { type: 'TVA', rate: '19.25%', description: 'Taxe sur la Valeur Ajoutée' },
        { type: 'IRPP', rate: '35%', description: 'Impôt sur le Revenu des Personnes Physiques' }
      ],
      dueDates: [
        { type: 'IS', frequency: 'Annuelle', dueDay: 15 },
        { type: 'TVA', frequency: 'Mensuelle', dueDay: 15 },
        { type: 'IRPP', frequency: 'Mensuelle', dueDay: 15 }
      ],
      requirements: ['Liasse fiscale', 'Bilan comptable', 'Relevé des amortissements']
    },
    {
      code: 'GA',
      name: 'Gabon',
      currency: 'XAF',
      fiscalYearEnd: '31/12',
      mainTaxes: [
        { type: 'IS', rate: '30%', description: 'Impôt sur les Sociétés' },
        { type: 'TVA', rate: '18%', description: 'Taxe sur la Valeur Ajoutée' },
        { type: 'IGR', rate: '35%', description: 'Impôt Général sur le Revenu' }
      ],
      dueDates: [
        { type: 'IS', frequency: 'Annuelle', dueDay: 31 },
        { type: 'TVA', frequency: 'Mensuelle', dueDay: 20 },
        { type: 'IGR', frequency: 'Mensuelle', dueDay: 15 }
      ],
      requirements: ['États financiers', 'Déclaration fiscale', 'Justificatifs']
    }
  ];

  useEffect(() => {
    // Simulation des données
    setDeclarations([
      {
        id: 'decl_1',
        type: 'TVA Mensuelle',
        country: 'CI',
        period: { year: 2024, month: 11 },
        dueDate: '2024-12-15',
        status: 'pending',
        taxAmount: 2850000,
        lastModified: '2024-12-01'
      },
      {
        id: 'decl_2',
        type: 'IBIC Annuelle',
        country: 'BF',
        period: { year: 2023 },
        dueDate: '2024-03-31',
        status: 'submitted',
        taxAmount: 5200000,
        submittedDate: '2024-03-25',
        reference: 'BF2023IBIC001',
        lastModified: '2024-03-25'
      },
      {
        id: 'decl_3',
        type: 'IS Annuelle',
        country: 'SN',
        period: { year: 2023 },
        dueDate: '2024-04-30',
        status: 'accepted',
        taxAmount: 4750000,
        submittedDate: '2024-04-15',
        reference: 'SN2023IS0045',
        lastModified: '2024-04-15'
      },
      {
        id: 'decl_4',
        type: 'TVA Mensuelle',
        country: 'CM',
        period: { year: 2024, month: 10 },
        dueDate: '2024-11-15',
        status: 'rejected',
        taxAmount: 1650000,
        penalties: 165000,
        submittedDate: '2024-11-20',
        lastModified: '2024-11-25'
      },
      {
        id: 'decl_5',
        type: 'IGR Trimestrielle',
        country: 'GA',
        period: { year: 2024, quarter: 3 },
        dueDate: '2024-10-31',
        status: 'draft',
        taxAmount: 890000,
        lastModified: '2024-10-28'
      }
    ]);
  }, []);

  const selectedCountryInfo = ohadaCountries.find(c => c.code === selectedCountry);

  const filteredDeclarations = declarations.filter(decl => {
    const matchesCountry = selectedCountry === 'all' || decl.country === selectedCountry;
    const matchesYear = selectedYear === 'all' || decl.period.year.toString() === selectedYear;
    const matchesStatus = selectedStatus === 'all' || decl.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      decl.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decl.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCountry && matchesYear && matchesStatus && matchesSearch;
  });

  const formatAmount = (amount: number, currency: string = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'draft': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircleIcon className="h-4 w-4" />;
      case 'submitted': return <ArrowUpTrayIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'rejected': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'draft': return <DocumentTextIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Acceptée';
      case 'submitted': return 'Soumise';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejetée';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && !['submitted', 'accepted'].includes(status);
  };

  const upcomingDeclarations = declarations.filter(decl => {
    const dueDate = new Date(decl.dueDate);
    const today = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7 && daysDiff >= 0 && !['submitted', 'accepted'].includes(decl.status);
  });

  const overdueDeclarations = declarations.filter(decl => isOverdue(decl.dueDate, decl.status));

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Déclarations Fiscales</h1>
          <p className="text-gray-600 mt-1">
            Gestion des déclarations fiscales pour tous les pays OHADA
          </p>
        </div>
        <div className="flex space-x-3">
          <Button className="flex items-center space-x-2">
            <DocumentTextIcon className="h-4 w-4" />
            <span>Nouvelle déclaration</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <PrinterIcon className="h-4 w-4" />
            <span>Imprimer</span>
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays
              </label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  {ohadaCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Année
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="submitted">Soumise</SelectItem>
                  <SelectItem value="accepted">Acceptée</SelectItem>
                  <SelectItem value="rejected">Rejetée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <Input
                placeholder="Type, référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Exporter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total déclarations</p>
                <p className="text-2xl font-bold text-blue-600">
                  {declarations.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Toutes périodes
                </p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">À soumettre</p>
                <p className="text-2xl font-bold text-orange-600">
                  {upcomingDeclarations.length}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Dans les 7 jours
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En retard</p>
                <p className="text-2xl font-bold text-red-600">
                  {overdueDeclarations.length}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Échéance dépassée
                </p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(declarations.reduce((sum, decl) => sum + decl.taxAmount, 0))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Impôts dus
                </p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {overdueDeclarations.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{overdueDeclarations.length} déclaration(s) en retard</strong> - 
            Des pénalités peuvent s'appliquer. Veuillez soumettre rapidement.
          </AlertDescription>
        </Alert>
      )}

      {upcomingDeclarations.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <ClockIcon className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{upcomingDeclarations.length} déclaration(s) à soumettre</strong> 
            dans les 7 prochains jours.
          </AlertDescription>
        </Alert>
      )}

      {/* Onglets */}
      <Tabs defaultValue="declarations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="declarations">Déclarations</TabsTrigger>
          <TabsTrigger value="country-info">Infos pays</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="declarations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Liste des déclarations</span>
                <Badge variant="outline">{filteredDeclarations.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDeclarations.map((declaration) => (
                  <div key={declaration.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{declaration.type}</h3>
                          <Badge className={`text-xs ${getStatusColor(declaration.status)}`}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(declaration.status)}
                              <span>{getStatusText(declaration.status)}</span>
                            </span>
                          </Badge>
                          {isOverdue(declaration.dueDate, declaration.status) && (
                            <Badge variant="destructive" className="text-xs">
                              En retard
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Pays:</span>
                            <div className="flex items-center space-x-1 mt-1">
                              <GlobeAltIcon className="h-4 w-4" />
                              <span>{ohadaCountries.find(c => c.code === declaration.country)?.name}</span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Période:</span>
                            <div className="flex items-center space-x-1 mt-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>
                                {declaration.period.month ? 
                                  `${declaration.period.month.toString().padStart(2, '0')}/${declaration.period.year}` :
                                  declaration.period.quarter ?
                                  `T${declaration.period.quarter} ${declaration.period.year}` :
                                  declaration.period.year
                                }
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Échéance:</span>
                            <div className="flex items-center space-x-1 mt-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>{new Date(declaration.dueDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Montant:</span>
                            <div className="flex items-center space-x-1 mt-1">
                              <BanknotesIcon className="h-4 w-4" />
                              <span className="font-medium">
                                {formatAmount(declaration.taxAmount, 
                                  ohadaCountries.find(c => c.code === declaration.country)?.currency)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {declaration.reference && (
                          <div className="mt-2 text-xs text-gray-500">
                            Référence: {declaration.reference}
                          </div>
                        )}

                        {declaration.penalties && declaration.penalties > 0 && (
                          <div className="mt-2 text-xs text-red-600">
                            Pénalités: {formatAmount(declaration.penalties, 
                              ohadaCountries.find(c => c.code === declaration.country)?.currency)}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <EyeIcon className="h-4 w-4" />
                          <span>Voir</span>
                        </Button>
                        {declaration.status === 'draft' && (
                          <Button size="sm" className="flex items-center space-x-1">
                            <CalculatorIcon className="h-4 w-4" />
                            <span>Calculer</span>
                          </Button>
                        )}
                        {['draft', 'rejected'].includes(declaration.status) && (
                          <Button size="sm" className="flex items-center space-x-1">
                            <ArrowUpTrayIcon className="h-4 w-4" />
                            <span>Soumettre</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredDeclarations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune déclaration trouvée pour les critères sélectionnés</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="country-info" className="space-y-4">
          {selectedCountryInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GlobeAltIcon className="h-5 w-5" />
                  <span>Informations fiscales - {selectedCountryInfo.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informations générales</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Devise:</span>
                        <span className="font-medium">{selectedCountryInfo.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fin d'exercice fiscal:</span>
                        <span className="font-medium">{selectedCountryInfo.fiscalYearEnd}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Principaux impôts</h4>
                    <div className="space-y-2">
                      {selectedCountryInfo.mainTaxes.map((tax, index) => (
                        <div key={index} className="border rounded p-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium text-sm">{tax.type}</span>
                              <p className="text-xs text-gray-600 mt-1">{tax.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {tax.rate}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Échéances de déclaration</h4>
                    <div className="space-y-2">
                      {selectedCountryInfo.dueDates.map((due, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{due.type} ({due.frequency})</span>
                          <span className="font-medium">Le {due.dueDay} du mois</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Documents requis</h4>
                    <div className="space-y-1">
                      {selectedCountryInfo.requirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Calendrier fiscal 2024</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Décembre 2024', 'Janvier 2025', 'Février 2025'].map((month, monthIndex) => (
                  <div key={month} className="border rounded-lg p-4">
                    <h4 className="font-medium text-center mb-4">{month}</h4>
                    <div className="space-y-2">
                      {/* Simulation des échéances par mois */}
                      {monthIndex === 0 && (
                        <>
                          <div className="flex justify-between items-center text-sm p-2 bg-orange-50 rounded">
                            <span>TVA Nov - CI</span>
                            <span className="text-orange-600">15 Déc</span>
                          </div>
                          <div className="flex justify-between items-center text-sm p-2 bg-blue-50 rounded">
                            <span>IS Annuel - GA</span>
                            <span className="text-blue-600">31 Déc</span>
                          </div>
                        </>
                      )}
                      {monthIndex === 1 && (
                        <>
                          <div className="flex justify-between items-center text-sm p-2 bg-orange-50 rounded">
                            <span>TVA Déc - Tous</span>
                            <span className="text-orange-600">15 Jan</span>
                          </div>
                          <div className="flex justify-between items-center text-sm p-2 bg-yellow-50 rounded">
                            <span>ITS Déc - BF</span>
                            <span className="text-yellow-600">15 Jan</span>
                          </div>
                        </>
                      )}
                      {monthIndex === 2 && (
                        <>
                          <div className="flex justify-between items-center text-sm p-2 bg-orange-50 rounded">
                            <span>TVA Jan - Tous</span>
                            <span className="text-orange-600">15 Fév</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}