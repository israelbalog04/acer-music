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

    if (user.role !== UserRole.MUSICIEN && user.role !== UserRole.TECHNICIEN) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer les affectations d'équipe de l'utilisateur
    const teamAssignments = await prisma.eventTeamMember.findMany({
      where: {
        userId: user.id,
        churchId: user.churchId
      },
      include: {
        schedule: {
          select: {
            id: true,
            title: true,
            date: true,
            type: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: [
        { schedule: { date: 'asc' } }
      ]
    });

    // Récupérer les affectations de directeur d'événement
    const directorAssignments = await prisma.eventDirector.findMany({
      where: {
        userId: user.id,
        churchId: user.churchId
      },
      include: {
        schedule: {
          select: {
            id: true,
            title: true,
            date: true
          }
        }
      },
      orderBy: [
        { schedule: { date: 'asc' } }
      ]
    });

    // Formater les données
    const formattedTeamAssignments = teamAssignments.map(assignment => ({
      id: assignment.id,
      scheduleId: assignment.scheduleId,
      role: assignment.role,
      instruments: assignment.instruments ? JSON.parse(assignment.instruments) : [],
      createdAt: assignment.createdAt,
      schedule: assignment.schedule
    }));

    const formattedDirectorAssignments = directorAssignments.map(assignment => ({
      id: assignment.id,
      scheduleId: assignment.scheduleId,
      createdAt: assignment.createdAt,
      schedule: assignment.schedule
    }));

    return NextResponse.json({
      teamAssignments: formattedTeamAssignments,
      directorAssignments: formattedDirectorAssignments
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des affectations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
