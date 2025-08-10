'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import {
  MusicalNoteIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function AddSongPage() {
  const router = useRouter();
  const { churchName } = useUserData();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    youtubeUrl: '',
    key: '',
    bpm: '',
    duration: '',
    lyrics: '',
    chords: '',
    notes: '',
    tags: []
  });

  const [currentTag, setCurrentTag] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateYouTubeUrl = (url: string) => {
    if (!url) return true;
    return url.match(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return;
    }

    if (formData.youtubeUrl && !validateYouTubeUrl(formData.youtubeUrl)) {
      setError('Le lien YouTube n\'est pas valide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          bpm: formData.bpm ? parseInt(formData.bpm) : null,
          duration: formData.duration ? parseInt(formData.duration) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/app/music/songs');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chanson ajoutée !</h2>
          <p className="text-gray-600">
            La chanson "{formData.title}" a été ajoutée au répertoire.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MusicalNoteIcon className="h-8 w-8 mr-3 text-blue-600" />
                Ajouter une Chanson
              </h1>
              <p className="text-gray-600 mt-2">
                Ajoutez une nouvelle chanson au répertoire de {churchName}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Erreur</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Titre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la chanson *
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Amazing Grace, How Great Thou Art..."
                  className="w-full"
                  required
                />
              </div>

              {/* Artiste */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artiste / Compositeur
                </label>
                <Input
                  type="text"
                  name="artist"
                  value={formData.artist}
                  onChange={handleInputChange}
                  placeholder="John Newton, Stuart K. Hine..."
                  className="w-full"
                />
              </div>

              {/* Lien YouTube */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien YouTube
                </label>
                <Input
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full"
                />
              </div>

              {/* Tonalité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tonalité
                </label>
                <select
                  name="key"
                  value={formData.key}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="C">Do (C)</option>
                  <option value="C#">Do# (C#)</option>
                  <option value="D">Ré (D)</option>
                  <option value="D#">Ré# (D#)</option>
                  <option value="E">Mi (E)</option>
                  <option value="F">Fa (F)</option>
                  <option value="F#">Fa# (F#)</option>
                  <option value="G">Sol (G)</option>
                  <option value="G#">Sol# (G#)</option>
                  <option value="A">La (A)</option>
                  <option value="A#">La# (A#)</option>
                  <option value="B">Si (B)</option>
                </select>
              </div>

              {/* Tempo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo (BPM)
                </label>
                <Input
                  type="number"
                  name="bpm"
                  value={formData.bpm}
                  onChange={handleInputChange}
                  placeholder="120"
                  min="60"
                  max="200"
                  className="w-full"
                />
              </div>

              {/* Durée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (secondes)
                </label>
                <Input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="240"
                  min="30"
                  max="600"
                  className="w-full"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <Input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="louange, gospel, contemporain..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Paroles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paroles
              </label>
              <textarea
                name="lyrics"
                value={formData.lyrics}
                onChange={handleInputChange}
                rows={6}
                placeholder="Couplet 1:&#10;Amazing grace, how sweet the sound&#10;That saved a wretch like me...&#10;&#10;Refrain:&#10;..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Accords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accords
              </label>
              <textarea
                name="chords"
                value={formData.chords}
                onChange={handleInputChange}
                rows={4}
                placeholder="G - C - G - D&#10;Em - C - G - D/F#&#10;..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes / Commentaires
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Notes pour les musiciens, arrangements spéciaux, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Création...' : 'Ajouter la chanson'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </RoleGuard>
  );
}