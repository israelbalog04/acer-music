'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { OnboardingData } from '@/types/saas';

export default function OnboardingPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleComplete = async (data: OnboardingData) => {
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/onboarding/create-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      // Redirect to the new organization
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        router.push(`/${result.organization.slug}/dashboard`);
      }

    } catch (error) {
      console.error('Erreur lors de la création de l\'organisation:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <OnboardingWizard 
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}