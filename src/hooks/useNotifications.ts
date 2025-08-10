'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function useNotifications() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/notifications?unread=true&limit=1000');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(Array.isArray(data) ? data.length : 0);
      } else {
        console.error('Erreur lors du chargement des notifications:', response.status);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetchUnreadCount();
    }
  }, [session, fetchUnreadCount]);

  // Rafraîchir le compteur toutes les 30 secondes
  useEffect(() => {
    if (!session?.user) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [session, fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    refetch: fetchUnreadCount
  };
}