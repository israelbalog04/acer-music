'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import Link from 'next/link';
import {
  MusicalNoteIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PlayIcon,
  DocumentTextIcon,
  CalendarIcon,
  TagIcon,
  HeartIcon,
  ShareIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Song {
  id: string;
  title: string;
  artist?: string;
  youtubeUrl?: string;
  key?: string;
  bpm?: number;
  duration?: number;
  tags: string[];
  recordingsCount: number;
  sequencesCount: number;
  eventsCount: number;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
}

export default function SongsPage() {
  const { userRole, churchName } = useUserData();
  const [songs, setSongs] = useState<Song[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'events'>('global');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedKey, setSelectedKey] = useState('');

  // Récupérer les chansons
  const fetchSongs = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedTag) params.set('tag', selectedTag);
      if (selectedKey) params.set('key', selectedKey);
      if (activeTab === 'events' && selectedEvent) params.set('eventId', selectedEvent);

      const response = await fetch(`/api/songs?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();
      setSongs(data.songs || []);

    } catch (error) {
      console.error('Erreur:', error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les événements
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Erreur événements:', error);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [searchTerm, selectedTag, selectedKey, activeTab, selectedEvent]);

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    }
  }, [activeTab]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openYouTube = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Obtenir tous les tags uniques
  const allTags = Array.from(
    new Set(songs.flatMap(song => song.tags))
  ).sort();

  const canAddSongs = ['ADMIN', 'CHEF_LOUANGE'].includes(userRole);

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MusicalNoteIcon className="h-8 w-8 mr-3 text-blue-600" />
              Répertoire des Chansons
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez le catalogue musical de {churchName}
            </p>
          </div>
          {canAddSongs && (
            <Link href="/app/music/songs/add">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusIcon className="h-4 w-4 mr-2" />
                Ajouter une chanson
              </Button>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('global')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'global'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MusicalNoteIcon className="h-4 w-4 inline mr-1" />
              Répertoire Global ({songs.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Par Événement
            </button>
          </nav>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            {/* Event selector for events tab */}
            {activeTab === 'events' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner un événement
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choisir un événement...</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.date).toLocaleDateString('fr-FR')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Other filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Rechercher une chanson..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                <select
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les tonalités</option>
                  <option value="C">Do (C)</option>
                  <option value="D">Ré (D)</option>
                  <option value="E">Mi (E)</option>
                  <option value="F">Fa (F)</option>
                  <option value="G">Sol (G)</option>
                  <option value="A">La (A)</option>
                  <option value="B">Si (B)</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'events' && !selectedEvent ? (
          <Card className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Sélectionnez un événement</p>
            <p className="text-gray-400 mt-2">
              Choisissez un événement pour voir les chansons de son répertoire
            </p>
          </Card>
        ) : songs.length === 0 ? (
          <Card className="p-8 text-center">
            <MusicalNoteIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm || selectedTag || selectedKey
                ? 'Aucune chanson trouvée'
                : activeTab === 'events'
                  ? 'Aucune chanson dans cet événement'
                  : 'Aucune chanson dans le répertoire'
              }
            </p>
            <p className="text-gray-400 mt-2">
              {searchTerm || selectedTag || selectedKey
                ? 'Essayez de modifier vos critères de recherche'
                : activeTab === 'events'
                  ? 'Ajoutez des chansons à cet événement'
                  : 'Commencez par ajouter des chansons au répertoire'
              }
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (
              <Card key={song.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Song Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {song.title}
                      </h3>
                      {song.artist && (
                        <p className="text-sm text-gray-600 mb-2">par {song.artist}</p>
                      )}
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        {song.key && <span>Tonalité: {song.key}</span>}
                        {song.bpm && <span>• {song.bpm} BPM</span>}
                        {song.duration && <span>• {formatDuration(song.duration)}</span>}
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <HeartIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Tags */}
                  {song.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {song.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {song.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{song.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <DocumentTextIcon className="h-3 w-3 mr-1" />
                        {song.sequencesCount} séq.
                      </span>
                      <span className="flex items-center">
                        <PlayIcon className="h-3 w-3 mr-1" />
                        {song.recordingsCount} enreg.
                      </span>
                      {activeTab === 'global' && (
                        <span className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {song.eventsCount} événements
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {song.youtubeUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openYouTube(song.youtubeUrl)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <PlayIcon className="h-3 w-3 mr-1" />
                          YouTube
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1 text-blue-700 border-blue-200 hover:bg-blue-50 px-2 py-1"
                        title="Partager ce chant"
                      >
                        <ShareIcon className="h-3 w-3" />
                        <span className="text-xs font-medium">Partager</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <MusicalNoteIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600">
                  {activeTab === 'global' ? 'Total chansons' : 'Chansons événement'}
                </p>
                <p className="text-2xl font-bold text-blue-800">{songs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center">
              <TagIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600">Tags uniques</p>
                <p className="text-2xl font-bold text-green-800">{allTags.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-purple-50 border-purple-200">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-purple-600">Séquences</p>
                <p className="text-2xl font-bold text-purple-800">
                  {songs.reduce((total, song) => total + song.sequencesCount, 0)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-orange-50 border-orange-200">
            <div className="flex items-center">
              <PlayIcon className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-orange-600">Enregistrements</p>
                <p className="text-2xl font-bold text-orange-800">
                  {songs.reduce((total, song) => total + song.recordingsCount, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}