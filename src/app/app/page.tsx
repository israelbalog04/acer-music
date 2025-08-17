'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, StatCard } from '@/components/ui/card';
import { showToast } from '@/components/ui/toaster';
import {
  MusicalNoteIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  UsersIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ChartBarIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  title: string;
  value: number;
  change: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: React.ReactElement;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

interface UpcomingService {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  description?: string;
  location?: string;
  daysUntil: number;
  formattedDate: string;
  formattedTime: string;
}

interface RecentUpload {
  id: number;
  song: string;
  instrument: string;
  uploadedAt: string;
  plays: number;
  status: string;
}

interface Activity {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning';
}

export default function DashboardPage() {
  const { firstName, userRole } = useUserData();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [upcomingServices, setUpcomingServices] = useState<UpcomingService[]>([]);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');

  // Redirection automatique pour le rôle MULTIMEDIA
  useEffect(() => {
    if (userRole === 'MULTIMEDIA') {
      window.location.href = '/app/multimedia/upload';
    }
  }, [userRole]);

  // Définir le message de salutation selon l'heure
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Bonjour');
    } else if (hour < 18) {
      setGreeting('Bon après-midi');
    } else {
      setGreeting('Bonsoir');
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, servicesRes, uploadsRes, activityRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/upcoming-services'), 
        fetch('/api/dashboard/recent-uploads'),
        fetch('/api/dashboard/activity')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats([
          {
            title: 'Mes Enregistrements',
            value: statsData.recordings?.total || 0,
            change: { 
              value: statsData.recordings?.change || 'Aucune donnée', 
              trend: statsData.recordings?.trend || 'neutral' as const 
            },
            icon: <MusicalNoteIcon className="h-6 w-6" />,
            color: 'blue' as const
          },
          {
            title: 'Événements ce mois',
            value: statsData.stats?.eventsThisMonth || 0,
            change: { 
              value: `${statsData.stats?.upcomingEvents || 0} prochains`, 
              trend: 'up' as const 
            },
            icon: <CalendarIcon className="h-6 w-6" />,
            color: 'green' as const
          },
          {
            title: 'Chants enregistrés',
            value: statsData.stats?.totalSongs || 0,
            change: { 
              value: 'Total répertoire', 
              trend: 'neutral' as const 
            },
            icon: <MusicalNoteIcon className="h-6 w-6" />,
            color: 'purple' as const
          },
          {
            title: 'Membres actifs',
            value: statsData.stats?.totalUsers || 0,
            change: { 
              value: 'Équipe complète', 
              trend: 'neutral' as const 
            },
            icon: <UsersIcon className="h-6 w-6" />,
            color: 'orange' as const
          }
        ]);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setUpcomingServices(servicesData.events || []);
      }

      if (uploadsRes.ok) {
        const uploadsData = await uploadsRes.json();
        setRecentUploads(uploadsData.uploads || []);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData.activities || []);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      setError('Erreur lors du chargement des données');
      showToast({
        type: 'error',
        title: 'Erreur de chargement',
        message: 'Impossible de charger les données du dashboard'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Si c'est un utilisateur MULTIMEDIA, afficher un message de chargement
  if (userRole === 'MULTIMEDIA') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Redirection vers la page de dépôt de photos...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Planning',
      description: 'Consulter mes services',
      href: '/app/team/planning',
      icon: <CalendarIcon className="h-5 w-5 text-white" />,
      color: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Voir le Repertoire',
      description: 'Parcourir tous les chants',
      href: '/app/music/repertoire',
      icon: <MusicalNoteIcon className="h-5 w-5 text-white" />,
      color: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800',
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      title: 'Nouveau Upload',
      description: 'Enregistrer une nouvelle version',
      href: '/app/music/upload',
      icon: <CloudArrowUpIcon className="h-5 w-5 text-white" />,
      color: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800',
      gradient: 'from-primary-500 to-primary-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              {greeting} {firstName} ! 👋
            </h1>
            <p className="text-neutral-600 text-lg">
              Voici un aperçu de votre activité musicale à Acer Paris
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-neutral-500">En ligne</span>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 opacity-10">
          <SparklesIcon className="h-24 w-24 text-primary-400" />
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Enhanced Skeleton loading states
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-6 animate-pulse card-hover">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-24 skeleton"></div>
                    <div className="h-8 bg-neutral-200 rounded w-16 skeleton"></div>
                  </div>
                  <div className="w-12 h-12 bg-neutral-200 rounded-full skeleton"></div>
                </div>
                <div className="h-3 bg-neutral-200 rounded w-32 skeleton"></div>
              </div>
            </Card>
          ))
        ) : stats.length > 0 ? (
          stats.map((stat, index) => (
            <div
              key={index}
              className={`animate-scaleIn hover-lift animate-delay-${index * 100}`}
            >
              <StatCard {...stat} />
            </div>
          ))
        ) : (
          <div className="col-span-4">
            <Card className="p-6">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Aucune statistique disponible</p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Enhanced Quick Actions */}
      <div className="animate-fadeInUp animate-delay-500">
        <Card className="card-glow">
          <CardHeader 
            title="Actions Rapides" 
            subtitle="Raccourcis vers les fonctionnalités principales"
            icon={<SparklesIcon className="h-5 w-5 text-primary-600" />}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className={`animate-slideInLeft animate-delay-${(index + 6) * 100} hover-lift`}
              >
                <Link href={action.href}>
                  <div className="p-6 border border-neutral-200 rounded-xl hover:border-primary-300 hover:shadow-xl transition-all duration-300 cursor-pointer group bg-gradient-to-br from-white to-neutral-50">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl text-white ${action.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg`}>
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-neutral-600">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Upcoming Services */}
        <Card className="card-hover">
          <CardHeader 
            title="Prochains Services" 
            subtitle="Vos affectations à venir"
            action={
              <Link href="/app/team/planning">
                <Button variant="outline" size="sm" className="hover:bg-primary-50 hover:border-primary-300">
                  Voir tout
                </Button>
              </Link>
            }
            icon={<CalendarIcon className="h-5 w-5 text-primary-600" />}
          />
          <div className="space-y-4 p-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-100 animate-pulse">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-neutral-200 rounded w-32 skeleton"></div>
                      <div className="h-4 bg-neutral-200 rounded w-24 skeleton"></div>
                    </div>
                    <div className="h-3 bg-neutral-200 rounded w-40 skeleton"></div>
                    <div className="h-3 bg-neutral-200 rounded w-36 skeleton"></div>
                  </div>
                </div>
              ))
            ) : upcomingServices.length > 0 ? (
              upcomingServices.map((service, index) => {
                const getTypeColor = (type: string) => {
                  switch (type) {
                    case 'SERVICE': return 'bg-primary-100 text-primary-800 border-primary-200';
                    case 'REPETITION': return 'bg-success-100 text-success-800 border-success-200';
                    case 'SPECIAL': return 'bg-purple-100 text-purple-800 border-purple-200';
                    case 'CONCERT': return 'bg-warning-100 text-warning-800 border-warning-200';
                    case 'FORMATION': return 'bg-error-100 text-error-800 border-error-200';
                    default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
                  }
                };

                const getTypeLabel = (type: string) => {
                  switch (type) {
                    case 'SERVICE': return 'Service';
                    case 'REPETITION': return 'Répétition';
                    case 'SPECIAL': return 'Événement Spécial';
                    case 'CONCERT': return 'Concert';
                    case 'FORMATION': return 'Formation';
                    default: return type;
                  }
                };

                return (
                  <div 
                    key={service.id} 
                    className="p-4 bg-gradient-to-r from-neutral-50 to-white rounded-xl border border-neutral-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">
                        {service.title}
                      </h4>
                      <span className={`px-3 py-1 text-xs rounded-full border ${getTypeColor(service.type)}`}>
                        {getTypeLabel(service.type)}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600 mb-3">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4" />
                        <span>{service.formattedDate} à {service.formattedTime}</span>
                      </div>
                    </div>
                    {service.daysUntil === 0 && (
                      <div className="flex items-center space-x-2 mb-2">
                        <StarIcon className="h-4 w-4 text-success-600" />
                        <p className="text-sm text-success-600 font-medium">
                          🎉 Aujourd'hui !
                        </p>
                      </div>
                    )}
                    {service.daysUntil === 1 && (
                      <div className="flex items-center space-x-2 mb-2">
                        <ClockIcon className="h-4 w-4 text-warning-600" />
                        <p className="text-sm text-warning-600 font-medium">
                          ⏰ Demain
                        </p>
                      </div>
                    )}
                    {service.daysUntil > 1 && (
                      <p className="text-sm text-neutral-500 mb-2">
                        Dans {service.daysUntil} jours
                      </p>
                    )}
                    {service.description && (
                      <p className="text-sm text-neutral-600 mb-2">
                        {service.description}
                      </p>
                    )}
                    {service.location && (
                      <p className="text-sm text-neutral-500 flex items-center">
                        📍 {service.location}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 font-medium">Aucun service programmé</p>
                <p className="text-sm text-neutral-400 mt-1">Vous serez notifié des nouveaux services</p>
              </div>
            )}
          </div>
        </Card>

        {/* Enhanced Recent Uploads */}
        <Card className="card-hover">
          <CardHeader 
            title="Mes Enregistrements Récents" 
            subtitle="Vos derniers uploads"
            action={
              <Link href="/app/music/upload">
                <Button variant="outline" size="sm" className="hover:bg-primary-50 hover:border-primary-300">
                  Nouveau Upload
                </Button>
              </Link>
            }
            icon={<CloudArrowUpIcon className="h-5 w-5 text-primary-600" />}
          />
          <div className="space-y-4 p-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-100 animate-pulse">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-neutral-200 rounded w-32 skeleton"></div>
                      <div className="h-4 bg-neutral-200 rounded w-20 skeleton"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-neutral-200 rounded w-24 skeleton"></div>
                      <div className="h-3 bg-neutral-200 rounded w-16 skeleton"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : recentUploads.length > 0 ? (
              recentUploads.map((upload, index) => (
                <div 
                  key={upload.id} 
                  className="p-4 bg-gradient-to-r from-neutral-50 to-white rounded-xl border border-neutral-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">
                      {upload.song}
                    </h4>
                    <span className={`px-3 py-1 text-xs rounded-full border ${
                      upload.status === 'approuvé' 
                        ? 'bg-success-100 text-success-800 border-success-200' 
                        : 'bg-warning-100 text-warning-800 border-warning-200'
                    }`}>
                      {upload.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-600">
                    <span className="flex items-center space-x-1">
                      <MusicalNoteIcon className="h-4 w-4" />
                      <span>{upload.instrument}</span>
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <PlayIcon className="h-3 w-3" />
                        <span>{upload.plays}</span>
                      </span>
                      <span>{new Date(upload.uploadedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CloudArrowUpIcon className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 font-medium">Aucun enregistrement récent</p>
                <p className="text-sm text-neutral-400 mt-1">Commencez par uploader votre premier enregistrement</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Enhanced Recent Activity */}
      <Card className="card-hover">
        <CardHeader 
          title="Activité Récente" 
          subtitle="Dernières mises à jour de l'équipe"
          icon={<ChartBarIcon className="h-5 w-5 text-primary-600" />}
        />
        <div className="space-y-3 p-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg animate-pulse">
                <div className="w-2 h-2 bg-neutral-200 rounded-full skeleton"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-1 skeleton"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2 skeleton"></div>
                </div>
                <div className="h-3 bg-neutral-200 rounded w-12 skeleton"></div>
              </div>
            ))
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => {
              const bgColor = activity.type === 'success' ? 'bg-success-50' : 
                            activity.type === 'warning' ? 'bg-warning-50' : 'bg-primary-50';
              const dotColor = activity.type === 'success' ? 'bg-success-500' : 
                             activity.type === 'warning' ? 'bg-warning-500' : 'bg-primary-500';
              
              return (
                <div 
                  key={activity.id} 
                  className={`flex items-center space-x-3 p-4 ${bgColor} rounded-lg hover:shadow-md transition-all duration-300 hover:scale-[1.01]`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-3 h-3 ${dotColor} rounded-full animate-pulse`}></div>
                  <p className="text-sm text-neutral-700 flex-1 font-medium">{activity.message}</p>
                  <span className="text-xs text-neutral-500">{activity.timestamp}</span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium">Aucune activité récente</p>
              <p className="text-sm text-neutral-400 mt-1">L'activité de l'équipe apparaîtra ici</p>
            </div>
          )}
        </div>
      </Card>

      {/* Enhanced Error State */}
      {error && (
        <Card className="p-6 border-error-200 bg-error-50">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-error-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-error-900 mb-2">Erreur de chargement</h3>
            <p className="text-error-700 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors focus:ring-4 focus:ring-error-200"
            >
              Réessayer
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}