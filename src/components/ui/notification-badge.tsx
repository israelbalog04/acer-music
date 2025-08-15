'use client';

import { useState, useEffect, useCallback } from 'react';
import { BellIcon, EyeIcon, ArrowTopRightOnSquareIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
}

interface NotificationBadgeProps {
  onNotificationUpdate?: () => void;
}

export default function NotificationBadge({ onNotificationUpdate }: NotificationBadgeProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications?unread=true&limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.length);
        // Notifier le parent du changement
        onNotificationUpdate?.();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onNotificationUpdate]);

  useEffect(() => {
    fetchNotifications();
    // Pas de polling ici car le hook useNotifications s'en charge déjà
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, isRead: true })
      });

      if (response.ok) {
        // Mettre à jour l'état local
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
        // Notifier le parent du changement
        onNotificationUpdate?.();
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setShowDropdown(false);
    
    // Rediriger si une URL d'action est spécifiée
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-blue-500';
      case 'LOW': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return '✅';
      case 'WARNING': return '⚠️';
      case 'ACTION': return '🎯';
      default: return 'ℹ️';
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

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:bg-gray-100 rounded-lg group"
      >
        <BellIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center notification-badge shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-3 w-80 lg:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden notification-dropdown" style={{ transform: 'translateX(calc(-100% + 2.5rem))' }}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <BellIcon className="h-4 w-4 text-purple-600" />
                Notifications ({unreadCount})
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    notifications.forEach(n => markAsRead(n.id));
                  }}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
          </div>
          
          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Aucune nouvelle notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification, index) => (
                                     <div
                     key={notification.id}
                     className="p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer group notification-item"
                     style={{ animationDelay: `${index * 50}ms` }}
                   >
                    <div className="flex items-start space-x-3">
                      {/* Priority indicator */}
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getPriorityColor(notification.priority)}`}></div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{getTypeIcon(notification.type)}</span>
                              <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                                {notification.title}
                              </h4>
                            </div>
                            
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-3 text-xs text-gray-400">
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
                              <div className="mt-2">
                                <span className="inline-flex items-center text-xs text-purple-600 font-medium">
                                  <ArrowTopRightOnSquareIcon className="h-3 w-3 mr-1" />
                                  Voir détails
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                              title="Marquer comme lu"
                            >
                              <EyeIcon className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Click overlay */}
                    <div 
                      className="absolute inset-0"
                      onClick={() => handleNotificationClick(notification)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  window.location.href = '/app/notifications';
                }}
                className="w-full text-center text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
