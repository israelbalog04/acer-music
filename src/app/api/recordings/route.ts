import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { churchFilter } from '@/lib/church-filter';

// GET /api/recordings - Récupérer les enregistrements (filtrés par songId optionnel)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('songId');
    const status = searchParams.get('status'); // APPROVED, IN_REVIEW, DRAFT
    const myRecordings = searchParams.get('my') === 'true'; // Mes enregistrements seulement

    let whereClause: any = churchFilter(session.user.churchId, {});

    // Filtrer par morceau
    if (songId) {
      whereClause.songId = songId;
    }

    // Filtrer par statut
    if (status) {
      whereClause.status = status;
    }

    // Mes enregistrements seulement
    if (myRecordings) {
      whereClause.userId = session.user.id;
    }

    const recordings = await prisma.recording.findMany({
      where: whereClause,
      include: {
        song: {
          select: {
            title: true,
            artist: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        reviewedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ recordings });

  } catch (error) {
    console.error('Erreur récupération enregistrements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des enregistrements' },
      { status: 500 }
    );
  }
}