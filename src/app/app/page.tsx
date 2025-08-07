'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, StatCard } from '@/components/ui/card';
import {
  MusicalNoteIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  UsersIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  title: string;
  value: number;
  change: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: React.ReactElement;
  color: string;
}

interface UpcomingService {
  id: number;
  date: string;
  time: string;
  type: string;
  role: string;
  status: string;
  rehearsal: string;
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
  const { firstName } = useUserData();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [upcomingServices, setUpcomingServices] = useState<UpcomingService[]>([]);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

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
            title: 'Services ce mois',
            value: statsData.services?.total || 0,
            change: { 
              value: statsData.services?.change || 'Aucune donnée', 
              trend: statsData.services?.trend || 'neutral' as const 
            },
            icon: <CalendarIcon className="h-6 w-6" />,
            color: 'green' as const
          },
          {
            title: 'Répertoire total',
            value: statsData.repertoire?.total || 0,
            change: { 
              value: statsData.repertoire?.change || 'Aucune donnée', 
              trend: statsData.repertoire?.trend || 'neutral' as const 
            },
            icon: <MusicalNoteIcon className="h-6 w-6" />,
            color: 'purple' as const
          },
          {
            title: 'Équipe active',
            value: statsData.team?.total || 0,
            change: { 
              value: statsData.team?.change || 'Aucune donnée', 
              trend: statsData.team?.trend || 'neutral' as const 
            },
            icon: <UsersIcon className="h-6 w-6" />,
            color: 'orange' as const
          }
        ]);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setUpcomingServices(servicesData);
      }

      if (uploadsRes.ok) {
        const uploadsData = await uploadsRes.json();
        setRecentUploads(uploadsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Nouveau Upload',
      description: 'Enregistrer une nouvelle version',
      href: '/app/music/upload',
      icon: <CloudArrowUpIcon className="h-5 w-5" />,
      color: 'bg-[#3244c7] hover:bg-[#2938b3]'
    },
    {
      title: 'Voir le Répertoire',
      description: 'Parcourir tous les chants',
      href: '/app/music/repertoire',
      icon: <MusicalNoteIcon className="h-5 w-5" />,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Planning',
      description: 'Consulter mes services',
      href: '/app/team/planning',
      icon: <CalendarIcon className="h-5 w-5" />,
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour {firstName} ! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Voici un aperçu de votre activité musicale à Acer Paris
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Skeleton loading states
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
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
                <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucune statistique disponible</p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="animate-fadeInUp animate-delay-500">
        <Card>
          <CardHeader 
            title="Actions Rapides" 
            subtitle="Raccourcis vers les fonctionnalités principales"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className={`animate-slideInLeft animate-delay-${(index + 6) * 100} hover-lift`}
              >
                <Link href={action.href}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-[#3244c7] hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg text-white ${action.color} transition-transform duration-200 hover:scale-110 hover:rotate-6`}>
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-[#3244c7]">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500">{action.description}</p>
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
        {/* Upcoming Services */}
        <Card>
          <CardHeader 
            title="Prochains Services" 
            subtitle="Vos affectations à venir"
            action={
              <Link href="/app/team/planning">
                <Button variant="outline" size="sm">Voir tout</Button>
              </Link>
            }
            icon={<CalendarIcon className="h-5 w-5 text-[#3244c7]" />}
          />
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 animate-pulse">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                    <div className="h-3 bg-gray-200 rounded w-36"></div>
                  </div>
                </div>
              ))
            ) : upcomingServices.length > 0 ? (
              upcomingServices.map((service) => (
                <div key={service.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{service.type}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        service.status === 'confirmé' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(service.date).toLocaleDateString('fr-FR')} à {service.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Rôle :</strong> {service.role}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Répétition : {new Date(service.rehearsal.split(' ')[0]).toLocaleDateString('fr-FR')} {service.rehearsal.split(' ')[2]}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun service programmé</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Uploads */}
        <Card>
          <CardHeader 
            title="Mes Enregistrements Récents" 
            subtitle="Vos derniers uploads"
            action={
              <Link href="/app/music/upload">
                <Button variant="outline" size="sm">Nouveau Upload</Button>
              </Link>
            }
            icon={<CloudArrowUpIcon className="h-5 w-5 text-[#3244c7]" />}
          />
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 animate-pulse">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : recentUploads.length > 0 ? (
              recentUploads.map((upload) => (
                <div key={upload.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{upload.song}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      upload.status === 'approuvé' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {upload.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{upload.instrument}</span>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <PlayIcon className="h-3 w-3 mr-1" />
                        {upload.plays}
                      </span>
                      <span>{new Date(upload.uploadedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CloudArrowUpIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun enregistrement récent</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity / Notifications */}
      <Card>
        <CardHeader 
          title="Activité Récente" 
          subtitle="Dernières mises à jour de l'équipe"
          icon={<ExclamationTriangleIcon className="h-5 w-5 text-[#3244c7]" />}
        />
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            ))
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => {
              const bgColor = activity.type === 'success' ? 'bg-green-50' : 
                            activity.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50';
              const dotColor = activity.type === 'success' ? 'bg-green-500' : 
                             activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
              
              return (
                <div key={activity.id} className={`flex items-center space-x-3 p-3 ${bgColor} rounded-lg`}>
                  <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
                  <p className="text-sm text-gray-700 flex-1">{activity.message}</p>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucune activité récente</p>
            </div>
          )}
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-6">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}