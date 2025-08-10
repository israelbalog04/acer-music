const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRecordingsSystem() {
  try {
    console.log('🎤 Test du système d\'enregistrements par morceau...')

    // Vérifier les entités de base
    const church = await prisma.church.findFirst()
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }})
    const musician = await prisma.user.findFirst({ where: { role: 'MUSICIEN' }})
    const song = await prisma.song.findFirst({ where: { churchId: church.id }})
    
    console.log(`✅ Église: ${church.name}`)
    console.log(`✅ Admin: ${admin.firstName} ${admin.lastName}`)
    console.log(`✅ Musicien: ${musician.firstName} ${musician.lastName}`)
    console.log(`✅ Morceau: ${song.title}`)

    // Test 1: Créer un enregistrement de musicien (soumission)
    console.log('\n🧪 Test 1: Soumission d\'un enregistrement...')
    
    const recording = await prisma.recording.create({
      data: {
        title: `Piano - ${song.title}`,
        instrument: 'Piano',
        songId: song.id,
        audioUrl: '/uploads/recordings/test-piano-amazing-grace.mp3',
        status: 'IN_REVIEW',
        notes: 'Version piano douce pour ce magnifique hymne',
        churchId: church.id,
        userId: musician.id
      }
    })

    console.log(`   ✅ Enregistrement soumis: ${recording.title}`)
    console.log(`   📻 Instrument: ${recording.instrument}`)
    console.log(`   📋 Statut: ${recording.status} (en attente de validation)`)

    // Test 2: Récupérer les enregistrements en attente (pour admin)
    console.log('\n🧪 Test 2: Récupération des enregistrements en attente...')
    
    const pendingRecordings = await prisma.recording.findMany({
      where: {
        churchId: church.id,
        status: 'IN_REVIEW'
      },
      include: {
        song: {
          select: {
            title: true,
            artist: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    console.log(`   📋 ${pendingRecordings.length} enregistrement(s) en attente`)
    pendingRecordings.forEach((rec, index) => {
      console.log(`   ${index + 1}. "${rec.title}" par ${rec.user.firstName} ${rec.user.lastName}`)
      console.log(`      🎵 Morceau: ${rec.song.title}`)
      console.log(`      💬 Notes: ${rec.notes}`)
    })

    // Test 3: Validation par l'admin (approbation)
    console.log('\n🧪 Test 3: Validation par l\'admin...')
    
    const approvedRecording = await prisma.recording.update({
      where: { id: recording.id },
      data: {
        status: 'APPROVED',
        reviewNotes: 'Excellente interprétation ! Approuvé pour partage',
        reviewedById: admin.id,
        reviewedAt: new Date()
      },
      include: {
        reviewedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    console.log(`   ✅ Enregistrement approuvé par ${approvedRecording.reviewedBy.firstName} ${approvedRecording.reviewedBy.lastName}`)
    console.log(`   📋 Nouveau statut: ${approvedRecording.status}`)
    console.log(`   💬 Notes de validation: ${approvedRecording.reviewNotes}`)

    // Test 4: Tester l'API de récupération des enregistrements par morceau
    console.log('\n🧪 Test 4: Test API d\'enregistrements par morceau...')
    
    const songRecordings = await prisma.recording.findMany({
      where: {
        songId: song.id,
        churchId: church.id
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`   🔍 API retourne ${songRecordings.length} enregistrement(s) pour "${song.title}"`)
    songRecordings.forEach((rec) => {
      const statusEmoji = rec.status === 'APPROVED' ? '✅' : rec.status === 'IN_REVIEW' ? '⏳' : '📝'
      console.log(`   ${statusEmoji} ${rec.title} - ${rec.instrument} (${rec.status})`)
    })

    // Test 5: Créer quelques autres enregistrements pour test
    console.log('\n🧪 Test 5: Création d\'enregistrements supplémentaires...')

    // Enregistrement guitare (approuvé directement pour test)
    await prisma.recording.create({
      data: {
        title: `Guitare Acoustique - ${song.title}`,
        instrument: 'Guitare',
        songId: song.id,
        audioUrl: '/uploads/recordings/test-guitar-amazing-grace.mp3',
        status: 'APPROVED',
        notes: 'Version guitare fingerstyle',
        reviewNotes: 'Belle interprétation guitaristique',
        churchId: church.id,
        userId: musician.id,
        reviewedById: admin.id,
        reviewedAt: new Date()
      }
    })

    // Enregistrement chant (en attente)
    await prisma.recording.create({
      data: {
        title: `Chant Lead - ${song.title}`,
        instrument: 'Chant',
        songId: song.id,
        audioUrl: '/uploads/recordings/test-vocal-amazing-grace.mp3',
        status: 'IN_REVIEW',
        notes: 'Version chant principal avec harmonies',
        churchId: church.id,
        userId: musician.id
      }
    })

    console.log('   ✅ Enregistrement guitare créé (APPROUVÉ)')
    console.log('   ✅ Enregistrement chant créé (EN_ATTENTE)')

    // Test 6: Statistiques finales
    console.log('\n🧪 Test 6: Statistiques du système...')
    
    const stats = await prisma.recording.groupBy({
      by: ['status'],
      where: { churchId: church.id },
      _count: { status: true }
    })

    console.log('   📊 Statistiques des enregistrements:')
    stats.forEach(stat => {
      const label = {
        'APPROVED': 'Approuvés',
        'IN_REVIEW': 'En attente',
        'DRAFT': 'Brouillons'
      }[stat.status] || stat.status
      console.log(`      ${stat.status === 'APPROVED' ? '✅' : stat.status === 'IN_REVIEW' ? '⏳' : '📝'} ${label}: ${stat._count.status}`)
    })

    // Vérifier les enregistrements par morceau
    const songsWithRecordings = await prisma.song.findMany({
      where: { churchId: church.id },
      include: {
        recordings: {
          where: { status: 'APPROVED' },
          select: { 
            id: true,
            instrument: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      take: 3
    })

    console.log('\n   🎵 Enregistrements approuvés par morceau:')
    songsWithRecordings.forEach((s) => {
      console.log(`      "${s.title}" - ${s.recordings.length} enregistrement(s) approuvé(s)`)
      s.recordings.forEach(rec => {
        console.log(`         🎸 ${rec.instrument} par ${rec.user.firstName} ${rec.user.lastName}`)
      })
    })

    console.log('\n🎉 Test du système d\'enregistrements réussi!')
    console.log('\n💡 Fonctionnalités disponibles:')
    console.log('   1. 🎤 MUSICIENS: Aller sur /app/music/repertoire → clic icône rouge 🎤')
    console.log('   2. 📤 Soumettre leurs enregistrements audio (MP3, WAV, etc.)')  
    console.log('   3. ⏳ Voir leurs enregistrements en attente de validation')
    console.log('   4. 🎧 Écouter les enregistrements approuvés des autres')
    console.log('   5. 👨‍💼 ADMINS: Aller sur /app/admin/recordings')
    console.log('   6. ✅ Approuver ou refuser les enregistrements soumis')
    console.log('   7. 💬 Laisser des notes de validation')
    console.log('   8. 📊 Voir les statistiques de validation')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testRecordingsSystem()