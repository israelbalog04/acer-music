'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader } from '@/components/ui/card';
import {
  MusicalNoteIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CloudArrowUpIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function MyRecordingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [playingId, setPlayingId] = useState<number | null>(null);

  // Données simulées des enregistrements de l'utilisateur
  const myRecordings = [
    {
      id: 1,
      song: 'Amazing Grace',
      instrument: 'Guitare Électrique',
      uploadedAt: '2024-01-10T10:30:00Z',
      plays: 15,
      status: 'approuvé',
      rating: 4.6,
      duration: '4:35',
      version: 'Version lead avec solo',
      fileSize: '8.2 MB',
      feedback: 'Excellente interprétation, très bon solo final'
    },
    {
      id: 2,
      song: 'How Great Thou Art',
      instrument: 'Guitare Acoustique',
      uploadedAt: '2024-01-08T14:20:00Z',
      plays: 23,
      status: 'approuvé',
      rating: 4.8,
      duration: '5:18',
      version: 'Version acoustique intimiste',
      fileSize: '10.1 MB',
      feedback: 'Très belle approche acoustique, parfait pour les moments de recueillement'
    },
    {
      id: 3,
      song: 'Blessed Be Your Name',
      instrument: 'Guitare Électrique',
      uploadedAt: '2024-01-05T16:45:00Z',
      plays: 8,
      status: 'en-attente',
      rating: 0,
      duration: '4:15',
      version: 'Version rock moderne',
      fileSize: '9.5 MB',
      feedback: null
    },
    {
      id: 4,
      song: 'In Christ Alone',
      instrument: 'Guitare Acoustique',
      uploadedAt: '2024-01-03T09:15:00Z',
      plays: 31,
      status: 'approuvé',
      rating: 4.9,
      duration: '4:52',
      version: 'Arrangement fingerpicking',
      fileSize: '11.3 MB',
      feedback: 'Magnifique arrangement, technique fingerpicking impressionnante'
    },
    {
      id: 5,
      song: 'Great is Thy Faithfulness',
      instrument: 'Guitare Électrique',
      uploadedAt: '2023-12-28T11:00:00Z',
      plays: 19,
      status: 'rejeté',
      rating: 0,
      duration: '4:28',
      version: 'Version électrique',
      fileSize: '8.8 MB',
      feedback: 'Qualité audio insuffisante, merci de ré-enregistrer avec un meilleur micro'
    }
  ];

  const statusOptions = [
    { value: 'tous', label: 'Tous les statuts' },
    { value: 'approuvé', label: 'Approuvés' },
    { value: 'en-attente', label: 'En attente' },
    { value: 'rejeté', label: 'Rejetés' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approuvé':
        return 'bg-green-100 text-green-800';
      case 'en-attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejeté':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approuvé':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'en-attente':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'rejeté':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredRecordings = myRecordings.filter(recording => {
    const matchesSearch = recording.song.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recording.instrument.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'tous' || recording.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const togglePlay = (recordingId: number) => {
    setPlayingId(playingId === recordingId ? null : recordingId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Enregistrements</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos uploads et consultez leur statut
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/app/music/upload">
            <Button>
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Nouvel Upload
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="animate-scaleIn hover-lift">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg transition-transform duration-200 hover:scale-110 hover:rotate-6">
                <MusicalNoteIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900 animate-bounceIn animate-delay-300">
                  {myRecordings.length}
                </p>
              </div>
            </div>
          </Card>
        </div>
        <div className="animate-scaleIn animate-delay-100 hover-lift">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg transition-transform duration-200 hover:scale-110 hover:rotate-6">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-gray-900 animate-bounceIn animate-delay-500">
                  {myRecordings.filter(r => r.status === 'approuvé').length}  
                </p>
              </div>
            </div>
          </Card>
        </div>
        <div className="animate-scaleIn animate-delay-200 hover-lift">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg transition-transform duration-200 hover:scale-110 hover:rotate-6">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900 animate-bounceIn animate-delay-500">
                  {myRecordings.filter(r => r.status === 'en-attente').length}
                </p>
              </div>
            </div>
          </Card>
        </div>
        <div className="animate-scaleIn animate-delay-300 hover-lift">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg transition-transform duration-200 hover:scale-110 hover:rotate-6">
                <PlayIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total écoutes</p>
                <p className="text-2xl font-bold text-gray-900 animate-bounceIn animate-delay-500">
                  {myRecordings.reduce((sum, r) => sum + r.plays, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <Input
                placeholder="Rechercher par chant ou instrument..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <div className="lg:col-span-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3244c7] focus:ring-2 focus:ring-[#3244c7]/20 focus:outline-none transition-all"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Recordings List */}
      <div className="space-y-4">
        {filteredRecordings.map((recording, index) => (
          <div
            key={recording.id}
            className={`animate-slideInFromBottom animate-delay-${Math.min(index * 100, 700)} hover-lift`}
          >
            <Card className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{recording.song}</h3>
                    {getStatusIcon(recording.status)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(recording.status)}`}>
                      {recording.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{recording.instrument}</p>
                  <p className="text-xs text-gray-500">
                    {recording.version} • Uploadé le {new Date(recording.uploadedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePlay(recording.id)}
                    title={playingId === recording.id ? 'Pause' : 'Écouter'}
                    className="hover-scale"
                  >
                    <div className={playingId === recording.id ? 'animate-spin-custom' : ''}>
                      {playingId === recording.id ? (
                        <PauseIcon className="h-4 w-4" />
                      ) : (
                        <PlayIcon className="h-4 w-4" />
                      )}
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-blue-700 border-blue-200 hover:bg-blue-50 px-2 py-1"
                    title="Voir les détails"
                  >
                    <EyeIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">Détails</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-amber-700 border-amber-200 hover:bg-amber-50 px-2 py-1"
                    title="Modifier l'enregistrement"
                  >
                    <PencilIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">Modifier</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-red-700 border-red-200 hover:bg-red-50 px-2 py-1"
                    title="Supprimer l'enregistrement"
                  >
                    <TrashIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">Supprimer</span>
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Durée</p>
                  <p className="font-medium text-gray-900">{recording.duration}</p>
                </div>
                <div>
                  <p className="text-gray-600">Écoutes</p>
                  <p className="font-medium text-gray-900">{recording.plays}</p>
                </div>
                <div>
                  <p className="text-gray-600">Taille</p>
                  <p className="font-medium text-gray-900">{recording.fileSize}</p>
                </div>
                <div>
                  <p className="text-gray-600">Note</p>
                  <div className="flex items-center space-x-1">
                    {recording.rating > 0 ? (
                      <>
                        {renderStars(Math.floor(recording.rating))}
                        <span className="text-xs text-gray-500">({recording.rating})</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">Non noté</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {recording.feedback && (
                <div className={`p-3 rounded-lg border-l-4 ${
                  recording.status === 'approuvé' 
                    ? 'bg-green-50 border-green-400' 
                    : recording.status === 'rejeté'
                      ? 'bg-red-50 border-red-400'
                      : 'bg-blue-50 border-blue-400'
                }`}>
                  <p className={`text-sm ${
                    recording.status === 'approuvé' 
                      ? 'text-green-700' 
                      : recording.status === 'rejeté'
                        ? 'text-red-700'
                        : 'text-blue-700'
                  }`}>
                    <strong>Retour de l'équipe :</strong> {recording.feedback}
                  </p>
                </div>
              )}
            </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecordings.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <MusicalNoteIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedStatus !== 'tous' 
                ? 'Aucun enregistrement trouvé' 
                : 'Aucun enregistrement'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedStatus !== 'tous'
                ? 'Essayez de modifier vos critères de recherche.'
                : 'Commencez par uploader votre premier enregistrement.'
              }
            </p>
            <Link href="/app/music/upload">
              <Button>
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Premier Upload
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}