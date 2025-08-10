'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  UsersIcon,
  CalendarIcon,
  MusicalNoteIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Church {
  id: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    schedules: number;
    songs: number;
  };
}

export default function SuperAdminChurchesPage() {
  const { data: session } = useSession();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingChurch, setProcessingChurch] = useState<string | null>(null);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [showChurchModal, setShowChurchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChurch, setNewChurch] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    if (session?.user?.role === 'SUPER_ADMIN') {
      fetchChurches();
    }
  }, [session]);

  const fetchChurches = async () => {
    try {
      const response = await fetch('/api/super-admin/churches');
      if (response.ok) {
        const data = await response.json();
        setChurches(data);
      } else {
        setError('Erreur lors du chargement des églises');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des églises');
    } finally {
      setLoading(false);
    }
  };

  const handleChurchUpdate = async (churchId: string, updateData: Partial<Church>) => {
    setProcessingChurch(churchId);
    try {
      const response = await fetch(`/api/super-admin/churches/${churchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        // Mettre à jour la liste des églises
        setChurches(prev => prev.map(church => 
          church.id === churchId 
            ? { ...church, ...result.church }
            : church
        ));
        setShowChurchModal(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la mise à jour');
    } finally {
      setProcessingChurch(null);
    }
  };

  const handleChurchDelete = async (churchId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette église ?')) {
      return;
    }

    setProcessingChurch(churchId);
    try {
      const response = await fetch(`/api/super-admin/churches/${churchId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Retirer l'église de la liste
        setChurches(prev => prev.filter(church => church.id !== churchId));
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la suppression');
    } finally {
      setProcessingChurch(null);
    }
  };

  const handleCreateChurch = async () => {
    setProcessingChurch('new');
    try {
      const response = await fetch('/api/super-admin/churches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChurch),
      });

      if (response.ok) {
        const result = await response.json();
        // Ajouter la nouvelle église à la liste
        setChurches(prev => [...prev, result.church]);
        setShowCreateModal(false);
        // Réinitialiser le formulaire
        setNewChurch({
          name: '',
          city: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          description: '',
          isActive: true
        });
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la création');
    } finally {
      setProcessingChurch(null);
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Toutes les Églises
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble de toutes les églises du réseau ACER
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
        >
          <BuildingOfficeIcon className="h-5 w-5 mr-2" />
          Ajouter une Église
        </Button>
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
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Églises</p>
                <p className="text-2xl font-bold text-gray-900">{churches.length}</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {churches.reduce((sum, church) => sum + church._count.users, 0)}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Événements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {churches.reduce((sum, church) => sum + church._count.schedules, 0)}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <MusicalNoteIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Chansons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {churches.reduce((sum, church) => sum + church._count.songs, 0)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Liste des églises */}
      <div className="space-y-4">
        {churches.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune église trouvée
              </h3>
              <p className="text-gray-600">
                Aucune église n'est encore enregistrée dans le système.
              </p>
            </div>
          </Card>
        ) : (
          churches.map((church) => (
            <Card key={church.id} className={`border-l-4 ${
              church.isActive ? 'border-l-green-400' : 'border-l-red-400'
            }`}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {church.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {church.city}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        church.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {church.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    {church.description && (
                      <p className="text-gray-600 mb-4">{church.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        {church.address && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {church.address}
                          </div>
                        )}
                        {church.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            {church.phone}
                          </div>
                        )}
                        {church.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                            {church.email}
                          </div>
                        )}
                        {church.website && (
                          <div className="flex items-center text-sm text-gray-600">
                            <GlobeAltIcon className="h-4 w-4 mr-2" />
                            <a href={church.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {church.website}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <UsersIcon className="h-4 w-4 mr-2" />
                          {church._count.users} utilisateurs
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {church._count.schedules} événements
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MusicalNoteIcon className="h-4 w-4 mr-2" />
                          {church._count.songs} chansons
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Créée le {new Date(church.createdAt).toLocaleDateString('fr-FR')}
                      {church.updatedAt !== church.createdAt && (
                        <span> • Modifiée le {new Date(church.updatedAt).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedChurch(church);
                        setShowChurchModal(true);
                      }}
                      disabled={processingChurch === church.id}
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

      {/* Modal de gestion des églises */}
      {showChurchModal && selectedChurch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BuildingOfficeIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Gérer {selectedChurch.name}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedChurch.city}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChurchModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Statistiques de l'église */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Statistiques de l'église</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{selectedChurch._count.users}</div>
                    <div className="text-xs text-gray-600">Utilisateurs</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">{selectedChurch._count.schedules}</div>
                    <div className="text-xs text-gray-600">Événements</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">{selectedChurch._count.songs}</div>
                    <div className="text-xs text-gray-600">Chansons</div>
                  </div>
                </div>
              </div>

              {/* Informations de base */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de l'église
                  </label>
                  <input
                    type="text"
                    value={selectedChurch.name}
                    onChange={(e) => {
                      setSelectedChurch(prev => prev ? { ...prev, name: e.target.value } : null);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    disabled={processingChurch === selectedChurch.id}
                    placeholder="Nom de l'église"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={selectedChurch.city}
                    onChange={(e) => {
                      setSelectedChurch(prev => prev ? { ...prev, city: e.target.value } : null);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    disabled={processingChurch === selectedChurch.id}
                    placeholder="Ville"
                  />
                </div>
              </div>

              {/* Contact et informations */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse complète
                </label>
                <input
                  type="text"
                  value={selectedChurch.address || ''}
                  onChange={(e) => {
                    setSelectedChurch(prev => prev ? { ...prev, address: e.target.value } : null);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  disabled={processingChurch === selectedChurch.id}
                  placeholder="Adresse de l'église"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={selectedChurch.phone || ''}
                    onChange={(e) => {
                      setSelectedChurch(prev => prev ? { ...prev, phone: e.target.value } : null);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    disabled={processingChurch === selectedChurch.id}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedChurch.email || ''}
                    onChange={(e) => {
                      setSelectedChurch(prev => prev ? { ...prev, email: e.target.value } : null);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    disabled={processingChurch === selectedChurch.id}
                    placeholder="contact@eglise.fr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  value={selectedChurch.website || ''}
                  onChange={(e) => {
                    setSelectedChurch(prev => prev ? { ...prev, website: e.target.value } : null);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  disabled={processingChurch === selectedChurch.id}
                  placeholder="https://www.eglise.fr"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={selectedChurch.description || ''}
                  onChange={(e) => {
                    setSelectedChurch(prev => prev ? { ...prev, description: e.target.value } : null);
                  }}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
                  disabled={processingChurch === selectedChurch.id}
                  placeholder="Description de l'église..."
                />
              </div>

              {/* Statut */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedChurch.isActive}
                    onChange={(e) => {
                      setSelectedChurch(prev => prev ? { ...prev, isActive: e.target.checked } : null);
                    }}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    disabled={processingChurch === selectedChurch.id}
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Église active</span>
                    <p className="text-xs text-gray-600">Permettre l'accès aux utilisateurs</p>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <Button
                  onClick={() => handleChurchUpdate(selectedChurch.id, selectedChurch)}
                  disabled={processingChurch === selectedChurch.id}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  {processingChurch === selectedChurch.id ? (
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
                  onClick={() => handleChurchDelete(selectedChurch.id)}
                  disabled={processingChurch === selectedChurch.id || selectedChurch._count.users > 0}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700 font-medium py-3 rounded-xl transition-all duration-200"
                >
                  {processingChurch === selectedChurch.id ? (
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

      {/* Modal de création d'église */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BuildingOfficeIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Créer une Nouvelle Église
                  </h3>
                  <p className="text-sm text-gray-600">Ajouter une église au réseau ACER</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de l'église *
                  </label>
                  <input
                    type="text"
                    value={newChurch.name}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="Nom de l'église"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={newChurch.city}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="Ville"
                    required
                  />
                </div>
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse complète
                </label>
                <input
                  type="text"
                  value={newChurch.address}
                  onChange={(e) => setNewChurch(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  placeholder="Adresse de l'église"
                />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={newChurch.phone}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newChurch.email}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="contact@eglise.fr"
                  />
                </div>
              </div>

              {/* Site web */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  value={newChurch.website}
                  onChange={(e) => setNewChurch(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  placeholder="https://www.eglise.fr"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newChurch.description}
                  onChange={(e) => setNewChurch(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
                  placeholder="Description de l'église..."
                />
              </div>

              {/* Statut */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={newChurch.isActive}
                    onChange={(e) => setNewChurch(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Église active</span>
                    <p className="text-xs text-gray-600">Permettre l'accès aux utilisateurs dès la création</p>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <Button
                  onClick={handleCreateChurch}
                  disabled={processingChurch === 'new' || !newChurch.name || !newChurch.city}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingChurch === 'new' ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Création...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      <span>Créer l'Église</span>
                    </div>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1 text-gray-600 border-gray-600 hover:bg-gray-50 hover:border-gray-700 font-medium py-3 rounded-xl transition-all duration-200"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
