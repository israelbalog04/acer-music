import { NextResponse } from 'next/server';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test de connexion à la base de données
    await prisma.church.findMany({ take: 1 });
    
    const dbResponseTime = Date.now() - startTime;
    
    // Informations système
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
        type: process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite'
      },
      storage: {
        type: process.env.STORAGE_TYPE || 'local',
        supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };
    
    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        status: 'disconnected',
        error: 'Connection failed'
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}