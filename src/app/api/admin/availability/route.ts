import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { church: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.CHEF_LOUANGE) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Construire les filtres pour exclure certains rôles selon qui fait la demande
    let userRoleFilter: any = {};
    
    // Les ADMIN ne peuvent pas voir les SUPER_ADMIN
    if (user.role === UserRole.ADMIN) {
      userRoleFilter = {
        role: {
          not: UserRole.SUPER_ADMIN
        }
      };
    }
    
    // Les CHEF_LOUANGE ne peuvent pas voir les ADMIN ni les SUPER_ADMIN
    if (user.role === UserRole.CHEF_LOUANGE) {
      userRoleFilter = {
        role: {
          not: {
            in: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
          }
        }
      };
    }

    // Récupérer tous les utilisateurs selon les permissions
    const allowedUsers = await prisma.user.findMany({
      where: {
        churchId: user.churchId,
        ...userRoleFilter
      },
      select: { 
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });

    const allowedUserIds = allowedUsers.map(u => u.id);

    // Récupérer les disponibilités de ces utilisateurs
    const availabilities = await prisma.availability.findMany({
      where: {
        churchId: user.churchId,
        userId: { in: allowedUserIds }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    // Récupérer les événements/schedules associés
    const scheduleIds = availabilities
      .map(a => a.scheduleId)
      .filter(Boolean) as string[];
    
    const schedules = await prisma.schedule.findMany({
      where: { id: { in: scheduleIds } },
      select: {
        id: true,
        title: true,
        date: true,
        type: true,
        startTime: true,
        endTime: true,
        description: true
      }
    });

    // Créer des maps pour un accès rapide
    const userMap = new Map(allowedUsers.map(u => [u.id, u]));
    const scheduleMap = new Map(schedules.map(s => [s.id, s]));

    // Formater les données pour l'affichage
    const formattedAvailabilities = availabilities.map(availability => ({
      id: availability.id,
      userId: availability.userId,
      scheduleId: availability.scheduleId,
      isAvailable: availability.isAvailable,
      timeSlots: availability.timeSlots ? JSON.parse(availability.timeSlots) : [],
      notes: availability.notes,
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
      user: userMap.get(availability.userId),
      schedule: availability.scheduleId ? scheduleMap.get(availability.scheduleId) : null
    }));

    return NextResponse.json(formattedAvailabilities);

  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
