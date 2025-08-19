'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { QuickSetupWizard } from '@/components/onboarding/QuickSetupWizard';

export default function QuickSetupPage() {
  const router = useRouter();

  const handleSetupComplete = async (config: any) => {
    try {
      // Sauvegarder la configuration via l'API
      const response = await fetch('/api/organization/quick-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        // Rediriger vers le dashboard avec un message de succès
        router.push('/app?setup=complete');
      } else {
        console.error('Erreur lors de la création de l\'organisation');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <QuickSetupWizard onComplete={handleSetupComplete} />
  );
}