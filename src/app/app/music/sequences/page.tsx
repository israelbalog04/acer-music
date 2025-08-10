'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card } from '@/components/ui/card';
import { useUserData } from '@/hooks/useUserData';
import { RectangleStackIcon } from '@heroicons/react/24/outline';

export default function SequencesPage() {
  const { userRole } = useUserData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSequences = async () => {
      try {
        setLoading(true);
        // Les séquences seront chargées depuis l'API
        // Pour l'instant, base vide
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSequences();
  }, []);

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <RectangleStackIcon className="h-8 w-8 mr-3 text-blue-600" />
            Séquences Musicales
          </h1>
          <p className="text-gray-600 mt-2">
            Parcourez et téléchargez les partitions et arrangements
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Card className="p-6">
            <p className="text-center text-gray-500">
              Aucune séquence musicale disponible pour le moment.
            </p>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}