const { createClient } = require('@supabase/supabase-js');

async function setupStoragePolicies() {
  console.log('🔒 Configuration des politiques RLS pour le storage Supabase...');
  
  // Vérification des variables d'environnement
  console.log('\n📋 Variables d\'environnement:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Définie' : '❌ Manquante');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Définie' : '❌ Manquante');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n❌ Variables d\'environnement Supabase manquantes!');
    console.log('💡 Configurez ces variables:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  // Création du client Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('\n🔌 Connexion à Supabase...');
    
    // Politiques pour chaque bucket
    const policies = [
      {
        bucket: 'multimedia',
        name: 'Multimedia access policy',
        description: 'Accès aux fichiers multimédias pour les utilisateurs authentifiés de la même église',
        policy: `
          CREATE POLICY "Multimedia access policy" ON storage.objects
          FOR ALL USING (
            bucket_id = 'multimedia' AND 
            auth.role() = 'authenticated' AND
            (storage.foldername(name))[1] = auth.jwt() ->> 'churchId'
          );
        `
      },
      {
        bucket: 'recordings',
        name: 'Recordings access policy', 
        description: 'Accès aux enregistrements pour les utilisateurs authentifiés de la même église',
        policy: `
          CREATE POLICY "Recordings access policy" ON storage.objects
          FOR ALL USING (
            bucket_id = 'recordings' AND 
            auth.role() = 'authenticated' AND
            (storage.foldername(name))[1] = auth.jwt() ->> 'churchId'
          );
        `
      },
      {
        bucket: 'sequences',
        name: 'Sequences access policy',
        description: 'Accès aux partitions pour les utilisateurs authentifiés de la même église',
        policy: `
          CREATE POLICY "Sequences access policy" ON storage.objects
          FOR ALL USING (
            bucket_id = 'sequences' AND 
            auth.role() = 'authenticated' AND
            (storage.foldername(name))[1] = auth.jwt() ->> 'churchId'
          );
        `
      },
      {
        bucket: 'avatars',
        name: 'Avatars public read policy',
        description: 'Lecture publique des avatars, écriture pour les utilisateurs authentifiés',
        policy: `
          CREATE POLICY "Avatars public read policy" ON storage.objects
          FOR SELECT USING (bucket_id = 'avatars');
          
          CREATE POLICY "Avatars authenticated write policy" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'avatars' AND 
            auth.role() = 'authenticated'
          );
          
          CREATE POLICY "Avatars owner update policy" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'avatars' AND 
            auth.role() = 'authenticated' AND
            (storage.foldername(name))[1] = auth.uid()::text
          );
          
          CREATE POLICY "Avatars owner delete policy" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'avatars' AND 
            auth.role() = 'authenticated' AND
            (storage.foldername(name))[1] = auth.uid()::text
          );
        `
      }
    ];

    console.log('\n🔒 Configuration des politiques RLS...');
    
    for (const policyConfig of policies) {
      console.log(`\n📋 Bucket: ${policyConfig.bucket}`);
      console.log(`   Nom: ${policyConfig.name}`);
      console.log(`   Description: ${policyConfig.description}`);
      
      // Note: Les politiques RLS doivent être configurées manuellement dans Supabase Dashboard
      // car elles nécessitent des privilèges SQL spéciaux
      console.log(`   ⚠️  Politique à configurer manuellement dans Supabase Dashboard`);
      console.log(`   📝 SQL à exécuter:`);
      console.log(`   ${policyConfig.policy}`);
    }

    console.log('\n📋 Instructions pour configurer les politiques RLS:');
    console.log('1. Allez dans Supabase Dashboard');
    console.log('2. Storage → Policies');
    console.log('3. Sélectionnez chaque bucket');
    console.log('4. Cliquez sur "New Policy"');
    console.log('5. Copiez-collez les politiques SQL ci-dessus');
    console.log('6. Sauvegardez chaque politique');

    console.log('\n🎉 Instructions de configuration terminées!');
    console.log('\n💡 Note: Les politiques RLS doivent être configurées manuellement');
    console.log('   car elles nécessitent des privilèges SQL spéciaux.');

  } catch (error) {
    console.error('\n❌ Erreur générale:', error.message);
  }
}

// Exécution du script
if (require.main === module) {
  setupStoragePolicies()
    .then(() => {
      console.log('\n✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { setupStoragePolicies };
