const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllData() {
  try {
    console.log('\n=== VÉRIFICATION DE TOUTES LES DONNÉES ===\n');

    // Vérifier les utilisateurs
    const users = await prisma.user.findMany({
      include: { church: true },
      orderBy: { firstName: 'asc' }
    });
    
    console.log('👥 UTILISATEURS:');
    users.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - ${user.church?.name || 'Sans église'}`);
    });
    console.log(`  Total: ${users.length}\n`);

    // Vérifier les églises
    const churches = await prisma.church.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('🏛️  ÉGLISES:');
    churches.forEach(church => {
      console.log(`  - ${church.name} (${church.city})`);
    });
    console.log(`  Total: ${churches.length}\n`);

    // Vérifier les chansons
    const songs = await prisma.song.findMany({
      include: { church: true },
      orderBy: { title: 'asc' }
    });
    
    console.log('🎵 CHANSONS:');
    songs.forEach(song => {
      console.log(`  - ${song.title} par ${song.artist || 'Artiste inconnu'} (${song.church?.name || 'Global'})`);
    });
    console.log(`  Total: ${songs.length}\n`);

    // Vérifier les événements/horaires
    const schedules = await prisma.schedule.findMany({
      include: { church: true },
      orderBy: { date: 'desc' }
    });
    
    console.log('📅 ÉVÉNEMENTS/HORAIRES:');
    schedules.forEach(schedule => {
      const date = new Date(schedule.date).toLocaleDateString('fr-FR');
      console.log(`  - ${schedule.title} le ${date} (${schedule.church?.name || 'Sans église'})`);
    });
    console.log(`  Total: ${schedules.length}\n`);

    // Vérifier les disponibilités
    const availabilities = await prisma.availability.findMany({
      include: { 
        user: true, 
        schedule: true,
        church: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('✅ DISPONIBILITÉS:');
    availabilities.forEach(availability => {
      console.log(`  - ${availability.user?.firstName || 'Utilisateur inconnu'} pour ${availability.schedule?.title || 'Événement inconnu'} (${availability.status})`);
    });
    console.log(`  Total: ${availabilities.length}\n`);

    // Vérifier les séquences
    const sequences = await prisma.sequence.findMany({
      include: { church: true },
      orderBy: { title: 'asc' }
    });
    
    console.log('🎼 SÉQUENCES:');
    sequences.forEach(sequence => {
      console.log(`  - ${sequence.title} (${sequence.church?.name || 'Global'})`);
    });
    console.log(`  Total: ${sequences.length}\n`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();