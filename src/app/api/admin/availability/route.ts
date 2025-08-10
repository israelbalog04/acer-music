import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer toutes les disponibilités pour l'église de l'admin
    const availabilities = await prisma.availability.findMany({
      where: {
        churchId: user.churchId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        schedule: {
          select: {
            id: true,
            title: true,
            date: true,
            type: true,
            startTime: true,
            endTime: true,
            description: true
          }
        }
      },
      orderBy: [
        { user: { firstName: 'asc' } },
        { user: { lastName: 'asc' } },
        { schedule: { date: 'asc' } }
      ]
    });

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
      user: availability.user,
      schedule: availability.schedule
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
