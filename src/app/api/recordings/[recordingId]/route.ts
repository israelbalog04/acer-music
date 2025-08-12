import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { UserRole } from '@prisma/client';

// PUT /api/recordings/[recordingId] - Modifier le statut d'un enregistrement (validation admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ recordingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId || !session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier les permissions - seuls les admins et chefs de louange peuvent valider
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.CHEF_LOUANGE) {
      return NextResponse.json({ 
        error: 'Permissions insuffisantes pour valider les enregistrements' 
      }, { status: 403 });
    }

    const { recordingId } = await params;
    const body = await request.json();
    const { status, reviewNotes } = body;

    // Vérifier que l'enregistrement existe
    const existingRecording = await prisma.recording.findFirst({
      where: {
        id: recordingId,
        churchId: session.user.churchId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        song: {
          select: {
            title: true
          }
        }
      }
    });

    if (!existingRecording) {
      return NextResponse.json({ error: 'Enregistrement non trouvé' }, { status: 404 });
    }

    // Valider le statut
    const validStatuses = ['APPROVED', 'IN_REVIEW', 'DRAFT'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Statut invalide. Utilisez: APPROVED, IN_REVIEW, DRAFT' 
      }, { status: 400 });
    }

    // Mettre à jour l'enregistrement
    const updatedRecording = await prisma.recording.update({
      where: { id: recordingId },
      data: {
        status: status,
        reviewNotes: reviewNotes || null,
        reviewedById: session.user.id,
        reviewedAt: new Date()
      },
      include: {
        song: {
          select: {
            title: true,
            artist: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        reviewedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Log de l'action pour audit
    console.log(`Enregistrement ${recordingId} ${status} par ${session.user.name || session.user.email} (${session.user.email})`);

    return NextResponse.json({
      id: updatedRecording.id,
      status: updatedRecording.status,
      reviewNotes: updatedRecording.reviewNotes,
      reviewedAt: updatedRecording.reviewedAt,
      reviewedBy: updatedRecording.reviewedBy,
      song: updatedRecording.song,
      user: updatedRecording.user
    });

  } catch (error) {
    console.error('Erreur validation enregistrement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation' },
      { status: 500 }
    );
  }
}

// DELETE /api/recordings/[recordingId] - Supprimer un enregistrement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ recordingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId || !session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { recordingId } = await params;
    
    // Vérifier que l'enregistrement existe
    const existingRecording = await prisma.recording.findFirst({
      where: {
        id: recordingId,
        churchId: session.user.churchId
      }
    });

    if (!existingRecording) {
      return NextResponse.json({ error: 'Enregistrement non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions - créateur, admin ou chef de louange
    const canDelete = existingRecording.userId === session.user.id ||
      ((session.user.role === UserRole.ADMIN) || (session.user.role === UserRole.CHEF_LOUANGE));

    if (!canDelete) {
      return NextResponse.json({ 
        error: 'Permissions insuffisantes pour supprimer cet enregistrement' 
      }, { status: 403 });
    }

    // Suppression en base (on garde le fichier pour audit)
    await prisma.recording.delete({
      where: { id: recordingId }
    });

    return NextResponse.json({ message: 'Enregistrement supprimé avec succès' });

  } catch (error) {
    console.error('Erreur suppression enregistrement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}