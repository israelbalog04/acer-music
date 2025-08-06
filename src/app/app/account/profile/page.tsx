'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader } from '@/components/ui/card';
import {
  UserIcon,
  CameraIcon,
  PencilIcon,
  MusicalNoteIcon,
  CalendarIcon,
  StarIcon,
  TrophyIcon,
  CloudArrowUpIcon,
  PlayIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BellIcon,
  ShieldCheckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export default function ProfilPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'uploads' | 'history' | 'settings'>('overview');

  // Données simulées du profil utilisateur
  const [userProfile, setUserProfile] = useState({
    id: 1,
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+33 6 12 34 56 78',
    address: '123 Rue de la Paix, 75001 Paris',
    avatar: 'JD',
    role: 'Musicien',
    status: 'disponible',
    instruments: ['Guitare Électrique', 'Guitare Acoustique'],
    experience: 8,
    joinedDate: '2020-03-15',
    lastActive: '2024-01-12',
    bio: 'Guitariste principal avec une forte expérience en louange contemporaine. Passionné par les arrangements et la formation des jeunes musiciens.',
    specialties: ['Lead Guitar', 'Accompagnement', 'Arrangements'],
    rating: 4.8,
    servicesCount: 45,
    uploadsCount: 12,
    availability: {
      sunday: true,
      weekdays: false,
      rehearsals: true,
      evenings: true
    },
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsReminders: false,
      publicProfile: true
    }
  });

  const myUploads = [
    {
      id: 1,
      song: 'Amazing Grace',
      instrument: 'Guitare Électrique',
      uploadedAt: '2024-01-10',
      plays: 15,
      status: 'approuvé',
      rating: 4.6,
      duration: '4:35'
    },
    {
      id: 2,
      song: 'How Great Thou Art',
      instrument: 'Guitare Acoustique',
      uploadedAt: '2024-01-08',
      plays: 23,
      status: 'approuvé',
      rating: 4.8,
      duration: '5:18'
    },
    {
      id: 3,
      song: 'Blessed Be Your Name',
      instrument: 'Guitare Électrique',
      uploadedAt: '2024-01-05',
      plays: 8,
      status: 'en-attente',
      rating: 0,
      duration: '4:15'
    },
    {
      id: 4,
      song: 'In Christ Alone',
      instrument: 'Guitare Acoustique',
      uploadedAt: '2024-01-03',
      plays: 31,
      status: 'approuvé',
      rating: 4.9,
      duration: '4:52'
    }
  ];

  const serviceHistory = [
    {
      id: 1,
      date: '2024-01-07',
      type: 'Culte du Dimanche',
      role: 'Guitariste Principal',
      status: 'terminé',
      rating: 4.7,
      feedback: 'Excellente prestation, très bon lead sur Amazing Grace'
    },
    {
      id: 2,
      date: '2023-12-31',
      type: 'Service du Nouvel An',
      role: 'Guitariste Principal',
      status: 'terminé',
      rating: 4.9,
      feedback: 'Performance exceptionnelle, grande créativité dans les solos'
    },
    {
      id: 3,
      date: '2023-12-24',
      type: 'Service de Noël',
      role: 'Guitariste Accompagnement',
      status: 'terminé',
      rating: 4.5,
      feedback: 'Bon accompagnement, harmonies parfaites'
    },
    {
      id: 4,
      date: '2023-12-17',
      type: 'Culte du Dimanche',
      role: 'Guitariste Principal',
      status: 'terminé',
      rating: 4.8,
      feedback: 'Très bonne direction musicale, équipe bien menée'
    }
  ];

  const achievements = [
    { id: 1, title: 'Premier Upload', description: 'Premier enregistrement uploadé', date: '2020-04-01', icon: '🎵' },
    { id: 2, title: '10 Services', description: '10 services accomplis', date: '2020-08-15', icon: '🎭' },
    { id: 3, title: 'Mentor', description: 'A formé 3 nouveaux musiciens', date: '2021-06-20', icon: '👨‍🏫' },
    { id: 4, title: '50 Uploads', description: '50 enregistrements partagés', date: '2023-11-12', icon: '🏆' },
    { id: 5, title: 'Expert Guitare', description: 'Plus de 100 heures de jeu', date: '2023-12-01', icon: '🎸' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approuvé':
        return 'bg-green-100 text-green-800';
      case 'en-attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejeté':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approuvé':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'en-attente':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'rejeté':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        i < rating ? 
        <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" /> :
        <StarIcon key={i} className="h-4 w-4 text-gray-300" />
      );
    }
    return stars;
  };

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: UserIcon },
    { id: 'uploads', name: 'Mes Uploads', icon: CloudArrowUpIcon },
    { id: 'history', name: 'Historique', icon: CalendarIcon },
    { id: 'settings', name: 'Paramètres', icon: Cog6ToothIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header avec profil */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-[#3244c7] rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{userProfile.avatar}</span>
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <CameraIcon className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Info personnelles */}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{userProfile.name}</h1>
                  <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                    {userProfile.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-1">{userProfile.role}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Membre depuis {new Date(userProfile.joinedDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                  <span className="flex items-center">
                    <StarIcon className="h-4 w-4 mr-1" />
                    {userProfile.rating}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                <PencilIcon className="h-4 w-4 mr-2" />
                {isEditing ? 'Annuler' : 'Modifier profil'}
              </Button>
              <Button>
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Nouvel Upload
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-[#3244c7] text-[#3244c7]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Services</p>
                    <p className="text-2xl font-bold text-gray-900">{userProfile.servicesCount}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CloudArrowUpIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Uploads</p>
                    <p className="text-2xl font-bold text-gray-900">{userProfile.uploadsCount}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <StarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                    <p className="text-2xl font-bold text-gray-900">{userProfile.rating}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Bio */}
            <Card>
              <CardHeader title="À propos" />
              <div className="px-6 pb-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <textarea
                      value={userProfile.bio}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3244c7] focus:ring-2 focus:ring-[#3244c7]/20 focus:outline-none transition-all resize-none"
                      placeholder="Parlez-nous de votre parcours musical..."
                    />
                    <div className="flex space-x-3">
                      <Button size="sm">Sauvegarder</Button>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">{userProfile.bio}</p>
                )}
              </div>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader title="Réalisations" icon={<TrophyIcon className="h-5 w-5 text-[#3244c7]" />} />
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.slice(0, 4).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(achievement.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instruments */}
            <Card>
              <CardHeader title="Mes Instruments" icon={<MusicalNoteIcon className="h-5 w-5 text-[#3244c7]" />} />
              <div className="px-6 pb-6">
                <div className="space-y-2">
                  {userProfile.instruments.map((instrument, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-900">{instrument}</span>
                      <span className="text-sm text-blue-600">{userProfile.experience} ans</span>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                )}
              </div>
            </Card>

            {/* Spécialités */}
            <Card>
              <CardHeader title="Spécialités" />
              <div className="px-6 pb-6">
                <div className="flex flex-wrap gap-2">
                  {userProfile.specialties.map((specialty, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Disponibilités */}
            <Card>
              <CardHeader title="Disponibilités" />
              <div className="px-6 pb-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dimanche</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userProfile.availability.sunday ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {userProfile.availability.sunday ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Répétitions</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userProfile.availability.rehearsals ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {userProfile.availability.rehearsals ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Soirées</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userProfile.availability.evenings ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {userProfile.availability.evenings ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader title="Contact" />
              <div className="px-6 pb-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{userProfile.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{userProfile.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{userProfile.address}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'uploads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Mes Enregistrements ({myUploads.length})</h2>
            <Button>
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Nouvel Upload
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myUploads.map((upload) => (
              <Card key={upload.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{upload.song}</h3>
                      <p className="text-sm text-gray-600">{upload.instrument}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploadé le {new Date(upload.uploadedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(upload.status)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(upload.status)}`}>
                        {upload.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Durée</p>
                      <p className="font-medium text-gray-900">{upload.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Écoutes</p>
                      <p className="font-medium text-gray-900">{upload.plays}</p>
                    </div>
                  </div>

                  {upload.status === 'approuvé' && upload.rating > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Note de l'équipe :</p>
                      <div className="flex items-center space-x-1">
                        {renderStars(Math.floor(upload.rating))}
                        <span className="text-sm text-gray-500">({upload.rating}/5)</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <PlayIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Modifier
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Historique des Services ({serviceHistory.length})</h2>

          <div className="space-y-4">
            {serviceHistory.map((service) => (
              <Card key={service.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{service.type}</h3>
                      <p className="text-sm text-gray-600">{service.role}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(service.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(Math.floor(service.rating))}
                      <span className="text-sm text-gray-500 ml-2">({service.rating}/5)</span>
                    </div>
                  </div>

                  {service.feedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        <strong>Retour de l'équipe :</strong> {service.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Paramètres du Compte</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader title="Informations Personnelles" icon={<UserIcon className="h-5 w-5 text-[#3244c7]" />} />
              <div className="px-6 pb-6 space-y-4">
                <Input label="Nom complet" value={userProfile.name} />
                <Input label="Email" type="email" value={userProfile.email} />
                <Input label="Téléphone" type="tel" value={userProfile.phone} />
                <Input label="Adresse" value={userProfile.address} />
                <Button size="sm">Sauvegarder</Button>
              </div>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader title="Notifications" icon={<BellIcon className="h-5 w-5 text-[#3244c7]" />} />
              <div className="px-6 pb-6 space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Notifications push</span>
                  <input type="checkbox" checked={userProfile.preferences.notifications} className="rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Mises à jour par email</span>
                  <input type="checkbox" checked={userProfile.preferences.emailUpdates} className="rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Rappels SMS</span>
                  <input type="checkbox" checked={userProfile.preferences.smsReminders} className="rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Profil public</span>
                  <input type="checkbox" checked={userProfile.preferences.publicProfile} className="rounded" />
                </label>
              </div>
            </Card>

            {/* Sécurité */}
            <Card>
              <CardHeader title="Sécurité" icon={<ShieldCheckIcon className="h-5 w-5 text-[#3244c7]" />} />
              <div className="px-6 pb-6 space-y-4">
                <Button variant="outline" className="w-full">
                  Changer le mot de passe
                </Button>
                <Button variant="outline" className="w-full">
                  Configurer l'authentification 2FA
                </Button>
                <Button variant="outline" className="w-full">
                  Télécharger mes données
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}