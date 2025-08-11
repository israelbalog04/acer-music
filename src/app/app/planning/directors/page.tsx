'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useUserData } from '@/hooks/useUserData';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UsersIcon,
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  MusicalNoteIcon,
  CheckCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  instruments: string[];
}

interface EventDirector {
  id: string;
  user: User;
  assignedBy: {
    firstName: string;
    lastName: string;
  };
  assignedAt: string;
  notes?: string;
}

interface Event {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  type: string;
  directors: EventDirector[];
}

export default function EventDirectorsPage() {
  const { userRole, churchName } = useUserData();
  const [events, setEvents] = useState<Event[]>([]);
  const [availableMusicians, setAvailableMusicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMusician, setSelectedMusician] = useState<string>('');
  const [notes, setNotes] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Data will be loaded from API when implemented
        // For now, using empty arrays
        setEvents([]);
        setAvailableMusicians([]);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssignDirector = async () => {
    if (!selectedEvent || !selectedMusician) return;

    // Simulation d'appel API
    const newDirector: EventDirector = {
      id: Date.now().toString(),
      user: availableMusicians.find(m => m.id === selectedMusician)!,
      assignedBy: {
        firstName: 'Admin',
        lastName: 'Current'
      },
      assignedAt: new Date().toISOString(),
      notes
    };

    setEvents(prev => prev.map(event => 
      event.id === selectedEvent 
        ? { ...event, directors: [...event.directors, newDirector] }
        : event
    ));

    // Reset du formulaire
    setSelectedMusician('');
    setNotes('');
    setShowAssignModal(false);
    setSelectedEvent(null);
  };

  const handleRevokeDirector = async (eventId: string, directorId: string) => {
    if (confirm('Êtes-vous sûr de vouloir révoquer ce directeur musical ?')) {
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, directors: event.directors.filter(d => d.id !== directorId) }
          : event
      ));
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'SERVICE': 'bg-blue-100 text-blue-800 border-blue-200',
      'REPETITION': 'bg-green-100 text-green-800 border-green-200',
      'CONCERT': 'bg-purple-100 text-purple-800 border-purple-200',
      'FORMATION': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEventTypeLabel = (type: string) => {
    const labels = {
      'SERVICE': 'Service',
      'REPETITION': 'Répétition',
      'CONCERT': 'Concert',
      'FORMATION': 'Formation'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getAvailableMusiciciansForEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return availableMusicians;

    const assignedIds = event.directors.map(d => d.user.id);
    return availableMusicians.filter(m => !assignedIds.includes(m.id));
  };

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <StarIcon className="h-8 w-8 mr-3 text-yellow-600" />
            Gestion des Directeurs Musicaux
          </h1>
          <p className="text-gray-600 mt-2">
            Attribuez des directeurs musicaux pour les événements de {churchName}
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600">Événements à venir</p>
                <p className="text-2xl font-bold text-blue-800">{events.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600">DM assignés</p>
                <p className="text-2xl font-bold text-green-800">
                  {events.reduce((total, event) => total + event.directors.length, 0)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-purple-600">Musiciens disponibles</p>
                <p className="text-2xl font-bold text-purple-800">{availableMusicians.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center">
              <MusicalNoteIcon className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-orange-600">Événements sans DM</p>
                <p className="text-2xl font-bold text-orange-800">
                  {events.filter(e => e.directors.length === 0).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Liste des événements */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des événements...</p>
            </Card>
          ) : events.length === 0 ? (
            <Card className="p-8 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun événement à venir</p>
            </Card>
          ) : (
            events.map(event => (
              <Card key={event.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEventTypeColor(event.type)}`}>
                        {getEventTypeLabel(event.type)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {formatDateTime(event.startTime)}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {event.endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedEvent(event.id);
                      setShowAssignModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={getAvailableMusiciciansForEvent(event.id).length === 0}
                  >
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Assigner DM
                  </Button>
                </div>

                {/* Directeurs assignés */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Directeurs Musicaux ({event.directors.length})
                  </h4>

                  {event.directors.length === 0 ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                      <UserMinusIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <p className="text-orange-700 font-medium">Aucun directeur musical assigné</p>
                      <p className="text-orange-600 text-sm mt-1">
                        Cet événement nécessite au moins 1 directeur musical
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.directors.map(director => (
                        <div key={director.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <StarIcon className="h-5 w-5 text-yellow-500" />
                                <span className="font-semibold text-gray-900">
                                  {director.user.firstName} {director.user.lastName}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {director.user.role}
                                </span>
                              </div>

                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  <strong>Instruments:</strong> {JSON.parse(director.user.instruments as any || '[]').join(', ')}
                                </p>
                                <p>
                                  <strong>Assigné par:</strong> {director.assignedBy.firstName} {director.assignedBy.lastName}
                                </p>
                                <p>
                                  <strong>Le:</strong> {new Date(director.assignedAt).toLocaleDateString('fr-FR')}
                                </p>
                                {director.notes && (
                                  <p><strong>Notes:</strong> {director.notes}</p>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              onClick={() => handleRevokeDirector(event.id, director.id)}
                              className="ml-4 text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal d'assignation */}
        {showAssignModal && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Assigner un Directeur Musical
                </h3>
              </div>

              <div className="p-6 pt-0">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sélectionner un musicien
                    </label>
                    <select
                      value={selectedMusician}
                      onChange={(e) => setSelectedMusician(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Choisir un musicien...</option>
                      {selectedEvent && getAvailableMusiciciansForEvent(selectedEvent).map(musician => (
                        <option key={musician.id} value={musician.id}>
                          {musician.firstName} {musician.lastName} - {musician.role} ({JSON.parse(musician.instruments as any || '[]').join(', ')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Instructions spéciales, responsabilités..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedEvent(null);
                      setSelectedMusician('');
                      setNotes('');
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAssignDirector}
                    disabled={!selectedMusician}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Assigner
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
