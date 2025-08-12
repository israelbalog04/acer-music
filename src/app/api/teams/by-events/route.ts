import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { churchFilter } from '@/lib/church-filter';
import { analyzeTeamNeeds } from '@/lib/event-requirements';

// GET /api/teams/by-events - Récupérer toutes les équipes organisées par événement
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';
    const eventType = searchParams.get('type'); // SERVICE, REPETITION, CONCERT, etc.

    // Construire les filtres pour les événements
    let eventWhere = churchFilter(session.user.churchId, {
      isActive: true
    });

    if (!includeCompleted) {
      eventWhere.status = {
        not: 'COMPLETED'
      };
    }

    if (eventType) {
      eventWhere.type = eventType;
    }

    // Récupérer les événements avec leurs équipes
    const events = await prisma.schedule.findMany({
      where: eventWhere,
      include: {
        // Directeurs musicaux
        directors: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                primaryInstrument: true,
                skillLevel: true,
                instruments: true
              }
            },
            assignedBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        // Membres d'équipe de l'événement
        eventTeamMembers: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                primaryInstrument: true,
                skillLevel: true,
                instruments: true
              }
            },
            assignedBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        // Sessions avec leurs membres
        sessions: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    primaryInstrument: true,
                    skillLevel: true,
                    instruments: true
                  }
                }
              }
            },
            directors: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    primaryInstrument: true,
                    skillLevel: true,
                    instruments: true
                  }
                }
              }
            }
          }
        },
        // Créateur de l'événement
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    // Traiter et organiser les données
    const eventsWithTeams = events.map(event => {
      // Calculer le total des membres uniques
      const allMemberIds = new Set();
      const allMembers: any[] = [];
      
      // Ajouter les directeurs
      (event as any).directors?.forEach((dir: any) => {
        allMemberIds.add(dir.userId);
        allMembers.push({
          role: 'Directeur Musical',
          user: dir.user
        });
      });
      
      // Ajouter les membres de l'événement
      (event as any).eventTeamMembers?.forEach((member: any) => {
        allMemberIds.add(member.userId);
        allMembers.push({
          role: member.role,
          user: member.user
        });
      });
      
      // Ajouter les membres des sessions
      (event as any).sessions?.forEach((session: any) => {
        session.members?.forEach((member: any) => {
          allMemberIds.add(member.userId);
          allMembers.push({
            role: member.role,
            user: member.user
          });
        });
        session.directors?.forEach((dir: any) => {
          allMemberIds.add(dir.userId);
          allMembers.push({
            role: 'Directeur de Session',
            user: dir.user
          });
        });
      });

      // Analyser les besoins de l'équipe
      const teamAnalysis = analyzeTeamNeeds(event.type, allMembers);

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        type: event.type,
        status: event.status,
        location: event.location,
        hasMultipleSessions: event.hasMultipleSessions,
        sessionCount: event.sessionCount,
        notes: event.notes,
        createdBy: (event as any).createdBy,
        
        // Statistiques
        totalMembers: allMemberIds.size,
        directorsCount: (event as any).directors?.length || 0,
        membersCount: (event as any).eventTeamMembers?.length || 0,
        sessionsCount: (event as any).sessions?.length || 0,
        
        // Analyse des besoins
        teamAnalysis: teamAnalysis,
        
        // Équipes organisées
        team: {
          // Directeurs musicaux
          directors: ((event as any).directors || []).map((dir: any) => ({
            id: dir.id,
            user: dir.user,
            isPrimary: dir.isPrimary || false,
            assignedBy: dir.assignedBy,
            assignedAt: dir.assignedAt,
            notes: dir.notes
          })),
          
          // Membres principaux de l'événement
          members: ((event as any).eventTeamMembers || []).map((member: any) => ({
            id: member.id,
            user: member.user,
            role: member.role,
            instruments: member.instruments,
            assignedBy: member.assignedBy,
            assignedAt: member.assignedAt,
            notes: member.notes
          })),
          
          // Sessions avec leurs équipes
          sessions: ((event as any).sessions || []).map((session: any) => ({
            id: session.id,
            name: session.name,
            startTime: session.startTime,
            endTime: session.endTime,
            sessionOrder: session.sessionOrder,
            location: session.location,
            notes: session.notes,
            
            // Directeurs de session
            directors: (session.directors || []).map((dir: any) => ({
              id: dir.id,
              user: dir.user,
              isPrimary: (dir as any).isPrimary || false,
              assignedAt: dir.assignedAt,
              notes: dir.notes
            })),
            
            // Membres de session
            members: (session.members || []).map((member: any) => ({
              id: member.id,
              user: member.user,
              role: member.role,
              isConfirmed: member.isConfirmed,
              notes: member.notes
            }))
          }))
        }
      };
    });

    // Calculer les statistiques globales
    const totalEvents = eventsWithTeams.length;
    const totalUniqueMembers = new Set();
    const totalSessions = eventsWithTeams.reduce((sum: number, event: any) => sum + event.sessionsCount, 0);
    
    eventsWithTeams.forEach((event: any) => {
      event.team.directors.forEach((dir: any) => totalUniqueMembers.add(dir.user.id));
      event.team.members.forEach((member: any) => totalUniqueMembers.add(member.user.id));
      event.team.sessions.forEach((session: any) => {
        session.directors.forEach((dir: any) => totalUniqueMembers.add(dir.user.id));
        session.members.forEach((member: any) => totalUniqueMembers.add(member.user.id));
      });
    });

    return NextResponse.json({
      events: eventsWithTeams,
      stats: {
        totalEvents,
        totalSessions,
        totalUniqueMembers: totalUniqueMembers.size,
        upcomingEvents: eventsWithTeams.filter(e => new Date(e.date) > new Date()).length,
        completedEvents: eventsWithTeams.filter(e => e.status === 'COMPLETED').length
      }
    });

  } catch (error) {
    console.error('Erreur récupération équipes par événement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des équipes' },
      { status: 500 }
    );
  }
}