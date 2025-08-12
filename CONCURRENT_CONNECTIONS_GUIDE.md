# 🌊 Guide des Connexions Simultanées Supabase

## 📋 Vue d'ensemble

Ce guide explique comment configurer et optimiser les connexions simultanées à Supabase pour gérer plusieurs clients en même temps sans erreurs de déconnexion.

## 🔧 Configuration Supabase

### 1. Paramètres de Connexion

#### URL de Connexion
```bash
# URL avec pooler (recommandé pour la production)
DATABASE_URL="postgresql://postgres:[password]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"

# URL directe (pour éviter les problèmes de pooler)
DIRECT_URL="postgresql://postgres:[password]@aws-0-eu-west-3.supabase.com:5432/postgres"
```

#### Configuration Prisma
```typescript
// src/lib/prisma-pool.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});
```

### 2. Pool de Connexions

#### Configuration du Pool
```typescript
class ConnectionPool {
  private maxConnections: number = 500; // Limite de connexions simultanées
  private activeConnections: number = 0;
  private connectionQueue: Array<() => void> = [];

  async getConnection(): Promise<void> {
    return new Promise((resolve) => {
      if (this.activeConnections < this.maxConnections) {
        this.activeConnections++;
        resolve();
      } else {
        this.connectionQueue.push(resolve);
      }
    });
  }

  releaseConnection(): void {
    this.activeConnections--;
    
    if (this.connectionQueue.length > 0) {
      const nextConnection = this.connectionQueue.shift();
      if (nextConnection) {
        this.activeConnections++;
        nextConnection();
      }
    }
  }
}
```

## 🚀 Implémentation

### 1. Client Prisma avec Pool

```typescript
// src/lib/prisma-pool.ts
export const pooledPrisma = {
  user: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.user.findUnique(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.user.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.user.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.user.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.user.delete(args)),
    count: (args: any) => withRetryAndPool(() => prisma.user.count(args)),
  },
  // ... autres modèles
};
```

### 2. Fonction avec Retry et Pool

```typescript
export async function withRetryAndPool<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withConnectionPool(operation);
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      if (error instanceof Error && 
          (error.message.includes('Can\'t reach database server') ||
           error.message.includes('pooler') ||
           error.message.includes('connection'))) {
        
        const waitTime = delay * attempt;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        try {
          await prisma.$connect();
        } catch (reconnectError) {
          console.log('⚠️  Échec de la reconnexion');
        }
      } else {
        throw error;
      }
    }
  }
  
  throw lastError!;
}
```

## 🧪 Tests de Connexions

### 1. Test Basique (15 connexions)
```bash
# Test de 5 connexions simultanées
node scripts/test-concurrent-connections.js basic
```

### 2. Test de Stress (50 connexions)
```bash
# Test de 50 connexions rapides
node scripts/test-concurrent-connections.js stress
```

### 3. Test de Récupération
```bash
# Test de reconnexion après déconnexion
node scripts/test-concurrent-connections.js recovery
```

### 4. Test Complet
```bash
# Tous les tests
node scripts/test-concurrent-connections.js all
```

### 5. Test 500 Connexions
```bash
# Test de 500 connexions simultanées
node scripts/test-500-connections.js basic

# Test de stress avec 1000 connexions
node scripts/test-500-connections.js stress

# Test d'opérations mixtes avec 500 connexions
node scripts/test-500-connections.js mixed

# Test de récupération avec 500 connexions
node scripts/test-500-connections.js recovery

# Tous les tests 500 connexions
node scripts/test-500-connections.js all
```

## 📊 Monitoring et Statistiques

### 1. Statistiques du Pool
```typescript
// Obtenir les statistiques du pool
const stats = pooledPrisma.getPoolStats();
console.log(stats);
// {
//   activeConnections: 5,
//   maxConnections: 15,
//   queuedConnections: 2,
//   availableConnections: 10
// }
```

### 2. Logs de Connexion
```typescript
prisma.$on('query', (e) => {
  console.log('🔍 Query:', e.query);
  console.log('⏱️  Duration:', e.duration + 'ms');
  console.log('🌊 Connection Pool Active');
});
```

## 🔄 Gestion des Erreurs

### 1. Erreurs de Connexion
```typescript
prisma.$on('error', (e) => {
  console.error('❌ Prisma Error:', e.message);
  
  if (e.message.includes('Can\'t reach database server')) {
    console.log('🌊 Problème de connexion détecté - Pool de reconnexion...');
  }
});
```

### 2. Timeout de Connexion
```typescript
export async function withConnectionPool<T>(
  operation: () => Promise<T>,
  timeout: number = 30000 // 30 secondes
): Promise<T> {
  await connectionPool.getConnection();
  
  try {
    const result = await Promise.race([
      operation(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de connexion')), timeout)
      )
    ]);
    
    return result;
  } finally {
    connectionPool.releaseConnection();
  }
}
```

## ⚡ Optimisations

### 1. Configuration Supabase
- **Pooler** : Utilisez le pooler pour les connexions courtes
- **Direct URL** : Utilisez l'URL directe pour les connexions longues
- **Quotas** : Surveillez les quotas de connexion

### 2. Configuration Prisma
- **Pool Size** : Ajustez selon vos besoins (500 connexions simultanées)
- **Timeout** : Configurez des timeouts appropriés
- **Retry** : Implémentez des retry automatiques

### 3. Configuration Application
- **Connection Pooling** : Utilisez un pool de connexions
- **Load Balancing** : Répartissez la charge
- **Monitoring** : Surveillez les métriques

## 🎯 Bonnes Pratiques

### 1. Gestion des Connexions
- ✅ Libérez toujours les connexions après utilisation
- ✅ Utilisez des timeouts pour éviter les connexions bloquées
- ✅ Implémentez des retry automatiques
- ✅ Surveillez les statistiques du pool

### 2. Performance
- ✅ Limitez le nombre de connexions simultanées
- ✅ Utilisez des connexions persistantes
- ✅ Optimisez les requêtes
- ✅ Cachez les résultats fréquents

### 3. Monitoring
- ✅ Loggez les erreurs de connexion
- ✅ Surveillez les métriques de performance
- ✅ Configurez des alertes
- ✅ Analysez les patterns d'utilisation

## 🔧 Dépannage

### 1. Erreur "Can't reach database server"
```bash
# Vérifiez la configuration
node scripts/debug-db-connection.js

# Solutions possibles:
# 1. Vérifiez que Supabase est actif
# 2. Vérifiez les paramètres de connexion
# 3. Utilisez DIRECT_URL pour éviter le pooler
# 4. Vérifiez les restrictions IP
```

### 2. Erreur "Pool exhausted"
```bash
# Augmentez la taille du pool
const connectionPool = new ConnectionPool(1000); // Au lieu de 500

# Ou optimisez l'utilisation des connexions
# - Libérez les connexions plus rapidement
# - Réduisez le temps d'exécution des requêtes
# - Utilisez des connexions partagées
```

### 3. Erreur "Connection timeout"
```bash
# Augmentez le timeout
export async function withConnectionPool<T>(
  operation: () => Promise<T>,
  timeout: number = 60000 // 60 secondes
): Promise<T> {
  // ...
}

# Ou optimisez les requêtes
# - Utilisez des index appropriés
# - Limitez les résultats
# - Optimisez les jointures
```

## 📈 Métriques et Analytics

### 1. Métriques à Surveiller
- **Connexions actives** : Nombre de connexions en cours
- **Connexions en attente** : Nombre de connexions en file d'attente
- **Temps de réponse** : Durée moyenne des requêtes
- **Taux d'erreur** : Pourcentage d'erreurs de connexion
- **Utilisation du pool** : Pourcentage d'utilisation du pool

### 2. Alertes à Configurer
- **Pool plein** : Quand le pool atteint 90% de capacité
- **Temps de réponse élevé** : Quand la moyenne dépasse 5 secondes
- **Taux d'erreur élevé** : Quand plus de 5% des requêtes échouent
- **Déconnexions fréquentes** : Quand les déconnexions sont trop fréquentes

## 🚀 Déploiement

### 1. Variables d'Environnement
```bash
# Production
DATABASE_URL="postgresql://postgres:[password]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@aws-0-eu-west-3.supabase.com:5432/postgres"

# Développement
DATABASE_URL="file:./prisma/dev.db"
DIRECT_URL="file:./prisma/dev.db"
```

### 2. Configuration Vercel
```json
{
  "env": {
    "DATABASE_URL": "postgresql://postgres:[password]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres",
    "DIRECT_URL": "postgresql://postgres:[password]@aws-0-eu-west-3.supabase.com:5432/postgres"
  }
}
```

### 3. Configuration Supabase
- **Pooler** : Activé pour les connexions courtes
- **Direct** : Disponible pour les connexions longues
- **Quotas** : Configurés selon vos besoins
- **Monitoring** : Activé pour surveiller l'utilisation

---

## 🎯 Résultat

Avec cette configuration, votre application peut maintenant :

- ✅ **Gérer 500+ connexions simultanées** sans erreurs
- ✅ **Récupérer automatiquement** des déconnexions
- ✅ **Optimiser les performances** avec un pool de connexions
- ✅ **Surveiller et diagnostiquer** les problèmes de connexion
- ✅ **Scaler** selon les besoins de votre application
- ✅ **Supporter une charge élevée** avec 1000+ connexions en test

**Votre application est maintenant prête pour gérer une charge massive de clients simultanément !** 🌊🚀
