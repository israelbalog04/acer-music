'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import {
  MusicalNoteIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  HeartIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  MicrophoneIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TagIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function RepertoirePage() {
  const { userRole, churchName } = useUserData();
  const [songs, setSongs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [selectedInstrument, setSelectedInstrument] = useState('tous');
  const [playingSong, setPlayingSong] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingSong, setAddingSong] = useState(false);
  const [selectedSongForSequences, setSelectedSongForSequences] = useState<any>(null);
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [selectedSongForRecording, setSelectedSongForRecording] = useState<any>(null);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');


  const fetchData = async () => {
      try {
        setLoading(true);
        // Charger les chansons depuis l'API
        const response = await fetch('/api/songs');
        if (response.ok) {
          const data = await response.json();
          setSongs(data.songs || []);
          
          // Extraire les catégories uniques
          const allTags = data.songs.flatMap((song: any) => song.tags || []);
          const uniqueTags = Array.from(new Set(allTags));
          setCategories(uniqueTags.filter((tag): tag is string => typeof tag === 'string'));
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrer les chansons localement
  const filteredSongs = songs.filter(song => {
    const matchesSearch = !searchTerm || 
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'tous' || 
      (song.tags && song.tags.includes(selectedCategory));
    
    return matchesSearch && matchesCategory;
  });

  const togglePlay = (songId: string) => {
    setPlayingSong(playingSong === songId ? null : songId);
  };

  const toggleFavorite = async (songId: string) => {
    // Logique pour ajouter/supprimer des favoris
    console.log('Toggle favorite:', songId);
  };



  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Gérer différents formats de liens YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    return url; // Retourner l'URL originale si aucun pattern ne correspond
  };

  const handleAddSong = async (formData: FormData) => {
    try {
      setAddingSong(true);
      
      const songData = {
        title: formData.get('title') as string,
        artist: formData.get('artist') as string,
        youtubeUrl: formData.get('youtubeUrl') as string,
        key: formData.get('key') as string,
        notes: formData.get('notes') as string,
        tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t) : []
      };

      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData)
      });

      if (response.ok) {
        const data = await response.json();
        setSongs(prev => [...prev, data.song]);
        setShowAddForm(false);
        // Mettre à jour les catégories
        const newTags = data.song.tags || [];
        setCategories(prev => Array.from(new Set([...prev, ...newTags])));
        alert('✅ Morceau ajouté avec succès !');
      } else {
        const error = await response.json();
        alert('❌ ' + (error.error || 'Erreur lors de l\'ajout'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion');
    } finally {
      setAddingSong(false);
    }
  };

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MusicalNoteIcon className="h-8 w-8 mr-3 text-blue-600" />
              Répertoire Musical
            </h1>
            <p className="text-gray-600 mt-2">
              Explorez le catalogue musical de {churchName}
            </p>
          </div>
          <div className="flex gap-3">
            {(userRole === UserRole.ADMIN || userRole === UserRole.CHEF_LOUANGE) && (
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Ajouter un chant
              </Button>
            )}
            {(userRole === UserRole.ADMIN || userRole === UserRole.CHEF_LOUANGE || userRole === UserRole.MUSICIEN || userRole === UserRole.TECHNICIEN) && (
              <Button 
                onClick={() => {
                  // Rediriger vers la page d'upload
                  window.location.href = '/app/music/upload';
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
                title="Enregistrer une nouvelle version de morceau"
              >
                <MicrophoneIcon className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Rechercher par titre, artiste ou tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="tous">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    title="Vue grille"
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    title="Vue liste"
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            {/* Quick filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Filtres rapides:</span>
              {categories.slice(0, 5).map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? 'tous' : category)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  #{category}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredSongs.length === 0 ? (
          <Card className="p-8 text-center">
            <MusicalNoteIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm || selectedCategory !== 'tous' || selectedInstrument !== 'tous' 
                ? 'Aucun chant trouvé' 
                : 'Aucun chant disponible'
              }
            </p>
            <p className="text-gray-400 mt-2">
              {searchTerm || selectedCategory !== 'tous' || selectedInstrument !== 'tous'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Le répertoire musical sera affiché ici une fois des chants ajoutés'
              }
            </p>
          </Card>
        ) : (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {filteredSongs.map((song, index) => (
              viewMode === 'grid' ? (
                <div
                  key={song.id}
                  className={`animate-fadeInUp animate-delay-${Math.min(index * 100, 700)}`}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{song.title}</h3>
                            <button
                              onClick={() => toggleFavorite(song.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <HeartIcon className="h-4 w-4" />
                            </button>
                          </div>
                          {song.artist && <p className="text-sm text-gray-600 flex items-center"><UserIcon className="h-3 w-3 mr-1" />{song.artist}</p>}
                          {song.key && <p className="text-xs text-blue-600 font-medium flex items-center"><TagIcon className="h-3 w-3 mr-1" />Tonalité: {song.key}</p>}
                        </div>
                      </div>
                      
                      {song.youtubeUrl && (
                        <div className="mb-4">
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700 flex items-center">
                              <PlayIcon className="h-4 w-4 mr-1 text-red-600" />
                              Vidéo YouTube
                            </span>
                          </div>
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <iframe
                              src={getYouTubeEmbedUrl(song.youtubeUrl)}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                              title={`Vidéo YouTube pour ${song.title}`}
                            />
                          </div>
                        </div>
                      )}

                      {song.tags && song.tags.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {song.tags.slice(0, 3).map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 cursor-pointer transition-colors"
                                onClick={() => setSelectedCategory(tag)}
                              >
                                #{tag}
                              </span>
                            ))}
                            {song.tags.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">+{song.tags.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <MicrophoneIcon className="h-3 w-3 mr-1" />
                            {song.recordingsCount || 0} enreg.
                          </span>
                          <span className="flex items-center">
                            <DocumentTextIcon className="h-3 w-3 mr-1" />
                            {song.sequencesCount || 0} séq.
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedSongForSequences(song);
                              setShowSequenceModal(true);
                            }}
                            className="text-green-700 border-green-200 hover:bg-green-50 px-2 py-1 text-xs"
                          >
                            <DocumentTextIcon className="h-3 w-3 mr-1" />
                            Séquences
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              window.location.href = '/app/music/recordings-manage';
                            }}
                            className="text-purple-700 border-purple-200 hover:bg-purple-50 px-2 py-1 text-xs"
                          >
                            <PlayIcon className="h-3 w-3 mr-1" />
                            Versions
                          </Button>
                          {song.youtubeUrl && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(song.youtubeUrl, '_blank')}
                              className="text-red-600 border-red-200 hover:bg-red-50 px-2 py-1 text-xs"
                            >
                              <PlayIcon className="h-3 w-3 mr-1" />
                              YouTube
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <div
                  key={song.id}
                  className={`animate-fadeInUp animate-delay-${Math.min(index * 50, 500)}`}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01] group">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <MusicalNoteIcon className="h-8 w-8 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{song.title}</h3>
                              <button
                                onClick={() => toggleFavorite(song.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <HeartIcon className="h-4 w-4" />
                              </button>
                            </div>
                            {song.artist && <p className="text-sm text-gray-600 flex items-center mb-1"><UserIcon className="h-3 w-3 mr-1" />{song.artist}</p>}
                            {song.key && <p className="text-xs text-blue-600 font-medium flex items-center mb-2"><TagIcon className="h-3 w-3 mr-1" />Tonalité: {song.key}</p>}
                            
                            {song.tags && song.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {song.tags.slice(0, 5).map((tag: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 cursor-pointer transition-colors"
                                    onClick={() => setSelectedCategory(tag)}
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <MicrophoneIcon className="h-3 w-3 mr-1" />
                                {song.recordingsCount || 0} enregistrements
                              </span>
                              <span className="flex items-center">
                                <DocumentTextIcon className="h-3 w-3 mr-1" />
                                {song.sequencesCount || 0} séquences
                              </span>
                              <span className="flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Ajouté récemment
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedSongForSequences(song);
                              setShowSequenceModal(true);
                            }}
                            className="text-green-700 border-green-200 hover:bg-green-50"
                          >
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            Séquences
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              window.location.href = '/app/music/recordings-manage';
                            }}
                            className="text-purple-700 border-purple-200 hover:bg-purple-50"
                          >
                            <PlayIcon className="h-4 w-4 mr-1" />
                            Versions
                          </Button>
                          {song.youtubeUrl && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(song.youtubeUrl, '_blank')}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <PlayIcon className="h-4 w-4 mr-1" />
                              YouTube
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <MusicalNoteIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600">Chants disponibles</p>
                <p className="text-2xl font-bold text-blue-800">{songs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600">Séquences</p>
                <p className="text-2xl font-bold text-green-800">0</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-purple-50 border-purple-200">
            <div className="flex items-center">
              <PlayIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-purple-600">Enregistrements</p>
                <p className="text-2xl font-bold text-purple-800">0</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-orange-50 border-orange-200">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-orange-600">Favoris</p>
                <p className="text-2xl font-bold text-orange-800">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Modal d'ajout de chanson */}
        {showAddForm && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form action={handleAddSong}>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <MusicalNoteIcon className="h-6 w-6 mr-2 text-blue-600" />
                      Ajouter un morceau
                    </h2>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Titre (obligatoire) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="title"
                      required
                      placeholder="Ex: Amazing Grace"
                      className="w-full"
                    />
                  </div>

                  {/* Artiste */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Artiste
                    </label>
                    <Input
                      name="artist"
                      placeholder="Ex: Hillsong United"
                      className="w-full"
                    />
                  </div>

                  {/* Lien YouTube */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lien YouTube
                    </label>
                    <Input
                      name="youtubeUrl"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lien vers une version de référence du morceau
                    </p>
                  </div>

                  {/* Tonalité */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tonalité
                      </label>
                      <select
                        name="key"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="C">Do (C)</option>
                        <option value="C#">Do# (C#)</option>
                        <option value="D">Ré (D)</option>
                        <option value="D#">Ré# (D#)</option>
                        <option value="E">Mi (E)</option>
                        <option value="F">Fa (F)</option>
                        <option value="F#">Fa# (F#)</option>
                        <option value="G">Sol (G)</option>
                        <option value="G#">Sol# (G#)</option>
                        <option value="A">La (A)</option>
                        <option value="A#">La# (A#)</option>
                        <option value="B">Si (B)</option>
                      </select>
                    </div>
                  </div>

                  {/* Catégories/Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégories
                    </label>
                    <Input
                      name="tags"
                      placeholder="Ex: louange, adoration, gospel (séparés par des virgules)"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Utilisez des virgules pour séparer les catégories
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Notes particulières sur ce morceau..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    disabled={addingSong}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={addingSong}
                  >
                    {addingSong ? 'Ajout en cours...' : 'Ajouter le morceau'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de gestion des séquences */}
        {showSequenceModal && selectedSongForSequences && (
          <SequenceModal 
            song={selectedSongForSequences}
            onClose={() => {
              setShowSequenceModal(false);
              setSelectedSongForSequences(null);
            }}
            onSequenceAdded={() => {
              // Recharger les données pour mettre à jour le compteur
              fetchData();
            }}
          />
        )}

        {/* Modal d'enregistrement */}
        {showRecordingModal && selectedSongForRecording && (
          <RecordingModal 
            song={selectedSongForRecording}
            onClose={() => {
              setShowRecordingModal(false);
              setSelectedSongForRecording(null);
            }}
            onRecordingSubmitted={() => {
              // Recharger les données pour mettre à jour le compteur
              fetchData();
            }}
          />
        )}
      </div>
    </RoleGuard>
  );
}

// Composant Modal de gestion des séquences
function SequenceModal({ song, onClose, onSequenceAdded }: {
  song: any;
  onClose: () => void;
  onSequenceAdded: () => void;
}) {
  const [sequences, setSequences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchSequences();
  }, [song.id]);

  const fetchSequences = async () => {
    try {
      const response = await fetch(`/api/sequences?songId=${song.id}`);
      if (response.ok) {
        const data = await response.json();
        setSequences(data.sequences || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = [
      'application/pdf',
      'audio/mpeg',
      'audio/wav', 
      'audio/mp3',
      'image/png',
      'image/jpeg',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Type de fichier non supporté. Utilisez: PDF, MP3, WAV, PNG, JPG, XLS, XLSX');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setUploadError('Le fichier est trop volumineux (max 10MB)');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('songId', song.id);
      formData.append('title', file.name.split('.')[0]);
      formData.append('description', `Séquence pour ${song.title}`);

      const response = await fetch('/api/sequences/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await fetchSequences();
        onSequenceAdded();
        // Reset le input
        event.target.value = '';
      } else {
        const error = await response.json();
        setUploadError(error.message || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      setUploadError('Erreur lors de l\'upload');
      console.error('Erreur:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSequence = async (sequenceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette séquence ?')) return;

    try {
      const response = await fetch(`/api/sequences/${sequenceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSequences();
        onSequenceAdded();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2 text-green-600" />
                Séquences - {song.title}
              </h2>
              <p className="text-gray-600 mt-1">
                Gérer les partitions et enregistrements pour ce morceau
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Upload section */}
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <h3 className="font-semibold text-blue-900 mb-3">Ajouter une nouvelle séquence</h3>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.mp3,.wav,.png,.jpg,.jpeg,.xls,.xlsx"
              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
            />
            {uploading && (
              <div className="text-blue-600 text-sm">
                Upload en cours...
              </div>
            )}
          </div>
          {uploadError && (
            <p className="text-red-600 text-sm mt-2">{uploadError}</p>
          )}
          <p className="text-xs text-gray-600 mt-2">
            Formats supportés: PDF, MP3, WAV, PNG, JPG, XLS, XLSX (max 10MB)
          </p>
        </div>

        {/* Sequences list */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Séquences disponibles ({sequences.length})
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : sequences.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Aucune séquence pour ce morceau</p>
              <p className="text-sm">Ajoutez des partitions ou enregistrements ci-dessus</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sequences.map((sequence) => (
                <div key={sequence.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {sequence.fileType?.includes('audio') ? (
                        <MusicalNoteIcon className="h-8 w-8 text-blue-600" />
                      ) : sequence.fileType?.includes('pdf') ? (
                        <DocumentTextIcon className="h-8 w-8 text-red-600" />
                      ) : (
                        <DocumentTextIcon className="h-8 w-8 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{sequence.title}</h4>
                      {sequence.description && (
                        <p className="text-sm text-gray-600">{sequence.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{sequence.fileName}</span>
                        {sequence.fileSize && (
                          <span>{(sequence.fileSize / 1024).toFixed(0)} KB</span>
                        )}
                        <span>
                          Ajouté le {new Date(sequence.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {sequence.fileUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(sequence.fileUrl, '_blank')}
                        className="text-blue-600 border-blue-200"
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Ouvrir
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSequence(sequence.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Modal d'enregistrement
function RecordingModal({ song, onClose, onRecordingSubmitted }: {
  song: any;
  onClose: () => void;
  onRecordingSubmitted: () => void;
}) {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSongId, setSelectedSongId] = useState(song?.id || '');
  const [availableSongs, setAvailableSongs] = useState<any[]>([]);

  useEffect(() => {
    fetchRecordings();
    fetchAvailableSongs();
    // Pré-remplir le titre avec le morceau sélectionné
    if (song?.title && song.title !== 'Nouveau morceau') {
      setTitle(`${song.title}${selectedInstrument ? ` - ${selectedInstrument}` : ''}`);
    }
  }, [song?.id]);

  const fetchAvailableSongs = async () => {
    try {
      const response = await fetch('/api/songs');
      if (response.ok) {
        const data = await response.json();
        setAvailableSongs(data.songs || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des morceaux:', error);
    }
  };

  useEffect(() => {
    // Mettre à jour le titre quand l'instrument change
    if (selectedInstrument) {
      setTitle(`${song.title} - ${selectedInstrument}`);
    } else {
      setTitle(song.title);
    }
  }, [selectedInstrument, song.title]);

  const fetchRecordings = async () => {
    try {
      // Si on a un morceau présélectionné, on charge ses enregistrements
      if (song?.id && song.title !== 'Nouveau morceau') {
        const response = await fetch(`/api/recordings?songId=${song.id}`);
        if (response.ok) {
          const data = await response.json();
          setRecordings(data.recordings || []);
        }
      } else {
        // Sinon on charge tous les enregistrements de l'utilisateur
        const response = await fetch('/api/recordings');
        if (response.ok) {
          const data = await response.json();
          setRecordings(data.recordings || []);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier (audio seulement)
    const allowedTypes = [
      'audio/mpeg',
      'audio/wav', 
      'audio/mp3',
      'audio/ogg',
      'audio/m4a'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Type de fichier non supporté. Utilisez: MP3, WAV, OGG, M4A');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      setUploadError('Le fichier est trop volumineux (max 50MB)');
      return;
    }

    if (!selectedInstrument.trim()) {
      setUploadError('Veuillez sélectionner votre instrument');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');

      const actualSongId = selectedSongId || song.id;
      if (!actualSongId) {
        setUploadError('Veuillez sélectionner un morceau');
        return;
      }

      const selectedSong = availableSongs.find(s => s.id === actualSongId) || song;
      
      const formData = new FormData();
      formData.append('audioFile', file);
      formData.append('songId', actualSongId);
      formData.append('title', title || `${selectedInstrument} - ${selectedSong?.title || 'Morceau'}`);
      formData.append('instrument', selectedInstrument);
      formData.append('notes', notes);

      const response = await fetch('/api/recordings/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await fetchRecordings();
        onRecordingSubmitted();
        // Reset le form
        event.target.value = '';
        setTitle('');
        setNotes('');
        setSelectedInstrument('');
      } else {
        const error = await response.json();
        setUploadError(error.message || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      setUploadError('Erreur lors de l\'upload');
      console.error('Erreur:', error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-700';
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Approuvé';
      case 'IN_REVIEW': return 'En attente';
      case 'DRAFT': return 'Brouillon';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <MicrophoneIcon className="h-6 w-6 mr-2 text-red-600" />
                Enregistrements {song?.title && song.title !== 'Nouveau morceau' ? `- ${song.title}` : ''}
              </h2>
              <p className="text-gray-600 mt-1">
                {song?.title && song.title !== 'Nouveau morceau' 
                  ? 'Soumettre votre version de ce morceau pour validation'
                  : 'Sélectionnez un morceau et soumettez votre enregistrement'
                }
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Upload section */}
        <div className="p-6 border-b border-gray-200 bg-red-50">
          <h3 className="font-semibold text-red-900 mb-4">Soumettre un nouvel enregistrement</h3>
          
          <div className="space-y-4">
            {/* Sélection du morceau si pas présélectionné */}
            {(!song?.id || song.title === 'Nouveau morceau') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Morceau <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSongId}
                  onChange={(e) => setSelectedSongId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Sélectionner un morceau...</option>
                  {availableSongs.map((songOption) => (
                    <option key={songOption.id} value={songOption.id}>
                      {songOption.title}{songOption.artist ? ` - ${songOption.artist}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Instrument */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre instrument <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Sélectionner votre instrument...</option>
                <option value="Piano">Piano</option>
                <option value="Guitare">Guitare</option>
                <option value="Batterie">Batterie</option>
                <option value="Basse">Basse</option>
                <option value="Chant">Chant</option>
                <option value="Violon">Violon</option>
                <option value="Flûte">Flûte</option>
                <option value="Saxophone">Saxophone</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {/* Titre personnalisé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre (optionnel)
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Ex: ${selectedInstrument} - ${song.title}`}
                className="w-full"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Commentaires sur votre interprétation..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier audio <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading || !selectedInstrument}
                accept=".mp3,.wav,.ogg,.m4a"
                className="flex-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-600 file:text-white hover:file:bg-red-700 file:cursor-pointer disabled:opacity-50"
              />
              {uploading && (
                <div className="text-red-600 text-sm mt-2">
                  Upload en cours...
                </div>
              )}
              {uploadError && (
                <p className="text-red-600 text-sm mt-2">{uploadError}</p>
              )}
              <p className="text-xs text-gray-600 mt-2">
                Formats audio supportés: MP3, WAV, OGG, M4A (max 50MB)
              </p>
            </div>
          </div>
        </div>

        {/* Recordings list */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Enregistrements soumis ({recordings.length})
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MicrophoneIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Aucun enregistrement pour ce morceau</p>
              <p className="text-sm">Soyez le premier à soumettre votre version !</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map((recording) => (
                <div key={recording.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <MicrophoneIcon className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{recording.title}</h4>
                      <p className="text-sm text-gray-600">
                        {recording.instrument} • par {recording.user.firstName} {recording.user.lastName}
                      </p>
                      {recording.notes && (
                        <p className="text-xs text-gray-500 italic mt-1">{recording.notes}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>
                          Soumis le {new Date(recording.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${getStatusColor(recording.status)}`}>
                          {getStatusText(recording.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {recording.audioUrl && recording.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(recording.audioUrl, '_blank')}
                        className="text-blue-600 border-blue-200"
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Écouter
                      </Button>
                    )}
                    {recording.status === 'IN_REVIEW' && (
                      <span className="text-yellow-600 text-sm">En attente de validation</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              💡 Vos enregistrements seront validés par un administrateur avant d'être disponibles
            </p>
            <Button onClick={onClose} variant="outline">
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}