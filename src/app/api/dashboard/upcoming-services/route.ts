import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Récupérer les prochains événements
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer l'utilisateur et son église
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { churchId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer les prochains événements (limité à 5)
    const upcomingEvents = await prisma.schedule.findMany({
      where: {
        churchId: user.churchId,
        isActive: true,
        date: {
          gte: new Date() // Événements à partir d'aujourd'hui
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      take: 5,
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        endTime: true,
        type: true,
        description: true,
        location: true
      }
    });

    // Formater les événements pour l'affichage
    const formattedEvents = upcomingEvents.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      description: event.description,
      location: event.location,
      // Calculer le nombre de jours jusqu'à l'événement
      daysUntil: Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      // Formater la date pour l'affichage
      formattedDate: new Date(event.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }),
      // Formater l'heure pour l'affichage
      formattedTime: `${event.startTime} - ${event.endTime}`
    }));

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      count: formattedEvents.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des prochains services:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
