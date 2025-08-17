const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

// Configuration PostgreSQL
const POSTGRES_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'acer_music',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
};

// URL de connexion PostgreSQL
const DATABASE_URL = `postgresql://${POSTGRES_CONFIG.username}:${POSTGRES_CONFIG.password}@${POSTGRES_CONFIG.host}:${POSTGRES_CONFIG.port}/${POSTGRES_CONFIG.database}`;

console.log('🐘 Configuration PostgreSQL pour ACER Music');
console.log('=' .repeat(60));

async function setupPostgreSQL() {
  try {
    console.log('📋 Configuration détectée:');
    console.log(`   Host: ${POSTGRES_CONFIG.host}`);
    console.log(`   Port: ${POSTGRES_CONFIG.port}`);
    console.log(`   Database: ${POSTGRES_CONFIG.database}`);
    console.log(`   Username: ${POSTGRES_CONFIG.username}`);
    console.log('');

    // Vérifier si PostgreSQL est installé
    console.log('🔍 Vérification de PostgreSQL...');
    try {
      execSync('psql --version', { stdio: 'pipe' });
      console.log('✅ PostgreSQL est installé');
    } catch (error) {
      console.log('❌ PostgreSQL n\'est pas installé ou pas dans le PATH');
      console.log('   Installez PostgreSQL: https://www.postgresql.org/download/');
      return;
    }

    // Créer la base de données si elle n'existe pas
    console.log('🗄️  Création de la base de données...');
    try {
      execSync(`createdb -h ${POSTGRES_CONFIG.host} -p ${POSTGRES_CONFIG.port} -U ${POSTGRES_CONFIG.username} ${POSTGRES_CONFIG.database}`, {
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: POSTGRES_CONFIG.password }
      });
      console.log('✅ Base de données créée ou existe déjà');
    } catch (error) {
      console.log('⚠️  Impossible de créer la base de données automatiquement');
      console.log('   Créez-la manuellement:');
      console.log(`   createdb -h ${POSTGRES_CONFIG.host} -p ${POSTGRES_CONFIG.port} -U ${POSTGRES_CONFIG.username} ${POSTGRES_CONFIG.database}`);
    }

    // Mettre à jour l'URL de la base de données
    console.log('🔧 Mise à jour de l\'URL de la base de données...');
    process.env.DATABASE_URL = DATABASE_URL;
    process.env.DIRECT_URL = DATABASE_URL;

    // Générer le client Prisma
    console.log('🔨 Génération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Client Prisma généré');

    // Appliquer les migrations
    console.log('🚀 Application des migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations appliquées');

    // Tester la connexion
    console.log('🔌 Test de la connexion...');
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Connexion à PostgreSQL réussie');

    // Vérifier les tables
    console.log('📊 Vérification des tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(`✅ ${tables.length} tables trouvées`);

    await prisma.$disconnect();
    console.log('');

    console.log('🎉 Configuration PostgreSQL terminée !');
    console.log('');
    console.log('📋 URL de connexion:');
    console.log(`   ${DATABASE_URL}`);
    console.log('');
    console.log('🔧 Pour utiliser cette configuration:');
    console.log('   1. Ajoutez cette URL à votre .env.local:');
    console.log(`      DATABASE_URL="${DATABASE_URL}"`);
    console.log(`      DIRECT_URL="${DATABASE_URL}"`);
    console.log('   2. Redémarrez votre application');
    console.log('   3. Testez avec: npm run dev');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    console.log('');
    console.log('🔧 Solutions possibles:');
    console.log('   1. Vérifiez que PostgreSQL est installé et démarré');
    console.log('   2. Vérifiez les identifiants de connexion');
    console.log('   3. Créez manuellement la base de données');
    console.log('   4. Vérifiez les permissions utilisateur');
  }
}

// Fonction pour afficher les instructions de configuration
function showInstructions() {
  console.log('📖 Instructions de configuration PostgreSQL:');
  console.log('=' .repeat(60));
  
  console.log('1. Installation PostgreSQL:');
  console.log('   • macOS: brew install postgresql');
  console.log('   • Ubuntu: sudo apt-get install postgresql');
  console.log('   • Windows: https://www.postgresql.org/download/windows/');
  console.log('');
  
  console.log('2. Démarrer PostgreSQL:');
  console.log('   • macOS: brew services start postgresql');
  console.log('   • Ubuntu: sudo systemctl start postgresql');
  console.log('   • Windows: Service PostgreSQL');
  console.log('');
  
  console.log('3. Créer un utilisateur (optionnel):');
  console.log('   createuser -s postgres');
  console.log('');
  
  console.log('4. Créer la base de données:');
  console.log(`   createdb -U postgres ${POSTGRES_CONFIG.database}`);
  console.log('');
  
  console.log('5. Configuration des variables d\'environnement:');
  console.log('   Ajoutez à votre .env.local:');
  console.log(`   DATABASE_URL="${DATABASE_URL}"`);
  console.log(`   DIRECT_URL="${DATABASE_URL}"`);
  console.log('');
  
  console.log('6. Appliquer les migrations:');
  console.log('   npx prisma migrate deploy');
  console.log('');
  
  console.log('7. Générer le client:');
  console.log('   npx prisma generate');
  console.log('');
}

// Fonction pour tester la connexion
async function testConnection() {
  console.log('🧪 Test de connexion PostgreSQL');
  console.log('=' .repeat(60));
  
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    console.log('✅ Connexion réussie');
    
    // Test des tables principales
    const churches = await prisma.church.count();
    const users = await prisma.user.count();
    const songs = await prisma.song.count();
    
    console.log('📊 Données dans la base:');
    console.log(`   Églises: ${churches}`);
    console.log(`   Utilisateurs: ${users}`);
    console.log(`   Chansons: ${songs}`);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

// Fonction principale
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      await setupPostgreSQL();
      break;
    case 'test':
      await testConnection();
      break;
    case 'help':
    default:
      showInstructions();
      break;
  }
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupPostgreSQL,
  testConnection,
  DATABASE_URL,
  POSTGRES_CONFIG
};
