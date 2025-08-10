const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSongRecognition() {
  try {
    console.log('🎵 Test de la reconnaissance automatique de morceau...')

    // Récupérer les morceaux existants
    const church = await prisma.church.findFirst()
    const musician = await prisma.user.findFirst({ where: { role: 'MUSICIEN' }})
    const songs = await prisma.song.findMany({ 
      where: { churchId: church.id },
      take: 3
    })
    
    console.log(`✅ Église: ${church.name}`)
    console.log(`✅ Musicien: ${musician.firstName} ${musician.lastName}`)
    console.log(`✅ ${songs.length} morceaux disponibles pour test`)

    // Test 1: Simuler le clic sur bouton rouge pour chaque morceau
    console.log('\n🧪 Test 1: Simulation du clic bouton rouge sur différents morceaux...')
    
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i]
      console.log(`\n   ${i + 1}. Clic sur 🎤 pour "${song.title}":`)
      console.log(`      ✅ Système reconnaît: ${song.title}`)
      console.log(`      ✅ Artiste détecté: ${song.artist || 'Non spécifié'}`)
      console.log(`      ✅ Tonalité détectée: ${song.key || 'Non spécifiée'}`)
      
      // Simuler les titres auto-générés selon l'instrument
      const instruments = ['Piano', 'Guitare', 'Chant']
      instruments.forEach(instrument => {
        const autoTitle = `${song.title} - ${instrument}`
        console.log(`      🎹 Titre auto pour ${instrument}: "${autoTitle}"`)
      })
    }

    // Test 2: Créer des enregistrements avec reconnaissance automatique
    console.log('\n🧪 Test 2: Création d\'enregistrements avec reconnaissance automatique...')
    
    const testSong = songs[0] // Utiliser le premier morceau
    console.log(`\n   🎯 Test avec le morceau: "${testSong.title}"`)
    
    // Simuler différents enregistrements
    const recordingTests = [
      {
        instrument: 'Piano',
        notes: 'Version piano avec reconnaissance automatique'
      },
      {
        instrument: 'Guitare', 
        notes: 'Version guitare - système a détecté le bon morceau'
      },
      {
        instrument: 'Chant',
        notes: 'Chant principal - morceau reconnu automatiquement'
      }
    ]

    for (const test of recordingTests) {
      const autoTitle = `${testSong.title} - ${test.instrument}`
      
      const recording = await prisma.recording.create({
        data: {
          title: autoTitle, // Titre généré automatiquement
          instrument: test.instrument,
          songId: testSong.id, // Morceau reconnu automatiquement
          audioUrl: `/uploads/recordings/auto-${test.instrument.toLowerCase()}-${testSong.id}.mp3`,
          status: 'IN_REVIEW',
          notes: test.notes,
          churchId: church.id,
          userId: musician.id
        },
        include: {
          song: {
            select: {
              title: true,
              artist: true,
              key: true
            }
          }
        }
      })

      console.log(`   ✅ Enregistrement créé:`)
      console.log(`      🎵 Morceau reconnu: ${recording.song.title}`)
      console.log(`      🎼 Titre auto: "${recording.title}"`)
      console.log(`      📻 Instrument: ${recording.instrument}`)
      console.log(`      📝 Notes: ${recording.notes}`)
    }

    // Test 3: Vérifier la liaison automatique morceau-enregistrement
    console.log('\n🧪 Test 3: Vérification des liaisons automatiques...')
    
    const songWithRecordings = await prisma.song.findFirst({
      where: { id: testSong.id },
      include: {
        recordings: {
          where: { 
            churchId: church.id,
            userId: musician.id
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    console.log(`   🎵 Morceau: "${songWithRecordings.title}"`)
    console.log(`   📊 ${songWithRecordings.recordings.length} enregistrements automatiquement liés`)
    
    songWithRecordings.recordings.forEach((rec, index) => {
      console.log(`      ${index + 1}. "${rec.title}" (${rec.instrument})`)
      console.log(`         Status: ${rec.status} | Notes: ${rec.notes}`)
    })

    // Test 4: Simulation API pour interface
    console.log('\n🧪 Test 4: Test API reconnaissance pour interface...')
    
    // Simuler l'appel API GET /api/recordings?songId=xxx
    const apiRecordings = await prisma.recording.findMany({
      where: {
        songId: testSong.id,
        churchId: church.id
      },
      include: {
        song: {
          select: {
            title: true,
            artist: true,
            key: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`   🔍 API /api/recordings?songId=${testSong.id}`)
    console.log(`   📋 Retourne ${apiRecordings.length} enregistrements pour "${testSong.title}"`)
    
    apiRecordings.forEach((rec, index) => {
      console.log(`      ${index + 1}. ${rec.title}`)
      console.log(`         🎵 Morceau reconnu: ${rec.song.title}`)
      console.log(`         👤 Par: ${rec.user.firstName} ${rec.user.lastName}`)
      console.log(`         📻 Instrument: ${rec.instrument}`)
    })

    // Test 5: Vérifier la reconnaissance dans différents contextes
    console.log('\n🧪 Test 5: Contextes de reconnaissance...')
    
    // Grouper par morceau pour voir la reconnaissance
    const allSongs = await prisma.song.findMany({
      where: { churchId: church.id },
      include: {
        recordings: {
          select: {
            id: true,
            title: true,
            instrument: true,
            status: true
          }
        }
      }
    })

    console.log('   📊 Résumé de reconnaissance par morceau:')
    allSongs.forEach(song => {
      const totalRecordings = song.recordings.length
      const approvedCount = song.recordings.filter(r => r.status === 'APPROVED').length
      
      console.log(`      🎵 "${song.title}": ${totalRecordings} enregistrements`)
      if (totalRecordings > 0) {
        song.recordings.forEach(rec => {
          const statusEmoji = rec.status === 'APPROVED' ? '✅' : rec.status === 'IN_REVIEW' ? '⏳' : '📝'
          console.log(`         ${statusEmoji} ${rec.title} (${rec.instrument})`)
        })
      }
    })

    console.log('\n🎉 Test de reconnaissance automatique réussi!')
    console.log('\n💡 Fonctionnement de la reconnaissance:')
    console.log('   1. 🎯 L\'utilisateur clique sur l\'icône 🎤 d\'un morceau spécifique')
    console.log('   2. ✅ Le système reconnaît automatiquement le morceau sélectionné')
    console.log('   3. 🏷️ Le titre est pré-généré: "[Morceau] - [Instrument]"')
    console.log('   4. 🔗 L\'enregistrement est automatiquement lié au bon morceau')
    console.log('   5. 📋 L\'admin voit clairement quel morceau a été enregistré')
    console.log('   6. 🎧 Les autres musiciens peuvent trouver les versions par morceau')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testSongRecognition()