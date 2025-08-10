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
  UserIcon,
  UsersIcon,
  StarIcon,
  MusicalNoteIcon,
  MicrophoneIcon,
  CogIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface TeamAssignment {
  id: string;
  scheduleId: string;
  role: string;
  instruments: string[];
  createdAt: string;
  schedule: {
    id: string;
    title: string;
    date: string;
    type: string;
    startTime: string;
    endTime: string;
  };
}

interface DirectorAssignment {
  id: string;
  scheduleId: string;
  createdAt: string;
  schedule: {
    id: string;
    title: string;
    date: string;
  };
}

export default function MyAssignmentsPage() {
  const { userRole, churchName, firstName, lastName } = useUserData();
  const [loading, setLoading] = useState(true);
  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment[]>([]);
  const [directorAssignments, setDirectorAssignments] = useState<DirectorAssignment[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(true);

  useEffect(() => {
    const fetchMyAssignments = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/app/teams/my-assignments');
        
        if (response.ok) {
          const data = await response.json();
          setTeamAssignments(data.teamAssignments || []);
          setDirectorAssignments(data.directorAssignments || []);
        } else {
          console.error('Erreur lors du chargement des affectations');
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAssignments();
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
      case 'DIRECTOR': return 'Directeur Musical';
      case 'LEAD_VOCAL': return 'Chant Principal';
      case 'BACKUP_VOCAL': return 'Chant Accompagnement';
      case 'PIANO': return 'Piano';
      case 'GUITAR': return 'Guitare';
      case 'BASS': return 'Basse';
      case 'DRUMS': return 'Batterie';
      case 'KEYS': return 'Claviers';
      case 'TECHNICIAN': return 'Technicien';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'DIRECTOR': return StarIcon;
      case 'LEAD_VOCAL':
      case 'BACKUP_VOCAL': return MicrophoneIcon;
      case 'PIANO':
      case 'GUITAR':
      case 'BASS':
      case 'DRUMS':
      case 'KEYS': return MusicalNoteIcon;
      case 'TECHNICIAN': return CogIcon;
      default: return UserIcon;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'DIRECTOR': return 'bg-purple-100 text-purple-800';
      case 'LEAD_VOCAL':
      case 'BACKUP_VOCAL': return 'bg-blue-100 text-blue-800';
      case 'PIANO':
      case 'GUITAR':
      case 'BASS':
      case 'DRUMS':
      case 'KEYS': return 'bg-green-100 text-green-800';
      case 'TECHNICIAN': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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

  // Combiner toutes les affectations
  const allAssignments = [
    ...teamAssignments.map(ta => ({ ...ta, type: 'TEAM' as const })),
    ...directorAssignments.map(da => ({ ...da, type: 'DIRECTOR' as const }))
  ];

  const filteredAssignments = allAssignments.filter(assignment => {
    const matchesFilter = filterType === 'ALL' || assignment.schedule.type === filterType;
    const eventDate = new Date(assignment.schedule.date);
    const today = new Date();
    const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const matchesUpcoming = !showOnlyUpcoming || daysUntil >= 0;
    return matchesFilter && matchesUpcoming;
  });

  const upcomingAssignments = filteredAssignments.filter(assignment => {
    const eventDate = new Date(assignment.schedule.date);
    const today = new Date();
    return eventDate >= today;
  });

  const pastAssignments = filteredAssignments.filter(assignment => {
    const eventDate = new Date(assignment.schedule.date);
    const today = new Date();
    return eventDate < today;
  });

  return (
    <RoleGuard allowedRoles={[UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UsersIcon className="h-8 w-8 mr-3 text-blue-600" />
              Mes Affectations d'Équipe
            </h1>
            <p className="text-gray-600 mt-2">
              Consultez vos affectations d'équipe pour les événements de {churchName}
            </p>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-4">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-blue-600">Total Affectations</p>
                  <p className="text-2xl font-bold text-blue-900">{filteredAssignments.length}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <div className="p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-green-600">À Venir</p>
                  <p className="text-2xl font-bold text-green-900">{upcomingAssignments.length}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <div className="p-4">
              <div className="flex items-center">
                <StarIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-purple-600">Directeur</p>
                  <p className="text-2xl font-bold text-purple-900">{directorAssignments.length}</p>
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

        {/* Assignments List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <Card className="p-8 text-center">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune affectation trouvée</p>
            <p className="text-gray-400 mt-2">
              Vous n'avez pas encore été affecté à une équipe pour les événements correspondant à vos filtres.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Assignments */}
            {upcomingAssignments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Événements à venir</h2>
                <div className="space-y-4">
                  {upcomingAssignments.map((assignment) => {
                    const RoleIcon = assignment.type === 'DIRECTOR' 
                      ? StarIcon 
                      : getRoleIcon(assignment.role);
                    
                    return (
                      <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{assignment.schedule.title}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(assignment.schedule.type)}`}>
                                  {getEventTypeLabel(assignment.schedule.type)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  {new Date(assignment.schedule.date).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                                <span className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {assignment.schedule.startTime} - {assignment.schedule.endTime}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {getDaysUntilText(assignment.schedule.date)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 text-sm rounded-full ${getRoleColor(assignment.type === 'DIRECTOR' ? 'DIRECTOR' : assignment.role)}`}>
                                <div className="flex items-center">
                                  <RoleIcon className="h-4 w-4 mr-1" />
                                  {assignment.type === 'DIRECTOR' 
                                    ? 'Directeur Musical' 
                                    : getRoleLabel(assignment.role)
                                  }
                                </div>
                              </span>
                            </div>
                          </div>
                          
                          {assignment.type === 'TEAM' && assignment.instruments && assignment.instruments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm text-gray-600">
                                <strong>Instruments :</strong> {assignment.instruments.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Assignments */}
            {pastAssignments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Événements passés</h2>
                <div className="space-y-4">
                  {pastAssignments.map((assignment) => {
                    const RoleIcon = assignment.type === 'DIRECTOR' 
                      ? StarIcon 
                      : getRoleIcon(assignment.role);
                    
                    return (
                      <Card key={assignment.id} className="bg-gray-50 hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-700">{assignment.schedule.title}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(assignment.schedule.type)}`}>
                                  {getEventTypeLabel(assignment.schedule.type)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                <span className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  {new Date(assignment.schedule.date).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                                <span className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {assignment.schedule.startTime} - {assignment.schedule.endTime}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">
                                📅 Passé
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 text-sm rounded-full ${getRoleColor(assignment.type === 'DIRECTOR' ? 'DIRECTOR' : assignment.role)}`}>
                                <div className="flex items-center">
                                  <RoleIcon className="h-4 w-4 mr-1" />
                                  {assignment.type === 'DIRECTOR' 
                                    ? 'Directeur Musical' 
                                    : getRoleLabel(assignment.role)
                                  }
                                </div>
                              </span>
                            </div>
                          </div>
                          
                          {assignment.type === 'TEAM' && assignment.instruments && assignment.instruments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm text-gray-500">
                                <strong>Instruments :</strong> {assignment.instruments.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
