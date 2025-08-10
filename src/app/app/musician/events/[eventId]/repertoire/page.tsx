'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  MusicalNoteIcon,
  CalendarIcon,
  ClockIcon,
  PlayIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface EventDetails {
  assignment: {
    id: string;
    role: string;
    instruments: string[];
    notes?: string;
  };
  event: {
    id: string;
    title: string;
    description?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    type: string;
    location?: string;
    status: string;
    directors: Array<{
      name: string;
      email: string;
    }>;
    songs: Array<{
      id: string;
      title: string;
      artist?: string;
      key?: string;
      youtubeUrl?: string;
      lyrics?: string;
      chords?: string;
      notes?: string;
      eventOrder?: number;
      eventKey?: string;
      eventNotes?: string;
      sequencesCount: number;
      tags: string[];
    }>;
  };
}

export default function MusicianEventRepertoirePage() {
  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSong, setExpandedSong] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      // Récupérer les détails de l'assignation
      const assignmentResponse = await fetch('/api/musician/events');
      if (assignmentResponse.ok) {
        const data = await assignmentResponse.json();
        const assignment = data.events.find((e: any) => e.event.id === eventId);
        
        if (assignment) {
          setEventDetails({
            assignment: {
              id: assignment.assignmentId,
              role: assignment.role,
              instruments: assignment.instruments,
              notes: assignment.notes
            },
            event: assignment.event
          });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let dayIndicator = '';
    if (diffDays === 0) dayIndicator = ' (Aujourd\'hui)';
    else if (diffDays === 1) dayIndicator = ' (Demain)';
    else if (diffDays <= 7) dayIndicator = ` (Dans ${diffDays} jours)`;
    
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + dayIndicator;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Événement non trouvé ou non assigné</p>
        <Link href="/app/musician/events">
          <Button className="mt-4">Retour à mes événements</Button>
        </Link>
      </div>
    );
  }

  const { assignment, event } = eventDetails;
  const isUrgent = new Date(event.date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000; // moins de 3 jours

  return (
    <RoleGuard allowedRoles={[UserRole.MUSICIEN, UserRole.CHEF_LOUANGE, UserRole.TECHNICIEN, UserRole.ADMIN]}>
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <Link href="/app/musician/events">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Mes événements
            </Button>
          </Link>
        </div>

        {/* Header de l'événement */}
        <Card className={isUrgent ? 'border-orange-200 bg-orange-50' : ''}>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <MusicalNoteIcon className="h-6 w-6 mr-2 text-blue-600" />
                  {event.title}
                </h1>
                {event.description && (
                  <p className="text-gray-600 mt-1">{event.description}</p>
                )}
              </div>
              {isUrgent && (
                <div className="flex items-center text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Urgent</span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                  {formatDate(event.date)}
                </div>
                {(event.startTime || event.endTime) && (
                  <div className="flex items-center text-gray-700">
                    <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                    {event.startTime && <span>{event.startTime.slice(0, 5)}</span>}
                    {event.startTime && event.endTime && <span> - </span>}
                    {event.endTime && <span>{event.endTime.slice(0, 5)}</span>}
                  </div>
                )}
                {event.location && (
                  <p className="text-gray-700">📍 {event.location}</p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Votre assignation</h3>
                <p className="text-blue-700 font-medium">{assignment.role}</p>
                {assignment.instruments.length > 0 && (
                  <p className="text-blue-600 text-sm">
                    🎸 {assignment.instruments.join(', ')}
                  </p>
                )}
                {assignment.notes && (
                  <p className="text-blue-600 text-sm italic mt-2">
                    💡 {assignment.notes}
                  </p>
                )}
              </div>
            </div>

            {event.directors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
                <div className="flex flex-wrap gap-4">
                  {event.directors.map((director, i) => (
                    <div key={i} className="text-sm">
                      <span className="text-gray-700">{director.name}</span>
                      <a href={`mailto:${director.email}`} className="ml-2 text-blue-600 hover:underline">
                        {director.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Répertoire détaillé */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              Répertoire à préparer ({event.songs.length} morceaux)
            </h2>
          </CardHeader>
          <div className="p-6">
            {event.songs.length === 0 ? (
              <div className="text-center py-8">
                <MusicalNoteIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun morceau défini pour cet événement</p>
              </div>
            ) : (
              <div className="space-y-4">
                {event.songs
                  .sort((a, b) => (a.eventOrder || 999) - (b.eventOrder || 999))
                  .map((song, index) => (
                    <Card key={song.id} className="border border-gray-200">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                              {song.eventOrder || index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{song.title}</h3>
                              {song.artist && (
                                <p className="text-gray-600">{song.artist}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2">
                                {(song.eventKey || song.key) && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded font-medium">
                                    Tonalité: {song.eventKey || song.key}
                                  </span>
                                )}
                                {song.tags.length > 0 && (
                                  <div className="flex space-x-1">
                                    {song.tags.slice(0, 2).map((tag, i) => (
                                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {song.eventNotes && (
                                <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400">
                                  <p className="text-yellow-800 text-sm">
                                    <strong>Note pour cet événement:</strong> {song.eventNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {song.sequencesCount > 0 && (
                              <span className="flex items-center text-green-600 text-sm">
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                {song.sequencesCount} partition{song.sequencesCount > 1 ? 's' : ''}
                              </span>
                            )}
                            {song.youtubeUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(song.youtubeUrl, '_blank')}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <PlayIcon className="h-4 w-4 mr-1" />
                                YouTube
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setExpandedSong(expandedSong === song.id ? null : song.id)}
                            >
                              {expandedSong === song.id ? 'Moins' : 'Détails'}
                            </Button>
                          </div>
                        </div>

                        {/* Détails étendus */}
                        {expandedSong === song.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            {song.youtubeUrl && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Vidéo de référence</h4>
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                  <iframe
                                    src={song.youtubeUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                  />
                                </div>
                              </div>
                            )}

                            {song.lyrics && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Paroles</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                                    {song.lyrics}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {song.chords && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Accords</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                    {song.chords}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {song.notes && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Notes du morceau</h4>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <p className="text-blue-800 text-sm">{song.notes}</p>
                                </div>
                              </div>
                            )}

                            {song.sequencesCount > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Séquences disponibles</h4>
                                <p className="text-gray-600 text-sm">
                                  {song.sequencesCount} séquence{song.sequencesCount > 1 ? 's' : ''} disponible{song.sequencesCount > 1 ? 's' : ''} pour ce morceau.
                                  Contactez votre directeur musical pour y accéder.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </Card>

        {/* Actions en bas */}
        <Card className="bg-green-50 border-green-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Prêt pour cet événement ?</p>
                  <p className="text-green-700 text-sm">Assurez-vous d'avoir préparé tous les morceaux ci-dessus</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-800 font-medium">
                  {formatDate(event.date)}
                </p>
                {(event.startTime || event.endTime) && (
                  <p className="text-green-700 text-sm">
                    {event.startTime && event.startTime.slice(0, 5)}
                    {event.startTime && event.endTime && ' - '}
                    {event.endTime && event.endTime.slice(0, 5)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
}