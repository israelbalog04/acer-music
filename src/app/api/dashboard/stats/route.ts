import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Récupérer les statistiques du dashboard
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

    // Calculer les statistiques
    const [
      totalEvents,
      totalUsers,
      totalSongs,
      eventsThisMonth,
      upcomingEvents
    ] = await Promise.all([
      // Total des événements
      prisma.schedule.count({
        where: {
          churchId: user.churchId,
          isActive: true
        }
      }),
      
      // Total des utilisateurs
      prisma.user.count({
        where: {
          churchId: user.churchId
        }
      }),
      
      // Total des chants
      prisma.song.count({
        where: {
          churchId: user.churchId
        }
      }),
      
      // Événements ce mois
      prisma.schedule.count({
        where: {
          churchId: user.churchId,
          isActive: true,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        }
      }),
      
      // Prochains événements (7 jours)
      prisma.schedule.count({
        where: {
          churchId: user.churchId,
          isActive: true,
          date: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Statistiques par type d'événement
    const eventsByType = await prisma.schedule.groupBy({
      by: ['type'],
      where: {
        churchId: user.churchId,
        isActive: true,
        date: {
          gte: new Date()
        }
      },
      _count: {
        type: true
      }
    });

    const stats = {
      totalEvents,
      totalUsers,
      totalSongs,
      eventsThisMonth,
      upcomingEvents,
      eventsByType: eventsByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
