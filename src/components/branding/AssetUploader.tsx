'use client';

import { useState, useRef } from 'react';
import { PhotoIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface AssetUploaderProps {
  label: string;
  currentAsset?: string;
  onUpload: (file: File) => Promise<string>;
  onRemove: () => void;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  disabled?: boolean;
  description?: string;
  previewClassName?: string;
}

export function AssetUploader({
  label,
  currentAsset,
  onUpload,
  onRemove,
  acceptedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  maxSizeInMB = 5,
  disabled = false,
  description,
  previewClassName = "w-24 h-24"
}: AssetUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Validation du type de fichier
    if (!acceptedTypes.includes(file.type)) {
      setError(`Type de fichier non supporté. Types acceptés: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validation de la taille
    if (file.size > maxSizeInMB * 1024 * 1024) {
      setError(`Fichier trop volumineux. Taille maximum: ${maxSizeInMB}MB`);
      return;
    }

    setIsUploading(true);
    
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setError('Erreur lors de l\'upload du fichier');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && !disabled) {
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const triggerFileSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {description && (
          <span className="text-xs text-gray-500">{description}</span>
        )}
      </div>

      {/* Zone de prévisualisation et d'upload */}
      <div className="flex items-start space-x-4">
        {/* Prévisualisation actuelle */}
        {currentAsset && (
          <div className="relative group">
            <img
              src={currentAsset}
              alt={label}
              className={`${previewClassName} object-contain border border-gray-300 rounded-lg bg-white`}
            />
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              title="Supprimer"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Zone d'upload */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={triggerFileSelect}
          className={`flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />

          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Upload en cours...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto" />
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium text-primary-600">Cliquez pour parcourir</span>
                  {!disabled && ' ou glissez-déposez'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP, SVG jusqu'à {maxSizeInMB}MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}

      {/* Actions rapides */}
      {!currentAsset && !isUploading && (
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={triggerFileSelect}
            disabled={disabled}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Sélectionner un fichier
          </button>
        </div>
      )}
    </div>
  );
}

// Composant pour la gestion complète des assets de branding
interface BrandingAssetsEditorProps {
  assets: {
    logo?: string;
    logoLight?: string;
    favicon?: string;
    backgroundImage?: string;
  };
  onAssetUpdate: (key: string, url: string) => void;
  onAssetRemove: (key: string) => void;
  onUpload: (key: string, file: File) => Promise<string>;
  disabled?: boolean;
}

export function BrandingAssetsEditor({
  assets,
  onAssetUpdate,
  onAssetRemove,
  onUpload,
  disabled = false
}: BrandingAssetsEditorProps) {
  const assetConfigs = [
    {
      key: 'logo',
      label: 'Logo Principal',
      description: 'Logo affiché dans l\'interface (fond clair)',
      previewClassName: 'w-32 h-16',
      acceptedTypes: ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']
    },
    {
      key: 'logoLight',
      label: 'Logo Version Claire',
      description: 'Logo pour les fonds sombres (optionnel)',
      previewClassName: 'w-32 h-16 bg-gray-800',
      acceptedTypes: ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']
    },
    {
      key: 'favicon',
      label: 'Favicon',
      description: 'Icône affichée dans l\'onglet du navigateur',
      previewClassName: 'w-8 h-8',
      acceptedTypes: ['image/png', 'image/x-icon', 'image/svg+xml'],
      maxSizeInMB: 1
    },
    {
      key: 'backgroundImage',
      label: 'Image de Fond',
      description: 'Image de fond pour la page de connexion (optionnel)',
      previewClassName: 'w-48 h-32',
      acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSizeInMB: 10
    }
  ];

  const handleUpload = async (key: string, file: File) => {
    const url = await onUpload(key, file);
    onAssetUpdate(key, url);
    return url;
  };

  const handleRemove = (key: string) => {
    onAssetRemove(key);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des Assets</h3>
        <p className="text-sm text-gray-600 mb-6">
          Gérez les images et logos de votre organisation. Les assets seront automatiquement optimisés et redimensionnés.
        </p>
      </div>

      {assetConfigs.map(({ key, label, description, previewClassName, acceptedTypes, maxSizeInMB = 5 }) => (
        <AssetUploader
          key={key}
          label={label}
          description={description}
          currentAsset={assets[key as keyof typeof assets]}
          onUpload={(file) => handleUpload(key, file)}
          onRemove={() => handleRemove(key)}
          acceptedTypes={acceptedTypes}
          maxSizeInMB={maxSizeInMB}
          previewClassName={previewClassName}
          disabled={disabled}
        />
      ))}

      {/* Recommandations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Recommandations</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Logo: Format PNG ou SVG avec fond transparent, largeur recommandée 200-400px</li>
          <li>• Favicon: Format PNG 32x32px ou ICO 16x16px</li>
          <li>• Image de fond: Haute résolution (1920x1080px minimum), optimisée pour le web</li>
          <li>• Utilisez des formats vectoriels (SVG) quand possible pour une meilleure qualité</li>
        </ul>
      </div>
    </div>
  );
}