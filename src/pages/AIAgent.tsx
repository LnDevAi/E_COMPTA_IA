import React from 'react'
import { Bot, Upload, Scan, Zap, FileText } from 'lucide-react'

export function AIAgent() {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Agent IA Comptable
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Analyse automatique de documents et génération d'écritures comptables
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center mb-4">
            <Bot className="h-8 w-8 text-primary-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Analyse de documents</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Téléchargez vos factures, reçus et autres pièces comptables pour une analyse automatique par IA.
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Glissez-déposez vos documents ici ou
              </p>
              <button className="btn btn-primary mt-2">
                Sélectionner des fichiers
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Zap className="h-8 w-8 text-yellow-500 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Fonctionnalités IA</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start">
              <Scan className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-gray-900">OCR Avancé</p>
                <p className="text-sm text-gray-600">Extraction automatique des données</p>
              </div>
            </div>
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Classification Intelligente</p>
                <p className="text-sm text-gray-600">Attribution automatique des comptes</p>
              </div>
            </div>
            <div className="flex items-start">
              <Bot className="h-5 w-5 text-purple-500 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Suggestions Contextuelles</p>
                <p className="text-sm text-gray-600">Recommandations basées sur l'historique</p>
              </div>
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