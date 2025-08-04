import axios from 'axios'
import { Account, Transaction, Member, DesignatedFund, AIAnalysis, FinancialStatement } from '@/types'

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour la gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// Services pour les comptes
export const accountsService = {
  // Récupérer tous les comptes
  getAll: async (): Promise<Account[]> => {
    const response = await api.get('/api/comptes')
    return response.data
  },

  // Récupérer les comptes par classe
  getByClass: async (classe: number): Promise<Account[]> => {
    const response = await api.get(`/api/comptes/classe/${classe}`)
    return response.data
  },

  // Récupérer un compte par ID
  getById: async (id: string): Promise<Account> => {
    const response = await api.get(`/api/comptes/${id}`)
    return response.data
  },

  // Créer un nouveau compte
  create: async (account: Omit<Account, 'id'>): Promise<Account> => {
    const response = await api.post('/api/comptes', account)
    return response.data
  },

  // Mettre à jour un compte
  update: async (id: string, account: Partial<Account>): Promise<Account> => {
    const response = await api.put(`/api/comptes/${id}`, account)
    return response.data
  },

  // Supprimer un compte
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/comptes/${id}`)
  },

  // Rechercher des comptes
  search: async (query: string): Promise<Account[]> => {
    const response = await api.get(`/api/comptes/search?q=${encodeURIComponent(query)}`)
    return response.data
  }
}

// Services pour les transactions
export const transactionsService = {
  // Récupérer toutes les transactions
  getAll: async (page = 1, limit = 50): Promise<{ transactions: Transaction[], total: number }> => {
    const response = await api.get(`/api/transactions?page=${page}&limit=${limit}`)
    return response.data
  },

  // Récupérer une transaction par ID
  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/api/transactions/${id}`)
    return response.data
  },

  // Créer une nouvelle transaction
  create: async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    const response = await api.post('/api/transactions', transaction)
    return response.data
  },

  // Mettre à jour une transaction
  update: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    const response = await api.put(`/api/transactions/${id}`, transaction)
    return response.data
  },

  // Supprimer une transaction
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/transactions/${id}`)
  },

  // Valider une transaction
  validate: async (id: string): Promise<Transaction> => {
    const response = await api.post(`/api/transactions/${id}/validate`)
    return response.data
  },

  // Filtrer les transactions
  filter: async (filters: {
    startDate?: string
    endDate?: string
    accountId?: string
    status?: string
  }): Promise<Transaction[]> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const response = await api.get(`/api/transactions/filter?${params}`)
    return response.data
  }
}

// Services pour les membres
export const membersService = {
  // Récupérer tous les membres
  getAll: async (): Promise<Member[]> => {
    const response = await api.get('/api/members')
    return response.data
  },

  // Récupérer un membre par ID
  getById: async (id: string): Promise<Member> => {
    const response = await api.get(`/api/members/${id}`)
    return response.data
  },

  // Créer un nouveau membre
  create: async (member: Omit<Member, 'id'>): Promise<Member> => {
    const response = await api.post('/api/members', member)
    return response.data
  },

  // Mettre à jour un membre
  update: async (id: string, member: Partial<Member>): Promise<Member> => {
    const response = await api.put(`/api/members/${id}`, member)
    return response.data
  },

  // Supprimer un membre
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/members/${id}`)
  },

  // Récupérer les cotisations d'un membre
  getContributions: async (id: string): Promise<Member['contributions']> => {
    const response = await api.get(`/api/members/${id}/contributions`)
    return response.data
  }
}

// Services pour les fonds affectés
export const designatedFundsService = {
  // Récupérer tous les fonds affectés
  getAll: async (): Promise<DesignatedFund[]> => {
    const response = await api.get('/api/designated-funds')
    return response.data
  },

  // Récupérer un fonds par ID
  getById: async (id: string): Promise<DesignatedFund> => {
    const response = await api.get(`/api/designated-funds/${id}`)
    return response.data
  },

  // Créer un nouveau fonds affecté
  create: async (fund: Omit<DesignatedFund, 'id' | 'currentAmount' | 'transactions'>): Promise<DesignatedFund> => {
    const response = await api.post('/api/designated-funds', fund)
    return response.data
  },

  // Mettre à jour un fonds affecté
  update: async (id: string, fund: Partial<DesignatedFund>): Promise<DesignatedFund> => {
    const response = await api.put(`/api/designated-funds/${id}`, fund)
    return response.data
  },

  // Supprimer un fonds affecté
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/designated-funds/${id}`)
  }
}

// Services pour l'IA
export const aiService = {
  // Analyser un document
  analyzeDocument: async (file: File): Promise<AIAnalysis> => {
    const formData = new FormData()
    formData.append('document', file)
    
    const response = await api.post('/api/ai/analyze-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Récupérer une analyse par ID
  getAnalysis: async (id: string): Promise<AIAnalysis> => {
    const response = await api.get(`/api/ai/analysis/${id}`)
    return response.data
  },

  // Accepter les suggestions de l'IA
  acceptSuggestions: async (analysisId: string, selectedSuggestions: string[]): Promise<Transaction> => {
    const response = await api.post(`/api/ai/analysis/${analysisId}/accept`, {
      selectedSuggestions
    })
    return response.data
  },

  // Obtenir des suggestions pour une écriture manuelle
  getSuggestions: async (description: string, amount: number): Promise<any> => {
    const response = await api.post('/api/ai/suggestions', {
      description,
      amount
    })
    return response.data
  }
}

// Services pour les états financiers
export const reportsService = {
  // Générer un bilan
  generateBalanceSheet: async (startDate: string, endDate: string): Promise<FinancialStatement> => {
    const response = await api.post('/api/reports/balance-sheet', {
      startDate,
      endDate
    })
    return response.data
  },

  // Générer un compte de résultat
  generateIncomeStatement: async (startDate: string, endDate: string): Promise<FinancialStatement> => {
    const response = await api.post('/api/reports/income-statement', {
      startDate,
      endDate
    })
    return response.data
  },

  // Générer un tableau de flux de trésorerie
  generateCashFlow: async (startDate: string, endDate: string): Promise<FinancialStatement> => {
    const response = await api.post('/api/reports/cash-flow', {
      startDate,
      endDate
    })
    return response.data
  },

  // Exporter un rapport en PDF
  exportToPDF: async (reportId: string): Promise<Blob> => {
    const response = await api.get(`/api/reports/${reportId}/export/pdf`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Exporter un rapport en Excel
  exportToExcel: async (reportId: string): Promise<Blob> => {
    const response = await api.get(`/api/reports/${reportId}/export/excel`, {
      responseType: 'blob'
    })
    return response.data
  }
}

// Service pour les informations système
export const systemService = {
  // Récupérer les informations de l'API
  getInfo: async (): Promise<any> => {
    const response = await api.get('/api/info')
    return response.data
  },

  // Vérifier la santé du système
  getHealth: async (): Promise<any> => {
    const response = await api.get('/api/health')
    return response.data
  }
}

export default api