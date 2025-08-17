'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ChatDebugInfo {
  eventId: string;
  userId?: string;
  messagesCount: number;
  lastError?: string;
  apiResponse?: any;
}

export default function ChatDebugPage() {
  const { data: session } = useSession();
  const [eventId, setEventId] = useState('');
  const [debugInfo, setDebugInfo] = useState<ChatDebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('Test message de debug');

  const testChatAPI = async () => {
    if (!eventId.trim()) {
      alert('Veuillez entrer un ID d\'événement');
      return;
    }

    setLoading(true);
    setDebugInfo(null);

    try {
      // Test GET messages
      console.log('🔍 Test GET /api/events/' + eventId + '/messages');
      const getResponse = await fetch(`/api/events/${eventId}/messages`);
      const getResult = await getResponse.json();
      
      console.log('📥 Réponse GET:', getResult);

      // Test POST message
      console.log('📤 Test POST message...');
      const postResponse = await fetch(`/api/events/${eventId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: testMessage,
          parentId: null
        }),
      });

      const postResult = await postResponse.json();
      console.log('📥 Réponse POST:', postResult);

      // Récupérer les messages à nouveau
      const getResponse2 = await fetch(`/api/events/${eventId}/messages`);
      const getResult2 = await getResponse2.json();

      setDebugInfo({
        eventId,
        userId: session?.user?.id,
        messagesCount: Array.isArray(getResult2) ? getResult2.length : 0,
        lastError: !postResponse.ok ? postResult.error : undefined,
        apiResponse: {
          getFirst: getResult,
          post: postResult,
          getAfter: getResult2
        }
      });

    } catch (error) {
      console.error('❌ Erreur debug:', error);
      setDebugInfo({
        eventId,
        messagesCount: 0,
        lastError: error instanceof Error ? error.message : 'Erreur inconnue',
        apiResponse: null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          🐛 Debug Chat Système
        </h1>

        {/* Informations de session */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Session utilisateur</h3>
          <p><strong>ID:</strong> {session?.user?.id || 'Non connecté'}</p>
          <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
          <p><strong>Nom:</strong> {session?.user?.name || 'N/A'}</p>
        </div>

        {/* Test du chat */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID de l'événement à tester
          </label>
          <input
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="ex: clxxxxx..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message de test
          </label>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={testChatAPI}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Test en cours...' : '🧪 Tester le Chat API'}
        </button>

        {/* Résultats */}
        {debugInfo && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Résultats</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Événement ID:</strong> {debugInfo.eventId}</p>
                <p><strong>Utilisateur ID:</strong> {debugInfo.userId}</p>
                <p><strong>Nombre de messages:</strong> {debugInfo.messagesCount}</p>
                {debugInfo.lastError && (
                  <p className="text-red-600"><strong>Erreur:</strong> {debugInfo.lastError}</p>
                )}
              </div>
            </div>

            {debugInfo.apiResponse && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🔍 Réponses API</h3>
                <pre className="bg-gray-800 text-green-400 p-4 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(debugInfo.apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Instructions</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Entrez l'ID d'un événement existant</li>
            <li>2. Cliquez sur "Tester le Chat API"</li>
            <li>3. Vérifiez les réponses dans la console et les résultats</li>
            <li>4. Si ça fonctionne ici, le problème vient du composant EventChat</li>
            <li>5. Si ça ne fonctionne pas, le problème vient de l'API ou de la base</li>
          </ol>
        </div>
      </div>
    </div>
  );
}