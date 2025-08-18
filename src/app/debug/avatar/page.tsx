'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function AvatarDebugPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const testUpload = async () => {
    if (!file) {
      setError('Aucun fichier sélectionné');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔍 Test upload avatar...');
      console.log('📁 Fichier:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const formData = new FormData();
      formData.append('avatar', file);

      console.log('📤 Envoi vers /api/users/avatar...');

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      
      console.log('📥 Réponse:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

      if (response.ok) {
        setResult(responseData);
        console.log('✅ Upload réussi:', responseData);
      } else {
        setError(responseData.error || 'Erreur inconnue');
        console.error('❌ Erreur upload:', responseData);
      }

    } catch (error) {
      console.error('❌ Erreur fetch:', error);
      setError(error instanceof Error ? error.message : 'Erreur réseau');
    } finally {
      setUploading(false);
    }
  };

  const testStorageConfig = async () => {
    try {
      console.log('🔍 Test configuration stockage...');
      
      const response = await fetch('/api/debug/storage-info');
      const data = await response.json();
      
      console.log('📊 Configuration stockage:', data);
      setResult({ storageConfig: data });
      
    } catch (error) {
      console.error('❌ Erreur test stockage:', error);
      setError('Erreur test stockage');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          🐛 Debug Upload Avatar
        </h1>

        {/* Informations de session */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Session utilisateur</h3>
          <p><strong>ID:</strong> {session?.user?.id || 'Non connecté'}</p>
          <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
          <p><strong>Church ID:</strong> {session?.user?.churchId || 'N/A'}</p>
        </div>

        {/* Sélection de fichier */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un avatar (JPEG, PNG, WebP, max 5MB)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          
          {file && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p><strong>Nom:</strong> {file.name}</p>
              <p><strong>Taille:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>Type:</strong> {file.type}</p>
            </div>
          )}
        </div>

        {/* Boutons de test */}
        <div className="mb-6 space-y-3">
          <button
            onClick={testUpload}
            disabled={!file || uploading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Upload en cours...' : '📤 Tester l\'upload avatar'}
          </button>

          <button
            onClick={testStorageConfig}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700"
          >
            🔧 Tester la configuration stockage
          </button>
        </div>

        {/* Résultats */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">❌ Erreur</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">✅ Résultat</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Instructions de debug</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Vérifiez que vous êtes connecté</li>
            <li>2. Sélectionnez un fichier image (JPEG, PNG, WebP)</li>
            <li>3. Testez l'upload et vérifiez les logs dans la console</li>
            <li>4. Testez la configuration stockage pour voir le système utilisé</li>
            <li>5. Vérifiez les erreurs dans les Developer Tools (F12)</li>
          </ol>
        </div>

        {/* Erreurs communes */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">🔍 Erreurs communes</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>401 Non autorisé:</strong> Session expirée, reconnectez-vous</li>
            <li>• <strong>400 Type non supporté:</strong> Utilisez JPEG, PNG ou WebP</li>
            <li>• <strong>400 Trop volumineux:</strong> Fichier &gt; 5MB</li>
            <li>• <strong>500 Erreur serveur:</strong> Problème de configuration stockage</li>
            <li>• <strong>Network error:</strong> Problème de connexion</li>
          </ul>
        </div>
      </div>
    </div>
  );
}