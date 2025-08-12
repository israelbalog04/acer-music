import { NextRequest, NextResponse } from 'next/server';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Récupérer les notifications de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const unread = searchParams.get('unread');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Construire la requête avec Prisma
    const whereClause: any = {
      userId: user.id,
      churchId: user.churchId
    };
    
    if (unread === 'true') {
      whereClause.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json(notifications);

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Marquer une notification comme lue
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Erreur lors du parsing du body:', error);
      return NextResponse.json({ error: 'Body de requête invalide' }, { status: 400 });
    }
    
    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json({ error: 'ID de notification requis' }, { status: 400 });
    }

    // Marquer la notification comme lue
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: user.id
      },
      data: {
        isRead: isRead,
        readAt: isRead ? new Date() : null
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}