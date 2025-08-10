'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useUserData } from '@/hooks/useUserData';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function EquipePage() {
  const { userRole, churchName } = useUserData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('tous');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [musicians, setMusicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMusicians = async () => {
      try {
        setLoading(true);
        // Les musiciens seront chargés depuis l'API
        // Pour l'instant, liste vide
        setMusicians([]);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusicians();
  }, []);

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UsersIcon className="h-8 w-8 mr-3 text-blue-600" />
              Équipe Musicale
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les membres de l'équipe musicale de {churchName}
            </p>
          </div>
          {(userRole === UserRole.ADMIN || userRole === UserRole.CHEF_LOUANGE) && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter un membre
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Rechercher un musicien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tous">Tous les instruments</option>
                <option value="piano">Piano</option>
                <option value="guitare">Guitare</option>
                <option value="basse">Basse</option>
                <option value="batterie">Batterie</option>
                <option value="chant">Chant</option>
                <option value="violon">Violon</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tous">Tous les statuts</option>
                <option value="disponible">Disponible</option>
                <option value="occupé">Occupé</option>
                <option value="en-repos">En repos</option>
              </select>
              <Button variant="outline">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : musicians.length === 0 ? (
          <Card className="p-8 text-center">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun membre d'équipe trouvé</p>
            <p className="text-gray-400 mt-2">
              Les membres de l'équipe musicale apparaîtront ici une fois ajoutés.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Les cartes de musiciens apparaîtront ici */}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}