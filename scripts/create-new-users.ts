import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const users = [
  {
    email: 'admin@acerparis.fr',
    firstName: 'Jean',
    lastName: 'Durand', 
    password: 'AdminAcer2024!',
    role: 'ADMIN' as const,
    instruments: JSON.stringify(['Piano', 'Direction']),
    phone: '+33 1 23 45 67 89'
  },
  {
    email: 'chef@acerparis.fr',
    firstName: 'Marie',
    lastName: 'Martin',
    password: 'ChefLouange2024!', 
    role: 'CHEF_LOUANGE' as const,
    instruments: JSON.stringify(['Chant', 'Piano', 'Direction']),
    phone: '+33 1 23 45 67 90'
  },
  {
    email: 'pianiste@acerparis.fr',
    firstName: 'Pierre',
    lastName: 'Dubois',
    password: 'Pianiste2024!',
    role: 'MUSICIEN' as const,
    instruments: JSON.stringify(['Piano', 'Orgue']),
    phone: '+33 1 23 45 67 91'
  },
  {
    email: 'guitariste@acerparis.fr',
    firstName: 'Sophie',
    lastName: 'Leroy',
    password: 'Guitariste2024!',
    role: 'MUSICIEN' as const,
    instruments: JSON.stringify(['Guitare', 'Chant']),
    phone: '+33 1 23 45 67 92'
  },
  {
    email: 'batteur@acerparis.fr',
    firstName: 'Thomas',
    lastName: 'Bernard',
    password: 'Batteur2024!',
    role: 'MUSICIEN' as const,
    instruments: JSON.stringify(['Batterie', 'Percussions']),
    phone: '+33 1 23 45 67 93'
  },
  {
    email: 'technicien@acerparis.fr',
    firstName: 'David',
    lastName: 'Moreau',
    password: 'Technicien2024!',
    role: 'TECHNICIEN' as const,
    instruments: JSON.stringify(['Son', 'Éclairage']),
    phone: '+33 1 23 45 67 94'
  }
]

async function createUsersAndChurch() {
  try {
    console.log('🏛️ Création de l\'église ACER Paris...')
    
    // Créer l'église ACER Paris
    const church = await prisma.church.create({
      data: {
        name: 'ACER Paris',
        city: 'Paris',
        address: '123 Rue de la République, 75011 Paris',
        phone: '+33 1 23 45 67 89',
        email: 'contact@acerparis.fr',
        website: 'https://acerparis.fr',
        description: 'Église ACER de Paris - Communauté chrétienne évangélique',
        isActive: true,
        settings: JSON.stringify({
          timezone: 'Europe/Paris',
          defaultServiceTime: '10:00',
          maxTeamSize: 8
        })
      }
    })

    console.log('👥 Création des utilisateurs...')
    
    const createdUsers = []
    
    for (const userData of users) {
      console.log(`Création de ${userData.firstName} ${userData.lastName}...`)
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          password: hashedPassword,
          role: userData.role,
          instruments: userData.instruments,
          churchId: church.id
        }
      })
      
      createdUsers.push({
        ...userData,
        id: user.id,
        churchId: church.id
      })
    }

    console.log('✅ Tous les utilisateurs ont été créés avec succès !')
    console.log(`🏛️ Église: ${church.name} (ID: ${church.id})`)
    console.log(`👥 ${createdUsers.length} utilisateurs créés`)

    return { church, users: createdUsers }

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
createUsersAndChurch()
  .then((result) => {
    console.log('\n🎉 Création terminée avec succès!')
    console.log('\n📋 Récapitulatif:')
    console.log(`🏛️ Église: ${result.church.name}`)
    console.log('👥 Utilisateurs créés:')
    result.users.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`)
    })
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })