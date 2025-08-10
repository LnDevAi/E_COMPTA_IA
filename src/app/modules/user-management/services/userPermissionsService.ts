import { User, UserRole, Permission, AuditLog } from '../types';

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  department?: string;
  phone?: string;
  permissions?: Permission[];
  sendInvitation?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  roleId?: string;
  department?: string;
  phone?: string;
  permissions?: Permission[];
  status?: 'active' | 'inactive' | 'suspended';
}

export interface PermissionCheck {
  userId: string;
  module: string;
  action: 'read' | 'create' | 'update' | 'delete' | 'export' | 'validate' | 'archive';
}

export class UserPermissionsService {
  private static instance: UserPermissionsService;
  private baseUrl = '/api/user-management';

  static getInstance(): UserPermissionsService {
    if (!UserPermissionsService.instance) {
      UserPermissionsService.instance = new UserPermissionsService();
    }
    return UserPermissionsService.instance;
  }

  // Gestion des utilisateurs
  async getUsers(companyId: string): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}/companies/${companyId}/users`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
      return await response.json();
    } catch (error) {
      console.error('Erreur getUsers:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`);
      if (!response.ok) throw new Error('Utilisateur non trouvé');
      return await response.json();
    } catch (error) {
      console.error('Erreur getUserById:', error);
      throw error;
    }
  }

  async createUser(companyId: string, userData: CreateUserRequest): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/companies/${companyId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'utilisateur');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur createUser:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return await response.json();
    } catch (error) {
      console.error('Erreur updateUser:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return true;
    } catch (error) {
      console.error('Erreur deleteUser:', error);
      throw error;
    }
  }

  async suspendUser(userId: string, reason?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Erreur lors de la suspension');
      return true;
    } catch (error) {
      console.error('Erreur suspendUser:', error);
      throw error;
    }
  }

  async activateUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/activate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erreur lors de l\'activation');
      return true;
    } catch (error) {
      console.error('Erreur activateUser:', error);
      throw error;
    }
  }

  // Gestion des rôles
  async getRoles(): Promise<UserRole[]> {
    try {
      const response = await fetch(`${this.baseUrl}/roles`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des rôles');
      return await response.json();
    } catch (error) {
      console.error('Erreur getRoles:', error);
      throw error;
    }
  }

  async createRole(roleData: Omit<UserRole, 'id'>): Promise<UserRole> {
    try {
      const response = await fetch(`${this.baseUrl}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) throw new Error('Erreur lors de la création du rôle');
      return await response.json();
    } catch (error) {
      console.error('Erreur createRole:', error);
      throw error;
    }
  }

  async updateRole(roleId: string, roleData: Partial<UserRole>): Promise<UserRole> {
    try {
      const response = await fetch(`${this.baseUrl}/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du rôle');
      return await response.json();
    } catch (error) {
      console.error('Erreur updateRole:', error);
      throw error;
    }
  }

  // Gestion des permissions
  async checkPermission(permissionCheck: PermissionCheck): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/permissions/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permissionCheck),
      });

      if (!response.ok) return false;
      const result = await response.json();
      return result.hasPermission;
    } catch (error) {
      console.error('Erreur checkPermission:', error);
      return false;
    }
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/permissions`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des permissions');
      return await response.json();
    } catch (error) {
      console.error('Erreur getUserPermissions:', error);
      throw error;
    }
  }

  async updateUserPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour des permissions');
      return true;
    } catch (error) {
      console.error('Erreur updateUserPermissions:', error);
      throw error;
    }
  }

  // Validation des permissions côté client
  hasPermission(user: User, module: string, action: string): boolean {
    // Vérifier le statut de l'utilisateur
    if (user.status !== 'active') {
      return false;
    }

    // Les administrateurs ont tous les droits
    if (user.role.level === 'administration') {
      return true;
    }

    // Vérifier les permissions spécifiques du module
    const modulePermission = user.permissions.find(p => p.module === module);
    if (!modulePermission) {
      return false;
    }

    // Vérifier l'action spécifique
    switch (action) {
      case 'read':
        return modulePermission.actions.read;
      case 'create':
        return modulePermission.actions.create;
      case 'update':
        return modulePermission.actions.update;
      case 'delete':
        return modulePermission.actions.delete;
      case 'export':
        return modulePermission.actions.export;
      case 'validate':
        return modulePermission.actions.validate;
      case 'archive':
        return modulePermission.actions.archive;
      default:
        return false;
    }
  }

  // Vérification des permissions par niveau de rôle
  canAccessModule(roleLevel: string, module: string): boolean {
    const moduleAccess: Record<string, string[]> = {
      'consultation': [
        'Dashboard',
        'États Financiers',
        'Reporting'
      ],
      'modification_partielle': [
        'Dashboard',
        'Écritures Comptables',
        'Rapprochement Bancaire',
        'Tiers',
        'États Financiers',
        'Reporting'
      ],
      'modification_totale': [
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
        'Reporting'
      ],
      'administration': [
        'ALL_MODULES' // Accès à tous les modules
      ]
    };

    const allowedModules = moduleAccess[roleLevel] || [];
    return allowedModules.includes('ALL_MODULES') || allowedModules.includes(module);
  }

  // Permissions par défaut selon le rôle
  getDefaultPermissions(roleLevel: string): Permission[] {
    const baseModules = [
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

    return baseModules.map(module => {
      const permission: Permission = {
        module,
        actions: {
          read: false,
          create: false,
          update: false,
          delete: false,
          export: false,
          validate: false,
          archive: false
        }
      };

      // Permissions selon le niveau
      switch (roleLevel) {
        case 'consultation':
          if (['Dashboard', 'États Financiers', 'Reporting'].includes(module)) {
            permission.actions.read = true;
            permission.actions.export = true;
          }
          break;

        case 'modification_partielle':
          if (['Dashboard', 'États Financiers', 'Reporting'].includes(module)) {
            permission.actions.read = true;
            permission.actions.export = true;
          }
          if (['Écritures Comptables', 'Rapprochement Bancaire', 'Tiers'].includes(module)) {
            permission.actions.read = true;
            permission.actions.create = true;
            permission.actions.update = true;
          }
          break;

        case 'modification_totale':
          if (module !== 'Gestion Utilisateurs') {
            permission.actions.read = true;
            permission.actions.create = true;
            permission.actions.update = true;
            permission.actions.export = true;
            permission.actions.validate = true;
            permission.actions.archive = true;
            
            // Restrictions sur la suppression
            if (!['Plan Comptable', 'Entreprise'].includes(module)) {
              permission.actions.delete = true;
            }
          }
          break;

        case 'administration':
          // Accès complet à tous les modules
          permission.actions = {
            read: true,
            create: true,
            update: true,
            delete: true,
            export: true,
            validate: true,
            archive: true
          };
          break;
      }

      return permission;
    }).filter(p => 
      p.actions.read || 
      p.actions.create || 
      p.actions.update || 
      p.actions.delete ||
      p.actions.export ||
      p.actions.validate ||
      p.actions.archive
    );
  }

  // Audit et logs
  async getAuditLogs(companyId: string, filters?: {
    userId?: string;
    module?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLog[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.userId) queryParams.append('userId', filters.userId);
      if (filters?.module) queryParams.append('module', filters.module);
      if (filters?.action) queryParams.append('action', filters.action);
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);

      const response = await fetch(`${this.baseUrl}/companies/${companyId}/audit-logs?${queryParams}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des logs');
      return await response.json();
    } catch (error) {
      console.error('Erreur getAuditLogs:', error);
      throw error;
    }
  }

  async logAction(action: string, module: string, details: string, entityId?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          module,
          details,
          entityId,
          timestamp: new Date().toISOString()
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur logAction:', error);
      return false;
    }
  }

  // Invitations utilisateurs
  async sendInvitation(email: string, roleId: string, companyId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          roleId,
          companyId
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'envoi de l\'invitation');
      return true;
    } catch (error) {
      console.error('Erreur sendInvitation:', error);
      throw error;
    }
  }

  async acceptInvitation(token: string, userData: {
    firstName: string;
    lastName: string;
    password: string;
    phone?: string;
  }): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/invitations/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          ...userData
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'acceptation de l\'invitation');
      return await response.json();
    } catch (error) {
      console.error('Erreur acceptInvitation:', error);
      throw error;
    }
  }

  // Paramètres de sécurité
  async getSecuritySettings(companyId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/companies/${companyId}/security-settings`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des paramètres');
      return await response.json();
    } catch (error) {
      console.error('Erreur getSecuritySettings:', error);
      throw error;
    }
  }

  async updateSecuritySettings(companyId: string, settings: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/companies/${companyId}/security-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour des paramètres');
      return true;
    } catch (error) {
      console.error('Erreur updateSecuritySettings:', error);
      throw error;
    }
  }

  // Utilitaires de validation
  validateUserData(userData: CreateUserRequest | UpdateUserRequest): string[] {
    const errors: string[] = [];

    if ('email' in userData) {
      if (!userData.email || !this.isValidEmail(userData.email)) {
        errors.push('Email invalide');
      }
    }

    if ('firstName' in userData) {
      if (!userData.firstName || userData.firstName.trim().length < 2) {
        errors.push('Le prénom doit contenir au moins 2 caractères');
      }
    }

    if ('lastName' in userData) {
      if (!userData.lastName || userData.lastName.trim().length < 2) {
        errors.push('Le nom doit contenir au moins 2 caractères');
      }
    }

    if ('phone' in userData && userData.phone) {
      if (!this.isValidPhone(userData.phone)) {
        errors.push('Numéro de téléphone invalide');
      }
    }

    return errors;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Statistiques utilisateurs
  async getUserStats(companyId: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    suspendedUsers: number;
    usersByRole: Record<string, number>;
    lastLoginStats: any;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/companies/${companyId}/stats`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
      return await response.json();
    } catch (error) {
      console.error('Erreur getUserStats:', error);
      throw error;
    }
  }
}