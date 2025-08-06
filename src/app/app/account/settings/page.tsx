'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader } from '@/components/ui/card';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  MusicalNoteIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SpeakerWaveIcon,
  MoonIcon,
  SunIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function ParametresPage() {
  const [settings, setSettings] = useState({
    // Notifications
    notifications: {
      push: true,
      email: true,
      sms: false,
      newUploads: true,
      serviceReminders: true,
      rehearsalReminders: true,
      teamUpdates: false,
      systemAlerts: true
    },
    // Audio
    audio: {
      quality: 'high',
      autoPlay: false,
      volume: 75,
      downloadQuality: 'original'
    },
    // Interface
    interface: {
      theme: 'light',
      language: 'fr',
      timezone: 'Europe/Paris',
      startPage: 'dashboard',
      itemsPerPage: 20
    },
    // Confidentialité
    privacy: {
      profilePublic: true,
      showInstruments: true,
      showExperience: true,
      allowMessages: true,
      showActivity: false
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">
          Personnalisez votre expérience Acer Music
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader 
            title="Notifications" 
            subtitle="Gérez vos préférences de notifications"
            icon={<BellIcon className="h-5 w-5 text-[#3244c7]" />}
          />
          <div className="px-6 pb-6 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Canaux de notification</h4>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Notifications push</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                  className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Notifications email</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                  className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">SMS (optionnel)</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={(e) => updateSetting('notifications', 'sms', e.target.checked)}
                  className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
                />
              </label>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Types de notifications</h4>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Nouveaux enregistrements</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.newUploads}
                  onChange={(e) => updateSetting('notifications', 'newUploads', e.target.checked)}
                  className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Rappels de services</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.serviceReminders}
                  onChange={(e) => updateSetting('notifications', 'serviceReminders', e.target.checked)}
                  className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Rappels de répétitions</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.rehearsalReminders}
                  onChange={(e) => updateSetting('notifications', 'rehearsalReminders', e.target.checked)}
                  className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Mises à jour de l'équipe</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.teamUpdates}
                  onChange={(e) => updateSetting('notifications', 'teamUpdates', e.target.checked)}
                  className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Audio */}
        <Card>
          <CardHeader 
            title="Audio" 
            subtitle="Paramètres de lecture et qualité"
            icon={<SpeakerWaveIcon className="h-5 w-5 text-[#3244c7]" />}
          />
          <div className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualité de streaming
              </label>
              <select
                value={settings.audio.quality}
                onChange={(e) => updateSetting('audio', 'quality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7]"
              >
                <option value="low">Économique (128 kbps)</option>
                <option value="medium">Standard (192 kbps)</option>
                <option value="high">Haute (320 kbps)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume par défaut: {settings.audio.volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.audio.volume}
                onChange={(e) => updateSetting('audio', 'volume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Lecture automatique</span>
              <input
                type="checkbox"
                checked={settings.audio.autoPlay}
                onChange={(e) => updateSetting('audio', 'autoPlay', e.target.checked)}
                className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
              />
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualité de téléchargement
              </label>
              <select
                value={settings.audio.downloadQuality}
                onChange={(e) => updateSetting('audio', 'downloadQuality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7]"
              >
                <option value="compressed">Compressé (plus rapide)</option>
                <option value="original">Original (qualité maximale)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Interface */}
        <Card>
          <CardHeader 
            title="Interface" 
            subtitle="Personnalisation de l'affichage"
            icon={<ComputerDesktopIcon className="h-5 w-5 text-[#3244c7]" />}
          />
          <div className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thème
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => updateSetting('interface', 'theme', 'light')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    settings.interface.theme === 'light' 
                      ? 'border-[#3244c7] bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <SunIcon className="h-4 w-4" />
                  <span className="text-sm">Clair</span>
                </button>
                <button
                  onClick={() => updateSetting('interface', 'theme', 'dark')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    settings.interface.theme === 'dark' 
                      ? 'border-[#3244c7] bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MoonIcon className="h-4 w-4" />
                  <span className="text-sm">Sombre</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue
              </label>
              <select
                value={settings.interface.language}
                onChange={(e) => updateSetting('interface', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7]"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page de démarrage
              </label>
              <select
                value={settings.interface.startPage}
                onChange={(e) => updateSetting('interface', 'startPage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7]"
              >
                <option value="dashboard">Dashboard</option>
                <option value="repertoire">Répertoire</option>
                <option value="planning">Planning</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Éléments par page
              </label>
              <select
                value={settings.interface.itemsPerPage}
                onChange={(e) => updateSetting('interface', 'itemsPerPage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Confidentialité */}
        <Card>
          <CardHeader 
            title="Confidentialité" 
            subtitle="Contrôlez vos informations publiques"
            icon={<ShieldCheckIcon className="h-5 w-5 text-[#3244c7]" />}
          />
          <div className="px-6 pb-6 space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700">Profil public</span>
                <p className="text-xs text-gray-500">Visible par tous les membres</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.profilePublic}
                onChange={(e) => updateSetting('privacy', 'profilePublic', e.target.checked)}
                className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700">Afficher mes instruments</span>
                <p className="text-xs text-gray-500">Visible dans l'annuaire</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.showInstruments}
                onChange={(e) => updateSetting('privacy', 'showInstruments', e.target.checked)}
                className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700">Afficher mon expérience</span>
                <p className="text-xs text-gray-500">Années d'expérience publiques</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.showExperience}
                onChange={(e) => updateSetting('privacy', 'showExperience', e.target.checked)}
                className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700">Autoriser les messages</span>
                <p className="text-xs text-gray-500">Autres musiciens peuvent vous contacter</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.allowMessages}
                onChange={(e) => updateSetting('privacy', 'allowMessages', e.target.checked)}
                className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700">Afficher mon activité</span>
                <p className="text-xs text-gray-500">Dernière connexion, uploads récents</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.showActivity}
                onChange={(e) => updateSetting('privacy', 'showActivity', e.target.checked)}
                className="w-4 h-4 text-[#3244c7] border-gray-300 rounded focus:ring-[#3244c7]"
              />
            </label>
          </div>
        </Card>
      </div>

      {/* Actions et Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions rapides */}
        <Card>
          <CardHeader title="Actions rapides" />
          <div className="px-6 pb-6 space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <DocumentTextIcon className="h-4 w-4 mr-3" />
              Exporter mes données
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <QuestionMarkCircleIcon className="h-4 w-4 mr-3" />
              Guide d'utilisation
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              <ExclamationTriangleIcon className="h-4 w-4 mr-3" />
              Supprimer mon compte
            </Button>
          </div>
        </Card>

        {/* Informations système */}
        <Card>
          <CardHeader title="Informations" />
          <div className="px-6 pb-6 space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Version de l'application</span>
              <span className="font-medium">1.2.0</span>
            </div>
            <div className="flex justify-between">
              <span>Dernière mise à jour</span>
              <span className="font-medium">15 janvier 2024</span>
            </div>
            <div className="flex justify-between">
              <span>Stockage utilisé</span>
              <span className="font-medium">2.4 GB / 10 GB</span>
            </div>
            <div className="flex justify-between">
              <span>Membre depuis</span>
              <span className="font-medium">Mars 2020</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Boutons de sauvegarde */}
      <div className="p-6 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Sauvegarder les modifications</h3>
            <p className="text-sm text-gray-600">Vos préférences sont automatiquement sauvegardées</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">Réinitialiser</Button>
            <Button>Sauvegarder</Button>
          </div>
        </div>
      </div>
    </div>
  );
}