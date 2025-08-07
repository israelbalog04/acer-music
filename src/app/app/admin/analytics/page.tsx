'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import {
  ChartBarIcon,
  UsersIcon,
  MusicalNoteIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  users: {
    total: number;
    new: number;
    active: number;
    growth: number;
  };
  recordings: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    growth: number;
  };
  songs: {
    total: number;
    popular: number;
    recent: number;
    growth: number;
  };
  events: {
    total: number;
    upcoming: number;
    completed: number;
    attendance: number;
  };
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: React.ElementType;
  color: string;
}

interface TopSong {
  name: string;
  plays: number;
  trend: 'up' | 'down' | 'stable';
}

interface TopUser {
  name: string;
  uploads: number;
  role: string;
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [topSongs, setTopSongs] = useState<TopSong[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel API pour les statistiques générales
      const [statsRes, activityRes, songsRes, usersRes] = await Promise.all([
        fetch(`/api/admin/analytics/stats?dateRange=${dateRange}`),
        fetch(`/api/admin/analytics/activity?dateRange=${dateRange}`),
        fetch(`/api/admin/analytics/top-songs?dateRange=${dateRange}`),
        fetch(`/api/admin/analytics/top-users?dateRange=${dateRange}`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData.map((activity: any) => ({
          ...activity,
          icon: getIconForActivityType(activity.type),
          color: getColorForActivityType(activity.type)
        })));
      }

      if (songsRes.ok) {
        const songsData = await songsRes.json();
        setTopSongs(songsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setTopUsers(usersData);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getIconForActivityType = (type: string) => {
    switch (type) {
      case 'user_created': return UsersIcon;
      case 'recording_uploaded': return CloudArrowUpIcon;
      case 'event_created': return CalendarIcon;
      case 'song_added': return MusicalNoteIcon;
      default: return EyeIcon;
    }
  };

  const getColorForActivityType = (type: string) => {
    switch (type) {
      case 'user_created': return 'text-green-600';
      case 'recording_uploaded': return 'text-blue-600';
      case 'event_created': return 'text-purple-600';
      case 'song_added': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const StatCard = ({ title, value, subtitle, growth, icon: Icon, color }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {growth > 0 ? (
          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
        ) : growth < 0 ? (
          <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
        ) : null}
        <span className={`text-sm font-medium ${
          growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600'
        }`}>
          {growth > 0 ? '+' : ''}{growth}% vs mois précédent
        </span>
      </div>
    </Card>
  );

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3 text-red-600" />
              Analytics & Statistiques
            </h1>
            <p className="text-gray-600 mt-2">
              Vue d'ensemble des performances et de l'activité
            </p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">1 année</option>
          </select>
        </div>

        {/* Statistiques Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats ? (
            <>
              <StatCard
                title="Utilisateurs"
                value={stats.users.total}
                subtitle={`${stats.users.active} actifs, ${stats.users.new} nouveaux`}
                growth={stats.users.growth}
                icon={UsersIcon}
                color="bg-blue-600"
              />
              <StatCard
                title="Enregistrements"
                value={stats.recordings.total}
                subtitle={`${stats.recordings.approved} approuvés, ${stats.recordings.pending} en attente`}
                growth={stats.recordings.growth}
                icon={CloudArrowUpIcon}
                color="bg-green-600"
              />
              <StatCard
                title="Répertoire"
                value={stats.songs.total}
                subtitle={`${stats.songs.popular} populaires, ${stats.songs.recent} récentes`}
                growth={stats.songs.growth}
                icon={MusicalNoteIcon}
                color="bg-yellow-600"
              />
              <StatCard
                title="Événements"
                value={stats.events.total}
                subtitle={`${stats.events.upcoming} à venir, ${stats.events.attendance}% présence`}
                growth={0}
                icon={CalendarIcon}
                color="bg-purple-600"
              />
            </>
          ) : (
            // Skeleton loading states
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activité Récente */}
          <Card className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Activité Récente</h3>
              <p className="text-sm text-gray-600">Dernières actions sur la plateforme</p>
            </CardHeader>
            <div className="mt-4 space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <EyeIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Aucune activité récente</p>
                </div>
              )}
            </div>
          </Card>

          {/* Top Chansons */}
          <Card className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Chansons Populaires</h3>
              <p className="text-sm text-gray-600">Les plus écoutées ce mois</p>
            </CardHeader>
            <div className="mt-4 space-y-3">
              {topSongs.length > 0 ? (
                topSongs.map((song, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-yellow-800">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{song.name}</p>
                        <p className="text-xs text-gray-500">{song.plays} écoutes</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {song.trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />}
                      {song.trend === 'down' && <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MusicalNoteIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Aucune chanson populaire</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Contributeurs */}
          <Card className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Top Contributeurs</h3>
              <p className="text-sm text-gray-600">Utilisateurs les plus actifs</p>
            </CardHeader>
            <div className="mt-4 space-y-3">
              {topUsers.length > 0 ? (
                topUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-800">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user.uploads}</p>
                      <p className="text-xs text-gray-500">uploads</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UsersIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Aucun contributeur actif</p>
                </div>
              )}
            </div>
          </Card>

          {/* Graphique de Performance */}
          <Card className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Performance Mensuelle</h3>
              <p className="text-sm text-gray-600">Évolution des uploads</p>
            </CardHeader>
            <div className="mt-4 h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Graphique à implémenter</p>
                <p className="text-xs text-gray-400">Chart.js ou Recharts</p>
              </div>
            </div>
          </Card>
        </div>

        {error && (
          <Card className="p-6">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchAnalyticsData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </Card>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement des données...</p>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}