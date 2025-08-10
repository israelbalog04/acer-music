import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔧 Création du compte administrateur...')

    // Données de l'administrateur
    const adminData = {
      email: 'admin@acer.com',
      firstName: 'Admin',
      lastName: 'Acer',
      phone: '+33 1 23 45 67 89',
      password: 'admin123', // Mot de passe en clair
      role: 'ADMIN' as const,
      instruments: JSON.stringify(['Piano', 'Direction']),
      avatar: null
    }

    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email }
    })

    if (existingAdmin) {
      console.log('⚠️  Un administrateur avec cet email existe déjà')
      console.log(`📧 Email: ${existingAdmin.email}`)
      console.log(`👤 Nom: ${existingAdmin.firstName} ${existingAdmin.lastName}`)
      console.log(`🎭 Rôle: ${existingAdmin.role}`)
      return
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminData.password, 12)

    // Créer l'administrateur
    const admin = await prisma.user.create({
      data: {
        email: adminData.email,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        phone: adminData.phone,
        password: hashedPassword,
        role: adminData.role,
        instruments: adminData.instruments,
        avatar: adminData.avatar
      }
    })

    console.log('✅ Compte administrateur créé avec succès !')
    console.log('📋 Détails du compte :')
    console.log(`   📧 Email: ${admin.email}`)
    console.log(`   👤 Nom: ${admin.firstName} ${admin.lastName}`)
    console.log(`   📱 Téléphone: ${admin.phone}`)
    console.log(`   🎭 Rôle: ${admin.role}`)
    console.log(`   🎵 Instruments: ${admin.instruments}`)
    console.log(`   🔑 Mot de passe: ${adminData.password}`)
    console.log(`   🆔 ID: ${admin.id}`)
    console.log('')
    console.log('🚀 Vous pouvez maintenant vous connecter avec :')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Mot de passe: ${adminData.password}`)

  } catch (error) {
    console.error('❌ Erreur lors de la création du compte administrateur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour créer un admin personnalisé
async function createCustomAdmin(email: string, firstName: string, lastName: string, password: string) {
  try {
    console.log('🔧 Création du compte administrateur personnalisé...')

    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      console.log('⚠️  Un utilisateur avec cet email existe déjà')
      console.log(`📧 Email: ${existingAdmin.email}`)
      console.log(`👤 Nom: ${existingAdmin.firstName} ${existingAdmin.lastName}`)
      console.log(`🎭 Rôle: ${existingAdmin.role}`)
      return
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'administrateur
    const admin = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone: null,
        password: hashedPassword,
        role: 'ADMIN',
        instruments: JSON.stringify(['Direction']),
        avatar: null
      }
    })

    console.log('✅ Compte administrateur personnalisé créé avec succès !')
    console.log('📋 Détails du compte :')
    console.log(`   📧 Email: ${admin.email}`)
    console.log(`   👤 Nom: ${admin.firstName} ${admin.lastName}`)
    console.log(`   🎭 Rôle: ${admin.role}`)
    console.log(`   🔑 Mot de passe: ${password}`)
    console.log(`   🆔 ID: ${admin.id}`)

  } catch (error) {
    console.error('❌ Erreur lors de la création du compte administrateur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour lister tous les administrateurs
async function listAdmins() {
  try {
    console.log('👥 Liste des administrateurs :')
    
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    })

    if (admins.length === 0) {
      console.log('❌ Aucun administrateur trouvé')
      return
    }

    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. Administrateur :`)
      console.log(`   🆔 ID: ${admin.id}`)
      console.log(`   📧 Email: ${admin.email}`)
      console.log(`   👤 Nom: ${admin.firstName} ${admin.lastName}`)
      console.log(`   🎭 Rôle: ${admin.role}`)
      console.log(`   📅 Créé le: ${admin.createdAt.toLocaleDateString('fr-FR')}`)
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des administrateurs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution du script
const command = process.argv[2]

switch (command) {
  case 'create':
    createAdmin()
    break
  case 'custom':
    const email = process.argv[3]
    const firstName = process.argv[4]
    const lastName = process.argv[5]
    const password = process.argv[6]
    
    if (!email || !firstName || !lastName || !password) {
      console.log('❌ Usage: npm run create-admin custom <email> <firstName> <lastName> <password>')
      process.exit(1)
    }
    
    createCustomAdmin(email, firstName, lastName, password)
    break
  case 'list':
    listAdmins()
    break
  default:
    console.log('🔧 Script de gestion des administrateurs')
    console.log('')
    console.log('📋 Commandes disponibles :')
    console.log('   npm run create-admin create     # Créer un admin par défaut')
    console.log('   npm run create-admin custom     # Créer un admin personnalisé')
    console.log('   npm run create-admin list       # Lister tous les admins')
    console.log('')
    console.log('📝 Exemple d\'utilisation :')
    console.log('   npm run create-admin custom john@acer.com John Doe password123')
} 