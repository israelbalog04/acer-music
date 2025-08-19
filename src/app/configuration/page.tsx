'use client';

import React, { useState, useEffect } from 'react';
import { OrganizationType } from '@prisma/client';
import { OrganizationConfigurator, OrganizationConfig } from '@/components/configuration/OrganizationConfigurator';

export default function ConfigurationPage() {
  const [config, setConfig] = useState<OrganizationConfig | null>(null);
  const [organizationType, setOrganizationType] = useState<OrganizationType>('CHURCH');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/organization/configuration');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.configuration);
        setOrganizationType(data.organizationType);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (newConfig: OrganizationConfig) => {
    setConfig(newConfig);
  };

  const handleSave = async (newConfig: OrganizationConfig) => {
    try {
      const response = await fetch('/api/organization/configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configuration: newConfig,
          organizationType
        }),
      });

      if (response.ok) {
        console.log('Configuration sauvegardée avec succès');
        // Optionally show a success message
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <OrganizationConfigurator
      initialConfig={config || undefined}
      organizationType={organizationType}
      onConfigChange={handleConfigChange}
      onSave={handleSave}
    />
  );
}