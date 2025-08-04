import React from 'react'
import { Settings as SettingsIcon, User, Building, Shield, Bell } from 'lucide-react'

export function Settings() {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Paramètres
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configuration de l'application et préférences utilisateur
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Profil utilisateur</h3>
          </div>
          <p className="text-gray-600">
            Gérer vos informations personnelles et préférences
          </p>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Building className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Organisation</h3>
          </div>
          <p className="text-gray-600">
            Paramètres de votre entité à but non lucratif
          </p>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Sécurité</h3>
          </div>
          <p className="text-gray-600">
            Gestion des accès et de la sécurité
          </p>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-yellow-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          <p className="text-gray-600">
            Configuration des alertes et notifications
          </p>
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