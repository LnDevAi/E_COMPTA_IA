import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  DollarSign, 
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

// Données mockées pour la démonstration
const monthlyData = [
  { month: 'Jan', produits: 4000, charges: 2400 },
  { month: 'Fév', produits: 3000, charges: 1398 },
  { month: 'Mar', produits: 2000, charges: 9800 },
  { month: 'Avr', produits: 2780, charges: 3908 },
  { month: 'Mai', produits: 1890, charges: 4800 },
  { month: 'Jun', produits: 2390, charges: 3800 },
]

const accountsData = [
  { name: 'Classe 1 - Ressources durables', value: 45000, color: '#0ea5e9' },
  { name: 'Classe 4 - Tiers', value: 12000, color: '#22c55e' },
  { name: 'Classe 5 - Financiers', value: 8000, color: '#f59e0b' },
  { name: 'Classe 6 - Charges', value: 25000, color: '#ef4444' },
  { name: 'Classe 7 - Produits', value: 35000, color: '#8b5cf6' },
]

const recentTransactions = [
  { id: '1', date: '2024-01-15', description: 'Cotisation adhérent 2024', amount: 150, type: 'credit' },
  { id: '2', date: '2024-01-14', description: 'Achat fournitures bureau', amount: -89.50, type: 'debit' },
  { id: '3', date: '2024-01-13', description: 'Don anonyme', amount: 500, type: 'credit' },
  { id: '4', date: '2024-01-12', description: 'Frais bancaires', amount: -12, type: 'debit' },
  { id: '5', date: '2024-01-11', description: 'Subvention municipale', amount: 2000, type: 'credit' },
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Tableau de bord
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Vue d'ensemble de votre gestion comptable EBNL
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="btn btn-primary">
            Nouvelle écriture
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Produits"
          value="€47,250"
          change="+12.5%"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Charges"
          value="€32,180"
          change="-3.2%"
          changeType="negative"
          icon={TrendingDown}
        />
        <StatCard
          title="Adhérents Actifs"
          value="127"
          change="+8"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Écritures ce mois"
          value="45"
          change="+15"
          changeType="positive"
          icon={CreditCard}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Évolution mensuelle</h3>
            <select className="text-sm border-gray-300 rounded-md">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`€${value}`, '']} />
                <Line 
                  type="monotone" 
                  dataKey="produits" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Produits"
                />
                <Line 
                  type="monotone" 
                  dataKey="charges" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Charges"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par classe */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par classe de comptes</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accountsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: €${value.toLocaleString()}`}
                >
                  {accountsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`€${value}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions récentes */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Transactions récentes</h3>
            <a href="/transactions" className="text-sm text-primary-600 hover:text-primary-500">
              Voir tout
            </a>
          </div>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="inline-flex items-center text-sm">
                      <span className={`font-medium ${
                        transaction.type === 'credit' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Alertes et notifications */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alertes & Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Rapprochement bancaire
                </p>
                <p className="text-sm text-gray-500">
                  À effectuer pour janvier 2024
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Sauvegarde automatique
                </p>
                <p className="text-sm text-gray-500">
                  Effectuée avec succès
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Bilan annuel 2023
                </p>
                <p className="text-sm text-gray-500">
                  Prêt à être généré
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: React.ComponentType<{ className?: string }>
}

function StatCard({ title, value, change, changeType, icon: Icon }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
}