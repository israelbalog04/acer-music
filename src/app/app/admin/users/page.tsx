'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MusicalNoteIcon,
  StarIcon,
  CogIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  instruments: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const { userRole, churchName } = useUserData();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: UserRole) => {
    try {
      // Logique pour changer le rôle (à implémenter selon vos besoins)
      alert('Fonctionnalité de changement de rôle à implémenter');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchUsers();
        alert('Utilisateur supprimé avec succès');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'Administrateur';
      case UserRole.CHEF_LOUANGE: return 'Chef de Louange';
      case UserRole.MUSICIEN: return 'Musicien';
      case UserRole.TECHNICIEN: return 'Technicien';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-red-100 text-red-800';
      case UserRole.CHEF_LOUANGE: return 'bg-purple-100 text-purple-800';
      case UserRole.MUSICIEN: return 'bg-blue-100 text-blue-800';
      case UserRole.TECHNICIEN: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return CogIcon;
      case UserRole.CHEF_LOUANGE: return StarIcon;
      case UserRole.MUSICIEN: return MusicalNoteIcon;
      case UserRole.TECHNICIEN: return CogIcon;
      default: return UserIcon;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    byRole: {
      admin: users.filter(u => u.role === UserRole.ADMIN).length,
      chef: users.filter(u => u.role === UserRole.CHEF_LOUANGE).length,
      musicien: users.filter(u => u.role === UserRole.MUSICIEN).length,
      technicien: users.filter(u => u.role === UserRole.TECHNICIEN).length
    }
  };

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UsersIcon className="h-8 w-8 mr-3 text-blue-600" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les utilisateurs de {churchName}
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouvel Utilisateur
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <StarIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Chefs de Louange</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byRole.chef}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <CogIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Techniciens</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byRole.technicien}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <MusicalNoteIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Musiciens</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byRole.musicien}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tous les rôles</option>
                  <option value={UserRole.ADMIN}>Administrateurs</option>
                  <option value={UserRole.CHEF_LOUANGE}>Chefs de Louange</option>
                  <option value={UserRole.MUSICIEN}>Musiciens</option>
                  <option value={UserRole.TECHNICIEN}>Techniciens</option>
                </select>
                
                
              </div>
              
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {filteredUsers.length} utilisateur(s) trouvé(s)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Liste des utilisateurs */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
            <p className="text-gray-400 mt-2">
              Aucun utilisateur ne correspond à vos critères de recherche.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              const instruments = user.instruments ? JSON.parse(user.instruments) : [];
              
              return (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        
                        {/* Informations utilisateur */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {user.firstName} {user.lastName}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                            
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <EnvelopeIcon className="h-4 w-4 mr-1" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center">
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                {user.phone}
                              </span>
                            )}
                            <span className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              Inscrit le {formatDate(user.createdAt)}
                            </span>
                          </div>
                          
                          {instruments.length > 0 && (
                            <div className="flex items-center mt-2">
                              <MusicalNoteIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">
                                {instruments.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowUserDetails(showUserDetails === user.id ? null : user.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                                                 <button
                           onClick={() => toggleUserRole(user.id, user.role)}
                           className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                           title="Changer le rôle"
                         >
                           <StarIcon className="h-4 w-4" />
                         </button>
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Détails supplémentaires */}
                    {showUserDetails === user.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Informations détaillées</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p><strong>ID :</strong> {user.id}</p>
                              <p><strong>Email :</strong> {user.email}</p>
                              {user.phone && <p><strong>Téléphone :</strong> {user.phone}</p>}
                                                             <p><strong>Rôle :</strong> {getRoleLabel(user.role)}</p>
                               <p><strong>Inscrit le :</strong> {formatDate(user.createdAt)}</p>
                               <p><strong>Dernière mise à jour :</strong> {formatDate(user.updatedAt)}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Instruments</h4>
                            {instruments.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {instruments.map((instrument: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {instrument}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Aucun instrument renseigné</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}