'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserIcon,
  BuildingOfficeIcon,
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  ShieldCheckIcon,
  MusicalNoteIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  instruments: string;
  isApproved: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  avatar: string | null;
  church: {
    id: string;
    name: string;
    city: string;
  };
}

export default function SuperAdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [churchFilter, setChurchFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    if (session?.user?.role === 'SUPER_ADMIN') {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/super-admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesStatus = 
      filter === 'all' ||
      (filter === 'pending' && !user.isApproved) ||
      (filter === 'approved' && user.isApproved) ||
      (filter === 'rejected' && user.isApproved === false);
    
    const matchesChurch = churchFilter === 'all' || user.church.id === churchFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesStatus && matchesChurch && matchesRole;
  });

  // Obtenir la liste unique des églises
  const churches = Array.from(new Set(users.map(user => user.church.id))).map(churchId => {
    const user = users.find(u => u.church.id === churchId);
    return user?.church;
  }).filter(Boolean);

  // Obtenir la liste unique des rôles
  const roles = Array.from(new Set(users.map(user => user.role))).sort();

  const handleRoleChange = async (userId: string, newRole: string) => {
    setProcessingUser(userId);
    try {
      const response = await fetch(`/api/super-admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        // Mettre à jour la liste des utilisateurs
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        ));
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors du changement de rôle');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du changement de rôle');
    } finally {
      setProcessingUser(null);
    }
  };

  const handleApproval = async (userId: string, approved: boolean) => {
    setProcessingUser(userId);
    try {
      const response = await fetch(`/api/super-admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isApproved: approved }),
      });

      if (response.ok) {
        // Mettre à jour la liste des utilisateurs
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                isApproved: approved, 
                approvedAt: approved ? new Date().toISOString() : null 
              }
            : user
        ));
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de l\'approbation');
    } finally {
      setProcessingUser(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    setProcessingUser(userId);
    try {
      const response = await fetch(`/api/super-admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Retirer l'utilisateur de la liste
        setUsers(prev => prev.filter(user => user.id !== userId));
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la suppression');
    } finally {
      setProcessingUser(null);
    }
  };

  if (session?.user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-700">Accès refusé. Rôle Super Administrateur requis.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tous les Utilisateurs
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de tous les utilisateurs du réseau ACER
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">En Attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => !u.isApproved).length}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <CheckIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Approuvés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isApproved).length}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Églises</p>
                <p className="text-2xl font-bold text-gray-900">{churches.length}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tous', count: users.length },
            { key: 'pending', label: 'En attente', count: users.filter(u => !u.isApproved).length },
            { key: 'approved', label: 'Approuvés', count: users.filter(u => u.isApproved).length },
            { key: 'rejected', label: 'Refusés', count: users.filter(u => u.isApproved === false).length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-[#3244c7] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrer par église
            </label>
            <select
              value={churchFilter}
              onChange={(e) => setChurchFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7]"
            >
              <option value="all">Toutes les églises</option>
              {churches.map((church) => (
                <option key={church?.id} value={church?.id}>
                  {church?.name} ({church?.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrer par rôle
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7]"
            >
              <option value="all">Tous les rôles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun utilisateur trouvé
              </h3>
              <p className="text-gray-600">
                Aucun utilisateur ne correspond aux critères de filtrage.
              </p>
            </div>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className={`border-l-4 ${
              user.isApproved 
                ? 'border-l-green-400' 
                : user.isApproved === false 
                  ? 'border-l-red-400'
                  : 'border-l-yellow-400'
            }`}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full" />
                        ) : (
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center">
                              <PhoneIcon className="h-4 w-4 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'CHEF_LOUANGE' ? 'bg-green-100 text-green-800' :
                          user.role === 'MULTIMEDIA' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : user.isApproved === false
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isApproved ? 'Approuvé' : user.isApproved === false ? 'Refusé' : 'En attente'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                          Église
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.church.name} ({user.church.city})
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <MusicalNoteIcon className="h-4 w-4 mr-2" />
                          Instruments
                        </div>
                        <p className="text-sm text-gray-900">
                          {user.instruments ? JSON.parse(user.instruments).join(', ') : 'Aucun'}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          Inscrit le
                        </div>
                        <p className="text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {user.isApproved && user.approvedAt && (
                      <div className="text-xs text-gray-500">
                        Approuvé le {new Date(user.approvedAt).toLocaleDateString('fr-FR')}
                        {user.approvedBy && ` par ${user.approvedBy}`}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      disabled={processingUser === user.id}
                    >
                      Gérer
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de gestion des utilisateurs */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Gérer {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Informations utilisateur */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Église:</span>
                    <p className="font-medium text-gray-900">{selectedUser.church.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Inscrit le:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Rôle de l'utilisateur
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => {
                    setSelectedUser(prev => prev ? { ...prev, role: e.target.value } : null);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  disabled={processingUser === selectedUser.id}
                >
                  <option value="MUSICIEN">🎵 Musicien</option>
                  <option value="CHEF_LOUANGE">🎼 Chef de Louange</option>
                  <option value="TECHNICIEN">🔧 Technicien</option>
                  <option value="MULTIMEDIA">📷 Multimédia</option>
                  <option value="ADMIN">⚙️ Administrateur</option>
                  <option value="SUPER_ADMIN">👑 Super Administrateur</option>
                </select>
              </div>

              {/* Statut d'approbation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Statut d'approbation
                </label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApproval(selectedUser.id, true)}
                    disabled={processingUser === selectedUser.id || selectedUser.isApproved}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      selectedUser.isApproved
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>{processingUser === selectedUser.id ? 'Traitement...' : 'Approuver'}</span>
                  </button>
                  <button
                    onClick={() => handleApproval(selectedUser.id, false)}
                    disabled={processingUser === selectedUser.id || !selectedUser.isApproved}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      !selectedUser.isApproved
                        ? 'bg-red-100 text-red-800 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>{processingUser === selectedUser.id ? 'Traitement...' : 'Refuser'}</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <Button
                  onClick={() => handleRoleChange(selectedUser.id, selectedUser.role)}
                  disabled={processingUser === selectedUser.id}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  {processingUser === selectedUser.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Mise à jour...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4" />
                      <span>Mettre à jour</span>
                    </div>
                  )}
                </Button>
                <Button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  disabled={processingUser === selectedUser.id || selectedUser.role === 'SUPER_ADMIN'}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700 font-medium py-3 rounded-xl transition-all duration-200"
                >
                  {processingUser === selectedUser.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Suppression...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <XMarkIcon className="h-4 w-4" />
                      <span>Supprimer</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
