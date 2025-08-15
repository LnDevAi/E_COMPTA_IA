'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  TrendingUpIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  EyeIcon,
  CalculatorIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface FinancialPeriod {
  id: string;
  year: number;
  period: 'annual' | 'quarterly' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'draft' | 'finalized' | 'published';
}

interface BalanceSheetItem {
  code: string;
  label: string;
  amount: number;
  previousAmount: number;
  note?: string;
  level: number;
  isTotal: boolean;
}

interface IncomeStatementItem {
  code: string;
  label: string;
  amount: number;
  previousAmount: number;
  note?: string;
  level: number;
  isTotal: boolean;
}

interface CashFlowItem {
  category: 'operating' | 'investing' | 'financing';
  label: string;
  amount: number;
  previousAmount: number;
}

interface FinancialRatios {
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
  };
  profitability: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    roe: number;
    roa: number;
  };
  leverage: {
    debtToEquity: number;
    debtToAssets: number;
    interestCoverage: number;
  };
  efficiency: {
    assetTurnover: number;
    inventoryTurnover: number;
    receivableTurnover: number;
  };
}

export default function FinancialStatementsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024');
  const [selectedFormat, setSelectedFormat] = useState<string>('ohada');
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetItem[]>([]);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatementItem[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowItem[]>([]);
  const [ratios, setRatios] = useState<FinancialRatios | null>(null);
  const [periods] = useState<FinancialPeriod[]>([
    { id: '2024', year: 2024, period: 'annual', startDate: '2024-01-01', endDate: '2024-12-31', status: 'draft' },
    { id: '2023', year: 2023, period: 'annual', startDate: '2023-01-01', endDate: '2023-12-31', status: 'finalized' },
    { id: '2022', year: 2022, period: 'annual', startDate: '2022-01-01', endDate: '2022-12-31', status: 'published' }
  ]);

  useEffect(() => {
    // Simulation des données du bilan
    setBalanceSheet([
      // ACTIF
      { code: 'AC', label: 'ACTIF', amount: 15750000, previousAmount: 14200000, level: 0, isTotal: true },
      { code: 'AD', label: 'ACTIF IMMOBILISE', amount: 8500000, previousAmount: 7800000, level: 1, isTotal: true },
      { code: 'AE', label: 'Immobilisations incorporelles', amount: 850000, previousAmount: 720000, level: 2, isTotal: false },
      { code: 'AF', label: 'Immobilisations corporelles', amount: 6450000, previousAmount: 5980000, level: 2, isTotal: false },
      { code: 'AG', label: 'Immobilisations financières', amount: 1200000, previousAmount: 1100000, level: 2, isTotal: false },
      { code: 'AH', label: 'ACTIF CIRCULANT', amount: 7250000, previousAmount: 6400000, level: 1, isTotal: true },
      { code: 'AI', label: 'Stocks et en-cours', amount: 2800000, previousAmount: 2600000, level: 2, isTotal: false },
      { code: 'AJ', label: 'Créances et emplois assimilés', amount: 3650000, previousAmount: 3200000, level: 2, isTotal: false },
      { code: 'AK', label: 'Trésorerie-Actif', amount: 800000, previousAmount: 600000, level: 2, isTotal: false },
      
      // PASSIF
      { code: 'PA', label: 'PASSIF', amount: 15750000, previousAmount: 14200000, level: 0, isTotal: true },
      { code: 'PB', label: 'CAPITAUX PROPRES', amount: 9500000, previousAmount: 8800000, level: 1, isTotal: true },
      { code: 'PC', label: 'Capital', amount: 5000000, previousAmount: 5000000, level: 2, isTotal: false },
      { code: 'PD', label: 'Réserves', amount: 2800000, previousAmount: 2400000, level: 2, isTotal: false },
      { code: 'PE', label: 'Résultat net', amount: 1700000, previousAmount: 1400000, level: 2, isTotal: false },
      { code: 'PF', label: 'DETTES', amount: 6250000, previousAmount: 5400000, level: 1, isTotal: true },
      { code: 'PG', label: 'Dettes financières', amount: 3800000, previousAmount: 3200000, level: 2, isTotal: false },
      { code: 'PH', label: 'Dettes circulantes', amount: 2450000, previousAmount: 2200000, level: 2, isTotal: false }
    ]);

    // Simulation des données du compte de résultat
    setIncomeStatement([
      { code: 'TA', label: 'ACTIVITE D\'EXPLOITATION', amount: 0, previousAmount: 0, level: 0, isTotal: true },
      { code: 'TB', label: 'Ventes de marchandises', amount: 12500000, previousAmount: 11200000, level: 1, isTotal: false },
      { code: 'TC', label: 'Coût d\'achat des marchandises vendues', amount: -8750000, previousAmount: -7840000, level: 1, isTotal: false },
      { code: 'TD', label: 'MARGE COMMERCIALE', amount: 3750000, previousAmount: 3360000, level: 1, isTotal: true },
      { code: 'TE', label: 'Prestations de services', amount: 4500000, previousAmount: 4100000, level: 1, isTotal: false },
      { code: 'TF', label: 'CHIFFRE D\'AFFAIRES', amount: 17000000, previousAmount: 15300000, level: 1, isTotal: true },
      { code: 'TG', label: 'Autres charges d\'exploitation', amount: -12800000, previousAmount: -11500000, level: 1, isTotal: false },
      { code: 'TH', label: 'RESULTAT D\'EXPLOITATION', amount: 4200000, previousAmount: 3800000, level: 1, isTotal: true },
      { code: 'TI', label: 'Charges financières', amount: -450000, previousAmount: -380000, level: 1, isTotal: false },
      { code: 'TJ', label: 'Produits financiers', amount: 75000, previousAmount: 65000, level: 1, isTotal: false },
      { code: 'TK', label: 'RESULTAT FINANCIER', amount: -375000, previousAmount: -315000, level: 1, isTotal: true },
      { code: 'TL', label: 'RESULTAT AVANT IMPOT', amount: 3825000, previousAmount: 3485000, level: 1, isTotal: true },
      { code: 'TM', label: 'Impôt sur les bénéfices', amount: -1125000, previousAmount: -1025000, level: 1, isTotal: false },
      { code: 'TN', label: 'RESULTAT NET', amount: 2700000, previousAmount: 2460000, level: 1, isTotal: true }
    ]);

    // Simulation des flux de trésorerie
    setCashFlow([
      { category: 'operating', label: 'Résultat net', amount: 2700000, previousAmount: 2460000 },
      { category: 'operating', label: 'Amortissements', amount: 1200000, previousAmount: 1100000 },
      { category: 'operating', label: 'Variation du BFR', amount: -650000, previousAmount: -420000 },
      { category: 'investing', label: 'Acquisitions d\'immobilisations', amount: -1800000, previousAmount: -1500000 },
      { category: 'investing', label: 'Cessions d\'immobilisations', amount: 150000, previousAmount: 80000 },
      { category: 'financing', label: 'Augmentation d\'emprunts', amount: 800000, previousAmount: 600000 },
      { category: 'financing', label: 'Remboursement d\'emprunts', amount: -450000, previousAmount: -380000 },
      { category: 'financing', label: 'Dividendes versés', amount: -750000, previousAmount: -650000 }
    ]);

    // Calcul des ratios
    setRatios({
      liquidity: {
        currentRatio: 2.96,
        quickRatio: 1.82,
        cashRatio: 0.33
      },
      profitability: {
        grossMargin: 22.06,
        operatingMargin: 24.71,
        netMargin: 15.88,
        roe: 28.42,
        roa: 17.14
      },
      leverage: {
        debtToEquity: 0.66,
        debtToAssets: 0.40,
        interestCoverage: 9.33
      },
      efficiency: {
        assetTurnover: 1.08,
        inventoryTurnover: 6.07,
        receivableTurnover: 4.66
      }
    });
  }, [selectedPeriod]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getVariationColor = (current: number, previous: number) => {
    const variation = ((current - previous) / previous) * 100;
    if (variation > 0) return 'text-green-600';
    if (variation < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVariationIcon = (current: number, previous: number) => {
    const variation = ((current - previous) / previous) * 100;
    if (variation > 5) return '↗️';
    if (variation < -5) return '↘️';
    return '→';
  };

  const selectedPeriodData = periods.find(p => p.id === selectedPeriod);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">États Financiers</h1>
          <p className="text-gray-600 mt-1">
            Bilan, compte de résultat et annexes selon les normes OHADA
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <EyeIcon className="h-4 w-4" />
            <span>Aperçu</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <PrinterIcon className="h-4 w-4" />
            <span>Imprimer</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
        </div>
      </div>

      {/* Filtres et paramètres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercice
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.year} - {period.period === 'annual' ? 'Annuel' : 'Trimestriel'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ohada">OHADA</SelectItem>
                  <SelectItem value="ifrs">IFRS</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <div className="pt-2">
                <Badge 
                  variant={
                    selectedPeriodData?.status === 'published' ? 'default' :
                    selectedPeriodData?.status === 'finalized' ? 'secondary' : 'outline'
                  }
                >
                  {selectedPeriodData?.status === 'published' ? 'Publié' :
                   selectedPeriodData?.status === 'finalized' ? 'Finalisé' : 'Brouillon'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <p className="text-sm text-gray-600 pt-2">
                {selectedPeriodData?.startDate} au {selectedPeriodData?.endDate}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatAmount(17000000)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +11.1% vs N-1
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Résultat net</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(2700000)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +9.8% vs N-1
                </p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total actif</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatAmount(15750000)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +10.9% vs N-1
                </p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Capitaux propres</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatAmount(9500000)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +8.0% vs N-1
                </p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes de validation */}
      <Alert className="border-yellow-200 bg-yellow-50">
        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          États financiers en cours d'élaboration. Validation comptable requise avant publication.
        </AlertDescription>
      </Alert>

      {/* Onglets des états financiers */}
      <Tabs defaultValue="balance-sheet" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="balance-sheet">Bilan</TabsTrigger>
          <TabsTrigger value="income-statement">Compte de résultat</TabsTrigger>
          <TabsTrigger value="cash-flow">Flux de trésorerie</TabsTrigger>
          <TabsTrigger value="ratios">Ratios</TabsTrigger>
        </TabsList>

        <TabsContent value="balance-sheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Bilan - OHADA</span>
                <Badge variant="outline">{selectedPeriod}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">ACTIF</th>
                      <th className="text-right py-2 font-medium">N</th>
                      <th className="text-right py-2 font-medium">N-1</th>
                      <th className="text-right py-2 font-medium">Var.</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {balanceSheet.filter(item => item.code.startsWith('A')).map((item) => (
                      <tr key={item.code} className={`border-b border-gray-100 ${item.isTotal ? 'font-bold bg-gray-50' : ''}`}>
                        <td className={`py-2 ${item.level > 0 ? `pl-${item.level * 4}` : ''}`}>
                          {item.label}
                        </td>
                        <td className="text-right py-2">
                          {formatAmount(item.amount)}
                        </td>
                        <td className="text-right py-2">
                          {formatAmount(item.previousAmount)}
                        </td>
                        <td className={`text-right py-2 ${getVariationColor(item.amount, item.previousAmount)}`}>
                          {getVariationIcon(item.amount, item.previousAmount)}
                          {(((item.amount - item.previousAmount) / item.previousAmount) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">PASSIF</th>
                        <th className="text-right py-2 font-medium">N</th>
                        <th className="text-right py-2 font-medium">N-1</th>
                        <th className="text-right py-2 font-medium">Var.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceSheet.filter(item => item.code.startsWith('P')).map((item) => (
                        <tr key={item.code} className={`border-b border-gray-100 ${item.isTotal ? 'font-bold bg-gray-50' : ''}`}>
                          <td className={`py-2 ${item.level > 0 ? `pl-${item.level * 4}` : ''}`}>
                            {item.label}
                          </td>
                          <td className="text-right py-2">
                            {formatAmount(item.amount)}
                          </td>
                          <td className="text-right py-2">
                            {formatAmount(item.previousAmount)}
                          </td>
                          <td className={`text-right py-2 ${getVariationColor(item.amount, item.previousAmount)}`}>
                            {getVariationIcon(item.amount, item.previousAmount)}
                            {(((item.amount - item.previousAmount) / item.previousAmount) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income-statement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5" />
                <span>Compte de Résultat - OHADA</span>
                <Badge variant="outline">{selectedPeriod}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">CHARGES ET PRODUITS</th>
                      <th className="text-right py-2 font-medium">N</th>
                      <th className="text-right py-2 font-medium">N-1</th>
                      <th className="text-right py-2 font-medium">Var.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeStatement.map((item) => (
                      <tr key={item.code} className={`border-b border-gray-100 ${item.isTotal ? 'font-bold bg-gray-50' : ''}`}>
                        <td className={`py-2 ${item.level > 0 ? `pl-${item.level * 4}` : ''}`}>
                          {item.label}
                        </td>
                        <td className={`text-right py-2 ${item.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatAmount(item.amount)}
                        </td>
                        <td className={`text-right py-2 ${item.previousAmount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatAmount(item.previousAmount)}
                        </td>
                        <td className={`text-right py-2 ${getVariationColor(item.amount, item.previousAmount)}`}>
                          {item.previousAmount !== 0 && (
                            <>
                              {getVariationIcon(item.amount, item.previousAmount)}
                              {(((item.amount - item.previousAmount) / Math.abs(item.previousAmount)) * 100).toFixed(1)}%
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5" />
                <span>Tableau des Flux de Trésorerie</span>
                <Badge variant="outline">{selectedPeriod}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['operating', 'investing', 'financing'].map((category) => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-900 mb-3">
                      {category === 'operating' ? 'Flux de trésorerie d\'exploitation' :
                       category === 'investing' ? 'Flux de trésorerie d\'investissement' :
                       'Flux de trésorerie de financement'}
                    </h4>
                    <div className="space-y-2">
                      {cashFlow.filter(item => item.category === category).map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm">{item.label}</span>
                          <div className="flex space-x-8">
                            <span className={`text-sm font-medium ${item.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatAmount(item.amount)}
                            </span>
                            <span className={`text-sm ${item.previousAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatAmount(item.previousAmount)}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="font-medium py-2 border-t border-gray-300">
                        <div className="flex justify-between">
                          <span>
                            Flux net {category === 'operating' ? 'd\'exploitation' :
                                     category === 'investing' ? 'd\'investissement' :
                                     'de financement'}
                          </span>
                          <div className="flex space-x-8">
                            <span className="font-bold">
                              {formatAmount(cashFlow.filter(item => item.category === category)
                                .reduce((sum, item) => sum + item.amount, 0))}
                            </span>
                            <span>
                              {formatAmount(cashFlow.filter(item => item.category === category)
                                .reduce((sum, item) => sum + item.previousAmount, 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratios" className="space-y-4">
          {ratios && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CalculatorIcon className="h-5 w-5" />
                    <span>Ratios de Liquidité</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ratio de liquidité générale</span>
                      <span className="font-medium">{ratios.liquidity.currentRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ratio de liquidité réduite</span>
                      <span className="font-medium">{ratios.liquidity.quickRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ratio de liquidité immédiate</span>
                      <span className="font-medium">{ratios.liquidity.cashRatio.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ratios de Rentabilité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Marge brute</span>
                      <span className="font-medium">{formatPercentage(ratios.profitability.grossMargin)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Marge d'exploitation</span>
                      <span className="font-medium">{formatPercentage(ratios.profitability.operatingMargin)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Marge nette</span>
                      <span className="font-medium">{formatPercentage(ratios.profitability.netMargin)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ROE</span>
                      <span className="font-medium">{formatPercentage(ratios.profitability.roe)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ROA</span>
                      <span className="font-medium">{formatPercentage(ratios.profitability.roa)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ratios d'Endettement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dettes / Capitaux propres</span>
                      <span className="font-medium">{ratios.leverage.debtToEquity.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dettes / Total actif</span>
                      <span className="font-medium">{formatPercentage(ratios.leverage.debtToAssets)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Couverture des intérêts</span>
                      <span className="font-medium">{ratios.leverage.interestCoverage.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ratios d'Efficacité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Rotation des actifs</span>
                      <span className="font-medium">{ratios.efficiency.assetTurnover.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Rotation des stocks</span>
                      <span className="font-medium">{ratios.efficiency.inventoryTurnover.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Rotation des créances</span>
                      <span className="font-medium">{ratios.efficiency.receivableTurnover.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}