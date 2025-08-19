'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SelectOrganizationPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/organizations/search?q=${encodeURIComponent(searchQuery)}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Rejoignez une organisation musicale
            </h1>
            <p className="text-xl text-gray-600">
              Trouvez et rejoignez votre groupe de musique
            </p>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher une organisation
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nom de l'organisation, ville, type de musique..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
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

              {/* Search results */}
              {hasSearched && (
                <div className="space-y-4">
                  {organizations.length > 0 ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Organisations trouvées ({organizations.length})
                      </h3>
                      <div className="space-y-3">
                        {organizations.map((org) => (
                          <div
                            key={org.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{org.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {org.type} • {org.industry} • {org.memberCount} membres
                                </p>
                                {org.description && (
                                  <p className="text-sm text-gray-500 mt-2">{org.description}</p>
                                )}
                              </div>
                              <div className="ml-4">
                                <button
                                  onClick={() => router.push(`/${org.slug}/join`)}
                                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                                >
                                  Rejoindre
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune organisation trouvée
                      </h3>
                      <p className="text-gray-600">
                        Essayez avec d'autres mots-clés ou créez votre propre organisation
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            {/* Create organization */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Créer une nouvelle organisation
                </h3>
                <p className="text-gray-600 mb-4">
                  Votre organisation n'existe pas encore ? Créez-la maintenant !
                </p>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
                >
                  Créer mon organisation
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Besoin d'aide ?
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Si vous ne trouvez pas votre organisation ou avez besoin d'assistance, 
                    n'hésitez pas à nous contacter.
                  </p>
                  <Link
                    href="/contact"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Contacter le support →
                  </Link>
                </div>
              </div>
            </div>

            {/* Back to home */}
            <div className="text-center">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800"
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}