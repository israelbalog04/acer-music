'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
  BellIcon,
  CalendarDaysIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface EventAvailability {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventType: string;
  startTime: string;
  endTime: string;
  description?: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  notes: string;
  daysUntil: number;
}

interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function AvailabilityPage() {
  const { userRole, churchName, firstName, lastName } = useUserData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<EventAvailability[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventAvailability | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(true);

  // Créneaux horaires prédéfinis
  const defaultTimeSlots: TimeSlot[] = [
    { id: '1', label: 'Matin (9h-12h)', startTime: '09:00', endTime: '12:00', isAvailable: false },
    { id: '2', label: 'Après-midi (14h-17h)', startTime: '14:00', endTime: '17:00', isAvailable: false },
    { id: '3', label: 'Soir (19h-22h)', startTime: '19:00', endTime: '22:00', isAvailable: false }
  ];

  // Fonction pour détecter les groupes de cultes
  const getCultGroup = (eventTitle: string) => {
    const cultMatch = eventTitle.match(/Culte (\d+)/);
    if (cultMatch) {
      const cultNumber = parseInt(cultMatch[1]);
      if (cultNumber <= 2) return '1-2';
      if (cultNumber <= 5) return '3-5';
      return '1-5';
    }
    return null;
  };

  // Fonction pour obtenir le nom du groupe
  const getCultGroupName = (group: string) => {
    switch (group) {
      case '1-2': return 'Cultes 1-2 (Premier groupe)';
      case '3-5': return 'Cultes 3-5 (Deuxième groupe)';
      case '1-5': return 'Tous les cultes (1-5)';
      default: return group;
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Récupérer tous les événements créés par l'admin
        const eventsResponse = await fetch('/api/events');
        const availabilitiesResponse = await fetch('/api/availability');
        
        if (eventsResponse.ok && availabilitiesResponse.ok) {
          const eventsData = await eventsResponse.json();
          const availabilitiesData = await availabilitiesResponse.json();
          
          // Combiner les événements avec les disponibilités existantes
          const eventsWithAvailability = eventsData.map((event: any) => {
            const existingAvailability = availabilitiesData.events?.find(
              (av: any) => av.scheduleId === event.id
            );
            
            const eventDate = new Date(event.date);
            const today = new Date();
            const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            return {
              id: event.id,
              eventId: event.id,
              eventTitle: event.title,
              eventDate: event.date,
              eventType: event.type,
              startTime: event.startTime,
              endTime: event.endTime,
              description: event.description,
              isAvailable: existingAvailability?.isAvailable ?? false,
              timeSlots: existingAvailability?.timeSlots || defaultTimeSlots.map(slot => ({ ...slot })),
              notes: existingAvailability?.notes || '',
              daysUntil
            };
          });

          setEvents(eventsWithAvailability);
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

  const toggleEventAvailability = (eventId: string, isAvailable: boolean) => {
    setEvents(prev => prev.map(event => 
      event.eventId === eventId 
        ? { ...event, isAvailable }
        : event
    ));
  };

  const toggleTimeSlot = (eventId: string, slotId: string) => {
    setEvents(prev => prev.map(event => 
      event.eventId === eventId 
        ? {
            ...event,
            timeSlots: event.timeSlots.map(slot => 
              slot.id === slotId 
                ? { ...slot, isAvailable: !slot.isAvailable }
                : slot
            )
          }
        : event
    ));
  };

  const updateEventNotes = (eventId: string, notes: string) => {
    setEvents(prev => prev.map(event => 
      event.eventId === eventId 
        ? { ...event, notes }
        : event
    ));
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      
      // Filtrer seulement les événements avec des disponibilités définies
      const eventsWithAvailability = events.filter(event => event.isAvailable !== undefined).map(event => {
        const cultGroup = getCultGroup(event.eventTitle);
        return {
          ...event,
          cultGroups: cultGroup ? [cultGroup] : undefined
        };
      });
      
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsWithAvailability
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ Disponibilités sauvegardées avec succès !');
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error || 'Erreur lors de la sauvegarde'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde des disponibilités');
    } finally {
      setSaving(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'SERVICE': return 'bg-blue-100 text-blue-800';
      case 'REPETITION': return 'bg-green-100 text-green-800';
      case 'SPECIAL': return 'bg-purple-100 text-purple-800';
      case 'CONCERT': return 'bg-orange-100 text-orange-800';
      case 'FORMATION': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getDaysUntilText = (daysUntil: number) => {
    if (daysUntil === 0) return '🎉 Aujourd\'hui !';
    if (daysUntil === 1) return '⏰ Demain';
    if (daysUntil < 0) return '📅 Passé';
    return `📅 Dans ${daysUntil} jours`;
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = filterType === 'ALL' || event.eventType === filterType;
    const matchesUpcoming = !showOnlyUpcoming || event.daysUntil >= 0;
    return matchesFilter && matchesUpcoming;
  });

  const availableEvents = events.filter(event => event.isAvailable);
  const unavailableEvents = events.filter(event => !event.isAvailable);

  return (
    <RoleGuard allowedRoles={[UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CalendarDaysIcon className="h-8 w-8 mr-3 text-blue-600" />
              Mes Disponibilités
            </h1>
            <p className="text-gray-600 mt-2">
              Validez votre disponibilité pour les événements de {churchName}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={saveAvailability}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>

        {/* User Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-full">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {firstName} {lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  {userRole === UserRole.MUSICIEN ? 'Musicien' : 'Technicien'} - {churchName}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <Card>
          <div className="p-4">
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
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showOnlyUpcoming}
                    onChange={(e) => setShowOnlyUpcoming(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Événements à venir uniquement</span>
                </label>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />
                  {availableEvents.length} disponible(s)
                </span>
                <span className="flex items-center">
                  <XCircleIcon className="h-4 w-4 text-red-600 mr-1" />
                  {unavailableEvents.length} indisponible(s)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun événement trouvé</p>
            <p className="text-gray-400 mt-2">
              L'administrateur n'a pas encore créé d'événements ou aucun événement ne correspond à vos filtres.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.eventId} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.eventTitle}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.eventType)}`}>
                          {getEventTypeLabel(event.eventType)}
                        </span>
                        {getCultGroup(event.eventTitle) && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            {getCultGroupName(getCultGroup(event.eventTitle)!)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(event.eventDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {getDaysUntilText(event.daysUntil)}
                      </p>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                      )}
                    </div>
                                          <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => toggleEventAvailability(event.eventId, true)}
                          variant={event.isAvailable ? "primary" : "outline"}
                          className={event.isAvailable ? "bg-green-600 hover:bg-green-700" : "border-green-300 text-green-700 hover:bg-green-50"}
                          size="sm"
                        >
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Disponible
                        </Button>
                        <Button
                          onClick={() => toggleEventAvailability(event.eventId, false)}
                          variant={!event.isAvailable ? "primary" : "outline"}
                          className={!event.isAvailable ? "bg-red-600 hover:bg-red-700" : "border-red-300 text-red-700 hover:bg-red-50"}
                          size="sm"
                        >
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          Indisponible
                        </Button>
                      </div>
                  </div>

                  {event.isAvailable && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Créneaux horaires :</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {event.timeSlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => toggleTimeSlot(event.eventId, slot.id)}
                              className={`p-2 rounded-lg border text-sm transition-colors ${
                                slot.isAvailable
                                  ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (optionnel) :
                        </label>
                        <Input
                          type="text"
                          placeholder="Précisions sur votre disponibilité..."
                          value={event.notes}
                          onChange={(e) => updateEventNotes(event.eventId, e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Comment ça marche ?</p>
                <ul className="space-y-1">
                  <li>• Cliquez sur "Disponible" pour confirmer votre participation</li>
                  <li>• Sélectionnez les créneaux horaires qui vous conviennent</li>
                  <li>• Ajoutez des notes si nécessaire (précisions, contraintes...)</li>
                  <li>• N'oubliez pas de sauvegarder vos modifications</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
}
