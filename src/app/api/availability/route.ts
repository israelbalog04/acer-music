import { NextRequest, NextResponse } from 'next/server';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Récupérer les disponibilités de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { church: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer les disponibilités génériques (hebdomadaires)
    const weeklyAvailabilities = await prisma.availability.findMany({
      where: {
        userId: user.id,
        availabilityType: 'GENERIC',
        scheduleId: null
      },
      orderBy: { dayOfWeek: 'asc' }
    });

    // Récupérer les disponibilités pour des événements spécifiques
    const eventAvailabilities = await prisma.availability.findMany({
      where: {
        userId: user.id,
        availabilityType: 'EVENT',
        scheduleId: { not: null }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Récupérer les événements associés
    const scheduleIds = eventAvailabilities
      .map(a => a.scheduleId)
      .filter(Boolean) as string[];
    
    const schedules = await prisma.schedule.findMany({
      where: { id: { in: scheduleIds } },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        date: true
      }
    });

    // Formater les données pour le frontend
    const formattedWeekly = weeklyAvailabilities.map(av => ({
      id: av.id,
      dayOfWeek: av.dayOfWeek,
      dayName: getDayName(av.dayOfWeek!),
      isAvailable: av.isAvailable,
      timeSlots: av.timeSlots ? JSON.parse(av.timeSlots) : [],
      notes: av.notes || ''
    }));

    // Créer un map pour un accès rapide
    const scheduleMap = new Map(schedules.map(s => [s.id, s]));

    const formattedEvents = eventAvailabilities.map(av => {
      const schedule = av.scheduleId ? scheduleMap.get(av.scheduleId) : null;
      return {
        id: av.id,
        eventId: av.scheduleId,
        eventTitle: schedule?.title || 'Événement inconnu',
        eventDate: schedule?.date || av.specificDate,
        isAvailable: av.isAvailable,
        timeSlots: av.timeSlots ? JSON.parse(av.timeSlots) : [],
        notes: av.notes || ''
      };
    });

    return NextResponse.json({
      weekly: formattedWeekly,
      events: formattedEvents
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour les disponibilités
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { weekly, events } = body;

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Traitement des disponibilités hebdomadaires
    if (weekly && Array.isArray(weekly)) {
      for (const dayAvailability of weekly) {
        const existing = await prisma.availability.findFirst({
          where: {
            userId: user.id,
            availabilityType: 'GENERIC',
            dayOfWeek: dayAvailability.dayOfWeek,
            churchId: user.churchId
          }
        });

        const availabilityData = {
          isAvailable: dayAvailability.isAvailable,
          timeSlots: JSON.stringify(dayAvailability.timeSlots || []),
          notes: dayAvailability.notes || '',
          churchId: user.churchId
        };

        if (existing) {
          // Mettre à jour
          await prisma.availability.update({
            where: { id: existing.id },
            data: availabilityData
          });
        } else {
          // Créer
          await prisma.availability.create({
            data: {
              ...availabilityData,
              userId: user.id,
              availabilityType: 'GENERIC',
              dayOfWeek: dayAvailability.dayOfWeek
            }
          });
        }
      }
    }

    // Traitement des disponibilités d'événements
    if (events && Array.isArray(events)) {
      for (const eventAvailability of events) {
        if (!eventAvailability.eventId) continue;

        const existing = await prisma.availability.findFirst({
          where: {
            userId: user.id,
            availabilityType: 'EVENT',
            scheduleId: eventAvailability.eventId
          }
        });

        const availabilityData = {
          isAvailable: eventAvailability.isAvailable,
          timeSlots: JSON.stringify(eventAvailability.timeSlots || []),
          notes: eventAvailability.notes || '',
          churchId: user.churchId
        };

        if (existing) {
          // Mettre à jour
          await prisma.availability.update({
            where: { id: existing.id },
            data: availabilityData
          });
        } else {
          // Créer
          await prisma.availability.create({
            data: {
              ...availabilityData,
              userId: user.id,
              availabilityType: 'EVENT',
              scheduleId: eventAvailability.eventId
            }
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Disponibilités sauvegardées avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde des disponibilités:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour obtenir le nom du jour
function getDayName(dayOfWeek: number): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayOfWeek] || 'Inconnu';
}