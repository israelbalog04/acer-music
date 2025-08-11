'use client';

import { useState } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CalendarIcon,
  CheckCircleIcon,
  PlayIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface SundayPreview {
  date: Date;
  exists: boolean;
  title: string;
}

interface GenerateResponse {
  message: string;
  events: any[];
}

export default function GenerateSundaysPage() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<SundayPreview[]>([]);
  const [months, setMonths] = useState(3);
  const [generated, setGenerated] = useState<GenerateResponse | null>(null);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/generate-sundays?months=${months}`);
      if (response.ok) {
        const data = await response.json();
        setPreview(data.preview);
      } else {
        alert('Erreur lors du chargement du preview');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const generateSundays = async () => {
    if (!confirm(`Générer tous les dimanches pour les ${months} prochains mois ?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/events/generate-sundays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months })
      });

      if (response.ok) {
        const data = await response.json();
        setGenerated(data);
        // Recharger le preview
        await fetchPreview();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    }).format(d);
  };

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="h-8 w-8 mr-3 text-blue-600" />
            Générer les Dimanches
          </h1>
          <p className="text-gray-600 mt-2">
            Générez automatiquement tous les dimanches avec 5 cultes chacun pour que les musiciens puissent donner leur disponibilité
          </p>
        </div>

        {/* Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Comment ça marche :</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Choisissez combien de mois à l'avance générer</li>
                <li>Visualisez quels dimanches seront créés (chacun avec 5 cultes)</li>
                <li>Lancez la génération automatique</li>
                <li>Les musiciens pourront choisir : 2 premiers cultes, 3 derniers cultes, ou tous les cultes</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Configuration */}
        <Card>
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Générer pour les prochains mois
              </label>
              <select
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 mois</option>
                <option value={2}>2 mois</option>
                <option value={3}>3 mois</option>
                <option value={6}>6 mois</option>
                <option value={12}>1 an</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={fetchPreview}
                disabled={loading}
                variant="outline"
                className="flex items-center"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {loading ? 'Chargement...' : 'Voir le preview'}
              </Button>

              <Button
                onClick={generateSundays}
                disabled={loading || preview.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                {loading ? 'Génération...' : 'Générer les dimanches (5 cultes chacun)'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Message de succès */}
        {generated && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">{generated.message}</p>
                <p className="mt-1">Les musiciens peuvent maintenant donner leur disponibilité !</p>
              </div>
            </div>
          </Card>
        )}

        {/* Preview des dimanches */}
        {preview.length > 0 && (
          <Card>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Preview - Dimanches à générer
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {preview.map((sunday, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 ${
                      sunday.exists
                        ? 'border-gray-300 bg-gray-50 text-gray-600'
                        : 'border-blue-200 bg-blue-50 text-blue-800'
                    }`}
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {formatDate(sunday.date)}
                          </p>
                          <p className="text-xs opacity-75">{sunday.title}</p>
                        </div>
                        <div className="text-xs">
                          {sunday.exists ? (
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded">
                              ✓ Existe
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-blue-200 text-blue-700 rounded">
                              ➕ Nouveau
                            </span>
                          )}
                        </div>
                      </div>
                      {!sunday.exists && (
                        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                          <div className="font-medium mb-1">5 cultes seront créés :</div>
                          <div className="space-y-0.5">
                            <div>• Culte 1 : 8h00-9h30</div>
                            <div>• Culte 2 : 10h00-11h30</div>
                            <div>• Culte 3 : 12h00-13h30</div>
                            <div>• Culte 4 : 14h00-15h30</div>
                            <div>• Culte 5 : 16h00-17h30</div>
                          </div>
                        </div>
                      )}
                      {sunday.exists && (
                        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                          Dimanche existant avec ses cultes
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Total: {preview.length} dimanches</span>
                  <span className="text-blue-600 font-medium">
                    {preview.filter(s => !s.exists).length} nouveaux à créer
                  </span>
                  <span className="text-gray-600">
                    {preview.filter(s => s.exists).length} déjà existants
                  </span>
                </div>
                <div className="text-xs text-blue-700 mt-2">
                  🎵 Chaque nouveau dimanche créera <strong>5 cultes</strong> : 8h-9h30, 10h-11h30, 12h-13h30, 14h-15h30, 16h-17h30
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}