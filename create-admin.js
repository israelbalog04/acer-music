const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔧 Création du compte administrateur...')

    // Récupérer l'église existante
    const church = await prisma.church.findFirst()
    if (!church) {
      throw new Error('Aucune église trouvée. Veuillez d\'abord créer une église.')
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('Yvana2001*', 12)

    // Supprimer l'ancien admin s'il existe
    await prisma.user.deleteMany({
      where: { email: 'balogisrael02@gmail.com' }
    })

    // Créer l'administrateur
    const admin = await prisma.user.create({
      data: {
        email: 'balogisrael02@gmail.com',
        firstName: 'Israel',
        lastName: 'BALOGI',
        phone: '+33 6 12 34 56 78',
        password: hashedPassword,
        role: 'ADMIN',
        instruments: JSON.stringify(['Piano', 'Direction', 'Management']),
        avatar: null,
        churchId: church.id
      }
    })

    console.log('✅ Compte administrateur créé avec succès !')
    console.log('📋 Détails :')
    console.log(`   📧 Email: ${admin.email}`)
    console.log(`   👤 Nom: ${admin.firstName} ${admin.lastName}`)
    console.log(`   🎭 Rôle: ${admin.role}`)
    console.log(`   🔑 Mot de passe: Yvana2001*`)

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Un administrateur avec cet email existe déjà')
    } else {
      console.error('❌ Erreur:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin() 