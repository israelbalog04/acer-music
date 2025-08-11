import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateToEventDirectors() {
  try {
    console.log('🔄 Migration vers le système DM par événement...')

    // 1. Nettoyer d'éventuelles anciennes séquences
    console.log('\n🗑️  Nettoyage des anciennes données...')
    const oldSequences = await prisma.sequence.count()
    console.log(`Trouvé ${oldSequences} séquences existantes à nettoyer`)
    
    if (oldSequences > 0) {
      await prisma.sequenceDownload.deleteMany()
      await prisma.sequence.deleteMany()
      console.log('✅ Anciennes séquences supprimées')
    }

    // 2. Créer des événements d'exemple pour tester
    console.log('\n📅 Création d\'événements d\'exemple...')
    const churches = await prisma.church.findMany({
      include: { users: true }
    })

    for (const church of churches) {
      // Créer un événement "Culte du Dimanche"
      const event = await prisma.schedule.create({
        data: {
          title: 'Culte du Dimanche - Test DM',
          description: 'Service dominical avec équipe musicale',
          date: new Date('2024-01-14'),
          startTime: new Date('2024-01-14T10:00:00').toISOString(),
          endTime: new Date('2024-01-14T12:00:00').toISOString(),
          type: 'SERVICE',
          location: 'Sanctuaire Principal',
          status: 'PLANNED',
          churchId: church.id
        }
      })

      console.log(`✅ Événement créé pour ${church.name}: ${event.title}`)

      // Assigner 1-2 musiciens comme DM pour cet événement
      const musiciens = church.users.filter(user => user.role === 'MUSICIEN')
      const admin = church.users.find(user => user.role === 'ADMIN')

      if (musiciens.length > 0 && admin) {
        const selectedMusiciens = musiciens.slice(0, 2) // Prendre 2 musiciens max

        for (const musicien of selectedMusiciens) {
          const eventDirector = await prisma.eventDirector.create({
            data: {
              scheduleId: event.id,
              userId: musicien.id,
              churchId: church.id,
              assignedById: admin.id,
              isActive: true,
              notes: `DM assigné pour ${event.title}`
            }
          })

          console.log(`   🎼 ${musicien.firstName} ${musicien.lastName} assigné comme DM`)
        }
      }

      // Créer des séquences d'exemple pour cet événement
      const songs = await prisma.song.findMany({
        where: { churchId: church.id },
        take: 2
      })

      if (songs.length > 0 && musiciens.length > 0) {
        for (let i = 0; i < songs.length; i++) {
          const song = songs[i]
          const sequence = await prisma.sequence.create({
            data: {
              title: `${song.title} - Arrangement Événement`,
              description: `Séquence spécifique pour ${event.title}`,
              songId: song.id,
              scheduleId: event.id, // Lié à l'événement
              key: 'G',
              bpm: 120,
              difficulty: 'Intermédiaire',
              category: 'Louange',
              instruments: JSON.stringify(['Piano', 'Guitare']),
              tags: JSON.stringify(['événement', 'culte']),
              scope: 'EVENT',
              churchId: church.id,
              createdById: musiciens[0].id, // Premier musicien comme créateur
              fileName: `${song.title.replace(/\s+/g, '_').toLowerCase()}_event.pdf`,
              fileType: 'application/pdf',
              fileSize: Math.floor(Math.random() * 300000) + 100000
            }
          })

          console.log(`   🎵 Séquence créée: ${sequence.title}`)
        }
      }
    }

    // 3. Créer quelques séquences globales (accessibles par toute l'église)
    console.log('\n🌍 Création de séquences globales...')
    
    for (const church of churches) {
      const chefLouange = church.users.find(user => user.role === 'CHEF_LOUANGE')
      const songs = await prisma.song.findMany({
        where: { churchId: church.id },
        take: 1
      })

      if (chefLouange && songs.length > 0) {
        const globalSequence = await prisma.sequence.create({
          data: {
            title: `${songs[0].title} - Arrangement Global`,
            description: 'Séquence disponible pour tous les événements de l\'église',
            songId: songs[0].id,
            // scheduleId: null (pas lié à un événement spécifique)
            key: 'D',
            bpm: 100,
            difficulty: 'Intermédiaire',
            category: 'Adoration',
            instruments: JSON.stringify(['Piano', 'Chant']),
            tags: JSON.stringify(['global', 'standard']),
            scope: 'GLOBAL',
            churchId: church.id,
            createdById: chefLouange.id,
            fileName: `${songs[0].title.replace(/\s+/g, '_').toLowerCase()}_global.pdf`,
            fileType: 'application/pdf',
            fileSize: Math.floor(Math.random() * 400000) + 150000
          }
        })

        console.log(`   🌍 Séquence globale créée: ${globalSequence.title}`)
      }
    }

    console.log('\n🎉 Migration terminée avec succès!')
    console.log('\n📋 Nouveau système:')
    console.log('   ✅ DM = Attribution temporaire par événement')
    console.log('   ✅ Responsables assignent les DM')
    console.log('   ✅ Séquences liées aux événements OU globales')
    console.log('   ✅ Permissions contextuelles selon l\'événement')

    // Afficher un résumé
    console.log('\n📊 Résumé:')
    const totalEvents = await prisma.schedule.count()
    const totalEventDirectors = await prisma.eventDirector.count()
    const totalSequences = await prisma.sequence.count()

    console.log(`   📅 Événements créés: ${totalEvents}`)
    console.log(`   🎼 Attributions DM: ${totalEventDirectors}`)
    console.log(`   🎵 Séquences: ${totalSequences}`)

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateToEventDirectors()