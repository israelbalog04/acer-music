import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer une église de test
  const church = await prisma.church.create({
    data: {
      name: 'ACER Paris',
      address: '123 Rue de la Paix, Paris',
      city: 'Paris',
      phone: '+33 1 23 45 67 89',
      email: 'contact@acer-paris.fr',
      website: 'https://acer-paris.fr',
      isActive: true,
    },
  })

  // Créer un utilisateur de test
  const user = await prisma.user.create({
    data: {
      email: 'test@acer.com',
      firstName: 'Test',
      lastName: 'User',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // "password"
      role: 'MUSICIEN',
      instruments: JSON.stringify(['Piano', 'Guitare']),
      churchId: church.id,
    },
  })

  // Créer quelques chants
  const songs = await Promise.all([
    prisma.song.create({
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
    }),
    prisma.song.create({
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
    }),
    prisma.song.create({
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
    }),
  ])

  // Créer une équipe
  const team = await prisma.team.create({
    data: {
      name: 'Équipe Musicale Principale',
      description: 'Équipe principale pour les services du dimanche',
      color: '#3244c7',
      isActive: true,
      churchId: church.id,
    },
  })

  // Ajouter l'utilisateur à l'équipe
  await prisma.teamMember.create({
    data: {
      userId: user.id,
      teamId: team.id,
    },
  })

  // Créer un planning
  const schedule = await prisma.schedule.create({
    data: {
      title: 'Répétition Générale',
      description: 'Répétition pour le service du dimanche',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // Demain + 2h
      type: 'REPETITION',
      location: 'Salle de répétition',
      status: 'PLANNED',
      churchId: church.id,
    },
  })

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