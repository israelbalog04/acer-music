import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      session: session ? {
        user: {
          id: session.user?.id,
          name: session.user?.name,
          email: session.user?.email,
          role: session.user?.role,
          churchId: session.user?.churchId,
          churchName: session.user?.churchName
        }
      } : null,
      sessionExists: !!session,
      userExists: !!session?.user,
      churchIdExists: !!session?.user?.churchId
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: 'Debug error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}