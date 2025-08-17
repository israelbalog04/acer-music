import { NextRequest, NextResponse } from 'next/server';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// PATCH - Mettre à jour une image
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions
    const allowedRoles = [UserRole.MULTIMEDIA, UserRole.ADMIN];
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MULTIMEDIA) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const body = await request.json();
    const { isActive, isPublic, isApproved } = body;

    const { id } = await params;
    
    // Vérifier que l'image existe et appartient à l'église de l'utilisateur
    let existingImage;
    try {
      existingImage = await prisma.musicianImage.findUnique({
        where: {
          id: id
        }
      });
    } catch (error: any) {
      console.warn('⚠️ Table MusicianImage non disponible:', error.message);
      return NextResponse.json(
        { error: 'Table des images non disponible. Vérifiez que le schéma est à jour.' },
        { status: 500 }
      );
    }

    if (!existingImage) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 });
    }

    // Vérifier que l'image appartient à l'église de l'utilisateur
    if (existingImage.churchId !== user.churchId) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 });
    }

    // Seul l'admin peut approuver les images
    if (isApproved !== undefined && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Seul l\'admin peut approuver les images' }, { status: 403 });
    }

    // Mettre à jour l'image
    const updatedImage = await prisma.musicianImage.update({
      where: { id: id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(isPublic !== undefined && { isPublic }),
        ...(isApproved !== undefined && { isApproved })
      }
    });

    return NextResponse.json({
      success: true,
      image: updatedImage
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions
    const allowedRoles = [UserRole.MULTIMEDIA, UserRole.ADMIN];
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MULTIMEDIA) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { id } = await params;
    
    // Vérifier que l'image existe et appartient à l'église de l'utilisateur
    let existingImage;
    try {
      existingImage = await prisma.musicianImage.findUnique({
        where: {
          id: id
        }
      });
    } catch (error: any) {
      console.warn('⚠️ Table MusicianImage non disponible:', error.message);
      return NextResponse.json(
        { error: 'Table des images non disponible. Vérifiez que le schéma est à jour.' },
        { status: 500 }
      );
    }

    if (!existingImage) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 });
    }

    // Vérifier que l'image appartient à l'église de l'utilisateur
    if (existingImage.churchId !== user.churchId) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur peut supprimer cette image
    // (soit il l'a uploadée, soit il est admin)
    if (existingImage.uploadedById !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Vous ne pouvez supprimer que vos propres images' }, { status: 403 });
    }

    // Supprimer le fichier physique
    const filePath = join(process.cwd(), 'public', existingImage.fileUrl);
    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
        console.log(`🗑️ Fichier supprimé: ${filePath}`);
      } catch (error) {
        console.warn(`⚠️ Impossible de supprimer le fichier: ${filePath}`, error);
      }
    }

    // Supprimer l'enregistrement de la base de données
    await prisma.musicianImage.delete({
      where: { id: id }
    });

    console.log(`✅ Image supprimée: ${existingImage.title} par ${user.firstName} ${user.lastName}`);

    return NextResponse.json({
      success: true,
      message: 'Image supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
