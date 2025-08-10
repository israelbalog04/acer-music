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
  MusicalNoteIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

interface WeekendAvailability {
  id?: string;
  specificDate: Date;
  dayType: 'SATURDAY' | 'SUNDAY';
  isAvailable: boolean;
  timeSlots: string[];
  notes?: string;
}

export default function WeekendAvailabilityPage() {
  const { userName, userId, churchName } = useUserData();
  const [availabilities, setAvailabilities] = useState<WeekendAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    isAvailable: true,
    timeSlots: [] as string[],
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  

  // Horaires basés sur les pratiques typiques d'ACER
  const saturdaySlotOptions = [
    { value: 'available', label: 'Disponible', description: 'Disponible pour les répétitions' }
  ];

  const sundaySlotOptions = [
    { value: 'service1', label: '7h-8h30', description: '1er Culte - Service matinal' },
    { value: 'service2', label: '9h-10h30', description: '2ème Culte - Service du matin' },
    { value: 'service3', label: '11h-12h30', description: '3ème Culte - Service principal' },
    { value: 'service4', label: '14h-15h30', description: '4ème Culte - Service après-midi' },
    { value: 'service5', label: '16h-17h30', description: '5ème Culte - Service de clôture' }
  ];

  // Générer les prochains weekends (samedi + dimanche)
  const generateWeekends = (startDate: Date, count: number = 8): Date[] => {
    const weekends: Date[] = [];
    const current = new Date(startDate);
    
    // Aller au prochain samedi
    const daysUntilSaturday = 6 - current.getDay();
    current.setDate(current.getDate() + daysUntilSaturday);
    
    for (let i = 0; i < count; i++) {
      // Samedi
      weekends.push(new Date(current));
      // Dimanche
      const sunday = new Date(current);
      sunday.setDate(current.getDate() + 1);
      weekends.push(sunday);
      
      // Semaine suivante
      current.setDate(current.getDate() + 7);
    }
    
    return weekends;
  };

  const upcomingWeekends = generateWeekends(new Date());

  // Charger les disponibilités existantes
  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/availability?type=GENERIC');
        if (response.ok) {
          const data = await response.json();
          const weekendAvailabilities = data
            .filter((item: any) => item.specificDate)
            .map((item: any) => {
              const date = new Date(item.specificDate);
              return {
                ...item,
                specificDate: date,
                dayType: date.getDay() === 6 ? 'SATURDAY' : 'SUNDAY'
              };
            });
          setAvailabilities(weekendAvailabilities);
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

  const getAvailabilityForDate = (date: Date): WeekendAvailability | null => {
    return availabilities.find(avail => 
      avail.specificDate.toDateString() === date.toDateString()
    ) || null;
  };

  const getDayType = (date: Date): 'SATURDAY' | 'SUNDAY' => {
    return date.getDay() === 6 ? 'SATURDAY' : 'SUNDAY';
  };

  const getSlotOptions = (dayType: 'SATURDAY' | 'SUNDAY') => {
    return dayType === 'SATURDAY' ? saturdaySlotOptions : sundaySlotOptions;
  };

  const handleEditStart = (date: Date) => {
    const existing = getAvailabilityForDate(date);
    const dayType = getDayType(date);
    
    if (existing) {
      setEditForm({
        isAvailable: existing.isAvailable,
        timeSlots: existing.timeSlots,
        notes: existing.notes || ''
      });
    } else {
      // Sélection par défaut selon le jour
      const defaultSlots = dayType === 'SATURDAY' 
        ? ['available'] // Disponible pour répétitions
        : ['service3']; // Culte principal
      
      setEditForm({
        isAvailable: true,
        timeSlots: defaultSlots,
        notes: ''
      });
    }
    
    setModalDate(date);
    setShowModal(true);
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
        response = await fetch(`/api/availability/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(availabilityData)
        });
      } else {
        response = await fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(availabilityData)
        });
      }

      if (response.ok) {
        const savedAvailability = await response.json();
        
        setAvailabilities(prev => {
          const filtered = prev.filter(a => a.specificDate.toDateString() !== date.toDateString());
          return [...filtered, {
            ...savedAvailability,
            specificDate: new Date(savedAvailability.specificDate || savedAvailability.createdAt),
            dayType: getDayType(date)
          }];
        });
        
        setShowModal(false);
        setModalDate(null);
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

  const getStatusColor = (availability: WeekendAvailability | null, dayType: 'SATURDAY' | 'SUNDAY') => {
    const baseColor = dayType === 'SATURDAY' ? 'purple' : 'blue';
    if (!availability) return `border-gray-200 bg-gray-50`;
    if (availability.isAvailable) return `border-${baseColor}-200 bg-${baseColor}-50`;
    return `border-red-200 bg-red-50`;
  };

  const getStatusIcon = (availability: WeekendAvailability | null) => {
    if (!availability) return <ClockIcon className="h-5 w-5 text-gray-400" />;
    if (availability.isAvailable) return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    return <XCircleIcon className="h-5 w-5 text-red-600" />;
  };

  const getStatusText = (availability: WeekendAvailability | null) => {
    if (!availability) return 'Non défini';
    if (availability.isAvailable) return 'Disponible';
    return 'Non disponible';
  };

  const getDayIcon = (dayType: 'SATURDAY' | 'SUNDAY') => {
    return dayType === 'SATURDAY' 
      ? <MicrophoneIcon className="h-5 w-5 text-purple-600" />
      : <MusicalNoteIcon className="h-5 w-5 text-blue-600" />;
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

  // Grouper par weekend
  const weekendGroups: Date[][] = [];
  for (let i = 0; i < upcomingWeekends.length; i += 2) {
    weekendGroups.push(upcomingWeekends.slice(i, i + 2));
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CalendarDaysIcon className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Mes Disponibilités Weekend</h1>
              <p className="text-gray-600 text-lg mt-2">
                Répétitions du samedi • 5 Cultes du dimanche
              </p>
            </div>
          </div>
          
        </div>

        {/* Informations */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-start space-x-4">
            <InformationCircleIcon className="h-6 w-6 text-purple-600 mt-1" />
            <div className="text-gray-800">
              <p className="font-medium text-lg mb-3">Organisation ACER :</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white bg-opacity-70 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-purple-800 flex items-center">
                    <MicrophoneIcon className="h-4 w-4 mr-2" />
                    🎵 Samedi - Répétitions
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Répétitions avec l'équipe de louange</li>
                    <li>Préparation des chants du dimanche</li>
                    <li>Répétitions techniques et arrangements</li>
                  </ul>
                </div>
                <div className="bg-white bg-opacity-70 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-blue-800 flex items-center">
                    <MusicalNoteIcon className="h-4 w-4 mr-2" />
                    ⛪ Dimanche - 5 Cultes
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li><strong>7h-8h30</strong> : 1er Culte matinal</li>
                    <li><strong>9h-10h30</strong> : 2ème Culte</li>
                    <li><strong>11h-12h30</strong> : 3ème Culte principal</li>
                    <li><strong>14h-15h30</strong> : 4ème Culte</li>
                    <li><strong>16h-17h30</strong> : 5ème Culte de clôture</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Liste des weekends */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Prochains Weekends
          </h2>
          
          <div className="space-y-8">
            {weekendGroups.map((weekend, weekIndex) => (
              <div key={weekIndex} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                  Weekend du {weekend[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {weekend.map((date) => {
                    const dayType = getDayType(date);
                    const availability = getAvailabilityForDate(date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Start of today
                    const isPast = date < today;
                    

                    return (
                      <Card key={date.toISOString()} 
                            className={`p-5 transition-all ${dayType === 'SATURDAY' ? 'border-purple-200 bg-purple-50' : 'border-blue-200 bg-blue-50'} ${isPast ? 'opacity-50' : ''}`}>
                        
                        {/* Vue normale */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {getDayIcon(dayType)}
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {formatDate(date)}
                                  </h4>
                                  <p className={`text-sm ${dayType === 'SATURDAY' ? 'text-purple-600' : 'text-blue-600'}`}>
                                    {dayType === 'SATURDAY' ? 'Jour de répétition' : '5 Cultes'}
                                  </p>
                                </div>
                              </div>
                              
                              {!isPast && (
                                <Button
                                  onClick={() => handleEditStart(date)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <PencilIcon className="h-4 w-4 mr-1" />
                                  {availability ? 'Modifier' : 'Définir'}
                                </Button>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(availability)}
                              <span className={`font-medium ${
                                availability?.isAvailable ? 'text-green-700' : 
                                availability ? 'text-red-700' : 'text-gray-600'
                              }`}>
                                {getStatusText(availability)}
                              </span>
                            </div>
                            
                            {availability?.isAvailable && availability.timeSlots.length > 0 && (
                              <div className="space-y-1">
                                {availability.timeSlots.map(slot => {
                                  const slotInfo = getSlotOptions(dayType).find(opt => opt.value === slot);
                                  return (
                                    <div key={slot} className="text-xs bg-white bg-opacity-70 rounded px-2 py-1">
                                      <span className="font-medium">{slotInfo?.label}</span>
                                      {slotInfo?.description && (
                                        <span className="text-gray-600 ml-2">• {slotInfo.description}</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            
                            {availability?.notes && (
                              <p className="text-xs text-gray-600 bg-white bg-opacity-70 rounded p-2">
                                <span className="font-medium">Note:</span> {availability.notes}
                              </p>
                            )}
                          </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Résumé */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              📊 Mon Résumé Weekend
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {availabilities.filter(a => a.dayType === 'SATURDAY' && a.isAvailable).length}
                </div>
                <div className="text-sm text-gray-600">Samedis disponible</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {availabilities.filter(a => a.dayType === 'SUNDAY' && a.isAvailable).length}
                </div>
                <div className="text-sm text-gray-600">Dimanches disponible</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {availabilities.filter(a => !a.isAvailable).length}
                </div>
                <div className="text-sm text-gray-600">Non disponible</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {upcomingWeekends.length - availabilities.length}
                </div>
                <div className="text-sm text-gray-600">À définir</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Modal de définition de disponibilité */}
        {showModal && modalDate && (
          <div 
            className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
                setModalDate(null);
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getDayIcon(getDayType(modalDate))}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Définir ma disponibilité
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(modalDate)} • {getDayType(modalDate) === 'SATURDAY' ? 'Répétitions' : '5 Cultes'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setModalDate(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSave(modalDate);
                }} className="space-y-4">
                  
                  {/* Disponibilité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Votre disponibilité pour cette date
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <div
                        onClick={() => setEditForm(prev => ({ ...prev, isAvailable: true }))}
                        className={`cursor-pointer p-6 border-2 rounded-xl text-center transition-all select-none hover:shadow-lg active:scale-95 ${
                          editForm.isAvailable
                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 text-green-700 shadow-md ring-2 ring-green-200'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-25'
                        }`}
                      >
                        <CheckCircleIcon className="h-10 w-10 mx-auto mb-3" />
                        <div className="font-semibold text-lg">✅ Je suis disponible</div>
                        <div className="text-sm mt-1 opacity-80">
                          {getDayType(modalDate) === 'SATURDAY' ? 'Je peux participer aux répétitions' : 'Je peux participer aux cultes'}
                        </div>
                      </div>
                      
                      <div
                        onClick={() => setEditForm(prev => ({ ...prev, isAvailable: false }))}
                        className={`cursor-pointer p-6 border-2 rounded-xl text-center transition-all select-none hover:shadow-lg active:scale-95 ${
                          !editForm.isAvailable
                            ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 text-red-700 shadow-md ring-2 ring-red-200'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:bg-red-25'
                        }`}
                      >
                        <XCircleIcon className="h-10 w-10 mx-auto mb-3" />
                        <div className="font-semibold text-lg">❌ Je ne suis pas disponible</div>
                        <div className="text-sm mt-1 opacity-80">
                          {getDayType(modalDate) === 'SATURDAY' ? 'Je ne peux pas participer aux répétitions' : 'Je ne peux pas participer aux cultes'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Créneaux horaires */}
                  {editForm.isAvailable && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {getDayType(modalDate) === 'SATURDAY' ? 'Répétitions disponibles' : 'Cultes disponibles'}
                      </label>
                      <div className="space-y-2">
                        {getSlotOptions(getDayType(modalDate)).map(option => (
                          <div
                            key={option.value}
                            onClick={() => handleTimeSlotToggle(option.value)}
                            className={`cursor-pointer p-3 border-2 rounded-lg text-center transition-all select-none hover:shadow-md active:scale-95 ${
                              editForm.timeSlots.includes(option.value)
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-25'
                            }`}
                          >
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Cliquez sur les créneaux où vous êtes disponible (plusieurs choix possibles)
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Retard possible, préférence pour un instrument..."
                    />
                  </div>

                  {/* Boutons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowModal(false);
                        setModalDate(null);
                      }}
                      disabled={saving}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={saving || (editForm.isAvailable && editForm.timeSlots.length === 0)}
                    >
                      {saving ? 'Enregistrement...' : 'Enregistrer ma disponibilité'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}