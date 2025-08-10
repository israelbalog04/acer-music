import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop();
    const fileName = `${session.user.id}_${Date.now()}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);
    const publicPath = `/uploads/avatars/${fileName}`;

    // Écrire le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

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