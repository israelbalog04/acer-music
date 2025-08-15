import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { UserRole } from '@prisma/client';

// GET /api/availability/[availabilityId] - Récupérer une disponibilité spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ availabilityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { availabilityId } = await params;
    const availability = await prisma.availability.findFirst({
      where: {
        id: availabilityId,
        churchId: session.user.churchId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            instruments: true
          }
        }
      }
    });

    if (!availability) {
      return NextResponse.json({ error: 'Disponibilité non trouvée' }, { status: 404 });
    }

    // Vérifier les permissions
    if (availability.userId !== session.user.id && 
        (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.CHEF_LOUANGE)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Parser les timeSlots
    const responseAvailability = {
      ...availability,
      timeSlots: JSON.parse(availability.timeSlots)
    };

    return NextResponse.json(responseAvailability);
  } catch (error) {
    console.error('Erreur lors de la récupération de la disponibilité:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/availability/[availabilityId] - Modifier une disponibilité
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ availabilityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { availabilityId } = await params;
    
    // Vérifier que la disponibilité existe
    const existingAvailability = await prisma.availability.findFirst({
      where: {
        id: availabilityId,
        churchId: session.user.churchId
      }
    });

    if (!existingAvailability) {
      return NextResponse.json({ error: 'Disponibilité non trouvée' }, { status: 404 });
    }

    // Vérifier les permissions
    if (existingAvailability.userId !== session.user.id && 
        (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.CHEF_LOUANGE)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const body = await request.json();
    const { isAvailable, timeSlots, notes, availabilityType, dayOfWeek, specificDate } = body;

    // Validation
    if (!Array.isArray(timeSlots)) {
      return NextResponse.json(
        { error: 'Créneaux horaires requis' },
        { status: 400 }
      );
    }

    const updatedAvailability = await prisma.availability.update({
      where: { id: availabilityId },
      data: {
        specificDate: specificDate ? new Date(specificDate) : undefined,
        isAvailable: isAvailable !== undefined ? isAvailable : undefined,
        timeSlots: JSON.stringify(timeSlots),
        notes,
        dayOfWeek: availabilityType === 'GENERIC' && dayOfWeek !== undefined ? dayOfWeek : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            instruments: true
          }
        }
      }
    });

    // Parser les timeSlots pour la réponse
    const responseAvailability = {
      ...updatedAvailability,
      timeSlots: JSON.parse(updatedAvailability.timeSlots)
    };

    return NextResponse.json(responseAvailability);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la disponibilité:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/availability/[availabilityId] - Supprimer une disponibilité
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ availabilityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que la disponibilité existe
    const { availabilityId } = await params;
    const existingAvailability = await prisma.availability.findFirst({
      where: {
        id: availabilityId,
        churchId: session.user.churchId
      }
    });

    if (!existingAvailability) {
      return NextResponse.json({ error: 'Disponibilité non trouvée' }, { status: 404 });
    }

    // Vérifier les permissions
    if (existingAvailability.userId !== session.user.id && 
        (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.CHEF_LOUANGE)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    await prisma.availability.delete({
      where: { id: availabilityId }
    });

    return NextResponse.json({ message: 'Disponibilité supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la disponibilité:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}