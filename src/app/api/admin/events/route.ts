import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET - Récupérer tous les événements
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin ou chef de louange
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.CHEF_LOUANGE)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const events = await prisma.schedule.findMany({
      where: {
        churchId: user.churchId,
        isActive: true
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

// POST - Créer un nouvel événement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin ou chef de louange
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.CHEF_LOUANGE)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const body = await request.json();
    const { title, date, startTime, endTime, type, description } = body;

    console.log('📥 Données reçues pour création événement:', { title, date, startTime, endTime, type, description });

    // Validation
    if (!title || !date || !startTime || !endTime || !type) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Vérifier que la date n'est pas dans le passé
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      return NextResponse.json(
        { error: 'La date de l\'événement ne peut pas être dans le passé' },
        { status: 400 }
      );
    }

    // Vérifier que l'heure de fin est après l'heure de début
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'L\'heure de fin doit être après l\'heure de début' },
        { status: 400 }
      );
    }

    // Créer l'événement
    const event = await prisma.schedule.create({
      data: {
        title,
        date: eventDate,
        startTime,
        endTime,
        type: type,
        description: description || '',
        isActive: true,
        status: 'PLANNED',
        churchId: user.churchId,
        createdById: user.id
      }
    });

    return NextResponse.json(event, { status: 201 });

  } catch (error: any) {
    console.error('Erreur lors de la création de l\'événement:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error.message },
      { status: 500 }
    );
  }
}
