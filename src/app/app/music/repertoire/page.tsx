'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader } from '@/components/ui/card';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MusicalNoteIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function RepertoirePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [selectedInstrument, setSelectedInstrument] = useState('tous');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [playingSong, setPlayingSong] = useState<number | null>(null);

  // Données simulées
  const categories = [
    { id: 'tous', name: 'Tous les chants', count: 156 },
    { id: 'louange', name: 'Louange', count: 85 },
    { id: 'adoration', name: 'Adoration', count: 42 },
    { id: 'gospel', name: 'Gospel', count: 18 },
    { id: 'contemporain', name: 'Contemporain', count: 11 }
  ];

  const instruments = [
    { id: 'tous', name: 'Tous les instruments' },
    { id: 'piano', name: 'Piano' },
    { id: 'guitare', name: 'Guitare' },
    { id: 'basse', name: 'Basse' },
    { id: 'batterie', name: 'Batterie' },
    { id: 'chant', name: 'Chant' },
    { id: 'violon', name: 'Violon' }
  ];

  const songs = [
    {
      id: 1,
      title: 'Amazing Grace',
      artist: 'John Newton',
      category: 'louange',
      key: 'G',
      tempo: 72,
      duration: '4:32',
      lastUpdated: '2024-01-10',
      favorites: 23,
      isFavorite: true,
      recordings: [
        { instrument: 'piano', artist: 'Marie Dubois', plays: 45, duration: '4:28' },
        { instrument: 'guitare', artist: 'John Doe', plays: 32, duration: '4:35' },
        { instrument: 'chant', artist: 'Sophie Martin', plays: 28, duration: '4:30' },
        { instrument: 'basse', artist: 'Pierre Dupont', plays: 19, duration: '4:33' }
      ],
      hasSheet: true,
      hasChords: true
    },
    {
      id: 2,
      title: 'How Great Thou Art',
      artist: 'Carl Boberg',
      category: 'adoration',
      key: 'C',
      tempo: 88,
      duration: '5:15',
      lastUpdated: '2024-01-08',
      favorites: 31,
      isFavorite: false,
      recordings: [
        { instrument: 'piano', artist: 'Marie Dubois', plays: 67, duration: '5:12' },
        { instrument: 'guitare', artist: 'John Doe', plays: 54, duration: '5:18' },
        { instrument: 'violon', artist: 'Claire Bernard', plays: 23, duration: '5:15' }
      ],
      hasSheet: true,
      hasChords: true
    },
    {
      id: 3,
      title: 'Blessed Be Your Name',
      artist: 'Matt Redman',
      category: 'contemporain',
      key: 'A',
      tempo: 132,
      duration: '4:18',
      lastUpdated: '2024-01-05',
      favorites: 19,
      isFavorite: true,
      recordings: [
        { instrument: 'guitare', artist: 'John Doe', plays: 41, duration: '4:15' },
        { instrument: 'batterie', artist: 'Marc Durand', plays: 35, duration: '4:20' },
        { instrument: 'basse', artist: 'Pierre Dupont', plays: 28, duration: '4:18' }
      ],
      hasSheet: false,
      hasChords: true
    },
    {
      id: 4,
      title: 'Great is Thy Faithfulness',
      artist: 'Thomas Chisholm',
      category: 'louange',
      key: 'F',
      tempo: 76,
      duration: '4:45',
      lastUpdated: '2024-01-03',
      favorites: 25,
      isFavorite: false,
      recordings: [
        { instrument: 'piano', artist: 'Marie Dubois', plays: 52, duration: '4:42' },
        { instrument: 'chant', artist: 'Sophie Martin', plays: 38, duration: '4:48' }
      ],
      hasSheet: true,
      hasChords: true
    }
  ];

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'tous' || song.category === selectedCategory;
    const matchesInstrument = selectedInstrument === 'tous' || 
                             song.recordings.some(r => r.instrument === selectedInstrument);
    
    return matchesSearch && matchesCategory && matchesInstrument;
  });

  const togglePlay = (songId: number) => {
    setPlayingSong(playingSong === songId ? null : songId);
  };

  const toggleFavorite = (songId: number) => {
    // Logique pour toggle favorite (sera connecté à l'API plus tard)
    console.log('Toggle favorite for song:', songId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Répertoire Musical</h1>
          <p className="text-gray-600 mt-1">
            Bibliothèque complète des chants avec enregistrements par instrument
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filtres avancés
          </Button>
          <Link href="/app/music/upload">
            <Button>
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Nouvel Upload
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search */}
            <div className="lg:col-span-5">
              <Input
                placeholder="Rechercher un chant, artiste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3244c7] focus:ring-2 focus:ring-[#3244c7]/20 focus:outline-none transition-all"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Instrument Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3244c7] focus:ring-2 focus:ring-[#3244c7]/20 focus:outline-none transition-all"
              >
                {instruments.map(instrument => (
                  <option key={instrument.id} value={instrument.id}>
                    {instrument.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="lg:col-span-1 flex justify-end">
              <div className="flex border border-gray-200 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[#3244c7] text-white' : 'text-gray-400'} rounded-l-lg transition-colors`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-[#3244c7] text-white' : 'text-gray-400'} rounded-r-lg transition-colors`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredSongs.length} chant{filteredSongs.length > 1 ? 's' : ''} trouvé{filteredSongs.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Songs Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredSongs.map((song) => (
          <Card key={song.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Song Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{song.title}</h3>
                    <button
                      onClick={() => toggleFavorite(song.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {song.isFavorite ? (
                        <HeartSolidIcon className="h-4 w-4 text-red-500" />
                      ) : (
                        <HeartIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{song.artist}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Tonalité: {song.key}</span>
                    <span>Tempo: {song.tempo} BPM</span>
                    <span>{song.duration}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {song.hasSheet && <DocumentTextIcon className="h-4 w-4 text-green-600" title="Partition disponible" />}
                  {song.hasChords && <MusicalNoteIcon className="h-4 w-4 text-blue-600" title="Accords disponibles" />}
                </div>
              </div>

              {/* Recordings */}
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-700">Enregistrements disponibles:</h4>
                {song.recordings.map((recording, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => togglePlay(song.id)}
                        className="p-1 rounded-full bg-[#3244c7] text-white hover:bg-[#2938b3] transition-colors"
                      >
                        {playingSong === song.id ? (
                          <PauseIcon className="h-3 w-3" />
                        ) : (
                          <PlayIcon className="h-3 w-3" />
                        )}
                      </button>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {recording.instrument}
                        </p>
                        <p className="text-xs text-gray-500">
                          {recording.artist} • {recording.plays} lectures
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{recording.duration}</span>
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <HeartIcon className="h-3 w-3 mr-1" />
                    {song.favorites}
                  </span>
                  <span>Mis à jour le {new Date(song.lastUpdated).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <ShareIcon className="h-4 w-4" />
                  </Button>
                  <Link href={`/upload?song=${song.id}`}>
                    <Button variant="outline" size="sm">
                      <CloudArrowUpIcon className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))
        ) : (
          // Empty State
          <div className="col-span-full">
            <Card>
              <div className="p-12 text-center">
                <MusicalNoteIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedCategory !== 'tous' || selectedInstrument !== 'tous' 
                    ? 'Aucun chant trouvé' 
                    : 'Aucun chant disponible'
                  }
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || selectedCategory !== 'tous' || selectedInstrument !== 'tous'
                    ? 'Essayez de modifier vos critères de recherche ou ajoutez un nouveau chant.'
                    : 'Commencez par ajouter des chants au répertoire.'
                  }
                </p>
                <Link href="/app/music/upload">
                  <Button>
                    <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                    Ajouter un chant
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-6">
          <div className="text-center">
            <MusicalNoteIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchRepertoireData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}