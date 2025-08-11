import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer ou récupérer l'église de test
  let church = await prisma.church.findFirst({
    where: { name: 'ACER Paris' }
  });

  if (!church) {
    church = await prisma.church.create({
      data: {
        name: 'ACER Paris',
        address: '123 Rue de la Paix, Paris',
        city: 'Paris',
        phone: '+33 1 23 45 67 89',
        email: 'contact@acer-paris.fr',
        website: 'https://acer-paris.fr',
        isActive: true,
      },
    });
    console.log('✅ Église ACER Paris créée');
  } else {
    console.log('✅ Église ACER Paris existe déjà');
  }

  // Créer ou récupérer l'utilisateur de test
  let user = await prisma.user.findFirst({
    where: { email: 'test@acer.com' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@acer.com',
        firstName: 'Test',
        lastName: 'User',
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // "password"
        role: 'MUSICIEN',
        instruments: JSON.stringify(['Piano', 'Guitare']),
        churchId: church.id,
      },
    });
    console.log('✅ Utilisateur test créé');
  } else {
    console.log('✅ Utilisateur test existe déjà');
  }

  // Créer quelques chants (seulement s'ils n'existent pas)
  const songs = [];

  // Amazing Grace
  let song = await prisma.song.findFirst({
    where: { title: 'Amazing Grace', churchId: church.id }
  });
  if (!song) {
    song = await prisma.song.create({
      data: {
        title: 'Amazing Grace',
        artist: 'John Newton',
        key: 'G',
        bpm: 80,
        duration: 240,
        lyrics: 'Amazing grace, how sweet the sound...',
        chords: 'G C D G',
        tags: JSON.stringify(['gospel', 'classique']),
        isActive: true,
        churchId: church.id,
      },
    });
    console.log('✅ Chanson "Amazing Grace" créée');
  } else {
    console.log('✅ Chanson "Amazing Grace" existe déjà');
  }
  songs.push(song);

  // How Great Thou Art
  song = await prisma.song.findFirst({
    where: { title: 'How Great Thou Art', churchId: church.id }
  });
  if (!song) {
    song = await prisma.song.create({
      data: {
        title: 'How Great Thou Art',
        artist: 'Carl Boberg',
        key: 'C',
        bpm: 75,
        duration: 300,
        lyrics: 'O Lord my God, when I in awesome wonder...',
        chords: 'C F G C',
        tags: JSON.stringify(['louange', 'adoration']),
        isActive: true,
        churchId: church.id,
      },
    });
    console.log('✅ Chanson "How Great Thou Art" créée');
  } else {
    console.log('✅ Chanson "How Great Thou Art" existe déjà');
  }
  songs.push(song);

  // It Is Well
  song = await prisma.song.findFirst({
    where: { title: 'It Is Well', churchId: church.id }
  });
  if (!song) {
    song = await prisma.song.create({
      data: {
        title: 'It Is Well',
        artist: 'Horatio Spafford',
        key: 'D',
        bpm: 70,
        duration: 280,
        lyrics: 'When peace like a river attendeth my way...',
        chords: 'D G A D',
        tags: JSON.stringify(['gospel', 'consolation']),
        isActive: true,
        churchId: church.id,
      },
    });
    console.log('✅ Chanson "It Is Well" créée');
  } else {
    console.log('✅ Chanson "It Is Well" existe déjà');
  }
  songs.push(song);

  // Créer ou récupérer l'équipe
  let team = await prisma.team.findFirst({
    where: { name: 'Équipe Musicale Principale', churchId: church.id }
  });

  if (!team) {
    team = await prisma.team.create({
      data: {
        name: 'Équipe Musicale Principale',
        description: 'Équipe principale pour les services du dimanche',
        color: '#3244c7',
        isActive: true,
        churchId: church.id,
      },
    });
    console.log('✅ Équipe créée');
  } else {
    console.log('✅ Équipe existe déjà');
  }

  // Ajouter l'utilisateur à l'équipe (seulement s'il n'est pas déjà membre)
  const existingMember = await prisma.teamMember.findFirst({
    where: { userId: user.id, teamId: team.id }
  });

  if (!existingMember) {
    await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: team.id,
      },
    });
    console.log('✅ Utilisateur ajouté à l\'équipe');
  } else {
    console.log('✅ Utilisateur déjà membre de l\'équipe');
  }

  // Créer ou récupérer le planning
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  let schedule = await prisma.schedule.findFirst({
    where: { 
      title: 'Répétition Générale',
      churchId: church.id
    }
  });

  if (!schedule) {
    schedule = await prisma.schedule.create({
      data: {
        title: 'Répétition Générale',
        description: 'Répétition pour le service du dimanche',
        date: tomorrow,
        startTime: tomorrow.toISOString(),
        endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(), // + 2h
        type: 'REPETITION',
        location: 'Salle de répétition',
        status: 'PLANNED',
        churchId: church.id,
      },
    });
    console.log('✅ Planning créé');
  } else {
    console.log('✅ Planning existe déjà');
  }

  console.log('✅ Seeding terminé !')
  console.log(`👤 Utilisateur créé: ${user.email}`)
  console.log(`🎵 Chants créés: ${songs.length}`)
  console.log(`👥 Équipe créée: ${team.name}`)
  console.log(`📅 Planning créé: ${schedule.title}`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 