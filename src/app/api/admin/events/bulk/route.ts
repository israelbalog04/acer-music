import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// POST - Créer des événements en lot (tous les dimanches)
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

    if (!user || ![UserRole.ADMIN, UserRole.CHEF_LOUANGE].includes(user.role as UserRole)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const body = await request.json();
    const { title, startDate, endDate, startTime, endTime, type, description, cultStructure } = body;

    console.log('📥 Données reçues:', { title, startDate, endDate, startTime, endTime, type, description, cultStructure });

    // Validation
    if (!title || !startDate || !startTime || !endTime || !type) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
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

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start);
    
    // Si pas de date de fin fournie, calculer automatiquement
    if (!endDate) {
      end.setMonth(end.getMonth() + 1); // Par défaut 1 mois
    }

    // Vérifier que la date de fin est après la date de début
    if (start >= end) {
      return NextResponse.json(
        { error: 'La date de fin doit être après la date de début' },
        { status: 400 }
      );
    }

    // Vérifier que la date de début n'est pas dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      return NextResponse.json(
        { error: 'La date de début ne peut pas être dans le passé' },
        { status: 400 }
      );
    }

    // Générer tous les dimanches entre startDate et endDate
    const events = [];
    const currentDate = new Date(start);
    
    // Trouver le prochain dimanche
    while (currentDate.getDay() !== 0) { // 0 = dimanche
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Créer un événement pour chaque dimanche
    while (currentDate <= end) {
      if (cultStructure === '5_CULTS') {
        // Créer 5 cultes pour ce dimanche
        for (let cultNumber = 1; cultNumber <= 5; cultNumber++) {
          const cultTitle = `${title} - Culte ${cultNumber}`;
          const cultDescription = `${description || ''} - Culte ${cultNumber} du dimanche`;
          
          events.push({
            title: cultTitle,
            date: new Date(currentDate),
            startTime,
            endTime,
            type: type,
            description: cultDescription,
            isActive: true,
            status: 'PLANNED',
            churchId: user.churchId,
            createdById: user.id
          });
        }
      } else {
        // Créer un seul service
        events.push({
          title,
          date: new Date(currentDate),
          startTime,
          endTime,
          type: type,
          description: description || '',
          isActive: true,
          status: 'PLANNED',
          churchId: user.churchId,
          createdById: user.id
        });
      }

      // Passer au dimanche suivant
      currentDate.setDate(currentDate.getDate() + 7);
    }

    if (events.length === 0) {
      return NextResponse.json(
        { error: 'Aucun dimanche trouvé dans la période spécifiée' },
        { status: 400 }
      );
    }

    // Vérifier s'il y a déjà des événements pour ces dates
    const existingEvents = await prisma.schedule.findMany({
      where: {
        churchId: user.churchId,
        date: {
          in: events.map(e => e.date)
        }
      },
      select: { date: true }
    });

    const existingDates = existingEvents.map(e => e.date.toISOString().split('T')[0]);
    const newEvents = events.filter(e => 
      !existingDates.includes(e.date.toISOString().split('T')[0])
    );

    if (newEvents.length === 0) {
      return NextResponse.json(
        { error: 'Tous les dimanches de cette période ont déjà des événements' },
        { status: 400 }
      );
    }

    console.log(`📊 Création de ${newEvents.length} événements...`);
    
    // Créer les événements en base de données (SQLite ne supporte pas skipDuplicates)
    let createdCount = 0;
    for (const event of newEvents) {
      try {
        await prisma.schedule.create({
          data: event
        });
        createdCount++;
      } catch (error) {
        if (error.code === 'P2002') {
          // Événement déjà existant, on continue
          console.log(`⚠️  Événement déjà existant pour ${event.date.toLocaleDateString('fr-FR')}`);
        } else {
          throw error;
        }
      }
    }

    console.log(`✅ ${createdCount} événements créés avec succès`);

    return NextResponse.json({
      success: true,
      count: createdCount,
      message: `${createdCount} événements créés avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de la création des événements en lot:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error.message },
      { status: 500 }
    );
  }
}
