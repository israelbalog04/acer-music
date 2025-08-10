'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';
import {
  MicrophoneIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Recording {
  id: string;
  title: string;
  instrument: string;
  audioUrl?: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED';
  notes?: string;
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  song: {
    title: string;
    artist?: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewedBy?: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminRecordingsPage() {
  const { userName } = useUserData();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'IN_REVIEW' | 'APPROVED' | 'DRAFT'>('IN_REVIEW');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchRecordings();
  }, [filter]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'ALL' ? '' : `&status=${filter}`;
      const response = await fetch(`/api/recordings?${statusParam.slice(1)}`);
      if (response.ok) {
        const data = await response.json();
        setRecordings(data.recordings || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (recordingId: string, newStatus: string, reviewNotes?: string) => {
    if (processing) return;

    try {
      setProcessing(recordingId);

      const response = await fetch(`/api/recordings/${recordingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes: reviewNotes
        })
      });

      if (response.ok) {
        await fetchRecordings(); // Recharger la liste
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la validation');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-700';
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Approuvé';
      case 'IN_REVIEW': return 'En attente';
      case 'DRAFT': return 'Brouillon';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'IN_REVIEW': return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'DRAFT': return <EyeIcon className="h-5 w-5 text-gray-600" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const pendingCount = recordings.filter(r => r.status === 'IN_REVIEW').length;
  const approvedCount = recordings.filter(r => r.status === 'APPROVED').length;

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MicrophoneIcon className="h-8 w-8 mr-3 text-red-600" />
            Validation des Enregistrements
          </h1>
          <p className="text-gray-600 mt-2">
            Approuver ou refuser les enregistrements soumis par les musiciens
          </p>
        </div>

        {/* Stats et filtres */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-800 text-sm font-medium">En attente</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 text-sm font-medium">Approuvés</p>
                <p className="text-2xl font-bold text-green-900">{approvedCount}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 col-span-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filtrer:</span>
              {[
                { key: 'ALL', label: 'Tous' },
                { key: 'IN_REVIEW', label: 'En attente' },
                { key: 'APPROVED', label: 'Approuvés' },
                { key: 'DRAFT', label: 'Brouillons' }
              ].map((option) => (
                <Button
                  key={option.key}
                  size="sm"
                  variant={filter === option.key ? 'default' : 'outline'}
                  onClick={() => setFilter(option.key as any)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Liste des enregistrements */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : recordings.length === 0 ? (
          <Card className="p-8 text-center">
            <MicrophoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {filter === 'IN_REVIEW' ? 'Aucun enregistrement en attente' : 'Aucun enregistrement trouvé'}
            </p>
            <p className="text-gray-400 mt-2">
              {filter === 'IN_REVIEW' 
                ? 'Les enregistrements soumis par les musiciens apparaîtront ici'
                : `Changez le filtre pour voir d'autres enregistrements`
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {recordings.map((recording) => (
              <Card key={recording.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <MicrophoneIcon className="h-10 w-10 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{recording.title}</h3>
                        <p className="text-gray-600">
                          <strong>{recording.song.title}</strong>
                          {recording.song.artist && ` - ${recording.song.artist}`}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                          <span>📻 {recording.instrument}</span>
                          <span>👤 {recording.user.firstName} {recording.user.lastName}</span>
                          <span>📅 {new Date(recording.createdAt).toLocaleDateString('fr-FR')}</span>
                          <span className={`px-2 py-1 rounded-full ${getStatusColor(recording.status)}`}>
                            {getStatusText(recording.status)}
                          </span>
                        </div>
                        {recording.notes && (
                          <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                            <p className="text-blue-800 text-sm">
                              <strong>Notes du musicien:</strong> {recording.notes}
                            </p>
                          </div>
                        )}
                        {recording.reviewNotes && (
                          <div className="mt-2 p-2 bg-gray-50 border-l-4 border-gray-400 rounded">
                            <p className="text-gray-800 text-sm">
                              <strong>Notes de validation:</strong> {recording.reviewNotes}
                            </p>
                            {recording.reviewedBy && recording.reviewedAt && (
                              <p className="text-gray-600 text-xs mt-1">
                                Validé par {recording.reviewedBy.firstName} {recording.reviewedBy.lastName} le {' '}
                                {new Date(recording.reviewedAt).toLocaleString('fr-FR')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(recording.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      {recording.audioUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(recording.audioUrl, '_blank')}
                          className="text-blue-600 border-blue-200"
                        >
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Écouter
                        </Button>
                      )}
                    </div>

                    {recording.status === 'IN_REVIEW' && (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const notes = prompt('Notes de refus (optionnel):');
                            if (notes !== null) { // null si annulé, '' si vide
                              handleStatusChange(recording.id, 'DRAFT', notes);
                            }
                          }}
                          disabled={processing === recording.id}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const notes = prompt('Notes d\'approbation (optionnel):');
                            if (notes !== null) { // null si annulé, '' si vide
                              handleStatusChange(recording.id, 'APPROVED', notes);
                            }
                          }}
                          disabled={processing === recording.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          {processing === recording.id ? 'Approbation...' : 'Approuver'}
                        </Button>
                      </div>
                    )}

                    {recording.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const notes = prompt('Raison de la révocation (optionnel):');
                          if (notes !== null && confirm('Êtes-vous sûr de vouloir révoquer l\'approbation ?')) {
                            handleStatusChange(recording.id, 'DRAFT', notes);
                          }
                        }}
                        disabled={processing === recording.id}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        Révoquer
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}