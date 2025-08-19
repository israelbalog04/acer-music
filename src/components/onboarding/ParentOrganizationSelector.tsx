'use client';

import React, { useState, useEffect } from 'react';
import { OrganizationType } from '@prisma/client';

interface ParentOrganization {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  city?: string;
  country: string;
  totalSites: number;
  allowsNewSites: boolean;
  contactEmail?: string;
}

interface ParentOrganizationSelectorProps {
  selectedParentId?: string;
  organizationType?: OrganizationType;
  onSelect: (parentId: string) => void;
  className?: string;
}

export function ParentOrganizationSelector({ 
  selectedParentId, 
  organizationType,
  onSelect, 
  className = '' 
}: ParentOrganizationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations, setOrganizations] = useState<ParentOrganization[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search when organizationType changes
  useEffect(() => {
    if (organizationType) {
      handleSearch();
    }
  }, [organizationType]);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery);
      if (organizationType) params.set('type', organizationType);
      params.set('level', 'PARENT');
      params.set('allowsNewSites', 'true');

      const response = await fetch(`/api/organizations/search-parents?${params}`);
      const result = await response.json();
      
      if (response.ok) {
        setOrganizations(result.organizations || []);
      } else {
        console.error('Erreur de recherche:', result.error);
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setOrganizations([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTypeDisplayName = (type: OrganizationType): string => {
    const names = {
      CHURCH: 'Église',
      CONSERVATORY: 'Conservatoire',
      PROFESSIONAL_BAND: 'Groupe Pro',
      AMATEUR_BAND: 'Groupe Amateur',
      ORCHESTRA: 'Orchestre',
      CHOIR: 'Chœur',
      MUSIC_SCHOOL: 'École de Musique',
      STUDIO: 'Studio',
      ASSOCIATION: 'Association',
      OTHER: 'Autre'
    };
    return names[type] || type;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Trouvez votre organisation mère
        </h3>
        <p className="text-gray-600">
          Recherchez l'organisation principale à laquelle vous souhaitez vous rattacher
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher une organisation mère
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nom de l'organisation, ville, pays..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Rechercher'
                )}
              </button>
            </div>
          </div>

          {/* Auto-filtering notice */}
          {organizationType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Filtré pour les organisations de type <strong>{getTypeDisplayName(organizationType)}</strong>
              </p>
            </div>
          )}

          {/* Results */}
          {hasSearched && (
            <div className="space-y-4">
              {organizations.length > 0 ? (
                <>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Organisations trouvées ({organizations.length})
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {organizations.map((org) => {
                      const isSelected = selectedParentId === org.id;
                      
                      return (
                        <div
                          key={org.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                          }`}
                          onClick={() => onSelect(org.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h5 className="font-semibold text-gray-900 mr-3">
                                  {org.name}
                                </h5>
                                {isSelected && (
                                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2">
                                  {getTypeDisplayName(org.type)}
                                </span>
                                {org.city && (
                                  <span className="mr-2">📍 {org.city}, {org.country}</span>
                                )}
                                <span className="mr-2">🏪 {org.totalSites} sites</span>
                              </div>
                              
                              {org.contactEmail && (
                                <p className="text-sm text-gray-500">
                                  Contact: {org.contactEmail}
                                </p>
                              )}
                            </div>
                            
                            <button
                              onClick={() => onSelect(org.id)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                isSelected
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {isSelected ? 'Sélectionné' : 'Choisir'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune organisation mère trouvée
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Essayez avec d'autres mots-clés ou contactez directement l'organisation que vous souhaitez rejoindre
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Help */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-800 mb-1">
              Votre organisation mère n'apparaît pas ?
            </h4>
            <p className="text-sm text-yellow-700">
              Il est possible qu'elle ne soit pas encore inscrite sur la plateforme ou qu'elle n'accepte pas de nouveaux sites. 
              Contactez-les directement pour qu'ils vous invitent ou créent d'abord leur organisation mère.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}