'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';

interface Schedule {
  id: string;
  title: string;
  date: Date;
  type: string;
  location?: string;
}

interface Availability {
  id: string;
  scheduleId: string;
  schedule: Schedule;
  isAvailable: boolean;
  timeSlots: string[];
  notes?: string;
}

export default function EventAvailabilityPage() {
  const { userName, userId } = useUserData();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const timeSlotOptions = [
    { value: 'matin', label: 'Matin (8h-12h)' },
    { value: 'apres-midi', label: 'Après-midi (12h-18h)' },
    { value: 'soir', label: 'Soir (18h-22h)' }
  ];

  // Charger les événements à venir et les disponibilités
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les événements à venir
        const eventsResponse = await fetch('/api/events');
        console.log('Events response status:', eventsResponse.status);
        if (eventsResponse.ok) {
          const events = await eventsResponse.json();
          console.log('Raw events from API:', events.length, events.slice(0, 2));
          
          const upcomingEvents = events
            .filter((event: any) => {
              const eventDate = new Date(event.date);
              const now = new Date();
              console.log('Filtering event:', event.title, eventDate, 'vs now:', now, 'is upcoming:', eventDate >= now);
              return eventDate >= now;
            })
            .map((event: any) => ({
              ...event,
              date: new Date(event.date)
            }))
            .sort((a: Schedule, b: Schedule) => a.date.getTime() - b.date.getTime());
          
          console.log('Upcoming events filtered:', upcomingEvents.length, upcomingEvents.slice(0, 2));
          setUpcomingEvents(upcomingEvents);
        } else {
          console.error('Error fetching events:', eventsResponse.status, await eventsResponse.text());
        }

        // Charger les disponibilités existantes
        const availResponse = await fetch('/api/availability');
        if (availResponse.ok) {
          const availData = await availResponse.json();
          const parsedAvailabilities = availData.map((item: any) => ({
            ...item,
            schedule: {
              ...item.schedule,
              date: new Date(item.schedule.date)
            }
          }));
          setAvailabilities(parsedAvailabilities);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEventId) return;

    try {
      const availabilityData = {
        scheduleId: selectedEventId,
        isAvailable,
        timeSlots: isAvailable ? selectedTimeSlots : [],
        notes: notes.trim() || undefined
      };

      if (editingId) {
        // Modification
        const response = await fetch(`/api/availability/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(availabilityData)
        });

        if (response.ok) {
          const updatedAvailability = await response.json();
          setAvailabilities(prev => 
            prev.map(item => 
              item.id === editingId 
                ? { 
                    ...updatedAvailability, 
                    schedule: {
                      ...updatedAvailability.schedule,
                      date: new Date(updatedAvailability.schedule.date)
                    }
                  }
                : item
            )
          );
        } else {
          const error = await response.json();
          alert(error.error || 'Erreur lors de la modification');
          return;
        }
      } else {
        // Ajout
        const response = await fetch('/api/availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(availabilityData)
        });

        if (response.ok) {
          const newAvailability = await response.json();
          setAvailabilities(prev => [...prev, {
            ...newAvailability,
            schedule: {
              ...newAvailability.schedule,
              date: new Date(newAvailability.schedule.date)
            }
          }]);
        } else {
          const error = await response.json();
          alert(error.error || 'Erreur lors de la création');
          return;
        }
      }

      // Reset du formulaire
      setSelectedEventId('');
      setIsAvailable(true);
      setSelectedTimeSlots([]);
      setNotes('');
      setShowAddForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    }
  };

  const handleEdit = (availability: Availability) => {
    setSelectedEventId(availability.scheduleId);
    setIsAvailable(availability.isAvailable);
    setSelectedTimeSlots(availability.timeSlots);
    setNotes(availability.notes || '');
    setEditingId(availability.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
      try {
        const response = await fetch(`/api/availability/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setAvailabilities(prev => prev.filter(item => item.id !== id));
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion');
      }
    }
  };

  const handleTimeSlotChange = (timeSlot: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(timeSlot)
        ? prev.filter(slot => slot !== timeSlot)
        : [...prev, timeSlot]
    );
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    return timeSlotOptions.find(option => option.value === timeSlot)?.label || timeSlot;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'SERVICE': return 'bg-green-100 text-green-800';
      case 'REPETITION': return 'bg-blue-100 text-blue-800';
      case 'CONCERT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Événements sans réponse de disponibilité
  const eventsWithoutResponse = upcomingEvents.filter(event => 
    !availabilities.some(avail => avail.scheduleId === event.id)
  );

  // Prochaines disponibilités confirmées
  const upcomingAvailable = availabilities.filter(
    avail => avail.isAvailable && avail.schedule.date >= new Date()
  );

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CalendarDaysIcon className="h-8 w-8 mr-3 text-blue-600" />
              Disponibilités par Événement
            </h1>
            <p className="text-gray-600 mt-2">
              Indiquez votre disponibilité pour chaque événement (cultes, répétitions, concerts...)
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Répondre à un Événement
          </Button>
        </div>

        {/* Informations */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Comment ça marche ?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Chaque dimanche, il y a un culte - donnez votre disponibilité</li>
                <li>Répondez aux répétitions et événements spéciaux</li>
                <li>Spécifiez vos créneaux horaires disponibles</li>
                <li>Les responsables planifient en fonction de vos réponses</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alertes - Événements en attente */}
          <div className="lg:col-span-3">
            {eventsWithoutResponse.length > 0 && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-center space-x-3 mb-3">
                  <ClockIcon className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-medium text-yellow-800">
                    Événements en attente de réponse ({eventsWithoutResponse.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {eventsWithoutResponse.slice(0, 3).map(event => (
                    <div key={event.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-yellow-900">{event.title}</span>
                        <span className="text-yellow-700 ml-2">
                          - {formatDate(event.date)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedEventId(event.id);
                          setShowAddForm(true);
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        Répondre
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Formulaire */}
          {showAddForm && (
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingId ? 'Modifier ma Disponibilité' : 'Nouvelle Disponibilité'}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Sélection événement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Événement <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!!editingId}
                    >
                      <option value="">Sélectionner un événement</option>
                      {upcomingEvents.map(event => (
                        <option key={event.id} value={event.id}>
                          {event.title} - {formatDate(event.date)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Disponibilité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ma disponibilité
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={isAvailable}
                          onChange={() => setIsAvailable(true)}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />
                        Disponible
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!isAvailable}
                          onChange={() => setIsAvailable(false)}
                          className="mr-2 text-red-600 focus:ring-red-500"
                        />
                        <XCircleIcon className="h-4 w-4 text-red-600 mr-1" />
                        Non disponible
                      </label>
                    </div>
                  </div>

                  {/* Créneaux horaires */}
                  {isAvailable && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Créneaux disponibles
                      </label>
                      <div className="space-y-2">
                        {timeSlotOptions.map(option => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedTimeSlots.includes(option.value)}
                              onChange={() => handleTimeSlotChange(option.value)}
                              className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Précisions sur votre disponibilité..."
                    />
                  </div>

                  {/* Boutons */}
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingId(null);
                        setSelectedEventId('');
                        setIsAvailable(true);
                        setSelectedTimeSlots([]);
                        setNotes('');
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {editingId ? 'Modifier' : 'Confirmer'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* Mes réponses */}
          <div className={showAddForm ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <Card>
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Mes Réponses</h3>
              </div>

              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement...</p>
                </div>
              ) : availabilities.length === 0 ? (
                <div className="p-6 text-center">
                  <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune réponse encore</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Commencez par répondre à un événement
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {availabilities
                    .sort((a, b) => a.schedule.date.getTime() - b.schedule.date.getTime())
                    .map(availability => (
                    <div key={availability.id} className={`border rounded-lg p-4 ${
                      availability.isAvailable 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {availability.isAvailable ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`font-medium text-sm ${
                              availability.isAvailable ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {availability.isAvailable ? 'Disponible' : 'Non disponible'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${getEventTypeColor(availability.schedule.type)}`}>
                              {availability.schedule.type}
                            </span>
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-1">
                            {availability.schedule.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {formatDate(availability.schedule.date)}
                          </p>

                          {availability.isAvailable && availability.timeSlots.length > 0 && (
                            <div className="mb-2">
                              <div className="flex flex-wrap gap-1">
                                {availability.timeSlots.map(slot => (
                                  <span key={slot} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {getTimeSlotLabel(slot)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {availability.notes && (
                            <p className="text-sm text-gray-600">
                              <strong>Note :</strong> {availability.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 ml-4">
                          <button
                            onClick={() => handleEdit(availability)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(availability.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Résumé */}
          {!showAddForm && (
            <div className="space-y-4">
              {/* Prochaines disponibilités */}
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MusicalNoteIcon className="h-4 w-4 text-green-600 mr-2" />
                  Mes prochaines participations
                </h4>
                {upcomingAvailable.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucune participation confirmée</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingAvailable.slice(0, 3).map(availability => (
                      <div key={availability.id} className="text-sm">
                        <p className="font-medium text-gray-900">
                          {availability.schedule.title}
                        </p>
                        <p className="text-gray-600">
                          {availability.schedule.date.toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-green-600 text-xs">
                          {availability.timeSlots.map(slot => getTimeSlotLabel(slot)).join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}