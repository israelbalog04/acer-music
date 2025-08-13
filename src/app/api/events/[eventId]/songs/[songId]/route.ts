import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';

// DELETE - Supprimer une chanson d'un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; songId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier les permissions (Admin ou Chef de Louange)
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CHEF_LOUANGE') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { eventId, songId } = await params;

    // Vérifier que l'utilisateur a accès à l'événement
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier que l'événement existe et appartient à l'église
    const event = await prisma.schedule.findFirst({
      where: {
        id: eventId,
        churchId: user.churchId
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Supprimer la chanson de l'événement
    const deletedEventSong = await prisma.eventSong.deleteMany({
      where: {
        scheduleId: eventId,
        songId: songId,
        churchId: user.churchId
      }
    });

    if (deletedEventSong.count === 0) {
      return NextResponse.json({ error: 'Chanson non trouvée dans cet événement' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Chanson supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la chanson:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Modifier l'ordre d'une chanson dans un événement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; songId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier les permissions (Admin ou Chef de Louange)
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CHEF_LOUANGE') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { eventId, songId } = await params;
    const body = await request.json();
    const { order } = body;

    if (typeof order !== 'number') {
      return NextResponse.json(
        { error: 'Ordre requis (nombre)' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a accès à l'événement
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier que l'événement existe et appartient à l'église
    const event = await prisma.schedule.findFirst({
      where: {
        id: eventId,
        churchId: user.churchId
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Mettre à jour l'ordre de la chanson
    const updatedEventSong = await prisma.eventSong.updateMany({
      where: {
        scheduleId: eventId,
        songId: songId,
        churchId: user.churchId
      },
      data: { order }
    });

    if (updatedEventSong.count === 0) {
      return NextResponse.json({ error: 'Chanson non trouvée dans cet événement' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Ordre mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}