'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';

export default function AdminAvailabilityDebugPage() {
  const { userRole, churchName } = useUserData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const testAPIs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Test des APIs...');
        
        // Test 1: API Users
        console.log('Test 1: /api/admin/users');
        const usersResponse = await fetch('/api/admin/users');
        console.log('Status users:', usersResponse.status);
        
        if (!usersResponse.ok) {
          throw new Error(`API Users: ${usersResponse.status} ${usersResponse.statusText}`);
        }
        
        const usersData = await usersResponse.json();
        console.log('Users data:', usersData.length, 'utilisateurs');
        
        // Test 2: API Events
        console.log('Test 2: /api/admin/events');
        const eventsResponse = await fetch('/api/admin/events');
        console.log('Status events:', eventsResponse.status);
        
        if (!eventsResponse.ok) {
          throw new Error(`API Events: ${eventsResponse.status} ${eventsResponse.statusText}`);
        }
        
        const eventsData = await eventsResponse.json();
        console.log('Events data:', eventsData.length, 'événements');
        
        // Test 3: API Availability
        console.log('Test 3: /api/admin/availability');
        const availabilityResponse = await fetch('/api/admin/availability');
        console.log('Status availability:', availabilityResponse.status);
        
        if (!availabilityResponse.ok) {
          throw new Error(`API Availability: ${availabilityResponse.status} ${availabilityResponse.statusText}`);
        }
        
        const availabilityData = await availabilityResponse.json();
        console.log('Availability data:', availabilityData.length, 'disponibilités');
        
        setData({
          users: usersData,
          events: eventsData,
          availability: availabilityData
        });
        
        console.log('✅ Tous les tests réussis');
        
      } catch (error) {
        console.error('❌ Erreur:', error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    testAPIs();
  }, []);

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Debug - Disponibilités Admin
          </h1>
          <p className="text-gray-600 mt-2">
            Test des APIs pour diagnostiquer le problème
          </p>
        </div>

        {loading && (
          <Card className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3">Test des APIs en cours...</span>
            </div>
          </Card>
        )}

        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ❌ Erreur détectée
            </h3>
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {data && !error && (
          <div className="space-y-4">
            <Card className="p-6 border-green-200 bg-green-50">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Tous les tests réussis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-green-600">Utilisateurs</p>
                  <p className="text-2xl font-bold text-green-900">{data.users.length}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Événements</p>
                  <p className="text-2xl font-bold text-green-900">{data.events.length}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Disponibilités</p>
                  <p className="text-2xl font-bold text-green-900">{data.availability.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Données détaillées</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Utilisateurs (premiers 3):</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(data.users.slice(0, 3), null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Événements (premiers 3):</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(data.events.slice(0, 3), null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Disponibilités (premiers 3):</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(data.availability.slice(0, 3), null, 2)}
                  </pre>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="flex space-x-4">
          <Button
            onClick={() => window.location.href = '/app/admin/availability'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Retour à la page originale
          </Button>
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Relancer les tests
          </Button>
        </div>
      </div>
    </RoleGuard>
  );
}
