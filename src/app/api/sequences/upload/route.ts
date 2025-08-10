import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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
    const canUpload = ['ADMIN', 'CHEF_LOUANGE', 'MUSICIEN', 'TECHNICIEN'].includes(session.user.role);
    if (!canUpload) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Générer un nom de fichier unique
    const fileId = uuidv4();
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop() || '';
    const fileName = `${fileId}.${fileExtension}`;

    // Créer le dossier de destination
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'sequences');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Le dossier existe déjà
    }

    // Sauvegarder le fichier
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // URL publique du fichier
    const fileUrl = `/uploads/sequences/${fileName}`;

    // Créer l'enregistrement en base
    const sequence = await prisma.sequence.create({
      data: {
        title: title || originalName.split('.')[0],
        description: description || `Séquence pour ${song.title}`,
        songId: songId,
        fileUrl: fileUrl,
        fileName: originalName,
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
      song: sequence.song,
      createdBy: sequence.createdBy
    });

  } catch (error) {
    console.error('Erreur upload séquence:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}