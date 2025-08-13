'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  MusicalNoteIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  InformationCircleIcon,
  TagIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface Schedule {
  id: string;
  title: string;
  date: Date;
  type: string;
  location?: string;
  description?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  instruments: string[];
  avatar?: string;
}

interface Availability {
  id: string;
  scheduleId: string;
  schedule: Schedule;
  user: User;
  isAvailable: boolean;
  timeSlots: string[];
  notes?: string;
  createdAt: string;
}

interface EventAvailability {
  event: Schedule;
  availableMembers: Availability[];
  unavailableMembers: Availability[];
  noResponse: User[];
  totalMembers: number;
}

export default function TeamAvailabilityPage() {
  const { churchName } = useUserData();
  const [events, setEvents] = useState<Schedule[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventAvailability, setEventAvailability] = useState<EventAvailability | null>(null);
  const [allMembers, setAllMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('tous');
  const [filterInstrument, setFilterInstrument] = useState('tous');

  const timeSlotOptions = [
    { value: 'matin', label: 'Matin (8h-12h)' },
    { value: 'apres-midi', label: 'Après-midi (12h-18h)' },
    { value: 'soir', label: 'Soir (18h-22h)' }
  ];

  // Charger les événements à venir
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const eventsData = await response.json();
          const upcomingEvents = eventsData
            .filter((event: any) => new Date(event.date) >= new Date())
            .map((event: any) => ({
              ...event,
              date: new Date(event.date)
            }))
            .sort((a: Schedule, b: Schedule) => a.date.getTime() - b.date.getTime());
          
          setEvents(upcomingEvents);
          if (upcomingEvents.length > 0) {
            setSelectedEventId(upcomingEvents[0].id);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
      }
    };

    const fetchAllMembers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const membersData = await response.json();
          const activeMembers = membersData.filter((user: any) => 
            user.role !== 'ADMIN' && user.isApproved
          ).map((user: any) => ({
            ...user,
            instruments: user.instruments ? JSON.parse(user.instruments) : []
          }));
          setAllMembers(activeMembers);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    fetchAllMembers();
  }, []);

  // Charger les disponibilités pour l'événement sélectionné
  useEffect(() => {
    if (selectedEventId) {
      fetchEventAvailability();
    }
  }, [selectedEventId]);

  const fetchEventAvailability = async () => {
    if (!selectedEventId) return;

    try {
      const response = await fetch(`/api/admin/availability?eventId=${selectedEventId}`);
      if (response.ok) {
        const availabilities = await response.json();
        
        const selectedEvent = events.find(e => e.id === selectedEventId);
        if (!selectedEvent) return;

        // Grouper les disponibilités
        const available = availabilities.filter((a: any) => a.isAvailable);
        const unavailable = availabilities.filter((a: any) => !a.isAvailable);
        
        // Membres sans réponse
        const respondedUserIds = availabilities.map((a: any) => a.userId);
        const noResponse = allMembers.filter(member => 
          !respondedUserIds.includes(member.id)
        );

        setEventAvailability({
          event: selectedEvent,
          availableMembers: available,
          unavailableMembers: unavailable,
          noResponse,
          totalMembers: allMembers.length
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
    }
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    return timeSlotOptions.find(option => option.value === timeSlot)?.label || timeSlot;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'SERVICE': return 'bg-green-100 text-green-800 border-green-200';
      case 'REPETITION': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONCERT': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'FORMATION': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CHEF_LOUANGE': return 'bg-purple-100 text-purple-800';
      case 'MUSICIEN': return 'bg-blue-100 text-blue-800';
      case 'TECHNICIEN': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'CHEF_LOUANGE': return 'Chef de Louange';
      case 'MUSICIEN': return 'Musicien';
      case 'TECHNICIEN': return 'Technicien';
      default: return role;
    }
  };

  const filterMembers = (members: any[]) => {
    return members.filter(member => {
      const user = member.user || member;
      const instruments = Array.isArray(user.instruments) ? user.instruments : [];
      
      const matchesSearch = !searchTerm || 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instruments.some((inst: string) => inst.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = filterRole === 'tous' || user.role === filterRole;
      const matchesInstrument = filterInstrument === 'tous' || 
        instruments.some((inst: string) => inst.toLowerCase().includes(filterInstrument.toLowerCase()));
      
      return matchesSearch && matchesRole && matchesInstrument;
    });
  };

  // Obtenir tous les instruments uniques
  const allInstruments = Array.from(
    new Set(allMembers.flatMap(member => Array.isArray(member.instruments) ? member.instruments : []))
  ).sort();

  const renderMemberCard = (member: any, isAvailability: boolean = true) => {
    const user = isAvailability ? member.user : member;
    const availability = isAvailability ? member : null;

    return (
      <div
        className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
          availability 
            ? availability.isAvailable
              ? 'border-green-200 bg-green-50 hover:bg-green-100'
              : 'border-red-200 bg-red-50 hover:bg-red-100'
            : 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.firstName[0]}{user.lastName[0]}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h4>
                <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
              
              {Array.isArray(user.instruments) && user.instruments.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {user.instruments.map((instrument: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      <MusicalNoteIcon className="h-3 w-3 inline mr-1" />
                      {instrument}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {user.email && (
                  <span className="flex items-center">
                    <EnvelopeIcon className="h-3 w-3 mr-1" />
                    {user.email}
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center">
                    <PhoneIcon className="h-3 w-3 mr-1" />
                    {user.phone}
                  </span>
                )}
              </div>

              {availability && (
                <div className="mt-3">
                  <div className="flex items-center space-x-2 mb-1">
                    {availability.isAvailable ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      availability.isAvailable ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {availability.isAvailable ? 'Disponible' : 'Non disponible'}
                    </span>
                  </div>

                  {availability.isAvailable && Array.isArray(availability.timeSlots) && availability.timeSlots.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {availability.timeSlots.map((slot: any, index: number) => {
                        const slotValue = typeof slot === 'string' ? slot : String(slot);
                        return (
                          <span key={`${availability.id}-slot-${index}-${slotValue}`} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            <ClockIcon className="h-3 w-3 inline mr-1" />
                            {getTimeSlotLabel(slotValue)}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {availability.notes && (
                    <p className="text-sm text-gray-600 italic">
                      "{availability.notes}"
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    Répondu le {new Date(availability.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des disponibilités...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="h-8 w-8 mr-3 text-blue-600" />
              Disponibilités de l'Équipe
            </h1>
            <p className="text-gray-600 mt-2">
              Consultez qui est disponible pour chaque événement de {churchName}
            </p>
          </div>
        </div>

        {/* Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Vue d'ensemble des disponibilités</p>
              <p className="text-blue-700">
                Sélectionnez un événement pour voir qui a répondu, leurs créneaux disponibles et qui n'a pas encore répondu.
              </p>
            </div>
          </div>
        </Card>

        {/* Sélection d'événement */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un événement
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choisir un événement...</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {formatDate(event.date)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Résultats */}
        {eventAvailability && (
          <div className="space-y-6">
            {/* Résumé de l'événement */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {eventAvailability.event.title}
                    </h2>
                    <span className={`px-3 py-1 text-sm rounded-full border ${getEventTypeColor(eventAvailability.event.type)}`}>
                      {eventAvailability.event.type}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {formatDate(eventAvailability.event.date)}
                  </p>
                  {eventAvailability.event.location && (
                    <p className="text-gray-600">
                      📍 {eventAvailability.event.location}
                    </p>
                  )}
                  {eventAvailability.event.description && (
                    <p className="text-gray-700 mt-2">
                      {eventAvailability.event.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600">Disponibles</p>
                      <p className="text-2xl font-bold text-green-800">
                        {eventAvailability.availableMembers.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                    <div>
                      <p className="text-sm text-red-600">Non disponibles</p>
                      <p className="text-2xl font-bold text-red-800">
                        {eventAvailability.unavailableMembers.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="text-sm text-yellow-600">Sans réponse</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {eventAvailability.noResponse.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Total équipe</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {eventAvailability.totalMembers}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Filtres */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Rechercher par nom ou instrument..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tous">Tous les rôles</option>
                  <option value="CHEF_LOUANGE">Chef de Louange</option>
                  <option value="MUSICIEN">Musicien</option>
                  <option value="TECHNICIEN">Technicien</option>
                </select>
                <select
                  value={filterInstrument}
                  onChange={(e) => setFilterInstrument(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tous">Tous les instruments</option>
                  {allInstruments.map(instrument => (
                    <option key={instrument} value={instrument}>{instrument}</option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Membres disponibles */}
            <Card>
              <CardHeader
                title={`Membres Disponibles (${filterMembers(eventAvailability.availableMembers).length})`}
                subtitle="Musiciens qui ont confirmé leur disponibilité"
                icon={<CheckCircleIcon className="h-5 w-5 text-green-600" />}
              />
              <div className="p-6">
                {filterMembers(eventAvailability.availableMembers).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircleIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Aucun membre disponible trouvé</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filterMembers(eventAvailability.availableMembers).map((member, index) =>
                      <div key={`available-${member.id || member.user?.id || index}`}>
                        {renderMemberCard(member, true)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Membres non disponibles */}
            <Card>
              <CardHeader
                title={`Membres Non Disponibles (${filterMembers(eventAvailability.unavailableMembers).length})`}
                subtitle="Musiciens qui ont signalé leur indisponibilité"
                icon={<XCircleIcon className="h-5 w-5 text-red-600" />}
              />
              <div className="p-6">
                {filterMembers(eventAvailability.unavailableMembers).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <XCircleIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Aucun membre non disponible trouvé</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filterMembers(eventAvailability.unavailableMembers).map((member, index) =>
                      <div key={`unavailable-${member.id || member.user?.id || index}`}>
                        {renderMemberCard(member, true)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Membres sans réponse */}
            <Card>
              <CardHeader
                title={`Membres Sans Réponse (${filterMembers(eventAvailability.noResponse).length})`}
                subtitle="Musiciens qui n'ont pas encore répondu"
                icon={<ClockIcon className="h-5 w-5 text-yellow-600" />}
              />
              <div className="p-6">
                {filterMembers(eventAvailability.noResponse).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Tous les membres ont répondu !</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filterMembers(eventAvailability.noResponse).map((member, index) =>
                      <div key={`noresponse-${member.id || index}`}>
                        {renderMemberCard(member, false)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}