'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  UserGroupIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  EyeIcon,
  PencilIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CogIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLogin: string;
  createdAt: string;
  permissions: Permission[];
  department?: string;
  phone?: string;
}

interface UserRole {
  id: string;
  name: string;
  level: 'consultation' | 'modification_partielle' | 'modification_totale' | 'administration';
  description: string;
  color: string;
}

interface Permission {
  module: string;
  actions: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
    validate: boolean;
    archive: boolean;
  };
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  result: 'success' | 'failure';
}

export default function UserPermissionsDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const modules = [
    'Dashboard',
    'Écritures Comptables',
    'Plan Comptable',
    'Journaux',
    'Grand Livre',
    'Balances',
    'Rapprochement Bancaire',
    'États Financiers',
    'Déclarations Fiscales',
    'Tiers',
    'Entreprise',
    'Reporting',
    'Gestion Utilisateurs'
  ];

  useEffect(() => {
    // Définition des rôles prédéfinis
    setRoles([
      {
        id: 'consultation',
        name: 'Consultation',
        level: 'consultation',
        description: 'Accès en lecture seule à tous les modules autorisés',
        color: 'bg-blue-100 text-blue-800'
      },
      {
        id: 'comptable',
        name: 'Comptable',
        level: 'modification_partielle',
        description: 'Saisie et modification des écritures, consultation des états',
        color: 'bg-green-100 text-green-800'
      },
      {
        id: 'responsable',
        name: 'Responsable Comptable',
        level: 'modification_totale',
        description: 'Accès complet aux modules comptables, validation des états',
        color: 'bg-orange-100 text-orange-800'
      },
      {
        id: 'admin',
        name: 'Administrateur',
        level: 'administration',
        description: 'Accès total au système, gestion des utilisateurs et paramètres',
        color: 'bg-red-100 text-red-800'
      }
    ]);

    // Simulation des utilisateurs
    setUsers([
      {
        id: 'user_1',
        email: 'admin@entreprise.com',
        firstName: 'Admin',
        lastName: 'Système',
        role: roles.find(r => r.id === 'admin')!,
        status: 'active',
        lastLogin: '2024-12-09 15:30:00',
        createdAt: '2024-01-15 10:00:00',
        department: 'Direction',
        phone: '+226 70 12 34 56',
        permissions: [
          {
            module: 'Tous les modules',
            actions: {
              read: true,
              create: true,
              update: true,
              delete: true,
              export: true,
              validate: true,
              archive: true
            }
          }
        ]
      },
      {
        id: 'user_2',
        email: 'marie.ouedraogo@entreprise.com',
        firstName: 'Marie',
        lastName: 'Ouédraogo',
        role: roles.find(r => r.id === 'responsable')!,
        status: 'active',
        lastLogin: '2024-12-09 14:45:00',
        createdAt: '2024-02-01 09:00:00',
        department: 'Comptabilité',
        phone: '+226 70 98 76 54',
        permissions: [
          {
            module: 'États Financiers',
            actions: {
              read: true,
              create: true,
              update: true,
              delete: false,
              export: true,
              validate: true,
              archive: true
            }
          },
          {
            module: 'Déclarations Fiscales',
            actions: {
              read: true,
              create: true,
              update: true,
              delete: false,
              export: true,
              validate: true,
              archive: false
            }
          }
        ]
      },
      {
        id: 'user_3',
        email: 'ibrahim.kone@entreprise.com',
        firstName: 'Ibrahim',
        lastName: 'Koné',
        role: roles.find(r => r.id === 'comptable')!,
        status: 'active',
        lastLogin: '2024-12-09 16:20:00',
        createdAt: '2024-03-10 08:30:00',
        department: 'Comptabilité',
        phone: '+226 70 45 67 89',
        permissions: [
          {
            module: 'Écritures Comptables',
            actions: {
              read: true,
              create: true,
              update: true,
              delete: false,
              export: false,
              validate: false,
              archive: false
            }
          },
          {
            module: 'Rapprochement Bancaire',
            actions: {
              read: true,
              create: true,
              update: true,
              delete: false,
              export: false,
              validate: false,
              archive: false
            }
          }
        ]
      },
      {
        id: 'user_4',
        email: 'fatou.traore@entreprise.com',
        firstName: 'Fatou',
        lastName: 'Traoré',
        role: roles.find(r => r.id === 'consultation')!,
        status: 'active',
        lastLogin: '2024-12-08 17:15:00',
        createdAt: '2024-04-05 14:00:00',
        department: 'Direction',
        phone: '+226 70 23 45 67',
        permissions: [
          {
            module: 'Dashboard',
            actions: {
              read: true,
              create: false,
              update: false,
              delete: false,
              export: true,
              validate: false,
              archive: false
            }
          },
          {
            module: 'États Financiers',
            actions: {
              read: true,
              create: false,
              update: false,
              delete: false,
              export: true,
              validate: false,
              archive: false
            }
          }
        ]
      },
      {
        id: 'user_5',
        email: 'nouveau@entreprise.com',
        firstName: 'Nouvel',
        lastName: 'Utilisateur',
        role: roles.find(r => r.id === 'consultation')!,
        status: 'pending',
        lastLogin: '',
        createdAt: '2024-12-09 10:00:00',
        department: 'Comptabilité',
        permissions: []
      }
    ]);

    // Simulation des logs d'audit
    setAuditLogs([
      {
        id: 'log_1',
        userId: 'user_2',
        userName: 'Marie Ouédraogo',
        action: 'Validation bilan',
        module: 'États Financiers',
        details: 'Validation du bilan 2024 - Période: Décembre',
        timestamp: '2024-12-09 14:45:32',
        ipAddress: '192.168.1.45',
        result: 'success'
      },
      {
        id: 'log_2',
        userId: 'user_3',
        userName: 'Ibrahim Koné',
        action: 'Création écriture',
        module: 'Écritures Comptables',
        details: 'Nouvelle écriture - Journal VENTE - Montant: 125,000 FCFA',
        timestamp: '2024-12-09 16:20:15',
        ipAddress: '192.168.1.67',
        result: 'success'
      },
      {
        id: 'log_3',
        userId: 'user_4',
        userName: 'Fatou Traoré',
        action: 'Export rapport',
        module: 'Dashboard',
        details: 'Export PDF - Tableau de bord mensuel',
        timestamp: '2024-12-08 17:15:44',
        ipAddress: '192.168.1.23',
        result: 'success'
      },
      {
        id: 'log_4',
        userId: 'user_3',
        userName: 'Ibrahim Koné',
        action: 'Tentative suppression',
        module: 'Écritures Comptables',
        details: 'Tentative de suppression écriture validée - REFUSÉ',
        timestamp: '2024-12-09 11:30:22',
        ipAddress: '192.168.1.67',
        result: 'failure'
      }
    ]);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role.id === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'suspended': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'suspended': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'pending': return 'En attente';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  const getRoleIcon = (level: string) => {
    switch (level) {
      case 'consultation': return <EyeIcon className="h-4 w-4" />;
      case 'modification_partielle': return <PencilIcon className="h-4 w-4" />;
      case 'modification_totale': return <DocumentTextIcon className="h-4 w-4" />;
      case 'administration': return <ShieldCheckIcon className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  const handleUserAction = (action: string, userId: string) => {
    // Simulation des actions utilisateur
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: action === 'activate' ? 'active' : action === 'suspend' ? 'suspended' : user.status }
        : user
    ));
  };

  const pendingUsers = users.filter(user => user.status === 'pending');
  const activeUsers = users.filter(user => user.status === 'active');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            Administration des accès et permissions par entreprise
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowAddUser(true)} className="flex items-center space-x-2">
            <UserPlusIcon className="h-4 w-4" />
            <span>Inviter utilisateur</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <CogIcon className="h-4 w-4" />
            <span>Paramètres</span>
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <Input
                placeholder="Nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Exporter liste
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total utilisateurs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tous statuts
                </p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeUsers.length}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Connectés récemment
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {pendingUsers.length}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  À valider
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administrateurs</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.role.level === 'administration').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Accès complet
                </p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {pendingUsers.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <ClockIcon className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{pendingUsers.length} utilisateur(s) en attente</strong> de validation. 
            Vérifiez leurs accès avant activation.
          </AlertDescription>
        </Alert>
      )}

      {/* Onglets */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
          <TabsTrigger value="audit">Journal d'audit</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserGroupIcon className="h-5 w-5" />
                <span>Liste des utilisateurs</span>
                <Badge variant="outline">{filteredUsers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(user.status)}
                              <span>{getStatusText(user.status)}</span>
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Rôle:</span>
                            <div className="flex items-center space-x-1 mt-1">
                              {getRoleIcon(user.role.level)}
                              <Badge className={`text-xs ${user.role.color}`}>
                                {user.role.name}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Département:</span>
                            <p className="mt-1">{user.department || 'Non défini'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Dernière connexion:</span>
                            <p className="mt-1">
                              {user.lastLogin ? 
                                new Date(user.lastLogin).toLocaleDateString('fr-FR') : 
                                'Jamais connecté'
                              }
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Téléphone:</span>
                            <p className="mt-1">{user.phone || 'Non renseigné'}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className="font-medium text-sm">Permissions:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.permissions.slice(0, 3).map((perm, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {perm.module}
                              </Badge>
                            ))}
                            {user.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.permissions.length - 3} autres
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <EyeIcon className="h-4 w-4" />
                          <span>Voir</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <PencilIcon className="h-4 w-4" />
                          <span>Modifier</span>
                        </Button>
                        {user.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUserAction('activate', user.id)}
                            className="flex items-center space-x-1"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Activer</span>
                          </Button>
                        )}
                        {user.status === 'active' && user.role.level !== 'administration' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleUserAction('suspend', user.id)}
                            className="flex items-center space-x-1"
                          >
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span>Suspendre</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun utilisateur trouvé pour les critères sélectionnés</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getRoleIcon(role.level)}
                    <span>{role.name}</span>
                    <Badge className={`text-xs ${role.color}`}>
                      {role.level.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Permissions par défaut:</h4>
                    
                    {role.level === 'consultation' && (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <EyeIcon className="h-3 w-3 text-green-600" />
                          <span>Consultation de tous les modules autorisés</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DocumentTextIcon className="h-3 w-3 text-green-600" />
                          <span>Export des rapports (PDF, Excel)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ExclamationTriangleIcon className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">Aucune modification autorisée</span>
                        </div>
                      </div>
                    )}

                    {role.level === 'modification_partielle' && (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-3 w-3 text-green-600" />
                          <span>Saisie et modification des écritures</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-3 w-3 text-green-600" />
                          <span>Rapprochement bancaire</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ExclamationTriangleIcon className="h-3 w-3 text-orange-600" />
                          <span className="text-orange-600">Validation limitée</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ExclamationTriangleIcon className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">Pas de suppression des écritures validées</span>
                        </div>
                      </div>
                    )}

                    {role.level === 'modification_totale' && (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-3 w-3 text-green-600" />
                          <span>Accès complet aux modules comptables</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-3 w-3 text-green-600" />
                          <span>Validation des états financiers</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-3 w-3 text-green-600" />
                          <span>Gestion des déclarations fiscales</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ExclamationTriangleIcon className="h-3 w-3 text-orange-600" />
                          <span className="text-orange-600">Pas d'accès à la gestion utilisateurs</span>
                        </div>
                      </div>
                    )}

                    {role.level === 'administration' && (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-3 w-3 text-green-600" />
                          <span>Accès total au système</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-3 w-3 text-green-600" />
                          <span>Gestion des utilisateurs et permissions</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-3 w-3 text-green-600" />
                          <span>Configuration système</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-3 w-3 text-green-600" />
                          <span>Audit et logs de sécurité</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Utilisateurs assignés</span>
                      <span className="font-medium">
                        {users.filter(u => u.role.id === role.id).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Journal d'audit</span>
                <Badge variant="outline">{auditLogs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={log.result === 'success' ? 'default' : 'destructive'} className="text-xs">
                            {log.result === 'success' ? 'Succès' : 'Échec'}
                          </Badge>
                          <span className="text-sm font-medium">{log.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.module}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{log.details}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            <UserIcon className="h-3 w-3 inline mr-1" />
                            {log.userName}
                          </span>
                          <span>
                            <ClockIcon className="h-3 w-3 inline mr-1" />
                            {new Date(log.timestamp).toLocaleString('fr-FR')}
                          </span>
                          <span>
                            <GlobeAltIcon className="h-3 w-3 inline mr-1" />
                            {log.ipAddress}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CogIcon className="h-5 w-5" />
                <span>Paramètres de sécurité</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Politique des mots de passe</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Longueur minimale (8 caractères)</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Caractères spéciaux obligatoires</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expiration tous les 90 jours</span>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Sessions utilisateur</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Déconnexion automatique (30 min)</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Une seule session par utilisateur</span>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Audit et logs</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enregistrer toutes les actions</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conserver les logs 12 mois</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Alertes en cas d'activité suspecte</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button className="w-full">Sauvegarder les paramètres</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}