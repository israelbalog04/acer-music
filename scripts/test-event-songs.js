const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEventSongs() {
  try {
    console.log('🧪 Test de la fonctionnalité d\'affectation de chansons aux événements...\n');

    // Récupérer toutes les églises
    const churches = await prisma.church.findMany({
      select: {
        id: true,
        name: true,
        city: true
      }
    });

    console.log(`📊 ${churches.length} église(s) trouvée(s)`);

    for (const church of churches) {
      console.log(`\n🏛️ Église: ${church.name} (${church.city})`);
      
      // Compter les événements
      const events = await prisma.schedule.findMany({
        where: { churchId: church.id },
        select: {
          id: true,
          title: true,
          date: true,
          type: true,
          status: true
        }
      });

      console.log(`   📅 Événements: ${events.length}`);

      // Compter les chansons
      const songs = await prisma.song.findMany({
        where: { churchId: church.id, isActive: true },
        select: {
          id: true,
          title: true,
          artist: true,
          key: true
        }
      });

      console.log(`   🎵 Chansons actives: ${songs.length}`);

      // Analyser les événements avec leurs chansons
      for (const event of events) {
        const eventSongs = await prisma.eventSong.findMany({
          where: { scheduleId: event.id },
          include: {
            song: {
              select: {
                title: true,
                artist: true,
                key: true
              }
            }
          },
          orderBy: { order: 'asc' }
        });

        console.log(`   📋 ${event.title} (${event.type}):`);
        console.log(`      Date: ${new Date(event.date).toLocaleDateString('fr-FR')}`);
        console.log(`      Statut: ${event.status}`);
        console.log(`      Chansons programmées: ${eventSongs.length}`);

        if (eventSongs.length > 0) {
          eventSongs.forEach((eventSong, index) => {
            console.log(`         ${index + 1}. ${eventSong.song.title}${eventSong.song.artist ? ` - ${eventSong.song.artist}` : ''}`);
            if (eventSong.key && eventSong.key !== eventSong.song.key) {
              console.log(`            Tonalité événement: ${eventSong.key} (original: ${eventSong.song.key})`);
            }
            if (eventSong.notes) {
              console.log(`            Notes: ${eventSong.notes}`);
            }
          });
        } else {
          console.log(`         Aucune chanson programmée`);
        }
      }

      // Statistiques des chansons les plus utilisées
      const songUsage = await prisma.eventSong.groupBy({
        by: ['songId'],
        where: {
          song: {
            churchId: church.id
          }
        },
        _count: {
          id: true
        }
      });

      if (songUsage.length > 0) {
        console.log(`\n   📈 Chansons les plus utilisées:`);
        const sortedUsage = songUsage
          .sort((a, b) => b._count.id - a._count.id)
          .slice(0, 5);

        for (const usage of sortedUsage) {
          const song = await prisma.song.findUnique({
            where: { id: usage.songId },
            select: { title: true, artist: true }
          });
          if (song) {
            console.log(`      ${song.title}${song.artist ? ` - ${song.artist}` : ''}: ${usage._count.id} événement(s)`);
          }
        }
      }
    }

    // Statistiques globales
    console.log('\n📊 Statistiques globales:');
    const totalEvents = await prisma.schedule.count();
    const totalSongs = await prisma.song.count({ where: { isActive: true } });
    const totalEventSongs = await prisma.eventSong.count();
    const eventsWithSongs = await prisma.schedule.count({
      where: {
        eventSongs: {
          some: {}
        }
      }
    });

    console.log(`   📅 Total événements: ${totalEvents}`);
    console.log(`   🎵 Total chansons actives: ${totalSongs}`);
    console.log(`   🔗 Total affectations chansons-événements: ${totalEventSongs}`);
    console.log(`   📋 Événements avec chansons: ${eventsWithSongs}`);
    console.log(`   📊 Taux d'utilisation: ${totalEvents > 0 ? Math.round((eventsWithSongs / totalEvents) * 100) : 0}%`);

    console.log('\n🎉 Test terminé !');
    console.log('\n📋 Pour tester la fonctionnalité:');
    console.log('1. Se connecter avec un compte utilisateur');
    console.log('2. Aller sur /app/team/planning');
    console.log('3. Cliquer sur un événement');
    console.log('4. Cliquer sur "Gérer les chansons"');
    console.log('5. Ajouter/supprimer/réorganiser les chansons');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEventSongs();
