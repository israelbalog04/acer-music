import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { churchFilter } from '@/lib/church-filter';

// GET /api/songs - Récupérer toutes les chansons
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const key = searchParams.get('key');
    const eventId = searchParams.get('eventId'); // Pour le répertoire par événement

    let whereClause: any = churchFilter(session.user.churchId, {
      isActive: true
    });

    // Recherche textuelle
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtrer par tag
    if (tag) {
      whereClause.tags = {
        contains: tag
      };
    }

    // Filtrer par tonalité
    if (key) {
      whereClause.key = key;
    }

    // Si c'est pour un événement spécifique
    if (eventId) {
      const eventSongs = await prisma.eventSong.findMany({
        where: churchFilter(session.user.churchId, {
          scheduleId: eventId
        }),
        include: {
          song: {
            include: {
              sequences: {
                where: { isActive: true }
              },
              _count: {
                select: {
                  recordings: true
                }
              }
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      });

      const songs = eventSongs.map(es => ({
        ...es.song,
        eventOrder: es.order,
        eventKey: es.key,
        eventNotes: es.notes,
        recordingsCount: es.song._count.recordings,
        sequencesCount: es.song.sequences.length
      }));

      return NextResponse.json({ songs });
    }

    // Répertoire global
    const songs = await prisma.song.findMany({
      where: whereClause,
      include: {
        sequences: {
          where: { isActive: true }
        },
        _count: {
          select: {
            recordings: true,
            eventSongs: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    const songsWithCounts = songs.map(song => ({
      ...song,
      recordingsCount: song._count.recordings,
      sequencesCount: song.sequences.length,
      eventsCount: song._count.eventSongs,
      tags: JSON.parse(song.tags || '[]')
    }));

    return NextResponse.json({ songs: songsWithCounts });

  } catch (error) {
    console.error('Erreur récupération chansons:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des chansons' },
      { status: 500 }
    );
  }
}

// POST /api/songs - Ajouter une nouvelle chanson
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId || (session.user.role !== 'ADMIN' && session.user.role !== 'CHEF_LOUANGE')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const {
      title,
      artist,
      youtubeUrl,
      key,
      bpm,
      duration,
      lyrics,
      chords,
      notes,
      tags
    } = await request.json();

    // Validation des données requises
    if (!title) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }

    // Validation du lien YouTube si fourni
    if (youtubeUrl && !youtubeUrl.match(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/)) {
      return NextResponse.json({ error: 'Lien YouTube invalide' }, { status: 400 });
    }

    const song = await prisma.song.create({
      data: {
        title,
        artist: artist || null,
        youtubeUrl: youtubeUrl || null,
        key: key || null,
        bpm: bpm ? parseInt(bpm) : null,
        duration: duration ? parseInt(duration) : null,
        lyrics: lyrics || null,
        chords: chords || null,
        notes: notes || null,
        tags: JSON.stringify(tags || []),
        churchId: session.user.churchId
      },
      include: {
        sequences: true,
        _count: {
          select: {
            recordings: true,
            eventSongs: true
          }
        }
      }
    });

    const songWithCounts = {
      ...song,
      recordingsCount: song._count.recordings,
      sequencesCount: song.sequences.length,
      eventsCount: song._count.eventSongs,
      tags: JSON.parse(song.tags || '[]')
    };

    return NextResponse.json({ song: songWithCounts }, { status: 201 });

  } catch (error) {
    console.error('Erreur création chanson:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la chanson' },
      { status: 500 }
    );
  }
}