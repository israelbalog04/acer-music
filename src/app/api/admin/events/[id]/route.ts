import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET - Récupérer un événement spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que l'utilisateur a accès à l'événement
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer l'événement
    const event = await prisma.schedule.findFirst({
      where: {
        id: id,
        churchId: user.churchId
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        startTime: true,
        endTime: true,
        type: true,
        location: true,
        status: true,
        isActive: true,
        notes: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    return NextResponse.json(event);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un événement
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin ou chef de louange
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || ![UserRole.ADMIN, UserRole.CHEF_LOUANGE].includes(user.role as UserRole)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive, title, date, startTime, endTime, type, description } = body;

    // Vérifier que l'événement existe et appartient à l'église
    const existingEvent = await prisma.schedule.findFirst({
      where: {
        id: id,
        churchId: user.churchId
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (isActive !== undefined) updateData.isActive = isActive;
    if (title) updateData.title = title;
    if (date) updateData.date = new Date(date);
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (type) updateData.type = type;
    if (description !== undefined) updateData.description = description;

    // Validation des heures si elles sont fournies
    if (startTime && endTime && startTime >= endTime) {
      return NextResponse.json(
        { error: 'L\'heure de fin doit être après l\'heure de début' },
        { status: 400 }
      );
    }

    // Mettre à jour l'événement
    const updatedEvent = await prisma.schedule.update({
      where: { id: id },
      data: updateData
    });

    return NextResponse.json(updatedEvent);

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin ou chef de louange
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || ![UserRole.ADMIN, UserRole.CHEF_LOUANGE].includes(user.role as UserRole)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { id } = await params;

    // Vérifier que l'événement existe et appartient à l'église
    const existingEvent = await prisma.schedule.findFirst({
      where: {
        id: id,
        churchId: user.churchId
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Vérifier s'il y a des disponibilités liées à cet événement
    const availabilities = await prisma.availability.findMany({
      where: { scheduleId: id }
    });

    if (availabilities.length > 0) {
      // Supprimer les disponibilités liées
      await prisma.availability.deleteMany({
        where: { scheduleId: id }
      });
    }

    // Supprimer l'événement
    await prisma.schedule.delete({
      where: { id: id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Événement supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
