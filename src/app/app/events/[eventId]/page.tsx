'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  MusicalNoteIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import EventChat from '@/components/event/EventChat';

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
  hasMultipleSessions: boolean;
  sessionCount: number;
  notes?: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  eventTeamMembers?: Array<{
    id: string;
    role?: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      instruments: string;
    };
  }>;
  directors?: Array<{
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  }>;
}

export default function EventDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(true); // Chat ouvert par défaut

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else if (response.status === 404) {
        setError('Événement non trouvé');
      } else {
        setError('Erreur lors du chargement de l\'événement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'Planifié';
      case 'IN_PROGRESS': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CULTE': return 'Culte';
      case 'REPETITION': return 'Répétition';
      case 'CONCERT': return 'Concert';
      case 'FORMATION': return 'Formation';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-700">{error || 'Événement non trouvé'}</p>
          <Link href="/app/planning/events" className="text-red-600 hover:text-red-800 underline mt-2 inline-block">
            Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/app/planning/events"
            className="flex items-center gap-2 text-gray-600 hover:text-[#3244c7] transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Retour aux événements
          </Link>
          <Button
            onClick={() => setShowChat(!showChat)}
            variant={showChat ? 'primary' : 'success'}
            className="ml-auto"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
            {showChat ? 'Masquer chat équipe' : 'Chat avec l\'équipe'}
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3244c7] to-blue-600 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {getTypeText(event.type)}
                    </span>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Détails de l'événement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Date</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(event.date)}
                    </div>
                  </div>
                </div>

                {(event.startTime || event.endTime) && (
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Horaires</div>
                      <div className="text-sm text-gray-600">
                        {event.startTime && formatTime(event.startTime)}
                        {event.startTime && event.endTime && ' - '}
                        {event.endTime && formatTime(event.endTime)}
                      </div>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Lieu</div>
                      <div className="text-sm text-gray-600">
                        {event.location}
                      </div>
                    </div>
                  </div>
                )}

                {event.hasMultipleSessions && (
                  <div className="flex items-center gap-3">
                    <UsersIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Sessions</div>
                      <div className="text-sm text-gray-600">
                        {event.sessionCount} session{event.sessionCount > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {event.notes && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Notes :</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {event.notes}
                  </p>
                </div>
              )}

              {/* Participants */}
              {(event.directors && event.directors.length > 0) || (event.eventTeamMembers && event.eventTeamMembers.length > 0) ? (
                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Équipe assignée ({(event.directors?.length || 0) + (event.eventTeamMembers?.length || 0)} membres)
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Directeurs */}
                    {event.directors && event.directors.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-purple-800 mb-2">Directeurs musicaux</h4>
                        <div className="flex flex-wrap gap-2">
                          {event.directors.map((director) => (
                            <div key={director.id} className="flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-full">
                              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {director.user.firstName.charAt(0)}{director.user.lastName.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-purple-800">
                                {director.user.firstName} {director.user.lastName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Membres de l'équipe */}
                    {event.eventTeamMembers && event.eventTeamMembers.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Musiciens</h4>
                        <div className="flex flex-wrap gap-2">
                          {event.eventTeamMembers.map((member) => (
                            <div key={member.id} className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-blue-800">
                                  {member.user.firstName} {member.user.lastName}
                                </span>
                                {member.role && (
                                  <span className="text-blue-600 ml-1">({member.role})</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Aucune équipe assignée à cet événement
                  </p>
                </div>
              )}

              {event.createdBy && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Créé par <span className="font-medium">
                      {event.createdBy.firstName} {event.createdBy.lastName}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Actions rapides */}
            <div className="flex flex-col gap-3 lg:w-64">
              <Link href={`/app/planning/events/${eventId}/repertoire`}>
                <Button variant="outline" className="w-full">
                  <MusicalNoteIcon className="h-4 w-4 mr-2" />
                  Voir le répertoire
                </Button>
              </Link>
              
              <Link href={`/app/planning/availability`}>
                <Button variant="outline" className="w-full">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Gérer l'équipe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Chat (conditionnel) */}
      {showChat && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <EventChat 
              eventId={eventId}
              eventTitle={event.title}
            />
          </div>
        </div>
      )}
    </div>
  );
}