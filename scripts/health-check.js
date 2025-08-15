const { PrismaClient } = require('@prisma/client');

async function healthCheck() {
  console.log('🔍 Vérification de santé ACER Music v1.2');
  console.log('='.repeat(50));

  const prisma = new PrismaClient();
  let allGood = true;

  try {
    // 1. Test connexion base de données
    console.log('📊 Test connexion base de données...');
    await prisma.$connect();
    console.log('✅ Base de données accessible');

    // 2. Vérifier tables critiques
    console.log('📋 Vérification des tables...');
    const churches = await prisma.church.count();
    const users = await prisma.user.count();
    const schedules = await prisma.schedule.count();
    const messages = await prisma.eventMessage.count();

    console.log(`📊 Églises: ${churches}`);
    console.log(`👥 Utilisateurs: ${users}`);
    console.log(`📅 Événements: ${schedules}`);
    console.log(`💬 Messages: ${messages}`);

    // 3. Test des nouvelles fonctionnalités
    console.log('🆕 Test nouvelles fonctionnalités...');
    
    // Vérifier que la table EventMessage existe
    const messageExists = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='event_messages';`.catch(() => 
      prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE tablename='event_messages';`
    );
    
    if (messageExists && messageExists.length > 0) {
      console.log('✅ Table EventMessage présente');
    } else {
      console.log('❌ Table EventMessage manquante');
      allGood = false;
    }

    // 4. Test variables d'environnement
    console.log('⚙️  Vérification configuration...');
    const requiredEnvs = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    for (const env of requiredEnvs) {
      if (process.env[env]) {
        console.log(`✅ ${env} configuré`);
      } else {
        console.log(`❌ ${env} manquant`);
        allGood = false;
      }
    }

    // 5. Test storage (Supabase)
    if (process.env.STORAGE_TYPE === 'supabase') {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('✅ Configuration Supabase OK');
      } else {
        console.log('⚠️  Configuration Supabase incomplète');
      }
    }

  } catch (error) {
    console.log('❌ Erreur durant la vérification:', error.message);
    allGood = false;
  } finally {
    await prisma.$disconnect();
  }

  console.log('='.repeat(50));
  if (allGood) {
    console.log('🎉 Toutes les vérifications sont passées !');
    console.log('🚀 ACER Music v1.2 est prêt pour la production');
    process.exit(0);
  } else {
    console.log('⚠️  Quelques problèmes détectés');
    console.log('📋 Consultez le guide DEPLOYMENT_GUIDE.md');
    process.exit(1);
  }
}

healthCheck();