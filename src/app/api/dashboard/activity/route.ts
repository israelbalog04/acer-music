import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Récupérer l'activité récente
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

    // Récupérer les événements récents créés
    const recentEvents = await prisma.schedule.findMany({
      where: {
        churchId: user.churchId,
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 derniers jours
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        date: true,
        createdAt: true
      }
    });

    // Formater l'activité
    const activities = recentEvents.map((event, index) => ({
      id: `event-${event.id}`,
      message: `Nouvel événement créé : ${event.title}`,
      timestamp: new Date(event.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'info' as const
    }));

    // Ajouter des activités par défaut si aucune activité récente
    if (activities.length === 0) {
      activities.push(
        {
          id: 'welcome-1',
          message: 'Bienvenue sur votre dashboard !',
          timestamp: 'Maintenant',
          type: 'success' as const
        },
        {
          id: 'welcome-2',
          message: 'Créez votre premier événement pour commencer',
          timestamp: 'Maintenant',
          type: 'info' as const
        }
      );
    }

    return NextResponse.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
