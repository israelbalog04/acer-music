'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

function MultimediaUploadContent() {
  const { userRole, churchName, firstName, lastName, isLoading } = useUserData();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    tags: '',
    location: '',
    eventDate: '',
    isPublic: true
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      alert('Seules les images sont acceptées (JPG, PNG, GIF, etc.)');
    }
    
    setSelectedFiles(imageFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Veuillez sélectionner au moins une image');
      return;
    }

    if (!uploadData.title.trim()) {
      alert('Veuillez donner un titre à vos images');
      return;
    }

    try {
      setUploading(true);
      setUploadSuccess(false);

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', uploadData.title);
        formData.append('description', uploadData.description);
        formData.append('tags', uploadData.tags);
        formData.append('location', uploadData.location);
        formData.append('eventDate', uploadData.eventDate);
        formData.append('isPublic', uploadData.isPublic.toString());

        const response = await fetch('/api/multimedia/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de l\'upload');
        }
      }

      // Réinitialiser le formulaire
      setSelectedFiles([]);
      setUploadData({
        title: '',
        description: '',
        tags: '',
        location: '',
        eventDate: '',
        isPublic: true
      });
      
      setUploadSuccess(true);
      
      // Masquer le message de succès après 5 secondes
      setTimeout(() => setUploadSuccess(false), 5000);
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`❌ Erreur: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Vérification des permissions après tous les hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3244c7]"></div>
      </div>
    );
  }

  if (!userRole || !['MULTIMEDIA', 'ADMIN'].includes(userRole)) {
    return (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
          <PhotoIcon className="h-8 w-8 mr-3 text-purple-600" />
          Déposer des Photos
        </h1>
        <p className="text-gray-600 mt-2">
          Partagez vos photos des musiciens et des événements
        </p>
      </div>

      {/* Success Message */}
      {uploadSuccess && (
        <Card className="border-green-200 bg-green-50">
          <div className="p-4 flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-green-800 font-medium">Upload réussi !</h3>
              <p className="text-green-700 text-sm">
                Vos images ont été déposées avec succès. Elles seront approuvées par l'administrateur.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Upload Form */}
      <Card>
        <CardHeader title="Déposer des Images" />
        <div className="p-6 space-y-4">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner des Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Glissez-déposez vos images ici ou cliquez pour sélectionner
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
              >
                Choisir des Fichiers
              </Button>
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedFiles.length} fichier(s) sélectionné(s) :
                  </p>
                  <div className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="text-sm text-gray-500">
                        {file.name} ({formatFileSize(file.size)})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Titre des images *"
              value={uploadData.title}
              onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              placeholder="Lieu de prise de vue"
              value={uploadData.location}
              onChange={(e) => setUploadData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <Input
            placeholder="Description (optionnel)"
            value={uploadData.description}
            onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              placeholder="Date de l'événement"
              value={uploadData.eventDate}
              onChange={(e) => setUploadData(prev => ({ ...prev, eventDate: e.target.value }))}
            />
            <Input
              placeholder="Tags (séparés par des virgules)"
              value={uploadData.tags}
              onChange={(e) => setUploadData(prev => ({ ...prev, tags: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={uploadData.isPublic}
              onChange={(e) => setUploadData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Rendre public (visible par tous les musiciens)
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p><strong>Formats acceptés :</strong> JPG, PNG, GIF, WebP</p>
                <p><strong>Taille maximale :</strong> 10 MB par image</p>
                <p><strong>Validation :</strong> Les images seront approuvées par l'administrateur</p>
                <p><strong>Accès :</strong> Vous ne pouvez que déposer des images, pas les gérer</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
              size="lg"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Upload en cours...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                  Uploader {selectedFiles.length} image(s)
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* User Info */}
      <Card className="bg-gray-50">
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600">
            Connecté en tant que <strong>{firstName} {lastName}</strong> 
            <br />
            Église : <strong>{churchName}</strong>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function MultimediaUploadPage() {
  return <MultimediaUploadContent />;
}
