#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Test de connexion à la base de données PostgreSQL...');
  
  // Afficher les variables d'environnement (sans les mots de passe)
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  
  console.log('\n📋 Configuration actuelle:');
  console.log(`DATABASE_URL: ${dbUrl ? '✅ Configurée' : '❌ Non configurée'}`);
  console.log(`DIRECT_URL: ${directUrl ? '✅ Configurée' : '❌ Non configurée'}`);
  
  if (dbUrl) {
    // Masquer le mot de passe dans l'URL pour l'affichage
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`URL masquée: ${maskedUrl}`);
  }
  
  try {
    console.log('\n🔌 Tentative de connexion...');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    });
    
    // Test de connexion simple
    await prisma.$connect();
    console.log('✅ Connexion réussie !');
    
    // Test d'une requête simple
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Requête de test réussie:', result);
    
    // Vérifier les tables existantes
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('📊 Tables existantes:', tables.length);
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    await prisma.$disconnect();
    console.log('\n🎉 Tous les tests de connexion sont passés !');
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion:', error.message);
    console.error('Code d\'erreur:', error.code);
    
    // Suggestions de résolution
    console.log('\n🔧 Suggestions de résolution:');
    
    if (error.code === 'P1001') {
      console.log('1. Vérifiez que l\'URL de connexion est correcte');
      console.log('2. Vérifiez que la base de données PostgreSQL est accessible');
      console.log('3. Vérifiez les paramètres de sécurité (firewall, IP whitelist)');
    }
    
    if (error.code === 'P1017') {
      console.log('1. Vérifiez les identifiants de connexion');
      console.log('2. Vérifiez que l\'utilisateur a les permissions nécessaires');
    }
    
    if (error.code === 'P1018') {
      console.log('1. Vérifiez que la base de données existe');
      console.log('2. Vérifiez que l\'utilisateur a accès à cette base');
    }
    
    console.log('\n📝 Configuration recommandée pour Supabase:');
    console.log('DATABASE_URL="postgresql://postgres:[PASSWORD]@db.butlptmveyaluxlnwizr.supabase.co:5432/postgres"');
    console.log('DIRECT_URL="postgresql://postgres:[PASSWORD]@db.butlptmveyaluxlnwizr.supabase.co:5432/postgres"');
    
    process.exit(1);
  }
}

// Exécuter le test
testDatabaseConnection();
