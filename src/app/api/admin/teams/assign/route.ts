import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
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

    const { assignments } = await request.json();

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // Traiter chaque affectation d'équipe
    for (const assignment of assignments) {
      const { eventId, teamMembers, directorId } = assignment;

      // Vérifier que l'événement existe
      const event = await prisma.schedule.findUnique({
        where: { id: eventId }
      });

      if (!event) {
        console.error(`Événement non trouvé: ${eventId}`);
        continue;
      }

      // Supprimer les anciennes affectations pour cet événement
      await prisma.eventTeamMember.deleteMany({
        where: {
          scheduleId: eventId
        }
      });

      await prisma.eventDirector.deleteMany({
        where: {
          scheduleId: eventId
        }
      });

      // Créer les nouvelles affectations d'équipe
      for (const member of teamMembers) {
        await prisma.eventTeamMember.create({
          data: {
            userId: member.userId,
            scheduleId: eventId,
            role: member.assignedRole,
            instruments: JSON.stringify(member.instruments),
            churchId: user.churchId,
            assignedById: user.id
          }
        });
      }

      // Assigner le directeur musical si spécifié
      if (directorId) {
        await prisma.eventDirector.create({
          data: {
            userId: directorId,
            scheduleId: eventId,
            churchId: user.churchId,
            assignedById: user.id
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Équipes affectées avec succès',
      assignmentsCount: assignments.length
    });

  } catch (error) {
    console.error('Erreur lors de l\'affectation des équipes:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

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

    // Récupérer toutes les affectations d'équipes pour l'église
    const teamAssignments = await prisma.eventTeamMember.findMany({
      where: {
        churchId: user.churchId
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    // Récupérer les utilisateurs associés
    const userIds = teamAssignments.map(a => a.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        instruments: true
      }
    });

    // Récupérer les événements associés
    const scheduleIds = teamAssignments.map(a => a.scheduleId);
    const schedules = await prisma.schedule.findMany({
      where: { id: { in: scheduleIds } },
      select: {
        id: true,
        title: true,
        date: true,
        type: true,
        startTime: true,
        endTime: true
      }
    });

    // Récupérer les directeurs d'événements
    const eventDirectors = await prisma.eventDirector.findMany({
      where: {
        churchId: user.churchId
      }
    });

    // Créer des maps pour un accès rapide
    const userMap = new Map(users.map(u => [u.id, u]));
    const scheduleMap = new Map(schedules.map(s => [s.id, s]));

    // Formater les données
    const formattedAssignments = teamAssignments.map(assignment => ({
      id: assignment.id,
      userId: assignment.userId,
      scheduleId: assignment.scheduleId,
      role: assignment.role,
      instruments: assignment.instruments ? JSON.parse(assignment.instruments) : [],
      createdAt: assignment.createdAt,
      user: userMap.get(assignment.userId),
      schedule: scheduleMap.get(assignment.scheduleId)
    }));

    const formattedDirectors = eventDirectors.map(director => ({
      id: director.id,
      userId: director.userId,
      scheduleId: director.scheduleId,
      createdAt: director.createdAt,
      user: userMap.get(director.userId),
      schedule: scheduleMap.get(director.scheduleId)
    }));

    return NextResponse.json({
      teamMembers: formattedAssignments,
      directors: formattedDirectors
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des affectations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
