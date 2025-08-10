'use client';

import { useUserData } from '@/hooks/useUserData';
import { UserRole } from '@prisma/client';
import { hasPermission } from '@/lib/permissions';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
  fallback?: React.ReactNode;
  resourceUserId?: string; // Pour les permissions "own"
}

export function RoleGuard({ 
  children, 
  allowedRoles = [],
  requiredPermission,
  fallback = null,
  resourceUserId
}: RoleGuardProps) {
  const { userRole, userId, isLoading } = useUserData();

  // En cours de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3244c7]"></div>
      </div>
    );
  }

  // Pas connecté
  if (!userRole) {
    return fallback || (
      <div className="text-center p-8">
        <p className="text-gray-500">Accès non autorisé</p>
      </div>
    );
  }

  // Vérification par rôles
  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(userRole);
    if (!hasRole) {
      return fallback || (
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
  }

  // Vérification par permission
  if (requiredPermission) {
    let hasAccess = false;

    if (requiredPermission.includes('.own') && resourceUserId) {
      // Permission sur ressource propre
      hasAccess = resourceUserId === userId && hasPermission(userRole, requiredPermission);
    } else {
      // Permission générale
      hasAccess = hasPermission(userRole, requiredPermission);
    }

    if (!hasAccess) {
      return fallback || (
        <div className="text-center p-8">
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Permission insuffisante
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Vous n'êtes pas autorisé à effectuer cette action.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}