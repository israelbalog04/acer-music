'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ArchiveBoxIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'ACTION' | 'WARNING' | 'SUCCESS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  actionType: string | null;
  actionId: string | null;
  actionUrl: string | null;
  createdBy: {
    firstName: string;
    lastName: string;
  } | null;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter, typeFilter, priorityFilter, searchTerm]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Filtre par statut
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    // Filtre par priorité
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(n => n.priority === priorityFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, isRead: true })
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = filteredNotifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(notif => markAsRead(notif.id))
      );
    } catch (error) {
      console.error('Erreur lors du marquage global:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
      setSelectedNotifications([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error);
    }
  };

  const markSelectedAsRead = async () => {
    try {
      await Promise.all(selectedNotifications.map(id => markAsRead(id)));
      setSelectedNotifications([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Erreur lors du marquage multiple:', error);
    }
  };

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const deselectAll = () => {
    setSelectedNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INFO':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'ACTION':
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      case 'WARNING':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'SUCCESS':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'border-l-red-500 bg-gradient-to-r from-red-50 to-red-25';
      case 'HIGH':
        return 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-orange-25';
      case 'MEDIUM':
        return 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-blue-25';
      case 'LOW':
        return 'border-l-gray-500 bg-gradient-to-r from-gray-50 to-gray-25';
      default:
        return 'border-l-gray-500 bg-gradient-to-r from-gray-50 to-gray-25';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full priority-badge">Urgent</span>;
      case 'HIGH':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full priority-badge">Élevée</span>;
      case 'MEDIUM':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full priority-badge">Moyenne</span>;
      case 'LOW':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full priority-badge">Faible</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const selectedCount = selectedNotifications.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <BellIcon className="h-10 w-10 text-purple-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Toutes les notifications sont lues'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  placeholder="Rechercher dans les notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Toutes</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tous types</option>
                <option value="INFO">Information</option>
                <option value="ACTION">Action</option>
                <option value="WARNING">Avertissement</option>
                <option value="SUCCESS">Succès</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Toutes priorités</option>
                <option value="URGENT">Urgente</option>
                <option value="HIGH">Élevée</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="LOW">Faible</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckIcon className="h-5 w-5 text-purple-600" />
              <span className="text-purple-800 font-medium">
                {selectedCount} notification(s) sélectionnée(s)
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={markSelectedAsRead}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                Marquer comme lu
              </Button>
              <Button
                onClick={deleteSelected}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center">
          <BellIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
              ? 'Aucune notification ne correspond à vos critères'
              : 'Aucune notification'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
              ? 'Essayez de modifier vos filtres de recherche.'
              : 'Vous recevrez ici les notifications importantes.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedCount === filteredNotifications.length && selectedCount > 0}
                onChange={selectedCount === filteredNotifications.length ? deselectAll : selectAll}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">
                {selectedCount > 0 ? `${selectedCount} sélectionnée(s)` : 'Sélectionner tout'}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {filteredNotifications.length} notification(s)
            </span>
          </div>

          {/* Notifications */}
          {filteredNotifications.map((notification, index) => (
            <Card
              key={notification.id}
              className={`transition-all duration-200 hover:shadow-md ${
                !notification.isRead ? 'ring-2 ring-purple-200' : ''
              } ${getPriorityColor(notification.priority)}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-sm font-semibold ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </h3>
                                                                                {getPriorityBadge(notification.priority)}
                           {!notification.isRead && (
                            <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        
                        <p className={`text-sm ${
                          !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {formatDate(notification.createdAt)}
                          </div>
                          {notification.createdBy && (
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              {notification.createdBy.firstName} {notification.createdBy.lastName}
                            </div>
                          )}
                        </div>
                        
                        {notification.actionUrl && (
                          <div className="mt-3">
                            <Link
                              href={notification.actionUrl}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
                            >
                              <ArrowTopRightOnSquareIcon className="h-3 w-3 mr-1" />
                              Voir détails
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 ml-4">
                        {!notification.isRead && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-green-600"
                            title="Marquer comme lu"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => deleteNotification(notification.id)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-600"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}