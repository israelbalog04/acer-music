'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';

interface SundayAvailability {
  id: string;
  isAvailable: boolean;
  timeSlots: string[];
  notes?: string;
  availabilityType: string;
  dayOfWeek: number;
}

export default function SundayAvailabilityPage() {
  const { userName, userId, churchName } = useUserData();
  const [availability, setAvailability] = useState<SundayAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedCultes, setSelectedCultes] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const culteOptions = [
    { value: 'cultes_1_2', label: '2 premiers cultes', description: 'Cultes 1 et 2 (8h-11h30)' },
    { value: 'cultes_3_4_5', label: '3 derniers cultes', description: 'Cultes 3, 4 et 5 (12h-17h30)' },
    { value: 'tous_cultes', label: 'Tous les cultes', description: 'Les 5 cultes (8h-17h30)' }
  ];

  // Charger la disponibilité générique pour les dimanches
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/availability?type=GENERIC&dayOfWeek=0'); // 0 = dimanche
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const sundayAvail = data[0];
            setAvailability(sundayAvail);
            setIsAvailable(sundayAvail.isAvailable);
            setSelectedCultes(sundayAvail.timeSlots);
            setNotes(sundayAvail.notes || '');
          }
        } else if (response.status !== 404) {
          console.error('Erreur lors du chargement:', response.status);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAvailability();
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const availabilityData = {
        availabilityType: 'GENERIC',
        dayOfWeek: 0, // Dimanche
        isAvailable,
        timeSlots: isAvailable ? selectedCultes : [],
        notes: notes.trim() || undefined
      };

      let response;
      if (availability) {
        // Modification
        response = await fetch(`/api/availability/${availability.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(availabilityData)
        });
      } else {
        // Création
        response = await fetch('/api/availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(availabilityData)
        });
      }

      if (response.ok) {
        const newAvailability = await response.json();
        setAvailability({
          ...newAvailability,
          timeSlots: newAvailability.timeSlots || []
        });
        setShowForm(false);
        
        // Message de succès
        alert('✅ Vos disponibilités pour les dimanches ont été enregistrées !');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    if (availability) {
      setIsAvailable(availability.isAvailable);
      setSelectedCultes(availability.timeSlots);
      setNotes(availability.notes || '');
    }
    setShowForm(true);
  };

  const handleCulteChange = (culte: string) => {
    setSelectedCultes([culte]); // Un seul choix possible
  };

  const getCulteLabel = (culte: string) => {
    return culteOptions.find(option => option.value === culte)?.label || culte;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CalendarDaysIcon className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Mes Disponibilités du Dimanche</h1>
              <p className="text-gray-600 text-lg mt-2">
                Indiquez votre disponibilité générale pour tous les cultes du dimanche
              </p>
            </div>
          </div>
        </div>

        {/* Informations */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-4">
            <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-1" />
            <div className="text-blue-800">
              <p className="font-medium text-lg mb-3">Comment ça marche ?</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">📅 Disponibilité générale :</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                    <li>Définissez votre disponibilité pour <strong>tous les dimanches</strong></li>
                    <li>Les responsables voient votre statut général</li>
                    <li>Vous pouvez modifier à tout moment</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🎵 Options de cultes :</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                    <li><strong>2 premiers cultes</strong> : Cultes 1 et 2 (8h-11h30)</li>
                    <li><strong>3 derniers cultes</strong> : Cultes 3, 4 et 5 (12h-17h30)</li>
                    <li><strong>Tous les cultes</strong> : Les 5 cultes (8h-17h30)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="max-w-4xl mx-auto">
          {/* État actuel */}
          {availability && !showForm ? (
            <Card className="p-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <MusicalNoteIcon className="h-6 w-6 mr-2" />
                    Ma Disponibilité du Dimanche
                  </h2>
                  <Button
                    onClick={handleEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
              </CardHeader>

              <div className={`border-2 rounded-xl p-6 ${
                availability.isAvailable 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center space-x-4 mb-4">
                  {availability.isAvailable ? (
                    <>
                      <CheckCircleIcon className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="text-xl font-bold text-green-800">Disponible les dimanches</h3>
                        <p className="text-green-700">Vous êtes disponible pour servir dans l'équipe de louange</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-8 w-8 text-red-600" />
                      <div>
                        <h3 className="text-xl font-bold text-red-800">Non disponible les dimanches</h3>
                        <p className="text-red-700">Vous n'êtes pas disponible pour servir</p>
                      </div>
                    </>
                  )}
                </div>

                {availability.isAvailable && availability.timeSlots.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Cultes disponibles :</h4>
                    <div className="grid md:grid-cols-1 gap-3">
                      {availability.timeSlots.map(culte => {
                        const option = culteOptions.find(opt => opt.value === culte);
                        return (
                          <div key={culte} className="bg-white border border-blue-200 rounded-lg p-4">
                            <div className="font-medium text-blue-900">{option?.label}</div>
                            <div className="text-sm text-blue-700">{option?.description}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {availability.notes && (
                  <div className="bg-white bg-opacity-70 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Notes :</h4>
                    <p className="text-gray-700">{availability.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            /* Formulaire */
            <Card className="p-8">
              <CardHeader>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {availability ? 'Modifier ma Disponibilité' : 'Définir ma Disponibilité du Dimanche'}
                </h2>
              </CardHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Statut principal */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <label className="block text-lg font-medium text-gray-900 mb-4">
                    Êtes-vous généralement disponible les dimanches ?
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isAvailable ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'
                    }`}>
                      <input
                        type="radio"
                        checked={isAvailable}
                        onChange={() => setIsAvailable(true)}
                        className="sr-only"
                      />
                      <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <div className="font-medium text-green-800">Oui, je suis disponible</div>
                        <div className="text-sm text-green-600">Prêt à servir dans l'équipe</div>
                      </div>
                    </label>
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      !isAvailable ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-300'
                    }`}>
                      <input
                        type="radio"
                        checked={!isAvailable}
                        onChange={() => setIsAvailable(false)}
                        className="sr-only"
                      />
                      <XCircleIcon className="h-6 w-6 text-red-600 mr-3" />
                      <div>
                        <div className="font-medium text-red-800">Non, pas disponible</div>
                        <div className="text-sm text-red-600">Indisponible les dimanches</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Options de cultes */}
                {isAvailable && (
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      Quels cultes vous conviennent ? <span className="text-sm text-gray-600">(un seul choix)</span>
                    </label>
                    <div className="space-y-3">
                      {culteOptions.map(option => (
                        <label key={option.value} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedCultes.includes(option.value) 
                            ? 'border-blue-500 bg-white' 
                            : 'border-gray-300 hover:border-blue-300 bg-white bg-opacity-50'
                        }`}>
                          <input
                            type="radio"
                            name="cultes"
                            checked={selectedCultes.includes(option.value)}
                            onChange={() => handleCulteChange(option.value)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 border-2 rounded-full mr-4 flex items-center justify-center ${
                            selectedCultes.includes(option.value) ? 'border-blue-500' : 'border-gray-300'
                          }`}>
                            {selectedCultes.includes(option.value) && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <MusicalNoteIcon className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    Notes ou précisions (optionnel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Disponible seulement 2 dimanches par mois, préfère jouer de la guitare, etc."
                  />
                </div>

                {/* Boutons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      if (availability) {
                        setIsAvailable(availability.isAvailable);
                        setSelectedCultes(availability.timeSlots);
                        setNotes(availability.notes || '');
                      }
                    }}
                    disabled={saving}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    disabled={saving}
                  >
                    {saving ? 'Enregistrement...' : (availability ? 'Mettre à jour' : 'Enregistrer')}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Première utilisation */}
          {!availability && !showForm && (
            <div className="text-center py-12">
              <MusicalNoteIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Définissez votre disponibilité
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par indiquer si vous êtes disponible les dimanches pour les cultes
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Définir ma disponibilité
              </Button>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}