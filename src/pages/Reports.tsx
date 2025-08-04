import React from 'react'
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react'

export function Reports() {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            États Financiers
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Génération des rapports financiers conformes SYCEBNL
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Bilan</h3>
              <p className="text-sm text-gray-500">Situation patrimoniale</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Compte de résultat</h3>
              <p className="text-sm text-gray-500">Performance financière</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Flux de trésorerie</h3>
              <p className="text-sm text-gray-500">Mouvements de liquidités</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <p className="text-center text-gray-500 py-12">
          Module en cours de développement...
        </p>
      </div>
    </div>
  )
}