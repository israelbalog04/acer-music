const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testEventRepertoire() {
  console.log('🔍 Test de la fonctionnalité de répertoire d\'événement...\n');

  try {
    // 1. Vérifier qu'il y a des événements
    console.log('1. Vérification des événements...');
    const events = await prisma.schedule.findMany({
      where: { isActive: true },
      select: { id: true, title: true, date: true, type: true },
      take: 3
    });

    if (events.length === 0) {
      console.log('❌ Aucun événement trouvé');
      return;
    }

    console.log(`✅ ${events.length} événement(s) trouvé(s):`);
    events.forEach(event => {
      console.log(`   - ${event.title} (${event.date.toISOString().split('T')[0]}) - ${event.type}`);
    });

    // 2. Vérifier qu'il y a des chansons
    console.log('\n2. Vérification des chansons...');
    const songs = await prisma.song.findMany({
      where: { isActive: true },
      select: { id: true, title: true, artist: true, key: true, bpm: true },
      take: 5
    });

    console.log(`✅ ${songs.length} chanson(s) trouvée(s):`);
    songs.forEach(song => {
      console.log(`   - ${song.title} par ${song.artist || 'Inconnu'} (Clé: ${song.key || 'N/A'}, BPM: ${song.bpm || 'N/A'})`);
    });

    // 3. Vérifier les relations EventSong existantes
    console.log('\n3. Vérification des relations EventSong...');
    const eventSongs = await prisma.eventSong.findMany({
      include: {
        song: { select: { title: true } },
        schedule: { select: { title: true } }
      },
      take: 5
    });

    console.log(`✅ ${eventSongs.length} relation(s) EventSong trouvée(s):`);
    eventSongs.forEach(es => {
      console.log(`   - "${es.song.title}" dans "${es.schedule.title}" (Ordre: ${es.order || 'N/A'})`);
    });

    // 4. Test de simulation d'ajout de chansons
    console.log('\n4. Test de simulation d\'ajout de chansons...');
    const testEvent = events[0];
    const testSongs = songs.slice(0, 2);

    console.log(`   Simulation d'ajout de ${testSongs.length} chanson(s) à l'événement "${testEvent.title}"`);

    // Vérifier l'ordre actuel
    const currentMaxOrder = await prisma.eventSong.aggregate({
      where: { scheduleId: testEvent.id },
      _max: { order: true }
    });

    const nextOrder = (currentMaxOrder._max?.order || 0) + 1;
    console.log(`   Prochain ordre disponible: ${nextOrder}`);

    // 5. Vérifier les permissions
    console.log('\n5. Vérification des permissions...');
    const adminUsers = await prisma.user.findMany({
      where: { 
        OR: [
          { role: 'ADMIN' },
          { role: 'CHEF_LOUANGE' }
        ]
      },
      select: { id: true, email: true, role: true, churchId: true },
      take: 3
    });

    console.log(`✅ ${adminUsers.length} utilisateur(s) avec permissions trouvé(s):`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Église: ${user.churchId}`);
    });

    // 6. Vérifier la structure des données
    console.log('\n6. Vérification de la structure des données...');
    
    // Vérifier que les chansons appartiennent à la même église que l'événement
    const eventWithChurch = await prisma.schedule.findUnique({
      where: { id: testEvent.id },
      select: { churchId: true }
    });

    const songsInSameChurch = await prisma.song.count({
      where: { 
        churchId: eventWithChurch.churchId,
        isActive: true
      }
    });

    console.log(`✅ ${songsInSameChurch} chanson(s) disponible(s) dans la même église`);

    // 7. Recommandations
    console.log('\n7. Recommandations...');
    
    if (songs.length === 0) {
      console.log('⚠️  Aucune chanson trouvée. Créez des chansons pour tester le répertoire.');
    }
    
    if (eventSongs.length === 0) {
      console.log('⚠️  Aucune relation EventSong trouvée. Les événements n\'ont pas encore de chansons.');
    }
    
    if (adminUsers.length === 0) {
      console.log('⚠️  Aucun utilisateur ADMIN/CHEF_LOUANGE trouvé. Créez des utilisateurs avec ces rôles.');
    }

    console.log('\n✅ Test terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEventRepertoire();
