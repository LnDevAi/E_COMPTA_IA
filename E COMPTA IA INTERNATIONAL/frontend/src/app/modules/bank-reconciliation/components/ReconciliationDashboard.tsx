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
  BanknotesIcon, 
  ArrowsRightLeftIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  reference: string;
  matched: boolean;
  matchedWith?: string;
}

interface BookEntry {
  id: string;
  date: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
  reference: string;
  matched: boolean;
  matchedWith?: string;
}

interface ReconciliationSummary {
  bankBalance: number;
  bookBalance: number;
  difference: number;
  matchedItems: number;
  unmatchedBank: number;
  unmatchedBook: number;
  lastReconciled: string;
}

export default function ReconciliationDashboard() {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [bookEntries, setBookEntries] = useState<BookEntry[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoMatching, setIsAutoMatching] = useState(false);

  // Simulation des données
  useEffect(() => {
    setSummary({
      bankBalance: 2545000,
      bookBalance: 2340000,
      difference: 205000,
      matchedItems: 15,
      unmatchedBank: 3,
      unmatchedBook: 5,
      lastReconciled: '2024-03-15'
    });

    setBankTransactions([
      {
        id: 'bank_1',
        date: '2024-03-20',
        description: 'VIREMENT CLIENT ABC SARL',
        amount: 850000,
        type: 'credit',
        reference: 'VIR240320001',
        matched: false
      },
      {
        id: 'bank_2',
        date: '2024-03-19',
        description: 'PRELEVEMENT ELECTRICITE',
        amount: 125000,
        type: 'debit',
        reference: 'PREL240319',
        matched: true,
        matchedWith: 'book_2'
      },
      {
        id: 'bank_3',
        date: '2024-03-18',
        description: 'CHEQUE N°001245',
        amount: 300000,
        type: 'debit',
        reference: 'CHQ001245',
        matched: false
      }
    ]);

    setBookEntries([
      {
        id: 'book_1',
        date: '2024-03-20',
        account: '512100',
        description: 'Client ABC SARL - Facture F2024-045',
        debit: 850000,
        credit: 0,
        reference: 'F2024-045',
        matched: false
      },
      {
        id: 'book_2',
        date: '2024-03-19',
        account: '512100',
        description: 'Facture électricité mars 2024',
        debit: 0,
        credit: 125000,
        reference: 'ELEC032024',
        matched: true,
        matchedWith: 'bank_2'
      },
      {
        id: 'book_3',
        date: '2024-03-17',
        account: '512100',
        description: 'Fournisseur XYZ - Facture A789',
        debit: 0,
        credit: 450000,
        reference: 'A789',
        matched: false
      }
    ]);
  }, []);

  const handleAutoMatch = async () => {
    setIsAutoMatching(true);
    // Simulation du rapprochement automatique
    setTimeout(() => {
      // Logique de rapprochement automatique basée sur les montants et dates
      setIsAutoMatching(false);
    }, 2000);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredBankTransactions = bankTransactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookEntries = bookEntries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapprochement Bancaire</h1>
          <p className="text-gray-600 mt-1">Rapprochement et validation des comptes bancaires</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Importer relevé</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <DocumentTextIcon className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compte bancaire
              </label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un compte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="512100">512100 - Banque ABC</SelectItem>
                  <SelectItem value="512200">512200 - Banque XYZ</SelectItem>
                  <SelectItem value="512300">512300 - Banque DEF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Mois en cours</SelectItem>
                  <SelectItem value="last-month">Mois dernier</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="custom">Période personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Rechercher transaction..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAutoMatch}
                disabled={isAutoMatching}
                className="w-full flex items-center space-x-2"
              >
                <ArrowsRightLeftIcon className="h-4 w-4" />
                <span>{isAutoMatching ? 'Rapprochement...' : 'Auto-rapprochement'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Solde bancaire</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatAmount(summary.bankBalance)}
                  </p>
                </div>
                <BanknotesIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Solde comptable</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatAmount(summary.bookBalance)}
                  </p>
                </div>
                <DocumentTextIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Différence</p>
                  <p className={`text-2xl font-bold ${summary.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(summary.difference)}
                  </p>
                </div>
                {summary.difference === 0 ? (
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Éléments rapprochés</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {summary.matchedItems}
                  </p>
                  <p className="text-xs text-gray-500">
                    {summary.unmatchedBank + summary.unmatchedBook} non rapprochés
                  </p>
                </div>
                <ArrowsRightLeftIcon className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertes */}
      {summary && summary.difference !== 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Différence détectée de {formatAmount(summary.difference)}. 
            Vérifiez les écritures non rapprochées et les éventuelles erreurs.
          </AlertDescription>
        </Alert>
      )}

      {/* Onglets de rapprochement */}
      <Tabs defaultValue="reconciliation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reconciliation">Rapprochement</TabsTrigger>
          <TabsTrigger value="bank-transactions">Relevé bancaire</TabsTrigger>
          <TabsTrigger value="book-entries">Écritures comptables</TabsTrigger>
        </TabsList>

        <TabsContent value="reconciliation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transactions bancaires non rapprochées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BanknotesIcon className="h-5 w-5" />
                  <span>Transactions bancaires</span>
                  <Badge variant="secondary">
                    {filteredBankTransactions.filter(t => !t.matched).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredBankTransactions.filter(t => !t.matched).map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {transaction.date} • {transaction.reference}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
                          </p>
                          <Badge variant={transaction.matched ? "success" : "secondary"} className="mt-1 text-xs">
                            {transaction.matched ? 'Rapproché' : 'En attente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Écritures comptables non rapprochées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>Écritures comptables</span>
                  <Badge variant="secondary">
                    {filteredBookEntries.filter(e => !e.matched).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredBookEntries.filter(e => !e.matched).map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{entry.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {entry.date} • {entry.account} • {entry.reference}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${entry.debit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.debit > 0 ? '+' : '-'}{formatAmount(entry.debit || entry.credit)}
                          </p>
                          <Badge variant={entry.matched ? "success" : "secondary"} className="mt-1 text-xs">
                            {entry.matched ? 'Rapproché' : 'En attente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bank-transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les transactions bancaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredBankTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.date} • {transaction.reference}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
                        </p>
                        <Badge variant={transaction.matched ? "success" : "secondary"} className="mt-1">
                          {transaction.matched ? 'Rapproché' : 'En attente'}
                        </Badge>
                      </div>
                    </div>
                    {transaction.matched && transaction.matchedWith && (
                      <p className="text-xs text-blue-600 mt-2">
                        Rapproché avec: {transaction.matchedWith}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="book-entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les écritures comptables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredBookEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-sm text-gray-500">
                          {entry.date} • {entry.account} • {entry.reference}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Débit</p>
                            <p className="font-medium">{entry.debit ? formatAmount(entry.debit) : '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Crédit</p>
                            <p className="font-medium">{entry.credit ? formatAmount(entry.credit) : '-'}</p>
                          </div>
                        </div>
                        <Badge variant={entry.matched ? "success" : "secondary"} className="mt-1">
                          {entry.matched ? 'Rapproché' : 'En attente'}
                        </Badge>
                      </div>
                    </div>
                    {entry.matched && entry.matchedWith && (
                      <p className="text-xs text-blue-600 mt-2">
                        Rapproché avec: {entry.matchedWith}
                      </p>
                    )}
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