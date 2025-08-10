'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';
import Link from 'next/link';
import {
  MusicalNoteIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PlayIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Assignment {
  assignmentId: string;
  role: string;
  instruments: string[];
  notes?: string;
  assignedAt: string;
  assignedBy: {
    firstName: string;
    lastName: string;
  };
  event: {
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
    sessions: any[];
    directors: Array<{
      name: string;
      email: string;
    }>;
    songs: Array<{
      id: string;
      title: string;
      artist?: string;
      key?: string;
      youtubeUrl?: string;
      eventOrder?: number;
      eventKey?: string;
      eventNotes?: string;
      sequencesCount: number;
      tags: string[];
    }>;
  };
}

const getEventTypeLabel = (type: string) => {
  const types = {
    'SERVICE': 'Service',
    'REPETITION': 'Répétition', 
    'CONCERT': 'Concert',
    'FORMATION': 'Formation'
  };
  return types[type as keyof typeof types] || type;
};

const getEventStatusColor = (status: string) => {
  const colors = {
    'PLANNED': 'bg-blue-100 text-blue-700',
    'IN_PROGRESS': 'bg-yellow-100 text-yellow-700', 
    'COMPLETED': 'bg-green-100 text-green-700',
    'CANCELLED': 'bg-red-100 text-red-700'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
};

export default function MusicianEventsPage() {
  const { userName, userRole } = useUserData();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/musician/events');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.events || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let dayIndicator = '';
    if (diffDays === 0) dayIndicator = ' (Aujourd\'hui)';
    else if (diffDays === 1) dayIndicator = ' (Demain)';
    else if (diffDays <= 7) dayIndicator = ` (Dans ${diffDays} jours)`;
    
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + dayIndicator;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={[UserRole.MUSICIEN, UserRole.CHEF_LOUANGE, UserRole.TECHNICIEN, UserRole.ADMIN]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MusicalNoteIcon className="h-8 w-8 mr-3 text-blue-600" />
            Mes Événements
          </h1>
          <p className="text-gray-600 mt-2">
            Bonjour {userName} ! Voici les événements où vous êtes assigné(e) et le répertoire à préparer.
          </p>
        </div>

        {/* Événements assignés */}
        {assignments.length === 0 ? (
          <Card className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun événement assigné pour le moment</p>
            <p className="text-gray-400 mt-2">
              Les événements où vous êtes assigné(e) apparaîtront ici
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => {
              const event = assignment.event;
              const isUrgent = new Date(event.date).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000; // moins d'une semaine
              
              return (
                <Card key={assignment.assignmentId} className={`hover:shadow-lg transition-shadow ${isUrgent ? 'border-orange-200 bg-orange-50' : ''}`}>
                  <div className="p-6">
                    {/* Header de l'événement */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
                          <span className={`px-2 py-1 text-xs rounded-full ${getEventStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                          {isUrgent && (
                            <div className="flex items-center text-orange-600">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">Bientôt</span>
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-gray-600 mb-2">{event.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Informations de l'événement */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(event.date)}
                        </div>
                        
                        {(event.startTime || event.endTime) && (
                          <div className="flex items-center text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {event.startTime && <span>{event.startTime.slice(0, 5)}</span>}
                            {event.startTime && event.endTime && <span> - </span>}
                            {event.endTime && <span>{event.endTime.slice(0, 5)}</span>}
                          </div>
                        )}

                        {event.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {event.location}
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {getEventTypeLabel(event.type)}
                          </span>
                          {event.hasMultipleSessions && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              {event.sessionCount} cultes
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">Votre rôle</h4>
                          <p className="text-blue-700 font-medium">{assignment.role}</p>
                          {assignment.instruments.length > 0 && (
                            <p className="text-blue-600 text-sm">
                              Instruments: {assignment.instruments.join(', ')}
                            </p>
                          )}
                          {assignment.notes && (
                            <p className="text-blue-600 text-sm italic mt-1">
                              {assignment.notes}
                            </p>
                          )}
                        </div>

                        {event.directors.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">Directeur(s) musical(aux)</h4>
                            {event.directors.map((director, i) => (
                              <div key={i} className="flex items-center text-sm text-gray-600">
                                <UserIcon className="h-3 w-3 mr-1" />
                                {director.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Répertoire */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <MusicalNoteIcon className="h-5 w-5 mr-2" />
                          Répertoire à préparer ({event.songs.length} morceaux)
                        </h3>
                        <Link href={`/app/musician/events/${event.id}/repertoire`}>
                          <Button size="sm" variant="outline">
                            Voir détails
                          </Button>
                        </Link>
                      </div>

                      {event.songs.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">Aucun morceau défini pour cet événement</p>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                          {event.songs.slice(0, 4).map((song, index) => (
                            <div key={song.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                                {song.eventOrder || index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{song.title}</p>
                                {song.artist && (
                                  <p className="text-xs text-gray-600 truncate">{song.artist}</p>
                                )}
                                <div className="flex items-center space-x-2 mt-1">
                                  {(song.eventKey || song.key) && (
                                    <span className="text-xs text-blue-600 font-medium">
                                      {song.eventKey || song.key}
                                    </span>
                                  )}
                                  {song.sequencesCount > 0 && (
                                    <span className="text-xs text-green-600 flex items-center">
                                      <DocumentTextIcon className="h-3 w-3 mr-1" />
                                      {song.sequencesCount}
                                    </span>
                                  )}
                                  {song.youtubeUrl && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => window.open(song.youtubeUrl, '_blank')}
                                      className="p-0 h-auto text-red-600 hover:text-red-800"
                                    >
                                      <PlayIcon className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {event.songs.length > 4 && (
                            <div className="md:col-span-2 text-center">
                              <Link href={`/app/musician/events/${event.id}/repertoire`}>
                                <Button variant="outline" size="sm">
                                  Voir les {event.songs.length - 4} autres morceaux
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}