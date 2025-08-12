import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// GET /api/users - Récupérer tous les utilisateurs (Admin seulement)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Seuls les admins et chefs de louange peuvent voir les utilisateurs
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.CHEF_LOUANGE) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Construire les filtres selon le rôle de l'utilisateur
    let whereClause: any = { churchId: session.user.churchId };
    
    // Les ADMIN ne peuvent pas voir les SUPER_ADMIN
    if (session.user.role === UserRole.ADMIN) {
      whereClause.role = {
        not: UserRole.SUPER_ADMIN
      };
    }
    
    // Les CHEF_LOUANGE ne peuvent pas voir les ADMIN ni les SUPER_ADMIN
    if (session.user.role === UserRole.CHEF_LOUANGE) {
      whereClause.role = {
        not: {
          in: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
        }
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        church: {
          select: {
            name: true,
            city: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data pour l'interface
    const transformedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      instruments: JSON.parse(user.instruments || '[]'),
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      church: user.church,
      status: 'active' // Par défaut, on peut ajouter un champ status plus tard
    }));

    return NextResponse.json(transformedUsers);

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}