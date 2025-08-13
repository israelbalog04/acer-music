import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { UserRole } from '@prisma/client';

// GET /api/sequences/[sequenceId] - Récupérer une séquence spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sequenceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { sequenceId } = await params;
    const sequence = await prisma.sequence.findUnique({
      where: {
        id: sequenceId
      },
      include: {
        song: {
          select: {
            title: true,
            artist: true,
            key: true,
            bpm: true,
            lyrics: true,
            chords: true
          }
        },
        schedule: {
          select: {
            id: true,
            title: true,
            date: true
          }
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        downloads: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            downloadedAt: true
          },
          orderBy: {
            downloadedAt: 'desc'
          }
        }
      }
    });

    if (!sequence || sequence.churchId !== session.user.churchId || !sequence.isActive) {
      return NextResponse.json({ error: 'Séquence non trouvée' }, { status: 404 });
    }

    // Vérifier les permissions
    let canEdit = false;
    let canDelete = false;

    if (((session.user.role === UserRole.ADMIN) || (session.user.role === UserRole.CHEF_LOUANGE))) {
      canEdit = true;
      canDelete = true;
    } else if (sequence.createdById === session.user.id) {
      canEdit = true;
      canDelete = true;
    } else if (sequence.scope === 'EVENT' && sequence.scheduleId) {
      const isDirector = await prisma.eventDirector.findFirst({
        where: {
          scheduleId: sequence.scheduleId,
          userId: session.user.id,
          isActive: true
        }
      });
      if (isDirector) {
        canEdit = true;
        canDelete = true;
      }
    }

    const responseSequence = {
      ...sequence,
      instruments: sequence.instruments ? JSON.parse(sequence.instruments) : [],
      tags: sequence.tags ? JSON.parse(sequence.tags) : [],
      downloadCount: (sequence as any).downloads?.length || 0,
      canEdit,
      canDelete
    };

    return NextResponse.json(responseSequence);
  } catch (error) {
    console.error('Erreur lors de la récupération de la séquence:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/sequences/[sequenceId] - Modifier une séquence
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sequenceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { sequenceId } = await params;

    // Récupérer la séquence existante
    const existingSequence = await prisma.sequence.findUnique({
      where: {
        id: sequenceId
      }
    });

    if (!existingSequence || existingSequence.churchId !== session.user.churchId) {
      return NextResponse.json({ error: 'Séquence non trouvée' }, { status: 404 });
    }

    // Vérifier les permissions
    let canEdit = false;

    if (((session.user.role === UserRole.ADMIN) || (session.user.role === UserRole.CHEF_LOUANGE))) {
      canEdit = true;
    } else if (existingSequence.createdById === session.user.id) {
      canEdit = true;
    } else if (existingSequence.scope === 'EVENT' && existingSequence.scheduleId) {
      const isDirector = await prisma.eventDirector.findFirst({
        where: {
          scheduleId: existingSequence.scheduleId,
          userId: session.user.id,
          isActive: true
        }
      });
      canEdit = !!isDirector;
    }

    if (!canEdit) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      songId,
      fileUrl,
      fileName,
      fileSize,
      fileType,
      key,
      bpm,
      duration,
      instruments,
      difficulty,
      category,
      tags,
      isPublic,
      isActive
    } = body;

    const updatedSequence = await prisma.sequence.update({
      where: { id: sequenceId },
      data: {
        title,
        description,
        songId: songId || null,
        fileUrl,
        fileName,
        fileSize,
        fileType,
        key,
        bpm,
        duration,
        instruments: instruments ? JSON.stringify(instruments) : undefined,
        difficulty,
        category,
        tags: tags ? JSON.stringify(tags) : undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      },
      include: {
        song: {
          select: {
            title: true,
            artist: true,
            key: true,
            bpm: true
          }
        },
        schedule: {
          select: {
            id: true,
            title: true,
            date: true
          }
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        downloads: {
          select: {
            id: true
          }
        }
      }
    });

    const responseSequence = {
      ...updatedSequence,
      instruments: (updatedSequence as any).instruments ? JSON.parse((updatedSequence as any).instruments) : [],
      tags: (updatedSequence as any).tags ? JSON.parse((updatedSequence as any).tags) : [],
      downloadCount: (updatedSequence as any).downloads?.length || 0,
      canEdit: true,
      canDelete: true
    };

    return NextResponse.json(responseSequence);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la séquence:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/sequences/[sequenceId] - Supprimer une séquence
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sequenceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { sequenceId } = await params;

    // Récupérer la séquence existante
    const existingSequence = await prisma.sequence.findUnique({
      where: {
        id: sequenceId
      }
    });

    if (!existingSequence || existingSequence.churchId !== session.user.churchId) {
      return NextResponse.json({ error: 'Séquence non trouvée' }, { status: 404 });
    }

    // Vérifier les permissions
    let canDelete = false;

    if (((session.user.role === UserRole.ADMIN) || (session.user.role === UserRole.CHEF_LOUANGE))) {
      canDelete = true;
    } else if (existingSequence.createdById === session.user.id) {
      canDelete = true;
    } else if (existingSequence.scope === 'EVENT' && existingSequence.scheduleId) {
      const isDirector = await prisma.eventDirector.findFirst({
        where: {
          scheduleId: existingSequence.scheduleId,
          userId: session.user.id,
          isActive: true
        }
      });
      canDelete = !!isDirector;
    }

    if (!canDelete) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Suppression logique plutôt que physique (recommandé pour l'audit)
    await prisma.sequence.update({
      where: { id: sequenceId },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({ message: 'Séquence supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la séquence:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}