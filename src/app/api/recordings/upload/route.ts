import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StorageService, FileValidator } from '@/lib/storage';

// POST /api/recordings/upload - Upload d'un enregistrement audio
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId || !session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('audioFile') as File;
    const songId = formData.get('songId') as string;
    const title = formData.get('title') as string;
    const instrument = formData.get('instrument') as string;
    const notes = formData.get('notes') as string;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier audio fourni' }, { status: 400 });
    }

    if (!songId) {
      return NextResponse.json({ error: 'ID du morceau requis' }, { status: 400 });
    }

    if (!instrument) {
      return NextResponse.json({ error: 'Instrument requis' }, { status: 400 });
    }

    // Vérifier que le morceau existe et appartient à la même église
    const song = await prisma.song.findFirst({
      where: {
        id: songId,
        churchId: session.user.churchId
      }
    });

    if (!song) {
      return NextResponse.json({ error: 'Morceau non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions - tous les musiciens peuvent soumettre
    const canUpload = ['ADMIN', 'CHEF_LOUANGE', 'MUSICIEN', 'TECHNICIEN'].includes(session.user.role);
    if (!canUpload) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Vérifier le fichier avec le validateur
    const validation = FileValidator.validateAudioFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Utiliser le service de stockage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadResult = await StorageService.uploadFile({
      folder: 'recordings',
      originalName: file.name,
      buffer,
      mimeType: file.type,
      churchId: session.user.churchId
    });

    const audioUrl = uploadResult.url;

    // Créer l'enregistrement en base avec statut IN_REVIEW
    const recording = await prisma.recording.create({
      data: {
        title: title || `${instrument} - ${song.title}`,
        instrument: instrument,
        songId: songId,
        audioUrl: audioUrl,
        duration: null, // Sera calculé côté client si nécessaire
        status: 'IN_REVIEW', // En attente de validation
        notes: notes || null,
        churchId: session.user.churchId,
        userId: session.user.id
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
            lastName: true
          }
        }
      }
    });

    return NextResponse.json({
      id: recording.id,
      title: recording.title,
      instrument: recording.instrument,
      audioUrl: recording.audioUrl,
      status: recording.status,
      notes: recording.notes,
      createdAt: recording.createdAt,
      song: recording.song,
      user: recording.user
    });

  } catch (error) {
    console.error('Erreur upload enregistrement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}