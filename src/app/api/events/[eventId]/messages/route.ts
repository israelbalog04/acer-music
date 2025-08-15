import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';

// GET - Récupérer tous les messages d'un événement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId || !session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId } = await params;

    // Vérifier que l'événement existe et appartient à la même église
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: eventId,
        churchId: session.user.churchId
      }
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Récupérer les messages
    const messages = await prisma.eventMessage.findMany({
      where: {
        scheduleId: eventId,
        churchId: session.user.churchId,
        isDeleted: false
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        parent: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        replies: {
          where: { isDeleted: false },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages);

  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId || !session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId } = await params;
    const body = await request.json();
    const { content, messageType = 'TEXT', parentId } = body;

    // Validation
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu du message ne peut pas être vide' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Le message ne peut pas dépasser 2000 caractères' },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe et appartient à la même église
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: eventId,
        churchId: session.user.churchId
      }
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Si c'est une réponse, vérifier que le message parent existe
    if (parentId) {
      const parentMessage = await prisma.eventMessage.findFirst({
        where: {
          id: parentId,
          scheduleId: eventId,
          churchId: session.user.churchId,
          isDeleted: false
        }
      });

      if (!parentMessage) {
        return NextResponse.json({ error: 'Message parent non trouvé' }, { status: 404 });
      }
    }

    // Créer le message
    const message = await prisma.eventMessage.create({
      data: {
        content: content.trim(),
        messageType,
        scheduleId: eventId,
        userId: session.user.id,
        churchId: session.user.churchId,
        parentId: parentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        parent: parentId ? {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        } : false
      }
    });

    return NextResponse.json(message, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du message' },
      { status: 500 }
    );
  }
}