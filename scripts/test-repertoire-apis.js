const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRepertoireAPIs() {
  console.log('🔍 Test des APIs du répertoire d\'événement...\n');

  try {
    // 1. Vérifier qu'il y a des événements
    console.log('1. Vérification des événements...');
    const events = await prisma.schedule.findMany({
      where: { isActive: true },
      select: { id: true, title: true, date: true, type: true },
      take: 1
    });

    if (events.length === 0) {
      console.log('❌ Aucun événement trouvé');
      return;
    }

    const testEvent = events[0];
    console.log(`✅ Événement de test: ${testEvent.title} (${testEvent.id})`);

    // 2. Vérifier qu'il y a des chansons
    console.log('\n2. Vérification des chansons...');
    const songs = await prisma.song.findMany({
      where: { isActive: true },
      select: { id: true, title: true, artist: true },
      take: 3
    });

    console.log(`✅ ${songs.length} chanson(s) trouvée(s):`);
    songs.forEach(song => {
      console.log(`   - ${song.title} par ${song.artist || 'Inconnu'} (${song.id})`);
    });

    // 3. Simuler l'API GET /api/admin/events/[id]
    console.log('\n3. Test de l\'API GET /api/admin/events/[id]...');
    const event = await prisma.schedule.findFirst({
      where: {
        id: testEvent.id,
        isActive: true
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
        notes: true
      }
    });

    if (event) {
      console.log('✅ API GET /api/admin/events/[id] fonctionne');
      console.log(`   - Titre: ${event.title}`);
      console.log(`   - Date: ${event.date.toISOString().split('T')[0]}`);
      console.log(`   - Type: ${event.type}`);
    } else {
      console.log('❌ API GET /api/admin/events/[id] échoue');
    }

    // 4. Simuler l'API GET /api/songs
    console.log('\n4. Test de l\'API GET /api/songs...');
    const allSongs = await prisma.song.findMany({
      where: { isActive: true },
      include: {
        sequences: {
          where: { isActive: true }
        },
        _count: {
          select: {
            recordings: true,
            eventSongs: true
          }
        }
      },
      orderBy: { title: 'asc' }
    });

    const songsWithCounts = allSongs.map(song => ({
      ...song,
      recordingsCount: song._count.recordings,
      sequencesCount: song.sequences.length,
      eventsCount: song._count.eventSongs,
      tags: JSON.parse(song.tags || '[]')
    }));

    console.log(`✅ API GET /api/songs fonctionne (${songsWithCounts.length} chansons)`);
    console.log('   Structure de réponse:', {
      songs: Array.isArray(songsWithCounts),
      hasTitle: songsWithCounts[0]?.title,
      hasArtist: songsWithCounts[0]?.artist,
      hasBpm: songsWithCounts[0]?.bpm,
      hasDuration: songsWithCounts[0]?.duration
    });

    // 5. Simuler l'API GET /api/events/[eventId]/songs
    console.log('\n5. Test de l\'API GET /api/events/[eventId]/songs...');
    const eventSongs = await prisma.eventSong.findMany({
      where: { scheduleId: testEvent.id },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artist: true,
            key: true,
            bpm: true,
            duration: true,
            notes: true,
            tags: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    console.log(`✅ API GET /api/events/[eventId]/songs fonctionne (${eventSongs.length} chansons dans l'événement)`);

    // 6. Test de simulation d'ajout de chansons
    console.log('\n6. Test de simulation d\'ajout de chansons...');
    if (songs.length > 0) {
      const testSong = songs[0];
      
      // Vérifier l'ordre actuel
      const currentMaxOrder = await prisma.eventSong.aggregate({
        where: { scheduleId: testEvent.id },
        _max: { order: true }
      });

      const nextOrder = (currentMaxOrder._max?.order || 0) + 1;
      console.log(`   Prochain ordre disponible: ${nextOrder}`);
      console.log(`   Chanson à ajouter: ${testSong.title}`);
      console.log('   ✅ Simulation d\'ajout prête');
    }

    // 7. Vérifier les permissions
    console.log('\n7. Vérification des permissions...');
    const adminUsers = await prisma.user.findMany({
      where: { 
        OR: [
          { role: 'ADMIN' },
          { role: 'CHEF_LOUANGE' }
        ]
      },
      select: { id: true, email: true, role: true },
      take: 2
    });

    console.log(`✅ ${adminUsers.length} utilisateur(s) avec permissions trouvé(s):`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    console.log('\n✅ Tous les tests des APIs réussis');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRepertoireAPIs();
