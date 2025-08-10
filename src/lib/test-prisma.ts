import { prisma } from './prisma'

export async function testPrismaConnection() {
  try {
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connexion à la base de données réussie')

    // Compter les utilisateurs
    const userCount = await prisma.user.count()
    console.log(`👥 Nombre d'utilisateurs: ${userCount}`)

    // Compter les chants
    const songCount = await prisma.song.count()
    console.log(`🎵 Nombre de chants: ${songCount}`)

    // Compter les équipes
    const teamCount = await prisma.team.count()
    console.log(`👥 Nombre d'équipes: ${teamCount}`)

    // Compter les plannings
    const scheduleCount = await prisma.schedule.count()
    console.log(`📅 Nombre de plannings: ${scheduleCount}`)

    return {
      success: true,
      userCount,
      songCount,
      teamCount,
      scheduleCount
    }
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  } finally {
    await prisma.$disconnect()
  }
} 