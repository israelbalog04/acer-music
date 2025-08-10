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
  PencilIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface SundayAvailability {
  id?: string;
  specificDate: Date;
  isAvailable: boolean;
  timeSlots: string[];
  notes?: string;
}

export default function WeeklyAvailabilityPage() {
  const { userName, userId, churchName } = useUserData();
  const [availabilities, setAvailabilities] = useState<SundayAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    isAvailable: true,
    timeSlots: [] as string[],
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const timeSlotOptions = [
    { value: 'matin', label: 'Matin (8h-12h)', description: 'Pré-service, répétition' },
    { value: 'apres-midi', label: 'Après-midi (12h-18h)', description: 'Culte principal' },
    { value: 'soir', label: 'Soir (18h-22h)', description: 'Culte du soir' }
  ];

  // Générer les prochains dimanches (3 mois)
  const generateSundays = (startDate: Date, count: number = 12): Date[] => {
    const sundays: Date[] = [];
    const current = new Date(startDate);
    
    // Aller au prochain dimanche
    current.setDate(current.getDate() + (7 - current.getDay()));
    
    for (let i = 0; i < count; i++) {
      sundays.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    
    return sundays;
  };

  const upcomingSundays = generateSundays(new Date());

  // Charger les disponibilités existantes
  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/availability?type=GENERIC');
        if (response.ok) {
          const data = await response.json();
          const sundayAvailabilities = data
            .filter((item: any) => item.specificDate)
            .map((item: any) => ({
              ...item,
              specificDate: new Date(item.specificDate)
            }));
          setAvailabilities(sundayAvailabilities);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAvailabilities();
    }
  }, [userId]);

  const getAvailabilityForDate = (date: Date): SundayAvailability | null => {
    return availabilities.find(avail => 
      avail.specificDate.toDateString() === date.toDateString()
    ) || null;
  };

  const handleEditStart = (date: Date) => {
    const existing = getAvailabilityForDate(date);
    if (existing) {
      setEditForm({
        isAvailable: existing.isAvailable,
        timeSlots: existing.timeSlots,
        notes: existing.notes || ''
      });
    } else {
      setEditForm({
        isAvailable: true,
        timeSlots: ['apres-midi'], // Par défaut culte principal
        notes: ''
      });
    }
    setEditingDate(date.toISOString());
  };

  const handleSave = async (date: Date) => {
    try {
      setSaving(true);
      
      const existing = getAvailabilityForDate(date);
      const availabilityData = {
        availabilityType: 'GENERIC',
        specificDate: date.toISOString(),
        isAvailable: editForm.isAvailable,
        timeSlots: editForm.isAvailable ? editForm.timeSlots : [],
        notes: editForm.notes.trim() || undefined
      };

      let response;
      if (existing?.id) {
        // Modification
        response = await fetch(`/api/availability/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(availabilityData)
        });
      } else {
        // Création
        response = await fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(availabilityData)
        });
      }

      if (response.ok) {
        const savedAvailability = await response.json();
        
        // Mettre à jour l'état local
        setAvailabilities(prev => {
          const filtered = prev.filter(a => a.specificDate.toDateString() !== date.toDateString());
          return [...filtered, {
            ...savedAvailability,
            specificDate: new Date(savedAvailability.specificDate || savedAvailability.createdAt)
          }];
        });
        
        setEditingDate(null);
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

  const handleTimeSlotToggle = (timeSlot: string) => {
    setEditForm(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(timeSlot)
        ? prev.timeSlots.filter(slot => slot !== timeSlot)
        : [...prev.timeSlots, timeSlot]
    }));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (availability: SundayAvailability | null) => {
    if (!availability) return 'border-gray-200 bg-gray-50';
    if (availability.isAvailable) return 'border-green-200 bg-green-50';
    return 'border-red-200 bg-red-50';
  };

  const getStatusIcon = (availability: SundayAvailability | null) => {
    if (!availability) return <ClockIcon className="h-5 w-5 text-gray-400" />;
    if (availability.isAvailable) return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    return <XCircleIcon className="h-5 w-5 text-red-600" />;
  };

  const getStatusText = (availability: SundayAvailability | null) => {
    if (!availability) return 'Non défini';
    if (availability.isAvailable) return 'Disponible';
    return 'Non disponible';
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
              <h1 className="text-4xl font-bold text-gray-900">Mes Disponibilités par Dimanche</h1>
              <p className="text-gray-600 text-lg mt-2">
                Indiquez votre disponibilité pour chaque dimanche à venir
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
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">📅 Par dimanche :</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                    <li>Répondez pour <strong>chaque dimanche</strong> spécifiquement</li>
                    <li>Si vous voyagez un weekend, marquez-vous indisponible</li>
                    <li>Vos réponses aident les responsables à planifier</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">⏰ Créneaux :</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                    <li><strong>Matin</strong> : Répétitions et préparation</li>
                    <li><strong>Après-midi</strong> : Culte principal (le plus important)</li>
                    <li><strong>Soir</strong> : Culte du soir (occasionnel)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Liste des dimanches */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Prochains Dimanches
          </h2>
          
          <div className="space-y-4">
            {upcomingSundays.map((sunday, index) => {
              const availability = getAvailabilityForDate(sunday);
              const isEditing = editingDate === sunday.toISOString();
              const isPast = sunday < new Date();

              return (
                <Card key={sunday.toISOString()} className={`p-6 transition-all ${getStatusColor(availability)} ${isPast ? 'opacity-50' : ''}`}>
                  {!isEditing ? (
                    // Vue normale
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(availability)}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {formatDate(sunday)}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`text-sm font-medium ${
                              availability?.isAvailable ? 'text-green-700' : 
                              availability ? 'text-red-700' : 'text-gray-600'
                            }`}>
                              {getStatusText(availability)}
                            </span>
                            
                            {availability?.isAvailable && availability.timeSlots.length > 0 && (
                              <div className="flex space-x-1">
                                {availability.timeSlots.map(slot => (
                                  <span key={slot} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {timeSlotOptions.find(opt => opt.value === slot)?.label.split(' ')[0]}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {availability?.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Note:</span> {availability.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {!isPast && (
                        <Button
                          onClick={() => handleEditStart(sunday)}
                          variant="outline"
                          size="sm"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          {availability ? 'Modifier' : 'Définir'}
                        </Button>
                      )}
                    </div>
                  ) : (
                    // Formulaire d'édition
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {formatDate(sunday)}
                      </h3>
                      
                      {/* Statut */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Votre disponibilité ce dimanche :
                        </label>
                        <div className="grid md:grid-cols-2 gap-3">
                          <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            editForm.isAvailable ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'
                          }`}>
                            <input
                              type="radio"
                              checked={editForm.isAvailable}
                              onChange={() => setEditForm(prev => ({ ...prev, isAvailable: true }))}
                              className="sr-only"
                            />
                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                            <span className="font-medium">Disponible</span>
                          </label>
                          
                          <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            !editForm.isAvailable ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-300'
                          }`}>
                            <input
                              type="radio"
                              checked={!editForm.isAvailable}
                              onChange={() => setEditForm(prev => ({ ...prev, isAvailable: false }))}
                              className="sr-only"
                            />
                            <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                            <span className="font-medium">Non disponible</span>
                          </label>
                        </div>
                      </div>
                      
                      {/* Créneaux si disponible */}
                      {editForm.isAvailable && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Créneaux disponibles :
                          </label>
                          <div className="space-y-2">
                            {timeSlotOptions.map(option => (
                              <label key={option.value} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                editForm.timeSlots.includes(option.value) 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-300 hover:border-blue-300'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={editForm.timeSlots.includes(option.value)}
                                  onChange={() => handleTimeSlotToggle(option.value)}
                                  className="sr-only"
                                />
                                <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                                  editForm.timeSlots.includes(option.value) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                }`}>
                                  {editForm.timeSlots.includes(option.value) && (
                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-xs text-gray-500">{option.description}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes (optionnel) :
                        </label>
                        <textarea
                          value={editForm.notes}
                          onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Voyage en famille, disponible seulement le matin..."
                        />
                      </div>
                      
                      {/* Actions */}
                      <div className="flex justify-end space-x-3">
                        <Button
                          onClick={() => setEditingDate(null)}
                          variant="outline"
                          disabled={saving}
                        >
                          Annuler
                        </Button>
                        <Button
                          onClick={() => handleSave(sunday)}
                          disabled={saving || (editForm.isAvailable && editForm.timeSlots.length === 0)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Résumé */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              📊 Mon Résumé
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {availabilities.filter(a => a.isAvailable).length}
                </div>
                <div className="text-sm text-gray-600">Disponible</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {availabilities.filter(a => !a.isAvailable).length}
                </div>
                <div className="text-sm text-gray-600">Non disponible</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {upcomingSundays.length - availabilities.length}
                </div>
                <div className="text-sm text-gray-600">À définir</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}