const { createClient } = require('@supabase/supabase-js');

async function testBucketSimple() {
  console.log('🔍 Test simple du bucket Supabase...');
  
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
    console.log('\n🔌 Test de connexion au bucket...');
    
    // Lister les buckets existants
    console.log('\n📋 Liste des buckets:');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Erreur lors de la liste des buckets:', bucketsError.message);
      console.log('\n🔍 Diagnostic:');
      console.log('1. Vérifiez les variables d\'environnement Supabase');
      console.log('2. Vérifiez que le service role key a les bonnes permissions');
      console.log('3. Vérifiez la configuration RLS');
    } else {
      console.log(`✅ ${buckets.length} buckets trouvés:`);
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
      
      // Vérifier le bucket multimedia
      const multimediaBucket = buckets.find(b => b.name === 'multimedia');
      if (multimediaBucket) {
        console.log('\n✅ Bucket "multimedia" trouvé!');
        
        // Lister les fichiers dans le bucket multimedia
        console.log('\n📋 Fichiers dans le bucket multimedia:');
        const { data: files, error: listError } = await supabase.storage
          .from('multimedia')
          .list();

        if (listError) {
          console.log('❌ Erreur lors de la liste des fichiers:', listError.message);
        } else {
          console.log(`✅ ${files.length} fichiers trouvés:`);
          files.forEach(file => {
            console.log(`   - ${file.name} (${file.metadata?.size || 'N/A'} bytes)`);
          });
        }
      } else {
        console.log('\n⚠️ Bucket "multimedia" non trouvé');
        console.log('💡 Il sera créé automatiquement lors du premier upload');
      }
    }

  } catch (error) {
    console.error('\n❌ Erreur générale:', error.message);
  }
}

// Exécution du test
if (require.main === module) {
  testBucketSimple()
    .then(() => {
      console.log('\n✅ Test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { testBucketSimple };
