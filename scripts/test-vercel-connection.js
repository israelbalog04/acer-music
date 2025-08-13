const { Client } = require('pg');

async function testVercelConnection() {
  console.log('🔍 Test de connexion Vercel vers Supabase...');
  
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:7cybzSYO0zZEoaUu@db.butlptmveyaluxlnwizr.supabase.co:5432/postgres';
  
  console.log('\n📋 URL de connexion:');
  console.log(connectionString.substring(0, 50) + '...');
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\n🔌 Tentative de connexion...');
    await client.connect();
    console.log('✅ Connexion réussie!');
    
    console.log('\n📊 Test de requête...');
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Requête réussie:');
    console.log('   - Heure:', result.rows[0].current_time);
    console.log('   - Version:', result.rows[0].version.split(' ')[0]);
    
    console.log('\n📋 Test des tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE' 
      ORDER BY table_name
    `);
    console.log(`✅ ${tables.rows.length} tables trouvées`);
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion:', error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n🔍 Diagnostic:');
      console.log('1. Vérifiez les restrictions IP dans Supabase');
      console.log('2. Vérifiez que Supabase est actif');
      console.log('3. Vérifiez les politiques RLS');
      console.log('4. Vérifiez l\'URL de connexion');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n🔍 Diagnostic:');
      console.log('1. Vérifiez le mot de passe');
      console.log('2. Vérifiez les permissions utilisateur');
    }
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  testVercelConnection()
    .then(() => {
      console.log('\n✅ Test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { testVercelConnection };
