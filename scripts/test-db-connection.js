const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  console.log('🔍 Test de connexion à la base de données...')
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Définie' : 'Non définie')
    console.log('URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'))
    
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connexion réussie')
    
    // Test de requête simple
    const churchCount = await prisma.church.count()
    console.log(`✅ Nombre d'églises: ${churchCount}`)
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message)
    console.error('Code d\'erreur:', error.code)
    
    if (error.message.includes('authentication')) {
      console.log('💡 Vérifiez les credentials de la base de données')
    }
    if (error.message.includes('reach database server')) {
      console.log('💡 Vérifiez l\'URL de connexion à la base de données')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection().catch(console.error)