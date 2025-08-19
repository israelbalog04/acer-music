'use client';

import React, { useState, useEffect } from 'react';
import { MusicIndustry, OrganizationSize } from '@prisma/client';
import { OnboardingData } from '@/types/saas';

interface OrganizationBasicInfoProps {
  data: Partial<OnboardingData>;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function OrganizationBasicInfo({ data, onChange }: OrganizationBasicInfoProps) {
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  // Generate slug from organization name
  useEffect(() => {
    if (data.organizationName && !data.slug) {
      const generatedSlug = generateSlug(data.organizationName);
      onChange({ slug: generatedSlug });
    }
  }, [data.organizationName, data.slug, onChange]);

  // Check slug availability when it changes
  useEffect(() => {
    if (data.slug && data.slug.length >= 3) {
      checkSlugAvailability(data.slug);
    }
  }, [data.slug]);

  const checkSlugAvailability = async (slug: string) => {
    setIsCheckingSlug(true);
    setSlugError(null);

    try {
      const response = await fetch(`/api/organizations/check-slug?slug=${encodeURIComponent(slug)}`);
      const result = await response.json();
      
      if (!result.available) {
        setSlugError('Ce nom d\'URL est déjà utilisé');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du slug:', error);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleSlugChange = (value: string) => {
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    onChange({ slug: cleanSlug });
  };

  const musicIndustryOptions = [
    { value: 'RELIGIOUS', label: 'Musique religieuse' },
    { value: 'CLASSICAL', label: 'Musique classique' },
    { value: 'CONTEMPORARY', label: 'Musique contemporaine' },
    { value: 'JAZZ', label: 'Jazz' },
    { value: 'ROCK', label: 'Rock/Pop' },
    { value: 'ELECTRONIC', label: 'Électronique' },
    { value: 'WORLD', label: 'Musiques du monde' },
    { value: 'EDUCATIONAL', label: 'Éducation musicale' },
    { value: 'COMMERCIAL', label: 'Musique commerciale' },
    { value: 'OTHER', label: 'Autre' }
  ];

  const sizeOptions = [
    { value: 'MICRO', label: 'Micro (1-5 membres)' },
    { value: 'SMALL', label: 'Petit (6-25 membres)' },
    { value: 'MEDIUM', label: 'Moyen (26-100 membres)' },
    { value: 'LARGE', label: 'Grand (101-500 membres)' },
    { value: 'ENTERPRISE', label: 'Entreprise (500+ membres)' }
  ];

  const countries = [
    { code: 'FR', name: 'France' },
    { code: 'BE', name: 'Belgique' },
    { code: 'CH', name: 'Suisse' },
    { code: 'CA', name: 'Canada' },
    { code: 'US', name: 'États-Unis' },
    { code: 'GB', name: 'Royaume-Uni' }
  ];

  const timezones = [
    { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1)' },
    { value: 'Europe/Brussels', label: 'Europe/Brussels (UTC+1)' },
    { value: 'Europe/Zurich', label: 'Europe/Zurich (UTC+1)' },
    { value: 'America/Montreal', label: 'America/Montreal (UTC-5)' },
    { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
    { value: 'Europe/London', label: 'Europe/London (UTC+0)' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-gray-600">
          Donnez-nous quelques informations de base sur votre organisation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom de l'organisation */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'organisation *
          </label>
          <input
            type="text"
            value={data.organizationName || ''}
            onChange={(e) => onChange({ organizationName: e.target.value })}
            placeholder="Ex: Église Acer Paris, Conservatoire Municipal..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Slug URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL de votre organisation *
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              musicplatform.com/
            </span>
            <input
              type="text"
              value={data.slug || ''}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="acer-paris"
              className={`flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                slugError ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
          </div>
          {isCheckingSlug && (
            <p className="text-sm text-gray-500 mt-1">Vérification de la disponibilité...</p>
          )}
          {slugError && (
            <p className="text-sm text-red-600 mt-1">{slugError}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Cette URL sera utilisée pour accéder à votre organisation
          </p>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            value={data.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Décrivez brièvement votre organisation..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Type de musique */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de musique principale
          </label>
          <select
            value={data.musicIndustry || ''}
            onChange={(e) => onChange({ musicIndustry: e.target.value as MusicIndustry })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Sélectionnez...</option>
            {musicIndustryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Taille */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taille de l'organisation
          </label>
          <select
            value={data.size || ''}
            onChange={(e) => onChange({ size: e.target.value as OrganizationSize })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Sélectionnez...</option>
            {sizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Pays */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pays *
          </label>
          <select
            value={data.country || ''}
            onChange={(e) => onChange({ country: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">Sélectionnez...</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuseau horaire
          </label>
          <select
            value={data.timezone || ''}
            onChange={(e) => onChange({ timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Sélectionnez...</option>
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .slice(0, 50); // Limit length
}