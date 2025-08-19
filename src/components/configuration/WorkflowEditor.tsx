'use client';

import React, { useState } from 'react';
import { OrganizationWorkflow, CustomRole, HierarchyLevel } from './OrganizationConfigurator';

interface WorkflowEditorProps {
  workflows: OrganizationWorkflow[];
  approvalChains: any[];
  roles: CustomRole[];
  hierarchyLevels: HierarchyLevel[];
  onChange: (workflows: OrganizationWorkflow[], approvalChains: any[]) => void;
}

export function WorkflowEditor({ 
  workflows, 
  approvalChains, 
  roles, 
  hierarchyLevels, 
  onChange 
}: WorkflowEditorProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createNewWorkflow = () => {
    const newWorkflow: OrganizationWorkflow = {
      id: `workflow_${Date.now()}`,
      name: 'Nouveau Processus',
      description: '',
      trigger: { event: 'user.created' },
      steps: [],
      conditions: []
    };

    onChange([...workflows, newWorkflow], approvalChains);
    setSelectedWorkflow(newWorkflow.id);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Processus & Workflows</h2>
          <p className="text-gray-600 mt-1">
            Configurez les processus automatisés et chaînes d'approbation
          </p>
        </div>
        
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
        >
          + Nouveau processus
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Fonctionnalité Avancée
            </h4>
            <p className="text-sm text-blue-700">
              Les workflows permettent d'automatiser les processus organisationnels selon vos règles métier.
              Cette fonctionnalité sera développée dans une version ultérieure.
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">⚙️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Éditeur de Workflows
        </h3>
        <p className="text-gray-600 mb-4">
          Configurez des processus automatisés pour :
        </p>
        <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
          <li>• Approbation automatique des nouveaux membres</li>
          <li>• Notifications d'événements selon les rôles</li>
          <li>• Validation des contenus uploadés</li>
          <li>• Processus d'escalade hiérarchique</li>
          <li>• Automatisation des invitations</li>
        </ul>
      </div>
    </div>
  );
}