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
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  InformationCircleIcon,
  MusicalNoteIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminEventsPage() {
  const { userRole, churchName } = useUserData();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showTeamAssignment, setShowTeamAssignment] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);
  const [showEventManager, setShowEventManager] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    startTime: '10:00',
    endTime: '12:00',
    type: 'SERVICE',
    description: ''
  });
  const [bulkEvents, setBulkEvents] = useState({
    title: '',
    startDate: '',
    endDate: '',
    startTime: '10:00',
    endTime: '12:00',
    type: 'SERVICE',
    duration: '1', // 1, 2, 3, 6 mois
    description: '',
    cultStructure: '5_CULTS' // 5_CULTS ou SINGLE_SERVICE
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/events');
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error('Erreur lors du chargement des événements');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.date) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });

      if (response.ok) {
        const createdEventData = await response.json();
        setCreatedEvent(createdEventData);
        setNewEvent({
          title: '',
          date: '',
          startTime: '10:00',
          endTime: '12:00',
          type: 'SERVICE',
          description: ''
        });
        setShowAddForm(false);
        setShowTeamAssignment(true);
        fetchEvents();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de l\'événement');
    }
  };

  const createBulkEvents = async () => {
    try {
      if (!bulkEvents.title || !bulkEvents.startDate) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Calculer automatiquement la date de fin basée sur la durée
      const startDate = new Date(bulkEvents.startDate);
      const durationMonths = parseInt(bulkEvents.duration);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      const bulkData = {
        ...bulkEvents,
        endDate: endDate.toISOString().split('T')[0]
      };

      const response = await fetch('/api/admin/events/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
      });

      if (response.ok) {
        const result = await response.json();
        setBulkEvents({
          title: '',
          startDate: '',
          endDate: '',
          startTime: '10:00',
          endTime: '12:00',
          type: 'SERVICE',
          duration: '1',
          description: '',
          cultStructure: ''
        });
        setShowBulkForm(false);
        fetchEvents();
        alert(`${result.count} dimanches créés avec succès ! Ils apparaîtront dans le planning.`);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création des événements');
    }
  };

  const toggleEventStatus = async (eventId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        fetchEvents();
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchEvents();
        alert('Événement supprimé avec succès');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleManageEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEventManager(true);
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'SERVICE': 'Service',
      'REHEARSAL': 'Répétition',
      'SPECIAL': 'Événement Spécial',
      'MEETING': 'Réunion'
    };
    return types[type] || type;
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'SERVICE': 'bg-blue-100 text-blue-800',
      'REHEARSAL': 'bg-green-100 text-green-800',
      'SPECIAL': 'bg-purple-100 text-purple-800',
      'MEETING': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CalendarIcon className="h-8 w-8 mr-3 text-blue-600" />
              Gestion des Événements
            </h1>
            <p className="text-gray-600 mt-2">
              Créez et gérez tous les événements de {churchName}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowBulkForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Créer en Lot
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouvel Événement
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Gestion des Événements</h3>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Événements individuels :</strong> Créez des événements uniques (services spéciaux, répétitions, etc.)
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  <strong>Création en lot :</strong> Créez automatiquement tous les dimanches sur plusieurs mois. 
                  Les musiciens pourront ensuite donner leurs disponibilités pour chaque événement.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Add Event Form */}
        {showAddForm && (
          <Card className="border-2 border-blue-200">
            <CardHeader title="Nouvel Événement" />
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Titre de l'événement"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                />
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SERVICE">Service</option>
                  <option value="REHEARSAL">Répétition</option>
                  <option value="SPECIAL">Événement Spécial</option>
                  <option value="MEETING">Réunion</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                />
                <Input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                />
                <Input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              <Input
                placeholder="Description (optionnel)"
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="flex space-x-2">
                <Button onClick={createEvent} className="bg-blue-600 hover:bg-blue-700">
                  Créer
                </Button>
                <Button 
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Bulk Create Form */}
        {showBulkForm && (
          <Card className="border-2 border-green-200">
            <CardHeader title="Création en Lot - Dimanches" />
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Titre de l'événement (ex: Culte du Dimanche)"
                  value={bulkEvents.title}
                  onChange={(e) => setBulkEvents(prev => ({ ...prev, title: e.target.value }))}
                />
                <select
                  value={bulkEvents.type}
                  onChange={(e) => setBulkEvents(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SERVICE">Service</option>
                  <option value="REHEARSAL">Répétition</option>
                  <option value="SPECIAL">Événement Spécial</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="date"
                  placeholder="Date de début"
                  value={bulkEvents.startDate}
                  onChange={(e) => setBulkEvents(prev => ({ ...prev, startDate: e.target.value }))}
                />
                <select
                  value={bulkEvents.duration}
                  onChange={(e) => setBulkEvents(prev => ({ ...prev, duration: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1 mois</option>
                  <option value="2">2 mois</option>
                  <option value="3">3 mois</option>
                  <option value="6">6 mois</option>
                </select>
                <div className="text-sm text-gray-600 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {bulkEvents.startDate && (
                    <span>
                      Jusqu'au {(() => {
                        const startDate = new Date(bulkEvents.startDate);
                        const durationMonths = parseInt(bulkEvents.duration);
                        const endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + durationMonths);
                        return endDate.toLocaleDateString('fr-FR');
                      })()}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="time"
                  value={bulkEvents.startTime}
                  onChange={(e) => setBulkEvents(prev => ({ ...prev, startTime: e.target.value }))}
                />
                <Input
                  type="time"
                  value={bulkEvents.endTime}
                  onChange={(e) => setBulkEvents(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              
              {/* Structure des cultes */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Structure des cultes du dimanche
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="radio"
                      id="5_CULTS"
                      name="cultStructure"
                      value="5_CULTS"
                      checked={bulkEvents.cultStructure === '5_CULTS'}
                      onChange={(e) => setBulkEvents(prev => ({ ...prev, cultStructure: e.target.value }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="5_CULTS" className="text-sm">
                      <div className="font-medium">5 Cultes par dimanche</div>
                      <div className="text-gray-600">Culte 1, 2, 3, 4, 5</div>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="radio"
                      id="SINGLE_SERVICE"
                      name="cultStructure"
                      value="SINGLE_SERVICE"
                      checked={bulkEvents.cultStructure === 'SINGLE_SERVICE'}
                      onChange={(e) => setBulkEvents(prev => ({ ...prev, cultStructure: e.target.value }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="SINGLE_SERVICE" className="text-sm">
                      <div className="font-medium">Service unique</div>
                      <div className="text-gray-600">Un seul service par dimanche</div>
                    </label>
                  </div>
                </div>
                
                {bulkEvents.cultStructure === '5_CULTS' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p><strong>Structure 5 cultes :</strong></p>
                        <ul className="mt-1 space-y-1">
                          <li>• <strong>Cultes 1-2 :</strong> Premier groupe (2 cultes)</li>
                          <li>• <strong>Cultes 3-5 :</strong> Deuxième groupe (3 cultes)</li>
                          <li>• <strong>Cultes 1-5 :</strong> Tous les cultes (5 cultes)</li>
                        </ul>
                        <p className="mt-2">Les musiciens pourront choisir leur disponibilité par groupe de cultes.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Input
                placeholder="Description (optionnel)"
                value={bulkEvents.description}
                onChange={(e) => setBulkEvents(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p><strong>Automatique :</strong> Tous les dimanches seront créés automatiquement.</p>
                    <p><strong>Planning :</strong> Les événements apparaîtront immédiatement dans le planning.</p>
                    <p><strong>Disponibilités :</strong> Les musiciens pourront donner leurs disponibilités.</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={createBulkEvents} className="bg-green-600 hover:bg-green-700">
                  Créer tous les dimanches
                </Button>
                <Button 
                  onClick={() => setShowBulkForm(false)}
                  variant="outline"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : events.length === 0 ? (
          <Card className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun événement créé</p>
            <p className="text-gray-400 mt-2">
              Commencez par créer des événements ou utilisez la création en lot pour les dimanches.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.type)}`}>
                          {getEventTypeLabel(event.type)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {event.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(event.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Bouton Voir détails */}
                      <Link href={`/app/events/${event.id}`}>
                        <button
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Voir détails et chat"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      
                      {/* Bouton Chat direct */}
                      <Link href={`/app/events/${event.id}`}>
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Chat équipe"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      
                      {/* Bouton Gérer l'événement */}
                      <button
                        onClick={() => handleManageEvent(event)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Gérer l'événement"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleEventStatus(event.id, event.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          event.isActive 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={event.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {event.isActive ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Team Assignment Modal */}
        {showTeamAssignment && createdEvent && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Affecter l'équipe pour "{createdEvent.title}"
                </h2>
                <button
                  onClick={() => {
                    setShowTeamAssignment(false);
                    setCreatedEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Événement créé avec succès !</strong> Maintenant, affectez les musiciens qui participeront.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {new Date(createdEvent.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })} • {createdEvent.startTime} - {createdEvent.endTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={() => {
                    setShowTeamAssignment(false);
                    setCreatedEvent(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Terminer
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = `/app/admin/teams/assign?event=${createdEvent.id}`;
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Affecter l'équipe maintenant
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de gestion d'événement */}
        {showEventManager && selectedEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 transform transition-all duration-300 scale-100">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Gérer {selectedEvent.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedEvent.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })} • {selectedEvent.startTime} - {selectedEvent.endTime}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventManager(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Section Chansons */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <MusicalNoteIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Répertoire</h4>
                        <p className="text-sm text-gray-600">Gérer les chansons de l'événement</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700">
                        Ajoutez, supprimez ou réorganisez les chansons qui seront jouées lors de cet événement.
                      </p>
                      
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => {
                            setShowEventManager(false);
                            window.location.href = `/app/planning/events/${selectedEvent.id}/repertoire`;
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                        >
                          <MusicalNoteIcon className="h-4 w-4 mr-2" />
                          Gérer le Répertoire
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Section Équipe */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <UsersIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Équipe</h4>
                        <p className="text-sm text-gray-600">Assigner les musiciens</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700">
                        Sélectionnez et assignez les musiciens qui participeront à cet événement.
                      </p>
                      
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => {
                            setShowEventManager(false);
                            window.location.href = `/app/admin/teams/assign?event=${selectedEvent.id}`;
                          }}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                        >
                          <UsersIcon className="h-4 w-4 mr-2" />
                          Assigner l'Équipe
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => {
                        setShowEventManager(false);
                        window.location.href = `/app/planning/events/${selectedEvent.id}`;
                      }}
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 font-medium py-3 rounded-xl transition-all duration-200"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Voir le Planning
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowEventManager(false);
                        window.location.href = `/app/team/event-availability?event=${selectedEvent.id}`;
                      }}
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50 font-medium py-3 rounded-xl transition-all duration-200"
                    >
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Disponibilités
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowEventManager(false);
                        window.location.href = `/app/planning/events/${selectedEvent.id}/repertoire`;
                      }}
                      variant="outline"
                      className="text-purple-600 border-purple-600 hover:bg-purple-50 font-medium py-3 rounded-xl transition-all duration-200"
                    >
                      <MusicalNoteIcon className="h-4 w-4 mr-2" />
                      Répertoire
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
