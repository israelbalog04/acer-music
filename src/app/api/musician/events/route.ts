import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { churchFilter } from '@/lib/church-filter';

// GET /api/musician/events - Récupérer les événements assignés au musicien connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId || !session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les assignations du musicien pour les événements futurs
    const assignments = await prisma.eventTeamMember.findMany({
      where: churchFilter(session.user.churchId, {
        userId: session.user.id,
        isActive: true,
        schedule: {
          date: {
            gte: new Date() // Seulement les événements futurs
          },
          isActive: true
        }
      }),
      include: {
        schedule: {
          include: {
            sessions: {
              orderBy: { sessionOrder: 'asc' }
            },
            eventSongs: {
              include: {
                song: {
                  include: {
                    sequences: true
                  }
                }
              },
              orderBy: { order: 'asc' }
            },
            directors: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        assignedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        schedule: {
          date: 'asc'
        }
      }
    });

    // Formatter les données pour le frontend
    const events = assignments.map(assignment => ({
      assignmentId: assignment.id,
      role: assignment.role,
      instruments: JSON.parse(assignment.instruments || '[]'),
      notes: assignment.notes,
      assignedAt: assignment.assignedAt,
      assignedBy: assignment.assignedBy,
      event: {
        id: assignment.schedule.id,
        title: assignment.schedule.title,
        description: assignment.schedule.description,
        date: assignment.schedule.date,
        startTime: assignment.schedule.startTime,
        endTime: assignment.schedule.endTime,
        type: assignment.schedule.type,
        location: assignment.schedule.location,
        status: assignment.schedule.status,
        hasMultipleSessions: assignment.schedule.hasMultipleSessions,
        sessionCount: assignment.schedule.sessionCount,
        sessions: assignment.schedule.sessions,
        directors: assignment.schedule.directors.map(d => ({
          name: `${d.user.firstName} ${d.user.lastName}`,
          email: d.user.email
        })),
        songs: assignment.schedule.eventSongs.map(es => ({
          eventSongId: es.id,
          ...es.song,
          eventOrder: es.order,
          eventKey: es.key,
          eventNotes: es.notes,
          sequencesCount: es.song.sequences.length,
          tags: JSON.parse(es.song.tags || '[]')
        }))
      }
    }));

    return NextResponse.json({ events });

  } catch (error) {
    console.error('Erreur récupération événements musicien:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    );
  }
}