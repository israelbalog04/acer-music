import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function initializeChurches() {
  try {
    console.log('🏛️ Initialisation du système multi-tenant ACER...')

    // 1. Créer les églises ACER
    const churchesData = [
      {
        name: 'ACER Paris',
        city: 'Paris',
        address: '123 Rue de la Paix, 75001 Paris',
        phone: '+33 1 23 45 67 89',
        email: 'contact@acer-paris.com',
        website: 'https://acer-paris.com',
        description: 'Église ACER de Paris - Communauté de foi dynamique au cœur de la capitale'
      },
      {
        name: 'ACER Rennes',
        city: 'Rennes',
        address: '45 Avenue de Bretagne, 35000 Rennes',
        phone: '+33 2 23 45 67 89',
        email: 'contact@acer-rennes.com',
        website: 'https://acer-rennes.com',
        description: 'Église ACER de Rennes - Une famille spirituelle en Bretagne'
      },
      {
        name: 'ACER Lyon',
        city: 'Lyon',
        address: '78 Place Bellecour, 69002 Lyon',
        phone: '+33 4 23 45 67 89',
        email: 'contact@acer-lyon.com',
        website: 'https://acer-lyon.com',
        description: 'Église ACER de Lyon - Rayonnant dans la région Rhône-Alpes'
      }
    ]

    console.log('📍 Création des églises...')
    const churches = []
    
    for (const churchData of churchesData) {
      const church = await prisma.church.create({
        data: churchData
      })
      churches.push(church)
      console.log(`✅ ${church.name} créée (ID: ${church.id})`)
    }

    // 2. Créer un administrateur pour chaque église
    console.log('\n👥 Création des administrateurs...')
    
    for (const church of churches) {
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const admin = await prisma.user.create({
        data: {
          email: `admin@acer-${church.city.toLowerCase()}.com`,
          firstName: 'Admin',
          lastName: church.city,
          phone: church.phone,
          password: hashedPassword,
          role: 'ADMIN',
          churchId: church.id,
          instruments: JSON.stringify(['Direction'])
        }
      })

      console.log(`✅ Admin créé pour ${church.name}:`)
      console.log(`   📧 Email: ${admin.email}`)
      console.log(`   🔑 Mot de passe: admin123`)
    }

    // 3. Créer quelques utilisateurs d'exemple pour chaque église
    console.log('\n🎭 Création d\'utilisateurs d\'exemple...')
    
    const roles = ['CHEF_LOUANGE', 'MUSICIEN', 'TECHNICIEN']
    const instruments = {
      CHEF_LOUANGE: ['Piano', 'Direction'],
      MUSICIEN: ['Guitare', 'Chant'],
      TECHNICIEN: ['Son', 'Éclairage']
    }

    for (const church of churches) {
      for (let i = 0; i < 3; i++) {
        const role = roles[i] as 'CHEF_LOUANGE' | 'MUSICIEN' | 'TECHNICIEN'
        const hashedPassword = await bcrypt.hash('password123', 12)
        
        const user = await prisma.user.create({
          data: {
            email: `${role.toLowerCase()}@acer-${church.city.toLowerCase()}.com`,
            firstName: role === 'CHEF_LOUANGE' ? 'Marie' : role === 'MUSICIEN' ? 'Pierre' : 'Thomas',
            lastName: church.city,
            password: hashedPassword,
            role: role,
            churchId: church.id,
            instruments: JSON.stringify(instruments[role])
          }
        })

        console.log(`   ✅ ${user.firstName} ${user.lastName} (${user.role}) - ${church.name}`)
      }
    }

    // 4. Créer quelques chansons d'exemple pour chaque église
    console.log('\n🎵 Création du répertoire d\'exemple...')
    
    const songsData = [
      { title: 'Amazing Grace', artist: 'John Newton', key: 'G', bpm: 120 },
      { title: 'How Great Thou Art', artist: 'Stuart K. Hine', key: 'D', bpm: 95 },
      { title: 'Blessed Assurance', artist: 'Fanny Crosby', key: 'A', bpm: 110 }
    ]

    for (const church of churches) {
      for (const songData of songsData) {
        await prisma.song.create({
          data: {
            ...songData,
            tags: JSON.stringify(['gospel', 'louange', 'classique']),
            churchId: church.id
          }
        })
      }
      console.log(`   ✅ ${songsData.length} chansons ajoutées pour ${church.name}`)
    }

    console.log('\n🎉 Initialisation terminée avec succès!')
    console.log('\n📋 Résumé des comptes administrateurs:')
    
    for (const church of churches) {
      console.log(`\n🏛️  ${church.name}:`)
      console.log(`   📧 Email: admin@acer-${church.city.toLowerCase()}.com`)
      console.log(`   🔑 Mot de passe: admin123`)
      console.log(`   🆔 Church ID: ${church.id}`)
    }

    console.log('\n⚠️  N\'oubliez pas de changer les mots de passe après la première connexion!')

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initializeChurches()