'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';

export default function PlanningPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedService, setSelectedService] = useState<number | null>(null);

  // Données simulées pour les services
  const services = [
    {
      id: 1,
      date: '2024-01-14',
      time: '10:30',
      type: 'Culte du Dimanche',
      location: 'Sanctuaire Principal',
      status: 'confirmé',
      leader: 'Sophie Martin',
      team: [
        { name: 'John Doe', instrument: 'Guitare Principale', status: 'confirmé', avatar: 'JD' },
        { name: 'Marie Dubois', instrument: 'Piano', status: 'confirmé', avatar: 'MD' },
        { name: 'Pierre Dupont', instrument: 'Basse', status: 'confirmé', avatar: 'PD' },
        { name: 'Marc Durand', instrument: 'Batterie', status: 'en-attente', avatar: 'MD' },
        { name: 'Claire Bernard', instrument: 'Violon', status: 'confirmé', avatar: 'CB' },
        { name: 'Sophie Martin', instrument: 'Chant Principal', status: 'confirmé', avatar: 'SM' },
        { name: 'Anne Rousseau', instrument: 'Chœur', status: 'confirmé', avatar: 'AR' }
      ],
      repertoire: [
        'Amazing Grace',
        'How Great Thou Art',
        'Blessed Be Your Name',
        'Great is Thy Faithfulness'
      ],
      rehearsal: {
        date: '2024-01-13',
        time: '15:00',
        location: 'Salle de répétition'
      },
      notes: 'Service spécial avec témoignages. Prévoir des transitions plus longues.'
    },
    {
      id: 2,
      date: '2024-01-21',
      time: '10:30',
      type: 'Culte du Dimanche',
      location: 'Sanctuaire Principal',
      status: 'en-preparation',
      leader: 'John Doe',
      team: [
        { name: 'John Doe', instrument: 'Guitare Principale', status: 'confirmé', avatar: 'JD' },
        { name: 'Marie Dubois', instrument: 'Piano', status: 'en-attente', avatar: 'MD' },
        { name: 'Pierre Dupont', instrument: 'Basse', status: 'confirmé', avatar: 'PD' },
        { name: 'Marc Durand', instrument: 'Batterie', status: 'en-attente', avatar: 'MD' },
        { name: 'Sophie Martin', instrument: 'Chant Principal', status: 'confirmé', avatar: 'SM' }
      ],
      repertoire: [
        'Holy Holy Holy',
        'In Christ Alone',
        'The Heart of Worship'
      ],
      rehearsal: {
        date: '2024-01-20',
        time: '15:00',
        location: 'Salle de répétition'
      },
      notes: 'Nouveau répertoire, répétition obligatoire pour tous.'
    },
    {
      id: 3,
      date: '2024-01-28',
      time: '18:00',
      type: 'Soirée de Louange',
      location: 'Sanctuaire Principal',
      status: 'en-preparation',
      leader: 'Sophie Martin',
      team: [
        { name: 'John Doe', instrument: 'Guitare', status: 'confirmé', avatar: 'JD' },
        { name: 'Claire Bernard', instrument: 'Violon', status: 'confirmé', avatar: 'CB' },
        { name: 'Sophie Martin', instrument: 'Chant Principal', status: 'confirmé', avatar: 'SM' },
        { name: 'Anne Rousseau', instrument: 'Chœur', status: 'en-attente', avatar: 'AR' }
      ],
      repertoire: [
        'Here I Am to Worship',
        'Shout to the Lord',
        'As the Deer'
      ],
      rehearsal: {
        date: '2024-01-27',
        time: '16:00',
        location: 'Salle de répétition'
      },
      notes: 'Ambiance intimiste, privilégier les instruments acoustiques.'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmé':
        return 'bg-green-100 text-green-800';
      case 'en-attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en-preparation':
        return 'bg-blue-100 text-blue-800';
      case 'annulé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmé':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'en-attente':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />;
      case 'en-preparation':
        return <ClockIcon className="h-4 w-4 text-blue-600" />;
      case 'annulé':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planning des Services</h1>
          <p className="text-gray-600 mt-1">
            Gestion des équipes musicales par service
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex border border-gray-200 rounded-lg">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm ${viewMode === 'month' ? 'bg-[#3244c7] text-white' : 'text-gray-600'} rounded-l-lg transition-colors`}
            >
              Mois
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm ${viewMode === 'week' ? 'bg-[#3244c7] text-white' : 'text-gray-600'} rounded-r-lg transition-colors`}
            >
              Semaine
            </button>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouveau Service
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Mini Calendar View */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            {/* Simplified calendar grid - in real app, would calculate actual dates */}
            {Array.from({ length: 35 }, (_, i) => {
              const dayNumber = i - 6 + 1;
              const isCurrentMonth = dayNumber > 0 && dayNumber <= 31;
              const hasService = [14, 21, 28].includes(dayNumber);
              
              return (
                <div
                  key={i}
                  className={`
                    p-2 text-center text-sm h-10 flex items-center justify-center rounded-lg cursor-pointer
                    ${isCurrentMonth ? 'text-gray-900 hover:bg-gray-100' : 'text-gray-300'}
                    ${hasService ? 'bg-[#3244c7] text-white hover:bg-[#2938b3]' : ''}
                  `}
                >
                  {isCurrentMonth ? dayNumber : ''}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Services List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card 
            key={service.id} 
            className={`hover:shadow-lg transition-all cursor-pointer ${
              selectedService === service.id ? 'ring-2 ring-[#3244c7]' : ''
            }`}
            onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
          >
            <div className="p-6">
              {/* Service Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{service.type}</h3>
                    {getStatusIcon(service.status)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(service.date).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {service.time}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {service.location}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>

              {/* Leader */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Chef de louange :</strong> {service.leader}
                </p>
              </div>

              {/* Team Preview */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Équipe ({service.team.length})</span>
                  <UserGroupIcon className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex -space-x-2">
                  {service.team.slice(0, 6).map((member, index) => (
                    <div
                      key={index}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white
                        ${member.status === 'confirmé' ? 'bg-[#3244c7]' : 'bg-yellow-500'}
                      `}
                      title={`${member.name} - ${member.instrument} (${member.status})`}
                    >
                      {member.avatar}
                    </div>
                  ))}
                  {service.team.length > 6 && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                      +{service.team.length - 6}
                    </div>
                  )}
                </div>
              </div>

              {/* Repertoire Preview */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Répertoire ({service.repertoire.length})</span>
                  <MusicalNoteIcon className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-sm text-gray-600">
                  {service.repertoire.slice(0, 2).map((song, index) => (
                    <div key={index} className="truncate">• {song}</div>
                  ))}
                  {service.repertoire.length > 2 && (
                    <div className="text-gray-400">+{service.repertoire.length - 2} autres...</div>
                  )}
                </div>
              </div>

              {/* Rehearsal Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <strong>Répétition :</strong> {new Date(service.rehearsal.date).toLocaleDateString('fr-FR')} à {service.rehearsal.time}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      Modifier
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedService === service.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Full Team List */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Équipe complète :</h4>
                    <div className="space-y-2">
                      {service.team.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`
                              w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white
                              ${member.status === 'confirmé' ? 'bg-[#3244c7]' : 'bg-yellow-500'}
                            `}>
                              {member.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.instrument}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)}`}>
                            {member.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Full Repertoire */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Répertoire complet :</h4>
                    <div className="space-y-1">
                      {service.repertoire.map((song, index) => (
                        <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                          {index + 1}. {song}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {service.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Notes :</h4>
                      <p className="text-sm text-gray-600 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        {service.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Button size="sm">Modifier l'équipe</Button>
                    <Button variant="outline" size="sm">Gérer le répertoire</Button>
                    <Button variant="ghost" size="sm">Envoyer rappel</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service planifié</h3>
            <p className="text-gray-500 mb-6">
              Commencez par créer votre premier service musical.
            </p>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Créer un service
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}