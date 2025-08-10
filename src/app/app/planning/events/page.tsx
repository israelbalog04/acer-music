'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';
import Link from 'next/link';
import {
  CalendarIcon,
  MusicalNoteIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  type: string;
  status: string;
  hasMultipleSessions: boolean;
  sessionCount: number;
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

export default function EventsPage() {
  const { userRole, churchName } = useUserData();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="h-8 w-8 mr-3 text-blue-600" />
            Événements et Services
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez le répertoire musical de chaque événement de {churchName}
          </p>
        </div>

        {/* Liste des événements */}
        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun événement à venir</p>
            <p className="text-gray-400 mt-2">
              Les événements futurs seront affichés ici
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header de l'événement */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getEventStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>

                  {/* Informations de l'événement */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(event.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    
                    {(event.startTime || event.endTime) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {event.startTime && (
                          <span>{event.startTime.slice(0, 5)}</span>
                        )}
                        {event.startTime && event.endTime && <span> - </span>}
                        {event.endTime && (
                          <span>{event.endTime.slice(0, 5)}</span>
                        )}
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {event.location}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {getEventTypeLabel(event.type)}
                      </span>
                      {event.hasMultipleSessions && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          {event.sessionCount} cultes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <Link href={`/app/planning/${event.id}/repertoire`}>
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <MusicalNoteIcon className="h-4 w-4 mr-2" />
                        Gérer le répertoire
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}