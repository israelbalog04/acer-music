const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSequences() {
  try {
    console.log('🎼 Test du système de séquences...')

    // Vérifier les entités de base
    const church = await prisma.church.findFirst()
    const musician = await prisma.user.findFirst({ where: { role: 'MUSICIEN' }})
    const song = await prisma.song.findFirst({ where: { churchId: church.id }})
    
    console.log(`✅ Église: ${church.name}`)
    console.log(`✅ Musicien: ${musician.firstName} ${musician.lastName}`)
    console.log(`✅ Morceau: ${song.title}`)

    // Test 1: Créer une séquence pour ce morceau
    console.log('\n🧪 Test 1: Création d\'une séquence...')
    
    const sequence = await prisma.sequence.create({
      data: {
        title: `Partition Piano - ${song.title}`,
        description: `Partition piano pour le morceau ${song.title}`,
        songId: song.id,
        fileUrl: '/uploads/sequences/test-partition.pdf',
        fileName: 'partition-piano.pdf',
        fileSize: 1024000, // 1MB
        fileType: 'application/pdf',
        scope: 'GLOBAL',
        isActive: true,
        isPublic: true,
        churchId: church.id,
        createdById: musician.id
      }
    })

    console.log(`   ✅ Séquence créée: ${sequence.title}`)
    console.log(`   📄 Fichier: ${sequence.fileName}`)
    console.log(`   📂 URL: ${sequence.fileUrl}`)

    // Test 2: Récupérer les séquences du morceau
    console.log('\n🧪 Test 2: Récupération des séquences du morceau...')
    
    const songWithSequences = await prisma.song.findFirst({
      where: { id: song.id },
      include: {
        sequences: {
          where: { isActive: true },
          include: {
            createdBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    console.log(`   📚 ${songWithSequences.sequences.length} séquence(s) trouvée(s)`)
    songWithSequences.sequences.forEach((seq, index) => {
      console.log(`   ${index + 1}. ${seq.title} - par ${seq.createdBy.firstName} ${seq.createdBy.lastName}`)
    })

    // Test 3: Tester l'API de récupération
    console.log('\n🧪 Test 3: Test de l\'API de récupération...')
    
    const apiSequences = await prisma.sequence.findMany({
      where: {
        songId: song.id,
        churchId: church.id,
        isActive: true
      },
      include: {
        song: {
          select: {
            title: true,
            artist: true
          }
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    console.log(`   🔍 API retourne ${apiSequences.length} séquence(s)`)
    apiSequences.forEach((seq) => {
      console.log(`   📋 ${seq.title} pour "${seq.song.title}"`)
    })

    // Test 4: Vérifier les compteurs sur les morceaux
    console.log('\n🧪 Test 4: Vérification des compteurs...')
    
    const songsWithCount = await prisma.song.findMany({
      where: { churchId: church.id },
      include: {
        sequences: {
          where: { isActive: true },
          select: { id: true }
        }
      },
      take: 3
    })

    songsWithCount.forEach((s) => {
      console.log(`   🎵 "${s.title}" - ${s.sequences.length} séquence(s)`)
    })

    console.log('\n🎉 Test du système de séquences réussi!')
    console.log('\n💡 Les musiciens peuvent maintenant:')
    console.log('   1. Aller sur /app/music/repertoire et cliquer sur l\'icône verte des partitions')
    console.log('   2. Uploader des PDF, MP3, images de partitions pour chaque morceau')  
    console.log('   3. Télécharger et consulter les séquences ajoutées par d\'autres')
    console.log('   4. Voir le nombre de séquences disponibles sur chaque morceau')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testSequences()