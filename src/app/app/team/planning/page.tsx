'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';
import {
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  PlusIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  description?: string;
  status: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    type: string;
    description?: string;
    startTime: string;
    endTime: string;
  };
}

export default function PlanningPage() {
  const { userRole, churchName } = useUserData();
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
          
          // Convertir les événements pour FullCalendar
          const calendarData = data.map((event: Event) => {
            const startDateTime = new Date(event.date);
            const [startHour, startMinute] = event.startTime.split(':');
            const [endHour, endMinute] = event.endTime.split(':');
            
            startDateTime.setHours(parseInt(startHour), parseInt(startMinute));
            const endDateTime = new Date(startDateTime);
            endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

            // Couleurs selon le type d'événement
            let backgroundColor = '#3B82F6'; // bleu par défaut
            let borderColor = '#2563EB';
            let textColor = '#FFFFFF';

            switch (event.type) {
              case 'SERVICE':
                backgroundColor = '#3B82F6'; // bleu
                borderColor = '#2563EB';
                break;
              case 'REPETITION':
                backgroundColor = '#10B981'; // vert
                borderColor = '#059669';
                break;
              case 'SPECIAL':
                backgroundColor = '#8B5CF6'; // violet
                borderColor = '#7C3AED';
                break;
              case 'CONCERT':
                backgroundColor = '#F59E0B'; // orange
                borderColor = '#D97706';
                break;
              case 'FORMATION':
                backgroundColor = '#EF4444'; // rouge
                borderColor = '#DC2626';
                break;
            }

            return {
              id: event.id,
              title: event.title,
              start: startDateTime.toISOString(),
              end: endDateTime.toISOString(),
              backgroundColor,
              borderColor,
              textColor,
              extendedProps: {
                type: event.type,
                description: event.description,
                startTime: event.startTime,
                endTime: event.endTime
              }
            };
          });
          
          setCalendarEvents(calendarData);
        } else {
          console.error('Erreur lors du chargement des événements');
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setShowEventModal(true);
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'SERVICE': return 'Service';
      case 'REPETITION': return 'Répétition';
      case 'SPECIAL': return 'Événement Spécial';
      case 'CONCERT': return 'Concert';
      case 'FORMATION': return 'Formation';
      default: return type;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'SERVICE': return { bg: '#3B82F6', border: '#2563EB', text: '#FFFFFF' };
      case 'REPETITION': return { bg: '#10B981', border: '#059669', text: '#FFFFFF' };
      case 'SPECIAL': return { bg: '#8B5CF6', border: '#7C3AED', text: '#FFFFFF' };
      case 'CONCERT': return { bg: '#F59E0B', border: '#D97706', text: '#FFFFFF' };
      case 'FORMATION': return { bg: '#EF4444', border: '#DC2626', text: '#FFFFFF' };
      default: return { bg: '#6B7280', border: '#4B5563', text: '#FFFFFF' };
    }
  };

  const filteredEvents = filterType === 'ALL' 
    ? calendarEvents 
    : calendarEvents.filter(event => event.extendedProps.type === filterType);

  const eventTypeStats = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CalendarIcon className="h-8 w-8 mr-3 text-blue-600" />
              Planning des Équipes
            </h1>
            <p className="text-gray-600 mt-2">
              Consultez les plannings des équipes musicales de {churchName}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {showLegend ? 'Masquer' : 'Afficher'} légende
            </Button>
            {(userRole === UserRole.ADMIN || userRole === UserRole.CHEF_LOUANGE) && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.location.href = '/app/admin/events'}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Gérer les événements
              </Button>
            )}
          </div>
        </div>

        {/* Legend and Filters */}
        {showLegend && (
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Filtres :</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tous les événements</option>
                  <option value="SERVICE">Services</option>
                  <option value="REPETITION">Répétitions</option>
                  <option value="SPECIAL">Événements spéciaux</option>
                  <option value="CONCERT">Concerts</option>
                  <option value="FORMATION">Formations</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                {Object.entries(getEventTypeColor).map(([type, colors]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2"
                      style={{ 
                        backgroundColor: colors.bg, 
                        borderColor: colors.border 
                      }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {getEventTypeLabel(type)} ({eventTypeStats[type] || 0})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Calendar */}
        <Card className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun événement planifié</p>
              <p className="text-gray-400 mt-2">
                L'administrateur n'a pas encore créé d'événements. Contactez-le pour qu'il crée les événements.
              </p>
            </div>
          ) : (
            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={currentView}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale={frLocale}
                events={filteredEvents}
                eventClick={handleEventClick}
                height="auto"
                dayMaxEvents={true}
                moreLinkClick="popover"
                eventDisplay="block"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                allDaySlot={false}
                slotDuration="00:30:00"
                slotLabelFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }}
                buttonText={{
                  today: 'Aujourd\'hui',
                  month: 'Mois',
                  week: 'Semaine',
                  day: 'Jour'
                }}
                viewDidMount={(info) => setCurrentView(info.view.type)}
                eventDidMount={(info) => {
                  // Ajouter des tooltips personnalisés
                  const event = info.event;
                  const type = event.extendedProps.type;
                  const colors = getEventTypeColor(type);
                  
                  info.el.style.backgroundColor = colors.bg;
                  info.el.style.borderColor = colors.border;
                  info.el.style.color = colors.text;
                  
                  // Ajouter un titre pour le hover
                  info.el.title = `${event.title} - ${getEventTypeLabel(type)} (${event.extendedProps.startTime} - ${event.extendedProps.endTime})`;
                }}
              />
            </div>
          )}
        </Card>

        {/* Event Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getEventTypeColor(selectedEvent.type).bg }}
                  ></div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date</p>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedEvent.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Heure</p>
                    <p className="text-sm text-gray-600">
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: getEventTypeColor(selectedEvent.type).bg }}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Type</p>
                    <p className="text-sm text-gray-600">{getEventTypeLabel(selectedEvent.type)}</p>
                  </div>
                </div>
                
                {selectedEvent.description && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Description</p>
                    <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  onClick={() => {
                    setShowEventModal(false);
                    window.location.href = `/app/planning/${selectedEvent.id}/songs`;
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MusicalNoteIcon className="h-4 w-4 mr-1" />
                  Gérer les chansons
                </Button>
                <Button
                  onClick={() => setShowEventModal(false)}
                  variant="outline"
                  className="hover:bg-gray-50"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg mr-3">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total événements</p>
                <p className="text-2xl font-bold text-blue-800">{events.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg mr-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Services</p>
                <p className="text-2xl font-bold text-green-800">{eventTypeStats.SERVICE || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-600 rounded-lg mr-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Répétitions</p>
                <p className="text-2xl font-bold text-purple-800">{eventTypeStats.REPETITION || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-600 rounded-lg mr-3">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Événements spéciaux</p>
                <p className="text-2xl font-bold text-orange-800">{eventTypeStats.SPECIAL || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}