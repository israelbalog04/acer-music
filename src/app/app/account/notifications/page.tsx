'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function NotificationsPage() {
  const [selectedFilter, setSelectedFilter] = useState('toutes');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  // Données simulées des notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'service',
      title: 'Nouvelle affectation',
      message: 'Vous êtes programmé comme guitariste principal pour le service du 21 janvier 2024.',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      priority: 'high',
      actionRequired: true,
      metadata: {
        serviceDate: '2024-01-21',
        serviceType: 'Culte du Dimanche',
        role: 'Guitariste Principal'
      }
    },
    {
      id: 2,
      type: 'upload',
      title: 'Enregistrement approuvé',
      message: 'Votre version guitare de "Amazing Grace" a été approuvée et est maintenant disponible pour l\'équipe.',
      timestamp: '2024-01-14T16:45:00Z',
      isRead: false,
      priority: 'medium',
      actionRequired: false,
      metadata: {
        song: 'Amazing Grace',
        instrument: 'Guitare',
        rating: 4.6
      }
    },
    {
      id: 3,
      type: 'rehearsal',
      title: 'Rappel de répétition',
      message: 'Répétition demain à 15h00 en salle de répétition. Merci de confirmer votre présence.',
      timestamp: '2024-01-13T09:00:00Z',
      isRead: true,
      priority: 'high',
      actionRequired: true,
      metadata: {
        date: '2024-01-14',
        time: '15:00',
        location: 'Salle de répétition'
      }
    },
    {
      id: 4,
      type: 'team',
      title: 'Nouveau membre',
      message: 'Claire Bernard (violoniste) a rejoint l\'équipe musicale. Souhaitez-lui la bienvenue !',
      timestamp: '2024-01-12T14:20:00Z',
      isRead: true,
      priority: 'low',
      actionRequired: false,
      metadata: {
        newMember: 'Claire Bernard',
        instrument: 'Violon'
      }
    },
    {
      id: 5,
      type: 'system',
      title: 'Mise à jour du répertoire',
      message: '5 nouveaux chants ont été ajoutés au répertoire cette semaine. Explorez les nouvelles partitions.',
      timestamp: '2024-01-11T11:15:00Z',
      isRead: true,
      priority: 'low',
      actionRequired: false,
      metadata: {
        newSongsCount: 5
      }
    },
    {
      id: 6,
      type: 'upload',
      title: 'Enregistrement en attente',
      message: 'Votre version de "Blessed Be Your Name" est en cours de modération.',
      timestamp: '2024-01-10T08:30:00Z',
      isRead: true,
      priority: 'medium',
      actionRequired: false,
      metadata: {
        song: 'Blessed Be Your Name',
        instrument: 'Guitare Électrique',
        status: 'en-attente'
      }
    },
    {
      id: 7,
      type: 'service',
      title: 'Changement de planning',
      message: 'Le service du 28 janvier a été déplacé à 18h00 au lieu de 10h30.',
      timestamp: '2024-01-09T17:45:00Z',
      isRead: true,
      priority: 'high',
      actionRequired: true,
      metadata: {
        serviceDate: '2024-01-28',
        oldTime: '10:30',
        newTime: '18:00'
      }
    },
    {
      id: 8,
      type: 'feedback',
      title: 'Retour sur votre performance',
      message: 'Excellente prestation lors du service du 7 janvier ! Note attribuée : 4.8/5',
      timestamp: '2024-01-08T20:00:00Z',
      isRead: true,
      priority: 'medium',
      actionRequired: false,
      metadata: {
        serviceDate: '2024-01-07',
        rating: 4.8,
        feedback: 'Excellente prestation, très bon lead sur Amazing Grace'
      }
    }
  ]);

  const filters = [
    { id: 'toutes', name: 'Toutes', count: notifications.length },
    { id: 'non-lues', name: 'Non lues', count: notifications.filter(n => !n.isRead).length },
    { id: 'service', name: 'Services', count: notifications.filter(n => n.type === 'service').length },
    { id: 'upload', name: 'Uploads', count: notifications.filter(n => n.type === 'upload').length },
    { id: 'rehearsal', name: 'Répétitions', count: notifications.filter(n => n.type === 'rehearsal').length },
    { id: 'team', name: 'Équipe', count: notifications.filter(n => n.type === 'team').length },
  ];

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-5 w-5 ${
      priority === 'high' ? 'text-red-600' : 
      priority === 'medium' ? 'text-yellow-600' : 
      'text-blue-600'
    }`;

    switch (type) {
      case 'service':
        return <CalendarIcon className={iconClass} />;
      case 'upload':
        return <MusicalNoteIcon className={iconClass} />;
      case 'rehearsal':
        return <ClockIcon className={iconClass} />;
      case 'team':
        return <UserGroupIcon className={iconClass} />;
      case 'feedback':
        return <CheckCircleIcon className={iconClass} />;
      case 'system':
        return <InformationCircleIcon className={iconClass} />;
      default:
        return <BellIcon className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'toutes') return true;
    if (selectedFilter === 'non-lues') return !notification.isRead;
    return notification.type === selectedFilter;
  });

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const toggleSelectNotification = (notificationId: number) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    return time.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Centre de messages et alertes de votre activité musicale
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckIcon className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
          {selectedNotifications.length > 0 && (
            <Button variant="outline" onClick={deleteSelected}>
              <TrashIcon className="h-4 w-4 mr-2" />
              Supprimer ({selectedNotifications.length})
            </Button>
          )}
          <Button variant="outline">
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtrer par :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedFilter === filter.id
                    ? 'bg-[#3244c7] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {filter.name} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
              <p className="text-gray-500">
                {selectedFilter === 'toutes' 
                  ? 'Vous n\'avez pas de notifications pour le moment.'
                  : `Aucune notification dans la catégorie "${filters.find(f => f.id === selectedFilter)?.name}".`
                }
              </p>
            </div>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`
                border-l-4 transition-all hover:shadow-md cursor-pointer
                ${getPriorityColor(notification.priority)}
                ${!notification.isRead ? 'bg-opacity-100' : 'bg-opacity-30'}
              `}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Selection checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelectNotification(notification.id)}
                    className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7] mt-1"
                  />

                  {/* Notification icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`text-base font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-[#3244c7] rounded-full"></div>
                          )}
                          {notification.actionRequired && (
                            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                              Action requise
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${!notification.isRead ? 'text-gray-800' : 'text-gray-600'} mb-2`}>
                          {notification.message}
                        </p>

                        {/* Metadata */}
                        {notification.metadata && (
                          <div className="text-xs text-gray-500 space-y-1">
                            {notification.type === 'service' && notification.metadata.serviceDate && (
                              <p>📅 Service : {new Date(notification.metadata.serviceDate).toLocaleDateString('fr-FR')} - {notification.metadata.role}</p>
                            )}
                            {notification.type === 'upload' && notification.metadata.song && (
                              <p>🎵 Chant : {notification.metadata.song} ({notification.metadata.instrument})</p>
                            )}
                            {notification.type === 'rehearsal' && notification.metadata.date && (
                              <p>🎯 Répétition : {new Date(notification.metadata.date).toLocaleDateString('fr-FR')} à {notification.metadata.time}</p>
                            )}
                            {notification.type === 'feedback' && notification.metadata.rating && (
                              <p>⭐ Note : {notification.metadata.rating}/5</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            title="Marquer comme lu"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {notification.actionRequired && (
                      <div className="mt-3 flex items-center space-x-2">
                        {notification.type === 'service' && (
                          <>
                            <Button size="sm">Confirmer participation</Button>
                            <Button variant="outline" size="sm">Voir détails</Button>
                          </>
                        )}
                        {notification.type === 'rehearsal' && (
                          <>
                            <Button size="sm">Confirmer présence</Button>
                            <Button variant="outline" size="sm">Plus d'infos</Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredNotifications.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Charger plus de notifications
          </Button>
        </div>
      )}
    </div>
  );
}