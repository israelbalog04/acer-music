const { Client } = require('pg');

async function testConnection() {
  console.log('🔍 Test de connexion PostgreSQL simple...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:NcK9RVXYNNKim4el@db.ecyihoruofcmvaifkvbc.supabase.co:5432/postgres",
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Tentative de connexion...');
    await client.connect();
    console.log('✅ Connexion réussie!');

    // Test simple
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Requête réussie:');
    console.log('   - Heure actuelle:', result.rows[0].current_time);
    console.log('   - Version PostgreSQL:', result.rows[0].version.split(' ')[0]);

    // Vérifier les tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`\n📋 Tables trouvées: ${tables.rows.length}`);
    tables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔍 Diagnostic:');
      console.log('1. Vérifiez le mot de passe dans Supabase Dashboard');
      console.log('2. Vérifiez les politiques RLS');
      console.log('3. Vérifiez que l\'utilisateur a les droits suffisants');
    }
  } finally {
    await client.end();
  }
}

// Exécuter le test
testConnection()
  .then(() => {
    console.log('\n✅ Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
