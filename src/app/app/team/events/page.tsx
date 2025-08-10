'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useUserData } from '@/hooks/useUserData';
import Image from 'next/image';
import {
  CalendarIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  MusicalNoteIcon,
  ChevronRightIcon,
  EyeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid';

interface TeamMember {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    primaryInstrument?: string;
    skillLevel?: string;
    instruments: string;
  };
  role?: string;
  instruments?: string;
  isConfirmed?: boolean;
  isPrimary?: boolean;
  assignedBy?: {
    firstName: string;
    lastName: string;
  };
  assignedAt: string;
  notes?: string;
}

interface EventSession {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  sessionOrder: number;
  location?: string;
  notes?: string;
  directors: TeamMember[];
  members: TeamMember[];
}

interface EventTeam {
  directors: TeamMember[];
  members: TeamMember[];
  sessions: EventSession[];
}

interface TeamAnalysis {
  critical: string[];
  high: string[];
  medium: string[];
  satisfied: string[];
  totalMembers: number;
  minRequired: number;
  maxRecommended?: number;
  isUnderStaffed: boolean;
  isOverStaffed: boolean;
}

interface EventWithTeam {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: string;
  status: string;
  location?: string;
  hasMultipleSessions: boolean;
  sessionCount: number;
  notes?: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  totalMembers: number;
  directorsCount: number;
  membersCount: number;
  sessionsCount: number;
  teamAnalysis: TeamAnalysis;
  team: EventTeam;
}

export default function TeamEventPage() {
  const { userRole, churchName } = useUserData();
  const [events, setEvents] = useState<EventWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('tous');
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalSessions: 0,
    totalUniqueMembers: 0,
    upcomingEvents: 0,
    completedEvents: 0
  });

  useEffect(() => {
    loadTeamsByEvents();
  }, [includeCompleted, selectedType]);

  const loadTeamsByEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '50',
        includeCompleted: includeCompleted.toString()
      });
      
      if (selectedType !== 'tous') {
        params.append('type', selectedType.toUpperCase());
      }

      const response = await fetch(`/api/teams/by-events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des équipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getSkillLevelLabel = (skillLevel: string) => {
    const labels: Record<string, string> = {
      'BEGINNER': 'Débutant',
      'INTERMEDIATE': 'Intermédiaire',
      'ADVANCED': 'Avancé',
      'EXPERT': 'Expert'
    };
    return labels[skillLevel] || skillLevel;
  };

  const getSkillLevelColor = (skillLevel: string) => {
    const colors: Record<string, string> = {
      'BEGINNER': 'bg-gray-100 text-gray-700',
      'INTERMEDIATE': 'bg-blue-100 text-blue-700',
      'ADVANCED': 'bg-green-100 text-green-700',
      'EXPERT': 'bg-purple-100 text-purple-700'
    };
    return colors[skillLevel] || 'bg-gray-100 text-gray-700';
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'SERVICE': 'bg-blue-100 text-blue-800',
      'REPETITION': 'bg-green-100 text-green-800',
      'CONCERT': 'bg-purple-100 text-purple-800',
      'FORMATION': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PLANNED': 'bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTeamNeeds = (analysis: TeamAnalysis) => {
    const hasCriticalNeeds = analysis.critical.length > 0;
    const hasHighNeeds = analysis.high.length > 0;
    const hasMediumNeeds = analysis.medium.length > 0;
    
    if (!hasCriticalNeeds && !hasHighNeeds && !hasMediumNeeds) {
      return (
        <div className="flex items-center text-green-600 text-sm">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          <span>Équipe complète</span>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {/* Besoins critiques */}
        {analysis.critical.length > 0 && (
          <div className="flex items-center text-red-600 text-sm">
            <ExclamationTriangleSolidIcon className="h-4 w-4 mr-1" />
            <span className="font-medium">Critiques:</span>
            <span className="ml-1">{analysis.critical.join(', ')}</span>
          </div>
        )}
        
        {/* Besoins importants */}
        {analysis.high.length > 0 && (
          <div className="flex items-center text-orange-600 text-sm">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            <span className="font-medium">Importants:</span>
            <span className="ml-1">{analysis.high.join(', ')}</span>
          </div>
        )}
        
        {/* Besoins moyens */}
        {analysis.medium.length > 0 && (
          <div className="flex items-center text-yellow-600 text-sm">
            <InformationCircleIcon className="h-4 w-4 mr-1" />
            <span className="font-medium">Optionnels:</span>
            <span className="ml-1">{analysis.medium.join(', ')}</span>
          </div>
        )}
      </div>
    );
  };

  const getTeamStatusBadge = (analysis: TeamAnalysis) => {
    if (analysis.critical.length > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationTriangleSolidIcon className="h-3 w-3 mr-1" />
          Équipe incomplète
        </span>
      );
    }
    
    if (analysis.high.length > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          À compléter
        </span>
      );
    }
    
    if (analysis.medium.length > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <InformationCircleIcon className="h-3 w-3 mr-1" />
          Améliorable
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        Complète
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="h-8 w-8 mr-3 text-blue-600" />
              Équipes par Événement
            </h1>
            <p className="text-gray-600 mt-2">
              Vue d'ensemble des équipes musicales assignées aux événements de {churchName}
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</p>
                <p className="text-sm text-gray-600">Événements</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSessions}</p>
                <p className="text-sm text-gray-600">Sessions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUniqueMembers}</p>
                <p className="text-sm text-gray-600">Musiciens</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingEvents}</p>
                <p className="text-sm text-gray-600">À venir</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-gray-500" />
              <div className="ml-3">
                <p className="text-2xl font-semibold text-gray-900">{stats.completedEvents}</p>
                <p className="text-sm text-gray-600">Terminés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un événement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tous">Tous les types</option>
                <option value="service">Service</option>
                <option value="repetition">Répétition</option>
                <option value="concert">Concert</option>
                <option value="formation">Formation</option>
              </select>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeCompleted}
                  onChange={(e) => setIncludeCompleted(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Inclure terminés</span>
              </label>
            </div>
          </div>
        </div>

        {/* Liste des événements */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun événement trouvé</p>
              <p className="text-gray-400 mt-2">
                Aucun événement ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md">
                {/* En-tête de l'événement */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleEventExpansion(event.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        {getTeamStatusBadge(event.teamAnalysis)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(event.date)}
                        </div>
                        {event.startTime && (
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatTime(event.startTime)}
                            {event.endTime && ` - ${formatTime(event.endTime)}`}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-gray-600 mb-3">{event.description}</p>
                      )}

                      {/* Affichage des besoins d'équipe */}
                      <div className="mb-3">
                        {renderTeamNeeds(event.teamAnalysis)}
                      </div>

                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center text-blue-600">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          <span>{event.totalMembers} membres</span>
                          {event.teamAnalysis.isUnderStaffed && (
                            <span className="text-red-500 ml-1">
                              (min {event.teamAnalysis.minRequired})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-green-600">
                          <StarIcon className="h-4 w-4 mr-1" />
                          <span>{event.directorsCount} directeur(s)</span>
                        </div>
                        {event.hasMultipleSessions && (
                          <div className="flex items-center text-purple-600">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span>{event.sessionsCount} session(s)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRightIcon 
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        expandedEvents.has(event.id) ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>
                </div>

                {/* Détails des équipes (collapsible) */}
                {expandedEvents.has(event.id) && (
                  <div className="border-t border-gray-200 p-6">
                    {/* Directeurs musicaux */}
                    {event.team.directors.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                          <StarSolidIcon className="h-5 w-5 text-yellow-500 mr-2" />
                          Directeurs Musicaux ({event.team.directors.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {event.team.directors.map((director) => (
                            <div key={director.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-center space-x-3">
                                {director.user.avatar ? (
                                  <Image
                                    src={director.user.avatar}
                                    alt={`${director.user.firstName} ${director.user.lastName}`}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                      {getInitials(director.user.firstName, director.user.lastName)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {director.user.firstName} {director.user.lastName}
                                    {director.isPrimary && <span className="text-yellow-600 ml-1">★</span>}
                                  </p>
                                  {director.user.primaryInstrument && (
                                    <p className="text-xs text-gray-600">{director.user.primaryInstrument}</p>
                                  )}
                                  {director.user.skillLevel && (
                                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getSkillLevelColor(director.user.skillLevel)}`}>
                                      {getSkillLevelLabel(director.user.skillLevel)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {director.notes && (
                                <p className="text-xs text-gray-600 mt-2 italic">"{director.notes}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Membres de l'équipe */}
                    {event.team.members.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                          <UsersIcon className="h-5 w-5 text-blue-500 mr-2" />
                          Membres de l'Équipe ({event.team.members.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {event.team.members.map((member) => (
                            <div key={member.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center space-x-3">
                                {member.user.avatar ? (
                                  <Image
                                    src={member.user.avatar}
                                    alt={`${member.user.firstName} ${member.user.lastName}`}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                      {getInitials(member.user.firstName, member.user.lastName)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {member.user.firstName} {member.user.lastName}
                                  </p>
                                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    {member.role && <span className="font-medium">{member.role}</span>}
                                    {member.user.primaryInstrument && (
                                      <span>• {member.user.primaryInstrument}</span>
                                    )}
                                  </div>
                                  {member.user.skillLevel && (
                                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getSkillLevelColor(member.user.skillLevel)}`}>
                                      {getSkillLevelLabel(member.user.skillLevel)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {member.notes && (
                                <p className="text-xs text-gray-600 mt-2 italic">"{member.notes}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sessions */}
                    {event.team.sessions.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                          <ClockIcon className="h-5 w-5 text-purple-500 mr-2" />
                          Sessions ({event.team.sessions.length})
                        </h4>
                        <div className="space-y-4">
                          {event.team.sessions.map((session) => (
                            <div key={session.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-gray-900">{session.name}</h5>
                                <div className="text-sm text-gray-600">
                                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                </div>
                              </div>
                              
                              {(session.directors.length > 0 || session.members.length > 0) && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {/* Directeurs de session */}
                                  {session.directors.length > 0 && (
                                    <div>
                                      <h6 className="text-sm font-medium text-purple-800 mb-2">
                                        Directeur(s) ({session.directors.length})
                                      </h6>
                                      <div className="space-y-2">
                                        {session.directors.map((director) => (
                                          <div key={director.id} className="flex items-center space-x-2">
                                            {director.user.avatar ? (
                                              <Image
                                                src={director.user.avatar}
                                                alt={`${director.user.firstName} ${director.user.lastName}`}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full object-cover"
                                              />
                                            ) : (
                                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-medium text-xs">
                                                  {getInitials(director.user.firstName, director.user.lastName)}
                                                </span>
                                              </div>
                                            )}
                                            <div className="flex-1">
                                              <p className="text-sm font-medium text-gray-900">
                                                {director.user.firstName} {director.user.lastName}
                                                {director.isPrimary && <span className="text-purple-600 ml-1">★</span>}
                                              </p>
                                              {director.user.primaryInstrument && (
                                                <p className="text-xs text-gray-600">{director.user.primaryInstrument}</p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Membres de session */}
                                  {session.members.length > 0 && (
                                    <div>
                                      <h6 className="text-sm font-medium text-purple-800 mb-2">
                                        Membres ({session.members.length})
                                      </h6>
                                      <div className="space-y-2">
                                        {session.members.map((member) => (
                                          <div key={member.id} className="flex items-center space-x-2">
                                            {member.user.avatar ? (
                                              <Image
                                                src={member.user.avatar}
                                                alt={`${member.user.firstName} ${member.user.lastName}`}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full object-cover"
                                              />
                                            ) : (
                                              <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
                                                <span className="text-white font-medium text-xs">
                                                  {getInitials(member.user.firstName, member.user.lastName)}
                                                </span>
                                              </div>
                                            )}
                                            <div className="flex-1">
                                              <div className="flex items-center space-x-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                  {member.user.firstName} {member.user.lastName}
                                                </p>
                                                {member.isConfirmed && (
                                                  <span className="text-green-500 text-xs">✓</span>
                                                )}
                                              </div>
                                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                                {member.role && <span>{member.role}</span>}
                                                {member.user.primaryInstrument && (
                                                  <span>• {member.user.primaryInstrument}</span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {session.notes && (
                                <div className="mt-3 pt-3 border-t border-purple-200">
                                  <p className="text-sm text-gray-600 italic">"{session.notes}"</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message si aucune équipe */}
                    {event.team.directors.length === 0 && 
                     event.team.members.length === 0 && 
                     event.team.sessions.length === 0 && (
                      <div className="text-center py-8">
                        <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">Aucune équipe assignée à cet événement</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Les membres d'équipe apparaîtront ici une fois assignés.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </RoleGuard>
  );
}