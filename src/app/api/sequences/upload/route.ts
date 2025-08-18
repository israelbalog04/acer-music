import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { StorageService, FileValidator } from '@/lib/storage';

// POST /api/sequences/upload - Upload d'un fichier de séquence
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId || !session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const songId = formData.get('songId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!songId) {
      return NextResponse.json({ error: 'ID du morceau requis' }, { status: 400 });
    }

    // Valider le fichier (accepter différents types pour les séquences)
    const allowedTypes = [
      ...FileValidator.AUDIO_TYPES,
      ...FileValidator.DOCUMENT_TYPES,
      ...FileValidator.IMAGE_TYPES
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non supporté. Utilisez: PDF, MP3, WAV, PNG, JPG, XLS, XLSX' 
      }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return NextResponse.json({ 
        error: 'Fichier trop volumineux (max 10MB)' 
      }, { status: 400 });
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

    // Vérifier les permissions
    // Tous les musiciens peuvent ajouter des séquences
    const canUpload = session.user.role && ['ADMIN', 'CHEF_LOUANGE', 'MUSICIEN', 'TECHNICIEN'].includes(session.user.role);
    if (!canUpload) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Préparer les données pour l'upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalName = file.name;

    // Upload vers le service de stockage (Supabase)
    const uploadResult = await StorageService.uploadFile({
      folder: 'sequences',
      originalName,
      buffer,
      mimeType: file.type,
      churchId: session.user.churchId
    });

    const { url: fileUrl, fileName } = uploadResult;

    // Créer l'enregistrement en base
    const sequence = await prisma.sequence.create({
      data: {
        title: title || originalName.split('.')[0],
        description: description || `Séquence pour ${song.title}`,
        songId: songId,
        fileUrl: fileUrl,
        fileName,
        fileSize: file.size,
        fileType: file.type,
        scope: 'GLOBAL', // Séquence globale accessible à tous
        isActive: true,
        isPublic: true,
        churchId: session.user.churchId,
        createdById: session.user.id
      },
      include: {
        song: {
          select: {
            title: true,
            artist: true
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

    return NextResponse.json({
      id: sequence.id,
      title: sequence.title,
      description: sequence.description,
      fileName: sequence.fileName,
      fileSize: sequence.fileSize,
      fileType: sequence.fileType,
      fileUrl: sequence.fileUrl,
      createdAt: sequence.createdAt,
      song: (sequence as any).song,
      createdBy: (sequence as any).createdBy
    });

  } catch (error) {
    console.error('Erreur upload séquence:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}