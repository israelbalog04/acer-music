'use client';

import { useUserData } from '@/hooks/useUserData';
import { BrandingDashboard } from '@/components/branding/BrandingDashboard';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@prisma/client';

export default function BrandingPage() {
  const { churchId } = useUserData();

  if (!churchId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="min-h-screen bg-gray-50">
        <BrandingDashboard organizationId={churchId} />
      </div>
    </RoleGuard>
  );
}