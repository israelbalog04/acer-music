import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// GET - Récupérer les événements pour les musiciens
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer les événements actifs de l'église
    const events = await prisma.schedule.findMany({
      where: {
        churchId: user.churchId,
        isActive: true,
        date: {
          gte: new Date() // Seulement les événements futurs
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return NextResponse.json(events);

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/events - Créer un nouvel événement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier les permissions (Admin ou Chef de Louange)
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.CHEF_LOUANGE) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      date,
      type,
      location,
      status,
      hasMultipleSessions,
      sessionCount,
      notes,
      sessions,
      selectedMembers,
      directors,
      selectedSongs
    } = body;

    // Validation des données de base
    if (!title || !date) {
      return NextResponse.json(
        { error: 'Titre et date requis' },
        { status: 400 }
      );
    }

    // Créer l'événement principal
    const event = await prisma.schedule.create({
      data: {
        title,
        description,
        date: new Date(date),
        type: type || 'REPETITION',
        location,
        status: status || 'PLANNED',
        hasMultipleSessions: hasMultipleSessions || false,
        sessionCount: sessionCount || 1,
        notes,
        churchId: session.user.churchId,
        createdById: session.user.id
      }
    });

    // Si événement multi-sessions, créer les sessions
    if (hasMultipleSessions && sessions && sessions.length > 0) {
      for (let i = 0; i < sessions.length; i++) {
        const sessionData = sessions[i];
        
        const eventSession = await prisma.eventSession.create({
          data: {
            name: sessionData.name || `Session ${i + 1}`,
            startTime: new Date(sessionData.startTime),
            endTime: new Date(sessionData.endTime),
            location: sessionData.location,
            notes: sessionData.notes,
            sessionOrder: i + 1,
            scheduleId: event.id,
            churchId: session.user.churchId
          }
        });

        // Ajouter les membres de cette session
        if (sessionData.members && sessionData.members.length > 0) {
          const sessionMembers = sessionData.members.map((member: any) => ({
            sessionId: eventSession.id,
            userId: member.userId,
            role: member.role,
            isConfirmed: member.isConfirmed || false,
            notes: member.notes,
            churchId: session.user.churchId
          }));

          await prisma.sessionMember.createMany({
            data: sessionMembers
          });
        }

        // Ajouter les directeurs musicaux de cette session
        if (sessionData.directors && sessionData.directors.length > 0) {
          const sessionDirectors = sessionData.directors.map((director: any, index: number) => ({
            sessionId: eventSession.id,
            userId: director.userId,
            assignedById: session.user.id,
            isActive: true,
            isPrimary: index === 0, // Le premier est le DM principal
            notes: director.notes,
            churchId: session.user.churchId
          }));

          await prisma.sessionDirector.createMany({
            data: sessionDirectors
          });
        }
      }
    } else {
      // Événement simple - ajouter les membres et directeurs à l'événement principal
      if (selectedMembers && selectedMembers.length > 0) {
        const teamMembers = selectedMembers.map((member: any) => ({
          userId: member.userId,
          teamId: member.teamId, // Si vous avez un système d'équipes
          scheduleId: event.id
        }));

        for (const member of teamMembers) {
          try {
            await prisma.teamMember.create({
              data: member
            });
          } catch (error) {
            // Ignorer les doublons
            if ((error as any)?.code === 'P2002') continue;
            throw error;
          }
        }
      }

      // Ajouter les directeurs musicaux
      if (directors && directors.length > 0) {
        const eventDirectors = directors.map((director: any) => ({
          scheduleId: event.id,
          userId: director.userId,
          churchId: session.user.churchId,
          assignedById: session.user.id,
          isActive: true,
          notes: director.notes
        }));

        await prisma.eventDirector.createMany({
          data: eventDirectors
        });
      }
    }

    // Récupérer l'événement complet avec toutes les relations
    const fullEvent = await prisma.schedule.findUnique({
      where: { id: event.id },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        sessions: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    instruments: true
                  }
                }
              }
            },
            directors: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        },
        directors: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(fullEvent, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}