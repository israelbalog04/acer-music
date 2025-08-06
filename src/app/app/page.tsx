'use client';

import Link from 'next/link';
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

export default function DashboardPage() {
  // Données simulées
  const stats = [
    {
      title: 'Mes Enregistrements',
      value: 12,
      change: { value: '+2 cette semaine', trend: 'up' as const },
      icon: <MusicalNoteIcon className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'Services ce mois',
      value: 4,
      change: { value: '2 à venir', trend: 'neutral' as const },
      icon: <CalendarIcon className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Répertoire total',
      value: 156,
      change: { value: '+8 nouveaux', trend: 'up' as const },
      icon: <MusicalNoteIcon className="h-6 w-6" />,
      color: 'purple' as const
    },
    {
      title: 'Équipe active',
      value: 24,
      change: { value: '18 disponibles', trend: 'neutral' as const },
      icon: <UsersIcon className="h-6 w-6" />,
      color: 'orange' as const
    }
  ];

  const upcomingServices = [
    {
      id: 1,
      date: '2024-01-14',
      time: '10:30',
      type: 'Culte du Dimanche',
      role: 'Guitariste Principal',
      status: 'confirmé',
      rehearsal: '2024-01-13 à 15:00'
    },
    {
      id: 2,
      date: '2024-01-21',
      time: '10:30',
      type: 'Culte du Dimanche',
      role: 'Guitariste Principal',
      status: 'en-attente',
      rehearsal: '2024-01-20 à 15:00'
    },
    {
      id: 3,
      date: '2024-01-28',
      time: '18:00',
      type: 'Soirée de Louange',
      role: 'Guitariste',
      status: 'confirmé',
      rehearsal: '2024-01-27 à 16:00'
    }
  ];

  const recentUploads = [
    {
      id: 1,
      song: 'Amazing Grace',
      instrument: 'Guitare Électrique',
      uploadedAt: '2024-01-10',
      plays: 15,
      status: 'approuvé'
    },
    {
      id: 2,
      song: 'How Great Thou Art',
      instrument: 'Guitare Acoustique',
      uploadedAt: '2024-01-08',
      plays: 23,
      status: 'approuvé'
    },
    {
      id: 3,
      song: 'Blessed Be Your Name',
      instrument: 'Guitare Électrique',
      uploadedAt: '2024-01-05',
      plays: 8,
      status: 'en-attente'
    }
  ];

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
          Bonjour John ! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Voici un aperçu de votre activité musicale à Acer Paris
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`animate-scaleIn hover-lift animate-delay-${index * 100}`}
          >
            <StatCard {...stat} />
          </div>
        ))}
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
            {upcomingServices.map((service) => (
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
            ))}
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
            {recentUploads.map((upload) => (
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
            ))}
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
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-gray-700">
              <strong>Marie Dubois</strong> a uploadé une nouvelle version piano pour "Great is Thy Faithfulness"
            </p>
            <span className="text-xs text-gray-500 ml-auto">Il y a 2h</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-700">
              Nouveau planning publié pour le service du <strong>21 janvier</strong>
            </p>
            <span className="text-xs text-gray-500 ml-auto">Il y a 5h</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-sm text-gray-700">
              <strong>3 nouveaux chants</strong> ajoutés au répertoire cette semaine
            </p>
            <span className="text-xs text-gray-500 ml-auto">Hier</span>
          </div>
        </div>
      </Card>
    </div>
  );
}