'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import {
  MusicalNoteIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Song {
  id: string;
  title: string;
  artist: string;
  key?: string;
  bpm?: number;
  duration?: number;
  notes?: string;
  tags?: string;
}

interface EventSong {
  id: string;
  songId: string;
  eventId: string;
  order: number;
  song: Song;
}

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  description?: string;
}

export default function EventRepertoirePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { userRole, churchName } = useUserData();
  const [eventId, setEventId] = useState<string>('');
  const [event, setEvent] = useState<Event | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [eventSongs, setEventSongs] = useState<EventSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);

  useEffect(() => {
    const loadEventId = async () => {
      const { eventId: id } = await params;
      setEventId(id);
    };
    loadEventId();
  }, [params]);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données de l'événement
      const [eventResponse, songsResponse, eventSongsResponse] = await Promise.all([
        fetch(`/api/admin/events/${eventId}`),
        fetch('/api/songs'),
        fetch(`/api/events/${eventId}/songs`)
      ]);

      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setEvent(eventData);
      }

      if (songsResponse.ok) {
        const songsData = await songsResponse.json();
        setSongs(songsData.songs || []);
      }

      if (eventSongsResponse.ok) {
        const eventSongsData = await eventSongsResponse.json();
        setEventSongs(eventSongsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = (songs || []).filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddSongs = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songIds: selectedSongs })
      });

      if (response.ok) {
        setSelectedSongs([]);
        setShowAddModal(false);
        fetchEventData(); // Recharger les données
      } else {
        console.error('Erreur lors de l\'ajout des chansons');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/songs/${songId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchEventData(); // Recharger les données
      } else {
        console.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleReorderSongs = async (songId: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/events/${eventId}/songs/${songId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder })
      });

      if (response.ok) {
        fetchEventData(); // Recharger les données
      } else {
        console.error('Erreur lors du réordonnancement');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </RoleGuard>
    );
  }

  if (!event) {
    return (
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
        <div className="text-center py-12">
          <p className="text-gray-500">Événement non trouvé</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MusicalNoteIcon className="h-8 w-8 mr-3 text-blue-600" />
                Répertoire de l'Événement
              </h1>
              <p className="text-gray-600 mt-2">
                Gérer les chansons pour {event.title}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter des Chansons
          </Button>
        </div>

        {/* Event Info */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <span className="text-blue-900 font-medium">
                  {new Date(event.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                <span className="text-blue-900 font-medium">
                  {event.startTime} - {event.endTime}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {event.type}
                </span>
              </div>
            </div>
            {event.description && (
              <p className="text-blue-800 mt-2 text-sm">{event.description}</p>
            )}
          </div>
        </Card>

        {/* Current Repertoire */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              Répertoire Actuel ({eventSongs.length} chansons)
            </h2>
          </CardHeader>
          <div className="p-6">
            {eventSongs.length === 0 ? (
              <div className="text-center py-8">
                <MusicalNoteIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucune chanson dans le répertoire</p>
                <p className="text-gray-400 mt-2">
                  Ajoutez des chansons depuis le répertoire pour commencer.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventSongs.map((eventSong, index) => (
                  <div
                    key={eventSong.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{eventSong.song.title}</h3>
                        <p className="text-sm text-gray-600">{eventSong.song.artist}</p>
                        {eventSong.song.key && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-200 rounded mt-1">
                            Clé: {eventSong.song.key}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleRemoveSong(eventSong.songId)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Add Songs Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <MusicalNoteIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Ajouter des Chansons
                    </h3>
                    <p className="text-sm text-gray-600">
                      Sélectionnez les chansons à ajouter au répertoire
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedSongs([]);
                    setSearchTerm('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Search */}
              <div className="p-6 border-b border-gray-100">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Rechercher des chansons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Songs List */}
              <div className="flex-1 overflow-y-auto max-h-96">
                <div className="p-6">
                  <div className="space-y-2">
                    {filteredSongs.map((song) => {
                      const isSelected = selectedSongs.includes(song.id);
                      const isAlreadyAdded = eventSongs.some(es => es.songId === song.id);
                      
                      return (
                        <div
                          key={song.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-200' 
                              : isAlreadyAdded
                              ? 'bg-gray-50 border-gray-200 opacity-50'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {!isAlreadyAdded && (
                              <button
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedSongs(prev => prev.filter(id => id !== song.id));
                                  } else {
                                    setSelectedSongs(prev => [...prev, song.id]);
                                  }
                                }}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  isSelected 
                                    ? 'bg-blue-600 border-blue-600' 
                                    : 'border-gray-300 hover:border-blue-400'
                                }`}
                              >
                                {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                              </button>
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900">{song.title}</h4>
                              <p className="text-sm text-gray-600">{song.artist}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {song.key && (
                                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                    Clé: {song.key}
                                  </span>
                                )}
                                                                 {song.bpm && (
                                   <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                     {song.bpm} BPM
                                   </span>
                                 )}
                                 {song.duration && (
                                   <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                     {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                                   </span>
                                 )}
                              </div>
                            </div>
                          </div>
                          {isAlreadyAdded && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Déjà ajoutée
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {selectedSongs.length} chanson(s) sélectionnée(s)
                  </span>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => {
                        setShowAddModal(false);
                        setSelectedSongs([]);
                        setSearchTerm('');
                      }}
                      variant="outline"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleAddSongs}
                      disabled={selectedSongs.length === 0}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Ajouter {selectedSongs.length} chanson(s)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
