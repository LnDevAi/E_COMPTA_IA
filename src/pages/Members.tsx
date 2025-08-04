import React from 'react'
import { Plus, Users, UserPlus, Mail } from 'lucide-react'

export function Members() {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Gestion des Adhérents
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestion des membres, cotisations et contributions EBNL
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button className="btn btn-outline">
            <Mail className="h-4 w-4 mr-2" />
            Envoyer rappel
          </button>
          <button className="btn btn-primary">
            <UserPlus className="h-4 w-4 mr-2" />
            Nouvel adhérent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">127</div>
          <div className="text-sm text-gray-500">Adhérents actifs</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">€12,750</div>
          <div className="text-sm text-gray-500">Cotisations 2024</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">15</div>
          <div className="text-sm text-gray-500">En attente</div>
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