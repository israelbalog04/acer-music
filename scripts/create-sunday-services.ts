import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSundayServices() {
  try {
    // Récupérer toutes les églises
    const churches = await prisma.church.findMany();

    for (const church of churches) {
      console.log(`Création des cultes pour ${church.name}...`);

      // Créer 8 cultes du dimanche (2 mois à venir)
      const sundays = [];
      const now = new Date();
      let nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + (7 - now.getDay())); // Prochain dimanche

      for (let i = 0; i < 8; i++) {
        const sundayDate = new Date(nextSunday);
        sundayDate.setDate(nextSunday.getDate() + (i * 7));
        
        // Culte du matin (10h-12h)
        const morningService = await prisma.schedule.create({
          data: {
            title: `Culte du Dimanche ${sundayDate.toLocaleDateString('fr-FR')}`,
            description: 'Culte dominical avec louange, prédication et communion',
            date: sundayDate,
            type: 'SERVICE',
            location: church.city,
            status: 'PLANNED',
            hasMultipleSessions: true,
            sessionCount: 2,
            notes: 'Culte principal avec équipe de louange complète',
            churchId: church.id,
            createdById: null // Système
          }
        });

        // Session 1: Pré-service (répétition et préparation - 9h-10h)
        await prisma.eventSession.create({
          data: {
            name: 'Pré-service (Répétition)',
            startTime: new Date(sundayDate.getFullYear(), sundayDate.getMonth(), sundayDate.getDate(), 9, 0),
            endTime: new Date(sundayDate.getFullYear(), sundayDate.getMonth(), sundayDate.getDate(), 10, 0),
            location: church.city,
            notes: 'Répétition et préparation avant le culte',
            sessionOrder: 1,
            scheduleId: morningService.id,
            churchId: church.id
          }
        });

        // Session 2: Culte principal (10h-12h)
        await prisma.eventSession.create({
          data: {
            name: 'Culte Principal',
            startTime: new Date(sundayDate.getFullYear(), sundayDate.getMonth(), sundayDate.getDate(), 10, 0),
            endTime: new Date(sundayDate.getFullYear(), sundayDate.getMonth(), sundayDate.getDate(), 12, 0),
            location: church.city,
            notes: 'Culte principal avec louange et prédication',
            sessionOrder: 2,
            scheduleId: morningService.id,
            churchId: church.id
          }
        });

        console.log(`  ✓ Culte créé pour le ${sundayDate.toLocaleDateString('fr-FR')}`);
      }
    }

    console.log('✅ Tous les cultes du dimanche ont été créés avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la création des cultes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createSundayServices();
}

export { createSundayServices };