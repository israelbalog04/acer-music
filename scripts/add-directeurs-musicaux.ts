import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function addDirecteursMusicaux() {
  try {
    console.log('🎼 Ajout des Directeurs Musicaux...')

    // Récupérer toutes les églises
    const churches = await prisma.church.findMany()

    const directeursMusicaux = []

    for (const church of churches) {
      const hashedPassword = await bcrypt.hash('dm123', 12)
      
      // Créer un Directeur Musical pour chaque église
      const dm = await prisma.user.create({
        data: {
          email: `dm@acer-${church.city.toLowerCase()}.com`,
          firstName: 'Directeur',
          lastName: `Musical ${church.city}`,
          phone: church.phone,
          password: hashedPassword,
          role: 'DIRECTEUR_MUSICAL',
          churchId: church.id,
          instruments: JSON.stringify(['Piano', 'Direction', 'Arrangement'])
        }
      })

      directeursMusicaux.push({ dm, church })
      console.log(`✅ DM créé pour ${church.name}: ${dm.email}`)
    }

    // Créer quelques séquences d'exemple pour chaque église
    console.log('\n🎵 Création de séquences d\'exemple...')

    const sequencesExemples = [
      {
        title: 'Amazing Grace - Arrangement Piano',
        description: 'Arrangement complet piano avec accords et mélodie principale',
        key: 'G',
        bpm: 120,
        duration: 240,
        instruments: ['Piano'],
        difficulty: 'Intermédiaire',
        category: 'Louange',
        tags: ['classique', 'gospel', 'piano']
      },
      {
        title: 'How Great Thou Art - Full Band',
        description: 'Partition complète pour groupe (Piano, Guitare, Basse, Batterie)',
        key: 'D',
        bpm: 95,
        duration: 300,
        instruments: ['Piano', 'Guitare', 'Basse', 'Batterie'],
        difficulty: 'Avancé',
        category: 'Adoration',
        tags: ['moderne', 'full-band', 'adoration']
      },
      {
        title: 'Blessed Assurance - Chant & Piano',
        description: 'Version simple chant et piano pour débutants',
        key: 'A',
        bpm: 110,
        duration: 180,
        instruments: ['Piano', 'Chant'],
        difficulty: 'Débutant',
        category: 'Évangélisation',
        tags: ['simple', 'débutant', 'chant']
      }
    ]

    for (const { dm, church } of directeursMusicaux) {
      // Récupérer les chansons de cette église
      const songs = await prisma.song.findMany({
        where: { churchId: church.id }
      })

      for (let i = 0; i < sequencesExemples.length; i++) {
        const sequenceData = sequencesExemples[i]
        const correspondingSong = songs.find(song => 
          song.title.toLowerCase().includes(sequenceData.title.split(' - ')[0].toLowerCase())
        )

        const sequence = await prisma.sequence.create({
          data: {
            title: sequenceData.title,
            description: sequenceData.description,
            songId: correspondingSong?.id,
            key: sequenceData.key,
            bpm: sequenceData.bpm,
            duration: sequenceData.duration,
            instruments: JSON.stringify(sequenceData.instruments),
            difficulty: sequenceData.difficulty,
            category: sequenceData.category,
            tags: JSON.stringify(sequenceData.tags),
            churchId: church.id,
            createdById: dm.id,
            // Simulation de fichier - en production, ces champs seraient remplis lors de l'upload
            fileName: `${sequenceData.title.replace(/\s+/g, '_').toLowerCase()}.pdf`,
            fileType: 'application/pdf',
            fileSize: Math.floor(Math.random() * 500000) + 100000 // Simulation taille fichier
          }
        })

        console.log(`   ✅ Séquence "${sequence.title}" créée pour ${church.name}`)
      }
    }

    console.log('\n🎉 Configuration des Directeurs Musicaux terminée!')
    console.log('\n📋 Comptes DM créés:')
    
    for (const church of churches) {
      console.log(`\n🏛️  ${church.name}:`)
      console.log(`   📧 Email: dm@acer-${church.city.toLowerCase()}.com`)
      console.log(`   🔑 Mot de passe: dm123`)
      console.log(`   🎼 Rôle: DIRECTEUR_MUSICAL`)
    }

    console.log('\n⚠️  Les DM peuvent maintenant :')
    console.log('   ✅ Ajouter des séquences musicales')
    console.log('   ✅ Modifier leurs séquences')
    console.log('   ✅ Voir les statistiques de téléchargement')
    console.log('\n⚠️  Les musiciens peuvent :')
    console.log('   ✅ Consulter toutes les séquences de leur église')
    console.log('   ✅ Télécharger les séquences')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addDirecteursMusicaux()