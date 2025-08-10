'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  UserIcon,
  CameraIcon,
  PencilIcon,
  MusicalNoteIcon,
  CalendarIcon,
  StarIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BellIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  instruments: string;
  primaryInstrument?: string;
  skillLevel?: string;
  musicalExperience?: number;
  voiceType?: string;
  canLead: boolean;
  preferredGenres?: string;
  avatar?: string;
  bio?: string;
  birthDate?: string;
  joinedChurchDate?: string;
  address?: string;
  whatsapp?: string;
  emergencyContact?: string;
  socialMedia?: string;
  isPublic: boolean;
  notificationPrefs?: string;
  language?: string;
  generalAvailability?: string;
  church: {
    name: string;
    city: string;
  };
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, avatar: data.avatar } : null);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setIsEditing(false);
        alert('Profil mis à jour avec succès');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getInstruments = () => {
    if (!profile?.instruments) return [];
    try {
      return JSON.parse(profile.instruments);
    } catch {
      return [profile.instruments];
    }
  };

  const getPreferredGenres = () => {
    if (!profile?.preferredGenres) return [];
    try {
      return JSON.parse(profile.preferredGenres);
    } catch {
      return [];
    }
  };

  const skillLevelLabels = {
    'BEGINNER': 'Débutant',
    'INTERMEDIATE': 'Intermédiaire', 
    'ADVANCED': 'Avancé',
    'EXPERT': 'Expert'
  };

  const voiceTypeLabels = {
    'SOPRANO': 'Soprano',
    'MEZZO_SOPRANO': 'Mezzo-soprano',
    'ALTO': 'Alto',
    'TENOR': 'Ténor',
    'BARITONE': 'Baryton',
    'BASS': 'Basse'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Impossible de charger le profil</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header avec photo de profil */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar avec upload */}
          <div className="relative">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={`${profile.firstName} ${profile.lastName}`}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-[#3244c7] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">
                  {getInitials(profile.firstName, profile.lastName)}
                </span>
              </div>
            )}
            
            {/* Bouton upload */}
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
              <CameraIcon className={`h-4 w-4 text-gray-600 ${uploading ? 'animate-spin' : ''}`} />
            </label>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-gray-600 capitalize">{profile.role.toLowerCase()}</p>
            <p className="text-sm text-gray-500">
              {profile.church.name} • {profile.church.city}
            </p>
            
            {profile.primaryInstrument && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <MusicalNoteIcon className="h-3 w-3 mr-1" />
                  {profile.primaryInstrument}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Paramètres
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Prénom</label>
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-700">{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">{profile.phone}</span>
                        </div>
                      )}
                      {profile.address && (
                        <div className="flex items-center space-x-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">{profile.address}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Présentation</h4>
                  {isEditing ? (
                    <textarea
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Parlez-nous de vous..."
                    />
                  ) : (
                    <p className="text-gray-700">{profile.bio || 'Aucune présentation'}</p>
                  )}
                </div>
              </div>

              {/* Informations musicales */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Profil musical</h3>
                
                {/* Instruments */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Instruments</h4>
                  <div className="flex flex-wrap gap-2">
                    {getInstruments().map((instrument: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {instrument}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Niveau et expérience */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Niveau</h4>
                    {isEditing ? (
                      <select
                        value={profile.skillLevel || 'BEGINNER'}
                        onChange={(e) => setProfile({...profile, skillLevel: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="BEGINNER">Débutant</option>
                        <option value="INTERMEDIATE">Intermédiaire</option>
                        <option value="ADVANCED">Avancé</option>
                        <option value="EXPERT">Expert</option>
                      </select>
                    ) : (
                      <p className="text-gray-700">
                        {profile.skillLevel ? skillLevelLabels[profile.skillLevel as keyof typeof skillLevelLabels] : 'Non renseigné'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Expérience</h4>
                    {isEditing ? (
                      <input
                        type="number"
                        value={profile.musicalExperience || ''}
                        onChange={(e) => setProfile({...profile, musicalExperience: parseInt(e.target.value) || 0})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Années"
                      />
                    ) : (
                      <p className="text-gray-700">
                        {profile.musicalExperience ? `${profile.musicalExperience} ans` : 'Non renseigné'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Type vocal */}
                {(profile.voiceType || isEditing) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Type vocal</h4>
                    {isEditing ? (
                      <select
                        value={profile.voiceType || ''}
                        onChange={(e) => setProfile({...profile, voiceType: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Non renseigné</option>
                        <option value="SOPRANO">Soprano</option>
                        <option value="MEZZO_SOPRANO">Mezzo-soprano</option>
                        <option value="ALTO">Alto</option>
                        <option value="TENOR">Ténor</option>
                        <option value="BARITONE">Baryton</option>
                        <option value="BASS">Basse</option>
                      </select>
                    ) : (
                      <p className="text-gray-700">
                        {profile.voiceType ? voiceTypeLabels[profile.voiceType as keyof typeof voiceTypeLabels] : 'Non renseigné'}
                      </p>
                    )}
                  </div>
                )}

                {/* Peut diriger */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profile.canLead}
                    onChange={(e) => setProfile({...profile, canLead: e.target.checked})}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Peut diriger la louange
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Préférences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Profil public</label>
                    <p className="text-xs text-gray-500">Votre profil sera visible par les autres membres</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.isPublic}
                    onChange={(e) => setProfile({...profile, isPublic: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                  <select
                    value={profile.language || 'fr'}
                    onChange={(e) => setProfile({...profile, language: e.target.value})}
                    className="block w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <XMarkIcon className="h-4 w-4" />
                Annuler
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <CheckIcon className="h-4 w-4" />
                Sauvegarder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}