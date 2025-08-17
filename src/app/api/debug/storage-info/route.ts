import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';

export async function GET() {
  try {
    const storageInfo = await StorageService.getStorageInfo();
    
    return NextResponse.json({
      success: true,
      storage: storageInfo,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        STORAGE_TYPE: process.env.STORAGE_TYPE,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasGoogleDrive: !!process.env.GOOGLE_DRIVE_CLIENT_ID,
        hasAWS: !!process.env.AWS_ACCESS_KEY_ID
      }
    });
  } catch (error) {
    console.error('Erreur info stockage:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}