'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { 
  UserIcon,
  CheckIcon, 
  XMarkIcon, 
  EyeIcon,
  PencilIcon,
  ClockIcon,
  ShieldCheckIcon,
  MusicalNoteIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
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
  bio: string | null;
  skillLevel: string | null;
  musicalExperience: number | null;
  canLead: boolean;
  church: {
    name: string;
    city: string;
  };
}

export default function AdminProfilesPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/profiles');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Erreur lors du chargement des profils');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des profils');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, approved: boolean) => {
    setProcessingUser(userId);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, approved }),
      });

      if (response.ok) {
        // Mettre à jour la liste des utilisateurs
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, isApproved: approved, approvedAt: approved ? new Date().toISOString() : null }
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    setProcessingUser(userId);
    try {
      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
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

  const filteredUsers = users.filter(user => {
    switch (filter) {
      case 'pending':
        return !user.isApproved;
      case 'approved':
        return user.isApproved;
      case 'rejected':
        return user.isApproved === false;
      default:
        return true;
    }
  });

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-700">Accès refusé. Rôle administrateur requis.</p>
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
          Gestion des Profils Utilisateurs
        </h1>
        <p className="text-gray-600">
          Validez et gérez les profils des utilisateurs de votre église
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6">
        <div className="flex space-x-2">
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
                {filter === 'all' 
                  ? 'Aucun utilisateur dans votre église'
                  : `Aucun utilisateur ${filter === 'pending' ? 'en attente' : filter === 'approved' ? 'approuvé' : 'refusé'}`
                }
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
                            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                            {user.church.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <ShieldCheckIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 capitalize">
                          {user.role}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MusicalNoteIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {JSON.parse(user.instruments).join(', ')}
                        </span>
                      </div>
                      {user.skillLevel && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            Niveau: {user.skillLevel}
                          </span>
                        </div>
                      )}
                      {user.musicalExperience && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            Expérience: {user.musicalExperience} an(s)
                          </span>
                        </div>
                      )}
                    </div>

                    {user.bio && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">{user.bio}</p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      {user.approvedAt && (
                        <span className="ml-4">
                          Approuvé le {new Date(user.approvedAt).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDetails(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Détails
                    </Button>

                    {!user.isApproved && (
                      <>
                        <Button
                          onClick={() => handleApproval(user.id, true)}
                          disabled={processingUser === user.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          {processingUser === user.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          ) : (
                            <>
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Approuver
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleApproval(user.id, false)}
                          disabled={processingUser === user.id}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          size="sm"
                        >
                          {processingUser === user.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-700 border-t-transparent rounded-full"></div>
                          ) : (
                            <>
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Refuser
                            </>
                          )}
                        </Button>
                      </>
                    )}

                    {user.isApproved && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Approuvé
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de détails utilisateur */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Détails du Profil</h2>
              <Button
                onClick={() => setShowUserDetails(false)}
                variant="outline"
                size="sm"
              >
                Fermer
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt="Avatar" className="w-16 h-16 rounded-full" />
                  ) : (
                    <UserIcon className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Téléphone</label>
                  <p className="text-sm text-gray-600">{selectedUser.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Rôle</label>
                  <p className="text-sm text-gray-600 capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Instruments</label>
                  <p className="text-sm text-gray-600">{JSON.parse(selectedUser.instruments).join(', ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Niveau</label>
                  <p className="text-sm text-gray-600">{selectedUser.skillLevel || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Expérience</label>
                  <p className="text-sm text-gray-600">{selectedUser.musicalExperience ? `${selectedUser.musicalExperience} an(s)` : 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Peut diriger</label>
                  <p className="text-sm text-gray-600">{selectedUser.canLead ? 'Oui' : 'Non'}</p>
                </div>
              </div>

              {selectedUser.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Bio</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedUser.bio}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-end space-x-2">
                  {!selectedUser.isApproved && (
                    <>
                      <Button
                        onClick={() => {
                          handleApproval(selectedUser.id, true);
                          setShowUserDetails(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        onClick={() => {
                          handleApproval(selectedUser.id, false);
                          setShowUserDetails(false);
                        }}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Refuser
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
