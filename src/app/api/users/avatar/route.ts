import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { StorageService } from '@/lib/storage';

// POST /api/users/avatar - Upload avatar
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérification du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non supporté. Utilisez JPEG, PNG ou WebP.' 
      }, { status: 400 });
    }

    // Vérification de la taille (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Fichier trop volumineux. Maximum 5MB.' 
      }, { status: 400 });
    }

    // Préparer le fichier pour upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload vers Supabase Storage
    const uploadResult = await StorageService.uploadFile({
      folder: 'avatars',
      originalName: file.name,
      buffer,
      mimeType: file.type,
      churchId: session.user.churchId
    });

    const publicPath = uploadResult.url;

    // Mettre à jour la base de données
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: publicPath },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true
      }
    });

    return NextResponse.json({
      message: 'Avatar mis à jour avec succès',
      avatar: publicPath,
      fileName: uploadResult.fileName,
      user: updatedUser
    });

  } catch (error) {
    console.error('Erreur upload avatar:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/avatar - Supprimer l'avatar
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Mettre à jour la base de données pour supprimer l'avatar
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true
      }
    });

    return NextResponse.json({
      message: 'Avatar supprimé avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('Erreur suppression avatar:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}