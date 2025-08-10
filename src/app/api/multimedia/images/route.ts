import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET - Récupérer toutes les images
export async function GET(request: NextRequest) {
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

    // Vérifier les permissions - tous les rôles peuvent voir les images
    const allowedRoles = [UserRole.MULTIMEDIA, UserRole.ADMIN, UserRole.CHEF_LOUANGE, UserRole.MUSICIEN, UserRole.TECHNICIEN];
    if (!allowedRoles.includes(user.role as UserRole)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Récupérer les images selon le rôle
    let images = [];
    try {
      if (user.role === UserRole.ADMIN) {
        // Admin voit toutes les images de son église
        images = await prisma.musicianImage.findMany({
          where: { churchId: user.churchId },
          include: {
            uploadedBy: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            event: {
              select: {
                title: true,
                date: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        // Autres rôles voient seulement les images publiques, actives et approuvées
        images = await prisma.musicianImage.findMany({
          where: {
            churchId: user.churchId,
            isPublic: true,
            isActive: true,
            isApproved: true
          },
          include: {
            uploadedBy: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            event: {
              select: {
                title: true,
                date: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }
    } catch (error) {
      console.warn('⚠️ Table MusicianImage non disponible:', error.message);
      // Retourner un tableau vide si la table n'existe pas encore
      images = [];
    }

    return NextResponse.json(images);

  } catch (error) {
    console.error('Erreur lors de la récupération des images:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
