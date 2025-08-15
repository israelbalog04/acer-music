import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';

// GET - Récupérer les DM d'un événement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.churchId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { eventId } = await params;
    
    // Vérifier que l'événement appartient à la même église
    const event = await prisma.schedule.findFirst({
      where: {
        id: eventId,
        churchId: session.user.churchId
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Récupérer les DM de cet événement
    const directors = await prisma.eventDirector.findMany({
      where: {
        scheduleId: eventId,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            instruments: true
          }
        },
        assignedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    return NextResponse.json({ directors });
  } catch (error) {
    console.error('Erreur lors de la récupération des DM:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Assigner un DM à un événement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.churchId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier les permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CHEF_LOUANGE') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { userId, notes } = await request.json();

    const { eventId } = await params;
    
    // Vérifier que l'événement appartient à la même église
    const event = await prisma.schedule.findFirst({
      where: {
        id: eventId,
        churchId: session.user.churchId
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur à assigner appartient à la même église
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        churchId: session.user.churchId
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier si l'utilisateur n'est pas déjà DM de cet événement
    const existingDirector = await prisma.eventDirector.findUnique({
      where: {
        scheduleId_userId: {
          scheduleId: eventId,
          userId: userId
        }
      }
    });

    if (existingDirector?.isActive) {
      return NextResponse.json({ error: 'Utilisateur déjà assigné comme DM' }, { status: 400 });
    }

    // Créer ou réactiver l'attribution
    const director = await prisma.eventDirector.upsert({
      where: {
        scheduleId_userId: {
          scheduleId: eventId,
          userId: userId
        }
      },
      update: {
        isActive: true,
        assignedById: session.user.id,
        assignedAt: new Date(),
        notes: notes || null
      },
      create: {
        scheduleId: eventId,
        userId: userId,
        churchId: session.user.churchId,
        assignedById: session.user.id,
        isActive: true,
        notes: notes || null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            instruments: true
          }
        }
      }
    });

    return NextResponse.json({ director });
  } catch (error) {
    console.error('Erreur lors de l\'assignation du DM:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Révoquer un DM d'un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.churchId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier les permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CHEF_LOUANGE') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { userId } = await request.json();

    const { eventId } = await params;
    
    // Désactiver l'attribution
    await prisma.eventDirector.updateMany({
      where: {
        scheduleId: eventId,
        userId: userId,
        churchId: session.user.churchId
      },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la révocation du DM:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}