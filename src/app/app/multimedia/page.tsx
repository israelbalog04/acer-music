'use client';

import { useEffect } from 'react';
import { useUserData } from '@/hooks/useUserData';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function MultimediaHomePage() {
  const { userRole, isLoading } = useUserData();
  
  // Redirection automatique vers la page de dépôt
  useEffect(() => {
    if (userRole === 'MULTIMEDIA') {
      window.location.href = '/app/multimedia/upload';
    }
  }, [userRole]);

  // Vérification des permissions après tous les hooks
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3244c7]"></div>
      </div>
    );
  }

  if (!userRole || !['MULTIMEDIA', 'ADMIN'].includes(userRole)) {
    return (
      <div className="text-center p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Accès restreint
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <PhotoIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers la page de dépôt de photos...</p>
      </div>
    </div>
  );
}
