import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupChurches() {
  try {
    console.log('🏛️ Configuration du système multi-tenant ACER...')

    // 1. Créer les églises ACER
    const churches = [
      {
        name: 'ACER Paris',
        city: 'Paris',
        address: 'Adresse Paris',
        phone: '+33 1 23 45 67 89',
        email: 'contact@acer-paris.com',
        description: 'Église ACER de Paris'
      },
      {
        name: 'ACER Rennes',
        city: 'Rennes',
        address: 'Adresse Rennes',
        phone: '+33 2 23 45 67 89',
        email: 'contact@acer-rennes.com',
        description: 'Église ACER de Rennes'
      },
      {
        name: 'ACER Lyon',
        city: 'Lyon',
        address: 'Adresse Lyon',
        phone: '+33 4 23 45 67 89',
        email: 'contact@acer-lyon.com',
        description: 'Église ACER de Lyon'
      }
    ]

    console.log('📍 Création des églises...')
    const createdChurches = []
    
    for (const churchData of churches) {
      const existing = await prisma.church.findUnique({
        where: { name: churchData.name }
      })

      if (!existing) {
        const church = await prisma.church.create({ data: churchData })
        createdChurches.push(church)
        console.log(`✅ ${church.name} créée (ID: ${church.id})`)
      } else {
        createdChurches.push(existing)
        console.log(`ℹ️  ${existing.name} existe déjà (ID: ${existing.id})`)
      }
    }

    // 2. Assigner les utilisateurs existants à Paris par défaut
    const defaultChurch = createdChurches.find(c => c.city === 'Paris')
    if (!defaultChurch) {
      throw new Error('Église Paris introuvable')
    }

    console.log('\n👥 Migration des utilisateurs existants vers Paris...')
    const users = await prisma.user.findMany()
    
    for (const user of users) {
      if (!user.churchId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { churchId: defaultChurch.id }
        })
        console.log(`✅ ${user.firstName} ${user.lastName} assigné à ${defaultChurch.name}`)
      }
    }

    // 3. Assigner les autres entités à Paris par défaut
    const entities = ['recordings', 'songs', 'schedules', 'teams', 'availabilities']
    
    for (const entity of entities) {
      console.log(`\n🔄 Migration ${entity}...`)
      const items = await (prisma as any)[entity].findMany()
      
      for (const item of items) {
        if (!item.churchId) {
          await (prisma as any)[entity].update({
            where: { id: item.id },
            data: { churchId: defaultChurch.id }
          })
        }
      }
      console.log(`✅ ${items.length} ${entity} migrés vers ${defaultChurch.name}`)
    }

    console.log('\n🎉 Configuration multi-tenant terminée avec succès!')
    console.log('\n📋 Résumé:')
    createdChurches.forEach(church => {
      console.log(`   🏛️  ${church.name} (${church.city}) - ID: ${church.id}`)
    })

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupChurches()