const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testMusicianAssignments() {
  try {
    console.log('🎵 Test du système d\'assignation des musiciens...')

    // Vérifier les entités de base
    const church = await prisma.church.findFirst()
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }})
    const musician = await prisma.user.findFirst({ where: { role: 'MUSICIEN' }})
    
    console.log(`✅ Église: ${church.name}`)
    console.log(`✅ Admin: ${admin.email}`)
    console.log(`✅ Musicien: ${musician.firstName} ${musician.lastName}`)

    // Vérifier les événements existants
    const events = await prisma.schedule.findMany({
      where: { 
        churchId: church.id,
        date: { gte: new Date() }
      },
      orderBy: { date: 'asc' }
    })
    console.log(`✅ ${events.length} événement(s) futur(s)`)

    if (events.length === 0) {
      console.log('❌ Aucun événement futur trouvé, création d\'un événement test...')
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      
      const testEvent = await prisma.schedule.create({
        data: {
          title: 'Service Test avec Répertoire',
          description: 'Événement test pour démonstration musicien',
          date: nextWeek,
          startTime: '10:00',
          endTime: '12:00',
          type: 'SERVICE',
          location: 'Église',
          status: 'PLANNED',
          hasMultipleSessions: false,
          sessionCount: 1,
          churchId: church.id,
          createdById: admin.id
        }
      })
      events.push(testEvent)
      console.log(`✅ Événement créé: ${testEvent.title}`)
    }

    const testEvent = events[0]
    console.log(`🎯 Événement principal: ${testEvent.title}`)

    // Nettoyer d'anciennes données pour le test
    await prisma.eventTeamMember.deleteMany({
      where: { scheduleId: testEvent.id }
    })
    
    await prisma.eventSong.deleteMany({
      where: { scheduleId: testEvent.id }
    })

    // Test 1: Assigner le musicien à l'événement
    console.log('\n🧪 Test 1: Assignation du musicien à l\'événement...')
    
    const assignment = await prisma.eventTeamMember.create({
      data: {
        userId: musician.id,
        scheduleId: testEvent.id,
        role: 'Pianiste Principal',
        instruments: JSON.stringify(['Piano', 'Clavier']),
        assignedById: admin.id,
        notes: 'Responsible du clavier pour cet événement',
        churchId: church.id,
        isActive: true
      }
    })

    console.log(`   ✅ ${musician.firstName} assigné comme "${assignment.role}"`)
    console.log(`   🎹 Instruments: ${JSON.parse(assignment.instruments).join(', ')}`)

    // Test 2: Ajouter des morceaux à l'événement
    console.log('\n🧪 Test 2: Ajout de morceaux au répertoire de l\'événement...')
    
    const songs = await prisma.song.findMany({
      where: { churchId: church.id },
      take: 3
    })

    const eventSongs = []
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i]
      const eventSong = await prisma.eventSong.create({
        data: {
          songId: song.id,
          scheduleId: testEvent.id,
          order: i + 1,
          key: ['G', 'D', 'C'][i] || song.key,
          notes: `Version pour ${testEvent.title} - ${assignment.role}`,
          churchId: church.id
        }
      })
      eventSongs.push(eventSong)
      console.log(`   ${i + 1}. ${song.title} (Tonalité: ${eventSong.key})`)
    }

    // Test 3: Simuler l'API du musicien
    console.log('\n🧪 Test 3: Simulation API musicien...')
    
    const musicianAssignments = await prisma.eventTeamMember.findMany({
      where: {
        userId: musician.id,
        churchId: church.id,
        isActive: true,
        schedule: {
          date: { gte: new Date() },
          isActive: true
        }
      },
      include: {
        schedule: {
          include: {
            sessions: { orderBy: { sessionOrder: 'asc' } },
            eventSongs: {
              include: {
                song: {
                  include: { sequences: true }
                }
              },
              orderBy: { order: 'asc' }
            },
            directors: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        assignedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        schedule: { date: 'asc' }
      }
    })

    console.log(`   📋 ${musicianAssignments.length} assignation(s) trouvée(s) pour ${musician.firstName}`)

    const formattedEvents = musicianAssignments.map(assignment => {
      const event = assignment.schedule
      return {
        assignmentId: assignment.id,
        role: assignment.role,
        instruments: JSON.parse(assignment.instruments || '[]'),
        notes: assignment.notes,
        assignedAt: assignment.assignedAt,
        assignedBy: assignment.assignedBy,
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          type: event.type,
          location: event.location,
          status: event.status,
          directors: event.directors.map(d => ({
            name: `${d.user.firstName} ${d.user.lastName}`,
            email: d.user.email
          })),
          songs: event.eventSongs.map(es => ({
            id: es.id,
            ...es.song,
            eventOrder: es.order,
            eventKey: es.key,
            eventNotes: es.notes,
            sequencesCount: es.song.sequences.length,
            tags: JSON.parse(es.song.tags || '[]')
          }))
        }
      }
    })

    // Afficher les résultats
    console.log('\n📊 RÉSULTATS POUR LE MUSICIEN:')
    formattedEvents.forEach((assignment, i) => {
      const event = assignment.event
      console.log(`\n${i + 1}. 📅 ${event.title}`)
      console.log(`   📆 Date: ${event.date.toLocaleDateString('fr-FR')}`)
      console.log(`   🎭 Rôle: ${assignment.role}`)
      console.log(`   🎸 Instruments: ${assignment.instruments.join(', ')}`)
      console.log(`   📝 Notes: ${assignment.notes}`)
      console.log(`   🎵 Répertoire (${event.songs.length} morceaux):`)
      
      event.songs.forEach((song, j) => {
        console.log(`      ${j + 1}. ${song.title} - Tonalité: ${song.eventKey || song.key}`)
        if (song.eventNotes) {
          console.log(`         💡 ${song.eventNotes}`)
        }
      })
    })

    // Test 4: Vérifier les informations détaillées
    console.log('\n🧪 Test 4: Informations pour l\'interface musicien...')
    
    const detailedInfo = formattedEvents[0]
    if (detailedInfo) {
      const daysTillEvent = Math.ceil(
        (new Date(detailedInfo.event.date).getTime() - new Date().getTime()) 
        / (1000 * 60 * 60 * 24)
      )
      
      console.log(`   ⏰ Événement dans ${daysTillEvent} jour(s)`)
      console.log(`   ${daysTillEvent <= 3 ? '🚨 URGENT: Événement bientôt!' : '✅ Vous avez le temps de préparer'}`)
      console.log(`   📚 Morceaux à préparer: ${detailedInfo.event.songs.length}`)
      console.log(`   🎼 Tonalités à connaître: ${[...new Set(detailedInfo.event.songs.map(s => s.eventKey || s.key).filter(k => k))].join(', ')}`)
    }

    console.log('\n🎉 Test d\'assignation des musiciens réussi!')
    console.log('\n💡 Le musicien peut maintenant:')
    console.log('   1. Aller sur /app/musician/events pour voir ses événements assignés')
    console.log('   2. Voir le répertoire à préparer pour chaque événement')
    console.log('   3. Accéder aux vidéos YouTube, partitions et notes spécifiques')
    console.log('   4. Connaître son rôle et les instruments à apporter')
    console.log(`   5. Contacter les directeurs musicaux si besoin`)

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testMusicianAssignments()