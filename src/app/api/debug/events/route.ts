import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';

// GET /api/debug/events - Endpoint de debug pour les événements
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Info de session
    const debugInfo = {
      session: {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        churchId: session?.user?.churchId,
        churchName: session?.user?.churchName,
        role: session?.user?.role
      },
      timestamp: new Date().toISOString()
    };

    if (!session?.user?.churchId) {
      return NextResponse.json({
        ...debugInfo,
        error: 'Pas de session ou churchId manquant',
        events: []
      });
    }

    // Récupérer tous les événements pour cette église (sans filtres)
    const allEvents = await prisma.schedule.findMany({
      where: {
        churchId: session.user.churchId
      },
      select: {
        id: true,
        title: true,
        date: true,
        type: true,
        status: true,
        location: true,
        description: true,
        churchId: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Info détaillée sur les événements
    const now = new Date();
    const eventsInfo = allEvents.map(event => ({
      ...event,
      dateRaw: event.date,
      dateFormatted: event.date.toISOString(),
      dateLocal: event.date.toLocaleString('fr-FR'),
      isUpcoming: event.date >= now,
      daysFromNow: Math.ceil((event.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }));

    const upcomingEvents = eventsInfo.filter(e => e.isUpcoming);

    return NextResponse.json({
      ...debugInfo,
      database: {
        totalEvents: allEvents.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: allEvents.length - upcomingEvents.length
      },
      currentTime: {
        now: now.toISOString(),
        nowLocal: now.toLocaleString('fr-FR'),
        timestamp: now.getTime()
      },
      events: eventsInfo.slice(0, 10), // Limiter à 10 pour l'affichage
      upcomingEventsPreview: upcomingEvents.slice(0, 5)
    });

  } catch (error) {
    console.error('Debug events error:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}