'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarDaysIcon,
  EyeIcon,
  UsersIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface UserAvailability {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  availabilities: EventAvailability[];
}

interface EventAvailability {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventType: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  notes: string;
}

interface TimeSlot {
  id: string;
  label: string;
  isAvailable: boolean;
}

export default function AdminAvailabilityPage() {
  const { userRole, churchName } = useUserData();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserAvailability[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterAvailability, setFilterAvailability] = useState<string>('ALL');

  useEffect(() => {
    const fetchUsersAvailability = async () => {
      try {
        setLoading(true);
        
        console.log('🔄 Chargement des données...');
        
        // Récupérer tous les utilisateurs musiciens/techniciens
        const usersResponse = await fetch('/api/admin/users');
        const eventsResponse = await fetch('/api/admin/events');
        const availabilitiesResponse = await fetch('/api/admin/availability');
        
        console.log('📊 Statuts des réponses:', {
          users: usersResponse.status,
          events: eventsResponse.status,
          availabilities: availabilitiesResponse.status
        });
        
        if (usersResponse.ok && eventsResponse.ok && availabilitiesResponse.ok) {
          const usersData = await usersResponse.json();
          const eventsData = await eventsResponse.json();
          const availabilitiesData = await availabilitiesResponse.json();
          
          console.log('📈 Données reçues:', {
            users: usersData.length,
            events: eventsData.length,
            availabilities: availabilitiesData.length
          });
          
          // Filtrer seulement les musiciens et techniciens
          const musiciansAndTechnicians = usersData.filter((user: any) => 
            user.role === UserRole.MUSICIEN || user.role === UserRole.TECHNICIEN
          );
          
          // Combiner les données
          const usersWithAvailability = musiciansAndTechnicians.map((user: any) => {
            const userAvailabilities = availabilitiesData.filter((av: any) => av.userId === user.id);
            
            console.log(`Traitement utilisateur ${user.firstName} ${user.lastName}:`, {
              userAvailabilities: userAvailabilities.length,
              events: eventsData.length
            });
            
            const availabilities = eventsData.map((event: any) => {
              const existingAvailability = userAvailabilities.find(
                (av: any) => av.scheduleId === event.id
              );
              
              return {
                eventId: event.id,
                eventTitle: event.title,
                eventDate: event.date,
                eventType: event.type,
                startTime: event.startTime,
                endTime: event.endTime,
                isAvailable: existingAvailability?.isAvailable ?? false,
                timeSlots: existingAvailability?.timeSlots || [],
                notes: existingAvailability?.notes || ''
              };
            });
            
            return {
              userId: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              availabilities
            };
          });
          
          console.log('✅ Données traitées avec succès');
          setUsers(usersWithAvailability);
        } else {
          console.error('❌ Erreur lors du chargement des données');
          console.error('Détails:', {
            users: usersResponse.status,
            events: eventsResponse.status,
            availabilities: availabilitiesResponse.status
          });
        }
      } catch (error) {
        console.error('❌ Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAvailability();
  }, []);

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'MUSICIEN': return 'Musicien';
      case 'TECHNICIEN': return 'Technicien';
      default: return role;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    const matchesAvailability = filterAvailability === 'ALL' || 
      (filterAvailability === 'AVAILABLE' && user.availabilities.some(av => av.isAvailable)) ||
      (filterAvailability === 'UNAVAILABLE' && user.availabilities.some(av => !av.isAvailable));
    return matchesRole && matchesAvailability;
  });

  const getAvailabilityStats = () => {
    const totalUsers = users.length;
    const availableUsers = users.filter(user => 
      user.availabilities.some(av => av.isAvailable)
    ).length;
    const unavailableUsers = users.filter(user => 
      user.availabilities.some(av => !av.isAvailable)
    ).length;
    
    return { totalUsers, availableUsers, unavailableUsers };
  };

  const stats = getAvailabilityStats();

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UsersIcon className="h-8 w-8 mr-3 text-blue-600" />
              Disponibilités des Membres
            </h1>
            <p className="text-gray-600 mt-2">
              Consultez les disponibilités de tous les musiciens et techniciens de {churchName}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-4">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-blue-600">Total Membres</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <div className="p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-green-600">Disponibles</p>
                  <p className="text-2xl font-bold text-green-900">{stats.availableUsers}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-red-50 border-red-200">
            <div className="p-4">
              <div className="flex items-center">
                <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-red-600">Indisponibles</p>
                  <p className="text-2xl font-bold text-red-900">{stats.unavailableUsers}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <FunnelIcon className="h-4 w-4 mr-1" />
                  Filtres :
                </span>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tous les rôles</option>
                  <option value="MUSICIEN">Musiciens</option>
                  <option value="TECHNICIEN">Techniciens</option>
                </select>
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Toutes les disponibilités</option>
                  <option value="AVAILABLE">Disponibles</option>
                  <option value="UNAVAILABLE">Indisponibles</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun membre trouvé</p>
            <p className="text-gray-400 mt-2">
              Aucun musicien ou technicien ne correspond à vos filtres.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.userId} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600 rounded-full">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 mt-1">
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {user.availabilities.filter(av => av.isAvailable).length} disponible(s)
                      </span>
                    </div>
                  </div>

                  {/* Events Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {user.availabilities.map((availability) => (
                      <div
                        key={availability.eventId}
                        className={`p-3 rounded-lg border ${
                          availability.isAvailable 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {availability.eventTitle}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(availability.eventType)}`}>
                            {getEventTypeLabel(availability.eventType)}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-2">
                          <div className="flex items-center mb-1">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {new Date(availability.eventDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {availability.startTime} - {availability.endTime}
                          </div>
                        </div>
                        
                                                 <div className="flex items-center justify-between">
                           <div className="flex space-x-1">
                             <span className={`text-xs px-2 py-1 rounded-full ${
                               availability.isAvailable 
                                 ? 'bg-green-100 text-green-800 border border-green-300' 
                                 : 'bg-gray-100 text-gray-600 border border-gray-300'
                             }`}>
                               Disponible
                             </span>
                             <span className={`text-xs px-2 py-1 rounded-full ${
                               !availability.isAvailable 
                                 ? 'bg-red-100 text-red-800 border border-red-300' 
                                 : 'bg-gray-100 text-gray-600 border border-gray-300'
                             }`}>
                               Indisponible
                             </span>
                           </div>
                          
                          {availability.isAvailable && availability.timeSlots.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {availability.timeSlots.filter(slot => slot.isAvailable).length} créneau(x)
                            </span>
                          )}
                        </div>
                        
                        {availability.notes && (
                          <p className="text-xs text-gray-600 mt-2 italic">
                            "{availability.notes}"
                          </p>
                        )}
                      </div>
                    ))}
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
