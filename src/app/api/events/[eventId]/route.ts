import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// GET /api/events/[eventId] - Récupérer un événement spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId } = await params;
    
    const event = await prisma.schedule.findFirst({
      where: {
        id: eventId,
        churchId: session.user.churchId
      },
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
                    id: true,
                    firstName: true,
                    lastName: true,
                    instruments: true,
                    email: true
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
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: {
            sessionOrder: 'asc'
          }
        },
        directors: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        sequences: {
          include: {
            song: {
              select: {
                title: true,
                artist: true
              }
            },
            createdBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[eventId] - Modifier un événement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier les permissions
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.CHEF_LOUANGE) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { eventId } = await params;

    // Vérifier que l'événement existe et appartient à l'église
    const existingEvent = await prisma.schedule.findFirst({
      where: {
        id: eventId,
        churchId: session.user.churchId
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      date,
      type,
      location,
      status,
      notes
    } = body;

    const updatedEvent = await prisma.schedule.update({
      where: { id: eventId },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        type,
        location,
        status,
        notes
      },
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

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[eventId] - Supprimer un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier les permissions (seuls Admin et Chef de Louange)
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.CHEF_LOUANGE) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { eventId } = await params;

    // Vérifier que l'événement existe et appartient à l'église
    const existingEvent = await prisma.schedule.findFirst({
      where: {
        id: eventId,
        churchId: session.user.churchId
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Supprimer l'événement (cascade supprimera automatiquement les sessions, membres, etc.)
    await prisma.schedule.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}