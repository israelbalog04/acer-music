'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader } from '@/components/ui/card';
import {
  CloudArrowUpIcon,
  MusicalNoteIcon,
  MicrophoneIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function UploadPage() {
  const [uploadStep, setUploadStep] = useState<'select' | 'details' | 'upload' | 'success'>('select');
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [availableSongs, setAvailableSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Récupérer les chansons depuis l'API
  const fetchSongs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/songs');
      if (response.ok) {
        const data = await response.json();
        setAvailableSongs(data.songs || []);
      } else {
        setError('Erreur lors du chargement des chansons');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Charger les chansons au montage du composant
  useEffect(() => {
    fetchSongs();
  }, []);

  // Vérifier les paramètres URL pour présélectionner une chanson
  useEffect(() => {
    if (availableSongs.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const songId = urlParams.get('songId');
      const songTitle = urlParams.get('songTitle');
      
      if (songId && songTitle) {
        // Chercher la chanson dans les données récupérées
        const song = availableSongs.find(s => s.id === songId || s.title === songTitle);
        if (song) {
          setSelectedSong(song);
          setUploadStep('details');
        }
      }
    }
  }, [availableSongs]);

  const [uploadData, setUploadData] = useState({
    instrument: '',
    version: '',
    notes: '',
    isPublic: true,
    replaceExisting: false
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const instruments = [
    'Piano',
    'Guitare Acoustique',
    'Guitare Électrique',
    'Basse',
    'Batterie',
    'Chant Principal',
    'Chœur',
    'Violon',
    'Saxophone',
    'Trompette',
    'Flûte',
    'Autre'
  ];



  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
      } else {
        alert('Veuillez sélectionner un fichier audio valide');
      }
    }
  };

  const simulateUpload = () => {
    setUploadStep('upload');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setUploadStep('success'), 500);
      }
      setUploadProgress(progress);
    }, 200);
  };

  const resetUpload = () => {
    setUploadStep('select');
    setSelectedSong(null);
    setUploadData({
      instrument: '',
      version: '',
      notes: '',
      isPublic: true,
      replaceExisting: false
    });
    setAudioFile(null);
    setUploadProgress(0);
  };

  if (uploadStep === 'success') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Enregistrement uploadé avec succès !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre version {uploadData.instrument.toLowerCase()} de "{selectedSong?.title}" a été ajoutée au répertoire.
              L'équipe de modération va maintenant l'examiner.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Prochaines étapes :</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Modération par l'équipe (24-48h)</li>
                    <li>• Notification par email une fois approuvé</li>
                    <li>• Disponible pour tous les musiciens</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Button onClick={resetUpload} className="w-full">
                Uploader un autre enregistrement
              </Button>
              <Button variant="outline" className="w-full">
                Voir mes uploads
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (uploadStep === 'upload') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#3244c7] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CloudArrowUpIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Upload en cours...
            </h2>
            <p className="text-gray-600 mb-6">
              Veuillez patienter pendant que nous traitons votre fichier.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-[#3244c7] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {Math.round(uploadProgress)}% complété
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload d'Enregistrement</h1>
        <p className="text-gray-600 mt-1">
          Partagez votre version d'un chant avec l'équipe musicale
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${uploadStep === 'select' ? 'text-[#3244c7]' : 'text-green-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
            uploadStep === 'select' ? 'bg-[#3244c7]' : 'bg-green-600'
          }`}>
            {uploadStep === 'select' ? '1' : <CheckCircleIcon className="h-5 w-5" />}
          </div>
          <span className="text-sm font-medium">Choisir le chant</span>
        </div>
        <div className={`w-8 h-0.5 ${['details', 'upload', 'success'].includes(uploadStep) ? 'bg-[#3244c7]' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center space-x-2 ${
          uploadStep === 'details' ? 'text-[#3244c7]' : ['upload', 'success'].includes(uploadStep) ? 'text-green-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
            uploadStep === 'details' ? 'bg-[#3244c7]' : ['upload', 'success'].includes(uploadStep) ? 'bg-green-600' : 'bg-gray-300'
          }`}>
            {['upload', 'success'].includes(uploadStep) ? <CheckCircleIcon className="h-5 w-5" /> : '2'}
          </div>
          <span className="text-sm font-medium">Détails & Upload</span>
        </div>
      </div>

      {uploadStep === 'select' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Song Selection */}
          <Card>
            <CardHeader 
              title="Sélectionner un Chant" 
              subtitle="Choisissez le chant pour lequel vous voulez uploader"
              icon={<MusicalNoteIcon className="h-5 w-5 text-[#3244c7]" />}
            />
            <div className="px-6 pb-6">
              <div className="mb-4">
                <Input
                  placeholder="Rechercher un chant..."
                  leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                />
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3244c7]"></div>
                    <span className="ml-3 text-gray-600">Chargement des chansons...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-600">{error}</p>
                      <Button 
                        onClick={fetchSongs}
                        className="mt-2"
                        variant="outline"
                      >
                        Réessayer
                      </Button>
                    </div>
                  </div>
                ) : availableSongs.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <MusicalNoteIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Aucune chanson disponible</p>
                    </div>
                  </div>
                ) : (
                  availableSongs.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => setSelectedSong(song)}
                      className={`
                        p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${selectedSong?.id === song.id 
                          ? 'border-[#3244c7] bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{song.title}</h4>
                          <p className="text-sm text-gray-600">{song.artist || 'Artiste inconnu'}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {song.key && <span>Tonalité: {song.key}</span>}
                            {song.bpm && <span>Tempo: {song.bpm} BPM</span>}
                            <span>{song.recordingsCount || 0} enregistrement{(song.recordingsCount || 0) > 1 ? 's' : ''}</span>
                          </div>
                          {song.youtubeUrl && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                🎬 Vidéo YouTube disponible
                              </span>
                            </div>
                          )}
                        </div>
                        {selectedSong?.id === song.id && (
                          <CheckCircleIcon className="h-5 w-5 text-[#3244c7]" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader 
              title="Instructions" 
              subtitle="Conseils pour un bon enregistrement"
              icon={<InformationCircleIcon className="h-5 w-5 text-[#3244c7]" />}
            />
            <div className="px-6 pb-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Qualité audio</h4>
                    <p className="text-sm text-gray-600">Enregistrez dans un environnement calme avec un bon micro</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Format recommandé</h4>
                    <p className="text-sm text-gray-600">MP3, WAV ou M4A - Maximum 50MB</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Respecter la structure</h4>
                    <p className="text-sm text-gray-600">Suivez la structure officielle du chant (intro, couplets, refrain)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-orange-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Métronome</h4>
                    <p className="text-sm text-gray-600">Utilisez un métronome pour rester dans le tempo</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Important</h4>
                    <p className="text-sm text-yellow-700">
                      Vos enregistrements seront modérés avant publication. 
                      Assurez-vous qu'ils respectent la qualité attendue pour l'équipe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {uploadStep === 'details' && selectedSong && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader 
              title={`Upload pour "${selectedSong.title}"`}
              subtitle={`${selectedSong.artist} - Tonalité: ${selectedSong.key}, Tempo: ${selectedSong.tempo} BPM`}
              icon={<MicrophoneIcon className="h-5 w-5 text-[#3244c7]" />}
            />
            <div className="px-6 pb-6 space-y-6">
              {/* Instrument Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrument <span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadData.instrument}
                  onChange={(e) => setUploadData(prev => ({ ...prev, instrument: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3244c7] focus:ring-2 focus:ring-[#3244c7]/20 focus:outline-none transition-all"
                  required
                >
                  <option value="">Sélectionnez votre instrument</option>
                  {instruments.map(instrument => (
                    <option key={instrument} value={instrument}>{instrument}</option>
                  ))}
                </select>
              </div>

              {/* Version/Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version/Style
                </label>
                <Input
                  value={uploadData.version}
                  onChange={(e) => setUploadData(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="Ex: Version acoustique, Style gospel, Arrangement moderne..."
                  helperText="Optionnel - Décrivez le style de votre interprétation"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier Audio <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#3244c7] transition-colors">
                  {!audioFile ? (
                    <div>
                      <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Glissez votre fichier ici ou cliquez pour parcourir
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        MP3, WAV, M4A - Maximum 50MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choisir un fichier
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-3">
                        <MicrophoneIcon className="h-8 w-8 text-[#3244c7]" />
                        <div>
                          <p className="font-medium text-gray-900">{audioFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAudioFile(null)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes pour l'équipe
                </label>
                <textarea
                  value={uploadData.notes}
                  onChange={(e) => setUploadData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3244c7] focus:ring-2 focus:ring-[#3244c7]/20 focus:outline-none transition-all resize-none"
                  placeholder="Ajoutez des informations utiles : difficultés particulières, conseils de jeu, etc."
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={uploadData.isPublic}
                    onChange={(e) => setUploadData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
                  />
                  <span className="text-sm text-gray-700">
                    Rendre disponible à tous les musiciens (recommandé)
                  </span>
                </label>

                {selectedSong.hasMyRecording && (
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={uploadData.replaceExisting}
                      onChange={(e) => setUploadData(prev => ({ ...prev, replaceExisting: e.target.checked }))}
                      className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
                    />
                    <span className="text-sm text-gray-700">
                      Remplacer mon enregistrement existant
                    </span>
                  </label>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setUploadStep('select')}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button
                  onClick={simulateUpload}
                  disabled={!uploadData.instrument || !audioFile}
                  className="flex-1"
                >
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  Uploader
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {uploadStep === 'select' && (
        <div className="text-center">
          <Button
            onClick={() => selectedSong ? setUploadStep('details') : alert('Veuillez sélectionner un chant')}
            disabled={!selectedSong}
            size="lg"
          >
            Continuer avec "{selectedSong?.title || 'chant sélectionné'}"
          </Button>
        </div>
      )}


    </div>
  );
}