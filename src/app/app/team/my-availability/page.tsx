'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  PlusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface Availability {
  id: string;
  scheduleId: string;
  isAvailable: boolean;
  notes?: string;
  schedule?: {
    id: string;
    title: string;
    date: string;
    type: string;
  };
}

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  description?: string;
}

export default function MyAvailabilityPage() {
  const { userName, userId } = useUserData();
  
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [notes, setNotes] = useState('');

  // Chargement des données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les disponibilités
        const availabilityResponse = await fetch('/api/availability');
        if (availabilityResponse.ok) {
          const availabilityData = await availabilityResponse.json();
          setAvailabilities(availabilityData);
        }

        // Charger les événements
        const eventsResponse = await fetch('/api/events');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          // Filtrer les événements futurs et les trier par date
          const futureEvents = eventsData
            .filter((event: any) => new Date(event.date) >= new Date())
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setEvents(futureEvents);
        }
      } catch (error) {
        console.error('Erreur:', error);
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
        timeSlots: [], // Toujours vide maintenant
        notes: notes.trim() || undefined
      };

      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availabilityData)
      });

      if (response.ok) {
        const newAvailability = await response.json();
        setAvailabilities(prev => [...prev, newAvailability]);
        
        // Reset du formulaire
        setSelectedEventId('');
        setIsAvailable(true);
        setNotes('');
        setShowAddForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    }
  };

  const handleQuickResponse = async (eventId: string, available: boolean) => {
    try {
      const availabilityData = {
        scheduleId: eventId,
        isAvailable: available,
        timeSlots: [],
        notes: undefined
      };

      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availabilityData)
      });

      if (response.ok) {
        const newAvailability = await response.json();
        setAvailabilities(prev => [...prev, newAvailability]);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la réponse');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) {
      try {
        const response = await fetch(`/api/availability/${id}`, { method: 'DELETE' });
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

  const resetForm = () => {
    setSelectedEventId('');
    setIsAvailable(true);
    setNotes('');
    setShowAddForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const formatEventType = (type: string) => {
    const types: Record<string, string> = {
      'SERVICE': '✝️ Culte',
      'REPETITION': '🎵 Répétition', 
      'CONCERT': '🎤 Concert',
      'FORMATION': '📚 Formation'
    };
    return types[type] || type;
  };

  // Obtenir les événements sans disponibilité déclarée
  const eventsWithoutAvailability = events.filter(event => 
    !availabilities.find(availability => availability.scheduleId === event.id)
  );

  // Séparer les dimanches des autres événements
  const sundays = eventsWithoutAvailability.filter(event => event.type === 'SERVICE');
  const otherEvents = eventsWithoutAvailability.filter(event => event.type !== 'SERVICE');

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ClockIcon className="h-8 w-8 mr-3 text-blue-600" />
              Mes Disponibilités
            </h1>
            <p className="text-gray-600 mt-2">
              Simple : Dites si vous êtes dispo ou pas pour chaque dimanche
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Répondre avec commentaire
          </Button>
        </div>

        {/* Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Super simple !</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Cliquez ✅ si vous êtes dispo ou ❌ si vous ne l'êtes pas</li>
                <li>Tous les dimanches apparaissent automatiquement</li>
                <li>Parfait pour signaler vos voyages à l'avance</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Modal pour réponse avec commentaire */}
        {showAddForm && (
          <div 
            className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Répondre avec commentaire
                  </h3>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Sélection de l'événement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Événement <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionnez un événement</option>
                      {eventsWithoutAvailability.map(event => (
                        <option key={event.id} value={event.id}>
                          {formatDate(event.date)} - {formatEventType(event.type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Disponibilité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Votre réponse
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <div
                        onClick={() => setIsAvailable(true)}
                        className={`cursor-pointer p-4 border-2 rounded-xl text-center transition-all ${
                          isAvailable
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                        }`}
                      >
                        <CheckCircleIcon className="h-8 w-8 mx-auto mb-2" />
                        <div className="font-semibold">✅ Je suis disponible</div>
                      </div>
                      
                      <div
                        onClick={() => setIsAvailable(false)}
                        className={`cursor-pointer p-4 border-2 rounded-xl text-center transition-all ${
                          !isAvailable
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
                        }`}
                      >
                        <XCircleIcon className="h-8 w-8 mx-auto mb-2" />
                        <div className="font-semibold">❌ Je ne suis pas disponible</div>
                      </div>
                    </div>
                  </div>

                  {/* Commentaire */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: En voyage, retard possible..."
                    />
                  </div>

                  {/* Boutons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Annuler
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Réponses rapides pour les dimanches */}
          <div>
            <Card>
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  ✝️ Dimanches à venir ({sundays.length})
                </h3>
              </div>

              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement...</p>
                </div>
              ) : sundays.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tous les dimanches ont une réponse !</p>
                </div>
              ) : (
                <div className="p-6 space-y-3">
                  {sundays.map(event => (
                    <div key={event.id} className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(event.date)}
                          </p>
                          <p className="text-sm text-gray-600">{event.title}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleQuickResponse(event.id, true)}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1"
                          >
                            ✅ Dispo
                          </Button>
                          <Button
                            onClick={() => handleQuickResponse(event.id, false)}
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 text-sm px-3 py-1"
                          >
                            ❌ Pas dispo
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Mes réponses */}
          <div>
            <Card>
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Mes Réponses ({availabilities.length})</h3>
              </div>

              {availabilities.length === 0 ? (
                <div className="p-6 text-center">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune réponse encore</p>
                </div>
              ) : (
                <div className="p-6 space-y-3">
                  {availabilities
                    .sort((a, b) => new Date(a.schedule?.date || '').getTime() - new Date(b.schedule?.date || '').getTime())
                    .map(availability => (
                    <div key={availability.id} className={`border rounded-lg p-3 ${
                      availability.isAvailable ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {availability.isAvailable ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`font-medium text-sm ${
                              availability.isAvailable ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {availability.isAvailable ? 'Disponible' : 'Non disponible'}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-900">
                            {formatDate(availability.schedule?.date || '')}
                          </p>

                          {availability.notes && (
                            <p className="text-xs text-gray-600 mt-1">
                              💬 {availability.notes}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(availability.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded text-sm"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Autres événements */}
        {otherEvents.length > 0 && (
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <CalendarIcon className="h-4 w-4 text-orange-600 mr-2" />
              Autres événements ({otherEvents.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {otherEvents.map(event => (
                <div key={event.id} className="border rounded-lg p-3 border-orange-200 bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-600">{formatDate(event.date)}</p>
                      <p className="text-xs text-orange-600">{formatEventType(event.type)}</p>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <Button
                        onClick={() => handleQuickResponse(event.id, true)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                      >
                        ✅ Dispo
                      </Button>
                      <Button
                        onClick={() => handleQuickResponse(event.id, false)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 text-xs px-2 py-1"
                      >
                        ❌ Pas dispo
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}