import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';

// PUT - Modifier un message
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId || !session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId, messageId } = await params;
    const body = await request.json();
    const { content } = body;

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

    // Vérifier que le message existe et appartient à l'utilisateur
    const existingMessage = await prisma.eventMessage.findFirst({
      where: {
        id: messageId,
        scheduleId: eventId,
        userId: session.user.id,
        churchId: session.user.churchId,
        isDeleted: false
      }
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 });
    }

    // Vérifier que le message n'est pas trop ancien (limite de 24h pour modification)
    const now = new Date();
    const messageAge = now.getTime() - existingMessage.createdAt.getTime();
    const maxEditTime = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

    if (messageAge > maxEditTime) {
      return NextResponse.json(
        { error: 'Impossible de modifier un message de plus de 24 heures' },
        { status: 400 }
      );
    }

    // Mettre à jour le message
    const updatedMessage = await prisma.eventMessage.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        isEdited: true,
        editedAt: new Date()
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
        }
      }
    });

    return NextResponse.json(updatedMessage);

  } catch (error) {
    console.error('Erreur lors de la modification du message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du message' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId || !session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId, messageId } = await params;

    // Vérifier que le message existe et appartient à l'utilisateur (ou que l'utilisateur est admin)
    const existingMessage = await prisma.eventMessage.findFirst({
      where: {
        id: messageId,
        scheduleId: eventId,
        churchId: session.user.churchId,
        isDeleted: false
      },
      include: {
        user: {
          select: {
            role: true
          }
        }
      }
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions : propriétaire du message ou admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const canDelete = existingMessage.userId === session.user.id || 
                     currentUser?.role === 'ADMIN' || 
                     currentUser?.role === 'CHEF_LOUANGE';

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour supprimer ce message' },
        { status: 403 }
      );
    }

    // Supprimer logiquement le message (soft delete)
    await prisma.eventMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        content: '[Message supprimé]'
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du message' },
      { status: 500 }
    );
  }
}