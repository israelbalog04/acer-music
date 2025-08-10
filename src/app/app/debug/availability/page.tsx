'use client';

import { useState, useEffect } from 'react';
import { useUserData } from '@/hooks/useUserData';

interface DebugEvent {
  id: string;
  title: string;
  date: string;
  dateFormatted: string;
  dateLocal: string;
  isUpcoming: boolean;
  daysFromNow: number;
}

interface DebugInfo {
  session: any;
  database: any;
  currentTime: any;
  events: DebugEvent[];
  upcomingEventsPreview: DebugEvent[];
  error?: string;
}

export default function DebugAvailabilityPage() {
  const { userName, userId, churchName } = useUserData();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/debug/events');
        const data = await response.json();
        setDebugInfo(data);
      } catch (error) {
        console.error('Error:', error);
        setDebugInfo({
          session: { exists: false },
          database: {},
          currentTime: {},
          events: [],
          upcomingEventsPreview: [],
          error: 'Erreur de connexion'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">🔧 Debug - Disponibilités par Événement</h1>
      
      {/* Info utilisateur */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">👤 Session Utilisateur</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Nom:</strong> {userName}</div>
          <div><strong>ID:</strong> {userId}</div>
          <div><strong>Église:</strong> {churchName}</div>
          <div><strong>Session API:</strong> {debugInfo?.session.exists ? '✅ OK' : '❌ Manquante'}</div>
        </div>
      </div>

      {/* Info debug API */}
      {debugInfo && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">🔍 Info Debug API</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><strong>Total événements:</strong> {debugInfo.database?.totalEvents || 0}</div>
            <div><strong>Événements à venir:</strong> {debugInfo.database?.upcomingEvents || 0}</div>
            <div><strong>Événements passés:</strong> {debugInfo.database?.pastEvents || 0}</div>
          </div>
          
          <div className="mt-4">
            <strong>Heure actuelle:</strong> {debugInfo.currentTime?.nowLocal}
          </div>
        </div>
      )}

      {/* Erreur */}
      {debugInfo?.error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">❌ Erreur</h2>
          <p className="text-red-600">{debugInfo.error}</p>
        </div>
      )}

      {/* Événements à venir */}
      {debugInfo?.upcomingEventsPreview && debugInfo.upcomingEventsPreview.length > 0 ? (
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800 mb-4">📅 Événements à Venir</h2>
          <div className="space-y-3">
            {debugInfo.upcomingEventsPreview.map(event => (
              <div key={event.id} className="border border-green-200 p-3 rounded bg-white">
                <div className="font-medium text-gray-900">{event.title}</div>
                <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-2">
                  <div><strong>Date locale:</strong> {event.dateLocal}</div>
                  <div><strong>Dans:</strong> {event.daysFromNow} jours</div>
                  <div><strong>ID:</strong> {event.id}</div>
                  <div><strong>À venir:</strong> {event.isUpcoming ? '✅ Oui' : '❌ Non'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Aucun Événement à Venir</h2>
          <p className="text-yellow-600">
            Il n'y a aucun événement à venir trouvé. Cela peut expliquer pourquoi vous ne pouvez pas donner vos disponibilités.
          </p>
        </div>
      )}

      {/* Tous les événements (debug) */}
      {debugInfo?.events && debugInfo.events.length > 0 && (
        <details className="bg-gray-50 p-4 rounded-lg">
          <summary className="cursor-pointer font-semibold">🔍 Tous les Événements (Debug)</summary>
          <div className="mt-4 space-y-2">
            {debugInfo.events.map(event => (
              <div key={event.id} className="text-xs bg-white p-2 rounded border">
                <div><strong>Titre:</strong> {event.title}</div>
                <div><strong>Date brute:</strong> {event.date}</div>
                <div><strong>Date formatée:</strong> {event.dateFormatted}</div>
                <div><strong>Date locale:</strong> {event.dateLocal}</div>
                <div><strong>À venir:</strong> {event.isUpcoming ? '✅' : '❌'}</div>
                <div><strong>Dans:</strong> {event.daysFromNow} jours</div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* JSON brut */}
      <details className="bg-gray-100 p-4 rounded-lg">
        <summary className="cursor-pointer font-semibold">📋 JSON Debug Complet</summary>
        <pre className="mt-4 text-xs overflow-auto bg-white p-4 rounded border">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>
    </div>
  );
}