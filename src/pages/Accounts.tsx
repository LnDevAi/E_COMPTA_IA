import React, { useState, useMemo } from 'react'
import { Search, Filter, Plus, ChevronRight, ChevronDown, FileText } from 'lucide-react'
import { SYCEBNL_ACCOUNTS, getAccountsByClass, getChildAccounts } from '@/data/sycebnl-accounts'
import { Account, AccountClass } from '@/types'
import { cn } from '@/utils/cn'

const classNames = {
  [AccountClass.CLASSE_1]: 'Ressources durables',
  [AccountClass.CLASSE_2]: 'Actif immobilisé',
  [AccountClass.CLASSE_3]: 'Stocks',
  [AccountClass.CLASSE_4]: 'Tiers',
  [AccountClass.CLASSE_5]: 'Financiers',
  [AccountClass.CLASSE_6]: 'Charges',
  [AccountClass.CLASSE_7]: 'Produits',
  [AccountClass.CLASSE_8]: 'Comptes spéciaux',
}

const classColors = {
  [AccountClass.CLASSE_1]: 'bg-blue-100 text-blue-800',
  [AccountClass.CLASSE_2]: 'bg-green-100 text-green-800',
  [AccountClass.CLASSE_3]: 'bg-yellow-100 text-yellow-800',
  [AccountClass.CLASSE_4]: 'bg-purple-100 text-purple-800',
  [AccountClass.CLASSE_5]: 'bg-pink-100 text-pink-800',
  [AccountClass.CLASSE_6]: 'bg-red-100 text-red-800',
  [AccountClass.CLASSE_7]: 'bg-indigo-100 text-indigo-800',
  [AccountClass.CLASSE_8]: 'bg-gray-100 text-gray-800',
}

export function Accounts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<AccountClass | 'all'>('all')
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree')

  // Filtrer les comptes
  const filteredAccounts = useMemo(() => {
    let accounts = SYCEBNL_ACCOUNTS

    if (selectedClass !== 'all') {
      accounts = getAccountsByClass(selectedClass)
    }

    if (searchTerm) {
      accounts = accounts.filter(account => 
        account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return accounts
  }, [searchTerm, selectedClass])

  // Comptes racines pour la vue arbre
  const rootAccounts = useMemo(() => {
    return filteredAccounts.filter(account => !account.parentId)
  }, [filteredAccounts])

  const toggleExpanded = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts)
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId)
    } else {
      newExpanded.add(accountId)
    }
    setExpandedAccounts(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Plan Comptable SYCEBNL
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Référentiel officiel des comptes pour entités à but non lucratif
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button className="btn btn-outline">
            <FileText className="h-4 w-4 mr-2" />
            Exporter
          </button>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau compte
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Rechercher un compte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Class filter */}
          <select
            className="input"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value as AccountClass | 'all')}
          >
            <option value="all">Toutes les classes</option>
            {Object.entries(classNames).map(([classNum, className]) => (
              <option key={classNum} value={classNum}>
                Classe {classNum} - {className}
              </option>
            ))}
          </select>

          {/* View mode */}
          <div className="flex rounded-md shadow-sm">
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-l-md border",
                viewMode === 'tree'
                  ? 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              )}
              onClick={() => setViewMode('tree')}
            >
              Arbre
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b",
                viewMode === 'list'
                  ? 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              )}
              onClick={() => setViewMode('list')}
            >
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{SYCEBNL_ACCOUNTS.length}</div>
          <div className="text-sm text-gray-500">Total comptes</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {getAccountsByClass(AccountClass.CLASSE_7).length}
          </div>
          <div className="text-sm text-gray-500">Comptes produits</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {getAccountsByClass(AccountClass.CLASSE_6).length}
          </div>
          <div className="text-sm text-gray-500">Comptes charges</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {getAccountsByClass(AccountClass.CLASSE_8).length}
          </div>
          <div className="text-sm text-gray-500">Comptes spéciaux</div>
        </div>
      </div>

      {/* Accounts list/tree */}
      <div className="card">
        {viewMode === 'tree' ? (
          <AccountTree 
            accounts={rootAccounts}
            expandedAccounts={expandedAccounts}
            onToggleExpanded={toggleExpanded}
          />
        ) : (
          <AccountList accounts={filteredAccounts} />
        )}
      </div>
    </div>
  )
}

interface AccountTreeProps {
  accounts: Account[]
  expandedAccounts: Set<string>
  onToggleExpanded: (accountId: string) => void
  level?: number
}

function AccountTree({ accounts, expandedAccounts, onToggleExpanded, level = 0 }: AccountTreeProps) {
  return (
    <div className="space-y-1">
      {accounts.map((account) => {
        const children = getChildAccounts(account.id)
        const hasChildren = children.length > 0
        const isExpanded = expandedAccounts.has(account.id)

        return (
          <div key={account.id}>
            <div 
              className={cn(
                "flex items-center py-2 px-3 rounded-md hover:bg-gray-50 cursor-pointer",
                level > 0 && "ml-6"
              )}
              style={{ paddingLeft: `${level * 24 + 12}px` }}
              onClick={() => hasChildren && onToggleExpanded(account.id)}
            >
              <div className="flex items-center flex-1">
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                  )
                ) : (
                  <div className="w-6 mr-2" />
                )}
                
                <div className="flex items-center space-x-3 flex-1">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {account.code}
                  </span>
                  <span className="text-sm text-gray-700 flex-1">
                    {account.name}
                  </span>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    classColors[account.class]
                  )}>
                    Classe {account.class}
                  </span>
                </div>
              </div>
            </div>
            
            {hasChildren && isExpanded && (
              <AccountTree 
                accounts={children}
                expandedAccounts={expandedAccounts}
                onToggleExpanded={onToggleExpanded}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

interface AccountListProps {
  accounts: Account[]
}

function AccountList({ accounts }: AccountListProps) {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Libellé
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Classe
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {accounts.map((account) => (
            <tr key={account.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-mono text-sm font-medium text-gray-900">
                  {account.code}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{account.name}</div>
                {account.description && (
                  <div className="text-sm text-gray-500">{account.description}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  classColors[account.class]
                )}>
                  Classe {account.class}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {account.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  account.isActive 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                )}>
                  {account.isActive ? 'Actif' : 'Inactif'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}