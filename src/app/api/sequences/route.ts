import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// GET /api/sequences - Récupérer les séquences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope'); // 'EVENT', 'GLOBAL', ou null pour toutes
    const eventId = searchParams.get('eventId');
    const songId = searchParams.get('songId'); // Nouveau: filtrer par morceau
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const instrument = searchParams.get('instrument');

    let whereClause: any = {
      churchId: session.user.churchId,
      isActive: true
    };

    // Filtrer par portée
    if (scope) {
      whereClause.scope = scope;
    }

    // Filtrer par événement spécifique
    if (eventId) {
      whereClause.scheduleId = eventId;
    }

    // Filtrer par morceau spécifique
    if (songId) {
      whereClause.songId = songId;
    }

    // Filtrer par catégorie
    if (category) {
      whereClause.category = category;
    }

    // Filtrer par difficulté
    if (difficulty) {
      whereClause.difficulty = difficulty;
    }

    // Filtrer par instrument (dans le JSON)
    if (instrument) {
      whereClause.instruments = {
        contains: instrument
      };
    }

    const sequences = await prisma.sequence.findMany({
      where: whereClause,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Vérifier les permissions et ajouter les métadonnées de permissions
    const sequencesWithPermissions = await Promise.all(
      sequences.map(async (sequence) => {
        let canEdit = false;
        let canDelete = false;

        // Admin et Chef de Louange peuvent tout modifier
        if ([UserRole.ADMIN, UserRole.CHEF_LOUANGE].includes(session.user.role as UserRole)) {
          canEdit = true;
          canDelete = true;
        } 
        // Créateur peut modifier ses propres séquences
        else if (sequence.createdById === session.user.id) {
          canEdit = true;
          canDelete = true;
        }
        // DM d'un événement peut modifier les séquences de cet événement
        else if (sequence.scope === 'EVENT' && sequence.scheduleId) {
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

        return {
          ...sequence,
          instruments: sequence.instruments ? JSON.parse(sequence.instruments) : [],
          tags: sequence.tags ? JSON.parse(sequence.tags) : [],
          downloadCount: sequence.downloads.length,
          canEdit,
          canDelete
        };
      })
    );

    return NextResponse.json(sequencesWithPermissions);
  } catch (error) {
    console.error('Erreur lors de la récupération des séquences:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/sequences - Créer une nouvelle séquence
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      songId,
      scheduleId,
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
      scope
    } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: 'Titre requis' },
        { status: 400 }
      );
    }

    // Vérifier les permissions pour créer des séquences
    let canCreateSequence = false;

    if ([UserRole.ADMIN, UserRole.CHEF_LOUANGE].includes(session.user.role as UserRole)) {
      canCreateSequence = true;
    } else if (scope === 'EVENT' && scheduleId) {
      // Vérifier si l'utilisateur est DM de cet événement
      const isDirector = await prisma.eventDirector.findFirst({
        where: {
          scheduleId,
          userId: session.user.id,
          isActive: true
        }
      });
      canCreateSequence = !!isDirector;
    }

    if (!canCreateSequence) {
      return NextResponse.json({ error: 'Permissions insuffisantes pour créer une séquence' }, { status: 403 });
    }

    // Si c'est une séquence EVENT, vérifier que l'événement existe
    if (scope === 'EVENT' && scheduleId) {
      const event = await prisma.schedule.findFirst({
        where: {
          id: scheduleId,
          churchId: session.user.churchId
        }
      });

      if (!event) {
        return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
      }
    }

    const sequence = await prisma.sequence.create({
      data: {
        title,
        description,
        songId: songId || null,
        scheduleId: scope === 'EVENT' ? scheduleId : null,
        fileUrl,
        fileName,
        fileSize,
        fileType,
        key,
        bpm,
        duration,
        instruments: instruments ? JSON.stringify(instruments) : null,
        difficulty,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        isActive: true,
        isPublic: isPublic !== undefined ? isPublic : true,
        scope: scope || 'EVENT',
        churchId: session.user.churchId,
        createdById: session.user.id
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
        }
      }
    });

    // Formatter la réponse
    const responseSequence = {
      ...sequence,
      instruments: sequence.instruments ? JSON.parse(sequence.instruments) : [],
      tags: sequence.tags ? JSON.parse(sequence.tags) : [],
      downloadCount: 0,
      canEdit: true,
      canDelete: true
    };

    return NextResponse.json(responseSequence, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la séquence:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}