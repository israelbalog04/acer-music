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
  EyeIcon
} from '@heroicons/react/24/outline';

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [topAssignedMusicians, setTopAssignedMusicians] = useState<any[]>([]);
  const [topSongs, setTopSongs] = useState<any[]>([]);
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
      const response = await fetch(`/api/admin/analytics?days=${days}`);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setTopAssignedMusicians(data.topAssignedMusicians);
        setTopSongs(data.topSongs);
        setTopContributors(data.topContributors);
        setRecentActivity(data.recentActivity);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return { icon: UsersIcon, color: 'text-green-600' };
      case 'recording': return { icon: CloudArrowUpIcon, color: 'text-blue-600' };
      case 'event': return { icon: CalendarIcon, color: 'text-purple-600' };
      default: return { icon: MusicalNoteIcon, color: 'text-yellow-600' };
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <RoleGuard allowedRoles={[UserRole.ADMIN]}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des statistiques...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

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
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activité Récente */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Activité Récente</h3>
              <p className="text-sm text-gray-600">Dernières actions sur la plateforme</p>
            </div>
            <div className="mt-4 space-y-4">
              {recentActivity.map((activity, index) => {
                const { icon: Icon, color } = getActivityIcon(activity.type);
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top Chansons */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chansons Populaires</h3>
              <p className="text-sm text-gray-600">Les plus écoutées ce mois</p>
            </div>
            <div className="mt-4 space-y-3">
              {topSongs.map((song, index) => (
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
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Musiciens Programmés */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Musiciens les Plus Programmés</h3>
              <p className="text-sm text-gray-600">Basé sur les affectations d'équipes</p>
            </div>
            <div className="mt-4 space-y-3">
              {topAssignedMusicians.map((musician, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-800">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{musician.name}</p>
                      <p className="text-xs text-gray-500">{musician.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{musician.assignments}</p>
                    <p className="text-xs text-gray-500">affectations</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Contributeurs */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Contributeurs</h3>
              <p className="text-sm text-gray-600">Uploads de photos/vidéos</p>
            </div>
            <div className="mt-4 space-y-3">
              {topContributors.map((contributor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-800">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contributor.name}</p>
                      <p className="text-xs text-gray-500">{contributor.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{contributor.uploads}</p>
                    <p className="text-xs text-gray-500">uploads</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Graphique de Performance */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Mensuelle</h3>
              <p className="text-sm text-gray-600">Évolution des uploads</p>
            </div>
            <div className="mt-4 h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Graphique à implémenter</p>
                <p className="text-xs text-gray-400">Chart.js ou Recharts</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}