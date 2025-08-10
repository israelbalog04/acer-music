import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// GET - Récupérer les chansons d'un événement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId } = await params;

    // Vérifier que l'événement existe et appartient à l'église de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const event = await prisma.schedule.findFirst({
      where: {
        id: eventId,
        churchId: user.churchId
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Récupérer les chansons de l'événement
    const eventSongs = await prisma.eventSong.findMany({
      where: { scheduleId: eventId },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artist: true,
            key: true,
            bpm: true,
            duration: true,
            notes: true,
            tags: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(eventSongs);

  } catch (error) {
    console.error('Erreur lors de la récupération des chansons:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Ajouter des chansons à un événement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier les permissions (Admin ou Chef de Louange)
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CHEF_LOUANGE') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { eventId } = await params;
    const body = await request.json();
    const { songIds } = body;

    if (!songIds || !Array.isArray(songIds)) {
      return NextResponse.json(
        { error: 'Liste des chansons requise' },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe et appartient à l'église de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const event = await prisma.schedule.findFirst({
      where: {
        id: eventId,
        churchId: user.churchId
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Vérifier que les chansons existent et appartiennent à l'église
    const songs = await prisma.song.findMany({
      where: {
        id: { in: songIds },
        churchId: user.churchId
      },
      select: { id: true }
    });

    if (songs.length !== songIds.length) {
      return NextResponse.json(
        { error: 'Certaines chansons n\'existent pas ou n\'appartiennent pas à votre église' },
        { status: 400 }
      );
    }

    // Récupérer l'ordre actuel le plus élevé
    const maxOrder = await prisma.eventSong.aggregate({
      where: { scheduleId: eventId },
      _max: { order: true }
    });

    const nextOrder = (maxOrder._max?.order || 0) + 1;

    // Ajouter les chansons à l'événement
    const eventSongs = await prisma.eventSong.createMany({
      data: songIds.map((songId, index) => ({
        scheduleId: eventId,
        songId,
        order: nextOrder + index,
        churchId: user.churchId
      }))
    });

    return NextResponse.json({
      message: `${eventSongs.count} chanson(s) ajoutée(s) avec succès`,
      addedCount: eventSongs.count
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'ajout des chansons:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}