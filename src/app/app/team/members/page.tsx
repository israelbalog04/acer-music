'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader } from '@/components/ui/card';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  EnvelopeIcon,
  MusicalNoteIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  StarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export default function EquipePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('tous');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Données simulées des musiciens
  const musicians = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+33 6 12 34 56 78',
      avatar: 'JD',
      role: 'Musicien',
      status: 'disponible',
      instruments: ['Guitare Électrique', 'Guitare Acoustique'],
      experience: 8,
      joinedDate: '2020-03-15',
      lastActive: '2024-01-10',
      uploads: 12,
      servicesCount: 45,
      rating: 4.8,
      isLeader: true,
      availability: {
        sunday: true,
        weekdays: false,
        rehearsals: true
      },
      specialties: ['Lead Guitar', 'Accompagnement', 'Arrangements'],
      bio: 'Guitariste principal avec une forte expérience en louange contemporaine. Passionné par les arrangements et la formation des jeunes musiciens.'
    },
    {
      id: 2,
      name: 'Marie Dubois',
      email: 'marie.dubois@email.com',
      phone: '+33 6 23 45 67 89',
      avatar: 'MD',
      role: 'Chef de Louange',
      status: 'disponible',
      instruments: ['Piano', 'Chant'],
      experience: 12,
      joinedDate: '2018-09-20',
      lastActive: '2024-01-12',
      uploads: 28,
      servicesCount: 78,
      rating: 4.9,
      isLeader: true,
      availability: {
        sunday: true,
        weekdays: true,
        rehearsals: true
      },
      specialties: ['Direction musicale', 'Piano classique', 'Formation vocale'],
      bio: 'Chef de louange expérimentée, formatrice en chant et piano. Coordonne les équipes musicales et développe le répertoire de l\'église.'
    },
    {
      id: 3,
      name: 'Pierre Dupont',
      email: 'pierre.dupont@email.com',
      phone: '+33 6 34 56 78 90',
      avatar: 'PD',
      role: 'Musicien',
      status: 'occupé',
      instruments: ['Basse'],
      experience: 6,
      joinedDate: '2021-01-10',
      lastActive: '2024-01-08',
      uploads: 8,
      servicesCount: 32,
      rating: 4.6,
      isLeader: false,
      availability: {
        sunday: true,
        weekdays: false,
        rehearsals: true
      },
      specialties: ['Basse électrique', 'Groove', 'Accompagnement rythmique'],
      bio: 'Bassiste solide avec un excellent sens du rythme. Apporte une fondation musicale stable à toutes les louanges.'
    },
    {
      id: 4,
      name: 'Sophie Martin',
      email: 'sophie.martin@email.com',
      phone: '+33 6 45 67 89 01',
      avatar: 'SM',
      role: 'Chef de Louange',
      status: 'disponible',
      instruments: ['Chant Principal', 'Chœur'],
      experience: 10,
      joinedDate: '2019-06-01',
      lastActive: '2024-01-11',
      uploads: 15,
      servicesCount: 62,
      rating: 4.7,
      isLeader: true,
      availability: {
        sunday: true,
        weekdays: true,
        rehearsals: true
      },
      specialties: ['Chant lead', 'Harmonies', 'Direction de chœur'],
      bio: 'Chanteuse principale avec une voix puissante et une grande capacité à diriger les louanges. Experte en harmonies vocales.'
    },
    {
      id: 5,
      name: 'Marc Durand',
      email: 'marc.durand@email.com',
      phone: '+33 6 56 78 90 12',
      avatar: 'MD',
      role: 'Musicien',
      status: 'en-repos',
      instruments: ['Batterie', 'Percussions'],
      experience: 15,
      joinedDate: '2017-11-12',
      lastActive: '2023-12-20',
      uploads: 6,
      servicesCount: 89,
      rating: 4.9,
      isLeader: false,
      availability: {
        sunday: false,
        weekdays: false,
        rehearsals: false
      },
      specialties: ['Batterie acoustique', 'Percussions ethniques', 'Rythmes complexes'],
      bio: 'Batteur très expérimenté, actuellement en congé sabbatique. Retour prévu au printemps 2024.'
    },
    {
      id: 6,
      name: 'Claire Bernard',
      email: 'claire.bernard@email.com',
      phone: '+33 6 67 89 01 23',
      avatar: 'CB',
      role: 'Musicien',
      status: 'disponible',
      instruments: ['Violon', 'Alto'],
      experience: 4,
      joinedDate: '2022-04-18',
      lastActive: '2024-01-09',
      uploads: 5,
      servicesCount: 18,
      rating: 4.4,
      isLeader: false,
      availability: {
        sunday: true,
        weekdays: false,
        rehearsals: true
      },
      specialties: ['Violon classique', 'Arrangements orchestraux', 'Musique de chambre'],
      bio: 'Violoniste classique qui apporte une dimension orchestrale à nos louanges. Récemment arrivée dans l\'équipe.'
    }
  ];

  const instruments = [
    'tous',
    'Piano',
    'Guitare Électrique',
    'Guitare Acoustique',
    'Basse',
    'Batterie',
    'Chant Principal',
    'Chœur',
    'Violon',
    'Saxophone',
    'Trompette'
  ];

  const statusOptions = [
    { value: 'tous', label: 'Tous les statuts' },
    { value: 'disponible', label: 'Disponible' },
    { value: 'occupé', label: 'Occupé' },
    { value: 'en-repos', label: 'En repos' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'bg-green-100 text-green-800';
      case 'occupé':
        return 'bg-yellow-100 text-yellow-800';
      case 'en-repos':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'disponible':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'occupé':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />;
      case 'en-repos':
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredMusicians = musicians.filter(musician => {
    const matchesSearch = musician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         musician.instruments.some(inst => inst.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesInstrument = selectedInstrument === 'tous' || 
                             musician.instruments.some(inst => inst.includes(selectedInstrument));
    const matchesStatus = selectedStatus === 'tous' || musician.status === selectedStatus;
    
    return matchesSearch && matchesInstrument && matchesStatus;
  });

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-4 w-4 text-yellow-400" />);
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Équipe Musicale</h1>
          <p className="text-gray-600 mt-1">
            Annuaire des musiciens d'Acer Paris
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex border border-gray-200 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-[#3244c7] text-white' : 'text-gray-400'} rounded-l-lg transition-colors`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-[#3244c7] text-white' : 'text-gray-400'} rounded-r-lg transition-colors`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Inviter un musicien
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search */}
            <div className="lg:col-span-6">
              <Input
                placeholder="Rechercher un musicien ou instrument..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>

            {/* Instrument Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3244c7] focus:ring-2 focus:ring-[#3244c7]/20 focus:outline-none transition-all"
              >
                {instruments.map(instrument => (
                  <option key={instrument} value={instrument}>
                    {instrument === 'tous' ? 'Tous les instruments' : instrument}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-3">
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Musiciens</p>
              <p className="text-2xl font-bold text-gray-900">{musicians.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">
                {musicians.filter(m => m.status === 'disponible').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chefs de Louange</p>
              <p className="text-2xl font-bold text-gray-900">
                {musicians.filter(m => m.role === 'Chef de Louange').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <MusicalNoteIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Instruments</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(musicians.flatMap(m => m.instruments)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Musicians List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredMusicians.map((musician) => (
          <Card key={musician.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#3244c7] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{musician.avatar}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">{musician.name}</h3>
                      {musician.isLeader && (
                        <StarSolidIcon className="h-4 w-4 text-yellow-500" title="Leader" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{musician.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(musician.status)}
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(musician.status)}`}>
                    {musician.status}
                  </span>
                </div>
              </div>

              {/* Instruments */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Instruments:</p>
                <div className="flex flex-wrap gap-1">
                  {musician.instruments.map((instrument, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {instrument}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Expérience</p>
                  <p className="font-medium text-gray-900">{musician.experience} ans</p>
                </div>
                <div>
                  <p className="text-gray-600">Services</p>
                  <p className="font-medium text-gray-900">{musician.servicesCount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Uploads</p>
                  <p className="font-medium text-gray-900">{musician.uploads}</p>
                </div>
                <div>
                  <p className="text-gray-600">Note</p>
                  <div className="flex items-center space-x-1">
                    {renderStars(musician.rating).slice(0, 3)}
                    <span className="text-xs text-gray-500">({musician.rating})</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Disponibilités:</p>
                <div className="flex space-x-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    musician.availability.sunday ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Dimanche
                  </span>
                  <span className={`px-2 py-1 rounded-full ${
                    musician.availability.rehearsals ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Répétitions
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {musician.bio}
                </p>
              </div>

              {/* Contact Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" title="Appeler">
                    <PhoneIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Email">
                    <EnvelopeIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500">
                  Actif le {new Date(musician.lastActive).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMusicians.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun musicien trouvé</h3>
            <p className="text-gray-500 mb-6">
              Essayez de modifier vos critères de recherche ou invitez de nouveaux musiciens.
            </p>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Inviter un musicien
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}