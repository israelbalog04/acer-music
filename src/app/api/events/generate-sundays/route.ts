import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { notifyAllMusicians, NotificationTemplates } from '@/lib/notifications';

// POST /api/events/generate-sundays - Générer automatiquement les dimanches
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Seuls les admins peuvent générer les dimanches
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.CHEF_LOUANGE) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const body = await request.json();
    const { months = 3 } = body; // Par défaut, générer 3 mois à l'avance

    const generatedEvents = [];
    const today = new Date();
    
    // Génération des dimanches pour les X prochains mois
    for (let month = 0; month < months; month++) {
      const currentDate = new Date(today);
      currentDate.setMonth(today.getMonth() + month);
      
      // Premier dimanche du mois
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const firstSunday = new Date(firstDay);
      firstSunday.setDate(1 + (7 - firstDay.getDay()) % 7);
      
      // Générer tous les dimanches du mois
      while (firstSunday.getMonth() === currentDate.getMonth()) {
        // Vérifier si ce dimanche n'existe pas déjà
        const existingEvent = await prisma.schedule.findFirst({
          where: {
            churchId: session.user.churchId,
            date: {
              gte: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 0, 0, 0),
              lt: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate() + 1, 0, 0, 0)
            },
            type: 'SERVICE'
          }
        });

        if (!existingEvent && firstSunday >= today) {
          // Créer l'événement dimanche avec 5 cultes
          const sundayEvent = await prisma.schedule.create({
            data: {
              title: `Dimanche ${firstSunday.toLocaleDateString('fr-FR')}`,
              description: 'Services dominicaux (5 cultes)',
              date: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 8, 0, 0), // 8h début
              type: 'SERVICE',
              location: 'Église',
              status: 'PLANNED',
              hasMultipleSessions: true,
              sessionCount: 5,
              churchId: session.user.churchId,
              createdById: session.user.id
            }
          });

          // Créer les 5 sessions (cultes)
          const cultes = [
            { name: 'Culte 1', startTime: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 8, 0, 0), endTime: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 9, 30, 0), order: 1 },
            { name: 'Culte 2', startTime: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 10, 0, 0), endTime: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 11, 30, 0), order: 2 },
            { name: 'Culte 3', startTime: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 12, 0, 0), endTime: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 13, 30, 0), order: 3 },
            { name: 'Culte 4', startTime: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 14, 0, 0), endTime: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 15, 30, 0), order: 4 },
            { name: 'Culte 5', startTime: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 16, 0, 0), endTime: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 17, 30, 0), order: 5 }
          ];

          for (const culte of cultes) {
            await prisma.eventSession.create({
              data: {
                name: culte.name,
                startTime: culte.startTime,
                endTime: culte.endTime,
                sessionOrder: culte.order,
                scheduleId: sundayEvent.id,
                churchId: session.user.churchId
              }
            });
          }

          generatedEvents.push(sundayEvent);
        }

        // Dimanche suivant
        firstSunday.setDate(firstSunday.getDate() + 7);
      }
    }

    // Envoyer des notifications aux musiciens si des événements ont été créés
    if (generatedEvents.length > 0) {
      try {
        const adminName = `${session.user.name || 'Admin'}`.trim();
        
        // Notification 1: Informer de la création des dimanches
        const creationNotification = NotificationTemplates.sundayCreation(generatedEvents.length, adminName);
        await notifyAllMusicians(
          session.user.churchId,
          session.user.id,
          creationNotification
        );

        // Notification 2: Demander de remplir les disponibilités
        const availabilityNotification = NotificationTemplates.availabilityRequest(generatedEvents.length);
        await notifyAllMusicians(
          session.user.churchId,
          session.user.id,
          availabilityNotification
        );

        console.log(`✅ Notifications envoyées pour ${generatedEvents.length} nouveaux dimanches`);
      } catch (notificationError) {
        console.error('❌ Erreur lors de l\'envoi des notifications:', notificationError);
        // Ne pas faire échouer la création des événements pour un problème de notification
      }
    }

    return NextResponse.json({
      message: `${generatedEvents.length} dimanches générés avec succès`,
      events: generatedEvents
    });

  } catch (error) {
    console.error('Erreur lors de la génération des dimanches:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET /api/events/generate-sundays - Voir les dimanches qui seraient générés (preview)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.CHEF_LOUANGE) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '3');

    const upcomingSundays = [];
    const today = new Date();
    
    // Calcul des dimanches pour les X prochains mois
    for (let month = 0; month < months; month++) {
      const currentDate = new Date(today);
      currentDate.setMonth(today.getMonth() + month);
      
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const firstSunday = new Date(firstDay);
      firstSunday.setDate(1 + (7 - firstDay.getDay()) % 7);
      
      while (firstSunday.getMonth() === currentDate.getMonth()) {
        if (firstSunday >= today) {
          // Vérifier si déjà existant
          const existingEvent = await prisma.schedule.findFirst({
            where: {
              churchId: session.user.churchId,
              date: {
                gte: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate(), 0, 0, 0),
                lt: new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate() + 1, 0, 0, 0)
              },
              type: 'SERVICE'
            }
          });

          upcomingSundays.push({
            date: new Date(firstSunday),
            exists: !!existingEvent,
            title: `Dimanche ${firstSunday.toLocaleDateString('fr-FR')} (5 cultes)`
          });
        }

        firstSunday.setDate(firstSunday.getDate() + 7);
      }
    }

    return NextResponse.json({
      preview: upcomingSundays,
      totalSundays: upcomingSundays.length,
      newSundays: upcomingSundays.filter(s => !s.exists).length,
      existingSundays: upcomingSundays.filter(s => s.exists).length
    });

  } catch (error) {
    console.error('Erreur lors du preview des dimanches:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}