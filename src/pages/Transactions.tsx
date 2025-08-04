import React from 'react'
import { Plus, Search, Filter, Download, Upload } from 'lucide-react'

export function Transactions() {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Écritures Comptables
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestion des transactions et écritures comptables
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button className="btn btn-outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </button>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle écriture
          </button>
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