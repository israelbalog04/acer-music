import { NextRequest, NextResponse } from 'next/server';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';

export async function GET(request: NextRequest) {
  try {
    const churches = await prisma.church.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        isActive: true
      },
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(churches);
  } catch (error) {
    console.error('Erreur lors de la récupération des églises:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des églises' },
      { status: 500 }
    );
  }
}
