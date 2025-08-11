'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  role: string;
  instrument: string;
}

interface Song {
  id: string;
  title: string;
}

export default function PlanningCreatePage() {
  const [formData, setFormData] = useState({
    title: '',
    type: 'SERVICE',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    notes: '',
    assignedUsers: [] as string[],
    songs: [] as string[]
  });

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoadingData(true);
      
      const [usersRes, songsRes] = await Promise.all([
        fetch('/api/users/available'),
        fetch('/api/songs')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAvailableUsers(usersData);
      }

      if (songsRes.ok) {
        const songsData = await songsRes.json();
        setAvailableSongs(songsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const eventTypes = [
    { value: 'SERVICE', label: 'Service/Culte', color: 'bg-blue-100 text-blue-800' },
    { value: 'REPETITION', label: 'Répétition', color: 'bg-green-100 text-green-800' },
    { value: 'CONCERT', label: 'Concert/Événement', color: 'bg-purple-100 text-purple-800' },
    { value: 'FORMATION', label: 'Formation', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const locations = [
    'Sanctuaire Principal',
    'Salle de Répétition',
    'Salle de Conférence',
    'Chapelle',
    'Extérieur',
    'Autre'
  ];

  const handleUserToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(userId)
        ? prev.assignedUsers.filter(id => id !== userId)
        : [...prev.assignedUsers, userId]
    }));
  };

  const handleSongToggle = (songId: string) => {
    setFormData(prev => ({
      ...prev,
      songs: prev.songs.includes(songId)
        ? prev.songs.filter(s => s !== songId)
        : [...prev.songs, songId]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'L\'heure de début est requise';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'L\'heure de fin est requise';
    }
    if (!formData.location) {
      newErrors.location = 'Le lieu est requis';
    }
    if (formData.assignedUsers.length === 0) {
      newErrors.assignedUsers = 'Au moins un musicien doit être assigné';
    }

    // Vérifier que l'heure de fin est après l'heure de début
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'L\'heure de fin doit être après l\'heure de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Événement créé avec succès !');
        
        // Reset du formulaire
        setFormData({
          title: '',
          type: 'SERVICE',
          date: '',
          startTime: '',
          endTime: '',
          location: '',
          description: '',
          notes: '',
          assignedUsers: [],
          songs: []
        });
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.message || 'Erreur lors de la création'}`);
      }
      
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const getUserById = (id: string) => {
    return availableUsers.find(user => user.id === id);
  };

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <PlusIcon className="h-8 w-8 mr-3 text-green-600" />
            Créer un Événement
          </h1>
          <p className="text-gray-600 mt-2">
            Planifier un service, une répétition ou un événement spécial
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations Principales */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Informations Générales
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de l'événement <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Culte du Dimanche, Répétition Générale..."
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  {/* Type d'événement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'événement
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {eventTypes.map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                          className={`p-3 text-left border rounded-lg transition-all ${
                            formData.type === type.value
                              ? 'border-green-500 ring-2 ring-green-200'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${type.color} mb-1`}>
                            {type.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date et Heures */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.date ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Début <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.startTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fin <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.endTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
                    </div>
                  </div>

                  {/* Lieu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Sélectionner un lieu</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Description de l'événement..."
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes internes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Notes pour l'équipe..."
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Assignations */}
            <div className="space-y-6">
              {/* Musiciens */}
              <Card className="p-6">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2" />
                    Équipe <span className="text-red-500">*</span>
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {loadingData ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Chargement des utilisateurs...</p>
                    </div>
                  ) : availableUsers.length > 0 ? (
                    availableUsers.map(user => (
                      <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={formData.assignedUsers.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.role} • {user.instrument}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <UsersIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Aucun utilisateur disponible</p>
                    </div>
                  )}
                </div>
                {errors.assignedUsers && <p className="text-red-500 text-sm mt-2">{errors.assignedUsers}</p>}
                
                {formData.assignedUsers.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Sélectionnés:</p>
                    <div className="space-y-1">
                      {formData.assignedUsers.map(userId => {
                        const user = getUserById(userId);
                        return user ? (
                          <div key={userId} className="flex items-center justify-between bg-green-50 px-2 py-1 rounded text-sm">
                            <span>{user.name}</span>
                            <button
                              type="button"
                              onClick={() => handleUserToggle(userId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </Card>

              {/* Répertoire */}
              <Card className="p-6">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MusicalNoteIcon className="h-5 w-5 mr-2" />
                    Répertoire
                  </h3>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {loadingData ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Chargement des chansons...</p>
                    </div>
                  ) : availableSongs.length > 0 ? (
                    availableSongs.map(song => (
                      <div key={song.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={formData.songs.includes(song.id)}
                          onChange={() => handleSongToggle(song.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">{song.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <MusicalNoteIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Aucune chanson disponible</p>
                    </div>
                  )}
                </div>
                
                {formData.songs.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Chansons sélectionnées:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.songs.map(songId => {
                        const song = availableSongs.find(s => s.id === songId);
                        return song ? (
                          <span key={songId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {song.title}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </div>
              ) : (
                'Créer l\'Événement'
              )}
            </Button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}