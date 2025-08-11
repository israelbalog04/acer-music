'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import {
  MusicalNoteIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlayIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface EventSong {
  id: string;
  title: string;
  artist?: string;
  key?: string;
  youtubeUrl?: string;
  eventOrder?: number;
  eventKey?: string;
  eventNotes?: string;
  recordingsCount: number;
  sequencesCount: number;
  tags: string[];
}

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
}

export default function EventRepertoirePage() {
  const { eventId } = useParams();
  const { userRole, churchName } = useUserData();
  const [event, setEvent] = useState<Event | null>(null);
  const [eventSongs, setEventSongs] = useState<EventSong[]>([]);
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
      fetchAllSongs();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/songs`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data.event);
        setEventSongs(data.songs || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSongs = async () => {
    try {
      const response = await fetch('/api/songs');
      if (response.ok) {
        const data = await response.json();
        setAllSongs(data.songs || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const addSongToEvent = async (songId: string, order?: number, key?: string) => {
    try {
      setAdding(true);
      const response = await fetch(`/api/events/${eventId}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId,
          order,
          key
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEventSongs(prev => [...prev, data.song]);
        setShowAddModal(false);
        alert('✅ Morceau ajouté à l\'événement !');
      } else {
        const error = await response.json();
        alert('❌ ' + (error.error || 'Erreur lors de l\'ajout'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion');
    } finally {
      setAdding(false);
    }
  };

  const removeSongFromEvent = async (eventSongId: string) => {
    if (!confirm('Supprimer ce morceau de l\'événement ?')) return;

    try {
      const response = await fetch(`/api/events/${eventId}/songs/${eventSongId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setEventSongs(prev => prev.filter(s => s.id !== eventSongId));
        alert('✅ Morceau supprimé de l\'événement');
      } else {
        alert('❌ Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion');
    }
  };

  const filteredAllSongs = allSongs.filter(song => {
    const matchesSearch = !searchTerm || 
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const notInEvent = !eventSongs.some(es => es.title === song.title && es.artist === song.artist);
    
    return matchesSearch && notInEvent;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MusicalNoteIcon className="h-8 w-8 mr-3 text-blue-600" />
              Répertoire de l'événement
            </h1>
            {event && (
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-gray-600 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {event.title} - {new Date(event.date).toLocaleDateString('fr-FR')}
                </p>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {event.type}
                </span>
              </div>
            )}
          </div>
          {(userRole === UserRole.ADMIN || userRole === UserRole.CHEF_LOUANGE) && (
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter un morceau
            </Button>
          )}
        </div>

        {/* Morceaux de l'événement */}
        <Card>
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Morceaux sélectionnés ({eventSongs.length})
            </h2>
          </div>
          <div className="p-6">
            {eventSongs.length === 0 ? (
              <div className="text-center py-8">
                <MusicalNoteIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun morceau sélectionné pour cet événement</p>
                <p className="text-gray-400 text-sm mt-2">
                  Cliquez sur "Ajouter un morceau" pour commencer à construire le répertoire
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {eventSongs
                  .sort((a, b) => (a.eventOrder || 999) - (b.eventOrder || 999))
                  .map((song, index) => (
                    <div
                      key={song.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                              {song.eventOrder || index + 1}
                            </span>
                            <div>
                              <h3 className="font-semibold text-gray-900">{song.title}</h3>
                              {song.artist && (
                                <p className="text-sm text-gray-600">{song.artist}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-1">
                                {(song.eventKey || song.key) && (
                                  <span className="text-xs text-blue-600 font-medium">
                                    Tonalité: {song.eventKey || song.key}
                                  </span>
                                )}
                                {song.tags && song.tags.length > 0 && (
                                  <div className="flex space-x-1">
                                    {song.tags.slice(0, 2).map((tag, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {song.eventNotes && (
                            <div className="mt-2 ml-11">
                              <p className="text-sm text-gray-600 italic">{song.eventNotes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <DocumentTextIcon className="h-3 w-3 mr-1" />
                              {song.sequencesCount}
                            </span>
                          </div>
                          {song.youtubeUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(song.youtubeUrl, '_blank')}
                            >
                              <PlayIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {(userRole === UserRole.ADMIN || userRole === UserRole.CHEF_LOUANGE) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSongFromEvent(song.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </Card>

        {/* Modal d'ajout de morceau */}
        {showAddModal && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <PlusIcon className="h-6 w-6 mr-2 text-blue-600" />
                    Ajouter un morceau à l'événement
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {/* Recherche */}
                <div className="mb-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Rechercher dans le répertoire..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Liste des morceaux disponibles */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredAllSongs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      {searchTerm ? 'Aucun morceau trouvé' : 'Tous les morceaux sont déjà dans l\'événement'}
                    </p>
                  ) : (
                    filteredAllSongs.map(song => (
                      <div
                        key={song.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{song.title}</h3>
                            {song.artist && (
                              <p className="text-sm text-gray-600">{song.artist}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-1">
                              {song.key && (
                                <span className="text-xs text-blue-600">Tonalité: {song.key}</span>
                              )}
                              {song.tags && song.tags.length > 0 && (
                                <div className="flex space-x-1">
                                  {song.tags.slice(0, 3).map((tag: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => addSongToEvent(song.id)}
                            disabled={adding}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}