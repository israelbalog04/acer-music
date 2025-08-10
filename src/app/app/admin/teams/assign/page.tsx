'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import { useSearchParams } from 'next/navigation';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  UsersIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  MusicalNoteIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  CogIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  startTime: string;
  endTime: string;
  description?: string;
}

interface UserAvailability {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  instruments: string[];
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  notes: string;
}

interface TimeSlot {
  id: string;
  label: string;
  isAvailable: boolean;
}

interface TeamMember {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  instruments: string[];
  assignedRole: string;
}

interface TeamAssignment {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventType: string;
  teamMembers: TeamMember[];
  directorId?: string;
  directorName?: string;
}

export default function TeamAssignmentPage() {
  const { userRole, churchName } = useUserData();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserAvailability[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(true);
  const [urlEventId, setUrlEventId] = useState<string | null>(null);

  // Rôles d'équipe prédéfinis
  const teamRoles = [
    { id: 'DIRECTOR', label: 'Directeur Musical', icon: StarIcon, color: 'bg-purple-100 text-purple-800' },
    { id: 'LEAD_VOCAL', label: 'Chant Principal', icon: MicrophoneIcon, color: 'bg-blue-100 text-blue-800' },
    { id: 'BACKUP_VOCAL', label: 'Chant Accompagnement', icon: MicrophoneIcon, color: 'bg-blue-50 text-blue-700' },
    { id: 'PIANO', label: 'Piano', icon: MusicalNoteIcon, color: 'bg-green-100 text-green-800' },
    { id: 'GUITAR', label: 'Guitare', icon: MusicalNoteIcon, color: 'bg-green-100 text-green-800' },
    { id: 'BASS', label: 'Basse', icon: MusicalNoteIcon, color: 'bg-green-100 text-green-800' },
    { id: 'DRUMS', label: 'Batterie', icon: MusicalNoteIcon, color: 'bg-green-100 text-green-800' },
    { id: 'KEYS', label: 'Claviers', icon: MusicalNoteIcon, color: 'bg-green-100 text-green-800' },
    { id: 'TECHNICIAN', label: 'Technicien', icon: CogIcon, color: 'bg-orange-100 text-orange-800' }
  ];

  useEffect(() => {
    // Récupérer l'ID d'événement depuis l'URL
    const eventId = searchParams.get('event');
    if (eventId) {
      setUrlEventId(eventId);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les événements
        const eventsResponse = await fetch('/api/events');
        const availabilitiesResponse = await fetch('/api/admin/availability');
        const usersResponse = await fetch('/api/admin/users');
        
        if (eventsResponse.ok && availabilitiesResponse.ok && usersResponse.ok) {
          const eventsData = await eventsResponse.json();
          const availabilitiesData = await availabilitiesResponse.json();
          const usersData = await usersResponse.json();
          
          setEvents(eventsData);
          
          // Combiner les données utilisateurs et disponibilités
          const usersWithAvailability = usersData
            .filter((user: any) => user.role === UserRole.MUSICIEN || user.role === UserRole.TECHNICIEN)
            .map((user: any) => {
              const userAvailabilities = availabilitiesData.filter((av: any) => av.userId === user.id);
              return {
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                instruments: user.instruments ? JSON.parse(user.instruments) : [],
                availabilities: userAvailabilities
              };
            });
          
          setAvailableUsers(usersWithAvailability);

          // Sélectionner automatiquement l'événement depuis l'URL
          if (urlEventId) {
            const eventFromUrl = eventsData.find((event: Event) => event.id === urlEventId);
            if (eventFromUrl) {
              selectEvent(eventFromUrl);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlEventId]);

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

  const getDaysUntilText = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil === 0) return '🎉 Aujourd\'hui !';
    if (daysUntil === 1) return '⏰ Demain';
    if (daysUntil < 0) return '📅 Passé';
    return `📅 Dans ${daysUntil} jours`;
  };

  const selectEvent = (event: Event) => {
    setSelectedEvent(event);
    
    // Vérifier si une équipe existe déjà pour cet événement
    const existingAssignment = teamAssignments.find(ta => ta.eventId === event.id);
    if (!existingAssignment) {
      // Créer une nouvelle affectation d'équipe
      const newAssignment: TeamAssignment = {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventType: event.type,
        teamMembers: []
      };
      setTeamAssignments(prev => [...prev, newAssignment]);
    }
  };

  const addMemberToTeam = (userId: string, roleId: string) => {
    if (!selectedEvent) return;
    
    const user = availableUsers.find(u => u.userId === userId);
    if (!user) return;
    
    const teamRole = teamRoles.find(r => r.id === roleId);
    if (!teamRole) return;
    
    const newMember: TeamMember = {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      instruments: user.instruments,
      assignedRole: roleId
    };
    
    setTeamAssignments(prev => prev.map(ta => 
      ta.eventId === selectedEvent.id
        ? { ...ta, teamMembers: [...ta.teamMembers, newMember] }
        : ta
    ));
  };

  const removeMemberFromTeam = (userId: string) => {
    if (!selectedEvent) return;
    
    setTeamAssignments(prev => prev.map(ta => 
      ta.eventId === selectedEvent.id
        ? { ...ta, teamMembers: ta.teamMembers.filter(m => m.userId !== userId) }
        : ta
    ));
  };

  const assignDirector = (userId: string) => {
    if (!selectedEvent) return;
    
    const user = availableUsers.find(u => u.userId === userId);
    if (!user) return;
    
    setTeamAssignments(prev => prev.map(ta => 
      ta.eventId === selectedEvent.id
        ? { 
            ...ta, 
            directorId: user.userId,
            directorName: `${user.firstName} ${user.lastName}`
          }
        : ta
    ));
  };

  const saveTeamAssignments = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/teams/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignments: teamAssignments
        })
      });

      if (response.ok) {
        alert('✅ Équipes affectées avec succès !');
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error || 'Erreur lors de la sauvegarde'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde des affectations');
    } finally {
      setSaving(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = filterType === 'ALL' || event.type === filterType;
    const eventDate = new Date(event.date);
    const today = new Date();
    const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const matchesUpcoming = !showOnlyUpcoming || daysUntil >= 0;
    return matchesFilter && matchesUpcoming;
  });

  const currentAssignment = selectedEvent 
    ? teamAssignments.find(ta => ta.eventId === selectedEvent.id)
    : null;

  const availableMembersForEvent = selectedEvent 
    ? availableUsers.filter(user => {
        const userAvailability = user.availabilities.find(
          (av: any) => av.scheduleId === selectedEvent.id
        );
        return userAvailability?.isAvailable;
      })
    : [];

  const unavailableMembersForEvent = selectedEvent 
    ? availableUsers.filter(user => {
        const userAvailability = user.availabilities.find(
          (av: any) => av.scheduleId === selectedEvent.id
        );
        return userAvailability && !userAvailability.isAvailable;
      })
    : [];

  const membersWithoutAvailability = selectedEvent 
    ? availableUsers.filter(user => {
        const userAvailability = user.availabilities.find(
          (av: any) => av.scheduleId === selectedEvent.id
        );
        return !userAvailability;
      })
    : [];

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UsersIcon className="h-8 w-8 mr-3 text-blue-600" />
              Affectation des Équipes
            </h1>
            <p className="text-gray-600 mt-2">
              Affectez les musiciens et techniciens aux événements de {churchName}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={saveTeamAssignments}
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
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Sauvegarder les Équipes
                </>
              )}
            </Button>
          </div>
        </div>

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
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des événements */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Événements</h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun événement trouvé</p>
                ) : (
                  <div className="space-y-2">
                    {filteredEvents.map((event) => {
                      const assignment = teamAssignments.find(ta => ta.eventId === event.id);
                      const memberCount = assignment?.teamMembers.length || 0;
                      
                      return (
                        <button
                          key={event.id}
                          onClick={() => selectEvent(event)}
                          className={`w-full p-3 rounded-lg border text-left transition-colors ${
                            selectedEvent?.id === event.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.type)}`}>
                              {getEventTypeLabel(event.type)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {new Date(event.date).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })} {event.startTime}
                          </div>
                                                     <div className="flex items-center justify-between">
                             <span className="text-xs text-gray-500">
                               {getDaysUntilText(event.date)}
                             </span>
                             <div className="flex items-center space-x-2">
                               <span className="text-xs text-blue-600">
                                 {memberCount} membre(s)
                               </span>
                               {/* Indicateur de disponibilités */}
                               {(() => {
                                 const eventUsers = availableUsers.filter(user => {
                                   const userAvailability = user.availabilities.find(
                                     (av: any) => av.scheduleId === event.id
                                   );
                                   return userAvailability;
                                 });
                                 const availableCount = eventUsers.filter(user => {
                                   const userAvailability = user.availabilities.find(
                                     (av: any) => av.scheduleId === event.id
                                   );
                                   return userAvailability?.isAvailable;
                                 }).length;
                                 const totalResponded = eventUsers.length;
                                 const totalMembers = availableUsers.length;
                                 
                                 if (totalResponded === 0) {
                                   return <span className="text-xs text-gray-400">Aucune réponse</span>;
                                 } else if (availableCount === totalResponded) {
                                   return <span className="text-xs text-green-600">✓ Tous disponibles</span>;
                                 } else if (availableCount === 0) {
                                   return <span className="text-xs text-red-600">✗ Tous indisponibles</span>;
                                 } else {
                                   return <span className="text-xs text-orange-600">{availableCount}/{totalResponded} disponibles</span>;
                                 }
                               })()}
                             </div>
                           </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Affectation d'équipe */}
          <div className="lg:col-span-2">
            {selectedEvent ? (
              <div className="space-y-6">
                {/* Détails de l'événement */}
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h2>
                        <p className="text-gray-600">
                          {new Date(selectedEvent.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })} • {selectedEvent.startTime} - {selectedEvent.endTime}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-sm rounded-full ${getEventTypeColor(selectedEvent.type)}`}>
                        {getEventTypeLabel(selectedEvent.type)}
                      </span>
                    </div>
                    {selectedEvent.description && (
                      <p className="text-gray-600">{selectedEvent.description}</p>
                    )}
                  </div>
                </Card>

                                 {/* Disponibilités des Musiciens */}
                 <Card>
                   <div className="p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                       <EyeIcon className="h-5 w-5 mr-2 text-blue-600" />
                       Disponibilités des Musiciens
                     </h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {/* Disponibles */}
                       <div className="space-y-2">
                         <h4 className="font-medium text-green-700 flex items-center">
                           <CheckCircleIcon className="h-4 w-4 mr-1" />
                           Disponibles ({availableMembersForEvent.length})
                         </h4>
                         {availableMembersForEvent.length > 0 ? (
                           <div className="space-y-2">
                             {availableMembersForEvent.map((user) => (
                               <div key={user.userId} className="p-3 bg-green-50 rounded-lg border border-green-200">
                                 <div className="font-medium text-green-900">{user.firstName} {user.lastName}</div>
                                 <div className="text-sm text-green-700">{user.instruments.join(', ')}</div>
                                 {(() => {
                                   const availability = user.availabilities.find((av: any) => av.scheduleId === selectedEvent.id);
                                   const notes = availability?.notes;
                                   
                                   // Gérer le parsing des timeSlots de manière sécurisée
                                   let timeSlots: any[] = [];
                                   try {
                                     if (availability?.timeSlots) {
                                       timeSlots = typeof availability.timeSlots === 'string' 
                                         ? JSON.parse(availability.timeSlots) 
                                         : availability.timeSlots;
                                     }
                                   } catch (error) {
                                     console.warn('Erreur parsing timeSlots:', error);
                                     timeSlots = [];
                                   }
                                   
                                   const availableSlots = timeSlots.filter((slot: any) => slot.isAvailable);
                                   
                                   return (
                                     <div className="text-xs text-green-600 mt-1">
                                       {availableSlots.length > 0 && (
                                         <div className="mb-1">
                                           <span className="font-medium">Créneaux :</span> {availableSlots.map((slot: any) => slot.label).join(', ')}
                                         </div>
                                       )}
                                       {notes && (
                                         <div className="italic">"{notes}"</div>
                                       )}
                                     </div>
                                   );
                                 })()}
                               </div>
                             ))}
                           </div>
                         ) : (
                           <p className="text-sm text-gray-500 italic">Aucun musicien disponible</p>
                         )}
                       </div>

                       {/* Indisponibles */}
                       <div className="space-y-2">
                         <h4 className="font-medium text-red-700 flex items-center">
                           <XCircleIcon className="h-4 w-4 mr-1" />
                           Indisponibles ({unavailableMembersForEvent.length})
                         </h4>
                         {unavailableMembersForEvent.length > 0 ? (
                           <div className="space-y-2">
                             {unavailableMembersForEvent.map((user) => (
                               <div key={user.userId} className="p-3 bg-red-50 rounded-lg border border-red-200">
                                 <div className="font-medium text-red-900">{user.firstName} {user.lastName}</div>
                                 <div className="text-sm text-red-700">{user.instruments.join(', ')}</div>
                                 {(() => {
                                   const availability = user.availabilities.find((av: any) => av.scheduleId === selectedEvent.id);
                                   const notes = availability?.notes;
                                   
                                   return (
                                     <div className="text-xs text-red-600 mt-1">
                                       {notes && (
                                         <div className="italic">"{notes}"</div>
                                       )}
                                     </div>
                                   );
                                 })()}
                               </div>
                             ))}
                           </div>
                         ) : (
                           <p className="text-sm text-gray-500 italic">Aucun musicien indisponible</p>
                         )}
                       </div>

                       {/* Pas de réponse */}
                       <div className="space-y-2">
                         <h4 className="font-medium text-gray-700 flex items-center">
                           <ClockIcon className="h-4 w-4 mr-1" />
                           Pas de réponse ({membersWithoutAvailability.length})
                         </h4>
                         {membersWithoutAvailability.length > 0 ? (
                           <div className="space-y-2">
                             {membersWithoutAvailability.map((user) => (
                               <div key={user.userId} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                 <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                 <div className="text-sm text-gray-700">{user.instruments.join(', ')}</div>
                                 <div className="text-xs text-gray-600 mt-1">N'a pas encore répondu</div>
                               </div>
                             ))}
                           </div>
                         ) : (
                           <p className="text-sm text-gray-500 italic">Tous ont répondu</p>
                         )}
                       </div>
                     </div>
                   </div>
                 </Card>

                 {/* Directeur Musical */}
                 <Card>
                   <div className="p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                       <StarIcon className="h-5 w-5 mr-2 text-purple-600" />
                       Directeur Musical
                     </h3>
                    {currentAssignment?.directorName ? (
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="font-medium text-purple-900">{currentAssignment.directorName}</span>
                        </div>
                        <Button
                          onClick={() => assignDirector('')}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 mb-3">Sélectionnez un directeur musical :</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {availableMembersForEvent
                            .filter(user => user.role === UserRole.MUSICIEN)
                            .map((user) => (
                              <button
                                key={user.userId}
                                onClick={() => assignDirector(user.userId)}
                                className="p-2 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                              >
                                <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-gray-600">{user.instruments.join(', ')}</div>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Équipe */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Équipe ({currentAssignment?.teamMembers.length || 0} membres)
                    </h3>
                    
                    {/* Rôles d'équipe */}
                    <div className="space-y-4">
                      {teamRoles.map((teamRole) => {
                        const assignedMember = currentAssignment?.teamMembers.find(
                          m => m.assignedRole === teamRole.id
                        );
                        
                        return (
                          <div key={teamRole.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <teamRole.icon className="h-5 w-5 mr-2 text-gray-600" />
                                <span className="font-medium text-gray-900">{teamRole.label}</span>
                              </div>
                              {assignedMember && (
                                <Button
                                  onClick={() => removeMemberFromTeam(assignedMember.userId)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            
                            {assignedMember ? (
                              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center">
                                  <UserIcon className="h-5 w-5 text-green-600 mr-2" />
                                  <div>
                                    <div className="font-medium text-green-900">
                                      {assignedMember.firstName} {assignedMember.lastName}
                                    </div>
                                    <div className="text-sm text-green-700">
                                      {assignedMember.instruments.join(', ')}
                                    </div>
                                  </div>
                                </div>
                                <ArrowRightIcon className="h-4 w-4 text-green-600" />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600 mb-2">Sélectionnez un membre :</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {availableMembersForEvent
                                    .filter(user => !currentAssignment?.teamMembers.some(m => m.userId === user.userId))
                                    .map((user) => (
                                      <button
                                        key={user.userId}
                                        onClick={() => addMemberToTeam(user.userId, teamRole.id)}
                                        className="p-2 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                                      >
                                        <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                        <div className="text-sm text-gray-600">{user.instruments.join(', ')}</div>
                                      </button>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Sélectionnez un événement</p>
                <p className="text-gray-400 mt-2">
                  Choisissez un événement dans la liste pour commencer l'affectation d'équipe.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
