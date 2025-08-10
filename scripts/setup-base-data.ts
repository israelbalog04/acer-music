import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupBaseData() {
  console.log('🚀 Initialisation des données de base...');

  try {
    // 1. Créer les églises
    const churches = [
      { name: 'ACER Paris', city: 'Paris', address: '123 Rue de la Paix, 75001 Paris' },
      { name: 'ACER Rennes', city: 'Rennes', address: '456 Boulevard de la Liberté, 35000 Rennes' },
      { name: 'ACER Lyon', city: 'Lyon', address: '789 Avenue de la République, 69001 Lyon' }
    ];

    for (const churchData of churches) {
      const church = await prisma.church.upsert({
        where: { name: churchData.name },
        update: {},
        create: {
          name: churchData.name,
          city: churchData.city,
          address: churchData.address,
          isActive: true
        }
      });
      console.log(`✅ Église créée: ${church.name}`);

      // 2. Créer des utilisateurs pour chaque église
      const users = [
        { email: `admin@acer-${churchData.city.toLowerCase()}.com`, role: 'ADMIN', firstName: 'Admin', lastName: churchData.city },
        { email: `chef_louange@acer-${churchData.city.toLowerCase()}.com`, role: 'CHEF_LOUANGE', firstName: 'Chef', lastName: `Louange ${churchData.city}` },
        { email: `musicien@acer-${churchData.city.toLowerCase()}.com`, role: 'MUSICIEN', firstName: 'Musicien', lastName: churchData.city },
        { email: `pierre@acer-${churchData.city.toLowerCase()}.com`, role: 'MUSICIEN', firstName: 'Pierre', lastName: churchData.city },
        { email: `marie@acer-${churchData.city.toLowerCase()}.com`, role: 'MUSICIEN', firstName: 'Marie', lastName: churchData.city },
        { email: `thomas@acer-${churchData.city.toLowerCase()}.com`, role: 'MUSICIEN', firstName: 'Thomas', lastName: churchData.city }
      ];

      for (const userData of users) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        await prisma.user.upsert({
          where: { email: userData.email },
          update: {},
          create: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: hashedPassword,
            role: userData.role as any,
            instruments: JSON.stringify(['Piano', 'Guitare']),
            churchId: church.id
          }
        });
        console.log(`   👤 Utilisateur créé: ${userData.firstName} ${userData.lastName} (${userData.role})`);
      }

      // 3. Créer quelques chansons d'exemple
      const songs = [
        { title: 'Amazing Grace', artist: 'John Newton', key: 'G', bpm: 120 },
        { title: 'How Great Thou Art', artist: 'Stuart K. Hine', key: 'D', bpm: 95 },
        { title: 'Blessed Assurance', artist: 'Fanny Crosby', key: 'A', bpm: 110 }
      ];

      for (const songData of songs) {
        // Vérifier si la chanson existe déjà
        const existingSong = await prisma.song.findFirst({
          where: {
            title: songData.title,
            churchId: church.id
          }
        });

        if (!existingSong) {
          await prisma.song.create({
            data: {
              title: songData.title,
              artist: songData.artist,
              key: songData.key,
              bpm: songData.bpm,
              tags: JSON.stringify(['louange', 'classique']),
              isActive: true,
              churchId: church.id
            }
          });
        }
      }
      console.log(`   🎵 ${songs.length} chansons créées`);
    }

    console.log('\n✅ Données de base créées avec succès !');
    
    // 4. Maintenant créer les cultes du dimanche
    console.log('\n📅 Création des cultes du dimanche...');
    
    const allChurches = await prisma.church.findMany();
    
    for (const church of allChurches) {
      console.log(`Création des cultes pour ${church.name}...`);

      // Créer 8 cultes du dimanche (2 mois à venir)
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
            churchId: church.id
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

    console.log('\n🎉 Système complet initialisé avec succès !');
    
    // Stats finales
    const totalChurches = await prisma.church.count();
    const totalUsers = await prisma.user.count();
    const totalEvents = await prisma.schedule.count();
    const totalSongs = await prisma.song.count();
    
    console.log('\n📊 Résumé:');
    console.log(`   🏛️  Églises: ${totalChurches}`);
    console.log(`   👥 Utilisateurs: ${totalUsers}`);
    console.log(`   📅 Événements: ${totalEvents}`);
    console.log(`   🎵 Chansons: ${totalSongs}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  setupBaseData();
}

export { setupBaseData };