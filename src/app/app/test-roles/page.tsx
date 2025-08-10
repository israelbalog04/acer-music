'use client';

import { useUserData } from '@/hooks/useUserData';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@prisma/client';
import { Card, CardHeader } from '@/components/ui/card';

export default function TestRolesPage() {
  const { userName, userRole, userId } = useUserData();

  const roleLabels = {
    [UserRole.ADMIN]: 'Administrateur',
    [UserRole.CHEF_LOUANGE]: 'Chef de Louange',
    [UserRole.MUSICIEN]: 'Musicien',
    [UserRole.TECHNICIEN]: 'Technicien'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Test des Rôles et Permissions</h1>
        <p className="text-gray-600 mt-2">
          Utilisateur : <strong>{userName}</strong> | 
          Rôle : <strong>{userRole ? roleLabels[userRole] : 'Non défini'}</strong>
        </p>
      </div>

      {/* Tests de permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section Admin */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-600">👑 Section Admin</h2>
          
          <RoleGuard allowedRoles={[UserRole.ADMIN]}>
            <Card className="border-red-200">
              <CardHeader>
                <h3 className="font-medium text-red-800">Gestion des Utilisateurs</h3>
                <p className="text-sm text-red-600">Accessible uniquement aux administrateurs</p>
              </CardHeader>
            </Card>
          </RoleGuard>

          <RoleGuard allowedRoles={[UserRole.ADMIN]}>
            <Card className="border-red-200">
              <CardHeader>
                <h3 className="font-medium text-red-800">Statistiques Globales</h3>
                <p className="text-sm text-red-600">Analytics et rapports complets</p>
              </CardHeader>
            </Card>
          </RoleGuard>
        </div>

        {/* Section Chef de Louange */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-green-600">🎵 Section Chef de Louange</h2>
          
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
            <Card className="border-green-200">
              <CardHeader>
                <h3 className="font-medium text-green-800">Création d'Événements</h3>
                <p className="text-sm text-green-600">Planning et organisation des services</p>
              </CardHeader>
            </Card>
          </RoleGuard>

          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
            <Card className="border-green-200">
              <CardHeader>
                <h3 className="font-medium text-green-800">Gestion du Répertoire</h3>
                <p className="text-sm text-green-600">Ajouter et organiser les chansons</p>
              </CardHeader>
            </Card>
          </RoleGuard>
        </div>

        {/* Section Musicien */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-600">🎸 Section Musicien</h2>
          
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
            <Card className="border-blue-200">
              <CardHeader>
                <h3 className="font-medium text-blue-800">Mes Enregistrements</h3>
                <p className="text-sm text-blue-600">Upload et gestion personnelle</p>
              </CardHeader>
            </Card>
          </RoleGuard>

          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
            <Card className="border-blue-200">
              <CardHeader>
                <h3 className="font-medium text-blue-800">Mes Disponibilités</h3>
                <p className="text-sm text-blue-600">Donner ses dispos pour les services</p>
              </CardHeader>
            </Card>
          </RoleGuard>
        </div>

        {/* Tests de permissions spécifiques */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-600">🔒 Tests de Permissions</h2>
          
          <RoleGuard requiredPermission="users.create">
            <Card className="border-purple-200">
              <CardHeader>
                <h3 className="font-medium text-purple-800">Créer Utilisateur</h3>
                <p className="text-sm text-purple-600">Permission : users.create</p>
              </CardHeader>
            </Card>
          </RoleGuard>

          <RoleGuard requiredPermission="recordings.approve">
            <Card className="border-purple-200">
              <CardHeader>
                <h3 className="font-medium text-purple-800">Approuver Enregistrements</h3>
                <p className="text-sm text-purple-600">Permission : recordings.approve</p>
              </CardHeader>
            </Card>
          </RoleGuard>

          <RoleGuard requiredPermission="schedules.create">
            <Card className="border-purple-200">
              <CardHeader>
                <h3 className="font-medium text-purple-800">Créer Événements</h3>
                <p className="text-sm text-purple-600">Permission : schedules.create</p>
              </CardHeader>
            </Card>
          </RoleGuard>

          <RoleGuard 
            requiredPermission="recordings.update.own" 
            resourceUserId={userId || ''}
          >
            <Card className="border-purple-200">
              <CardHeader>
                <h3 className="font-medium text-purple-800">Modifier Mes Enregistrements</h3>
                <p className="text-sm text-purple-600">Permission : recordings.update.own</p>
              </CardHeader>
            </Card>
          </RoleGuard>
        </div>
      </div>

      {/* Légende */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Légende des Rôles :</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span><strong>Admin :</strong> Accès total</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span><strong>Chef Louange :</strong> Gestion équipe</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span><strong>Musicien :</strong> Contributions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span><strong>Technicien :</strong> Support technique</span>
          </div>
        </div>
      </div>
    </div>
  );
}