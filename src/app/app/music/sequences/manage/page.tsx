'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useUserData } from '@/hooks/useUserData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RectangleStackIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  StarIcon,
  MusicalNoteIcon,
  ArrowDownTrayIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Event {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isDirector: boolean;
}

interface Sequence {
  id: string;
  title: string;
  description?: string;
  key?: string;
  bpm?: number;
  duration?: number;
  difficulty?: string;
  category?: string;
  instruments: string[];
  tags: string[];
  fileName?: string;
  fileSize?: number;
  scope: 'EVENT' | 'GLOBAL';
  event?: {
    id: string;
    title: string;
    startTime: Date;
  };
  song?: {
    title: string;
    artist?: string;
  };
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  downloadCount: number;
  canEdit: boolean;
}

export default function ManageSequencesPage() {
  const { userRole, churchName } = useUserData();
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'my-events' | 'global' | 'all'>('my-events');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Data will be loaded from API when implemented
        // For now, using empty arrays
        setSequences([]);
        setEvents([]);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userRole]);

  const getFilteredSequences = () => {
    switch (selectedTab) {
      case 'my-events':
        return sequences.filter(s => s.canEdit && s.scope === 'EVENT');
      case 'global':
        return sequences.filter(s => s.scope === 'GLOBAL');
      case 'all':
      default:
        return sequences;
    }
  };

  const handleDeleteSequence = async (sequenceId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette séquence ?')) {
      setSequences(prev => prev.filter(s => s.id !== sequenceId));
    }
  };

  const formatFileSize = (bytes: number) => {
    return Math.round(bytes / 1024) + ' KB';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-800';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800';
      case 'Avancé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Louange': return 'bg-blue-100 text-blue-800';
      case 'Adoration': return 'bg-purple-100 text-purple-800';
      case 'Évangélisation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScopeInfo = (sequence: Sequence) => {
    if (sequence.scope === 'GLOBAL') {
      return {
        label: 'Séquence Globale',
        color: 'bg-indigo-100 text-indigo-800',
        icon: MusicalNoteIcon
      };
    }

    if (sequence.event) {
      return {
        label: sequence.event.title,
        color: sequence.canEdit ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
        icon: CalendarIcon
      };
    }

    return {
      label: 'Événement',
      color: 'bg-gray-100 text-gray-800',
      icon: CalendarIcon
    };
  };

  const filteredSequences = getFilteredSequences();
  const myEventSequences = sequences.filter(s => s.canEdit && s.scope === 'EVENT');
  const globalSequences = sequences.filter(s => s.scope === 'GLOBAL');

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <RectangleStackIcon className="h-8 w-8 mr-3 text-blue-600" />
              Gestion des Séquences
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez vos séquences musicales pour les événements de {churchName}
            </p>
          </div>
          
          {/* Bouton d'ajout si l'utilisateur peut créer des séquences */}
          {(userRole === UserRole.ADMIN || userRole === UserRole.CHEF_LOUANGE || myEventSequences.length > 0) && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouvelle Séquence
            </Button>
          )}
        </div>

        {/* Informations sur les permissions */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <StarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Vos permissions actuelles :</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                {userRole === 'ADMIN' && (
                  <li><strong>Administrateur :</strong> Gestion complète de toutes les séquences</li>
                )}
                {userRole === 'CHEF_LOUANGE' && (
                  <li><strong>Chef de Louange :</strong> Gestion des séquences globales et d'événements</li>
                )}
                {myEventSequences.length > 0 && (
                  <li><strong>Directeur Musical :</strong> Gestion des séquences pour vos événements assignés</li>
                )}
                <li>Consultation et téléchargement de toutes les séquences de l'église</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600">Mes Événements</p>
                <p className="text-2xl font-bold text-green-800">{myEventSequences.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-indigo-50 border-indigo-200">
            <div className="flex items-center">
              <MusicalNoteIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-sm text-indigo-600">Séquences Globales</p>
                <p className="text-2xl font-bold text-indigo-800">{globalSequences.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <RectangleStackIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600">Total Séquences</p>
                <p className="text-2xl font-bold text-blue-800">{sequences.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center">
              <ArrowDownTrayIcon className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-orange-600">Téléchargements</p>
                <p className="text-2xl font-bold text-orange-800">
                  {sequences.reduce((total, seq) => total + seq.downloadCount, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Onglets de filtrage */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('my-events')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'my-events'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <StarIcon className="h-4 w-4 inline mr-1" />
              Mes Événements ({myEventSequences.length})
            </button>
            <button
              onClick={() => setSelectedTab('global')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'global'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MusicalNoteIcon className="h-4 w-4 inline mr-1" />
              Globales ({globalSequences.length})
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <RectangleStackIcon className="h-4 w-4 inline mr-1" />
              Toutes ({sequences.length})
            </button>
          </nav>
        </div>

        {/* Liste des séquences */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des séquences...</p>
            </Card>
          ) : filteredSequences.length === 0 ? (
            <Card className="p-8 text-center">
              <RectangleStackIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune séquence trouvée</p>
              <p className="text-sm text-gray-400 mt-1">
                {selectedTab === 'my-events' 
                  ? 'Vous n\'êtes directeur musical d\'aucun événement'
                  : 'Aucune séquence dans cette catégorie'
                }
              </p>
            </Card>
          ) : (
            <Card className="p-6">
              <p className="text-center text-gray-500">
                Les séquences musicales seront affichées ici une fois créées.
              </p>
            </Card>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}