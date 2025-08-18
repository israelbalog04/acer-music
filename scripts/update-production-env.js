#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function updateProductionEnv() {
  console.log('🔧 Mise à jour de la configuration de production...');
  
  const envProductionPath = path.join(__dirname, '..', '.env.production');
  
  const productionConfig = `# Configuration de production pour ACER Music
# ✅ Configurée pour PostgreSQL Supabase

# Base de données PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres:iAJEbbhEx647fw32@db.butlptmveyaluxlnwizr.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:iAJEbbhEx647fw32@db.butlptmveyaluxlnwizr.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://acer-music.vercel.app"
NEXTAUTH_SECRET="production-secret-key-very-secure-2025-acer-music"

# Supabase (configuration actuelle)
NEXT_PUBLIC_SUPABASE_URL="https://butlptmveyaluxlnwizr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dGxwdG12ZXlhbHV4bG53aXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkxNDkzNSwiZXhwIjoyMDcwNDkwOTM1fQ.bRdVnxaLfcBdOpTMByYPjMZlo29kGKycRdDRNVQY3qM"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dGxwdG12ZXlhbHV4bG53aXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkxNDkzNSwiZXhwIjoyMDcwNDkwOTM1fQ.bRdVnxaLfcBdOpTMByYPjMZlo29kGKycRdDRNVQY3qM"

# Configuration
STORAGE_TYPE="supabase"
NODE_ENV="production"

# Super Admin (pour l'initialisation)
SUPER_ADMIN_EMAIL="admin@acer-paris.fr"
SUPER_ADMIN_PASSWORD="AdminSecure2025!"
SUPER_ADMIN_NAME="Administrateur ACER"

# ==========================================
# INSTRUCTIONS POUR VERCEL
# ==========================================
# 
# 1. Allez sur https://vercel.com/dashboard
# 2. Sélectionnez votre projet acer-music
# 3. Allez dans Settings > Environment Variables
# 4. Ajoutez/modifiez ces variables :
#
# DATABASE_URL = postgresql://postgres:iAJEbbhEx647fw32@db.butlptmveyaluxlnwizr.supabase.co:5432/postgres
# DIRECT_URL = postgresql://postgres:iAJEbbhEx647fw32@db.butlptmveyaluxlnwizr.supabase.co:5432/postgres
# NEXTAUTH_URL = https://acer-music.vercel.app
# NEXTAUTH_SECRET = production-secret-key-very-secure-2025-acer-music
# NEXT_PUBLIC_SUPABASE_URL = https://butlptmveyaluxlnwizr.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dGxwdG12ZXlhbHV4bG53aXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkxNDkzNSwiZXhwIjoyMDcwNDkwOTM1fQ.bRdVnxaLfcBdOpTMByYPjMZlo29kGKycRdDRNVQY3qM
# SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dGxwdG12ZXlhbHV4bG53aXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkxNDkzNSwiZXhwIjoyMDcwNDkwOTM1fQ.bRdVnxaLfcBdOpTMByYPjMZlo29kGKycRdDRNVQY3qM
# STORAGE_TYPE = supabase
# NODE_ENV = production
# SUPER_ADMIN_EMAIL = admin@acer-paris.fr
# SUPER_ADMIN_PASSWORD = AdminSecure2025!
# SUPER_ADMIN_NAME = Administrateur ACER
#
# 5. Redéployez l'application
`;

  try {
    fs.writeFileSync(envProductionPath, productionConfig);
    console.log('✅ Fichier .env.production mis à jour avec succès !');
    console.log('📝 Variables d\'environnement configurées pour PostgreSQL Supabase');
    
    console.log('\n🚀 Prochaines étapes :');
    console.log('1. Mettez à jour les variables d\'environnement dans Vercel');
    console.log('2. Redéployez l\'application');
    console.log('3. Testez la connexion avec: node scripts/fix-production-db.js');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.message);
    process.exit(1);
  }
}

// Exécuter la mise à jour
updateProductionEnv();
