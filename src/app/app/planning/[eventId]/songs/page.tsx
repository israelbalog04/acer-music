'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  MusicalNoteIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Song {
  id: string;
  title: string;
  artist?: string;
  key?: string;
  bpm?: number;
  duration?: number;
  tags: string[];
  isActive: boolean;
}

interface EventSong {
  id: string;
  songId: string;
  scheduleId: string;
  order: number;
  key?: string;
  notes?: string;
  song: Song;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: string;
  location?: string;
  status: string;
}

export default function EventSongsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [eventSongs, setEventSongs] = useState<EventSong[]>([]);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSong, setEditingSong] = useState<EventSong | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
      fetchAvailableSongs();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        setError('Erreur lors du chargement de l\'événement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement de l\'événement');
    }
  };

  const fetchEventSongs = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/songs`);
      if (response.ok) {
        const data = await response.json();
        setEventSongs(data);
      } else {
        setError('Erreur lors du chargement des chansons');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des chansons');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSongs = async () => {
    try {
      const response = await fetch('/api/songs');
      if (response.ok) {
        const data = await response.json();
        setAvailableSongs(data.songs || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    if (event) {
      fetchEventSongs();
    }
  }, [event]);

  const handleAddSong = async (songId: string) => {
    setProcessing(songId);
    try {
      const response = await fetch(`/api/events/${eventId}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId,
          order: eventSongs.length + 1
        }),
      });

      if (response.ok) {
        await fetchEventSongs();
        setShowAddModal(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'ajout de la chanson');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de l\'ajout de la chanson');
    } finally {
      setProcessing(null);
    }
  };

  const handleRemoveSong = async (eventSongId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette chanson ?')) return;

    setProcessing(eventSongId);
    try {
      const response = await fetch(`/api/events/${eventId}/songs/${eventSongId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEventSongs();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la suppression');
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateSong = async (eventSongId: string, updates: { key?: string; notes?: string; order?: number }) => {
    setProcessing(eventSongId);
    try {
      const response = await fetch(`/api/events/${eventId}/songs/${eventSongId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchEventSongs();
        setEditingSong(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la mise à jour');
    } finally {
      setProcessing(null);
    }
  };

  const handleReorder = async (eventSongId: string, direction: 'up' | 'down') => {
    const currentIndex = eventSongs.findIndex(es => es.id === eventSongId);
    if (currentIndex === -1) return;

    const newOrder = direction === 'up' ? currentIndex : currentIndex + 2;
    await handleUpdateSong(eventSongId, { order: newOrder });
  };

  const filteredSongs = availableSongs.filter(song => {
    const isAlreadyAdded = eventSongs.some(es => es.songId === song.id);
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()));
    return !isAlreadyAdded && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-700">Événement non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MusicalNoteIcon className="h-6 w-6 mr-2 text-blue-600" />
              Chansons de l'événement
            </h1>
            <p className="text-gray-600 mt-1">{event.title}</p>
            <p className="text-sm text-gray-500">
              {new Date(event.date).toLocaleDateString('fr-FR')} 
              {event.startTime && ` • ${event.startTime}`}
              {event.location && ` • ${event.location}`}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
            >
              Retour
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Ajouter une chanson
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Liste des chansons de l'événement */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Chansons programmées ({eventSongs.length})
        </h2>
        
        {eventSongs.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <MusicalNoteIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune chanson programmée
              </h3>
              <p className="text-gray-600 mb-4">
                Ajoutez des chansons à votre événement pour commencer
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Ajouter une chanson
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {eventSongs
              .sort((a, b) => a.order - b.order)
              .map((eventSong, index) => (
                <Card key={eventSong.id} className="border-l-4 border-l-blue-400">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center space-y-1">
                          <button
                            onClick={() => handleReorder(eventSong.id, 'up')}
                            disabled={index === 0 || processing === eventSong.id}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <ArrowUpIcon className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium text-gray-600">
                            {eventSong.order}
                          </span>
                          <button
                            onClick={() => handleReorder(eventSong.id, 'down')}
                            disabled={index === eventSongs.length - 1 || processing === eventSong.id}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <ArrowDownIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {eventSong.song.title}
                          </h3>
                          {eventSong.song.artist && (
                            <p className="text-sm text-gray-600">{eventSong.song.artist}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            {eventSong.song.key && (
                              <span>Tonalité: {eventSong.song.key}</span>
                            )}
                            {eventSong.song.bpm && (
                              <span>Tempo: {eventSong.song.bpm} BPM</span>
                            )}
                            {eventSong.song.duration && (
                              <span className="flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {Math.floor(eventSong.song.duration / 60)}:{(eventSong.song.duration % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                          {eventSong.key && eventSong.key !== eventSong.song.key && (
                            <p className="text-xs text-blue-600 mt-1">
                              Tonalité événement: {eventSong.key}
                            </p>
                          )}
                          {eventSong.notes && (
                            <p className="text-xs text-gray-600 mt-1">{eventSong.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => setEditingSong(eventSong)}
                          variant="outline"
                          size="sm"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleRemoveSong(eventSong.id)}
                          disabled={processing === eventSong.id}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          {processing === eventSong.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Modal d'ajout de chanson */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ajouter une chanson</h2>
              <Button
                onClick={() => setShowAddModal(false)}
                variant="outline"
                size="sm"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher une chanson..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSongs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {searchTerm ? 'Aucune chanson trouvée' : 'Aucune chanson disponible'}
                </p>
              ) : (
                filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{song.title}</h3>
                      {song.artist && (
                        <p className="text-sm text-gray-600">{song.artist}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        {song.key && <span>Tonalité: {song.key}</span>}
                        {song.bpm && <span>Tempo: {song.bpm} BPM</span>}
                        {song.tags && song.tags.length > 0 && (
                          <span>Tags: {song.tags.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddSong(song.id)}
                      disabled={processing === song.id}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {processing === song.id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {editingSong && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Modifier la chanson</h2>
              <Button
                onClick={() => setEditingSong(null)}
                variant="outline"
                size="sm"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chanson
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {editingSong.song.title}
                  {editingSong.song.artist && ` - ${editingSong.song.artist}`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tonalité pour cet événement
                </label>
                <Input
                  type="text"
                  placeholder="Ex: C, G, Am..."
                  value={editingSong.key || ''}
                  onChange={(e) => setEditingSong(prev => prev ? { ...prev, key: e.target.value } : null)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Notes spécifiques pour cet événement..."
                  value={editingSong.notes || ''}
                  onChange={(e) => setEditingSong(prev => prev ? { ...prev, notes: e.target.value } : null)}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  onClick={() => setEditingSong(null)}
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => handleUpdateSong(editingSong.id, {
                    key: editingSong.key,
                    notes: editingSong.notes
                  })}
                  disabled={processing === editingSong.id}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processing === editingSong.id ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <CheckIcon className="h-4 w-4" />
                  )}
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
